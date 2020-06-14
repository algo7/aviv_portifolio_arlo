//Dependencies
const mongoose = require('mongoose');

//Global Constant
const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema({

    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    bio: {
        type: String,
    },
    birthDay: {
        type: String,
    },
    birthName: {
        type: String,
    },
    location: {
        type: String,
    },
    phone: {
        type: String,
    },
    interests: {
        type: String,
    },
    study: {
        type: String,
    },
    degree: {
        type: String,
    },

}, {
    collection: 'Users',
});

module.exports = { userSchema, };
