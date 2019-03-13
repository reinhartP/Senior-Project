const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request'); 

const client_id = process.env.CLIENT_ID;       // Your client id
const client_secret = process.env.CLIENT_SECRET;   // Your secret
const redirect_uri = 'http://localhost:3000/callback';      // Your redirect uri

var stateKey = 'spotify_auth_state';

module.exports = function (code, callback) {

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        var tokens = {};
        request.post(authOptions, function(error, response, body) {
            if(!error && response.statusCode === 200) {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;
    
                tokens.access_token = access_token;
                tokens.refresh_token = refresh_token;
                callback(tokens);
            }
        })
};
