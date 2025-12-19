
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Toast } from '../types';
import { translations } from '../lang';

interface UIContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  t: (key: string) => string;
  isChatOpen: boolean;
  toggleChat: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

// Fixed: Changed children prop to optional to prevent TypeScript error in consumer components (e.g. App.tsx)
export const UIProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('tr');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) value = value[k];
      else return key;
    }
    return value as string;
  };

  return (
    <UIContext.Provider value={{ language, setLanguage, activeTab, setActiveTab, toasts, showToast, removeToast, t, isChatOpen, toggleChat }}>
      {children}
    </UIContext.Provider>
  );
};
