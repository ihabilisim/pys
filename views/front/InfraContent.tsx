
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management and translations */
import { useUI } from '../../context/UIContext';

export const InfraContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management and translations */
  const { language, t } = useUI();
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'LAYOUT'>('PROJECTS');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
        
        {/* TAB SWITCHER */}
        <div className="flex justify-center">
            <div className="bg-iha-800 p-1.5 rounded-2xl border border-iha-700 inline-flex shadow-lg">
                <button 
                    onClick={() => setActiveTab('PROJECTS')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'PROJECTS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-sm">foundation</span>
                    {t('sidebar.infra')}
                </button>
                <button 
                    onClick={() => setActiveTab('LAYOUT')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'LAYOUT' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-sm">map</span>
                    {t('sidebar.layout')}
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative">
            
            {/* 1. INFRASTRUCTURE PROJECTS */}
            {activeTab === 'PROJECTS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
                    {data.infraProjects.map(proj => (
                        <div key={proj.id} className="bg-iha-800 p-6 rounded-2xl border border-iha-700 hover:border-blue-500/50 transition-all group hover:shadow-xl hover:shadow-blue-900/10">
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
                        <div className="col-span-full p-12 text-center border-2 border-dashed border-iha-700 rounded-2xl bg-iha-800/50">
                            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">folder_off</span>
                            <p className="text-slate-500">{t('infra.noProjects')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* 2. GENERAL LAYOUT */}
            {activeTab === 'LAYOUT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="aspect-video bg-iha-800 rounded-3xl border border-iha-700 flex flex-col items-center justify-center group hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-iha-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-iha-700 group-hover:border-orange-500/30 z-10">
                           <span className="material-symbols-outlined text-4xl text-orange-500">architecture</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 z-10">DWG {t('common.download')}</h3>
                        <p className="text-slate-400 text-sm z-10">v2.4 (2025-12-01)</p>
                    </div>
                    
                    <div className="aspect-video bg-iha-800 rounded-3xl border border-iha-700 flex flex-col items-center justify-center group hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-iha-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-iha-700 group-hover:border-red-500/30 z-10">
                           <span className="material-symbols-outlined text-4xl text-red-500">picture_as_pdf</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 z-10">PDF {t('common.download')}</h3>
                        <p className="text-slate-400 text-sm z-10">High Res / A0 Plot</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
