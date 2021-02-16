// Dependencies
const winston = require('winston');
const path = require('path');

// Global variables
let readableDate = () => {
    return new Date(Date.now()).toUTCString();
};

// Log store path
const logStore = path.join(__dirname, '../logs');


// Log Level
// { 
//     error: 0, 
//     warn: 1, 
//     info: 2, 
//     http: 3,
//     verbose: 4, 
//     debug: 5, 
//     silly: 6 
//   }
let logLv = null;
if (process.env.NODE_ENV === 'production') {
    logLv = 'http';
} else {
    logLv = 'silly';
}

// Custom Log Format
const logFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true, }),
    winston.format.printf(info => {

        // //Determine Message type => special handling for object and error

        if (!info.stack) {
            return `${readableDate()} | [${info.label}] ${info.level}: ${JSON.stringify(info.message, null, 0)}`;
        }

        return `${readableDate()} | [${info.label}] ${info.level}: ${info.message} Stack: ${info.stack}`;

    })
);


// Container for Multiple Loggers
const container = new winston.Container();

// Logging Category for app.js
container.add('appLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'APP', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/app_error.log`, })
    ],
    exceptionHandlers: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/app_exception.log`, })
    ],
    exitOnError: true,

});

// Logging Category for mongoConnection.js
container.add('mongoLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'MONGO', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/mongo_error.log`, })
    ],

    exitOnError: true,

});

// Logging Category for redisConnection.js
container.add('redisLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'REDIS', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/redis_error.log`, })
    ],

    exitOnError: true,

});


// Logging Category for Auth-related tasks
container.add('authLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'AUTH', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/auth_error.log`, })
    ],

    exitOnError: true,

});


// Logging Category for Auth-related tasks
container.add('miscLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'MISC', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/misc_error.log`, })
    ],

    exitOnError: true,

});


// Logging Category for Analytics
container.add('analyticsLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'ANALYTICS', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'info', filename: `${logStore}/analytics.log`, })
    ],

    exitOnError: true,

});

// Logging Category for Route Logger
container.add('routeLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'ROUTELOGGER', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: logLv, }),
        new winston.transports
            .File({ level: 'http', filename: `${logStore}/routelogger.log`, })
    ],
    exitOnError: true,

});

//Export the Module
module.exports = (container);










