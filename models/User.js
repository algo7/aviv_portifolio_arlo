//Dependencies
const mongoose = require('mongoose');

//Global Constant
const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema({

    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    birthDay: {
        type: String,
        required: true,
    },
    birthName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    interests: {
        type: String,
        required: true,
    },
    study: {
        type: String,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
        default: 'img/about/3.jpg',
    },

}, {
    collection: 'Users',
});

module.exports = { userSchema, };
