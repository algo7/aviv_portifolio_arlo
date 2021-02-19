/**
 * Custom error response class
 * @extends Error - The native NodeJs error class
 */
class ErrorResponse extends Error {
    /**
   * Create a new error object
   * @param {String} message - The error message.
   * @param {Number} statusCode - The HTTP status code.
   * @param {Boolean} logStack - Log the stack trace or not.
   */
    constructor(message, statusCode, logStack) {
        // Call the Error constructor and pass in our err message
        super(message);
        // The error code
        this.statusCode = statusCode;
        // Log the stack trace or not
        this.logStack = logStack;
    }
}

module.exports = ErrorResponse;
