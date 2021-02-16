// Winston Logger
const routeLog = require('../system/log').get('routeLog');

// The route logger function
const routeLogger = (req, res, next) => {

    // Get the path
    const { method, url, } = req;

    // Route type
    let routeType = null;

    // User ID
    let userId = null;

    // Check if the route is private and if the user is authed
    if (req.isAuthenticated()) {
        routeType = 'Private';
        userId = req.user._id;
    } else {
        routeType = 'Public';
    }

    // Status Code
    const statusCode = res.statusCode;

    // Log the route visited
    routeLog.http(`${routeType}:${method}:${url}:${userId}:${statusCode}`);

    // Move to the next middleware
    next();
};

// Export the functions
module.exports = { routeLogger, };