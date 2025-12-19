
import React from 'react';
import { useData } from '../context/DataContext';
/* Import useUI to access language management */
import { useUI } from '../context/UIContext';

export const Footer: React.FC = () => {
    const { data } = useData();
    /* Use UI context for language management */
    const { language } = useUI();

    return (
        <footer className="bg-iha-900 border-t border-iha-700 py-8 px-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">
                        {data.settings.companyName[language]}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        {data.settings.footerProjectName[language]}
                    </p>
                </div>
                <div className="flex flex-col items-center md:items-end">
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} {data.settings.copyrightText[language]}
                    </p>
                    <div className="flex gap-4 mt-2">
                        <span className="text-[10px] text-slate-700 hover:text-slate-500 cursor-pointer transition-colors">
                            {data.settings.privacyText[language]}
                        </span>
                        <span className="text-[10px] text-slate-700 hover:text-slate-500 cursor-pointer transition-colors">
                            {data.settings.termsText[language]}
                        </span>
                        <span className="text-[10px] text-slate-700 font-mono">
                            {data.settings.version}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
