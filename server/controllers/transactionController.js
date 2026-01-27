const Transaction = require('../models/Transaction');
const moment = require('moment');

exports.addTransaction = async (req, res) => {
    const { type, amount, category, description, date, isRecurring, frequency } = req.body;
    try {
        const newTransaction = new Transaction({
            user: req.user.id,
            type,
            amount,
            category,
            description,
            date,
            isRecurring,
            frequency
        });
        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTransaction = async (req, res) => {
    const { type, amount, category, description, date, isRecurring, frequency } = req.body;
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        transaction = await Transaction.findByIdAndUpdate(req.params.id, { $set: { type, amount, category, description, date, isRecurring, frequency } }, { new: true });
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = totalIncome - totalExpense;

        // Insights Calculation
        const now = moment();
        const currentMonth = now.format('YYYY-MM');
        const lastMonth = now.subtract(1, 'months').format('YYYY-MM');

        const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === lastMonth).reduce((acc, t) => acc + t.amount, 0);

        let expenseChange = 0;
        if (lastMonthExpenses > 0) {
            expenseChange = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        }

        res.json({
            totalIncome,
            totalExpense,
            balance,
            currentMonthExpenses,
            lastMonthExpenses,
            expenseChange,
            transactions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getReportsData = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        const incomeCategories = {};
        const expenseCategories = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
            } else {
                expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
            }
        });

        res.json({
            incomeCategories,
            expenseCategories
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
