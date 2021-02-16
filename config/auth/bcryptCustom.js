// Dependencies
const bcrypt = require('bcrypt');

// Winston
const authLog = require('../system/log').get('authLog');

// Global Constant
const saltRounds = 10;

// Bcrypt Hashing Function
const bcryptHash = async (password) => {

    try {
        // Hash the password
        const hash = await bcrypt.hash(password, saltRounds);

        return hash;

    } catch (err) {
        // Rethrow the error
        throw (`Error Hashing the Password: ${err}`);
    }

};


// Bcrypt Compare Functions
const bcryptComp = async (plainText, dbHash) => {

    try {
        // Compare the password
        const passwordMatched = await bcrypt.compare(plainText, dbHash);
        return passwordMatched;

    } catch (err) {
        // Rethrow the error
        throw (`Error Matching Password: ${err}`);
    }
};


module.exports = { bcryptHash, bcryptComp, };