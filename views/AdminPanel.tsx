
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useData } from '../context/DataContext';
/* Import useAuth to access user and permission related functionality */
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './panel/modals/ProfileModal';

// Import New Panel Modules
import { AdminDashboard } from './panel/AdminDashboard';
import { AdminMaterials } from './panel/AdminMaterials';
import { AdminShortcuts } from './panel/AdminShortcuts';
import { AdminLayout } from './panel/AdminLayout';
import { AdminTopo } from './panel/AdminTopo';
import { AdminInfra } from './panel/AdminInfra';
import { AdminPvla } from './panel/AdminPvla';
import { AdminSettings } from './panel/AdminSettings';
import { AdminUsers } from './panel/AdminUsers';
import { AdminDrone } from './panel/AdminDrone'; 
import { AdminChangelog } from './panel/AdminChangelog';
import { AdminStructureInventory } from './panel/AdminStructureInventory';
import { AdminMasterDesign } from './panel/AdminMasterDesign'; // New Import

interface AdminPanelProps {
  onLogout: () => void;
  onPreview: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onPreview }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  /* Use Auth context for user management and permission checks */
  const { currentUser, logout, hasPermission } = useAuth();

  const handleLogout = () => {
      logout();
      onLogout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'materials': return <AdminMaterials />;
      case 'shortcuts': return <AdminShortcuts />;
      case 'layout': return <AdminLayout />;
      case 'topo': return <AdminTopo />;
      case 'structure-inventory': return <AdminStructureInventory />;
      case 'master-design': return <AdminMasterDesign />; // New Case
      case 'infra': return <AdminInfra />;
      case 'pvla': return <AdminPvla />;
      case 'settings': return <AdminSettings />;
      case 'users': return <AdminUsers />;
      case 'drone': return <AdminDrone />;
      case 'changelog': return <AdminChangelog />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-iha-900 text-slate-200 overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(t) => {setActiveTab(t); setIsSidebarOpen(false);}} 
            isAdmin={true} 
            onLogout={handleLogout} 
            isOpen={isSidebarOpen} 
        />
        
        <div className="flex-1 flex flex-col w-full md:pl-72 transition-all duration-300">
             <header className="h-16 border-b border-iha-700 flex items-center justify-between px-4 md:px-8 bg-iha-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-iha-blue">admin_panel_settings</span> 
                        Yönetici Paneli
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${currentUser?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {currentUser?.role}
                    </div>
                    
                    {/* User Management Shortcut */}
                    {hasPermission('manage_users') && (
                        <button onClick={() => setActiveTab('users')} className={`text-sm flex items-center gap-1 ${activeTab === 'users' ? 'text-iha-blue font-bold' : 'text-slate-400 hover:text-white'}`}>
                            <span className="material-symbols-outlined text-lg">group</span> 
                            Kullanıcılar
                        </button>
                    )}
                    
                    <button onClick={onPreview} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">visibility</span> 
                        Önizleme
                    </button>
                    
                    <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 bg-iha-800 hover:bg-iha-700 border border-iha-700 rounded-full py-1 pr-3 pl-1 transition-all">
                        <div className="w-7 h-7 rounded-full bg-iha-600 flex items-center justify-center text-xs font-bold text-white">
                            {currentUser?.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white max-w-[100px] truncate">{currentUser?.fullName}</span>
                    </button>
                </div>
             </header>
             
             <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
                 {renderContent()}
             </main>
        </div>

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
