// config/passport.js

// load all the things we need
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt-nodejs");
// load up the user model
let models = require("../models/");
let configAuth = require("./auth");

let User = models.user;
let op = models.Sequelize.Op;
// LOCAL SIGNUP
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use(
    "local-signup",
    new LocalStrategy(
        {
            usernameField: "email", // by default, local strategy uses username and password, we will override with email
            passwordField: "password",
            session: false,
            passReqToCallback: true
        },
        (req, email, password, done) => {
            try {
                console.log("username", req.body.username);
                User.findOne({
                    where: {
                        [op.or]: {
                            email: email,
                            username: req.body.username
                        }
                    },
                    raw: true
                }).then(user => {
                    console.log(user);
                    if (user != null) {
                        if (user.email === email) {
                            console.log("email already taken");
                            return done(null, false, {
                                message: "email is already taken"
                            });
                        } else if (user.username === req.body.username) {
                            console.log("username already taken");
                            return done(null, false, {
                                message: "username is already taken"
                            });
                        }
                    } else {
                        bcrypt.hash(
                            password,
                            bcrypt.genSaltSync(12),
                            null,
                            (err, hashedPassword) => {
                                User.create({
                                    email,
                                    password: hashedPassword
                                }).then(user => {
                                    console.log("user created");
                                    return done(null, user);
                                });
                            }
                        );
                    }
                });
            } catch (err) {
                if (err.errors[0].validatorName === "isEmail") {
                    return done(null, false, "invalid email");
                }
                done(err);
            }
        }
    )
);

// LOCAL LOGIN
passport.use(
    "local-login",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            session: false
        },
        (username, password, done) => {
            // callback with email and password from our form
            try {
                User.findOne({
                    where: {
                        username: username
                    },
                    raw: true
                }).then(user => {
                    if (user === null) {
                        return done(null, false, { message: "bad username" });
                    } else {
                        bcrypt.compare(
                            password,
                            user.password,
                            (err, response) => {
                                if (response !== true) {
                                    console.log("passwords do not match");
                                    return done(null, false, {
                                        message: "passwords do not match"
                                    });
                                }
                                console.log("user found & authenticated");
                                return done(null, user);
                            }
                        );
                    }
                });
            } catch (err) {
                done(err);
            }
        }
    )
);

//JWT

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: configAuth.jwtSecret
};

passport.use(
    "jwt",
    new JWTstrategy(opts, (jwt_payload, done) => {
        try {
            User.findOne({
                where: {
                    username: jwt_payload.id
                }
            }).then(user => {
                if (user) {
                    console.log("user found in db in passport");
                    done(null, user);
                } else {
                    console.log("user not found in db");
                    done(null, false);
                }
            });
        } catch (err) {
            done(err);
        }
    })
);
