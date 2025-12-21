
import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
/* Import useUI to access language, activeTab, and translation function */
import { useUI } from '../context/UIContext';
/* Import useAuth for dynamic user checking */
import { useAuth } from '../context/AuthContext';
import { MenuItemConfig } from '../types';

interface SidebarProps {
  // Make props optional to allow Context fallback
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  isOpen?: boolean; 
  onLogin?: () => void; // New prop for login redirection
  onProfileClick?: () => void; // New prop for profile modal
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab: propActiveTab, 
    setActiveTab: propSetActiveTab, 
    isAdmin = false, 
    onLogout, 
    isOpen = false,
    onLogin,
    onProfileClick
}) => {
  const { data } = useData();
  const { currentUser } = useAuth(); // Use dynamic user
  /* Use UI context for localized values and active tab management */
  const { language, activeTab: contextActiveTab, setActiveTab: contextSetActiveTab, t, toggleChat, isChatOpen } = useUI();

  // Determine which state to use: Props (Admin) or Context (SiteView)
  const currentTab = propActiveTab || contextActiveTab;
  const setTab = propSetActiveTab || contextSetActiveTab;

  // Local state for expanded menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (id: string) => {
      setExpandedMenus(prev => ({...prev, [id]: !prev[id]}));
  };

  const adminItems: MenuItemConfig[] = [
    { id: 'dashboard', order: 0, visible: true, icon: 'campaign', label: { tr: t('sidebar.dashboard'), en: 'Dashboard', ro: 'Panou' } },
    { id: 'shortcuts', order: 1, visible: true, icon: 'bookmark', label: { tr: t('sidebar.shortcuts'), en: 'Shortcuts', ro: 'Scurtături' } },
    { id: 'layout', order: 2, visible: true, icon: 'map', label: { tr: t('sidebar.layout'), en: 'Layout', ro: 'Plan' } },
    { id: 'topo', order: 3, visible: true, icon: 'landscape', label: { tr: t('sidebar.topo'), en: 'Topo', ro: 'Topo' } },
    { id: '3d-monitoring', order: 3.5, visible: true, icon: 'view_in_ar', label: { tr: '3D Yapı Yönetimi', en: '3D Struct. Mgmt', ro: 'Admin 3D' } }, // NEW ITEM
    { id: 'materials', order: 4, visible: true, icon: 'inventory_2', label: { tr: t('sidebar.materials'), en: 'Materials', ro: 'Materiale' } },
    { id: 'infra', order: 5, visible: true, icon: 'foundation', label: { tr: t('sidebar.infra'), en: 'Infra', ro: 'Infra' } },
    { id: 'pvla', order: 6, visible: true, icon: 'folder_shared', label: { tr: t('sidebar.pvla'), en: 'PVLA', ro: 'PVLA' } },
    { id: 'drone', order: 7, visible: true, icon: 'flight', label: { tr: t('sidebar.drone'), en: 'Drone', ro: 'Dronă' } }, 
    { id: 'settings', order: 8, visible: true, icon: 'settings', label: { tr: t('sidebar.settings'), en: 'Settings', ro: 'Setări' } },
    { id: 'users', order: 9, visible: true, icon: 'group', label: { tr: t('sidebar.users'), en: 'Users', ro: 'Utilizatori' } },
    { id: 'changelog', order: 10, visible: true, icon: 'history_edu', label: { tr: 'Değişiklik Günlüğü', en: 'Changelog', ro: 'Jurnal Modificări' } },
  ];

  // Dynamic Site Menu
  const siteItems = useMemo(() => {
        return data.menuStructure
            .filter(item => item.visible)
            .sort((a, b) => a.order - b.order);
  }, [data.menuStructure]);

  const menuItems = isAdmin ? adminItems : siteItems;

  // Helper to map role to display title if no job title is set
  const getRoleTitle = () => {
      if (currentUser?.jobTitle) return currentUser.jobTitle; // Prioritize Job Title
      const role = currentUser?.role || 'viewer';
      return t(`roles.${role}`);
  };

  // Derive user display logic if user is logged in
  const userInitials = currentUser 
      ? currentUser.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '';

  // Recursive Menu Renderer
  const renderMenuItem = (item: MenuItemConfig, depth = 0) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMenus[item.id];
      const isActive = currentTab === item.id;
      const paddingLeft = 16 + (depth * 12); // Indentation

      return (
          <div key={item.id} className="w-full">
              <button
                onClick={() => hasChildren ? toggleSubmenu(item.id) : setTab(item.id)}
                className={`w-full flex items-center justify-between py-3.5 pr-4 rounded-xl transition-all duration-200 group ${
                  isActive && !hasChildren
                    ? 'bg-iha-blue text-white shadow-md shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-iha-700 hover:text-white'
                }`}
                style={{ paddingLeft: `${paddingLeft}px` }}
              >
                <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${isActive && !hasChildren ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                    {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label[language]}</span>
                </div>
                {hasChildren && (
                    <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                )}
              </button>
              
              {/* Submenu Children */}
              {hasChildren && isExpanded && (
                  <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.children!.map(child => renderMenuItem(child, depth + 1))}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className={`
        w-72 bg-iha-800 border-r border-iha-700 flex flex-col h-full fixed left-0 top-0 bottom-0 z-50
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
    `}>
      <div className="p-6 border-b border-iha-700 flex flex-col items-center text-center">
        {data.settings.logoUrl ? (
             <img src={data.settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-3" />
        ) : (
             <div className="w-12 h-12 bg-iha-blue rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                <span className="material-symbols-outlined text-white text-3xl">engineering</span>
            </div>
        )}
        
        {/* Localized Title */}
        <h1 className="text-xl font-bold text-white tracking-tight">{data.settings.sidebarTitle[language]}</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{data.settings.sidebarSubtitle[language]}</p>
        
        {isAdmin && <span className="mt-2 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30">{t('sidebar.adminMode')}</span>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* AI Assistant Trigger Button - Placed just above the footer area */}
      <div className="px-4 pb-4">
          <button 
            onClick={toggleChat}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border group relative overflow-hidden ${
                isChatOpen 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg' 
                : 'bg-iha-900 border-iha-700 text-slate-300 hover:border-blue-500/50 hover:text-white'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
            <div className="relative flex items-center gap-3 w-full">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isChatOpen ? 'bg-white/20 text-white' : 'bg-iha-800 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'}`}>
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-bold">IHA AI</p>
                    <p className="text-[10px] opacity-70">Proje Asistanı</p>
                </div>
                {isChatOpen && <span className="material-symbols-outlined text-sm animate-pulse">mic</span>}
            </div>
          </button>
      </div>

      {isAdmin && onLogout && (
        <div className="p-4 border-t border-iha-700">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl transition-all"
          >
             <span className="material-symbols-outlined">logout</span>
             <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      )}

      {/* Dynamic User Profile or Login Button for Non-Admins */}
      {!isAdmin && (
        <div className="p-6 border-t border-iha-700">
            {currentUser ? (
                <div 
                    onClick={onProfileClick}
                    className="flex items-center space-x-3 cursor-pointer group hover:bg-iha-700/50 p-2 -m-2 rounded-xl transition-all"
                >
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-iha-900 shadow-lg" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-iha-blue to-blue-600 flex items-center justify-center text-white font-bold border-2 border-iha-900 shadow-lg">
                            {userInitials}
                        </div>
                    )}
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs text-slate-400 truncate uppercase font-bold tracking-wider group-hover:text-blue-300 transition-colors">{getRoleTitle()}</p>
                        <p className="text-sm font-bold text-white truncate" title={currentUser.fullName}>{currentUser.fullName}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">settings</span>
                </div>
            ) : (
                <button 
                    onClick={onLogin}
                    className="w-full flex items-center justify-center gap-2 bg-iha-700 hover:bg-iha-600 text-white px-4 py-3 rounded-xl transition-all border border-iha-600 hover:border-slate-500 group"
                >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">login</span>
                    <span className="font-bold text-sm">Giriş Yap / Kayıt</span>
                </button>
            )}
        </div>
      )}
    </div>
  );
};
