/*eslint-env node*/

//Dependencies
const mongoose = require('mongoose');

//Global Constant
const Schema = mongoose.Schema;

// Create Schema
const quoteSchema = new Schema({

    text: {
        type: String,
    },
    author: {
        type: String,
    },
    description: {
        type: String,
    },
    imgUrl: {
        type: String,
    },

}, {
    collection: 'Quotes',
});

module.exports = { quoteSchema, };
