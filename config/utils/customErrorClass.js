class ErrorResponse extends Error {
    constructor(message, statusCode) {
        // Call the Error constructor and pass in our err message
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;
