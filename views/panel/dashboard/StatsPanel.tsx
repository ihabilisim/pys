
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export const StatsPanel: React.FC = () => {
    const { data, updateDashboardWidgets, addNotification } = useData();
    const { t, showToast } = useUI();

    const [tempHSE, setTempHSE] = useState(data.dashboardWidgets.hse);
    const [tempProgress, setTempProgress] = useState(data.dashboardWidgets.progress);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [incidentData, setIncidentData] = useState({
        date: new Date().toISOString().slice(0, 16),
        type: 'Yaralanmalı Kaza',
        description: ''
    });

    useEffect(() => {
        setTempHSE(data.dashboardWidgets.hse);
        setTempProgress(data.dashboardWidgets.progress);
    }, [data.dashboardWidgets]);

    const handleWidgetsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateDashboardWidgets({
            hse: tempHSE,
            progress: tempProgress
        });
        showToast('İstatistikler güncellendi.');
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
        showToast(t('admin.dashboard.incidentModal.warning'), 'info');
    };

    return (
        <>
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

            {/* INCIDENT MODAL */}
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
        </>
    );
};
