
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useData } from '../context/DataContext';
/* Import useUI to access language and active tab management */
import { useUI } from '../context/UIContext';
import { ChatWidget } from '../components/ChatWidget';
/* Import ProfileModal */
import { ProfileModal } from './panel/modals/ProfileModal';

// Import Content Modules
import { DashboardContent } from './front/DashboardContent';
import { DashboardBottomContent } from './front/DashboardBottomContent';
import { MaterialsContent } from './front/MaterialsContent';
import { MachineryContent } from './front/MachineryContent';
import { DroneContent } from './front/DroneContent';
import { PvlaContent } from './front/PvlaContent';
import { LayoutContent } from './front/LayoutContent';
import { InfraContent } from './front/InfraContent';
import { TimeLocationContent } from './front/TimeLocationContent';
import { TopoMap } from './front/TopoMap';

interface SiteViewProps {
    onLogin?: () => void;
}

export const SiteView_Old: React.FC<SiteViewProps> = ({ onLogin }) => {
  const { data } = useData();
  /* Use UI context for language and active tab management */
  const { language, activeTab, setActiveTab } = useUI();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Lazy Load States
  const [showTimeLoc, setShowTimeLoc] = useState(false);
  const [showMachinery, setShowMachinery] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);

  // --- SECTION CONFIGURATION ---
  // This array defines the order and properties of each section on the page.
  // It allows for easy reordering and cleaner rendering logic.
  const sections = [
      { 
          id: 'dashboard', 
          Component: () => <><DashboardContent /><DashboardBottomContent /></>, 
          isVisible: true 
      },
      { 
          id: 'timeloc', 
          title: 'Zaman - Konum Diyagramı', 
          color: 'purple-500', 
          Component: TimeLocationContent, 
          isVisible: showTimeLoc 
      },
      { 
          id: 'layout', 
          title: 'Genel Yerleşim Planları', 
          color: 'orange-500', 
          Component: LayoutContent, 
          isVisible: true 
      },
      { 
          id: 'topo', 
          // TopoMap handles its own header and layout
          Component: () => <TopoMap isActive={true} />, 
          isVisible: true 
      },
      { 
          id: 'materials', 
          title: 'Malzeme & BoQ', 
          color: 'purple-500', 
          Component: MaterialsContent, 
          isVisible: true 
      },
      { 
          id: 'machinery', 
          title: 'Makine Parkı', 
          color: 'orange-500', 
          Component: MachineryContent, 
          isVisible: showMachinery 
      },
      { 
          id: 'infra', 
          title: 'Altyapı Projeleri', 
          color: 'blue-500', 
          Component: InfraContent, 
          isVisible: true 
      },
      { 
          id: 'pvla', 
          title: 'PVLA - Dijital Matris Yönetimi', 
          color: 'indigo-500', 
          Component: PvlaContent, 
          isVisible: true 
      },
      { 
          id: 'drone', 
          title: 'Drone Uçuş Kayıtları', 
          color: 'red-500', 
          Component: DroneContent, 
          isVisible: true,
          extraClass: 'pb-10' 
      }
  ];

  // --- SCROLL & LAZY LOAD LOGIC ---
  useEffect(() => {
      const scrollToSection = (id: string) => {
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          
          scrollTimeoutRef.current = setTimeout(() => {
            const element = document.getElementById(id);
            if (element && mainContainerRef.current) {
                const elementTop = element.getBoundingClientRect().top;
                const containerTop = mainContainerRef.current.getBoundingClientRect().top;
                const currentScroll = mainContainerRef.current.scrollTop;
                const offset = 24; // Header offset
                const targetScroll = currentScroll + (elementTop - containerTop) - offset;
                mainContainerRef.current.scrollTo({ top: targetScroll, behavior: "smooth" });
            }
          }, 100); 
      };

      // Handle Lazy Loading Triggers based on active tab
      if (activeTab === 'timeloc') {
          if (!showTimeLoc) setShowTimeLoc(true);
          scrollToSection('timeloc');
      } else if (activeTab === 'machinery') {
          if (!showMachinery) setShowMachinery(true);
          scrollToSection('machinery');
      } else {
          scrollToSection(activeTab);
      }
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-iha-900 text-slate-200 overflow-hidden">
        {/* Mobile Sidebar Overlay (z-40 to cover header z-30) */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(t) => {setActiveTab(t); setIsSidebarOpen(false);}} 
            isAdmin={false} 
            isOpen={isSidebarOpen}
            onLogin={onLogin}
            onProfileClick={() => setIsProfileOpen(true)} 
        />
        
        <div className="flex-1 flex flex-col w-full md:pl-72 transition-all duration-300">
            <Header onMenuClick={() => setIsSidebarOpen(true)} title={data.settings.siteName[language]} />

            <main ref={mainContainerRef} className="flex-1 overflow-y-auto bg-iha-900 relative flex flex-col">
                {sections.map(({ id, title, color, Component, isVisible, extraClass }) => (
                    isVisible ? (
                        <section key={id} id={id} className={`p-4 md:p-8 ${id !== 'dashboard' ? 'border-t border-iha-700' : ''} ${extraClass || ''}`}>
                            {title && (
                                <div className="mb-6">
                                    <h2 className={`text-2xl font-bold text-white border-l-4 pl-4 border-${color}`}>
                                        {title}
                                    </h2>
                                </div>
                            )}
                            <Component />
                        </section>
                    ) : null
                ))}
                
                <Footer />
            </main>
        </div>
        
        <ChatWidget />
        
        {/* Profile Modal for Frontpage User */}
        <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onNavigate={(tab) => { setActiveTab(tab); setIsProfileOpen(false); }}
        />
    </div>
  );
};
