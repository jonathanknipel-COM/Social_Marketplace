const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    itemsDonated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    itemsReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);