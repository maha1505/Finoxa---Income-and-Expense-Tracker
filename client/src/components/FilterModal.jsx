import React, { useState } from 'react';

const FilterModal = ({ isOpen, onClose, onApply, currentFilters }) => {
    if (!isOpen) return null;

    const [filters, setFilters] = useState(currentFilters || {
        dateRange: 'thisMonth',
        categories: [],
        amountRange: [],
        paymentMethod: []
    });

    const handleCategoryChange = (cat) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '20px' }}>Filter Modal</h3>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Date range</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Today', 'This Week', 'This Month', 'Previous Month'].map(range => (
                            <label key={range} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                <input
                                    type="radio"
                                    name="dateRange"
                                    checked={filters.dateRange === range}
                                    onChange={() => setFilters({ ...filters, dateRange: range })}
                                />
                                {range}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Category</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Groceries', 'Dining', 'Transport', 'Rent'].map(cat => (
                            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(cat)}
                                    onChange={() => handleCategoryChange(cat)}
                                />
                                {cat}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <button
                            onClick={() => { onApply(filters); onClose(); }}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            APPLY
                        </button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ width: '100%', background: 'var(--danger)', color: 'white' }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
