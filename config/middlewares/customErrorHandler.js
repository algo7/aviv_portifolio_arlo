// Error handling middleware
const errorHandler = (err, req, res) => {

    // Send the response to the front end
    res
        .status(err.statusCode || 500)
        .json({ msg: err.message || 'Server Error', });
};

module.exports = errorHandler;