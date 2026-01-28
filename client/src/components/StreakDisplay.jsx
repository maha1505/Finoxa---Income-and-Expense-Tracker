import React from 'react';

const StreakDisplay = ({ streak }) => {
    if (!streak) return null;

    return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-900/30">
            <span className="text-xl">🔥</span>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                    {streak.currentStreak} Day Streak
                </span>
                <span className="text-[10px] text-orange-600/70 dark:text-orange-500/50 uppercase tracking-wider font-semibold">
                    Discipline
                </span>
            </div>
        </div>
    );
};

export default StreakDisplay;
