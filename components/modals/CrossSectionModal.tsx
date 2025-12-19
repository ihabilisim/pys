
import React from 'react';
import { useUI } from '../../context/UIContext';

interface CrossSectionModalProps {
    km: string;
    onClose: () => void;
}

export const CrossSectionModal: React.FC<CrossSectionModalProps> = ({ km, onClose }) => {
    const { t } = useUI();
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-iha-800 w-full max-w-4xl rounded-2xl border border-iha-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-iha-700 flex justify-between items-center bg-iha-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">{km.replace('KM ', '')}</div>
                        <div><h3 className="text-white font-bold">{t('crossSection.title')}</h3><p className="text-xs text-slate-400">{t('crossSection.subtitle')}</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="flex-1 p-8 bg-[#0f172a] overflow-auto flex items-center justify-center">
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
                        <rect x="390" y="125" width="20" height="15" fill="#64748b" />
                        <text x="400" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">{t('crossSection.median')}</text>
                        <line x1="400" y1="130" x2="400" y2="280" stroke="#3b82f6" strokeWidth="1" strokeDasharray="10,5" opacity="0.3" />
                        <text x="300" y="100" fill="#3b82f6" fontSize="14" fontWeight="bold" textAnchor="middle">{t('crossSection.lane')} 1</text>
                        <text x="500" y="100" fill="#3b82f6" fontSize="14" fontWeight="bold" textAnchor="middle">{t('crossSection.lane')} 2</text>
                        <line x1="215" y1="90" x2="390" y2="90" stroke="white" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                        <text x="300" y="85" fill="white" fontSize="12" textAnchor="middle">10.50m</text>
                        <line x1="410" y1="90" x2="585" y2="90" stroke="white" />
                        <text x="500" y="85" fill="white" fontSize="12" textAnchor="middle">10.50m</text>
                    </svg>
                </div>
                <div className="p-4 border-t border-iha-700 bg-iha-800 rounded-b-2xl flex justify-between items-center text-xs text-slate-400"><span>Drawing No: TCS-01-A</span><span>Scale: 1:50</span></div>
            </div>
        </div>
    );
};
