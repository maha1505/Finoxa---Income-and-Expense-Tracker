import { useEffect, useState } from 'react';
import api from '../api/axios';
import moment from 'moment';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: 'groceries',
        amount: '',
        description: '',
        date: moment().format('YYYY-MM-DD')
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/transactions/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/transactions', formData);
            }
            fetchTransactions();
            setFormData({
                type: 'expense',
                category: 'groceries',
                amount: '',
                description: '',
                date: moment().format('YYYY-MM-DD')
            });
        } catch (err) {
            console.error(err);
        }
    };

    const onDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.delete(`/transactions/${id}`);
                fetchTransactions();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const onEdit = (transaction) => {
        setEditingId(transaction._id);
        setFormData({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: moment(transaction.date).format('YYYY-MM-DD')
        });
    };

    const handleExport = () => {
        const headers = ["Date", "Type", "Category", "Amount", "Description"];
        const rows = transactions.map(t => [
            moment(t.date).format('YYYY-MM-DD'),
            t.type,
            t.category,
            t.amount,
            t.description
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${moment().format('YYYYMMDD')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const groupedTransactions = transactions.reduce((acc, t) => {
        const date = moment(t.date).format('DD MMM YYYY');
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
    }, {});

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Transactions</h1>
                <button onClick={handleExport} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Export CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
                <div className="card" style={{ position: 'sticky', top: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
                                    style={{ flex: 1 }}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${formData.type === 'expense' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
                                    style={{ flex: 1, backgroundColor: formData.type === 'expense' ? 'var(--danger)' : '', borderColor: formData.type === 'expense' ? 'transparent' : 'var(--danger)', color: formData.type === 'expense' ? 'white' : 'var(--danger)' }}
                                >
                                    Expense
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ type: 'expense', category: 'groceries', amount: '', description: '', date: moment().format('YYYY-MM-DD') });
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {editingId ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>

                <div>
                    {Object.keys(groupedTransactions).map(date => (
                        <div key={date} style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>{date}</h3>
                            <div className="card" style={{ padding: '0' }}>
                                {groupedTransactions[date].map((t, index) => (
                                    <div
                                        key={t._id}
                                        className="transaction-item"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px 20px',
                                            borderBottom: index !== groupedTransactions[date].length - 1 ? '1px solid #f3f4f6' : 'none',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            const actions = e.currentTarget.querySelector('.transaction-actions');
                                            if (actions) actions.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            const actions = e.currentTarget.querySelector('.transaction-actions');
                                            if (actions) actions.style.opacity = '0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{t.description}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {t.category} • {moment(t.date).format('h:mm A')}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div
                                                className="transaction-actions"
                                                style={{
                                                    display: 'flex',
                                                    gap: '10px',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                }}
                                            >
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px' }}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(t._id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            <div style={{
                                                fontWeight: 'bold',
                                                color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                                                minWidth: '80px',
                                                textAlign: 'right'
                                            }}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)' }}>
                            No transactions yet. Add one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
