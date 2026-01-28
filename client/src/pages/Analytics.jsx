import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';
import { CHART_COLORS } from '../utils/constants';

const Analytics = () => {
    const [transactions, setTransactions] = useState([]);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const transRes = await api.get('/transactions');
                setTransactions(transRes.data);

                const reportRes = await api.get('/transactions/reports');
                setReportData(reportRes.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    // 1. Pie Chart Data (Category Split)
    const getPieData = () => {
        const grouped = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1);
            grouped[cat] = (grouped[cat] || 0) + t.amount;
        });

        // Sort by value desc
        const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]);

        return {
            labels: sortedKeys,
            datasets: [{
                data: sortedKeys.map(k => grouped[k]),
                backgroundColor: CHART_COLORS,
                borderWidth: 0
            }]
        };
    };

    // 2. Line Chart Data (Monthly Trend - Expenses)
    const getLineData = () => {
        const incomeMap = {};
        const expenseMap = {};

        // Get last 6 months list
        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push(moment().subtract(i, 'months').format('MMM YYYY'));
        }

        transactions.forEach(t => {
            const m = moment(t.date).format('MMM YYYY');
            if (t.type === 'income') incomeMap[m] = (incomeMap[m] || 0) + t.amount;
            else expenseMap[m] = (expenseMap[m] || 0) + t.amount;
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: months.map(m => incomeMap[m] || 0),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: months.map(m => expenseMap[m] || 0),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    // 3. Bar Chart Data (Income vs Expense)
    const getBarData = () => {
        const incomeMap = {};
        const expenseMap = {};

        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push(moment().subtract(i, 'months').format('MMM YYYY'));
        }

        transactions.forEach(t => {
            const m = moment(t.date).format('MMM YYYY');
            if (t.type === 'income') incomeMap[m] = (incomeMap[m] || 0) + t.amount;
            else expenseMap[m] = (expenseMap[m] || 0) + t.amount;
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: months.map(m => incomeMap[m] || 0),
                    backgroundColor: '#3b82f6',
                    borderRadius: 5
                },
                {
                    label: 'Expense',
                    data: months.map(m => expenseMap[m] || 0),
                    backgroundColor: '#ef4444',
                    borderRadius: 5
                }
            ]
        };
    };

    // 4. Regret Index Insights (Category-wise Regret Percentage)
    const getRegretCategoryData = () => {
        if (!reportData?.categoryRegret) return { labels: [], datasets: [] };

        const categories = Object.keys(reportData.categoryRegret);
        const regretData = categories.map(cat => {
            const stats = reportData.categoryRegret[cat];
            const totalEvaluated = (stats['Worth it'] || 0) + (stats['Neutral'] || 0) + (stats['Regret'] || 0);
            return totalEvaluated > 0 ? ((stats['Regret'] || 0) / totalEvaluated) * 100 : 0;
        });

        return {
            labels: categories,
            datasets: [{
                label: 'Regret %',
                data: regretData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 5
            }]
        };
    };

    return (
        <div style={{ paddingBottom: '100px' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '1.8rem', fontWeight: 'bold' }}>Visual Analytics</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                {/* Monthly Trend */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Monthly Spending Trend</h3>
                    <div style={{ height: '300px' }}>
                        <Line
                            data={getLineData()}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: true, position: 'top' } },
                                scales: { y: { min: 0 } }
                            }}
                        />
                    </div>
                </div>

                {/* Regret Index Highlights */}
                <div className="card" style={{ gridColumn: 'span 2', background: '#fff5f5' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-red-900">Regret Index Analysis</h3>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-black text-red-600">
                                    {reportData ? ((reportData.regretStats['Regret'] / (Object.values(reportData.regretStats).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(0) : 0}%
                                </div>
                                <div className="text-[10px] uppercase font-bold text-red-800/60">Overall Regret</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={getRegretCategoryData()}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: { callback: (v) => v + '%' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Split */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Expense by Category</h3>
                    <div style={{ height: '300px' }}>
                        <Doughnut
                            data={getPieData()}
                            options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }}
                        />
                    </div>
                </div>

                {/* Income vs Expense */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Income vs Expense</h3>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={getBarData()}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
