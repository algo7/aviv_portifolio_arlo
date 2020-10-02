//Dependencies
const mongoose = require('mongoose');

//Winston
const mongoLog = require('../system/log').get('mongoLog');

//Connect to DB (Main)
const DB_Connection = mongoose.createConnection(process.env.Mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

DB_Connection
    .once('open', () => mongoLog.info('MongoDB Connected'))
    .catch(err => mongoLog.error('Error Connecting to DB' + ' ' + err));


//Require Models for DB
const { quoteSchema, } = require('../../models/Quote');
const { experienceSchema, } = require('../../models/Experience');
const { userSchema, } = require('../../models/User');

//Load Models
const Quote_DB = DB_Connection.model('quote', quoteSchema);
const Experience_DB = DB_Connection.model('experience', experienceSchema);
const User_DB = DB_Connection.model('user', userSchema);

module.exports = { Quote_DB, Experience_DB, User_DB, };