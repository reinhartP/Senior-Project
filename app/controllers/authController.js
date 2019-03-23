let PlaylistController = require('../controllers/playlistController'),
    AuthController = require('../controllers/spotifyAuthController');
const models = require('../../models');
const querystring = require('querystring');

var exports = module.exports = {}

let tokens = {};

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
                userId: userId,
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
            googleToken: null,
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
    AuthController(req.query.code, (tempTokens) => {
        tokens = tempTokens;
        res.redirect('/spotify/playlist');
    });
}

exports.spotifyPlaylist = function(req, res) {
    async function main() { //main function that does everything
        try{
            await PlaylistController.syncPlaylists(tokens, models, req.user.id);
            await delay(150);
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
            await PlaylistController.syncSongsArtists(tokens, models, req.user.id, req.body.spotifyPlaylistName);
        }
        catch(err) {
            console.log(err);
        }
    }
    main();
}

exports.search = function(req, res) {
    res.render('search');
}