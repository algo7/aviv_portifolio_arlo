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
        authLog.error(`Error Hashing the Password: ${err}`);
    }

};


// Bcrypt Compare Functions
const bcryptComp = (plainText, dbHash, cbBComp) => {

    // Compare the password
    bcrypt.compare(plainText, dbHash)
        .then(passwordMatch => cbBComp(null, passwordMatch))
        .catch(err => {
            cbBComp(new Error('GG'));
            authLog.error(`Error Matching Password: ${err}`);
        });
};


module.exports = { bcryptHash, bcryptComp, };