const dotenv = require('dotenv');
// dotenv
if (process.env.NODE_ENV === 'production') {
    const env = dotenv.config({ path: `${__dirname}/cred_prod.env`, });
    module.exports = env.parsed;
} else {
    const env = dotenv.config({ path: `${__dirname}/cred.env`, });
    module.exports = env.parsed;
}
