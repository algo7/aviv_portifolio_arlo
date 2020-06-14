//Dependencies
const passport = require('passport');
const { Strategy: LocalStrategy, } = require('passport-local');

//Custom Modules
const { bcryptComp, } = require('./bcryptCustom');

//Winston
const authLog = require('../system/log').get('authLog');

//Load model for User_DB
const { User_DB, } = require('../dataBase/mongoConnection');

// Session
//Take in user id => keep the session data small
passport.serializeUser((id, done) => {
    done(null, id);
});

//Deserialize when needed by querying the DB for full user details
passport.deserializeUser((id, done) => {
    User_DB.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => authLog.error(`Error Deserializing User: ${id}:` + ' ' + err));
});

const passportLogic = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email', }, (email, password, done) => {

        //Lookup the user 
        User_DB.findOne({ email: email, })
            .then(userData => {

                //If the user does not exist
                if (!userData) {

                    return done(null, false);

                    //If the user exists
                }

                //Compare the password
                bcryptComp(password, userData.password, (err, cbBComp) => {

                    //Error handling
                    if (err) {
                        return done(err, false);
                    }

                    //If the password does not match
                    if (!cbBComp) {
                        return done(null, false);
                    }

                    //Return user id
                    return done(null, userData.id);

                });

            })
            .catch(err => authLog.error(`Error Looking Up User: ${err}`));
    }));
};

module.exports = { passportLogic, };