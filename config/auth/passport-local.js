// Dependencies
const passport = require('passport');
const { Strategy: LocalStrategy, } = require('passport-local');

// Custom Modules
const { bcryptComp, } = require('./bcryptCustom');

// Winston
const authLog = require('../system/log').get('authLog');

// Load model for User_DB
const { User_DB, } = require('../dataBase/mongoConnection');

// Session
// Take in user id => keep the session data small
passport.serializeUser((id, done) => {
    done(null, id);
});

// Deserialize when needed by querying the DB for full user details
passport.deserializeUser(async (id, done) => {

    try {

        const user = await User_DB.findById(id);
        return done(null, user);

    } catch (err) {
        authLog.error(`Error Deserializing User: ${id}: ${err}`);
    }

});

const passportLogic = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email', }, async (email, password, done) => {

        try {

            // Lookup the user 
            const userData = await User_DB.findOne({ email: email, });

            // If the user does not exist
            if (!userData) {
                return done(null, false);
                // If the user exists
            }

            // Compare the password
            const passwordMatched = await bcryptComp(password, userData.password);

            // If the password does not match
            if (!passwordMatched) {
                return done(null, false);
            }

            // Return the user id
            return done(null, userData.id);

        } catch (err) {
            authLog.error(`Error Looking Up User: ${err}`);
            return done(err, false);
        }

    }));
};

module.exports = { passportLogic, };