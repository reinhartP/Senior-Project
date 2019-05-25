const express = require('express');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const models = require('./models');
const env = require('dotenv').config(__dirname + './env');
const app = express();
const port = process.env.PORT || 4500;

//Sync database
models.sequelize
    .sync()
    .then(() => {
        console.log('Connected to database');
    })
    .catch(err => console.log(err, 'Something went wrong'));

require('./config/passport');

app.use(cors());
//set up express application
app.use(morgan('dev')); //log every request to the console
app.use(bodyParser.urlencoded({ extended: false })); //get information from html forms
app.use(bodyParser.json());
app.use(
    '/static',
    express.static(path.join(__dirname, '../frontend/build//static'))
);
//app.use(express.static(path.join(__dirname + '../frontend/build')));

//required for passport
app.use(passport.initialize());

//routes
require('./app/routes/routes')(app); //load our routes and pass in our app and fully configured passport

//launch
const server = app.listen(port);
console.log(`Running at localhost:${port}`);
const io = require('socket.io')(server);
let sockets = require('./app/controllers/socketController')(io);
