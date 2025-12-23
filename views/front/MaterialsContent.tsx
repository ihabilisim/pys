
import React from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { StockWidget } from '../../components/Analytics';

export const MaterialsContent: React.FC = () => {
  const { data, deleteBoQItem, updateBoQItem } = useData();
  const { language, t } = useUI();

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
          {/* Stock Section - Using Shared Widget */}
          <StockWidget stocks={data.stocks} lang={language} />

          {/* BoQ Section - Specific Logic Kept Here */}
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
