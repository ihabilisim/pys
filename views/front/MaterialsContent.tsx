
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management and translation */
import { useUI } from '../../context/UIContext';

export const MaterialsContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management and translation */
  const { language, t } = useUI();

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
          {/* Stock Section */}
          <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">inventory_2</span>
                  {t('materials.stockTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.stocks.map(stock => {
                      const isCritical = stock.currentQuantity <= stock.criticalLevel;
                      return (
                          <div key={stock.id} className={`p-4 rounded-xl border flex justify-between items-center ${isCritical ? 'bg-red-900/20 border-red-500/50' : 'bg-iha-900 border-iha-700'}`}>
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500 text-white' : 'bg-iha-800 text-slate-400'}`}>
                                      <span className="material-symbols-outlined">{stock.icon}</span>
                                  </div>
                                  <div>
                                      <p className="text-xs text-slate-400 uppercase font-bold">{stock.name[language]}</p>
                                      <p className="text-white font-mono text-lg font-bold">{stock.currentQuantity.toLocaleString()} {stock.unit}</p>
                                  </div>
                              </div>
                              {isCritical && <span className="material-symbols-outlined text-red-500 animate-pulse">warning</span>}
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* BoQ Section */}
          <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">request_quote</span>
                  {t('materials.boqTitle')}
              </h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-iha-900 text-slate-500 text-xs uppercase">
                          <tr>
                              <th className="p-3">{t('materials.boqCode')}</th>
                              <th className="p-3">{t('materials.boqItem')}</th>
                              <th className="p-3 text-right">{t('materials.boqTotal')}</th>
                              <th className="p-3 text-right">{t('materials.boqDone')}</th>
                              <th className="p-3 w-32">{t('materials.boqProgress')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-iha-700">
                          {data.boqItems.map(item => {
                              const percent = Math.min(100, (item.completedQuantity / item.totalQuantity) * 100);
                              return (
                                  <tr key={item.id} className="hover:bg-iha-900/50">
                                      <td className="p-3 font-mono text-xs text-blue-400">{item.code}</td>
                                      <td className="p-3 font-medium text-white">{item.name[language]}</td>
                                      <td className="p-3 text-right font-mono">{item.totalQuantity.toLocaleString()} {item.unit}</td>
                                      <td className="p-3 text-right font-mono text-emerald-400">{item.completedQuantity.toLocaleString()}</td>
                                      <td className="p-3">
                                          <div className="w-full bg-iha-900 rounded-full h-1.5 overflow-hidden">
                                              <div style={{ width: `${percent}%` }} className="bg-blue-500 h-full rounded-full"></div>
                                          </div>
                                          <p className="text-[9px] text-right mt-1 text-slate-500">{percent.toFixed(1)}%</p>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );
};
