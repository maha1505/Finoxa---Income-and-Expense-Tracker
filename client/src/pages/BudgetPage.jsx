import { useEffect, useState } from 'react';
import api from '../api/axios';
import moment from 'moment';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [month, setMonth] = useState(moment().format('YYYY-MM'));
    const [statusTypes, setStatusTypes] = useState({});
    const [goal, setGoal] = useState('');
    const [goalStatus, setGoalStatus] = useState('');

    useEffect(() => {
        fetchBudgets();
        // In a real app we'd fetch the goal for this month too.
        // For now let's just use local storage or simulate it as there's no Goal API yet.
        const savedGoal = localStorage.getItem(`goal-${month}`);
        if (savedGoal) setGoal(savedGoal);
        else setGoal('');
    }, [month]);

    const fetchBudgets = async () => {
        try {
            const res = await api.get(`/budgets?month=${month}`);
            setBudgets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const saveBudget = async (category, limit) => {
        try {
            const res = await api.post('/budgets', { category, limit, month });
            fetchBudgets();
            setStatusTypes(prev => ({ ...prev, [category]: 'saved' }));
            setTimeout(() => setStatusTypes(prev => ({ ...prev, [category]: '' })), 2000);
        } catch (err) {
            console.error(err);
            setStatusTypes(prev => ({ ...prev, [category]: 'error' }));
        }
    };

    const saveGoal = () => {
        localStorage.setItem(`goal-${month}`, goal);
        setGoalStatus('saved');
        setTimeout(() => setGoalStatus(''), 2000);
    };

    const getLimit = (cat) => {
        const b = budgets.find(b => b.category === cat);
        return b ? b.limit : '';
    };

    return (
        <div style={{ paddingBottom: '50px' }}>
            <h1 style={{ marginBottom: '20px', fontSize: '1.8rem', fontWeight: 'bold' }}>Monthly Budgets & Goals</h1>

            <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Month:</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="form-input"
                            style={{ width: 'auto', display: 'inline-block' }}
                        />
                    </div>

                    <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <label style={{ fontWeight: 'bold' }}>Monthly Savings Goal: ₹</label>
                        <input
                            type="number"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onBlur={saveGoal}
                            className="form-input"
                            style={{ width: '150px' }}
                            placeholder="e.g. 5000"
                        />
                        {goalStatus === 'saved' && <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Saved</span>}
                    </div>
                </div>

                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Set your spending limits for each category.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {EXPENSE_CATEGORIES.map(cat => (
                        <div key={cat} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', background: '#f9fafb' }}>
                            <div style={{ textTransform: 'capitalize', fontWeight: 'bold', marginBottom: '10px' }}>{cat}</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Limit"
                                    defaultValue={getLimit(cat)}
                                    key={`${cat}-${getLimit(cat)}`}
                                    onBlur={(e) => saveBudget(cat, e.target.value)}
                                    className="form-input"
                                />
                                {statusTypes[cat] === 'saved' && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>Saved</span>}
                                {statusTypes[cat] === 'error' && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>Error</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;
