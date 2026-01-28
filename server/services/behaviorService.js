const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Streak = require('../models/Streak');
const FutureSelfLetter = require('../models/FutureSelfLetter');
const moment = require('moment');

/**
 * Evaluates the streak for a user for a specific date (YYYY-MM-DD)
 */
exports.evaluateDailyStreak = async (userId, dateStr) => {
    try {
        const startOfDay = moment(dateStr).startOf('day').toDate();
        const endOfDay = moment(dateStr).endOf('day').toDate();
        const monthStr = moment(dateStr).format('YYYY-MM');

        const dayTransactions = await Transaction.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
            type: 'expense'
        });

        // Rule: Stay within daily budget
        const monthlyBudgets = await Budget.find({ user: userId, month: monthStr });
        const totalMonthlyBudget = monthlyBudgets.reduce((acc, b) => acc + b.limit, 0);

        const daysInMonth = moment(dateStr).daysInMonth();
        const dailyBudgetLimit = totalMonthlyBudget > 0 ? (totalMonthlyBudget / daysInMonth) : Infinity;

        const dailyTotalExpense = dayTransactions.reduce((acc, t) => acc + t.amount, 0);

        // Reset streak if overspend
        const isQualified = dailyTotalExpense <= dailyBudgetLimit;
        const evalDate = moment(dateStr).startOf('day');

        let streak = await Streak.findOne({ user: userId });
        if (!streak) {
            streak = new Streak({ user: userId });
        }

        if (isQualified) {
            // Only increment if we haven't already incremented for this day OR a future day
            if (!streak.lastEvaluatedDate || moment(streak.lastEvaluatedDate).isBefore(evalDate, 'day')) {
                // If it's been more than 1 day since last evaluation (and it wasn't a reset), 
                // we might need more complex logic, but for simple reactive triggers:
                streak.currentStreak += 1;
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
                streak.lastEvaluatedDate = dateStr;
            }
        } else {
            // RESET streak only if budget is set AND exceeded
            if (totalMonthlyBudget > 0) {
                streak.currentStreak = 0;
                streak.lastEvaluatedDate = dateStr;
            }
        }

        streak.lastEvaluatedDate = dateStr;
        await streak.save();

        return streak;
    } catch (err) {
        console.error('Error evaluating streak:', err);
        throw err;
    }
};

/**
 * Generates/Updates a Future Self Letter for a user for a given month (YYYY-MM)
 */
exports.generateMonthlyLetter = async (userId, monthStr) => {
    try {
        const now = moment();
        const isEndOfMonth = now.isSame(moment(monthStr, 'YYYY-MM').endOf('month'), 'day');

        const transactions = await Transaction.find({
            user: userId,
            date: {
                $gte: moment(monthStr, 'YYYY-MM').startOf('month').toDate(),
                $lte: moment(monthStr, 'YYYY-MM').endOf('month').toDate()
            }
        });

        if (transactions.length === 0) {
            return {
                content: "Welcome to your financial journey. Your future self is waiting to see your progress. Start by logging your first transaction!",
                month: monthStr
            };
        }

        const expenses = transactions.filter(t => t.type === 'expense');
        const regretCount = expenses.filter(t => t.regretStatus === 'Regret').length;
        const worthItCount = expenses.filter(t => t.regretStatus === 'Worth it').length;

        const streak = await Streak.findOne({ user: userId });

        let content = `Dear Future Self,\n\n`;

        if (isEndOfMonth) {
            content += `Reflecting on ${moment(monthStr, 'YYYY-MM').format('MMMM YYYY')}, I've completed another chapter. `;
            if (regretCount > 0) {
                content += `I learned from ${regretCount} regrets. `;
            }
            if (streak && streak.currentStreak > 10) {
                content += `My consistency reached ${streak.currentStreak} days! `;
            }
            content += `\n\nEvery choice made this month was a step toward who you are now.\n\nWith discipline,\nYour Past Self`;
        } else {
            // Mid-month suggestion
            content += `I'm currently navigating ${moment(monthStr, 'YYYY-MM').format('MMMM YYYY')}. `;
            if (worthItCount > regretCount) {
                content += `I'm making mostly "Worth it" choices so far. Keep this momentum! `;
            } else if (regretCount > 0) {
                content += `I've had a few regrets, but I'm learning to be more mindful. `;
            } else {
                content += `I'm staying disciplined and focused. `;
            }
            content += `\n\nYour future is being built today. One transaction at a time.\n\nStay focused,\nYour Present Self`;
        }

        // Update existing or create new
        let letter = await FutureSelfLetter.findOne({ user: userId, month: monthStr });
        if (letter) {
            letter.content = content;
        } else {
            letter = new FutureSelfLetter({
                user: userId,
                month: monthStr,
                content
            });
        }

        await letter.save();
        return letter;
    } catch (err) {
        console.error('Error generating letter:', err);
        throw err;
    }
};
