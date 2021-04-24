// Dependencies
const mongoose = require('mongoose');

// Global Constant
const Schema = mongoose.Schema;

// Create Schema
const experienceSchema = new Schema({
    type: {
        type: String,
        enum: ['study', 'work'],
        require: true,
    },
    section: {
        type: String,
        enum: ['hotelier', 'developer', 'martial artist'],
        require: true,
    },
    year: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    typeImageUrl: {
        type: String,
        require: true,
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