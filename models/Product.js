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

    buyerDetails: {
        type: {
            name: String,
            phone: String,
            date: String
        },
        default: null
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
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

    city: {
        type: String,
        required: true //collection city - used by the search (section 23) and aggregations (section 24)
    },

    location: {
        lat: {type: Number, required: true},
        long: {type: Number, required: true}
    },

    donatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);