//Dependencies
const winston = require('winston');
const path = require('path');

//Global variables
let readableDate = () => {
    return new Date(Date.now()).toUTCString();
};

//Log store path
const logStore = path.join(__dirname, '../logs');

//Custom Log Format
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


//Container for Multiple Loggers
const container = new winston.Container();

//Logging Category for app.js
container.add('appLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'APP', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/app_error.log`, })
    ],
    exceptionHandlers: [
        new winston.transports.Console({ level: 'silly', }),
        new winston.transports
            .File({ filename: `${logStore}/app_exception.log`, })
    ],
    exitOnError: false,

});

//Logging Category for mongoConnection.js
container.add('mongoLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'MONGO', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/mongo_error.log`, })
    ],
    exceptionHandlers: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ filename: `${logStore}/redis_exception.log`, })
    ],
    exitOnError: false,

});

//Logging Category for redisConnection.js
container.add('redisLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'REDIS', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/redis_error.log`, })
    ],
    exceptionHandlers: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ filename: `${logStore}/redis_exception.log`, })
    ],
    exitOnError: false,

});


//Logging Category for Auth-related tasks
container.add('authLog', {
    format: winston.format.combine(
        winston.format.label({ label: 'AUTH', }),
        logFormat
    ),
    transports: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ level: 'error', filename: `${logStore}/auth_error.log`, })
    ],
    exceptionHandlers: [
        new winston.transports
            .Console({ level: 'silly', }),
        new winston.transports
            .File({ filename: `${logStore}/auth_exception.log`, })
    ],
    exitOnError: false,

});

//Export the Module
module.exports = (container);










