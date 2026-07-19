const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    countProductsByCategory,
    countDeliveredByCityAndMonth
} = require('../controllers/productController');

/*
 * NOTE ON ORDER: the specific routes (/search, /stats/...) must come BEFORE "/:id",
 * otherwise express would think "search" is an id and send it to getProductById.
 */

/*--- section 23: complex search (public browsing) ---*/
router.get('/search', searchProducts);

/*--- section 24: aggregations (public stats) ---*/
router.get('/stats/by-category', countProductsByCategory);
router.get('/stats/delivered-by-city-month', countDeliveredByCityAndMonth);

/*--- sections 21+22: basic CRUD ---*/
router.get('/', getAllProducts);        //browse all - public
router.get('/:id', getProductById);     //view one - public

/*login (25/26), ownership + admin (27) are all checked inside the controllers*/
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
