// Custom Error Class
const ErrorResponse = require('../utils/customErrorClass');

// Winston
const miscLog = require('../system/log').get('miscLog');

// Error handling middleware
const errorHandler = (err, req, res, next) => {

    // Log the error
    miscLog.error(`Path: ${err.path} | ${err.devError} | ${err.stack}`);

    // Make a copy of the error object
    let cErr = { ...err, };
    cErr.message = err.message;
    const { name, } = err;
    console.error(name);

    // Send the response to the front end
    res
        .status(err.statusCode || 500)
        .json({ msg: err.message || 'Server Error', });
};

module.exports = errorHandler;