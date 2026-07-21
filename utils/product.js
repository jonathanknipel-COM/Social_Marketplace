const Category = require('../models/Category');
const User = require('../models/User');

/*
 * helper: take a product and attach the category name + donor name using basic
 * findById lookups. this does by hand what mongoose's .populate() does for us.
 */
module.exports.buildProductView = async (product) => {
    const category = await Category.findById(product.categoryId);
    const donor = await User.findById(product.donatedBy);
    return {
        ...product.toObject(), //the product's own fields
        categoryName: category ? category.name : null,
        donorName: donor ? donor.fullName : null
    };
};