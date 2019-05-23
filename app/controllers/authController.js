const sort = require("match-sorter");
const passport = require('passport')
let PlaylistController = require("../controllers/playlistController"),
    AuthController = require("../controllers/spotifyAuthController"),
    YoutubeController = require("../controllers/youtubeController");
//LastFmController = require('../controllers/lastFmController');

const models = require("../../models");
const querystring = require("querystring");
    
var exports = (module.exports = {});

let currentUserId = '';
exports.spotify = function(req, res, next) {
    let generateRandomString = function(length) {
        let text = "";
        let possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < length; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
    };
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        currentUserId = user.id
    })(req, res, next)

    let stateKey = "spotify_auth_state";
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    let scope = "user-read-private user-read-email playlist-read-private";
    let authorizationLink = "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        state: state,
    })
    res.send({
        link: authorizationLink,
    })
};

exports.spotifyCallback = function(req, res, next) {
    async function main() {
        try {
            await AuthController.authorize(
                req.query.code,
                models,
                currentUserId
            );
            currentUserId = '';
            //tokens = spotifyTokens;
            redirect();
        } catch (err) {
            console.log(err);
        }
    }
    const redirect = async () => {
        res.redirect('http://localhost:3000/api/after-auth')
    }
    main();
};

exports.spotifyPlaylist = function(req, res, next) {
    async function main() {
        //main function that does everything
        try {
            const user = await passportJwtVerify(req, res, next)
            const access_token = await AuthController.refresh(
                models,
                user.id
            );
            const playlists = await PlaylistController.syncPlaylists(
                access_token,
                models,
                user.id
            );
            res.send(playlists)
        } catch (err) {
            console.log(err);
        }
    }
    main();
};

exports.spotifySyncPlaylist = function(req, res, next) {
    async function main() {
        try {
            const user = await passportJwtVerify(req, res, next)
            const access_token = await AuthController.refresh(
                models,
                user.id
            );
            await PlaylistController.syncSongsArtists(
                access_token,
                models,
                user.id,
                req.body.spotifyPlaylistName
            );
        } catch (err) {
            console.log(err);
        }
    }

    main();
};
function passportJwtVerify(req, res, next) {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            currentUserId = user.id
            if(user) resolve(user)
            reject(err)
        })(req, res, next)
    })
}
exports.search = async function(req, res) {
    const video = await YoutubeController.search(models, req.query.search);
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(video, null, 4));
};

exports.youtube = async function(req, res) {
    if (req.user) {
        /* play from a user's playlist by default if they are logged in */
    }
    const videoId = await YoutubeController.default(models);
    data = {
        videoId: videoId,
    };
    res.status(200).send(data);
    //res.render("youtube", data);
};

exports.getPlaylistSongs = function(req, res) {
    let User = models.user;
    let username = req.query.user || "test";
    User.findOne({
        where: {
            username: username,
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
                                        model: models.artist,
                                    },
                                ],
                            },
                        ],
                        required: true,
                    },
                ],
            },
        ],
    })
        .then(datas => {
            let resObj = {};
            if (datas !== null) {
                resObj = datas.playlists.map(data => {
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
                    });
                    return resObj2;
                });
            } else {
                resObj = {}; //user with email not found
            }
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify(resObj, null, 4));
        })
        .catch(err => console.log(err));
};

const Sequelize = require("sequelize");
const op = Sequelize.Op;

exports.realtimeSearch = function(req, res) {
    let Song = models.song;
    Song.findAll({
        raw: true,
        include: [
            {
                model: models.artist,
                as: "artist",
                where: {
                    [op.or]: {
                        //returns rows that contain the query key
                        name: {
                            //matches song name or artist name
                            [op.like]: "%" + req.query.key + "%",
                        },
                        "$song.name$": {
                            [op.like]: "%" + req.query.key + "%",
                        },
                    },
                },
            },
        ],
    }).then(data => {
        let results = [];
        data.forEach((value, index) => {
            results.push({
                //push object containing song_name and artist_name to results array
                song_name: value.name,
                artist_name: value["artist.name"],
                youtube_id: value.youtube,
            });
        });
        //sort result so better matches are at the beginning of array
        let sortedResults = sort(results, req.query.key, {
            keys: ["song_name", "artist_name"],
        });
        if (sortedResults.length > 10) {
            res.end(JSON.stringify(sortedResults.slice(0, 10)));
        } else {
            res.end(JSON.stringify(sortedResults));
        }
    });
};

exports.lastfm = async function(req, res) {
    console.log(req.query.page);
    const data = await LastFmController.scrapeTrackInfo(models, req.query.page);
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 4));
};

