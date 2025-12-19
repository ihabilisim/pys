
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';

interface AreaVolumeToolProps {
    area: string;
    pointsCount: number;
}

export const AreaVolumeTool: React.FC<AreaVolumeToolProps> = ({ area, pointsCount }) => {
    const { t } = useUI();
    const [showVolumeInput, setShowVolumeInput] = useState(false);
    const [volumeDepth, setVolumeDepth] = useState<number>(0);
    const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null);
    const [calculatedAreaState, setCalculatedAreaState] = useState<number>(0);

    const handleCalculateClick = () => {
        if (!area) return;
        setCalculatedAreaState(parseFloat(area.replace(/[^\d.]/g, '')));
        setShowVolumeInput(true);
    };

    const submitVolume = () => {
        setCalculatedVolume(calculatedAreaState * volumeDepth);
        setShowVolumeInput(false);
    };

    const closeResult = () => {
        setCalculatedVolume(null);
        setShowVolumeInput(false);
    };

    return (
        <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none">
                <div className="bg-purple-600/90 backdrop-blur text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-purple-400/30 whitespace-nowrap uppercase tracking-widest">
                    {t('mapTools.area.instruction')}
                </div>
                
                {area && !calculatedVolume && !showVolumeInput && (
                    <div className="bg-iha-900/90 backdrop-blur border border-iha-600 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 pointer-events-auto">
                        <span className="w-2 h-2 rounded-full animate-pulse bg-purple-500"></span>
                        <div className="flex flex-col items-center leading-tight">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{t('mapTools.area.label')}</span>
                            <span className="text-lg font-mono font-bold text-white">{area} m²</span>
                        </div>
                        {pointsCount > 2 && (
                            <button onClick={handleCalculateClick} className="ml-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors">{t('mapTools.area.volumeCalc')}</button>
                        )}
                    </div>
                )}
            </div>

            {showVolumeInput && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-iha-800 border border-iha-600 p-5 rounded-2xl shadow-2xl z-[1001] w-72 animate-in zoom-in-95 pointer-events-auto">
                    <h4 className="text-white font-bold mb-2">{t('mapTools.area.volumeTitle')}</h4>
                    <p className="text-xs text-slate-400 mb-4">{t('mapTools.area.selectedArea')}: <span className="text-white font-mono">{calculatedAreaState.toFixed(2)} m²</span></p>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">{t('mapTools.area.avgDepth')}</label>
                    <input type="number" value={volumeDepth} onChange={(e) => setVolumeDepth(parseFloat(e.target.value))} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white mb-4 focus:outline-none focus:border-purple-500" autoFocus />
                    <div className="flex gap-2"><button onClick={submitVolume} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm">{t('mapTools.area.calculate')}</button><button onClick={closeResult} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-sm">{t('common.cancel')}</button></div>
                </div>
            )}

            {calculatedVolume !== null && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-iha-800/95 backdrop-blur border border-iha-600 px-8 py-4 rounded-2xl shadow-2xl z-[1000] flex gap-8 animate-in slide-in-from-bottom-4 pointer-events-auto">
                    <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('mapTools.area.label')}</p><p className="text-xl font-bold text-white font-mono">{calculatedAreaState.toFixed(2)} m²</p></div>
                    <div className="w-px bg-iha-600"></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('mapTools.area.estVolume')}</p><p className="text-xl font-bold text-yellow-400 font-mono">{calculatedVolume.toFixed(2)} m³</p></div>
                    <button onClick={closeResult} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
            )}
        </>
    );
};
