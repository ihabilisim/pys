
import React, { forwardRef } from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language, translations and active tab management */
import { useUI } from '../../context/UIContext';

export const DashboardBottomContent = forwardRef<HTMLDivElement>((_, ref) => {
  const { data } = useData();
  /* Use UI context for language, translations and active tab management */
  const { language, setActiveTab, t } = useUI();
  const labels = data.menuConfig;

  return (
    <div className="space-y-6 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Notifications List */}
        <div ref={ref} className="bg-iha-800 rounded-2xl border border-iha-700 p-6 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-iha-blue">notifications_active</span>
                    {t('dashboard.liveFeed')}
                </h3>
            </div>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {data.notifications.map((note) => (
                    <div key={note.id} className="flex gap-4 p-4 rounded-xl bg-iha-900/50 hover:bg-iha-900 transition-colors border border-iha-700/50 items-start group">
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300 ${note.type === 'alert' ? 'bg-red-500' : note.type === 'info' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium leading-relaxed">{note.message[language]}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-slate-500 flex items-center gap-1 bg-iha-900/50 px-2 py-0.5 rounded border border-iha-700/30">
                                    {note.date}
                                </span>
                                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">{note.author}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {data.notifications.length === 0 && (
                    <div className="text-center text-slate-500 py-4 text-xs italic">{t('dashboard.noNotifications')}</div>
                )}
            </div>
        </div>

        {/* Dashboard Shortcuts */}
        {data.shortcuts.length > 0 && (
            <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    {t('dashboard.favorites')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.shortcuts.map(item => (
                        <a key={item.id} href={item.pathOrUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col p-4 bg-iha-900 rounded-xl border border-iha-700 hover:border-iha-blue hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${item.type === 'PDF' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {item.type}
                                </div>
                                <span className="material-symbols-outlined text-slate-500 text-sm group-hover:text-iha-blue">open_in_new</span>
                            </div>
                            <h4 className="text-white font-medium text-sm line-clamp-1">{item.name[language]}</h4>
                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description[language]}</p>
                        </a>
                    ))}
                </div>
            </div>
        )}

        {/* Dashboard Bottom Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => setActiveTab('pvla')} className="bg-iha-800 p-4 rounded-xl border border-iha-700 hover:bg-iha-700 cursor-pointer transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 group-hover:text-white group-hover:bg-blue-500 transition-all">
                    <span className="material-symbols-outlined">folder_shared</span>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">{labels['pvla'][language]}</h4>
                    <p className="text-slate-500 text-xs">{t('sidebar.pvla')}</p>
                </div>
            </div>
            
            <div onClick={() => setActiveTab('infra')} className="bg-iha-800 p-4 rounded-xl border border-iha-700 hover:bg-iha-700 cursor-pointer transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 group-hover:text-white group-hover:bg-purple-500 transition-all">
                    <span className="material-symbols-outlined">foundation</span>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">{labels['infra'][language]}</h4>
                    <p className="text-slate-500 text-xs">{t('sidebar.infra')}</p>
                </div>
            </div>
            
            <div onClick={() => setActiveTab('topo')} className="bg-iha-800 p-4 rounded-xl border border-iha-700 hover:bg-iha-700 cursor-pointer transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 group-hover:text-white group-hover:bg-emerald-500 transition-all">
                    <span className="material-symbols-outlined">landscape</span>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">{labels['topo'][language]}</h4>
                    <p className="text-slate-500 text-xs">{t('sidebar.topo')}</p>
                </div>
            </div>
            
            <div onClick={() => setActiveTab('layout')} className="bg-iha-800 p-4 rounded-xl border border-iha-700 hover:bg-iha-700 cursor-pointer transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 group-hover:text-white group-hover:bg-orange-500 transition-all">
                    <span className="material-symbols-outlined">map</span>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">{labels['layout'][language]}</h4>
                    <p className="text-slate-500 text-xs">{t('sidebar.layout')}</p>
                </div>
            </div>
        </div>
    </div>
  );
});

DashboardBottomContent.displayName = 'DashboardBottomContent';
