
import { LocalizedString, UserProfile, User, AppSettings } from './core';
import { ProductionStat, MachineryStat, DailyLog, TimelinePhase, InfrastructureProject, ShortcutItem, StockItem, BoQItem, PVLAIndexConfig, PVLAStructure, PVLAFile, MatrixColumn, ProgressRow, DroneFlight } from './project';
import { TopoItem, PolygonPoint, ExternalMapLayer, UtilityCategory, SitePhoto, ChainageMarker, SiteIssue, MapNote, TopoData, LandXMLFile } from './map';

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
  utilityCategories: UtilityCategory[];
  landXmlFiles: LandXMLFile[]; // New Field

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
  menuConfig: MenuConfig;
  settings: AppSettings;
}
