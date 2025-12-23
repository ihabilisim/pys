
import { LocalizedString, UserProfile, User, AppSettings } from './core';
import { ProductionStat, MachineryStat, DailyLog, TimelinePhase, InfrastructureProject, ShortcutItem, StockItem, BoQItem, PVLAIndexConfig, PVLAStructure, PVLAFile, MatrixColumn, ProgressRow, DroneFlight, ChangelogEntry } from './project';
import { TopoItem, PolygonPoint, ExternalMapLayer, UtilityCategory, SitePhoto, ChainageMarker, SiteIssue, MapNote, TopoData, LandXMLFile, DesignLayer } from './map';

export type ViewMode = 'DASHBOARD' | 'LOGIN' | 'ADMIN';
export type Language = 'tr' | 'en' | 'ro';

export interface Notification {
  id: string;
  date: string;
  message: LocalizedString;
  author: string;
  type: 'update' | 'alert' | 'info';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SliderItem {
  id: string;
  image: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  tag: string;
}

export interface MenuItemConfig {
  id: string;
  label: LocalizedString;
  icon: string;
  visible: boolean;
  order: number;
  children?: MenuItemConfig[]; // NEW: Support for sub-menus
}

export interface MenuConfig {
  [key: string]: LocalizedString;
}

export interface DashboardWidgets {
  hse: {
    accidentFreeDays: number;
    manHours: number;
    lastIncidentDate: string;
  };
  progress: {
    planned: number;
    actual: number;
    description: LocalizedString;
  };
  production: ProductionStat[];
  machinery: MachineryStat[];
  dailyLog: DailyLog;
}

export interface AppData {
  userProfile: UserProfile;
  users: User[];
  dashboardWidgets: DashboardWidgets;
  timelinePhases: TimelinePhase[];
  notifications: Notification[];
  infraProjects: InfrastructureProject[];
  shortcuts: ShortcutItem[];
  topoItems: TopoItem[];
  polygonPoints: PolygonPoint[];
  
  externalLayers: ExternalMapLayer[]; 
  designLayers: DesignLayer[]; // NEW: Separate list for Master Design alignments
  utilityCategories: UtilityCategory[];
  landXmlFiles: LandXMLFile[]; 

  sitePhotos: SitePhoto[]; 
  chainageMarkers: ChainageMarker[];
  
  siteIssues: SiteIssue[];
  mapNotes: MapNote[];
  stocks: StockItem[];
  boqItems: BoQItem[];
  progressMatrix: ProgressRow[];
  matrixColumns: {
      Bridge: MatrixColumn[];
      Culvert: MatrixColumn[];
  };

  pvlaIndices: {
    Bridge: PVLAIndexConfig;
    Culvert: PVLAIndexConfig;
  };
  pvlaStructures: PVLAStructure[];
  pvlaFiles: PVLAFile[];
  
  topoData: TopoData;
  slides: SliderItem[];
  droneFlights: DroneFlight[]; 
  menuConfig: MenuConfig; // Deprecated but kept for compatibility
  menuStructure: MenuItemConfig[]; // NEW: Dynamic Menu Structure
  settings: AppSettings;
  changelog: ChangelogEntry[]; // Added Changelog
}
