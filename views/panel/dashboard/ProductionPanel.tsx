
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export const ProductionPanel: React.FC = () => {
    const { data, updateDashboardWidgets } = useData();
    const { t, showToast } = useUI();
    const [tempProduction, setTempProduction] = useState(data.dashboardWidgets.production);

    useEffect(() => {
        setTempProduction(data.dashboardWidgets.production);
    }, [data.dashboardWidgets.production]);

    const handleProductionChange = (id: string, field: 'value' | 'target', val: number) => {
        setTempProduction(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateDashboardWidgets({ production: tempProduction });
        showToast('Üretim verileri güncellendi.');
    };

    return (
        <form onSubmit={handleSave} className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in space-y-4">
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
    );
};
