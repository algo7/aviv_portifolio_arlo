class ErrorResponse extends Error {
    constructor(message, statusCode, path, devError) {
        // Call the Error constructor and pass in our err message
        super(message);
        this.statusCode = statusCode;
        this.path = path;
        this.devError = devError;
    }
}

module.exports = ErrorResponse;
