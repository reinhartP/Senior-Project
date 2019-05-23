const Sequelize = require("sequelize");
const op = Sequelize.Op;
const SpotifyWebApi = require('spotify-web-api-node');

var exports = (module.exports = {});

exports.syncPlaylists = async function(accessToken, models, userId) {
    let spotifyApi = new SpotifyWebApi({
        accessToken: accessToken,
    })
    let Playlist = models.playlist;

    async function main() {
        //main function that does everything
        try {
            const data = await spotifyApi.getUserPlaylists().then(data => data.body)
            const playlists = await getPlaylist(data);                    //stores object with playlist info(name, id) in playlists
            return playlists;
        } catch (err) {
            console.log(err);
        }
    }

    const getPlaylist = async data => {
        //parse playlist info objects into arrays
        let playlists = {
            items: [],
        };
        for (let i = 0; i < data.items.length; i++) {
            //loops through all playlists and inserts names, etc into array
            playlists.items[i] = {};
            playlists.items[i].name = data.items[i].name;
            playlists.items[i].id = data.items[i].id;
            playlists.items[i].link = data.items[i].tracks.href;
            playlists.items[i].total = data.items[i].tracks.total;
        }
        addPlaylist(playlists); //adds playlists to db
        return playlists.items
    };

    const addPlaylist = async playlists => {
        await Playlist.destroy({
            where: {
                user_id: userId, // and spotify is not null
            },
        });
        playlists.items.forEach(playlistInfo => {
            //goes through the array of playlists
            Playlist.create({
                name: playlistInfo.name,
                spotify_id: playlistInfo.id,
                user_id: userId,
                number_of_songs: playlistInfo.total,
            }).catch(err => console.log(err));
        });
    };

    const playlists = await main();
    return playlists;
};

exports.syncSongsArtists = function(
    accessToken,
    models,
    userId,
    playlistName
) {
    let Artist = models.artist,
        Songs = models.song,
        Playlist = models.playlist,
        PlaylistSongs = models.playlist_song;

    let spotifyApi = new SpotifyWebApi({
        accessToken: accessToken,
    })

    async function main() {
        //main function that does everything
        try {
            const playlist = await fetchPlaylists(); //stores returned api info in data
            await getPlaylistSongs(playlist); //stores object with playlist info(name, id) in playlists
        } catch (err) {
            console.log(err);
        }
    }

    const fetchPlaylists = async () => {
        const data = await Playlist.findOne({
            where: {
                [op.and]: {
                    user_id: userId,
                    name: playlistName,
                },
            },
        });
        let playlist = {
            id: data.dataValues.id,
            spotify_id: data.dataValues.spotify_id,
            total: data.dataValues.number_of_songs,
        };
        return playlist; //returns the row information that was found/inserted
    };

    const getPlaylistSongs = async (playlist) => {
        let numLoop;
        playlist.total > 500
            ? (numLoop = 5) //allow for a max of 300 songs per playlist
            : (numLoop = Math.ceil(playlist.total / 100));
        try {
            for (let i = 0; i < numLoop; i++) {
                const data = await spotifyApi.getPlaylistTracks(playlist.spotify_id, { offset: i * 100, fields})
                data.playlistId = playlist.id;
                await manageSongsArtists(data); //call function to add songs/artists to db
            }
        } catch (err) {
            console.log(err);
        }
    };

    async function manageSongsArtists(body) {
        //add songs/artists to db
        let playlistSongs = [];
        const promises = body.items.map(async songs => {
            let artist = {
                //create artist object with name and spotify id
                name: songs.track.artists[0].name,
                spotify: songs.track.artists[0].id,
            };
            const artistId = await addArtist(artist);
            const songId = await addSong(songs, artistId[0].dataValues.id);
            playlistSongs.push({
                song_id: songId[0].dataValues.id,
                playlist_id: body.playlistId,
            });
        });
        await Promise.all(promises);
        addPlaylistSong(playlistSongs);
    }

    async function addSong(song, artistId) {
        const songId = await Songs.findOrCreate({
            where: {
                [op.and]: {
                    spotify: song.track.id,
                    artist_id: artistId,
                },
            },
            defaults: {
                name: song.track.name,
                spotify: song.track.id,
                artist_id: artistId,
            },
        })
            .then(songId => {
                return songId;
            })
            .catch(err => console.log(err));
        return songId;
    }

    const addPlaylistSong = async playlistSongs => {
        PlaylistSongs.bulkCreate(playlistSongs, {
            ignoreDuplicates: true,
        }).catch(err => err);
    };

    const addArtist = async artist => {
        const artistId = await Artist.findOrCreate({
            //uses findOrCreate to add artist to database
            where: {
                //tries to find artist with spotify.id
                spotify: artist.spotify,
            },
            defaults: {
                //if it doesn't exist then it adds it to the database along with the artist name
                name: artist.name,
            },
        }).catch(err => console.log(err));
        return artistId; //returns the row information that was found/inserted
    };

    main();
};
