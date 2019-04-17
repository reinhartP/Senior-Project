const sort = require('match-sorter');

let PlaylistController = require('../controllers/playlistController'),
    AuthController = require('../controllers/spotifyAuthController'),
    YoutubeController = require('../controllers/youtubeController');
    //LastFmController = require('../controllers/lastFmController');
const models = require('../../models');
const querystring = require('querystring');

var exports = module.exports = {}

exports.signup = function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
}

exports.signin = function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
}

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
}

exports.profile = function(req, res) {
    let Playlist = models.playlist;
    playlists = {
        "items": []
    };
    async function main() { //main function that does everything
        try{
            const data = await fetchPlaylists(req.user.id);     //stores returned api info in data
            const playlists = await getPlaylist(data);      //stores object with playlist info(name, id) in playlists
            res.render('profile.ejs', {
                user : req.user,
                playlists: playlists.items,
            });
        }
        catch(err) {
            console.log(err);
        }
    }
    const fetchPlaylists = async(userId) => {
        const artistId = await Playlist.findAll({
            where: {
                user_id: userId,
            }
        });
        return artistId;                                    //returns the row information that was found/inserted
    }
    const getPlaylist = async(data) => {
        for(let i = 0; i < data.length; i++) {
            playlists.items[i] = {};
            playlists.items[i].name = data[i].name;
        }
        return playlists;                                    //returns the row information that was found/inserted
    }
    main();
};

exports.connect = function(req, res) {
    res.render('connect-local.ejs', { message: req.flash('signupMessage') });
}

let User = models.user;
exports.unlinkGoogle = function(req, res) {
    let user = req.user;
    User.findByPk(user.id).then(newUser => {
        newUser.update({
            google_token: null,
        }).then(() => res.redirect('/profile'));
    });
}


exports.spotify = function(req, res) {
    let generateRandomString = function(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      
        for(let i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        console.log(text);
        return text;
    };

    let stateKey = 'spotify_auth_state';
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    let scope = 'user-read-private user-read-email playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
            state: state,
        }));
}

exports.spotifyCallback = function(req, res) {
    async function main() {
        try{
            const spotifyTokens = await AuthController.authorize(req.query.code, models, req.user.id);
            //tokens = spotifyTokens;
            res.redirect('/spotify/playlist');
        }
        catch(err) {
            console.log(err);
        }
    }
    main();
}

exports.spotifyPlaylist = function(req, res) {
    async function main() { //main function that does everything
        try{
            const access_token = await AuthController.refresh(models, req.user.id);
            await PlaylistController.syncPlaylists(access_token, models, req.user.id);
            await delay(500);
            redirect();
        }
        catch(err) {
            console.log(err);
        }
    }
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const redirect = async() => {
        res.redirect('/profile');
    }
    //res.header("Content-Type", 'application/json');
    //res.send(JSON.stringify(tokens, null, 4));
    //res.render('profile.ejs', {title: 'Spotify playlist', accessToken: tokens.access_token, refreshToken: tokens.refresh_token});
    main();
    
}

exports.spotifySyncPlaylist = function(req, res) {
    async function main() {
        try{
            const access_token = await AuthController.refresh(models, req.user.id);
            await PlaylistController.syncSongsArtists(access_token, models, req.user.id, req.body.spotifyPlaylistName);
        }
        catch(err) {
            console.log(err);
        }
    }
    main();
}

exports.search = async function(req, res) {
    const videoId = await YoutubeController.search(req.query.search);
    data = {
        videoId: videoId,
    }
    
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(data, null, 4));
}

exports.youtube = async function(req, res) {
    const videoId = await YoutubeController.default(models);
    data = {
        videoId: videoId,
    }
    res.render('youtube', data);
}

exports.getPlaylistSongs = function(req, res) {
    let User = models.user;
    let email = req.query.email || 'test@test.com';
    User.findOne({
        where: {
            email: email
        },
        include: [
            {
                model: models.playlist,
                include: [
                    {
                        model: models.playlist_song,
                        include: [
                            {
                                model: models.song,
                                include: [
                                    {
                                        model: models.artist
                                    }
                                ]
                            }
                        ],
                        required: true,
                    }
                ]
            }
        ]
    }).then(datas => {
        const resObj = datas.playlists.map(data => {
            const resObj2 = data.playlist_songs.map(data2 => {
                return Object.assign(
                    {},
                    {
                        user: datas.email,
                        playlist_name: data.name,
                        song_name: data2.song.name,
                        artist_name: data2.song.artist.name,
                    }
                );
            })
                return resObj2;
            })
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(resObj, null, 4));
        })
}

const Sequelize = require('sequelize');
const op = Sequelize.Op;

exports.realtimeSearch = function(req, res) {
    let Song = models.song;
    Song.findAll({                                  
        raw: true,
        include: [
            {
                model: models.artist,
                as: 'artist',
                where: {
                    [op.or]: {              //returns rows that contain the query key
                        name: {             //matches song name or artist name
                            [op.like]: '%'+req.query.key+'%',
                        },
                        '$song.name$': {
                            [op.like]: '%'+req.query.key+'%',
                        }
                    }
                }
            }
        ]
    }).then(data => {
        let results = [];
        data.forEach(value => {             
            results.push({                  //push object containing song_name and artist_name to results array
                song_name: value.name,
                artist_name: value['artist.name']
            });
        })          
                                            //sort result so better matches are at the beginning of array
        let sortedResults = sort(results, req.query.key, {
            keys: ['song_name', 'artist_name']});
        if(sortedResults.length > 10) {
            res.end(JSON.stringify(sortedResults.slice(0,10)));
        }
        else {
            res.end(JSON.stringify(sortedResults));
        }
    })
}

exports.lastfm = async function(req, res) {
    console.log(req.query.page);
    const data = await LastFmController.scrapeTrackInfo(models, req.query.page);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(data, null, 4));
}