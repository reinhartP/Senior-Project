var authController = require('../controllers/authcontroller');

module.exports = function(app, passport) {
    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);
    app.get('/logout', authController.logout);
    app.get('/dashboard', isLoggedIn, authController.dashboard);    //can only access is logged in
    app.get('/spotify', isLoggedIn, authController.spotify);
    app.get('/callback', isLoggedIn, authController.callback);
    app.get('/playlist', isLoggedIn, authController.playlist);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/signup'
    }));
    app.post('/signin', passport.authenticate('local-signin', {
        //successRedirect: '/dashboard',
        successRedirect: '/spotify',
        failureRedirect: '/signin'
    }));

    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        res.redirect('/signin');                //redirect to /signin if not signed in
    }
}