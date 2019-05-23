
const request = require('request-promise-native'); 

const client_id = process.env.SPOTIFY_CLIENT_ID;       // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;   // Your secret
const redirect_uri = process.env.SPOTIFY_CALLBACK_URL;      // Your redirect uri

var exports = module.exports = {};

exports.authorize = async function(code, models, userId) {
    let User = models.user;
    let authOptions = {
        method: 'POST',
        uri: 'https://accounts.spotify.com/api/token',
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
    const accessToken = await request(authOptions).then(body => {
        tokens = {
            access_token: body.access_token,
            refresh_token: body.refresh_token,
        }
        
        User.update({
            spotify_access: tokens.access_token,
            spotify_refresh: tokens.refresh_token
        }, {
            where: {
                id: userId
            }
        });

        return tokens.access_token
    }).catch(err => console.log(err));
    return accessToken
};

exports.refresh = async function(models, userId, callback) {
    let User = models.user;
    const data = await User.findOne({
        where: {
            id: userId,
        }
    }).then(data => {
        return data
    });
    tokens = {
        access_token: data.dataValues.spotify_access,
        refresh_token: data.dataValues.spotify_refresh,
    }
    let authOptions = {
        method: 'POST',
        uri: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };
    
    const access_token = await request(authOptions).then(body => {
        let access_token = body.access_token;
        User.update({
            spotify_access: access_token,
        }, {
            where: {
                id: userId
            }
        }).catch(err => console.log(err));

        return access_token;
    })
    return access_token;
}