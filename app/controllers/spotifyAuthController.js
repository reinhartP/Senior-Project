const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request'); 

const client_id = process.env.SPOTIFY_CLIENT_ID;       // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;   // Your secret
const redirect_uri = process.env.SPOTIFY_CALLBACK_URL;      // Your redirect uri

let stateKey = 'spotify_auth_state';

module.exports = function (code, callback) {

        let authOptions = {
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
        let tokens = {};
        request.post(authOptions, function(error, response, body) {
            if(!error && response.statusCode === 200) {
                let access_token = body.access_token,
                    refresh_token = body.refresh_token;
    
                tokens.access_token = access_token;
                tokens.refresh_token = refresh_token;
                callback(tokens);
            }
        })
};
