//Dependencies
const express = require('express');
const BodyParser = require('body-parser');
const compression = require('compression');
const exphbs = require('express-handlebars');
const passport = require('passport');
var methodOverride = require('method-override');
const path = require('path');
const { passportLogic, } = require('./config/auth/passport-local');
const { routeCheck, } = require('express-suite');

//Redis
const { client, RedisStore, session, } =
    require('./config/dataBase/redisConnection');

//Winston
const appLog = require('./config/system/log').get('appLog');

//Global Constant
const PORT = process.env.PORT || 3008;

//Initialize the App
const app = express();

// override with POST having ?_method=methodHere
app.use(methodOverride('_'));

//Compression Module
app.use(compression({ level: 9, memLevel: 9, }));

//Disable etag
app.set('etag', false);
app.set('x-powered-by', false);

//Enable Caching
// app.enable('view cache');

// BodyParser Middleware
app.use(BodyParser.urlencoded({
    extended: true,
    limit: '5mb',
}));

app.use(BodyParser.json({
    limit: '5mb',
    extended: true,
}));


// Express Session Middleware
app.use(
    session({
        store: new RedisStore({ client, }),
        secret: 'liaus;dhg[qwhrgoipu42-49-329*&^OJKLAKHDJJAKLJofuy032qpjij12li34uv',
        resave: true,
        saveUninitialized: false,
        cookie: {
            // path: "/",
            httpOnly: true,
            secure: false, //Set true only if the connection is made over https => otherwise it won't work
            // maxAge: 900000 * 2 //30 mins
            maxAge: 10800 * 1000, //3hrs
        },
    })
);


//Set Static Folder (Absolute)
app.use('/', express.static(path.join(__dirname, '/assets')));

//Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));

app.set('view engine', 'handlebars');

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.all('*', (req, res, next) => {

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'https://moodli.xx');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //No cache
    // res.setHeader('Cache-Control', 'max-age=120,private');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

//Load Routes
const main = require('./routes/main');
const reg = require('./routes/register');

//Load passport config
passportLogic(passport);

//Use Routes
app.use('/', main);
app.use('/', reg);

//Route Check
app.use(routeCheck(app));

//Start the app
app.listen(PORT, () => {
    appLog.info(`Server is listening on port ${PORT}`);
});
