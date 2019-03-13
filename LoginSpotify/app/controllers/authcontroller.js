let PlaylistController = require('../controllers/playlistController');
    AuthController = require('../controllers/spotifyAuthController');
const querystring = require('querystring');
var exports = module.exports = {}
var tokens = {};
const models = require('../../models');
exports.signup = function(req, res) {
    res.render('signup');
}

exports.signin = function(req, res) {
    res.render('signin');
}

exports.logout = function(req, res) {
    req.session.destroy((err) => {
        res.redirect('/');
    });
}

exports.dashboard = function(req, res) {
    res.render('dashboard');
}

exports.spotify = function(req, res) {
    var generateRandomString = function(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      
        for (var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    var stateKey = 'spotify_auth_state';
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    var scope = 'user-read-private user-read-email playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: 'http://localhost:3000/callback',
            state: state,
        }));
}

exports.callback = function(req, res) {
    AuthController(req.query.code, (tempTokens) => {
        tokens = tempTokens;
        res.redirect('/playlist');
    });
}

exports.playlist = function(req, res) {
    PlaylistController(tokens, models);
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(tokens, null, 4));
}