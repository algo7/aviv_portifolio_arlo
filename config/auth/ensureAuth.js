const EnsureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/notice');
    }
};

module.exports = { EnsureAuthenticated, };