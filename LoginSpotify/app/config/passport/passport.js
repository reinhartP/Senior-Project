var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {
    var User = user;
    var LocalStrategy = require('passport-local').Strategy;

    //serialize
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    //deserialize user
    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            if(user) {
                done(null, user.get());
            }
            else {
                done(user.errors, null);
            }
        });
    });

    //Local signup
    passport.use('local-signup', new LocalStrategy(
        {
            usernameField:      'email',
            passwordField:      'password',
            passReqToCallback:  true        // allows us to pass back the entire request to the callback
        },
 
        function(req, email, password, done) {
            var generateHash = function(password) {     //hash password with bcrypt
                return bCrypt.hashSync(password, bCrypt.genSaltSync(12), null)
            };
 
            User.findOne({                  //search if email already exists
                where: {
                    email: email
                }
            }).then(function(user) {
                if (user) {         //if email exists
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } 
                else {              //if it doesn't exist create user
                    var userPassword = generateHash(password);
                    var data = {
                            email: email,
                            password: userPassword,
                            username: req.body.username,
                        };
 
                    User.create(data).then((newUser, created) => {
                        if (!newUser) {
                            return done(null, false);
                        }

                        if (newUser) {
                            return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));

    //Local signin
    passport.use('local-signin', new LocalStrategy(
        {
            usernameField:      'email',
            passwordField:      'password',
            passReqToCallback:  true
        },

        function(req, email, password, done) {
            var User = user;
            var isValidPassword = (userpass, password) => {
                return bCrypt.compareSync(password, userpass);
            }

            User.findOne({                                          //search for email
                where: {
                    email: email
                }
            }).then(user => {
                if(!user) {                                         //if email doesn't exist
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }
                if(!isValidPassword(user.password, password)) {     //if password is invalid
                    return done(null, false, {
                        message: 'Incorrect password'
                    });
                }

                var userInfo = user.get();                          //gets user object
                console.log(userInfo);
                return done(null, userInfo);
            }).catch(err => {
                console.log("Error: ", err);
                return done(null, false, {
                    message: 'Something went wrong with your signin'
                });
            });
        }
    ));
}
    