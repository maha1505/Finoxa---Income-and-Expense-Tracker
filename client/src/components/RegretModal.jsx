import React from 'react';

const RegretModal = ({ isOpen, transactions, onEvaluate, onClose, scores, duration, onDurationChange }) => {
    if (!isOpen) return null;

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
    };

    const modalContentStyle = {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
    };

    const sectionStyle = {
        padding: '24px',
        borderBottom: '1px solid #f3f4f6'
    };

    const listStyle = {
        padding: '24px',
        overflowY: 'auto',
        flex: 1,
        maxHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    };

    const cardStyle = {
        padding: '16px',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        border: '1px solid #f3f4f6'
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '12px'
    };

    const topRegretCategory = Object.entries(scores?.categoryRegret || {}).reduce((a, b) => a[1].regrets > b[1].regrets ? a : b, [null, { regrets: 0 }])[0];

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Review Recent Transactions</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', padding: '4px' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body / List */}
                <div style={listStyle}>
                    {transactions && transactions.length > 0 ? (
                        transactions.map(t => (
                            <div key={t._id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{t.amount}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.description || 'No description'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {t.category}
                                        </div>
                                        <button
                                            onClick={() => onEvaluate(t._id, 'Neutral')}
                                            style={{ background: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: 'underline', marginTop: '4px', padding: 0 }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Worth it')}
                                        style={{ padding: '8px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}
                                    >
                                        Worth it
                                    </button>
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Neutral')}
                                        style={{ padding: '8px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px', background: '#f3f4f6', color: '#4b5563' }}
                                    >
                                        Neutral
                                    </button>
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Regret')}
                                        style={{ padding: '8px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px', background: '#fef2f2', color: '#dc2626' }}
                                    >
                                        Regret
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>No transactions to review</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You're staying on top of your reflections!</div>
                        </div>
                    )}
                </div>

                {/* Footer / Stats */}
                <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Statistics</h3>
                        <select
                            value={duration}
                            onChange={(e) => onDurationChange(e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white' }}
                        >
                            <option value="day">Today</option>
                            <option value="month">This Month</option>
                            <option value="">All Time</option>
                        </select>
                    </div>

                    <div style={statsGridStyle}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{scores.score.toFixed(0)}%</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Discipline</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{scores.regretPercentage.toFixed(0)}%</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Regret</div>
                        </div>
                        <div style={{ textAlign: 'center', overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{topRegretCategory || 'None'}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Top Regret</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegretModal;
