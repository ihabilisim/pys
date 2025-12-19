
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
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleNotificationClick = () => {
        resetUnreadCount();
        setIsNotifModalOpen(true);
    };

    // Get the latest notification
    const latestNotification = data.notifications.length > 0 ? data.notifications[0] : null;

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

            {/* Notification Info Window (Modal) */}
            {isNotifModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsNotifModalOpen(false)}>
                    <div className="bg-iha-800 w-full max-w-md rounded-2xl border border-iha-700 shadow-2xl overflow-hidden relative ring-1 ring-white/10 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent pointer-events-none"></div>
                        
                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
                                        latestNotification?.type === 'alert' 
                                            ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                                            : latestNotification?.type === 'info' 
                                                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' 
                                                : 'bg-blue-500/20 border-blue-500/30 text-blue-500'
                                    }`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {latestNotification?.type === 'alert' ? 'warning' : latestNotification?.type === 'info' ? 'info' : 'campaign'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {latestNotification ? (latestNotification.type === 'alert' ? 'Acil Bildirim' : 'Son Duyuru') : 'Bildirimler'}
                                        </h3>
                                        <p className="text-xs text-slate-400">Saha Yönetimi</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsNotifModalOpen(false)} className="text-slate-400 hover:text-white bg-iha-900/50 p-1.5 rounded-lg hover:bg-iha-700 transition-all">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            {latestNotification ? (
                                <div className="bg-iha-900/50 rounded-xl p-5 border border-iha-700/50">
                                    <p className="text-white text-sm leading-relaxed font-medium">
                                        {latestNotification.message[language]}
                                    </p>
                                    
                                    <div className="mt-4 pt-4 border-t border-iha-700/50 flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            {latestNotification.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            <span className="uppercase font-bold tracking-wider">{latestNotification.author}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                                    <p>{t('dashboard.noNotifications')}</p>
                                </div>
                            )}

                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => {
                                        setIsNotifModalOpen(false);
                                        const el = document.getElementById('dashboard');
                                        if(el) el.scrollIntoView({behavior: 'smooth'});
                                    }}
                                    className="flex-1 bg-iha-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                                >
                                    Tüm Bildirimleri Gör
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
