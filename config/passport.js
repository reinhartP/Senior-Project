// config/passport.js

// load all the things we need
let LocalStrategy   = require('passport-local').Strategy;
let GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
// load up the user model
let models          = require('../models/');
let configAuth      = require('./auth');

module.exports = function(passport) {               // expose this function to our app using module.exports
    let User = models.user;
        // passport session setup
        // required for persistent login sessions
        // passport needs ability to serialize and unserialize users out of session

    
    passport.serializeUser(function(user, done) {   // used to serialize the user for the session
        done(null, user.id);
    });

    
    passport.deserializeUser((id, done) => {        // used to deserialize the user
        User.findOne({
            where: {
                id: id
        }}).then(user => {
            if(user) {
                done(null, user.get());
            }
            else {
                done(user.errors, null);
            }
        });
    });

    // LOCAL SIGNUP
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        
        usernameField : 'email',            // by default, local strategy uses username and password, we will override with email
        passwordField : 'password',
        passReqToCallback : true            // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        process.nextTick(function() {   //asynchronous
                                        //User.findOne won't run unless data is sent back
        
        if(!req.user) {                 //user not currently logged in
            User.findOne({              
                where: {
                    email :  email, 
                }}).then((user) => {
                
                if (user) {             // user already exists with that email
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } 
                else {                      // no user with that email
                    let data            = { // create the user
                        email: email,
                        password: password,
                    };
                    User.create(data).then((newUser, created) => {
                        if (!newUser) {
                            return done(null, false);
                        }

                        if (newUser) {
                            return done(null, newUser);
                        }
                    }).catch(err => {
			if(err.errors[0].validatorName === 'isEmail') {
				return done(null, false, req.flash('signupMessage', 'Invalid email'));
			}
		    };
                }})
            }
            else {                          //user is logged in, connect local account
                User.findOne({
                    where: {
                        email: email,
                    }
                }).then((user) => {
                    if(!user) {                                 //user with that email doesn't exist
                        return done(null, false, req.flash('signupMessage', 'Email or password is incorrect'));
                    }
                    if(!user.validPassword(password)) {         //password is invalid
                        return done(null, false, req.flash('signupMessage', 'Email or password is incorrect'));
                    }
                    else {                                  
                        let currentUser = req.user;
                        User.findByPk(currentUser.id).then(newUser => {     //finds the current user in database
                            let newPassword = user.generateHash(password);  //generate new hash for password
                            newUser.update({                                //update the email/password of currently logged in Google user
                                email:       email,
                                password:    newPassword,
                            }).then(newUser => {
                                User.destroy({                              //remove old record of local account from db
                                    where: {
                                        id: user.id,
                                    }
                                });
                                return done(null, newUser);
                            });
                        });
                    }
                })
                
            }
        });
        
    }));
        

    // LOCAL LOGIN
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) { // callback with email and password from our form

        User.findOne({ 
            where: {
                email :  email,
            }
        }).then((user) => {
            
            if (!user)                                                                          // if no user is found, return the message
                return done(null, false, req.flash('loginMessage', 'No user found.'));          // req.flash is the way to set flashdata using connect-flash
            
            if (!user.validPassword(password))                                                  // if the user is found but the password is wrong
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));   // create the loginMessage and save it to session as flashdata

            
            return done(null, user);                                                            // all is well, return successful user
        }).catch(err => console.log(err));
        
    }));

    // GOOGLE
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback: true,
    },
    function(req, token, refreshToken, profile, done) {

        process.nextTick(function() {
            
            if(!req.user) {                                             //check if user is alraedy logged in
                
                User.findOne({                                          // try to find the user based on their google id
                    where: {
                        googleId : profile.id 
                    }
                }).then(user => {
                    if (user) {
                        if(!user.googleToken) {                         //googleId is found but there is no token
                            user.update({                               //update google info
                                googleToken: token,
                                googleName: profile.displayName,
                                googleEmail: profile.emails[0].value,
                            }).then(newUser => done(null, newUser));
                        }
                        return done(null, user);                        // if a user is found, log them in
                    } 
                    else {
                        let data          = {};                         // if the user isnt in our database, create a new user
                        // set all of the relevant information
                        data.googleId    = profile.id;
                        data.googleToken = token;
                        data.googleName  = profile.displayName;
                        data.googleEmail = profile.emails[0].value;     // pull the first email
                        User.create(data).then(newUser => {
                            return done(null, newUser);
                        })
                    }
                });
            }
            else {                                                      //connect google account, user is currently logged in
                let user = req.user;
                User.findByPk(user.id).then(newUser => {                //search id of current user
                    newUser.update({                                    //update their record to include google account info
                        googleId:       profile.id,
                        googleToken:    token,
                        googleEmail:    profile.emails[0].value,
                        googleName:     profile.displayName,
                    }).then(newUser => {
                        return done(null, newUser);
                    })
                })
            }
        });
    }));
};
