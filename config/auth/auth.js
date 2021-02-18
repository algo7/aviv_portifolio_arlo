// Custom Modules
const { bcryptHash, } = require('./bcryptCustom');

// Winston
const authLog = require('../system/log').get('authLog');

// Custom Error Class
const ErrorResponse = require('../utils/customErrorClass');

// DB Connection
const { User_DB, } = require('../dataBase/mongoConnection');

//Global Constant
const StrValidation = /^(?=.*[0-9])(?=.*[!@#$%^&*.\/()\\{}[\]?<>:;"`~| ,-])[a-zA-Z0-9!@#$%^&*.\/()\\{}[\]?<>:;"`~| ,-_]{8,50}$/;

/**
* The registeration function
* @param {String} firstName - User's first name
* @param {String} lastName - User's last name
* @param {String} password - The password
* @param {String} passwordC - The password confirmation
* @param {String} email - User's email
* @returns {Promise}
*/
const registerFunc = async (firstName, lastName, password, passwordC, email) => {

    try {


        // Check if the password matches the the confirmation password
        if (password != passwordC) {
            throw new ErrorResponse('Password does not match', 400);
        }

        // Compare the pass to the pattern
        const matchPattern = password.match(StrValidation);

        // If the pass does not comply with the rule
        if (!matchPattern) {
            throw new ErrorResponse('Password too simple', 400);
        }

        const [userData, hash] = await Promise.all([

            // Query the DB
            await User_DB.findOne({ email: email, }),

            // Hash the password
            await bcryptHash(password)

        ]);

        // Check if the user exists already
        if (userData) {
            throw new ErrorResponse('User already exists', 409);
        }

        // Create the new user object
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            password: null,
            email: email,
        };

        // The the user object's password to the hash before saving
        newUser.password = hash;

        // Save the new user
        const newUserData = await User_DB(newUser).save();

        authLog.info(`New User Created:${newUserData.id}`);

    } catch (err) {
        // Rethrow the error
        throw (err);
    }

};


/**
* The password reset function
* @param {Object} updateObject - The object that contains the information to be updated
* @param {String} updateObject.firstName - User's first name
* @param {String} updateObject.lastName - User's last name
* @param {String} updateObject.password - The destination of the notification
* @param {String} updateObject.email - User's email
* @param {String} updateObject.birthDay - User's birth day 
* @param {String} updateObject.birthName - User's name
* @param {String} updateObject.location - User's location
* @param {String} updateObject.phone - User's phone
* @param {String} updateObject.interests - User's interests
* @param {String} updateObject.study - User's study
* @param {String} updateObject.degree - User's degree
* @param {String} updateObject.bio - User's bio
* @param {String} password - The password
* @param {String} passwordC - The password confirmation
* @param {String} id - User's id
* @returns {Promise}
*/
const resetFunc = async (updateObject, password, passwordC, id) => {

    try {

        // Check if the password matches
        if (password != passwordC) {
            throw new ErrorResponse('Password does not match', 400);
        }

        // Compare the pass to the pattern
        const matchPattern = password.match(StrValidation);

        // If the pass does not comply with the rule
        if (!matchPattern) {
            throw new ErrorResponse('Password too simple', 400);
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
        throw (err);
    }

};


/**
* The update user's info. function
* @param {Object} updateObject - The object that contains the information to be updated
* @param {String} updateObject.firstName - User's first name
* @param {String} updateObject.lastName - User's last name
* @param {String} updateObject.password - The destination of the notification
* @param {String} updateObject.email - User's email
* @param {String} updateObject.birthDay - User's birth day 
* @param {String} updateObject.birthName - User's name
* @param {String} updateObject.location - User's location
* @param {String} updateObject.phone - User's phone
* @param {String} updateObject.interests - User's interests
* @param {String} updateObject.study - User's study
* @param {String} updateObject.degree - User's degree
* @param {String} updateObject.bio - User's bio
* @param {String} id - User's id
* @returns {Promise}
*/
const updateFunc = async (updateObject, id) => {

    try {

        // Update the db
        const result = await User_DB
            .updateOne({ _id: id, }, updateObject)
            .lean();

        authLog.info(`Updated: ${result.nModified}`);


    } catch (err) {
        // Rethrow the error
        throw (err);
    }
};

module.exports = { registerFunc, resetFunc, updateFunc, };