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
    res.render('profile.ejs', {
        user : req.user
    });
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
            const playlsits = await PlaylistController(tokens, models);
        }
        catch(err) {
            console.log(err);
        }
    }
    //res.header("Content-Type", 'application/json');
    //res.send(JSON.stringify(tokens, null, 4));
    //res.render('profile.ejs', {title: 'Spotify playlist', accessToken: tokens.access_token, refreshToken: tokens.refresh_token});
    main();
    res.redirect('/profile');
}

exports.search = function(req, res) {
    res.render('search');
}