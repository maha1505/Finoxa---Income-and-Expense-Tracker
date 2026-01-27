import React, { useState } from 'react';
import { FaTimes, FaPlus, FaCamera } from 'react-icons/fa';
import moment from 'moment';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';

const AddExpenseModal = ({ isOpen, onClose, onAdd }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        customCategory: '',
        date: moment().format('YYYY-MM-DD'),
        notes: '',
        type: 'expense',
        isRecurring: false,
        frequency: 'monthly'
    });

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCategory = formData.category === 'custom' ? formData.customCategory : formData.category;

        onAdd({ ...formData, category: finalCategory });
        onClose();
        setFormData({ amount: '', category: '', customCategory: '', date: moment().format('YYYY-MM-DD'), notes: '', type: 'expense', isRecurring: false, frequency: 'monthly' });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '450px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', position: 'relative' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Add {formData.type === 'income' ? 'Income' : 'Expense'}</h3>
                </div>

                <div style={{ padding: '20px' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
                        <button
                            type="button"
                            className={`btn ${formData.type === 'expense' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: formData.type === 'expense' ? 'var(--danger)' : '', borderColor: formData.type === 'expense' ? 'transparent' : 'var(--danger)', color: formData.type === 'expense' ? 'white' : 'var(--danger)' }}
                            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1 }}
                            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                        >
                            Income
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="₹ Enter Amount"
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
                                <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Custom Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter Category Name"
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
                            <label className="form-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Notes (optional)</label>
                            <textarea
                                className="form-input"
                                placeholder="Write something..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="2"
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

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: '5px' }}>
                                <FaPlus /> ADD
                            </button>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white', gap: '5px' }}>
                                <FaTimes /> CANCEL
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
