
import React from 'react';
import { ProductionStat } from '../../types';

interface ProductionCardProps {
    stat: ProductionStat;
    lang: 'tr' | 'en' | 'ro';
}

export const ProductionCard: React.FC<ProductionCardProps> = ({ stat, lang }) => {
    const percentage = Math.min(100, Math.max(0, (stat.value / stat.target) * 100));
    
    return (
        <div className="bg-iha-900/50 rounded-xl p-4 border border-iha-700 flex flex-col justify-between hover:border-iha-blue/30 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-iha-800 text-slate-300 group-hover:text-white transition-colors border border-iha-700">
                        <span className="material-symbols-outlined text-lg" style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">{stat.label[lang]}</p>
                        <p className="text-white font-mono font-bold text-lg leading-tight">{stat.value.toLocaleString()} <span className="text-xs text-slate-500 font-normal">{stat.unit}</span></p>
                    </div>
                </div>
                <div className="text-right"><span className="text-xs font-bold" style={{ color: percentage >= 100 ? '#10b981' : stat.color }}>{Math.round(percentage)}%</span></div>
            </div>
            <div className="w-full bg-iha-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${percentage}%`, backgroundColor: stat.color }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono"><span>0</span><span>Target: {stat.target.toLocaleString()}</span></div>
        </div>
    );
};
