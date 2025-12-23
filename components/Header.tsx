
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
/* Import useUI to access language, active tab, and translation function */
import { useUI } from '../context/UIContext';

interface HeaderProps {
    onMenuClick: () => void;
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
    const { unreadCount, resetUnreadCount, data } = useData();
    /* Use UI context for language and localization related states */
    const { language, setLanguage, activeTab, t } = useUI();
    const [currentTime, setCurrentTime] = React.useState(new Date());
    // const [isNotifModalOpen, setIsNotifModalOpen] = useState(false); // Feature disabled

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleNotificationClick = () => {
        resetUnreadCount();
        // setIsNotifModalOpen(true); // Feature disabled
    };

    // Get the latest notification
    // const latestNotification = data.notifications.length > 0 ? data.notifications[0] : null;

    return (
        <>
            <header className="h-16 border-b border-iha-700 flex items-center justify-between px-4 md:px-8 bg-iha-900/90 backdrop-blur-md sticky top-0 z-30 shadow-sm transition-all">
                {/* Left: Title & Menu Toggle */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={onMenuClick}>
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-[10px] text-slate-400 hidden sm:block uppercase tracking-wider">
                            {/* Try to translate the tab name, fallback to data menu or 'View' */}
                            {t(`sidebar.${activeTab}`) !== `sidebar.${activeTab}` 
                                ? t(`sidebar.${activeTab}`) 
                                : (data.menuConfig[activeTab] ? data.menuConfig[activeTab][language] : t('header.view'))
                            }
                        </p>
                    </div>
                </div>

                {/* Right: Actions & Language */}
                <div className="flex items-center gap-6">
                    
                    {/* Clock (Hidden on Mobile) */}
                    <div className="text-right hidden lg:block">
                        <p className="text-xs text-slate-300 font-mono font-medium">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-slate-500">
                            {currentTime.toLocaleDateString()}
                        </p>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center bg-iha-800 rounded-lg p-1 border border-iha-700">
                        <button 
                            onClick={() => setLanguage('tr')} 
                            className={`w-8 h-6 flex items-center justify-center rounded transition-all ${language === 'tr' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`}
                            title="Türkçe"
                        >
                            <span className="text-lg leading-none">🇹🇷</span>
                        </button>
                        <button 
                            onClick={() => setLanguage('en')} 
                            className={`w-8 h-6 flex items-center justify-center rounded transition-all ${language === 'en' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`}
                            title="English"
                        >
                            <span className="text-lg leading-none">🇬🇧</span>
                        </button>
                        <button 
                            onClick={() => setLanguage('ro')} 
                            className={`w-8 h-6 flex items-center justify-center rounded transition-all ${language === 'ro' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`}
                            title="Română"
                        >
                            <span className="text-lg leading-none">🇷🇴</span>
                        </button>
                    </div>

                    <div className="h-8 w-px bg-iha-700 mx-2 hidden sm:block"></div>

                    {/* Notifications */}
                    <button 
                        onClick={handleNotificationClick} 
                        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-iha-800 transition-colors group border border-transparent hover:border-iha-700"
                    >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-iha-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Network Status */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-iha-800 rounded-full border border-iha-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-300">{t('header.online')}</span>
                    </div>
                </div>
            </header>
        </>
    );
};
