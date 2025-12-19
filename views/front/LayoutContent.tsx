
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management */
import { useUI } from '../../context/UIContext';

export const LayoutContent: React.FC = () => {
  /* Use UI context for language management */
  const { language, t } = useUI();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
      <div className="aspect-video bg-iha-800 rounded-3xl border border-iha-700 flex flex-col items-center justify-center group hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer">
        <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
           <span className="material-symbols-outlined text-4xl text-blue-500">architecture</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">DWG {t('common.download')}</h3>
        <p className="text-slate-400 text-sm">v2.4 (2025-12-01)</p>
      </div>
      <div className="aspect-video bg-iha-800 rounded-3xl border border-iha-700 flex flex-col items-center justify-center group hover:shadow-2xl hover:shadow-red-500/10 transition-all cursor-pointer">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
           <span className="material-symbols-outlined text-4xl text-red-500">picture_as_pdf</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">PDF {t('common.download')}</h3>
        <p className="text-slate-400 text-sm">High Res / A0 Plot</p>
      </div>
    </div>
  );
};
