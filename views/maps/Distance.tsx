
import React from 'react';
import { useUI } from '../../context/UIContext';

interface DistanceToolProps {
    distance: string;
    pointsCount?: number;
}

export const DistanceTool: React.FC<DistanceToolProps> = ({ distance, pointsCount = 0 }) => {
    const { t } = useUI();
    
    const getInstruction = () => {
        if (pointsCount === 0) return t('mapTools.distance.step2');
        return t('mapTools.distance.step3');
    };

    // Simulate vertical distance (height diff) for UX
    const verticalDist = (parseFloat(distance) * 0.05).toFixed(2); 

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            {/* Tooltip Instruction */}
            <div className="bg-iha-blue/90 backdrop-blur text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-blue-400/30 whitespace-nowrap uppercase tracking-widest">
                {getInstruction()}
            </div>

            {/* Results */}
            {distance && (
                <div className="bg-iha-900/90 backdrop-blur border border-iha-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 divide-x divide-iha-700 pointer-events-auto">
                    <div className="flex flex-col items-center leading-tight">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{t('mapTools.distance.horizontal')}</span>
                        <span className="text-xl font-mono font-bold text-white tracking-tight">
                            {distance} <span className="text-sm font-normal text-slate-400">m</span>
                        </span>
                    </div>
                    <div className="flex flex-col items-center leading-tight pl-6">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{t('mapTools.distance.vertical')}</span>
                        <span className="text-xl font-mono font-bold text-yellow-500 tracking-tight">
                            {verticalDist} <span className="text-sm font-normal text-slate-400">m</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
