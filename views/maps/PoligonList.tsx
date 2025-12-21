
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access translation */
import { useUI } from '../../context/UIContext';
import { PolygonPoint } from '../../types';

interface PoligonListProps {
    onFlyTo: (point: PolygonPoint) => void;
}

const STATUS_COLORS: Record<string, string> = {
    'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'LOST': 'bg-red-500/20 text-red-400 border-red-500/30',
    'DAMAGED': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
};

export const PoligonList: React.FC<PoligonListProps> = ({ onFlyTo }) => {
    const { data } = useData();
    /* Use UI context for translation function */
    const { t } = useUI();
    const [topoSearch, setTopoSearch] = useState('');

    const filteredPoints = data.polygonPoints.filter(p => 
        p.polygonNo.toLowerCase().includes(topoSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(topoSearch.toLowerCase())
    );

    const activeCount = data.polygonPoints.filter(p => p.status === 'ACTIVE').length;

    const getStatusLabel = (status: string) => {
        if (status === 'ACTIVE') return t('topo.grid.active');
        if (status === 'LOST') return t('topo.grid.lost');
        if (status === 'DAMAGED') return t('topo.grid.damaged');
        return status;
    };

    return (
        <div className="flex flex-col h-full bg-iha-800 border-t border-iha-700">
            {/* Toolbar Area */}
            <div className="flex items-center justify-between p-4 border-b border-iha-700 bg-iha-900/50">
                <div className="flex items-center gap-6">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-emerald-500">format_list_bulleted</span>
                        POLİGON ENVANTERİ
                    </h3>
                    <div className="flex items-center gap-2 text-xs bg-iha-900 px-3 py-1 rounded border border-iha-700">
                        <span className="text-slate-500">{t('topo.grid.totalActive')}:</span>
                        <span className="text-emerald-400 font-mono font-bold">{activeCount}</span>
                    </div>
                </div>
                
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-500 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder={t('topo.grid.searchPlaceholder')}
                        value={topoSearch}
                        onChange={(e) => setTopoSearch(e.target.value)}
                        className="bg-iha-900 border border-iha-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-iha-blue w-64 transition-all focus:w-80"
                    />
                </div>
            </div>

            {/* Data Grid Area */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-iha-800 relative">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-iha-900 text-slate-500 uppercase font-bold sticky top-0 z-10 shadow-md">
                        <tr>
                            <th className="p-3 w-20 text-center">{t('topo.grid.pNo')}</th>
                            <th className="p-3 w-24 text-center">{t('topo.grid.status')}</th>
                            <th className="p-3">{t('topo.grid.roadName')}</th>
                            <th className="p-3 w-24 font-mono text-center">{t('topo.grid.km')}</th>
                            <th className="p-3 w-24 font-mono text-right">{t('topo.grid.offset')}</th>
                            <th className="p-3 w-32 font-mono text-right">{t('topo.grid.east')}</th>
                            <th className="p-3 w-32 font-mono text-right">{t('topo.grid.north')}</th>
                            <th className="p-3 w-24 font-mono text-right text-yellow-500">{t('topo.grid.elevation')}</th>
                            <th className="p-3 w-20 text-center">{t('topo.grid.map')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-iha-700/50">
                        {filteredPoints.map(p => {
                            const isActive = p.status === 'ACTIVE';
                            return (
                                <tr 
                                    key={p.id} 
                                    onClick={() => isActive && onFlyTo(p)}
                                    className={`transition-colors border-b border-iha-700/30 hover:bg-white/5 cursor-pointer group ${!isActive ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <td className="p-3 text-center font-bold text-white border-r border-iha-700/50">
                                        {p.polygonNo}
                                    </td>
                                    <td className="p-3 text-center border-r border-iha-700/50">
                                        <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_COLORS[p.status] || STATUS_COLORS['ACTIVE']}`}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium text-slate-200 border-r border-iha-700/50">{p.roadName || '-'}</td>
                                    <td className="p-3 font-mono text-center border-r border-iha-700/50 text-blue-300">{p.km || '-'}</td>
                                    <td className="p-3 font-mono text-right border-r border-iha-700/50">{p.offset || '-'}</td>
                                    <td className="p-3 font-mono text-right text-slate-400 border-r border-iha-700/50">{p.east}</td>
                                    <td className="p-3 font-mono text-right text-slate-400 border-r border-iha-700/50">{p.north}</td>
                                    <td className="p-3 font-mono text-right font-bold text-yellow-500 border-r border-iha-700/50">{p.elevation}</td>
                                    <td className="p-3 text-center">
                                        {isActive && (
                                            <button className="text-slate-500 hover:text-blue-400 transition-colors">
                                                <span className="material-symbols-outlined text-lg">my_location</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredPoints.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-12 text-center text-slate-500 italic flex flex-col items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-3xl opacity-50">search_off</span>
                                    {t('topo.grid.noResult')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
