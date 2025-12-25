
import React, { useState, useEffect } from 'react';
import { siteRepository } from '../../services/repositories/siteRepository';
import { FeedbackSubmission } from '../../types';
import { useUI } from '../../context/UIContext';

export const AdminFeedback: React.FC = () => {
    const { showToast, t } = useUI();
    const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'NEW' | 'RESOLVED'>('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await siteRepository.fetchFeedbacks();
        setFeedbacks(data);
        setIsLoading(false);
    };

    const handleStatusChange = async (id: string, status: FeedbackSubmission['status']) => {
        const success = await siteRepository.updateFeedbackStatus(id, status);
        if (success) {
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
            showToast(t('v2.admin.feedback.statusUpdated'), 'success');
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm(t('v2.admin.feedback.deleteConfirm'))) return;
        const success = await siteRepository.deleteFeedback(id);
        if (success) {
            setFeedbacks(prev => prev.filter(f => f.id !== id));
            showToast(t('v2.admin.feedback.deleted'), 'info');
        }
    };

    const getStatusStyle = (status: FeedbackSubmission['status']) => {
        switch(status) {
            case 'NEW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'READ': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return '';
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (filter === 'NEW') return f.status === 'NEW';
        if (filter === 'RESOLVED') return f.status === 'RESOLVED';
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">reviews</span>
                        {t('v2.admin.feedback.title')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{t('v2.admin.feedback.subtitle')}</p>
                </div>
                
                <div className="flex gap-2 bg-iha-900 p-1 rounded-xl border border-iha-700">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t('v2.admin.feedback.filterAll')}</button>
                    <button onClick={() => setFilter('NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'NEW' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t('v2.admin.feedback.filterNew')}</button>
                    <button onClick={() => setFilter('RESOLVED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t('v2.admin.feedback.filterResolved')}</button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-20 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 mb-4">sync</span>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('v2.admin.feedback.loading')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredFeedbacks.map(f => (
                        <div key={f.id} className={`bg-iha-800 border rounded-2xl p-6 shadow-lg group transition-all hover:shadow-indigo-900/10 ${f.status === 'NEW' ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'border-iha-700'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-iha-900 flex items-center justify-center text-indigo-400 font-black border border-iha-700 shadow-inner text-xl">
                                        {f.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                            {f.fullName}
                                            {f.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-iha-900 px-2 py-0.5 rounded border border-iha-700">{f.subject}</span>
                                            {f.email && <a href={`mailto:${f.email}`} className="text-[10px] text-slate-500 font-mono flex items-center gap-1 hover:text-blue-400"><span className="material-symbols-outlined text-[12px]">email</span> {f.email}</a>}
                                            {f.phone && <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">call</span> {f.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <select value={f.status} onChange={(e) => handleStatusChange(f.id, e.target.value as any)} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${getStatusStyle(f.status)} outline-none cursor-pointer uppercase tracking-widest`}>
                                        <option value="NEW">{t('v2.admin.feedback.status.NEW')}</option>
                                        <option value="READ">{t('v2.admin.feedback.status.READ')}</option>
                                        <option value="IN_PROGRESS">{t('v2.admin.feedback.status.IN_PROGRESS')}</option>
                                        <option value="RESOLVED">{t('v2.admin.feedback.status.RESOLVED')}</option>
                                    </select>
                                    <button onClick={() => handleDelete(f.id)} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-40 group-hover:opacity-100" title={t('v2.admin.feedback.delete')}>
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-iha-900/60 p-5 rounded-2xl border border-iha-700/50 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic shadow-inner relative">
                                <span className="material-symbols-outlined absolute top-2 right-4 text-slate-800 text-5xl pointer-events-none">format_quote</span>
                                "{f.content}"
                            </div>
                        </div>
                    ))}
                    
                    {filteredFeedbacks.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-iha-700 rounded-3xl opacity-50 bg-iha-900/20">
                            <span className="material-symbols-outlined text-6xl mb-4 text-slate-600">inbox</span>
                            <p className="text-xl font-bold text-slate-400">{t('v2.admin.feedback.empty')}</p>
                            <p className="text-xs text-slate-600 mt-1">{t('v2.admin.feedback.emptyFilter')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
