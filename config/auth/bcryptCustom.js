// Dependencies
const bcrypt = require('bcrypt');

// Global Constant
const saltRounds = 10;


/**
* Bcrypt Hashing Function
* @param {String} password - The password to be hashed
* @returns {String} The hash
*/
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


/**
* Bcrypt Compare Function
* @param {String} plainText - The plaintext password to be compared
* @param {String} dbHash - The password hash from the database
* @returns {Boolean} If the password matches the hash or not
*/
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