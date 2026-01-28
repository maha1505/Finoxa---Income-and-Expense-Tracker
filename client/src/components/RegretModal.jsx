import React from 'react';

const RegretModal = ({ transactions, onEvaluate, onClose, scores, duration, onDurationChange }) => {
    if (!transactions || transactions.length === 0) return null;

    const topRegretCategory = Object.entries(scores?.categoryRegret || {}).reduce((a, b) => a[1].regrets > b[1].regrets ? a : b, [null, { regrets: 0 }])[0];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Recent Transactions</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            ✕
                        </button>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 mb-6">
                        {transactions.map(t => (
                            <div key={t._id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">₹{t.amount}</div>
                                        <div className="text-sm text-gray-500">{t.description}</div>
                                    </div>
                                    <div className="text-xs font-medium uppercase text-gray-400">{t.category}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Worth it')}
                                        className="py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                    >
                                        Worth it
                                    </button>
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Neutral')}
                                        className="py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Neutral
                                    </button>
                                    <button
                                        onClick={() => onEvaluate(t._id, 'Regret')}
                                        className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Regret
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Regret Statistics</h3>
                            <select
                                value={duration}
                                onChange={(e) => onDurationChange(e.target.value)}
                                className="text-xs border-none bg-gray-100 dark:bg-gray-700 rounded-md p-1 focus:ring-0"
                            >
                                <option value="day">Today</option>
                                <option value="month">This Month</option>
                                <option value="">All Time</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-primary/5 rounded-xl text-center">
                                <div className="text-lg font-bold text-primary">{scores.score.toFixed(0)}%</div>
                                <div className="text-[10px] uppercase font-bold text-primary/60">Discipline</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl text-center">
                                <div className="text-lg font-bold text-primary">{scores.regretPercentage.toFixed(0)}%</div>
                                <div className="text-[10px] uppercase font-bold text-primary/60">Regret</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl text-center">
                                <div className="text-lg font-bold text-primary truncate">{topRegretCategory || 'None'}</div>
                                <div className="text-[10px] uppercase font-bold text-primary/60">Top Regret</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegretModal;
