
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Permission, Language, LocalizedString, DailyLog } from '../../types';

type DashboardSubTab = 'daily' | 'stats' | 'machinery' | 'production' | 'timeline' | 'general' | 'quality';

const PERMISSION_MAP: Record<DashboardSubTab, Permission> = {
    'daily': 'manage_daily_log',
    'stats': 'manage_stats',
    'machinery': 'manage_machinery',
    'production': 'manage_stats',
    'timeline': 'manage_timeline',
    'general': 'manage_notifications',
    'quality': 'manage_quality'
};

export const AdminDashboard: React.FC = () => {
    const { data, updateDashboardWidgets, updateDailyLog, addMachinery, deleteMachinery, updateTimelinePhase, updateSiteIssue, deleteSiteIssue, addNotification, updateNotification, deleteNotification, loadSiteIssues, loadNotifications } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI(); 
    
    const [dashboardTab, setDashboardTab] = useState<DashboardSubTab>('daily');
    const [formLang, setFormLang] = useState<Language>('tr');

    const [tempHSE, setTempHSE] = useState(data.dashboardWidgets.hse);
    const [tempProgress, setTempProgress] = useState(data.dashboardWidgets.progress);
    const [tempProduction, setTempProduction] = useState(data.dashboardWidgets.production);
    const [tempDailyLog, setTempDailyLog] = useState<DailyLog>(data.dashboardWidgets.dailyLog || {
        date: new Date().toISOString().split('T')[0],
        summary: { tr: '', en: '', ro: '' },
        weatherNote: '',
        personnelCount: 0
    });
    
    const [newMachine, setNewMachine] = useState<{name: LocalizedString, total: number, icon: string}>({
        name: { tr: '', en: '', ro: '' }, total: 0, icon: 'agriculture'
    });

    const [editNoteId, setEditNoteId] = useState<string | null>(null);
    const [newUpdateMessage, setNewUpdateMessage] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newUpdateAuthor, setNewUpdateAuthor] = useState('');

    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [incidentData, setIncidentData] = useState({
        date: new Date().toISOString().slice(0, 16),
        type: 'Yaralanmalı Kaza',
        description: ''
    });

    // Lazy load logic for tabs
    useEffect(() => {
        if (dashboardTab === 'quality') loadSiteIssues();
        if (dashboardTab === 'general') loadNotifications();
    }, [dashboardTab]);

    useEffect(() => {
        setTempHSE(data.dashboardWidgets.hse);
        setTempProgress(data.dashboardWidgets.progress);
        setTempProduction(data.dashboardWidgets.production);
        if (data.dashboardWidgets.dailyLog) setTempDailyLog(data.dashboardWidgets.dailyLog);
    }, [data.dashboardWidgets]);

    const hasPermission = (perm: Permission) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        return currentUser.permissions.includes(perm);
    };

    const handleDailyLogSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateDailyLog(tempDailyLog);
    };

    const handleWidgetsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateDashboardWidgets({
            hse: tempHSE,
            progress: tempProgress,
            production: tempProduction,
            machinery: data.dashboardWidgets.machinery 
        });
    };

    const handleProductionChange = (id: string, field: 'value' | 'target', val: number) => {
        setTempProduction(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    };

    const handleMachineryUpdate = (id: string, field: 'active' | 'maintenance', val: number) => {
        const currentList = data.dashboardWidgets.machinery;
        const updatedList = currentList.map(m => {
            if (m.id === id) return { ...m, [field]: val };
            return m;
        });
        updateDashboardWidgets({ machinery: updatedList });
    };

    const handleAddMachine = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMachine.name.tr) return;
        addMachinery({
            name: newMachine.name,
            total: newMachine.total,
            active: newMachine.total,
            maintenance: 0,
            icon: newMachine.icon
        });
        setNewMachine({ name: { tr: '', en: '', ro: '' }, total: 0, icon: 'agriculture' });
    };

    const handleIncidentReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!incidentData.date) return;
        const updatedHSE = { ...tempHSE, lastIncidentDate: incidentData.date };
        updateDashboardWidgets({ hse: updatedHSE });
        setTempHSE(updatedHSE); 
        addNotification({
            date: incidentData.date.split('T')[0],
            type: 'alert',
            author: 'Safety Team',
            message: {
                tr: `İSG Olayı Bildirildi: ${incidentData.type}`,
                en: `HSE Incident Reported: ${incidentData.type}`,
                ro: `Incident HSE Raportat: ${incidentData.type}`
            }
        });
        setIsIncidentModalOpen(false);
        showToast(t('admin.dashboard.incidentModal.warning'), 'error');
    };

    const handleAddUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdateMessage.tr) return;
        if (editNoteId) {
            updateNotification(editNoteId, { message: newUpdateMessage, author: newUpdateAuthor });
            setEditNoteId(null);
        } else {
            addNotification({
                message: newUpdateMessage,
                author: newUpdateAuthor || 'Admin',
                date: new Date().toISOString().split('T')[0],
                type: 'update'
            });
        }
        setNewUpdateMessage({ tr: '', en: '', ro: '' });
        setNewUpdateAuthor('');
    };

    const startEditNote = (note: any) => {
        setEditNoteId(note.id);
        setNewUpdateMessage(note.message);
        setNewUpdateAuthor(note.author);
    };

    return (
        <div className="space-y-6">
            {/* Sub-Nav */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-iha-700 mb-6 custom-scrollbar">
                {[
                    { id: 'daily', label: t('admin.dashboard.tabs.daily'), icon: 'edit_note' },
                    { id: 'stats', label: t('admin.dashboard.tabs.stats'), icon: 'monitoring' },
                    { id: 'machinery', label: t('admin.dashboard.tabs.machinery'), icon: 'agriculture' },
                    { id: 'production', label: t('admin.dashboard.tabs.production'), icon: 'analytics' },
                    { id: 'timeline', label: t('admin.dashboard.tabs.timeline'), icon: 'timeline' },
                    { id: 'quality', label: t('admin.dashboard.tabs.quality'), icon: 'flag' },
                    { id: 'general', label: t('admin.dashboard.tabs.general'), icon: 'campaign' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setDashboardTab(tab.id as DashboardSubTab)}
                        disabled={!hasPermission(PERMISSION_MAP[tab.id as DashboardSubTab])}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                            dashboardTab === tab.id 
                            ? 'bg-iha-blue text-white shadow-md' 
                            : hasPermission(PERMISSION_MAP[tab.id as DashboardSubTab])
                                ? 'bg-iha-800 text-slate-400 hover:bg-iha-700 hover:text-white'
                                : 'bg-iha-900 text-slate-600 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            {dashboardTab === 'daily' && hasPermission('manage_daily_log') && (
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
            )}

            {dashboardTab === 'stats' && (
                <form onSubmit={handleWidgetsSave} className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-iha-700 pb-8">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase">{t('admin.dashboard.physicalProgress')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.planned')}</label><input type="number" step="0.1" value={tempProgress.planned} onChange={e => setTempProgress({...tempProgress, planned: parseFloat(e.target.value)})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                <div><label className="block text-xs text-slate-500 mb-1 text-emerald-500">{t('admin.dashboard.actual')}</label><input type="number" step="0.1" value={tempProgress.actual} onChange={e => setTempProgress({...tempProgress, actual: parseFloat(e.target.value)})} className="w-full bg-iha-900 border border-emerald-500/50 rounded-lg p-3 text-white" /></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase">{t('admin.dashboard.hseData')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.counterStartDate')}</label><input type="datetime-local" value={tempHSE.lastIncidentDate} onChange={e => setTempHSE({...tempHSE, lastIncidentDate: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                <div className="flex items-end"><button type="button" onClick={() => setIsIncidentModalOpen(true)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"><span className="material-symbols-outlined">warning</span> {t('admin.dashboard.reportIncident')}</button></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg">{t('admin.dashboard.saveChanges')}</button>
                </form>
            )}

            {dashboardTab === 'machinery' && (
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><span className="material-symbols-outlined text-orange-500">agriculture</span> {t('admin.dashboard.machineryPark')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.dashboardWidgets.machinery.map(m => (
                            <div key={m.id} className="bg-iha-900 border border-iha-700 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-500">{m.icon}</span><span className="text-white font-bold">{m.name.tr}</span></div><button type="button" onClick={() => deleteMachinery(m.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button></div>
                                <div className="grid grid-cols-2 gap-2 text-xs"><div><label className="text-slate-500">{t('common.active')}</label><input type="number" value={m.active} onChange={(e) => handleMachineryUpdate(m.id, 'active', parseInt(e.target.value))} className="w-full bg-iha-800 border border-iha-700 rounded p-1 text-white" /></div><div><label className="text-slate-500">{t('common.maintenance')}</label><input type="number" value={m.maintenance} onChange={(e) => handleMachineryUpdate(m.id, 'maintenance', parseInt(e.target.value))} className="w-full bg-iha-800 border border-iha-700 rounded p-1 text-white" /></div></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-iha-900/50 p-4 rounded-xl border border-iha-700 flex gap-2 items-end"><div className="flex-1"><label className="block text-[10px] text-slate-500 mb-1">{t('admin.dashboard.newMachineName')}</label><input value={newMachine.name.tr} onChange={e => setNewMachine({...newMachine, name: {...newMachine.name, tr: e.target.value, en: e.target.value, ro: e.target.value}})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" placeholder="Örn: Silindir" /></div><div className="w-24"><label className="block text-[10px] text-slate-500 mb-1">{t('common.total')}</label><input type="number" value={newMachine.total} onChange={e => setNewMachine({...newMachine, total: parseInt(e.target.value)})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" /></div><button type="button" onClick={handleAddMachine} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm h-10">{t('common.add')}</button></div>
                </div>
            )}

            {dashboardTab === 'production' && (
                <form onSubmit={handleWidgetsSave} className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><span className="material-symbols-outlined">analytics</span> {t('admin.dashboard.productionStats')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tempProduction.map(prod => (
                            <div key={prod.id} className="bg-iha-900 border border-iha-700 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined" style={{color: prod.color}}>{prod.icon}</span><span className="text-sm font-bold text-white">{prod.label.tr}</span></div>
                                <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] text-slate-500 mb-1">{t('admin.dashboard.actual')} ({prod.unit})</label><input type="number" value={prod.value} onChange={e => handleProductionChange(prod.id, 'value', parseFloat(e.target.value))} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" /></div><div><label className="block text-[10px] text-slate-500 mb-1">{t('admin.dashboard.target')} ({prod.unit})</label><input type="number" value={prod.target} onChange={e => handleProductionChange(prod.id, 'target', parseFloat(e.target.value))} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" /></div></div>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg">{t('admin.dashboard.saveChanges')}</button>
                </form>
            )}

            {dashboardTab === 'timeline' && (
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in overflow-x-auto">
                    <table className="w-full text-left text-sm"><thead className="bg-iha-900 text-slate-400"><tr><th className="p-3">Faz</th><th className="p-3">Durum</th><th className="p-3">Tamamlanma (%)</th></tr></thead><tbody className="divide-y divide-iha-700">{data.timelinePhases.map(phase => (<tr key={phase.id} className="hover:bg-iha-900/50"><td className="p-3 font-medium text-white">{phase.label.tr}</td><td className="p-3"><select value={phase.status} onChange={(e) => updateTimelinePhase(phase.id, { status: e.target.value as any })} className={`bg-iha-900 border border-iha-700 rounded px-2 py-1 text-xs font-bold ${phase.status === 'COMPLETED' ? 'text-green-500' : phase.status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-slate-500'}`}><option value="PENDING">BEKLEMEDE</option><option value="IN_PROGRESS">DEVAM EDİYOR</option><option value="COMPLETED">TAMAMLANDI</option></select></td><td className="p-3"><div className="flex items-center gap-2"><input type="range" min="0" max="100" value={phase.percentage} onChange={(e) => updateTimelinePhase(phase.id, { percentage: parseInt(e.target.value) })} className="w-24 h-1 bg-iha-700 rounded-lg appearance-none cursor-pointer" /><span className="text-xs font-mono text-slate-300 w-8">{phase.percentage}%</span></div></td></tr>))}</tbody></table>
                </div>
            )}

            {dashboardTab === 'quality' && hasPermission('manage_quality') && (
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">flag</span>
                        {t('admin.dashboard.qualityManagement')}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-iha-900 text-slate-500 uppercase font-bold text-xs">
                                <tr><th className="p-3">{t('common.type')}</th><th className="p-3">{t('common.status')}</th><th className="p-3">{t('common.description')}</th><th className="p-3">{t('common.location')}</th><th className="p-3">{t('common.date')}</th><th className="p-3 text-right">{t('common.actions')}</th></tr>
                            </thead>
                            <tbody className="divide-y divide-iha-700">
                                {data.siteIssues.map(issue => (
                                    <tr key={issue.id} className="hover:bg-iha-900/50">
                                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${issue.type === 'NCR' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{issue.type}</span></td>
                                        <td className="p-3"><select value={issue.status} onChange={(e) => updateSiteIssue(issue.id, { status: e.target.value as any })} className={`bg-iha-900 border border-iha-700 rounded px-2 py-1 text-xs font-bold ${issue.status === 'OPEN' ? 'text-red-500' : 'text-green-500'}`}><option value="OPEN">AÇIK</option><option value="CLOSED">KAPALI</option></select></td>
                                        <td className="p-3">{issue.description}</td>
                                        <td className="p-3 font-mono text-xs">{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</td>
                                        <td className="p-3 text-xs">{issue.reportedDate}</td>
                                        <td className="p-3 text-right"><button onClick={() => deleteSiteIssue(issue.id)} className="text-red-400 hover:text-white">{t('common.delete')}</button></td>
                                    </tr>
                                ))}
                                {data.siteIssues.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">Kayıtlı sorun bulunmamaktadır.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {dashboardTab === 'general' && hasPermission('manage_notifications') && (
             <div className="space-y-6 animate-in fade-in">
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                    <h3 className="text-lg font-bold text-white mb-4">{editNoteId ? t('admin.dashboard.editNotification') : t('admin.dashboard.newNotification')}</h3>
                    <div className="flex gap-2 mb-4">
                        {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                            <button key={lang} onClick={() => setFormLang(lang)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${formLang === lang ? 'bg-iha-blue text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                        ))}
                    </div>
                    <form onSubmit={handleAddUpdate} className="grid gap-4">
                        <textarea placeholder={`${formLang.toUpperCase()}`} value={newUpdateMessage[formLang]} onChange={e => setNewUpdateMessage({...newUpdateMessage, [formLang]: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24 resize-none" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder={t('admin.dashboard.author')} value={newUpdateAuthor} onChange={e => setNewUpdateAuthor(e.target.value)} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                            <button className="flex-1 bg-iha-blue text-white rounded-lg p-3 font-semibold">{editNoteId ? t('common.update') : t('admin.dashboard.publish')}</button>
                        </div>
                    </form>
                </div>
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                    <div className="space-y-3">
                        {data.notifications.map(note => (
                            <div key={note.id} className="bg-iha-900 p-3 rounded-lg border border-iha-700 flex justify-between items-start">
                                <div><p className="text-white text-sm">{note.message.tr}</p><p className="text-xs text-slate-500">{note.date} • {note.author}</p></div>
                                <div className="flex gap-2"><button onClick={() => startEditNote(note)} className="text-blue-400 hover:text-white"><span className="material-symbols-outlined text-lg">edit</span></button><button onClick={() => deleteNotification(note.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-lg">delete</span></button></div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
            )}

            {/* INCIDENT MODAL (Moved inside) */}
            {isIncidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-iha-800 w-full max-w-md rounded-2xl border-2 border-red-500/50 p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 animate-pulse"></div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-red-500">warning</span> {t('admin.dashboard.incidentModal.title')}</h3>
                        <p className="text-slate-400 text-sm mb-4">{t('admin.dashboard.incidentModal.warning')}</p>
                        <form onSubmit={handleIncidentReport} className="space-y-4">
                            <div><label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.incidentModal.date')}</label><input type="datetime-local" value={incidentData.date} onChange={e => setIncidentData({...incidentData, date: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="block text-xs text-slate-500 mb-1">{t('admin.dashboard.incidentModal.type')}</label><select value={incidentData.type} onChange={e => setIncidentData({...incidentData, type: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white"><option>Yaralanmalı Kaza</option><option>Maddi Hasarlı Kaza</option><option>Ramak Kala</option><option>Çevresel Kaza</option></select></div>
                            <div><label className="block text-xs text-slate-500 mb-1">{t('common.description')}</label><textarea value={incidentData.description} onChange={e => setIncidentData({...incidentData, description: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24" /></div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">{t('admin.dashboard.incidentModal.submit')}</button><button type="button" onClick={() => setIsIncidentModalOpen(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">{t('common.cancel')}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
