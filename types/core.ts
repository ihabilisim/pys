
export interface LocalizedString {
  tr: string;
  en: string;
  ro: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

export type Permission = 
  | 'manage_users' 
  | 'manage_daily_log' 
  | 'manage_stats' 
  | 'manage_machinery'
  | 'manage_timeline'
  | 'manage_notifications'
  | 'manage_files'
  | 'manage_map' 
  | 'manage_drone'
  | 'manage_settings'
  | 'manage_quality'
  | 'manage_materials';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
  role: 'admin' | 'editor' | 'viewer';
  permissions: Permission[];
}

export interface AppSettings {
  defaultBridgePath: string;
  defaultCulvertPath: string;
  defaultShortcutPath: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  projectName: LocalizedString;
  siteName: LocalizedString;
  siteAddress: LocalizedString;
  sidebarTitle: LocalizedString;
  sidebarSubtitle: LocalizedString;
  companyName: LocalizedString; 
  footerProjectName: LocalizedString;
  copyrightText: LocalizedString; 
  privacyText: LocalizedString; 
  termsText: LocalizedString; 
  version: string; 
}
