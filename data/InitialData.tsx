
import type { AppData } from '../types';
import { DEMO_PROFILE } from './Users';
import { DEMO_WIDGETS, DEMO_TIMELINE } from './Dashboard';
import { DEMO_SETTINGS, DEMO_MENU, DEFAULT_MENU_STRUCTURE, DEMO_UTILITY_CATS } from './Settings';

// INITIAL_DATA now acts as a lightweight scaffolding.
// Heavy data (Polygons, Files, Issues, Matrix Columns, Indices) must come from SQL (Supabase).
export const INITIAL_DATA: AppData = {
  userProfile: DEMO_PROFILE, 
  users: [], // Intentionally empty to force load from DB
  dashboardWidgets: DEMO_WIDGETS, 
  timelinePhases: DEMO_TIMELINE, 
  
  // Empty Arrays to prevent file bloating and force SQL usage
  polygonPoints: [], 
  topoData: { polygonCount: 0, surfaceArea: 0, lastUpdated: '-' },
  
  stocks: [],
  boqItems: [],
  
  pvlaIndices: {
      Bridge: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' },
      Culvert: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' }
  },
  // @FIX: Add pvlaStructures back to the initial data object.
  pvlaStructures: [],
  pvlaFiles: [],
  
  // Static data removed - now loaded from DB
  matrixColumns: { Bridge: [], Culvert: [] }, 
  progressMatrix: [],
  
  siteIssues: [],
  mapNotes: [],
  sitePhotos: [],
  chainageMarkers: [],
  notifications: [],
  userNotifications: [], // Initialized Empty
  infraProjects: [],
  shortcuts: [],
  topoItems: [],
  slides: [],
  droneFlights: [],
  externalLayers: [],
  designLayers: [], // NEW
  landXmlFiles: [],
  utilityCategories: DEMO_UTILITY_CATS,
  
  settings: DEMO_SETTINGS,
  menuConfig: DEMO_MENU,
  menuStructure: DEFAULT_MENU_STRUCTURE,
  changelog: []
};
