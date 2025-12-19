
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management and translations */
import { useUI } from '../../context/UIContext';

export const InfraContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management and translations */
  const { language, t } = useUI();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.infraProjects.map(proj => (
                <div key={proj.id} className="bg-iha-800 p-6 rounded-2xl border border-iha-700 hover:border-iha-blue/50 transition-all group hover:shadow-xl hover:shadow-blue-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-iha-900 rounded-xl flex items-center justify-center text-blue-500 border border-iha-700 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                            <span className="material-symbols-outlined text-2xl">foundation</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-iha-900 px-2 py-1 rounded border border-iha-700">Rev: A</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={proj.name[language]}>{proj.name[language]}</h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{proj.description[language]}</p>
                    <div className="pt-4 border-t border-iha-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500">ID: {proj.id.substring(0,6)}</span>
                        <a href={proj.link} target="_blank" className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20">
                            {t('common.detail')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {data.infraProjects.length === 0 && (
                <div className="col-span-full p-12 text-center border-2 border-dashed border-iha-700 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">folder_off</span>
                    <p className="text-slate-500">{t('infra.noProjects')}</p>
                </div>
            )}
        </div>
    </div>
  );
};
