
import type { AppData } from '../types';
import { SURVEY_POLYGONS } from './survey/PoligonList';
// import { SURVEY_KM_MARKERS } from './survey/KM'; // Removed Demo KMs
import { DEMO_USERS, DEMO_PROFILE } from './Users';
import { DEMO_WIDGETS, DEMO_TIMELINE } from './Dashboard';
import { DEMO_STOCKS, DEMO_BOQ } from './Materials';
import { DEMO_PVLA_INDICES, DEMO_PVLA_STRUCTURES, DEMO_PVLA_FILES, DEMO_MATRIX_COLUMNS, DEMO_MATRIX_ROWS } from './PvlaData';
import { DEMO_SETTINGS, DEMO_MENU, DEMO_UTILITY_CATS, DEMO_TOPO_DATA } from './Settings';

// Misc
import { DEMO_ISSUES, DEMO_MAP_NOTES } from './SiteIssues';
import { DEMO_SITE_PHOTOS } from './SitePhotos';
import { DEMO_NOTIFICATIONS } from './Notifications';
import { DEMO_PROJECTS } from './InfraProjects';
import { DEMO_SHORTCUTS } from './Shortcuts';
import { DEMO_TOPO_ITEMS } from './TopoReports';
import { DEMO_SLIDES } from './Slides';
import { DEMO_DRONE_FLIGHTS } from './DroneFlights';

export const INITIAL_DATA: AppData = {
  userProfile: DEMO_PROFILE,
  users: DEMO_USERS,
  dashboardWidgets: DEMO_WIDGETS,
  timelinePhases: DEMO_TIMELINE,
  polygonPoints: SURVEY_POLYGONS,
  topoData: DEMO_TOPO_DATA,
  stocks: DEMO_STOCKS,
  boqItems: DEMO_BOQ,
  pvlaIndices: DEMO_PVLA_INDICES,
  pvlaStructures: DEMO_PVLA_STRUCTURES,
  pvlaFiles: DEMO_PVLA_FILES,
  matrixColumns: DEMO_MATRIX_COLUMNS,
  progressMatrix: DEMO_MATRIX_ROWS,
  siteIssues: DEMO_ISSUES,
  mapNotes: DEMO_MAP_NOTES,
  sitePhotos: DEMO_SITE_PHOTOS,
  chainageMarkers: [], // Temizlendi (Cleaned) - No Demo KM Markers
  notifications: DEMO_NOTIFICATIONS,
  infraProjects: DEMO_PROJECTS,
  shortcuts: DEMO_SHORTCUTS,
  topoItems: DEMO_TOPO_ITEMS,
  slides: DEMO_SLIDES,
  droneFlights: DEMO_DRONE_FLIGHTS,
  externalLayers: [], // Temizlendi (Cleaned) - No Demo Layers
  landXmlFiles: [], // New Empty Array
  utilityCategories: DEMO_UTILITY_CATS,
  settings: DEMO_SETTINGS,
  menuConfig: DEMO_MENU,
};
