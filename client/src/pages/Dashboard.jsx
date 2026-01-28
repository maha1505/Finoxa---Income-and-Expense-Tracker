import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';
import {
    FaWallet, FaMoneyBillWave, FaChartLine, FaFilter, FaSort,
    FaPlus, FaEdit, FaTrash, FaUtensils, FaBus, FaPiggyBank, FaArrowUp, FaArrowDown, FaTimes
} from 'react-icons/fa';
import { CHART_COLORS } from '../utils/constants';

import SortModal from '../components/SortModal';
import FilterModal from '../components/FilterModal';
import AddExpenseModal from '../components/AddExpenseModal';
import RegretModal from '../components/RegretModal';
import StreakDisplay from '../components/StreakDisplay';
import FutureSelfLetter from '../components/FutureSelfLetter';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [originalTransactions, setOriginalTransactions] = useState([]);
    const [displayTransactions, setDisplayTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);

    // Behavior Features State
    const [pendingRegret, setPendingRegret] = useState([]);
    const [streak, setStreak] = useState(null);
    const [latestLetter, setLatestLetter] = useState(null);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRegretOpen, setIsRegretOpen] = useState(false);
    const [isLetterOpen, setIsLetterOpen] = useState(false);

    // Graph Filter State
    const [graphFilter, setGraphFilter] = useState('30days'); // 30days, month, custom
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    // Transaction List Filters
    const [currentSort, setCurrentSort] = useState('newest');
    const [currentFilters, setCurrentFilters] = useState({
        categories: [],
        paymentMethod: []
    });

    const [currentDateRange, setCurrentDateRange] = useState({
        start: moment().subtract(29, 'days'),
        end: moment()
    });

    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        budgetBalance: 0,
        totalBudget: 0,
        expenseChange: 0
    });

    const [scores, setScores] = useState({ score: 100, regretPercentage: 0, totalEvaluated: 0, categoryRegret: {} });
    const [scoreDuration, setScoreDuration] = useState('month');

    useEffect(() => {
        if (user) {
            fetchDashboardData();
            fetchBudgets();
            fetchBehaviorData();
            fetchRegretScores();
        }
    }, [user, scoreDuration]);

    const fetchRegretScores = async () => {
        try {
            const res = await api.get(`/behavior/scores?duration=${scoreDuration}`);
            setScores(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/transactions/dashboard');
            const transactions = res.data.recentTransactions || [];
            setOriginalTransactions(transactions);
            setPendingRegret(res.data.pendingRegretEvaluations || []);

            // Recalculate stats locally to merge budget data if budgets are already loaded
            calculateStats(transactions, budgets);

            // Initial Logic Application
            applyGraphFilter(transactions, '30days');
        } catch (err) { console.error(err); }
    };

    const fetchBudgets = async () => {
        try {
            const res = await api.get('/budgets');
            setBudgets(res.data);
            // Re-calculate stats with new budget data
            calculateStats(originalTransactions, res.data);
        } catch (err) { console.error(err); }
    };

    const fetchBehaviorData = async () => {
        try {
            const streakRes = await api.get('/behavior/streak');
            setStreak(streakRes.data);

            const letterRes = await api.get('/behavior/letter/latest');
            setLatestLetter(letterRes.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setLatestLetter(null);
            } else {
                console.error(err);
            }
        }
    };

    const handleRegretEvaluation = async (id, status) => {
        try {
            await api.put(`/transactions/regret/${id}`, { regretStatus: status });
            // Remove from local pending
            setPendingRegret(prev => prev.filter(t => t._id !== id));
            // Refresh data
            fetchDashboardData();
            fetchRegretScores();
        } catch (err) { console.error(err); }
    };

    // Recalculate stats when transactions or budgets change
    useEffect(() => {
        if (originalTransactions.length > 0 || budgets.length > 0) {
            calculateStats(originalTransactions, budgets);
            applyGraphFilter(originalTransactions, graphFilter);
        }
    }, [originalTransactions, budgets, graphFilter, customDateRange.start, customDateRange.end]); // Re-run graph logic on filter change

    const calculateStats = (data, currentBudgets) => {
        // Stats are global (or typically based on "This Month" for relevance, but user asked for Total Income/Expense)
        // Usually Total Income/Expense implies "This Month" in dashboards, otherwise lifetime is huge.
        // Let's stick to "This Month" for the top cards as it's most useful context, unless "Lifecycle" is implied.
        // Given the graph default is 30 days, "This Month" stats make sense.

        const now = moment();
        const thisMonthTrans = data.filter(t => moment(t.date).isSame(now, 'month'));

        const income = thisMonthTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = thisMonthTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const totalBudgetLimit = currentBudgets?.reduce((acc, b) => acc + b.limit, 0) || 0;
        const budgetBalance = totalBudgetLimit > 0 ? (totalBudgetLimit - expense) : (income - expense); // Fallback to cash flow if no budget

        // Expense Change vs Last Month
        const lastMonthTrans = data.filter(t => moment(t.date).isSame(moment().subtract(1, 'month'), 'month'));
        const lastMonthExpenses = lastMonthTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        let expenseChange = 0;
        if (lastMonthExpenses > 0) expenseChange = ((expense - lastMonthExpenses) / lastMonthExpenses) * 100;
        else if (expense > 0) expenseChange = 100;

        setStats({
            totalIncome: income || 0,
            totalExpense: expense || 0,
            budgetBalance: budgetBalance || (income - expense) || 0,
            totalBudget: totalBudgetLimit || 0,
            expenseChange: expenseChange || 0
        });
    };

    const applyGraphFilter = (data, filter) => {
        const now = moment();
        let start, end;

        if (filter === '30days') {
            start = moment().subtract(29, 'days').startOf('day');
            end = moment().endOf('day');
        } else if (filter === 'month') {
            start = moment().startOf('month');
            end = moment().endOf('month');
        } else if (filter === 'custom' && customDateRange.start && customDateRange.end) {
            start = moment(customDateRange.start).startOf('day');
            end = moment(customDateRange.end).endOf('day');
        } else {
            // Default fallback
            start = moment().subtract(29, 'days').startOf('day');
            end = moment().endOf('day');
        }

        setCurrentDateRange({ start, end });

        if (!data) return;
        const filtered = data.filter(t => moment(t.date).isBetween(start, end, 'day', '[]'));
        applyListFilters(filtered, currentSort, currentFilters);
    };

    const applyListFilters = (data, sort, filters) => {
        let result = [...data];

        if (filters.categories?.length > 0) {
            result = result.filter(t => filters.categories.some(c => c.toLowerCase() === t.category.toLowerCase()));
        }

        if (sort === 'newest') result.sort((a, b) => new Date(b.date) - new Date(a.date));
        else if (sort === 'oldest') result.sort((a, b) => new Date(a.date) - new Date(b.date));
        else if (sort === 'high') result.sort((a, b) => b.amount - a.amount);
        else if (sort === 'low') result.sort((a, b) => a.amount - b.amount);

        setDisplayTransactions(result);
    };

    const handleSortApply = (option) => {
        setCurrentSort(option);
        applyListFilters(displayTransactions, option, currentFilters); // apply to current set
    };

    const handleFilterApply = (newFilters) => {
        setCurrentFilters(newFilters);
        // We need to re-apply from graph filtered set... 
        // Ideally we store "graphFilteredData" separately but for now let's just re-run:
        applyGraphFilter(originalTransactions, graphFilter);
        // (This triggers applyListFilters inside) - wait, `applyGraphFilter` uses `originalTransactions` or passed `data`?
        // It uses `originalTransactions` if I call it like that.
    };

    /*
    const handleAddExpense = async (formData) => {
        try {
            await api.post('/transactions', formData);
            fetchDashboardData();
        } catch (err) { console.error(err); }
    };
    */

    // Graph Data Preparation
    const getGraphData = () => {
        const grouped = {};
        displayTransactions.forEach(t => {
            const dateKey = moment(t.date).format('YYYY-MM-DD');
            if (!grouped[dateKey]) grouped[dateKey] = { income: 0, expense: 0 };
            if (t.type === 'income') grouped[dateKey].income += t.amount;
            else grouped[dateKey].expense += t.amount;
        });

        const labels = [];
        const incomeData = [];
        const expenseData = [];

        let curr = moment(currentDateRange.start).clone();
        const end = moment(currentDateRange.end).clone();

        while (curr.isSameOrBefore(end, 'day')) {
            const dateKey = curr.format('YYYY-MM-DD');
            const label = curr.format('MMM DD');

            labels.push(label);
            incomeData.push(grouped[dateKey]?.income || 0);
            expenseData.push(grouped[dateKey]?.expense || 0);

            curr.add(1, 'days');
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    // Pie Data Preparation
    const getPieData = () => {
        const grouped = {};
        displayTransactions.filter(t => t.type === 'expense').forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });
        return {
            labels: Object.keys(grouped),
            datasets: [{
                data: Object.values(grouped),
                backgroundColor: CHART_COLORS,
                borderWidth: 0
            }]
        };
    };

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>DASHBOARD</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/transactions')} className="btn btn-primary" style={{ gap: '5px' }}>
                        <FaPlus /> Add
                    </button>
                </div>
            </div>

            {/* Row 1: Main Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div className="card" style={{ background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#065f46' }}>Total Income</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>₹{stats.totalIncome.toLocaleString()}</div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                        <FaMoneyBillWave />
                    </div>
                </div>

                <div className="card" style={{ background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#991b1b' }}>Total Expense</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>₹{stats.totalExpense.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: stats.expenseChange > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {stats.expenseChange > 0 ? '▲' : '▼'} {Math.abs(stats.expenseChange).toFixed(1)}% vs last month
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                        <FaArrowDown />
                    </div>
                </div>

                <div className="card" style={{ background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#075985' }}>Budget Balance</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0284c7' }}>₹{stats.budgetBalance.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                            {stats.totalBudget > 0 ? `of ₹${stats.totalBudget.toLocaleString()} Limit` : 'No Budget Set'}
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                        <FaWallet />
                    </div>
                </div>
            </div>

            {/* Row 2: Behavior Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Discipline Streaks */}
                <div className="card" style={{ background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#9a3412' }}>Discipline Streak</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>{streak?.currentStreak || 0} Days</div>
                        <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>🔥 Staying on track</div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                        <FaChartLine />
                    </div>
                </div>

                {/* Regret Index */}
                <div
                    className="card"
                    style={{ background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => {
                        // Filter transactions from past 48 hours for a wider reflection window
                        const reviewable = originalTransactions.filter(t =>
                            t.type === 'expense' &&
                            moment(t.date).isAfter(moment().subtract(48, 'hours')) &&
                            !t.regretStatus
                        );
                        setPendingRegret(reviewable);
                        setIsRegretOpen(true);
                    }}
                >
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#581c87' }}>Regret Index</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea' }}>Review Past 24h</div>
                        <div style={{ fontSize: '0.75rem', color: '#7e22ce' }}>Reflect on your spending</div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                        <FaFilter />
                    </div>
                </div>

                {/* Future Self Letter Preview */}
                <div
                    className="card"
                    style={{ background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setIsLetterOpen(true)}
                >
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0c4a6e' }}>Letter from Future Me</div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#0369a1',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontStyle: 'italic'
                        }}>
                            {latestLetter ? latestLetter.content : "Your future self is writing a letter based on your habits..."}
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                        <FaEdit />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Spending Analysis</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                className="form-input"
                                style={{ width: 'auto', padding: '5px' }}
                                value={graphFilter}
                                onChange={(e) => setGraphFilter(e.target.value)}
                            >
                                <option value="30days">Last 30 Days</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            {graphFilter === 'custom' && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input type="date" className="form-input" style={{ width: 'auto', padding: '5px' }} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
                                    <input type="date" className="form-input" style={{ width: 'auto', padding: '5px' }} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Line
                            data={getGraphData()}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: true, position: 'top' } },
                                scales: { y: { min: 0 } }
                            }}
                        />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Category Split</h3>
                    <div style={{ height: '250px' }}>
                        <Doughnut
                            data={getPieData()}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Recent Transactions</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsSortOpen(true)} className="btn btn-outline" style={{ gap: '5px', fontSize: '0.8rem', padding: '5px 10px' }}><FaSort /> Sort</button>
                        <button onClick={() => setIsFilterOpen(true)} className="btn btn-outline" style={{ gap: '5px', fontSize: '0.8rem', padding: '5px 10px' }}><FaFilter /> Filter</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 2fr 1fr', padding: '12px 20px', background: '#f9fafb', fontWeight: 'bold', fontSize: '0.8rem', color: '#6b7280' }}>
                    <div>DATE</div>
                    <div>AMOUNT</div>
                    <div>CATEGORY</div>
                    <div>NOTE</div>
                    <div>TYPE</div>
                </div>

                {displayTransactions.slice(0, 10).map((t) => (
                    <div key={t._id} style={{
                        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 2fr 1fr',
                        padding: '15px 20px', borderBottom: '1px solid #f3f4f6', alignItems: 'center', fontSize: '0.9rem'
                    }}>
                        <div style={{ color: '#6b7280' }}>{moment(t.date).format('MMM DD')}</div>
                        <div style={{ fontWeight: 'bold' }}>₹{t.amount}</div>
                        <div style={{ textTransform: 'capitalize' }}>{t.category}</div>
                        <div style={{ color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || '-'}</div>
                        <div style={{
                            color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                            background: t.type === 'income' ? '#ecfdf5' : '#fef2f2',
                            padding: '2px 8px', borderRadius: '4px', width: 'fit-content', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                            {t.type.toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>

            <SortModal isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} currentSort={currentSort} onApply={handleSortApply} />
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentFilters={currentFilters} onApply={handleFilterApply} />
            {/* <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddExpense} /> */}

            {isLetterOpen && latestLetter && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '20px', backdropFilter: 'blur(4px)'
                }} onClick={() => setIsLetterOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <FutureSelfLetter letter={latestLetter} />
                        <button
                            onClick={() => setIsLetterOpen(false)}
                            style={{
                                position: 'absolute', top: '-15px', right: '-15px',
                                background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%',
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                cursor: 'pointer', color: '#6b7280', zIndex: 1001
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            <RegretModal
                isOpen={isRegretOpen}
                transactions={pendingRegret}
                onEvaluate={handleRegretEvaluation}
                onClose={() => setIsRegretOpen(false)}
                scores={scores}
                duration={scoreDuration}
                onDurationChange={setScoreDuration}
            />
        </div>
    );
};

export default Dashboard;
