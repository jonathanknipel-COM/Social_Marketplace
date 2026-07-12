const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    mediaPath: {
        type: String //link to picture or image of the product being given away
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required = true
    },

    status: {
        type: String,
        enum: ['available', 'ordered', 'delivered'],
        default: 'available' //all products are available by default
    },

    address: {
        type: String,
        required: true
    },

    location: {
        lat: {type: Number, required: true},
        long: {type: Number, required: true}
    },

    donatedBy: {
        type: mongoose.Types.Schema.ObjectId,
        ref: 'User',
        required: True
    }

}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);