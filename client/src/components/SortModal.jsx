import React from 'react';

const SortModal = ({ isOpen, onClose, onApply, currentSort }) => {
    if (!isOpen) return null;

    const [selected, setSelected] = React.useState(currentSort || 'newest');

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '300px', padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Sort</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[{ id: 'newest', label: 'Newest' }, { id: 'oldest', label: 'Oldest' }, { id: 'high', label: 'Price: High to Low' }, { id: 'low', label: 'Price: Low to High' }].map(opt => (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="sort"
                                checked={selected === opt.id}
                                onChange={() => setSelected(opt.id)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>

                <button
                    onClick={() => { onApply(selected); onClose(); }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '20px' }}
                >
                    APPLY
                </button>
            </div>
        </div>
    );
};

export default SortModal;
