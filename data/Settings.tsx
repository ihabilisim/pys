
import { AppSettings, MenuConfig, UtilityCategory, TopoData, MenuItemConfig } from '../types';

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
    version: 'v2.4.3',
    smtp: {
        host: 'smtp.office365.com',
        port: 587,
        user: '',
        pass: '',
        secure: true,
        fromName: 'IHA PYS System',
        fromEmail: 'noreply@makyol.com'
    }
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

export const DEFAULT_MENU_STRUCTURE: MenuItemConfig[] = [
    { id: 'dashboard', order: 0, visible: true, icon: 'dashboard', label: { tr: 'Kontrol Paneli', en: 'Dashboard', ro: 'Panou de Control' } },
    { id: 'topo', order: 1, visible: true, icon: 'landscape', label: { tr: 'Topografik Harita', en: 'Topographic Map', ro: 'Hartă Topografică' } },
    { 
        id: 'pvla', 
        order: 2, 
        visible: true, 
        icon: 'view_in_ar', 
        label: { tr: 'PVLA Yönetimi', en: 'PVLA Management', ro: 'Management PVLA' },
        children: [
            { id: 'pvla-matrix', order: 0, visible: true, icon: 'grid_on', label: { tr: 'İlerleme Matrisi', en: 'Progress Matrix', ro: 'Matrice Progres' } },
            { id: 'pvla-files', order: 1, visible: true, icon: 'folder_open', label: { tr: 'İmzalı Dosyalar', en: 'Signed Files', ro: 'Fișiere Semnate' } },
            { id: 'pvla-3d', order: 2, visible: true, icon: 'view_in_ar', label: { tr: '3D Dijital Twin', en: '3D Digital Twin', ro: '3D Digital Twin' } }
        ]
    },
    { id: 'drone', order: 3, visible: true, icon: 'flight', label: { tr: 'Drone Görüntüleri', en: 'Drone Flights', ro: 'Zboruri Dronă' } },
    { id: 'timeloc', order: 4, visible: true, icon: 'query_stats', label: { tr: 'Zaman-Konum', en: 'Time-Location', ro: 'Timp-Locație' } },
    { id: 'materials', order: 5, visible: true, icon: 'inventory_2', label: { tr: 'Malzeme & BoQ', en: 'Materials & BoQ', ro: 'Materiale & BoQ' } },
    { id: 'machinery', order: 6, visible: true, icon: 'agriculture', label: { tr: 'Makine Parkı', en: 'Machinery', ro: 'Parc Utilaje' } },
    { id: 'infra', order: 7, visible: true, icon: 'foundation', label: { tr: 'Alt Yapı & Layout', en: 'Infra & Layout', ro: 'Infra & Layout' } },
];

export const DEMO_UTILITY_CATS: UtilityCategory[] = [
    { id: 'general', name: { tr: 'Genel', en: 'General', ro: 'General' }, color: '#94a3b8' } 
];

export const DEMO_TOPO_DATA: TopoData = { polygonCount: 142, surfaceArea: 1250000, lastUpdated: '2025-12-08' };
