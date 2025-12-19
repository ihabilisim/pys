
import type { AppSettings, MenuConfig, UtilityCategory, TopoData } from '../types';

export const DEMO_SETTINGS: AppSettings = {
    defaultBridgePath: '/PVLA/Bridge/Scan',
    defaultCulvertPath: '/PVLA/Culvert/Scan',
    defaultShortcutPath: '/Project/Shortcuts/General',
    logoUrl: null,
    faviconUrl: null,
    seoTitle: { tr: 'Makyol Sibiu - Făgăraș Lot 1', en: 'Makyol Sibiu - Făgăraș Lot 1', ro: 'Makyol Sibiu - Făgăraș Lot 1' },
    seoDescription: { tr: 'Proje Yönetim Sistemi', en: 'Project Management System', ro: 'Sistem de Management' },
    projectName: { tr: 'Sibiu - Făgăraș Otoyolu Projesi', en: 'Sibiu - Făgăraș Motorway Project', ro: 'Proiectul Autostrăzii Sibiu - Făgăraș' },
    siteName: { tr: 'Ana Kamp & Şantiye Ofisi', en: 'Main Camp & Site Office', ro: 'Tabără Principală & Birou Șantier' },
    siteAddress: { tr: 'DN1, Avrig, Sibiu, Romanya', en: 'DN1, Avrig, Sibiu County, Romania', ro: 'DN1, Avrig, Județul Sibiu, România' },
    sidebarTitle: { tr: 'Makyol A13', en: 'Makyol A13', ro: 'Makyol A13' },
    sidebarSubtitle: { tr: 'SIBIU – FAGARAS Lot 1', en: 'SIBIU – FAGARAS Lot 1', ro: 'SIBIU – FAGARAS Lot 1' },
    companyName: { tr: 'IHA BİLİŞİM DANIŞMANLIK LTD. ŞTİ.', en: 'IHA BİLİŞİM DANIŞMANLIK LTD. ŞTİ', ro: 'IHA BİLİŞİM DANIŞMANLIK LTD. ŞTİ' },
    footerProjectName: { tr: 'Sibiu - Făgăraș Motorway Project Lot 1', en: 'Sibiu - Făgăraș Motorway Project Lot 1', ro: 'Proiectul Autostrăzii Sibiu - Făgăraș Lotul 1' },
    copyrightText: { tr: 'Tüm Hakları Saklıdır.', en: 'All Rights Reserved.', ro: 'Toate Drepturile Rezervate.' },
    privacyText: { tr: 'Gizlilik Politikası', en: 'Privacy Policy', ro: 'Politica de Confidențialitate' },
    termsText: { tr: 'Kullanım Koşulları', en: 'Terms of Service', ro: 'Termeni și Condiții' },
    version: 'v2.4.2-beta'
};

export const DEMO_MENU: MenuConfig = {
    dashboard: { tr: 'Kontrol Paneli', en: 'Dashboard', ro: 'Panou de Control' },
    timeloc: { tr: 'Zaman-Konum', en: 'Time-Location', ro: 'Timp-Locație' },
    drone: { tr: 'Drone Uçuşları', en: 'Drone Flights', ro: 'Zboruri cu Drona' },
    layout: { tr: 'Genel Yerleşim', en: 'General Layout', ro: 'Plan General' },
    topo: { tr: 'Topografik Survey', en: 'Topographic Survey', ro: 'Studiu Topografic' },
    infra: { tr: 'Altyapı Projeleri', en: 'Infrastructure Projects', ro: 'Proiecte Infrastructură' },
    pvla: { tr: 'PVLA Yönetimi', en: 'PVLA Management', ro: 'Management PVLA' },
    materials: { tr: 'Malzeme & BoQ', en: 'Materials & BoQ', ro: 'Materiale & BoQ' },
    machinery: { tr: 'Makine Parkı', en: 'Machinery', ro: 'Parc Utilaje' }
};

// Start with empty categories or basic ones
export const DEMO_UTILITY_CATS: UtilityCategory[] = [
    // Categories kept blank or minimal for fresh start
    { id: 'general', name: { tr: 'Genel', en: 'General', ro: 'General' }, color: '#94a3b8' } 
];

export const DEMO_TOPO_DATA: TopoData = { polygonCount: 142, surfaceArea: 1250000, lastUpdated: '2025-12-08' };
