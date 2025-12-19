
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management */
import { useUI } from '../../context/UIContext';

export const MachineryContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management and translation */
  const { language, t } = useUI();

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">agriculture</span>
                  {data.menuConfig['machinery'][language]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.dashboardWidgets.machinery.map(m => (
                      <div key={m.id} className="bg-iha-900 border border-iha-700 p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <span className="material-symbols-outlined text-8xl">{m.icon}</span>
                          </div>
                          <div className="relative z-10">
                              <h4 className="text-xl font-bold text-white mb-4">{m.name[language]}</h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="bg-iha-800 rounded-xl p-3 border border-iha-700">
                                      <span className="block text-2xl font-bold text-white">{m.total}</span>
                                      <span className="text-[10px] uppercase text-slate-500 font-bold">{t('common.total')}</span>
                                  </div>
                                  <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                                      <span className="block text-2xl font-bold text-green-500">{m.active}</span>
                                      <span className="text-[10px] uppercase text-green-400 font-bold">{t('common.active')}</span>
                                  </div>
                                  <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                                      <span className="block text-2xl font-bold text-red-500">{m.maintenance}</span>
                                      <span className="text-[10px] uppercase text-red-400 font-bold">{t('common.maintenance')}</span>
                                  </div>
                              </div>
                              {/* Progress Bar Visual */}
                              <div className="mt-4 h-2 bg-iha-800 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${(m.active/m.total)*100}%` }} className="bg-green-500"></div>
                                  <div style={{ width: `${(m.maintenance/m.total)*100}%` }} className="bg-red-500"></div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};
