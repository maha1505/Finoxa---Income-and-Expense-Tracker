const Transaction = require('../models/Transaction');
const behaviorService = require('../services/behaviorService');
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

        // Reactive Behavior Update
        await behaviorService.evaluateDailyStreak(req.user.id, moment(date).format('YYYY-MM-DD'));

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

        const deletedDate = transaction.date;
        await Transaction.findByIdAndDelete(req.params.id);

        // Reactive Behavior Update
        await behaviorService.evaluateDailyStreak(req.user.id, moment(deletedDate).format('YYYY-MM-DD'));

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

        // Reactive Behavior Update
        await behaviorService.evaluateDailyStreak(req.user.id, moment(date).format('YYYY-MM-DD'));

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
        const lastMonth = moment().subtract(1, 'months').format('YYYY-MM');

        const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === lastMonth).reduce((acc, t) => acc + t.amount, 0);

        let expenseChange = 0;
        if (lastMonthExpenses > 0) {
            expenseChange = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        }

        // Regret Index: Find transactions 24-48 hours old that are NOT evaluated
        const evaluationStart = moment().subtract(48, 'hours');
        const evaluationEnd = moment().subtract(24, 'hours');

        const pendingRegretEvaluations = transactions.filter(t =>
            t.type === 'expense' &&
            !t.regretStatus &&
            moment(t.date).isBetween(evaluationStart, evaluationEnd)
        );

        res.json({
            stats: {
                totalIncome,
                totalExpense,
                budgetBalance: balance,
                totalBudget: 0, // Will be updated by frontend or additional logic
                expenseChange
            },
            recentTransactions: transactions,
            pendingRegretEvaluations
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateRegretStatus = async (req, res) => {
    const { regretStatus } = req.body;
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        transaction.regretStatus = regretStatus;
        transaction.regretEvaluatedAt = Date.now();
        await transaction.save();

        res.json(transaction);
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
        const regretStats = {
            'Worth it': 0,
            'Neutral': 0,
            'Regret': 0
        };
        const categoryRegret = {}; // category -> { Worth it: count, Neutral: count, Regret: count }

        transactions.forEach(t => {
            if (t.type === 'income') {
                incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
            } else {
                expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;

                if (t.regretStatus) {
                    regretStats[t.regretStatus]++;

                    if (!categoryRegret[t.category]) {
                        categoryRegret[t.category] = { 'Worth it': 0, 'Neutral': 0, 'Regret': 0 };
                    }
                    categoryRegret[t.category][t.regretStatus]++;
                }
            }
        });

        res.json({
            incomeCategories,
            expenseCategories,
            regretStats,
            categoryRegret
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
