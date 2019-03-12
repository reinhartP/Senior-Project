const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

let PlaylistController = require('./controllers/playlistController'),
    AuthController = require('./controllers/authController');
let User = require('./models/user');
//let Playlist = require('./models/playlists');

const client_id = ''; // Your client id
const client_secret = ''; // Your secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  var stateKey = 'spotify_auth_state';
  var tokens = {};
  const app = express();
  
  app.use(express.json());
  app.use(express.static(__dirname + '/public'))
     .use(cors())
     .use(cookieParser());
  

app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

app.get('/callback', function(req, res) {
    AuthController(req.query.code, function(tempTokens) {
        console.log(tempTokens);
        tokens = tempTokens;
        res.redirect('/playlist');
    });
})

app.get('/playlist', function(req, res) {
    PlaylistController(tokens);
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(tokens, null, 4));
})

app.get('/search', function(req, res) {
  PlaylistController(tokens);
  res.header("Content-Type", 'application/json');
  res.send(JSON.stringify(tokens, null, 4));
})

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));