
import type { AppData } from '../types';
// Demo data imports are kept but NOT used in the default export anymore.
// They will be used only via "Load Demo Data" button in Admin Panel.
import { DEMO_USERS, DEMO_PROFILE } from './Users';
import { DEMO_WIDGETS, DEMO_TIMELINE } from './Dashboard';
import { DEMO_STOCKS, DEMO_BOQ } from './Materials';
import { DEMO_PVLA_INDICES, DEMO_PVLA_STRUCTURES, DEMO_PVLA_FILES, DEMO_MATRIX_COLUMNS, DEMO_MATRIX_ROWS } from './PvlaData';
import { DEMO_SETTINGS, DEMO_MENU, DEFAULT_MENU_STRUCTURE, DEMO_UTILITY_CATS, DEMO_TOPO_DATA } from './Settings';

export const INITIAL_DATA: AppData = {
  userProfile: DEMO_PROFILE, 
  users: DEMO_USERS, 
  dashboardWidgets: DEMO_WIDGETS, 
  timelinePhases: [], 
  polygonPoints: [], 
  topoData: { polygonCount: 0, surfaceArea: 0, lastUpdated: '-' },
  stocks: [],
  boqItems: [],
  pvlaIndices: DEMO_PVLA_INDICES,
  pvlaStructures: [],
  pvlaFiles: [],
  matrixColumns: DEMO_MATRIX_COLUMNS, 
  progressMatrix: [],
  siteIssues: [],
  mapNotes: [],
  sitePhotos: [],
  chainageMarkers: [],
  notifications: [],
  infraProjects: [],
  shortcuts: [],
  topoItems: [],
  slides: [],
  droneFlights: [],
  externalLayers: [],
  landXmlFiles: [],
  utilityCategories: DEMO_UTILITY_CATS,
  settings: DEMO_SETTINGS,
  menuConfig: DEMO_MENU,
  menuStructure: DEFAULT_MENU_STRUCTURE, // Initialized
  changelog: [
      { 
          id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
          version: 'v2.4.3', 
          date: '2025-12-19', 
          type: 'minor', 
          title: { tr: 'PVLA ve Harita Güncellemeleri', en: 'PVLA & Map Updates', ro: 'Actualizări PVLA și Hărți' },
          changes: [
              'PVLA menü yapısı güncellendi: Matris, Dosyalar ve 3D ayrı sekmelere taşındı.',
              'Harita modülüne LandXML (Alignment & Surface) desteği eklendi.',
              'Admin panelde değişiklik günlüğü modülü eklendi.'
          ]
      }
  ]
};
