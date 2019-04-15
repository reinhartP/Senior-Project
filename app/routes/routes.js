let models = require('../../models');
let authController = require('../controllers/authController');
// app/routes.js
module.exports = function(app, passport) {
    app.get('/', function(req, res) {   //home page
        res.render('index.ejs'); // load the index.ejs file
    });

    // LOGIN
    app.get('/login', authController.signin);

    app.post('/login', passport.authenticate('local-login', {       // process the login form
        successRedirect : '/profile',                               // redirect to the secure profile section
        failureRedirect : '/login',                                 // redirect back to the signup page if there is an error
        failureFlash : true                                         // allow flash messages
    }));

    // SIGNUP
    app.get('/signup', authController.signup);  // render the page and pass in any flash data if it exists

    app.post('/signup', passport.authenticate('local-signup', {             // process the signup form
        successRedirect : '/profile',                                       // redirect to the secure profile section
        failureRedirect : '/signup',                                        // redirect back to the signup page if there is an error
        failureFlash : true                                                 // allow flash messages
    }));

    // PROFILE SECTION
    app.get('/profile', isLoggedIn, authController.profile);

    // LOGOUT
    app.get('/logout', authController.logout);

    // GOOGLE ROUTES
    app.get('/auth/google', passport.authenticate('google', { 
        scope : ['profile', 'email']     //send to google to authenticate
    }));
                                                                                                //profile gets basic information including name
                                                                                                //email gets their email
    
    app.get('/auth/google/callback',                //callback after google has authenticated the user
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));

    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT)
    // connect local account
    app.get('/connect/local', authController.connect);
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile',       // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true                 // allow flash messages
    }));

    // connect google account
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/connect/google/callback',     // the callback after google has authorized the user
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

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
    app.get('/unlink/google', authController.unlinkGoogle);

    //spotify
    app.get('/spotify/sync', isLoggedIn, authController.spotify);

    app.get('/spotify/callback', isLoggedIn, authController.spotifyCallback);

    app.get('/spotify/playlist', isLoggedIn, authController.spotifyPlaylist);

    app.get('/youtube', authController.youtube);

    //test api routes
    app.get('/api/search', authController.realtimeSearch);
    app.get('/api/youtube/search', authController.search);
    app.post('/api/test', authController.spotifySyncPlaylist);      //sync songs/artists of a playlist
    app.get('/api/test2', authController.getPlaylistSongs);         //returns all of the playlists and the songs in the playlist for a user
                                                                        //right now just returns for user test@test.com
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
