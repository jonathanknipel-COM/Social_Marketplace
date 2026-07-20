const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const {getLoggedInUser} = require('../utils/auth');
const { TwitterApi } = require('twitter-api-v2');

// Initialize Twitter Client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

/*
 * helper: take a product and attach the category name + donor name using basic
 * findById lookups. this does by hand what mongoose's .populate() does for us.
 */
const buildProductView = async (product) => {
    const category = await Category.findById(product.categoryId);
    const donor = await User.findById(product.donatedBy);
    return {
        ...product.toObject(), //the product's own fields
        categoryName: category ? category.name : null,
        donorName: donor ? donor.fullName : null
    };
};

/* ============================================================
 *  SECTIONS 21 + 22 - FULL CRUD FOR PRODUCTS
 * ============================================================ */

/*CREATE - list a new product (section 25/26: only logged-in users)*/
const createProduct = async (req, res) => {
    try {
        const user = getLoggedInUser(req); //check the token ourselves
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }

        const {title, description, mediaPath, categoryId, address, city, location} = req.body;

        const newProduct = new Product({
            title,
            description,
            mediaPath,
            categoryId,
            address,
            city,
            location,
            donatedBy: user.id //the logged-in user is the one giving the item away
        });

        await newProduct.save();
        // --- NEW: TWITTER API INTEGRATION ---
        try {
            console.log(`[TWITTER] Attempting to tweet about new product: ${title}`);
            // await twitterClient.v2.tweet(`Check out our new item up for grabs: ${title} in ${city}!`);
        } catch (twitterError) {
            console.error("Twitter API Error (Non-Fatal):", twitterError.message);
        }
        // ------------------------------------
        res.status(201).json({message: "Product listed successfully", product: newProduct});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*READ (all) - browse every product (public)*/
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        /*add the category + donor names to each product, one by one*/
        const productsWithNames = [];
        for (const product of products) {
            productsWithNames.push(await buildProductView(product));
        }

        res.status(200).json({count: productsWithNames.length, products: productsWithNames});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*READ (one) - view a single product by its id (public)*/
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({message: "Product not found."});
        }
        res.status(200).json({product: await buildProductView(product)});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*UPDATE - edit a product (section 27: only the owner OR an admin)*/
const updateProduct = async (req, res) => {
    try {
        const user = getLoggedInUser(req);
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({message: "Product not found."});
        }

        /*
         * ownership check: a normal user can only edit their own products, admins can edit any.
         * donatedBy is an ObjectId, so we use its .equals() method to compare it to the id string.
         */
        if (!product.donatedBy.equals(user.id) && !user.isAdmin) {
            return res.status(403).json({message: "You can only edit products you uploaded."});
        }

        /*update only the fields that were actually sent in the request*/
        if (req.body.title !== undefined) product.title = req.body.title;
        if (req.body.description !== undefined) product.description = req.body.description;
        if (req.body.mediaPath !== undefined) product.mediaPath = req.body.mediaPath;
        if (req.body.categoryId !== undefined) product.categoryId = req.body.categoryId;
        if (req.body.status !== undefined) product.status = req.body.status;
        if (req.body.address !== undefined) product.address = req.body.address;
        if (req.body.city !== undefined) product.city = req.body.city;
        if (req.body.location !== undefined) product.location = req.body.location;

        await product.save();
        res.status(200).json({message: "Product updated successfully", product});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*DELETE - remove a product (section 27: only the owner OR an admin)*/
const deleteProduct = async (req, res) => {
    try {
        const user = getLoggedInUser(req);
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({message: "Product not found."});
        }

        /*same ownership rule as update*/
        if (!product.donatedBy.equals(user.id) && !user.isAdmin) {
            return res.status(403).json({message: "You can only delete products you uploaded."});
        }

        await product.deleteOne();
        res.status(200).json({message: "Product deleted successfully"});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/* ============================================================
 *  SECTION 23 - COMPLEX SEARCH (3 filters, all optional, exact match)
 *  example: /api/products/search?categoryId=...&city=Haifa&status=available
 * ============================================================ */
const searchProducts = async (req, res) => {
    try {
        const {categoryId, city, status} = req.query;

        /*build the filter step by step - only add a rule for the params that were sent*/
        const filter = {};
        if (categoryId) filter.categoryId = categoryId; //filter by product category
        if (city) filter.city = city;                   //filter by collection city
        if (status) filter.status = status;             //filter by status: available / ordered / delivered

        const products = await Product.find(filter);

        /*attach the names, same as the browse route*/
        const productsWithNames = [];
        for (const product of products) {
            productsWithNames.push(await buildProductView(product));
        }

        res.status(200).json({
            filtersApplied: {categoryId, city, status},
            count: productsWithNames.length,
            products: productsWithNames
        });

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/* ============================================================
 *  SECTION 24 - AGGREGATIONS (two GroupBy queries)
 * ============================================================ */

/*AGGREGATION 1 - group and count products by category*/
const countProductsByCategory = async (req, res) => {
    try {
        /*the GroupBy itself: count how many products are in each category*/
        const grouped = await Product.aggregate([
            {$group: {_id: "$categoryId", totalProducts: {$sum: 1}}},
            {$sort: {totalProducts: -1}} //biggest categories first
        ]);

        /*attach each category's name with a basic findById (instead of a $lookup join)*/
        const results = [];
        for (const row of grouped) {
            const category = await Category.findById(row._id);
            results.push({
                categoryId: row._id,
                categoryName: category ? category.name : "Unknown",
                totalProducts: row.totalProducts
            });
        }

        res.status(200).json({groupedBy: "category", results});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*AGGREGATION 2 - group and count DELIVERED (given-away) products by city and month*/
const countDeliveredByCityAndMonth = async (req, res) => {
    try {
        const results = await Product.aggregate([
            /*only look at products that were actually handed over*/
            {$match: {status: 'delivered'}},
            /*group by city + year + month, counting each group*/
            {$group: {
                _id: {
                    city: "$city",
                    year: {$year: "$updatedAt"},   //updatedAt = roughly when it became "delivered"
                    month: {$month: "$updatedAt"}
                },
                totalDelivered: {$sum: 1}
            }},
            /*oldest month first, then by city*/
            {$sort: {"_id.year": 1, "_id.month": 1, "_id.city": 1}}
        ]);

        res.status(200).json({groupedBy: "city + month (delivered products)", results});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    countProductsByCategory,
    countDeliveredByCityAndMonth
};
