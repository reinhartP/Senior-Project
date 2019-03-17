const express = require('express');
const app = express();

const path = require('path');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const env = require('dotenv').load();

//For bodyParser
app.use(bodyParser.urlencoded({ enxtended: true }));
app.use(bodyParser.json());

//For passport
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); //session secret
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, './app/public')));
//For Handlebars
app.set('views', './app/views')
app.engine('hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
    res.send('Welcome to Passport with Sequelize');
});

//Models
const models = require('./models');

//Routes
const authRoute = require('./app/routes/auth.js')(app,passport);

//load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

//Sync database
models.sequelize.sync().then(() => {
    console.log('Nice! Database looks fine');
}).catch(err => console.log(err, 'Something went wrong'));









app.listen(3000, (err) => {
    if(!err)
        console.log('Site is live on port 3000...');
    else
        console.log(err);
});