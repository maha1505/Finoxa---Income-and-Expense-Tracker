const Budget = require('../models/Budget');

// @desc    Get all budgets for logged in user (optional filter by month)
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
    try {
        const { month } = req.query;
        let query = { user: req.user.id };
        if (month) query.month = month;

        const budgets = await Budget.find(query);
        res.json(budgets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add or Update budget for a category/month
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res) => {
    const { category, limit, month } = req.body;

    try {
        // Check if budget exists for this category/month
        let budget = await Budget.findOne({ user: req.user.id, category, month });

        if (budget) {
            // Update
            budget.limit = limit;
            await budget.save();
            return res.json(budget);
        }

        // Create new
        budget = new Budget({
            user: req.user.id,
            category,
            limit,
            month
        });

        await budget.save();
        res.json(budget);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
    try {
        let budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ msg: 'Budget not found' });
        if (budget.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Budget.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Budget removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
