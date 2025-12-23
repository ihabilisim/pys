
import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { LocalizedString } from '../../../types';

export const MachineryPanel: React.FC = () => {
    const { data, addMachinery, deleteMachinery, updateDashboardWidgets } = useData();
    const { t } = useUI();

    const [newMachine, setNewMachine] = useState<{name: LocalizedString, total: number, icon: string}>({
        name: { tr: '', en: '', ro: '' }, total: 0, icon: 'agriculture'
    });

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

    return (
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
    );
};
