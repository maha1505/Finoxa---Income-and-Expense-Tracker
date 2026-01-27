const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budgetController');

router.get('/', auth, getBudgets);
router.post('/', auth, setBudget);
router.delete('/:id', auth, deleteBudget);

module.exports = router;
