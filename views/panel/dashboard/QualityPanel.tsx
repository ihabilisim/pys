
import React, { useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export const QualityPanel: React.FC = () => {
    const { data, loadSiteIssues, updateSiteIssue, deleteSiteIssue } = useData();
    const { t, showToast } = useUI();

    useEffect(() => {
        loadSiteIssues();
    }, []);

    return (
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
                                <td className="p-3 text-right"><button onClick={() => { if(window.confirm('Emin misiniz?')) deleteSiteIssue(issue.id); }} className="text-red-400 hover:text-white">{t('common.delete')}</button></td>
                            </tr>
                        ))}
                        {data.siteIssues.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">Kayıtlı sorun bulunmamaktadır.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
