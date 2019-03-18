const express       = require('express');
const passport      = require('passport');
const flash         = require('connect-flash');

const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const session       = require('express-session');

const models      = require('./models');
const env = require('dotenv').config(__dirname + './env');;
const app = express();
const port = process.env.PORT || 3000;

//Sync database
models.sequelize.sync().then(() => {
    console.log('Connected to database');
}).catch(err => console.log(err, 'Something went wrong'));

require('./config/passport')(passport); //pass passport for configuration

//set up express application
app.use(morgan('dev'));     //log every request to the console
app.use(cookieParser());    //read cookies (needed for auth)
app.use(bodyParser());      //get information from html forms
app.use(express.static(__dirname + '/public'));


app.set('view engine', 'ejs');  //set up ejs for templating

//required for passport
app.use(session({ secret: 'sessionSecret' }));
app.use(passport.initialize());
app.use(passport.session());    //persistent login sessions
app.use(flash());               //use connect-flash for flash messages stored in session

//routes
require('./app/routes/routes')(app, passport);  //load our routes and pass in our app and fully configured passport

//launch
app.listen(port);
console.log(`Running at localhost:${port}`);