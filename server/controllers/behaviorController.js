const FutureSelfLetter = require('../models/FutureSelfLetter');
const Streak = require('../models/Streak');
const Transaction = require('../models/Transaction');
const behaviorService = require('../services/behaviorService');
const moment = require('moment');

exports.getLatestLetter = async (req, res) => {
    try {
        let letter = await FutureSelfLetter.findOne({ user: req.user.id }).sort({ month: -1 });

        // If no letter exists or the latest letter is not for the current month, generate one
        const currentMonth = moment().format('YYYY-MM');
        if (!letter || letter.month !== currentMonth) {
            letter = await behaviorService.generateMonthlyLetter(req.user.id, currentMonth);
        }

        res.json(letter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getArchivedLetters = async (req, res) => {
    try {
        const letters = await FutureSelfLetter.find({ user: req.user.id }).sort({ month: -1 });
        res.json(letters);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStreak = async (req, res) => {
    try {
        let streak = await Streak.findOne({ user: req.user.id });
        if (!streak) {
            streak = new Streak({ user: req.user.id });
            await streak.save();
        }
        res.json(streak);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getRegretScores = async (req, res) => {
    try {
        const { duration } = req.query; // 'day', 'month', 'year' or empty for all
        let dateFilter = {};

        if (duration === 'day') {
            dateFilter = { $gte: moment().startOf('day').toDate() };
        } else if (duration === 'month') {
            dateFilter = { $gte: moment().startOf('month').toDate() };
        }

        const transactions = await Transaction.find({
            user: req.user.id,
            type: 'expense',
            regretStatus: { $ne: null },
            ...(duration && { date: dateFilter })
        });

        const total = transactions.length;
        const regrets = transactions.filter(t => t.regretStatus === 'Regret').length;
        const worthIts = transactions.filter(t => t.regretStatus === 'Worth it').length;

        // Category wise
        const categoryRegret = {};
        transactions.forEach(t => {
            if (!categoryRegret[t.category]) {
                categoryRegret[t.category] = { total: 0, regrets: 0 };
            }
            categoryRegret[t.category].total += 1;
            if (t.regretStatus === 'Regret') {
                categoryRegret[t.category].regrets += 1;
            }
        });

        res.json({
            score: total > 0 ? (worthIts / total) * 100 : 100,
            regretPercentage: total > 0 ? (regrets / total) * 100 : 0,
            totalEvaluated: total,
            categoryRegret
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Internal test endpoints
exports.triggerEvaluation = async (req, res) => {
    try {
        const date = req.body.date || moment().format('YYYY-MM-DD');
        const streak = await behaviorService.evaluateDailyStreak(req.user.id, date);
        res.json(streak);
    } catch (err) {
        console.error(err.message); // Kept this line as it's good practice
        res.status(500).send('Server Error');
    }
};

exports.triggerLetterGeneration = async (req, res) => {
    try {
        const month = req.body.month || moment().format('YYYY-MM');
        const letter = await behaviorService.generateMonthlyLetter(req.user.id, month);
        res.json(letter);
    } catch (err) {
        console.error(err.message); // Kept this line as it's good practice
        res.status(500).send('Server Error');
    }
};
