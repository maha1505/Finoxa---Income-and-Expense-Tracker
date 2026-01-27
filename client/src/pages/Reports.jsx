import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaCalendarAlt, FaStore, FaTshirt, FaCar, FaHeartbeat, FaBolt, FaGamepad } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
    const [data, setData] = useState({ incomeCategories: {}, expenseCategories: {} });

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

    const expenseTotal = calculateTotal(data.expenseCategories);

    // Sort categories by amount desc
    const sortedCategories = Object.entries(data.expenseCategories)
        .sort(([, a], [, b]) => b - a);

    const chartData = {
        labels: Object.keys(data.expenseCategories),
        datasets: [
            {
                data: Object.values(data.expenseCategories),
                backgroundColor: [
                    '#3b82f6', // Blue
                    '#10b981', // Green
                    '#f59e0b', // Yellow/Orange
                    '#ec4899', // Pink
                    '#8b5cf6', // Violet
                    '#6b7280', // Gray
                ],
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
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Breakdown</h2>
                    <FaCalendarAlt style={{ color: '#9ca3af' }} />
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
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${expenseTotal.toLocaleString()}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>from all accounts</div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    {/* Legend (Simplified) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Groceries</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Shopping</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Travel</span>
                    </div>
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
                        const percentage = ((amount / expenseTotal) * 100).toFixed(1);
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6b7280'];
                        const color = colors[index % colors.length];

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
                                            color: '#374151'
                                        }}>
                                            {getIcon(category)}
                                        </div>
                                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{category}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: '#9ca3af', marginRight: '10px' }}>{percentage}%</span>
                                        <span style={{ fontWeight: 'bold' }}>| ${amount.toLocaleString()}</span>
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
                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>No expense data to display.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
