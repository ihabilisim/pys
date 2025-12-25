
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { MenuItemConfig, ChatConversation } from '../types';
import { apiService } from '../services/api';

interface TopNavbarProps {
    onLogin?: () => void;
    onProfileClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onLogin, onProfileClick }) => {
    const { data, unreadCount: systemUnreadCount, notifications, markNotificationRead, markAllNotificationsRead } = useData();
    const { currentUser } = useAuth();
    const { language, setLanguage, activeTab, setActiveTab } = useUI();
    
    // States for Notification Popover
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    
    // Chat Unread Logic
    const [unreadConversations, setUnreadConversations] = useState<ChatConversation[]>([]);
    
    const notifRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Poll for Unread Chats (Or rely on subscription if implemented in ChatService context - simulating here)
    useEffect(() => {
        const checkUnreadChats = async () => {
            if (!currentUser) return;
            const convs = await apiService.fetchConversations(currentUser.id);
            setUnreadConversations(convs.filter(c => (c.unreadCount || 0) > 0));
        };
        
        if (currentUser) {
            checkUnreadChats();
            const interval = setInterval(checkUnreadChats, 10000); // Check every 10s
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const totalUnread = systemUnreadCount + unreadConversations.length;

    // Compute dynamic menu items from data context
    const menuItems = useMemo(() => {
        return data.menuStructure
            .filter(item => item.visible)
            .sort((a, b) => a.order - b.order);
    }, [data.menuStructure]);

    const handleTabClick = (id: string) => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
        setHoveredMenuId(null);
    };

    const handleNotificationClick = (type: 'CHAT' | 'SYSTEM', id: string, link?: string) => {
        if (type === 'CHAT') {
            setActiveTab('chat');
            // Assuming chat module handles selecting conversation if passed in URL or state
        } else {
            markNotificationRead(id);
            if (link) setActiveTab(link);
        }
        setIsNotifOpen(false);
    };

    // Recursive Dropdown Renderer for Desktop
    const renderDesktopMenuItem = (item: MenuItemConfig) => {
        const hasChildren = item.children && item.children.length > 0;
        const isActive = activeTab === item.id || (hasChildren && item.children?.some(c => c.id === activeTab));
        const isHovered = hoveredMenuId === item.id;

        return (
            <div 
                key={item.id} 
                className="relative"
                onMouseEnter={() => setHoveredMenuId(item.id)}
                onMouseLeave={() => setHoveredMenuId(null)}
            >
                <button
                    onClick={() => !hasChildren && handleTabClick(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 z-10 ${
                        isActive
                            ? 'text-white bg-blue-600 shadow-lg shadow-blue-600/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <span className={`material-symbols-outlined text-[14px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
                    {item.label[language]}
                    {hasChildren && <span className="material-symbols-outlined text-[12px] opacity-70">expand_more</span>}
                </button>

                {/* Dropdown Menu - Sleek & Compact */}
                {hasChildren && (
                    <div 
                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl transition-all duration-200 origin-top z-[100] overflow-hidden ${
                            isHovered ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
                        }`}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e293b]/95 border-l border-t border-white/10 rotate-45"></div>
                        <div className="relative py-1 z-10">
                            {item.children!.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => handleTabClick(child.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-left transition-colors hover:bg-white/5 ${
                                        activeTab === child.id 
                                            ? 'text-blue-400' 
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text--[12px] opacity-70">{child.icon}</span>
                                    {child.label[language]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className="sticky top-0 z-50 w-full h-12 bg-iha-900/95 backdrop-blur-md border-b border-iha-700 transition-all shadow-sm">
            <div className="max-w-[1920px] mx-auto px-4 h-full">
                <div className="flex items-center justify-between h-full">
                    
                    {/* 1. LEFT: LOGO (Compact) */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
                        {data.settings.logoUrl ? (
                            <img src={data.settings.logoUrl} alt="Logo" className="h-6 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-white text-sm">engineering</span>
                            </div>
                        )}
                        <div className="hidden lg:block leading-none">
                            <h1 className="text-white font-bold text-xs tracking-tight group-hover:text-blue-400 transition-colors">MAKYOL <span className="font-normal opacity-70">PYS</span></h1>
                            <p className="text-[8px] text-slate-300 uppercase tracking-[0.15em] font-bold mt-0.5">Lot 1 • Sibiu</p>
                        </div>
                    </div>

                    {/* 2. CENTER: NAVIGATION (Slimmer Pill) */}
                    <div className="hidden xl:flex items-center justify-center flex-1 mx-4">
                        <div className="flex items-center gap-0.5 bg-iha-800/80 border border-iha-700 rounded-full p-0.5 backdrop-blur-sm shadow-sm">
                            {menuItems.map((item) => renderDesktopMenuItem(item))}
                        </div>
                    </div>

                    {/* 3. RIGHT: ACTIONS (Compact) */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="flex items-center bg-iha-800 rounded-lg p-0.5 border border-iha-700">
                            <button onClick={() => setLanguage('tr')} className={`w-7 h-6 flex items-center justify-center rounded-md transition-all ${language === 'tr' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`} title="Türkçe"><span className="text-sm leading-none">🇹🇷</span></button>
                            <button onClick={() => setLanguage('en')} className={`w-7 h-6 flex items-center justify-center rounded-md transition-all ${language === 'en' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`} title="English"><span className="text-sm leading-none">🇬🇧</span></button>
                            <button onClick={() => setLanguage('ro')} className={`w-7 h-6 flex items-center justify-center rounded-md transition-all ${language === 'ro' ? 'bg-iha-700 shadow-sm ring-1 ring-slate-500' : 'opacity-50 hover:opacity-100'}`} title="Română"><span className="text-sm leading-none">🇷🇴</span></button>
                        </div>

                        <div className="h-4 w-px bg-iha-700 mx-1"></div>

                        {/* NEW: Chat Icon */}
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors relative border border-transparent hover:border-iha-700 ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'hover:bg-iha-800 text-slate-400 hover:text-white'}`}
                            title="Mesajlar"
                        >
                            <span className="material-symbols-outlined text-[18px]">forum</span>
                            {unreadConversations.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-iha-900 animate-pulse">
                                    {unreadConversations.length}
                                </span>
                            )}
                        </button>

                        {/* NOTIFICATION BELL WITH POPOVER */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors relative border ${isNotifOpen ? 'bg-iha-800 text-white border-iha-700' : 'border-transparent hover:bg-iha-800 text-slate-400 hover:text-white hover:border-iha-700'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">notifications</span>
                                {totalUnread > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse border border-iha-900"></span>
                                )}
                            </button>

                            {/* DROPDOWN MENU */}
                            {isNotifOpen && (
                                <div className="absolute top-full right-0 mt-3 w-80 bg-[#1e293b]/95 backdrop-blur-xl border border-iha-700 rounded-xl shadow-2xl overflow-hidden z-[200] animate-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-iha-700 bg-iha-900/50 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bildirimler</h4>
                                        <button onClick={markAllNotificationsRead} className="text-[10px] text-blue-400 hover:text-blue-300">Tümünü Okundu İşaretle</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        
                                        {/* 1. CHAT NOTIFICATIONS */}
                                        {unreadConversations.map(conv => (
                                            <div 
                                                key={conv.id} 
                                                onClick={() => handleNotificationClick('CHAT', conv.id)}
                                                className="p-3 border-b border-iha-700/50 hover:bg-blue-600/10 cursor-pointer transition-colors flex gap-3"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {conv.otherUser?.fullName.charAt(0)}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-iha-900">
                                                        <span className="material-symbols-outlined text-[8px] text-white">chat</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{conv.otherUser?.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 truncate w-48">{conv.lastMessagePreview}</p>
                                                    <p className="text-[9px] text-blue-400 mt-1">{conv.unreadCount} yeni mesaj</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* 2. SYSTEM NOTIFICATIONS */}
                                        {notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => handleNotificationClick('SYSTEM', notif.id, notif.link)}
                                                className={`p-3 border-b border-iha-700/50 cursor-pointer transition-colors flex gap-3 ${notif.isRead ? 'opacity-60 hover:opacity-100 hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'}`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${notif.type === 'PVLA' ? 'bg-purple-600' : notif.type === 'QUALITY' ? 'bg-red-500' : 'bg-orange-500'}`}>
                                                        <span className="material-symbols-outlined text-sm">
                                                            {notif.type === 'PVLA' ? 'folder_open' : notif.type === 'QUALITY' ? 'flag' : 'campaign'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{notif.title}</p>
                                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{notif.message}</p>
                                                    <p className="text-[9px] text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                                            </div>
                                        ))}

                                        {unreadConversations.length === 0 && notifications.length === 0 && (
                                            <div className="p-8 text-center text-slate-500">
                                                <span className="material-symbols-outlined text-3xl opacity-30 mb-2">notifications_off</span>
                                                <p className="text-xs">Yeni bildirim yok.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-4 w-px bg-iha-700 mx-1"></div>

                        {currentUser ? (
                            <button onClick={onProfileClick} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-iha-800 border border-transparent hover:border-iha-700 transition-all group">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shadow-inner">
                                    {currentUser.fullName.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white max-w-[80px] truncate">{currentUser.username}</span>
                            </button>
                        ) : (
                            <button onClick={onLogin} className="flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-full shadow-lg transition-all">
                                <span className="material-symbols-outlined text-[12px]">login</span>
                                Giriş
                            </button>
                        )}
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <div className="xl:hidden flex items-center gap-3">
                        <div className="flex items-center bg-iha-800 rounded-lg p-0.5 border border-iha-700">
                            <button 
                                onClick={() => setLanguage(language === 'tr' ? 'en' : language === 'en' ? 'ro' : 'tr')} 
                                className="w-7 h-6 flex items-center justify-center rounded-md text-sm leading-none"
                            >
                                {language === 'tr' ? '🇹🇷' : language === 'en' ? '🇬🇧' : '🇷🇴'}
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-iha-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="xl:hidden absolute top-12 left-0 w-full h-[calc(100vh-48px)] bg-iha-900 border-b border-iha-700 animate-in slide-in-from-top-5 z-40 overflow-y-auto">
                    <div className="p-4 grid grid-cols-2 gap-3 pb-20">
                        {menuItems.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            if (hasChildren) {
                                return (
                                    <div key={item.id} className="col-span-2 bg-iha-800 rounded-xl p-3 border border-iha-700">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 uppercase text-[9px] font-bold tracking-widest pl-1">
                                            <span className="material-symbols-outlined text-xs">{item.icon}</span>
                                            {item.label[language]}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {item.children!.map(child => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => handleTabClick(child.id)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded-lg gap-1 transition-all ${
                                                        activeTab === child.id
                                                            ? 'bg-blue-600/20 border border-blue-600/50 text-blue-400'
                                                            : 'bg-iha-900 border border-iha-700 text-slate-400 hover:bg-iha-700 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-xl">{child.icon}</span>
                                                    <span className="text-[9px] font-bold uppercase">{child.label[language]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabClick(item.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all ${
                                        activeTab === item.id
                                            ? 'bg-blue-600/20 border border-blue-600/50 text-blue-400'
                                            : 'bg-iha-800 border border-iha-700 text-slate-400 hover:bg-iha-700 hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    <span className="text-[9px] font-bold uppercase">{item.label[language]}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-4 border-t border-iha-700 bg-iha-900">
                         {currentUser ? (
                            <button onClick={onProfileClick} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-iha-800 text-white font-bold text-xs border border-iha-700">
                                <span className="material-symbols-outlined text-sm">account_circle</span>
                                {currentUser.fullName}
                            </button>
                         ) : (
                             <button onClick={onLogin} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs">
                                <span className="material-symbols-outlined text-sm">login</span>
                                Giriş Yap
                            </button>
                         )}
                    </div>
                </div>
            )}
        </nav>
    );
};
