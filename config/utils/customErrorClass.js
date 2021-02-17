class ErrorResponse extends Error {
    constructor(message, statusCode, type) {
        // Call the Error constructor and pass in our err message
        super(message);
        this.statusCode = statusCode;
        this.type = type;
    }
}

module.exports = ErrorResponse;
