import { useEffect, useState } from 'react';
import api from '../api/axios';
import moment from 'moment';
import { FaEdit, FaTrash, FaPlus, FaFileExport, FaSave, FaTimes } from 'react-icons/fa';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        customCategory: '',
        date: moment().format('YYYY-MM-DD'),
        description: '',
        type: 'expense',
        isRecurring: false,
        frequency: 'monthly'
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

    const resetForm = () => {
        setFormData({
            amount: '',
            category: '',
            customCategory: '',
            date: moment().format('YYYY-MM-DD'),
            description: '',
            type: 'expense',
            isRecurring: false,
            frequency: 'monthly'
        });
        setEditingId(null);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalCategory = formData.category === 'custom' ? formData.customCategory : formData.category;
            const payload = { ...formData, category: finalCategory };

            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
            } else {
                await api.post('/transactions', payload);
            }
            fetchTransactions();
            resetForm();
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

    const onEdit = (t) => {
        setEditingId(t._id);
        setFormData({
            amount: t.amount,
            category: t.category,
            customCategory: '',
            date: moment(t.date).format('YYYY-MM-DD'),
            description: t.description,
            type: t.type,
            isRecurring: t.isRecurring || false,
            frequency: t.frequency || 'monthly'
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

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>TRANSACTIONS</h1>
                <button onClick={handleExport} className="btn btn-outline" style={{ gap: '8px' }}>
                    <FaFileExport /> Export CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
                {/* Sidebar Form */}
                <div className="card" style={{ position: 'sticky', top: '20px', padding: '25px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
                        {editingId ? 'Edit' : 'Add'} {formData.type === 'income' ? 'Income' : 'Expense'}
                    </h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            type="button"
                            className={`btn ${formData.type === 'expense' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, height: '40px', backgroundColor: formData.type === 'expense' ? 'var(--danger)' : '', borderColor: formData.type === 'expense' ? 'transparent' : 'var(--danger)', color: formData.type === 'expense' ? 'white' : 'var(--danger)' }}
                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, height: '40px' }}
                            onClick={() => setFormData({ ...formData, type: 'income' })}
                        >
                            Income
                        </button>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="₹ 0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Category</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                <option value="custom">+ Custom Category</option>
                            </select>
                        </div>

                        {formData.category === 'custom' && (
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Custom Category</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Category Name"
                                    value={formData.customCategory}
                                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Description</label>
                            <textarea
                                className="form-input"
                                placeholder="Describe the transaction..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="2"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '20px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                />
                                Recurring Transaction?
                            </label>
                            {formData.isRecurring && (
                                <div style={{ marginTop: '10px', marginLeft: '25px' }}>
                                    <select
                                        className="form-input"
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        style={{ fontSize: '0.85rem', padding: '8px' }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '45px', gap: '8px' }}>
                                {editingId ? <><FaSave /> UPDATE</> : <><FaPlus /> ADD</>}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="btn" style={{ flex: 1, background: '#f3f4f6', color: '#4b5563' }}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Main List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.keys(groupedTransactions).map(date => (
                        <div key={date}>
                            <h3 style={{
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '12px',
                                paddingLeft: '5px'
                            }}>
                                {date}
                            </h3>
                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                {groupedTransactions[date].map((t, index) => (
                                    <div
                                        key={t._id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px 20px',
                                            borderBottom: index !== groupedTransactions[date].length - 1 ? '1px solid #f3f4f6' : 'none',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: t.type === 'income' ? '#ecfdf5' : '#fef2f2',
                                                color: t.type === 'income' ? '#059669' : '#dc2626',
                                                fontSize: '1rem'
                                            }}>
                                                {t.type === 'income' ? '↙' : '↗'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.description}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                    {t.category} • {moment(t.date).format('h:mm A')}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                fontWeight: '900',
                                                fontSize: '1.05rem',
                                                color: t.type === 'income' ? '#059669' : '#dc2626',
                                                minWidth: '90px',
                                                textAlign: 'right'
                                            }}>
                                                {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                            </div>

                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    style={{ background: 'none', color: '#9ca3af', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(t._id)}
                                                    style={{ background: 'none', color: '#9ca3af', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', border: '2px dashed #e5e7eb', background: 'none', boxShadow: 'none' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📋</div>
                            <p>No transactions yet. Add your first one on the left!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
