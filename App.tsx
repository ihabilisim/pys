
import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { UIProvider, useUI } from './context/UIContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ViewMode } from './types';
import { Login } from './views/Login';
import { AdminPanel } from './views/AdminPanel';
import { SiteView } from './views/SiteView';

const AppContent = () => {
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  const { currentUser } = useAuth();
  const { data, isSaving } = useData();
  const { toasts, removeToast } = useUI();

  useEffect(() => {
    const updateFavicon = (url: string | null) => {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        if (url) link.href = url;
    };
    updateFavicon(data.settings.faviconUrl);
  }, [data.settings.faviconUrl]);

  const handleAdminClick = () => {
    if (currentUser) setView('ADMIN');
    else setView('LOGIN');
  };

  const renderView = () => {
    switch (view) {
      case 'LOGIN':
        return <Login onLogin={() => setView('ADMIN')} onBack={() => setView('DASHBOARD')} />;
      case 'ADMIN':
        return <AdminPanel onLogout={() => setView('DASHBOARD')} onPreview={() => setView('DASHBOARD')} />;
      case 'DASHBOARD':
      default:
        return (
          <>
             <SiteView onLogin={() => setView('LOGIN')} />
             <button 
                onClick={handleAdminClick}
                className="fixed bottom-6 right-6 bg-iha-800 border border-iha-700 text-slate-400 hover:text-white hover:border-iha-blue p-3 rounded-full shadow-2xl transition-all z-50 group"
             >
                <span className={`material-symbols-outlined group-hover:text-iha-blue ${currentUser ? 'text-blue-500' : ''}`}>
                    {currentUser ? 'admin_panel_settings' : 'settings'}
                </span>
             </button>
          </>
        );
    }
  };

  return (
    <>
      {renderView()}
      
      {/* Toast Overlay (Moved to Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none items-end">
          {isSaving && (
              <div className="pointer-events-auto bg-iha-800/90 backdrop-blur-md border border-iha-700 rounded-lg p-2 flex items-center gap-2 shadow-2xl animate-pulse">
                  <span className="material-symbols-outlined text-blue-500 text-sm">cloud_upload</span>
                  <span className="text-[10px] text-white font-bold uppercase">Kaydediliyor...</span>
              </div>
          )}

          {toasts.map(toast => (
              <div key={toast.id} className={`pointer-events-auto min-w-[280px] max-w-sm bg-iha-800/90 backdrop-blur-md border rounded-lg p-4 shadow-2xl transform transition-all duration-300 animate-in slide-in-from-right-full fade-in ${toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''} ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''} ${toast.type === 'info' ? 'border-l-4 border-l-blue-500' : ''} border-t-iha-700 border-r-iha-700 border-b-iha-700`}>
                  <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${toast.type === 'success' ? 'text-green-500' : toast.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                          <span className="material-symbols-outlined text-lg">{toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}</span>
                      </div>
                      <div className="flex-1"><p className="text-white text-sm font-medium leading-5">{toast.message}</p></div>
                      <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
              </div>
          ))}
      </div>
    </>
  );
};

export default function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  );
}
