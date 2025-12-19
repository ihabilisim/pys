
import React from 'react';
import { StockItem } from '../../types';
import { useUI } from '../../context/UIContext';

interface StockWidgetProps {
    stocks: StockItem[];
    lang: 'tr' | 'en' | 'ro';
}

export const StockWidget: React.FC<StockWidgetProps> = ({ stocks, lang }) => {
    const { t } = useUI();
    return (
        <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-purple-500">inventory_2</span>{t('materials.stockTitle')}</h3>
            <div className="space-y-3">
                {stocks.map(stock => {
                    const isCritical = stock.currentQuantity <= stock.criticalLevel;
                    return (
                        <div key={stock.id} className={`flex items-center justify-between p-3 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-iha-900 border-iha-700'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-red-500 text-white' : 'bg-iha-800 text-slate-400'}`}><span className="material-symbols-outlined text-lg">{stock.icon}</span></div>
                                <div><p className="text-xs font-bold text-white">{stock.name[lang]}</p><p className="text-[10px] text-slate-500">{stock.unit}</p></div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>{stock.currentQuantity.toLocaleString()}</p>
                                {isCritical && <span className="text-[9px] text-red-500 font-bold uppercase animate-pulse">{t('materials.critical')}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
