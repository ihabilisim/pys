
import React, { useState } from 'react';
import { TopNavbar } from '../components/TopNavbar'; 
import { Footer } from '../components/Footer';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { ChatWidget } from '../components/ChatWidget';
import { ProfileModal } from './panel/modals/ProfileModal';

// Import Content Modules
import { HomeContent } from './front/HomeContent'; 
import { MaterialsContent } from './front/MaterialsContent';
import { MachineryContent } from './front/MachineryContent';
import { DroneContent } from './front/DroneContent';
import { PvlaContent } from './front/PvlaContent';
import { InfraContent } from './front/InfraContent';
import { TimeLocationContent } from './front/TimeLocationContent';
import { TopoMap } from './front/TopoMap';
import { ChatContent } from './front/ChatContent'; 
import { FeedbackPage } from './front/FeedbackPage';

const PageContainer = ({ 
    children, 
    title, 
    color, 
    noFooter = false, 
    fullWidth = false 
}: { 
    children?: React.ReactNode, 
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
  const { language, activeTab, setActiveTab, isChatOpen, toggleChat } = useUI();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isPvlaTab = ['pvla', 'pvla-matrix', 'pvla-files', 'pvla-3d'].includes(activeTab);

  return (
    <div className="flex flex-col h-screen bg-iha-900 text-slate-200 overflow-hidden">
        
        <TopNavbar 
            onLogin={onLogin} 
            onProfileClick={() => setIsProfileOpen(true)} 
        />
        
        <main className="flex-1 relative overflow-hidden h-[calc(100vh-56px)]">
            <div className={`h-full w-full overflow-y-auto custom-scrollbar ${activeTab === 'topo' ? 'hidden' : 'block'}`}>
                {activeTab === 'dashboard' && <PageContainer><HomeContent /></PageContainer>}
                {activeTab === 'feedback' && <PageContainer><FeedbackPage /></PageContainer>}
                
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
                {activeTab === 'infra' && <PageContainer title={data.menuConfig['infra'][language]} color="blue-500"><InfraContent /></PageContainer>}
                {activeTab === 'materials' && <PageContainer title={data.menuConfig['materials'][language]} color="purple-500"><MaterialsContent /></PageContainer>}
                {activeTab === 'machinery' && <PageContainer title={data.menuConfig['machinery'][language]} color="orange-500"><MachineryContent /></PageContainer>}
                {activeTab === 'chat' && <PageContainer title="Takım Sohbeti" color="blue-500" fullWidth><div className="px-4 md:px-8 max-w-[1400px] mx-auto w-full"><ChatContent /></div></PageContainer>}
                
                {['shortcuts', 'settings', 'users'].includes(activeTab) && (
                        <div className="h-full flex items-center justify-center text-slate-500">
                        <p>Bu modül sadece Yönetici Paneli üzerinden erişilebilir.</p>
                        </div>
                )}
            </div>

            <div 
                className={`absolute inset-0 w-full h-full bg-iha-900 transition-opacity duration-300 ${activeTab === 'topo' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
            >
                <TopoMap isActive={activeTab === 'topo'} />
            </div>

        </main>
        
        {!isChatOpen && (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 border border-white/10 group"
            >
                <div className="relative">
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">smart_toy</span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>
                </div>
                <div className="flex flex-col items-start leading-none pr-1">
                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">IHA AI</span>
                    <span className="text-sm font-bold">Asistan</span>
                </div>
            </button>
        )}

        <ChatWidget />
        
        <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onNavigate={(tab) => { setActiveTab(tab); setIsProfileOpen(false); }}
        />
    </div>
  );
};
