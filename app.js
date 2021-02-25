// Load Environmental Variables
require('./creds/env');

// Load Mongo Error Dataset into Redis
require('./config/utils/mongoErrorLoader');

// Dependencies
const express = require('express');
const BodyParser = require('body-parser');
const compression = require('compression');
const exphbs = require('express-handlebars');
const passport = require('passport');
const methodOverride = require('method-override');
const path = require('path');
const mongoSanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssC = require('xss-clean');
const hpp = require('hpp');
const crypto = require('crypto');
const { passportLogic, } = require('./config/auth/passport-local');
const { routeCheck, } = require('express-suite');
const { routeLogger, } = require('./config/middlewares/routeLogger');

// Redis
const { redisClient: client, RedisStore, session, } =
    require('./config/dataBase/redisConnection');

// Winston
const appLog = require('./config/system/log').get('appLog');

// Custom Error Handler
const errorHandler = require('./config/middlewares/customErrorHandler');

// Global Constant
const PORT = process.env.PORT || 3008;

// Initialize the App
const app = express();

// override with POST having ?_method=methodHere
app.use(methodOverride('_'));

// Compression Module
app.use(compression({ level: 9, memLevel: 9, }));

// Disable etag
app.set('etag', false);
app.set('x-powered-by', false);

// Enable Caching
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

app.use(BodyParser.text({
    limit: '5mb',
    extended: true,
}));

// Prevent HTTP params pollution
app.use(hpp());

// Express Session Middleware
app.use(
    session({
        store: new RedisStore({ client, }),
        secret: process.env.Cookie_Secrete,
        resave: true,
        saveUninitialized: false,
        cookie: {
            // path: "/",
            httpOnly: true,
            secure: Boolean(process.env.Cookie_Secure), // Set true only if the connection is made over https => otherwise it won't work
            // maxAge: 900000 * 2 // 30 mins
            maxAge: 10800 * 1000, // 3hrs
        },
    })
);

// Required options if running behind a proxy and with cookie secure attribute = true
app.set('trust proxy', 1);

// Set Static Folder (Absolute)
app.use('/', express.static(path.join(__dirname, '/assets')));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));

app.set('view engine', 'handlebars');

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.all('*', (req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    // No cache
    // res.setHeader('Cache-Control', 'max-age=120,private');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


// Load passport config
passportLogic(passport);

// Route Logger
app.use(routeLogger);

// Load Routes
const main = require('./routes/main');
const reg = require('./routes/register');

// Prevent NOSQL Injection
app.use(mongoSanitizer());

// Set security headers
app.use(helmet());

// Nonce
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
});

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'script-src': ["'strict-dynamic'", (req, res) => `'nonce-${res.locals.cspNonce}'`, "'unsafe-eval'", 'https://ajax.cloudflare.com/'],
            'connect-src': ['ipinfo.io', 'www.avivlo.com', 'pagead2.googlesyndication.com', 'www.google-analytics.com', 'stats.g.doubleclick.net', 'partner.googleadservices.com', 'avivlo.com'],
            'img-src': ["'self'", 'data:', 'www.google.com', 'www.google.com.tw', 'www.google-analytics.com'],
        },
    })
);

// Prevent XSS
app.use(xssC());

// Use Routes
app.use('/', main);
app.use('/', reg);

// Use the custom error handler
app.use(errorHandler);

// Route Check/
app.use(routeCheck(app));

// Start the appg
app.listen(PORT, () => {
    appLog.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});