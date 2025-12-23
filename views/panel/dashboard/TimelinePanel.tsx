
import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export const TimelinePanel: React.FC = () => {
    const { data, updateTimelinePhase, addTimelinePhase, deleteTimelinePhase } = useData();
    const { t, showToast } = useUI();

    const [newPhase, setNewPhase] = useState({
        label: { tr: '', en: '', ro: '' },
        status: 'PENDING' as any,
        percentage: 0,
        startDate: '',
        endDate: '',
        startKm: 0,
        endKm: 0
    });

    const handleAddPhase = () => {
        if (!newPhase.label.tr) {
            showToast('Lütfen faz adı giriniz.', 'error');
            return;
        }
        addTimelinePhase({
            ...newPhase,
            id: Date.now(),
        });
        setNewPhase({
            label: { tr: '', en: '', ro: '' },
            status: 'PENDING',
            percentage: 0,
            startDate: '',
            endDate: '',
            startKm: 0,
            endKm: 0
        });
        showToast('Yeni faz eklendi.', 'success');
    };

    return (
        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">timeline</span>
                {t('admin.dashboard.tabs.timeline')}
            </h3>

            {/* New Phase Form */}
            <div className="mb-6 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase">Yeni Faz Ekle</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div><label className="text-[10px] text-slate-500 block mb-1">Faz Adı (TR)</label><input value={newPhase.label.tr} onChange={e => setNewPhase({...newPhase, label: {...newPhase.label, tr: e.target.value, en: e.target.value, ro: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-xs text-white" /></div>
                    <div><label className="text-[10px] text-slate-500 block mb-1">Başlangıç</label><input type="date" value={newPhase.startDate} onChange={e => setNewPhase({...newPhase, startDate: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-xs text-white" /></div>
                    <div><label className="text-[10px] text-slate-500 block mb-1">Bitiş</label><input type="date" value={newPhase.endDate} onChange={e => setNewPhase({...newPhase, endDate: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-xs text-white" /></div>
                    <div className="flex items-end"><button onClick={handleAddPhase} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs">EKLE</button></div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-iha-900 text-slate-400"><tr><th className="p-3">Faz</th><th className="p-3">Tarih Aralığı</th><th className="p-3">Durum</th><th className="p-3">Tamamlanma (%)</th><th className="p-3 text-right">İşlem</th></tr></thead>
                    <tbody className="divide-y divide-iha-700">
                        {data.timelinePhases.map(phase => (
                            <tr key={phase.id} className="hover:bg-iha-900/50">
                                <td className="p-3 font-medium text-white">
                                    <input value={phase.label.tr} onChange={e => updateTimelinePhase(phase.id, { label: { ...phase.label, tr: e.target.value } })} className="bg-transparent border-b border-transparent focus:border-iha-blue focus:outline-none" />
                                </td>
                                <td className="p-3 font-mono text-xs text-slate-400">
                                    {phase.startDate} - {phase.endDate}
                                </td>
                                <td className="p-3">
                                    <select value={phase.status} onChange={(e) => updateTimelinePhase(phase.id, { status: e.target.value as any })} className={`bg-iha-900 border border-iha-700 rounded px-2 py-1 text-xs font-bold ${phase.status === 'COMPLETED' ? 'text-green-500' : phase.status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-slate-500'}`}>
                                        <option value="PENDING">BEKLEMEDE</option>
                                        <option value="IN_PROGRESS">DEVAM EDİYOR</option>
                                        <option value="COMPLETED">TAMAMLANDI</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <input type="range" min="0" max="100" value={phase.percentage} onChange={(e) => updateTimelinePhase(phase.id, { percentage: parseInt(e.target.value) })} className="w-24 h-1 bg-iha-700 rounded-lg appearance-none cursor-pointer" />
                                        <span className="text-xs font-mono text-slate-300 w-8">{phase.percentage}%</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => deleteTimelinePhase(phase.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
