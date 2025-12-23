
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, Toast } from '../types';
import { translations } from '../lang';
import { languageService } from '../services/languageService';

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

export const UIProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('tr');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Stores SQL overrides: { tr: { 'key': 'value' }, en: ... }
  const [customTranslations, setCustomTranslations] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
      const loadOverrides = async () => {
          const overrides = await languageService.fetchTranslations();
          setCustomTranslations(overrides);
      };
      loadOverrides();
  }, []);

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
    // 1. Check SQL Overrides first (Dynamic)
    if (customTranslations[language] && customTranslations[language][key]) {
        return customTranslations[language][key];
    }

    // 2. Check File-based (Fallback)
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) value = value[k];
      else return key; // Return key if not found
    }
    return value as string;
  };

  return (
    <UIContext.Provider value={{ language, setLanguage, activeTab, setActiveTab, toasts, showToast, removeToast, t, isChatOpen, toggleChat }}>
      {children}
    </UIContext.Provider>
  );
};
