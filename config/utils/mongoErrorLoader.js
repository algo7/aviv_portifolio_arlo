// Dependencies
const { promisify, } = require('util');

// Redis
const { redisClient, } = require('../dataBase/redisConnection');

// Promisify the redis get query
const setAsync = promisify(redisClient.SET).bind(redisClient);

// Mongo error dataset
const data = require('./mongoError.json');
const codeNamePair = data.error_codes.map(codes => { return [codes.code, codes.name]; });

// Call the loadData function
loadData();

/**
* Load the mongo error json into redis
* @returns {Promise<undefined>}
*/
async function loadData() {
    await Promise.all([
        codeNamePair
            .map(async pair => { await setAsync(pair[0], pair[1]); })
    ]);
} 