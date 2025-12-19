
import React from 'react';
import { MachineryStat } from '../../types';
import { useUI } from '../../context/UIContext';

interface MachineryWidgetProps {
    stats: MachineryStat[];
    lang: 'tr' | 'en' | 'ro';
}

export const MachineryWidget: React.FC<MachineryWidgetProps> = ({ stats, lang }) => {
    const { t } = useUI();
    return (
        <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-orange-500">agriculture</span>{t('machinery.title')}</h3>
            <div className="space-y-4">
                {stats.map(machine => {
                    const activePct = (machine.active / machine.total) * 100;
                    const maintPct = (machine.maintenance / machine.total) * 100;
                    return (
                        <div key={machine.id}>
                            <div className="flex justify-between items-center text-xs mb-1"><span className="text-slate-300 font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sm text-slate-500">{machine.icon}</span>{machine.name[lang]}</span><span className="text-slate-500 font-mono">{machine.active}/{machine.total}</span></div>
                            <div className="w-full h-2 bg-iha-900 rounded-full overflow-hidden flex"><div style={{ width: `${activePct}%` }} className="bg-green-500 h-full"></div><div style={{ width: `${maintPct}%` }} className="bg-red-500 h-full"></div></div>
                            <div className="flex justify-between mt-1 text-[9px] uppercase tracking-wider text-slate-500"><span>{t('common.active')}</span>{machine.maintenance > 0 && <span className="text-red-400">{t('common.maintenance')}: {machine.maintenance}</span>}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
