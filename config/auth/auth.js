//Custom Modules
const { bcryptHash, } = require('./bcryptCustom');

//Winston
const authLog = require('../system/log').get('authLog');

//DB Connection
const { User_DB, } = require('../dataBase/mongoConnection');

//Global Constant
const StrValidation = /^(?=.*[0-9])(?=.*[!@#$%^&*.\/()\\{}[\]?<>:;"`~| ,-])[a-zA-Z0-9!@#$%^&*.\/()\\{}[\]?<>:;"`~| ,-_]{8,50}$/;

//The registeration function
const registerFunc = async (firstName, lastName, password, passwordC, email) => {

    //The error array
    let errArray = [];

    //Check if the password matches
    if (password != passwordC) {
        errArray.push('Password does not match');
    }

    //Compare the pass to the pattern
    let matchPattern = password.match(StrValidation);

    //If the pass does not comply with the rule
    if (!matchPattern) {
        errArray.push('Password too simple');
    }

    //Query the DB
    const userData = await User_DB.findOne({ email: email, });

    //Check if the user exists already
    if (userData) {
        errArray.push('User already exists');
    }

    //Create the new user object
    const newUser = {
        firstName: firstName,
        lastName: lastName,
        password: null,
        email: email,
    };

    //Hash the password
    bcryptHash(password, (err, cbBHash) => {

        if (err) {
            authLog.error('Error Hasing Password' + ' ' + err);
            errArray.push('Error hasing password');
        }

        //The the user object's password to the hash before saving
        newUser.password = cbBHash;

        //Save the new user
        new User_DB(newUser)
            .save()
            .then(newUserData => {
                authLog.info(`New User Created:${newUserData.id}`);
            })
            .catch(err => {
                authLog.error(`Error Saving New User: ${err}`);
                errArray.push('Error saving new user');
            });
    });

    if (errArray.length !== 0) {
        return errArray;
    }

};


// The reset function
const resetFunc = async (updateObject, password, passwordC, id) => {

    try {

        // Check if the password matches
        if (password != passwordC) {
            throw ('Password does not match');
        }

        // Compare the pass to the pattern
        const matchPattern = password.match(StrValidation);

        // If the pass does not comply with the rule
        if (!matchPattern) {
            throw ('Password too simple');
        }

        // Hash the password
        const hash = await bcryptHash(password);

        // The the user object's password to the hash before saving
        updateObject.password = hash;

        // Update the db
        const result = await User_DB
            .updateOne({ _id: id, }, updateObject)
            .lean();

        authLog.info(`Updated: ${result.nModified}`);

    } catch (err) {
        // Rethrow the error
        throw (`Error Updating User: ${err}`);
    }

};

// The update function
const updateFunc = async (updateObject, id) => {

    try {

        // Update the db
        const result = await User_DB
            .updateOne({ _id: id, }, updateObject)
            .lean();

        authLog.info(`Updated: ${result.nModified}`);


    } catch (err) {
        // Rethrow the error
        throw (`Error Updating User: ${err}`);
    }
};

module.exports = { registerFunc, resetFunc, updateFunc, };