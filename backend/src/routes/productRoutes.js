const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listProducts, getProduct, getMyRecommendations, compareProducts } = require('../controllers/productController');

const router = express.Router();

// NOTE: '/recommendations' and '/compare' must be registered before the
// '/:id' route below, or Express would try to match them as a product id
// (e.g. GET /api/products/compare would otherwise hit getProduct with
// id="compare") and fail param validation instead of running the intended
// handler.
router.get('/recommendations', protect, getMyRecommendations);
router.get('/compare', protect, compareProducts);
router.get('/', listProducts);
router.get('/:id', getProduct);

module.exports = router;
