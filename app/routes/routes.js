let models = require("../../models");
let authController = require("../controllers/authController");
let configAuth = require("../../config/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require('path')
// app/routes.js
module.exports = function(app) {
    let User = models.user;
    

    // LOGIN
    app.post("/login", (req, res, next) => {
        passport.authenticate("local-login", (err, user, info) => {
            if (err) {
                console.log("signin error", err);
            }
            if (info != undefined) {
                console.log(info.message);
                res.send(info.message);
            } else {
                req.login(user, err => {
                    User.findOne({
                        where: {
                            username: user.username,
                        },
                    }).then(user => {
                        const token = jwt.sign(
                            { id: user.username },
                            configAuth.jwtSecret
                        );
                        res.status(200).send({
                            auth: true,
                            token: token,
                            message: "user found & logged in",
                        });
                    });
                });
            }
        })(req, res, next);
    });

    // SIGNUP
    //app.get('/signup', authController.signup);  // render the page and pass in any flash data if it exists

    app.post("/signup", (req, res, next) => {
        passport.authenticate("local-signup", (err, user, info) => {
            if (err) {
                console.log("signup error", err);
            }
            if (info != undefined) {
                console.log(info.message);
                res.send(info.message);
            } else {
                req.login(user, err => {
                    const data = {
                        username: req.body.username,
                        email: user.email,
                    };
                    User.findOne({
                        where: {
                            email: data.email,
                        },
                    }).then(user => {
                        user.update({
                            username: data.username,
                        }).then(() => {
                            console.log("user created in db");
                            res.status(200).send({ message: "user created" });
                        });
                    });
                });
            }
        })(req, res, next);
    });

    // PROFILE SECTION
    app.get("/api/me", (req, res, next) => {
        passport.authenticate("jwt", { session: false }, (err, user, info) => {
            if (err) {
                console.log("err", err);
            }
            if (info != undefined) {
                console.log("undefined", info.message);
                res.send(info.message);
            } else {
                console.log("user found in db from route");
                models.playlist.findAll({
                    where: {
                        user_id: user.id,
                    },
                    raw: true,
                }).then(data => {
                    res.status(200).send({
                        auth: true,
                        spotifyAuth: user.spotify_access !== null ? true : false,
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        password: user.password,
                        syncPlaylists: data,
                        searchPlaylists: [],
                        message: "user found in db",
                    });
                })
                
            }
        })(req, res, next);
    });

    // LOGOUT
    //app.get("/logout", authController.logout);

    //spotify
    app.get("/spotify/connect", isLoggedIn, authController.spotify);

    
    app.get("/spotify/callback", isLoggedIn, authController.spotifyCallback);

    app.get("/spotify/playlist", isLoggedIn, authController.spotifyPlaylist);

    app.get("/api/youtube/top", authController.youtube);

    //test api routes
    //app.get('/api/lastfm', authController.lastfm);
    app.get("/api/search", authController.realtimeSearch);
    app.get("/api/youtube/search", authController.search);
    app.post("/api/spotify/sync/playlist", authController.spotifySyncPlaylist); //sync songs/artists of a playlist
    app.get("/api/user/playlists", authController.getPlaylistSongs); //returns all of the playlists and the songs in the playlist for a user
    app.get("/api/spotify/authorize", authController.spotify);
    app.get("/api/spotify/callback", authController.spotifyCallback);
    app.get("/api/spotify/sync", authController.spotifyPlaylist);

    app.get("*", function(req, res) {
        //home page
        res.sendFile(path.join(__dirname, '../../../frontend/build/index.html'))
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect("/");
}
