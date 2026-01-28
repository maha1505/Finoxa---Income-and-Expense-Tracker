import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaCalendarAlt, FaStore, FaTshirt, FaCar, FaHeartbeat, FaBolt, FaGamepad } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
    const [data, setData] = useState({ incomeCategories: {}, expenseCategories: {} });
    const [viewType, setViewType] = useState('expense'); // 'expense' or 'income'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/transactions/reports');
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Helper to calculate total
    const calculateTotal = (categories) => {
        return Object.values(categories).reduce((a, b) => a + b, 0);
    };

    // Helper to get Icon
    const getIcon = (category) => {
        switch (category) {
            case 'groceries': return <FaStore />;
            case 'shopping': return <FaTshirt />;
            case 'travel': return <FaCar />;
            case 'health': return <FaHeartbeat />;
            case 'bills': return <FaBolt />;
            case 'entertainment': return <FaGamepad />;
            default: return <FaStore />;
        }
    };

    const total = calculateTotal(viewType === 'expense' ? data.expenseCategories : data.incomeCategories);

    // Sort categories by amount desc
    const sortedCategories = Object.entries(viewType === 'expense' ? data.expenseCategories : data.incomeCategories)
        .sort(([, a], [, b]) => b - a);

    const expenseColors = ['#ef4444', '#f87171', '#fb923c', '#fca5a5', '#fecaca', '#fee2e2'];
    const incomeColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];
    const currentColors = viewType === 'expense' ? expenseColors : incomeColors;

    const chartData = {
        labels: sortedCategories.map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1)),
        datasets: [
            {
                data: sortedCategories.map(([, amt]) => amt),
                backgroundColor: currentColors,
                borderWidth: 0,
                cutout: '75%', // Thinner ring
                borderRadius: 20, // Rounded ends
            },
        ],
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {/* Breakdown Chart */}
            <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '10px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setViewType('expense')}
                            style={{
                                padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewType === 'expense' ? 'white' : 'transparent',
                                color: viewType === 'expense' ? '#ef4444' : '#6b7280',
                                fontWeight: 'bold', boxShadow: viewType === 'expense' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setViewType('income')}
                            style={{
                                padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewType === 'income' ? 'white' : 'transparent',
                                color: viewType === 'income' ? '#3b82f6' : '#6b7280',
                                fontWeight: 'bold', boxShadow: viewType === 'income' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            Income
                        </button>
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{viewType === 'expense' ? 'Expense' : 'Income'} Breakdown</h2>
                </div>

                <div style={{ position: 'relative', height: '300px', width: '300px', margin: '0 auto' }}>
                    <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: viewType === 'expense' ? '#ef4444' : '#3b82f6' }}>₹{total.toLocaleString()}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>total {viewType}</div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Dynamic Legend based on sortedCategories */}
                    {sortedCategories.slice(0, 3).map(([category], index) => {
                        return (
                            <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentColors[index % currentColors.length] }}></div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{category}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Categories List */}
            <div className="card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Categories</h2>
                    <FaCalendarAlt style={{ color: '#9ca3af' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {sortedCategories.map(([category, amount], index) => {
                        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                        const color = currentColors[index % currentColors.length];

                        return (
                            <div key={category}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: '#f9fafb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: color
                                        }}>
                                            {getIcon(category)}
                                        </div>
                                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{category}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: '#9ca3af', marginRight: '10px' }}>{percentage}%</span>
                                        <span style={{ fontWeight: 'bold' }}>| ₹{amount.toLocaleString()}</span>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div style={{ height: '6px', width: '100%', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        );
                    })}
                    {sortedCategories.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>No {viewType} data to display.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
