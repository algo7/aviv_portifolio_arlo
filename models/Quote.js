// Dependencies
const mongoose = require('mongoose');

// Global Constant
const Schema = mongoose.Schema;

// Create Schema
const quoteSchema = new Schema({
    type: {
        type: String,
        enum: ['hotelier', 'developer', 'martial_artist'],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },

}, {
    collection: 'Quotes',
});

module.exports = { quoteSchema, };
