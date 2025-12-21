
import React, { useState } from 'react';
import { TopNavbar } from '../components/TopNavbar'; // New Horizontal Navbar
import { Footer } from '../components/Footer';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { ChatWidget } from '../components/ChatWidget';
import { ProfileModal } from './panel/modals/ProfileModal';

// Import Content Modules
import { HomeContent } from './front/HomeContent'; // Combined Dashboard
import { MaterialsContent } from './front/MaterialsContent';
import { MachineryContent } from './front/MachineryContent';
import { DroneContent } from './front/DroneContent';
import { PvlaContent } from './front/PvlaContent';
import { InfraContent } from './front/InfraContent';
import { TimeLocationContent } from './front/TimeLocationContent';
import { TopoMap } from './front/TopoMap';

// Helper component to wrap standard content pages with scrolling
const PageContainer = ({ 
    children, 
    title, 
    color, 
    noFooter = false, 
    fullWidth = false 
}: { 
    children: React.ReactNode, 
    title?: string, 
    color?: string, 
    noFooter?: boolean, 
    fullWidth?: boolean 
}) => (
    <div className="flex flex-col min-h-full bg-iha-900">
        <div className={`flex-1 ${fullWidth ? 'p-0' : 'p-4 md:p-8 max-w-[1600px] mx-auto w-full'}`}>
            {title && (
                <div className="mb-6 animate-in slide-in-from-left-4 duration-300">
                    <h2 className={`text-2xl font-bold text-white border-l-4 pl-4 border-${color || 'blue-500'}`}>
                        {title}
                    </h2>
                </div>
            )}
            {children}
        </div>
        {!noFooter && <Footer />}
    </div>
);

interface SiteViewProps {
    onLogin?: () => void;
}

export const SiteView: React.FC<SiteViewProps> = ({ onLogin }) => {
  const { data } = useData();
  const { language, activeTab, setActiveTab } = useUI();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Helper to determine if we are in any PVLA related tab
  const isPvlaTab = ['pvla', 'pvla-matrix', 'pvla-files', 'pvla-3d'].includes(activeTab);

  return (
    <div className="flex flex-col h-screen bg-iha-900 text-slate-200 overflow-hidden">
        
        {/* HEADER (Fixed Height: h-14 / 56px) */}
        <TopNavbar 
            onLogin={onLogin} 
            onProfileClick={() => setIsProfileOpen(true)} 
        />
        
        {/* MAIN CONTENT (Calculated Height) */}
        <main className="flex-1 relative overflow-hidden h-[calc(100vh-56px)]">
            
            {/* SCROLLABLE PAGES */}
            <div className={`h-full w-full overflow-y-auto custom-scrollbar ${activeTab === 'topo' ? 'hidden' : 'block'}`}>
                {activeTab === 'dashboard' && <PageContainer><HomeContent /></PageContainer>}
                
                {/* PVLA Routing: Handles main menu and sub-menus */}
                {isPvlaTab && (
                    <PageContainer 
                        title={data.menuConfig['pvla'] ? data.menuConfig['pvla'][language] : 'PVLA Management'} 
                        color="indigo-500" 
                        fullWidth
                    >
                        <div className="px-4 md:px-8"><PvlaContent /></div>
                    </PageContainer>
                )}

                {activeTab === 'drone' && <PageContainer title={data.menuConfig['drone'][language]} color="red-500"><DroneContent /></PageContainer>}
                {activeTab === 'timeloc' && <PageContainer title={data.menuConfig['timeloc'][language]} color="purple-500"><TimeLocationContent /></PageContainer>}
                {/* InfraContent now handles Layout as well */}
                {activeTab === 'infra' && <PageContainer title={data.menuConfig['infra'][language]} color="blue-500"><InfraContent /></PageContainer>}
                {activeTab === 'materials' && <PageContainer title={data.menuConfig['materials'][language]} color="purple-500"><MaterialsContent /></PageContainer>}
                {activeTab === 'machinery' && <PageContainer title={data.menuConfig['machinery'][language]} color="orange-500"><MachineryContent /></PageContainer>}
                
                {/* Fallback for Admin-only tabs */}
                {['shortcuts', 'settings', 'users'].includes(activeTab) && (
                        <div className="h-full flex items-center justify-center text-slate-500">
                        <p>Bu modül sadece Yönetici Paneli üzerinden erişilebilir.</p>
                        </div>
                )}
            </div>

            {/* MAP VIEW (Absolute Positioning for Stability) */}
            {/* The map container is always mounted but hidden via visibility/z-index to preserve WebGL context properly */}
            <div 
                className={`absolute inset-0 w-full h-full bg-iha-900 transition-opacity duration-300 ${activeTab === 'topo' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
            >
                {/* Only render TopoMap if it has been accessed at least once or is active, to save initial load resources, 
                    BUT keep it alive once rendered. */}
                <TopoMap isActive={activeTab === 'topo'} />
            </div>

        </main>
        
        <ChatWidget />
        
        <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onNavigate={(tab) => { setActiveTab(tab); setIsProfileOpen(false); }}
        />
    </div>
  );
};