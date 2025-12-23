
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { Language, DailyLog } from '../../../types';

export const DailyLogPanel: React.FC = () => {
    const { data, updateDailyLog } = useData();
    const { t, showToast } = useUI();
    const [formLang, setFormLang] = useState<Language>('tr');
    
    const [tempDailyLog, setTempDailyLog] = useState<DailyLog>(data.dashboardWidgets.dailyLog || {
        date: new Date().toISOString().split('T')[0],
        summary: { tr: '', en: '', ro: '' },
        weatherNote: '',
        personnelCount: 0
    });

    useEffect(() => {
        if (data.dashboardWidgets.dailyLog) setTempDailyLog(data.dashboardWidgets.dailyLog);
    }, [data.dashboardWidgets.dailyLog]);

    const handleDailyLogSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateDailyLog(tempDailyLog);
        showToast('Günlük rapor güncellendi.');
    };

    return (
        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">edit_note</span>
                {t('admin.dashboard.dailyReport')}
            </h3>
            <form onSubmit={handleDailyLogSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <div className="flex gap-2 mb-2">
                        {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                            <button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                        ))}
                    </div>
                    <textarea 
                        value={tempDailyLog.summary[formLang]}
                        onChange={e => setTempDailyLog({...tempDailyLog, summary: {...tempDailyLog.summary, [formLang]: e.target.value}})}
                        placeholder={`...`}
                        className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.weatherNote')}</label>
                    <input value={tempDailyLog.weatherNote} onChange={e => setTempDailyLog({...tempDailyLog, weatherNote: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.personnelCount')}</label>
                    <input type="number" value={tempDailyLog.personnelCount} onChange={e => setTempDailyLog({...tempDailyLog, personnelCount: parseInt(e.target.value)})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white" />
                </div>
                <div className="md:col-span-2 text-right">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold">{t('admin.dashboard.updateReport')}</button>
                </div>
            </form>
        </div>
    );
};
