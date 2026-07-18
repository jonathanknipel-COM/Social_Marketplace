const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

/*--- browsing is open to everyone ---*/
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

/*--- section 27: the admin check happens inside these controllers ---*/
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
