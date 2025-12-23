
import React from 'react';
import { MachineryStat, Language } from '../../../types';
import { useUI } from '../../../context/UIContext';

interface MachineryRowProps {
    machine: MachineryStat;
    lang: Language;
}

export const MachineryRow: React.FC<MachineryRowProps> = ({ machine, lang }) => {
    const { t } = useUI();
    
    const activePct = (machine.active / machine.total) * 100;
    const maintPct = (machine.maintenance / machine.total) * 100;

    return (
        <div className="group">
            {/* Header: Name and Counts */}
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-blue-400 transition-colors">
                        {machine.icon}
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-blue-100 transition-colors">
                        {machine.name[lang]}
                    </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                    <span className="text-white font-bold">{machine.active}</span>
                    <span className="opacity-50">/</span>
                    <span>{machine.total}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-iha-900 rounded-full overflow-hidden flex border border-iha-700/50 shadow-inner">
                <div 
                    style={{ width: `${activePct}%` }} 
                    className="bg-emerald-500 h-full relative overflow-hidden transition-all duration-1000 ease-out"
                >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
                <div 
                    style={{ width: `${maintPct}%` }} 
                    className="bg-red-500 h-full relative transition-all duration-1000 ease-out"
                >
                    {/* Striped pattern for maintenance */}
                    <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
                </div>
            </div>

            {/* Footer Labels */}
            <div className="flex justify-between mt-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('common.active')}
                </span>
                {machine.maintenance > 0 ? (
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                        {t('common.maintenance')}: {machine.maintenance}
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-wider">
                        %100 OPERASYONEL
                    </span>
                )}
            </div>
        </div>
    );
};
