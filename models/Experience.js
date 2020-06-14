//Dependencies
const mongoose = require('mongoose');

//Global Constant
const Schema = mongoose.Schema;

// Create Schema
const experienceSchema = new Schema({

    year: {
        type: String,
    },
    location: {
        type: String,
    },
    position: {
        type: String,
    },
    description: {
        type: String,
    },
    typeImageUrl: {
        type: String,
    },
    link: {
        type: String,
        default: '#',
    },
    hrefClass: {
        type: String,
        default: 'href_location',
    },
    creationDate: {
        type: Date,
        default: Date.now(),
    },

}, {
    collection: 'Experience',
});

module.exports = { experienceSchema, };