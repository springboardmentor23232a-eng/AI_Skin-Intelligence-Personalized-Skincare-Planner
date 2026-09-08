const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listIngredients, getIngredient, getMyIngredientInsights } = require('../controllers/ingredientController');

const router = express.Router();

// Personalized route must be registered before the /:id route so
// "for-me" isn't swallowed by the :id param matcher.
router.get('/for-me', protect, getMyIngredientInsights);
router.get('/', listIngredients);
router.get('/:id', getIngredient);

module.exports = router;
