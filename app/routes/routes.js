let models = require("../../models");
let authController = require("../controllers/authController");
let configAuth = require("../../config/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
// app/routes.js
module.exports = function(app) {
    app.get("/", function(req, res) {
        //home page
        res.render("index.ejs"); // load the index.ejs file
    });

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
                            email: user.email,
                        },
                    }).then(user => {
                        const token = jwt.sign(
                            { id: user.email },
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
                res.status(200).send({
                    auth: true,
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    playlists: [],
                    message: "user found in db",
                });
            }
        })(req, res, next);
    });

    // LOGOUT
    app.get("/logout", authController.logout);

    // GOOGLE ROUTES
    app.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email"], //send to google to authenticate
        })
    );
    //profile gets basic information including name
    //email gets their email

    app.get(
        "/auth/google/callback", //callback after google has authenticated the user
        passport.authenticate("google", {
            successRedirect: "/profile",
            failureRedirect: "/",
        })
    );

    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT)
    // connect local account
    app.get("/connect/local", authController.connect);
    app.post(
        "/connect/local",
        passport.authenticate("local-signup", {
            successRedirect: "/profile", // redirect to the secure profile section
            failureRedirect: "/connect/local", // redirect back to the signup page if there is an error
            failureFlash: true, // allow flash messages
        })
    );

    // connect google account
    app.get(
        "/connect/google",
        passport.authorize("google", { scope: ["profile", "email"] })
    );

    app.get(
        "/connect/google/callback", // the callback after google has authorized the user
        passport.authorize("google", {
            successRedirect: "/profile",
            failureRedirect: "/",
        })
    );

    // UNLINK ACCOUNTS
    //used to unlink accounts. for social accounts, just remove the token
    let User = models.user;
    //local
    /*app.get('/unlink/local', (req, res) => {      //removed ability to unlink local account
        let user = req.user;
        User.findByPk(user.id).then(newUser => {
            newUser.update({
                email:       null,
                password:    null,
            }).then(() => res.redirect('/profile'));
        });
    });*/

    //google
    app.get("/unlink/google", authController.unlinkGoogle);

    //spotify
    app.get("/spotify/sync", isLoggedIn, authController.spotify);

    app.get("/spotify/callback", isLoggedIn, authController.spotifyCallback);

    app.get("/spotify/playlist", isLoggedIn, authController.spotifyPlaylist);

    app.get("/youtube", authController.youtube);

    app.get("/api/youtube/top", authController.youtube);

    //test api routes
    //app.get('/api/lastfm', authController.lastfm);
    app.get("/api/search", authController.realtimeSearch);
    app.get("/api/youtube/search", authController.search);
    app.post("/api/test", authController.spotifySyncPlaylist); //sync songs/artists of a playlist
    app.get("/api/user/playlists", authController.getPlaylistSongs); //returns all of the playlists and the songs in the playlist for a user
    //right now just returns for user test@test.com
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect("/");
}
