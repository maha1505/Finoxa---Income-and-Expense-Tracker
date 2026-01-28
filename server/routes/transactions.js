const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions, deleteTransaction, getDashboardData, getReportsData, updateRegretStatus } = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/transactions
// @desc    Add new transaction
// @access  Private
router.post('/', auth, addTransaction);

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', auth, getTransactions);

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, deleteTransaction);

// @route   PUT api/transactions/regret/:id
// @desc    Update regret status
// @access  Private
router.put('/regret/:id', auth, updateRegretStatus);

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', auth, require('../controllers/transactionController').updateTransaction);

// @route   GET api/transactions/dashboard
// @desc    Get dashboard totals
// @access  Private
router.get('/dashboard', auth, getDashboardData);

// @route   GET api/transactions/reports
// @desc    Get report data
// @access  Private
router.get('/reports', auth, getReportsData);

module.exports = router;
