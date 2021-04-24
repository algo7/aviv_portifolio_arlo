// Dependencies
const dotenv = require('dotenv');

// dotenv
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: `${__dirname}/cred.env`, });
}