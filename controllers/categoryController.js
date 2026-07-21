const Category = require('../models/Category');
const User = require('../models/User');
const {getLoggedInUser} = require('../utils/auth');

/*helper: attach the creator's name with a basic findById (does .populate()'s job by hand)*/
const buildCategoryView = async (category) => {
    const creator = await User.findById(category.createdBy);
    return {
        ...category.toObject(),
        createdByName: creator ? creator.fullName : null
    };
};

/* ============================================================
 *  SECTIONS 21 + 22 - FULL CRUD FOR CATEGORIES
 *  section 27: creating / editing / deleting is ADMIN ONLY.
 *  browsing is open to everyone.
 * ============================================================ */

/*CREATE - add a new category (admin only)*/
const createCategory = async (req, res) => {
    try {
        const user = getLoggedInUser(req);
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }
        if (!user.isAdmin) {
            return res.status(403).json({message: "Only admins can manage categories."});
        }

        const {name, description} = req.body;

        /*don't allow two categories with the same name*/
        const existing = await Category.findOne({name});
        if (existing) {
            return res.status(400).json({message: "A category with this name already exists."});
        }

        const newCategory = new Category({
            name,
            description,
            createdBy: user.id //the admin who created it
        });

        await newCategory.save();
        res.status(201).json({message: "Category created successfully", category: newCategory});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*READ (all) - list every category (public)*/
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const categoriesWithNames = [];
        for (const category of categories) {
            categoriesWithNames.push(await buildCategoryView(category));
        }

        res.status(200).json({count: categoriesWithNames.length, categories: categoriesWithNames});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*READ (one) - get a single category by id (public)*/
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({message: "Category not found."});
        }
        res.status(200).json({category: await buildCategoryView(category)});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*UPDATE - edit a category (admin only)*/
const updateCategory = async (req, res) => {
    try {
        const user = getLoggedInUser(req);
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }
        if (!user.isAdmin) {
            return res.status(403).json({message: "Only admins can manage categories."});
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({message: "Category not found."});
        }

        if (req.body.name !== undefined) category.name = req.body.name;
        if (req.body.description !== undefined) category.description = req.body.description;

        await category.save();
        res.status(200).json({message: "Category updated successfully", category});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*DELETE - remove a category (admin only)*/
const deleteCategory = async (req, res) => {
    try {
        const user = getLoggedInUser(req);
        if (!user) {
            return res.status(401).json({message: "Please log in first."});
        }
        if (!user.isAdmin) {
            return res.status(403).json({message: "Only admins can manage categories."});
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({message: "Category not found."});
        }

        await category.deleteOne();
        res.status(200).json({message: "Category deleted successfully"});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
