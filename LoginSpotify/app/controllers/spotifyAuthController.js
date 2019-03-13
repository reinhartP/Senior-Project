const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request'); 

const client_id = '48e26e2289e640e5a9c439c22a209460';       // Your client id
const client_secret = 'f0fe6956b1f947d8b67c9767af55f2e8';   // Your secret
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
