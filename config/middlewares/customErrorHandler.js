// Dependencies
const { promisify, } = require('util');

// Redis
const { redisClient, } = require('../dataBase/redisConnection');

// Promisify the redis get query
const getAsync = promisify(redisClient.GET).bind(redisClient);

// Custom Error Class
const ErrorResponse = require('../utils/customErrorClass');

// Winston
const miscLog = require('../system/log').get('miscLog');

// Error Names Map
const errMap = new Map([
    ['ValidationError', (errObj) => {
        // Parse the mongodb error object to get the name of the missing fields
        const paths = Object.values(errObj.errors).map(val => val.path);
        return `Missing or incorrect format for field: ${paths}`;
    }],
    ['CastError', () => undefined],
    ['MongoError', () => undefined],
    ['ReferenceError', () => undefined],
    ['SyntaxError', () => undefined],
    ['TypeError', () => undefined]

]);


// Error handling middleware
const errorHandler = async (err, req, res, next) => {

    // Log the error
    miscLog.error(`Path: ${req.path} | Stack: ${err.stack}`);

    // Make a copy of the error object
    let cErr = { ...err, };
    cErr.message = err.message;

    // Check for mongoose validation error
    if (err.name) {
        // Check if the error type exists in the map
        if (errMap.get(err.name)) {
            const message = errMap.get(err.name)(err);
            cErr = new ErrorResponse(message, 400);
        }
    }

    // Check for native mongodb error
    if (err.code) {
        const message = await getAsync(err.code);
        cErr = new ErrorResponse(message, 400);
    }

    // Send the response to the front end
    return res
        .status(cErr.statusCode || 500)
        .json({ msg: cErr.message || 'Server Error', });
};

module.exports = errorHandler;