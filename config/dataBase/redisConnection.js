
//Dependencies
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const { Redis_Pass, } = require('../../creds/env');

//Winston
const redisLog = require('../system/log').get('redisLog');

//Connect to Redis
const client = redis.createClient({
    host: '127.0.0.1',
    port: '6379',
    password: Redis_Pass,
})
    .once('connect', () => redisLog.info('Redis Connected'))
    .on('error', err => redisLog.error('Redis Connection Error: ' + err));


//Export the Module
module.exports = { RedisStore, client, session, };