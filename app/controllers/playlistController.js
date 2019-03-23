const Sequelize = require('sequelize');
const op = Sequelize.Op;
const request = require('request-promise-native');
const querystring = require('querystring');
let access_token = '';

var exports = module.exports = {};

exports.syncPlaylists = async function(token, models, userId) {
    
    let Playlist = models.playlist;
    access_token = token.access_token;
    let options = {
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    };
    
    async function main() { //main function that does everything
        try{
            const data = await fetchPlaylists(options);     //stores returned api info in data
            const playlists = await getPlaylist(data);      //stores object with playlist info(name, id) in playlists
            }
        catch(err) {
            console.log(err);
        }
    }

    const fetchPlaylists = async(options) => {              //gets playlists from spotify api
        const data = await request.get(options);
        return data;
    }

    const getPlaylist = async(data) => {                    //parse playlist info objects into arrays
        playlists = {
            "items": []
        };
        for(let i = 0; i < data.items.length; i++) {        //loops through all playlists and inserts names, etc into array
            playlists.items[i] = {};
            playlists.items[i].name     = data.items[i].name;
            playlists.items[i].id       = data.items[i].id;
            playlists.items[i].link     = data.items[i].tracks.href;
            playlists.items[i].total    = data.items[i].tracks.total;
        }
        /*playlists.items.sort((a,b) => {   //sort playlists from smallest to largest
            let keyA = a.total;
            let keyB = b.total;
            if(keyA < keyB)
                return -1;
            if(keyA > keyB)
                return 1;
        });*/
        addPlaylist(playlists);                              //adds playlists to db
        return playlists;
    }

    const addPlaylist = async(playlists) => {
        playlists.items.forEach((playlistInfo) => {         //goes through the array of playlists
            Playlist.create(playlist = {
                name: playlistInfo.name,
                spotifyId: playlistInfo.id,
                userId: userId,
                numberOfSongs: playlistInfo.total,
            })
            .catch(err => console.log(err));
        })
    }

    main();
    return null;
}

exports.syncSongsArtists = function(token, models, userId, playlistName) {
    let Artist = models.artist,
        Songs = models.song;
    access_token = token.access_token;
    let options = {
        url: 'https://api.spotify.com/v1/playlists/',
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    };
    
    async function main() { //main function that does everything
        try{
            const playlist = await fetchPlaylists();     //stores returned api info in data
            console.log(playlist.id, playlist.total);
            const playlists = await getPlaylistSongs(playlist);      //stores object with playlist info(name, id) in playlists
            //console.log(playlists);
            //const done = await loopPlaylists(playlists);    //loops through playlists to do various api calls and data parsing and adds song/artists to db
        }
        catch(err) {
            console.log(err);
        }
    }

    const fetchPlaylists = async() => {
        const data = await Playlist.findOne({
            where: {
                [op.and]: {
                    userId: userId,
                    name: playlistName,
                }
            }
        });
        playlist = {
            id: data.dataValues.spotifyId,
            total: data.dataValues.numberOfSongs,
        }
        return playlist;                                    //returns the row information that was found/inserted
    }

    const fetchSongs = async(songsOptions) => {             //gets the songs of a playlist from spotify api
        const data = await request.get(songsOptions);
        return data;
    }

    async function getPlaylistSongs(playlist) {
        songOptions = options;
        let numLoop = Math.ceil(playlist.total / 100);              //number of times to loop through playlist, api only returns 100 items
        try {
            for(let i = 0; i < numLoop; i++) {
                songOptions.url += playlist.id + '/tracks' + '?' +               //change offset in url
                    querystring.stringify({
                        offset: i*100,
                    }); 
                const data = await fetchSongs(songOptions);         //stores returned api info in data
                const artistId = await manageSongsArtists(data);    //call function to add songs/artists to db
            }
        }
        catch(err) {
            console.log(err);
        } 
    }

    async function manageSongsArtists(body) {                //add songs/artists to db
        body.items.forEach((songs, index) => {              //body.items is an array with up to 100 songs
            let artist = {                                  //create artist object with name and spotify id
                name: songs.track.artists[0].name,
                spotify: songs.track.artists[0].id,
            }
            addArtist(artist)                               //call function to insert artist to db
            .then(artistId => {                             //function returns row information of inserted data including UUID
                addSong(songs, artistId[0].dataValues.id);  //call function to insert song and artistId(foreign key) to db
            })
            .catch(err => console.log(err));
        })
    }
    const addSong = async(song, artistId) => {
        //console.log(song.track.name);
        const addSongs = await Songs.create({
            name: song.track.name,
            spotify: song.track.id,
            artist_id: artistId,
        })
        .catch(err => console.log(err));
    }

    const addArtist = async(artist) => {
        const artistId = await Artist.findOrCreate({        //uses findOrCreate to add artist to database
            where: {                                        //tries to find artist with spotify.id
                spotify: artist.spotify,
            },
            defaults: {                                     //if it doesn't exist then it adds it to the database along with the artist name
                name: artist.name,
            },
        });
        return artistId;                                    //returns the row information that was found/inserted
    }

    main();
}
