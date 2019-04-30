const express       = require('express');
const passport      = require('passport');
const flash         = require('connect-flash');
const cors          = require('cors');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const session       = require('express-session');

const models      = require('./models');
const env = require('dotenv').config(__dirname + './env');;
const app = express();
const port = process.env.PORT || 4500;

//Sync database
models.sequelize.sync().then(() => {
    console.log('Connected to database');
}).catch(err => console.log(err, 'Something went wrong'));

require('./config/passport');

app.use(cors());
//set up express application
app.use(morgan('dev'));     //log every request to the console
app.use(bodyParser.urlencoded({ extended: false }));      //get information from html forms
app.use(bodyParser.json()); 
app.use(express.static(__dirname + '/public'));

//required for passport
app.use(passport.initialize());

//routes
require('./app/routes/routes')(app);  //load our routes and pass in our app and fully configured passport

//launch
app.listen(port);
console.log(`Running at localhost:${port}`);