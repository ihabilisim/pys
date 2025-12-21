
import React from 'react';
import { useUI } from '../../context/UIContext';
import { ChainageMarker } from '../../types';

interface CrossSectionModalProps {
    marker: ChainageMarker | null;
    onClose: () => void;
}

export const CrossSectionModal: React.FC<CrossSectionModalProps> = ({ marker, onClose }) => {
    const { t } = useUI();
    
    if (!marker) return null;

    const km = marker.km;
    const type = marker.type || 'MAIN';
    const roadName = marker.roadName || 'Unknown Road';

    // --- MAIN ROAD SVG (2x2 + Median) ---
    const renderMainRoad = () => (
        <svg viewBox="0 0 800 300" className="w-full h-full max-h-[400px]">
            <rect x="0" y="0" width="800" height="300" fill="#0f172a" />
            <path d="M0,250 L200,220 L600,220 L800,250" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" fill="none" />
            <text x="50" y="270" fill="#64748b" fontSize="12">{t('crossSection.ngl')}</text>
            <path d="M150,220 L650,220 L620,180 L180,180 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x="400" y="205" fill="#94a3b8" fontSize="10" textAnchor="middle">{t('crossSection.subgrade')}</text>
            <path d="M180,180 L620,180 L600,160 L200,160 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            <text x="400" y="175" fill="#cbd5e1" fontSize="10" textAnchor="middle">{t('crossSection.base')}</text>
            <path d="M200,160 L600,160 L590,140 L210,140 Z" fill="#1e293b" stroke="#000" strokeWidth="1" />
            <text x="400" y="153" fill="white" fontSize="10" textAnchor="middle">{t('crossSection.binder')}</text>
            <path d="M210,140 L590,140 L585,130 L215,130 Z" fill="#0f172a" stroke="white" strokeWidth="1" />
            <text x="400" y="120" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">{t('crossSection.wearing')}</text>
            {/* Median */}
            <rect x="390" y="125" width="20" height="15" fill="#64748b" />
            <text x="400" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">{t('crossSection.median')}</text>
            <line x1="400" y1="130" x2="400" y2="280" stroke="#3b82f6" strokeWidth="1" strokeDasharray="10,5" opacity="0.3" />
            {/* Lanes */}
            <text x="300" y="100" fill="#3b82f6" fontSize="14" fontWeight="bold" textAnchor="middle">{t('crossSection.lane')} 1</text>
            <text x="500" y="100" fill="#3b82f6" fontSize="14" fontWeight="bold" textAnchor="middle">{t('crossSection.lane')} 2</text>
            <line x1="215" y1="90" x2="390" y2="90" stroke="white" />
            <text x="300" y="85" fill="white" fontSize="12" textAnchor="middle">10.50m</text>
            <line x1="410" y1="90" x2="585" y2="90" stroke="white" />
            <text x="500" y="85" fill="white" fontSize="12" textAnchor="middle">10.50m</text>
        </svg>
    );

    // --- SECONDARY / RAMP (Single Carriageway) ---
    const renderSingleRoad = () => (
        <svg viewBox="0 0 800 300" className="w-full h-full max-h-[400px]">
            <rect x="0" y="0" width="800" height="300" fill="#0f172a" />
            {/* NGL */}
            <path d="M0,250 L800,230" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" fill="none" />
            {/* Layers */}
            <path d="M250,230 L550,230 L530,200 L270,200 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <path d="M270,200 L530,200 L520,180 L280,180 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M280,180 L520,180 L515,170 L285,170 Z" fill="#0f172a" stroke="white" strokeWidth="1" />
            
            {/* Centerline */}
            <line x1="400" y1="170" x2="400" y2="260" stroke="#eab308" strokeWidth="2" strokeDasharray="15,10" />
            <text x="400" y="160" fill="#eab308" fontSize="12" fontWeight="bold" textAnchor="middle">CL</text>

            {/* Dims */}
            <line x1="285" y1="150" x2="515" y2="150" stroke="white" />
            <text x="400" y="145" fill="white" fontSize="12" textAnchor="middle">{type === 'RAMP' ? '5.50m (Ramp)' : '7.00m (Road)'}</text>
        </svg>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-iha-800 w-full max-w-4xl rounded-2xl border border-iha-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-iha-700 flex justify-between items-center bg-iha-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">{km.replace('KM ', '')}</div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{roadName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${type === 'MAIN' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-orange-500/20 text-orange-400 border-orange-500/50'}`}>
                                    {type} KESİT
                                </span>
                                <span className="text-xs text-slate-400">Typical Cross Section</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="flex-1 p-8 bg-[#0f172a] overflow-auto flex items-center justify-center">
                    {type === 'MAIN' ? renderMainRoad() : renderSingleRoad()}
                </div>
                <div className="p-4 border-t border-iha-700 bg-iha-800 rounded-b-2xl flex justify-between items-center text-xs text-slate-400"><span>Drawing No: TCS-01-A</span><span>Scale: 1:50</span></div>
            </div>
        </div>
    );
};
