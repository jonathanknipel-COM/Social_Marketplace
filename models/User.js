const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true //prevents people from logging in with the same email address.
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
        default: false //regular users are not admins by default.
    },

    itemsDonated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    itemsReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {timestamps: true}); //automatically create timestamps

module.exports = mongoose.model('User', userSchema);