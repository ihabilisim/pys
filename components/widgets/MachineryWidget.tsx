
import React from 'react';
import { MachineryStat, Language } from '../../types';
import { useUI } from '../../context/UIContext';

interface MachineryWidgetProps {
    stats: MachineryStat[];
    lang: Language;
}

export const MachineryWidget: React.FC<MachineryWidgetProps> = ({ stats, lang }) => {
    const { t } = useUI();
    
    return (
        <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6 shadow-xl">
            {/* Title Section */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20">
                        <span className="material-symbols-outlined text-xl">agriculture</span>
                    </span>
                    {t('machinery.title')}
                </h3>
            </div>

            {/* Grid Layout for Cards (Reverting to Card Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stats.map(machine => {
                    const activePct = (machine.active / machine.total) * 100;

                    return (
                        <div key={machine.id} className="bg-iha-900 rounded-xl border border-iha-700 p-5 relative overflow-hidden group hover:border-iha-blue/50 transition-all shadow-lg">
                            {/* Background Icon (Watermark) */}
                            <div className="absolute -right-4 -bottom-4 text-slate-800 opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none transform rotate-12 group-hover:scale-110 duration-500">
                                <span className="material-symbols-outlined text-[100px]">{machine.icon}</span>
                            </div>

                            {/* Header */}
                            <h4 className="text-white font-bold text-base mb-4 relative z-10 flex items-center gap-2">
                                {machine.name[lang]}
                            </h4>

                            {/* Stats Grid - 3 Columns */}
                            <div className="grid grid-cols-3 gap-3 relative z-10 mb-5">
                                {/* Total */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-center flex flex-col justify-center">
                                    <div className="text-xl font-black text-white">{machine.total}</div>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1">{t('common.total')}</div>
                                </div>

                                {/* Active */}
                                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-2.5 text-center flex flex-col justify-center">
                                    <div className="text-xl font-black text-emerald-400">{machine.active}</div>
                                    <div className="text-[9px] text-emerald-600/70 uppercase font-bold tracking-wider mt-1">{t('common.active')}</div>
                                </div>

                                {/* Maintenance */}
                                <div className={`rounded-lg p-2.5 text-center border flex flex-col justify-center ${machine.maintenance > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800/30 border-slate-700'}`}>
                                    <div className={`text-xl font-black ${machine.maintenance > 0 ? 'text-red-400' : 'text-slate-500'}`}>{machine.maintenance}</div>
                                    <div className={`text-[9px] uppercase font-bold tracking-wider mt-1 ${machine.maintenance > 0 ? 'text-red-600/70' : 'text-slate-600'}`}>{t('common.maintenance')}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative z-10">
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative transition-all duration-1000 ease-out"
                                        style={{ width: `${activePct}%` }}
                                    >
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                    {/* Maintenance part (Red) */}
                                    {machine.maintenance > 0 && (
                                        <div 
                                            className="h-full bg-red-500 absolute top-0"
                                            style={{ left: `${activePct}%`, width: `${(machine.maintenance / machine.total) * 100}%` }}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {stats.length === 0 && (
                    <div className="col-span-full h-32 flex flex-col items-center justify-center text-slate-500 italic text-sm border-2 border-dashed border-iha-700 rounded-xl">
                        <span className="material-symbols-outlined mb-2 opacity-50">no_transfer</span>
                        Veri bulunamadı
                    </div>
                )}
            </div>
        </div>
    );
};
