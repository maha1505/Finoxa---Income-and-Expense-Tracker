import React from 'react';
import moment from 'moment';

const FutureSelfLetter = ({ letter }) => {
    if (!letter) return null;

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

            <div className="relative">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Future Self Letter</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Synthesized for {moment(letter.month, 'YYYY-MM').format('MMMM YYYY')}
                        </p>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">
                        Artifact #{letter.month.replace('-', '')}
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed italic font-serif text-lg">
                            {letter.content}
                        </p>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Generated on {moment(letter.createdAt).format('MMMM D, YYYY')}</p>
                    <button className="text-primary font-bold hover:underline">View Archive</button>
                </div>
            </div>
        </div>
    );
};

export default FutureSelfLetter;
