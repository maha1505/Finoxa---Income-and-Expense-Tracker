import React from 'react';
import moment from 'moment';

const FutureSelfLetter = ({ letter }) => {
    if (!letter) return null;

    return (
        <div className="card" style={{
            padding: '30px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            background: 'white'
        }}>
            {/* Decoration */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', marginRight: '-60px', marginTop: '-60px'
            }} />

            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Future Self Letter</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                            Synthesized for {moment(letter.month, 'YYYY-MM').format('MMMM YYYY')}
                        </p>
                    </div>
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                        ARTIFACT #{letter.month.replace('-', '')}
                    </div>
                </div>

                <div style={{
                    background: '#f9fafb', padding: '20px', borderRadius: '15px',
                    border: '1px dashed #e5e7eb', marginBottom: '25px'
                }}>
                    <p style={{
                        whiteSpace: 'pre-wrap', color: '#374151', lineHeight: '1.6',
                        fontStyle: 'italic', margin: 0, fontSize: '1.1rem'
                    }}>
                        "{letter.content}"
                    </p>
                </div>

                <div style={{
                    borderTop: '1px solid #f3f4f6', paddingTop: '20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.85rem', color: '#9ca3af'
                }}>
                    <p>Generated on {moment(letter.createdAt).format('MMMM D, YYYY')}</p>
                    <button style={{ color: '#3b82f6', fontWeight: 'bold', background: 'none' }}>View Archive</button>
                </div>
            </div>
        </div>
    );
};

export default FutureSelfLetter;
