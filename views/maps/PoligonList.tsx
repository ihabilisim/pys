
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
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 flex flex-col shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">format_list_bulleted</span>
                        {t('topo.grid.totalActive')}:
                        <span className="ml-1 text-emerald-400 font-mono text-xl">{activeCount}</span>
                    </h3>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-500 text-sm">search</span>
                        <input 
                            type="text" 
                            placeholder={t('topo.grid.searchPlaceholder')}
                            value={topoSearch}
                            onChange={(e) => setTopoSearch(e.target.value)}
                            className="bg-iha-900 border border-iha-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white outline-none focus:border-iha-blue w-48 transition-all focus:w-64"
                        />
                    </div>
                </div>
                {/* max-h-[280px] corresponds roughly to 5 rows + header */}
                <div className="overflow-auto custom-scrollbar flex-1 bg-iha-900/50 rounded-xl border border-iha-700/50 max-h-[280px]">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-iha-900 sticky top-0 text-xs uppercase z-10 shadow-sm">
                            <tr>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.pNo')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.status')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.roadName')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.km')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.offset')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.east')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.north')}</th>
                                <th className="p-3 font-semibold text-slate-400">{t('topo.grid.elevation')}</th>
                                <th className="p-3 text-right font-semibold text-slate-400">{t('topo.grid.map')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-iha-700">
                            {filteredPoints.map(p => {
                                const isActive = p.status === 'ACTIVE';
                                return (
                                    <tr 
                                        key={p.id} 
                                        onClick={() => isActive && onFlyTo(p)}
                                        className={`transition-colors border-b border-iha-800 last:border-0 ${isActive ? 'hover:bg-iha-800 group cursor-pointer' : 'bg-red-900/10 opacity-70 cursor-not-allowed'}`}
                                    >
                                        <td className={`p-3 font-bold border-l-2 transition-all ${isActive ? 'text-white border-transparent group-hover:border-emerald-500' : 'text-red-400 line-through border-red-500'}`}>
                                            {p.polygonNo}
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_COLORS[p.status] || STATUS_COLORS['ACTIVE']}`}>
                                                {getStatusLabel(p.status)}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium text-xs">{p.roadName || '-'}</td>
                                        <td className="p-3 font-mono text-xs">{p.km || '-'}</td>
                                        <td className="p-3 font-mono text-xs">{p.offset || '-'}</td>
                                        <td className="p-3 font-mono text-xs">{p.east}</td>
                                        <td className="p-3 font-mono text-xs">{p.north}</td>
                                        <td className={`p-3 font-mono text-xs font-bold ${isActive ? 'text-yellow-500' : 'text-slate-500'}`}>{p.elevation}</td>
                                        <td className="p-3 text-right">
                                            {isActive && (
                                                <div className="inline-flex items-center justify-center p-1.5 rounded-lg text-blue-500 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-lg">my_location</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredPoints.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-500 italic">{t('topo.grid.noResult')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
