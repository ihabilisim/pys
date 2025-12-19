
import React from 'react';
import { DailyLog } from '../../types';
import { useUI } from '../../context/UIContext';

interface DailyLogWidgetProps {
    log: DailyLog;
    lang: 'tr' | 'en' | 'ro';
}

export const DailyLogWidget: React.FC<DailyLogWidgetProps> = ({ log, lang }) => {
    const { t } = useUI();
    return (
        <div className="bg-gradient-to-br from-indigo-900/30 to-iha-800 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-6xl">menu_book</span></div>
            <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-sm">edit_note</span>{t('admin.dashboard.dailyReport')}</h3>
            <div className="text-white text-lg font-serif italic mb-4 leading-relaxed opacity-90">"{log.summary[lang]}"</div>
            <div className="flex gap-4 border-t border-indigo-500/20 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400"><span className="material-symbols-outlined text-sm">calendar_today</span>{log.date}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><span className="material-symbols-outlined text-sm">cloud</span>{log.weatherNote}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><span className="material-symbols-outlined text-sm">groups</span>{log.personnelCount} Pers.</div>
            </div>
        </div>
    );
};
