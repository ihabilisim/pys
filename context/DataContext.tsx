
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppData, WeatherData, StructureType, StructureTreeItem } from '../types';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

// Import Modular Hooks
import { useDataPersistence } from '../hooks/useDataPersistence';
import { useWeather } from '../hooks/useWeather';
import { usePolygonManager } from '../hooks/usePolygonManager';
import { useChainageManager } from '../hooks/useChainageManager';
import { useEntityManager } from '../hooks/useEntityManager';
import { useStructureManager } from '../hooks/useStructureManager';

interface DataContextType {
  data: AppData;
  selectedPolyId: string | null;
  setSelectedPolyId: (id: string | null) => void;
  weather: WeatherData | null;
  unreadCount: number;
  resetUnreadCount: () => void;
  
  // Lazy Load Methods
  loadPvlaFiles: (structureId?: string) => Promise<void>;
  loadSiteIssues: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadMapData: () => Promise<void>;
  loadAllPolygons: () => Promise<void>;

  // Expose all methods from hooks
  addNotification: (note: any) => void;
  updateNotification: (id: string, note: any) => void;
  deleteNotification: (id: string) => void;
  addInfraProject: (proj: any) => void;
  updateInfraProject: (id: string, proj: any) => void;
  deleteInfraProject: (id: string) => void;
  addShortcut: (item: any) => void;
  updateShortcut: (id: string, item: any) => void;
  deleteShortcut: (id: string) => void;
  addChangelog: (item: any) => void;
  updateChangelog: (id: string, item: any) => void;
  deleteChangelog: (id: string) => void;
  addTopoItem: (item: any) => void;
  updateTopoItem: (id: string, item: any) => void;
  deleteTopoItem: (id: string) => void;
  
  addPolygonPoint: (point: any) => Promise<void>;
  updatePolygonPoint: (id: string, point: any) => Promise<void>;
  addBulkPolygonPoints: (points: any[]) => Promise<void>;
  deletePolygonPoint: (id: string) => Promise<boolean>; 
  reloadPolygons: () => Promise<void>;

  addExternalLayer: (layer: any) => void;
  deleteExternalLayer: (id: string) => void;
  addLandXmlFile: (file: any) => void;
  deleteLandXmlFile: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  addUtilityCategory: (cat: any) => void;
  deleteUtilityCategory: (id: string) => void;
  addSitePhoto: (photo: any) => void;
  deleteSitePhoto: (id: string) => void;
  
  addChainageMarker: (marker: any) => void;
  updateChainageMarker: (id: string, marker: any) => void;
  deleteChainageMarker: (id: string) => void;
  addBulkChainageMarkers: (markers: any[]) => Promise<void>;

  addMachinery: (item: any) => void;
  deleteMachinery: (id: string) => void;
  addSiteIssue: (issue: any) => void;
  updateSiteIssue: (id: string, issue: any) => void;
  deleteSiteIssue: (id: string) => void;
  addMapNote: (note: any) => void;
  deleteMapNote: (id: string) => void;
  addStockItem: (item: any) => void;
  updateStockItem: (id: string, item: any) => void;
  deleteStockItem: (id: string) => void;
  addBoQItem: (item: any) => void;
  updateBoQItem: (id: string, item: any) => void;
  deleteBoQItem: (id: string) => void;
  updateMatrixCell: (rowId: string, colId: string, cellData: any) => void;
  addMatrixColumn: (type: 'Bridge' | 'Culvert', column: any) => void;
  updateMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string, column: any) => void;
  deleteMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string) => void;
  addMatrixRow: (row: any) => void;
  deleteMatrixRow: (rowId: string) => void;
  addPVLAFile: (file: any) => void;
  updatePVLAFile: (id: string, file: any) => void;
  deletePVLAFile: (id: string) => void;
  updatePVLAIndex: (type: 'Bridge' | 'Culvert', config: any) => void;
  addPVLAStructure: (structure: any) => void;
  deletePVLAStructure: (id: string) => void;
  addSlide: (slide: any) => void;
  updateSlide: (id: string, slide: any) => void;
  deleteSlide: (id: string) => void;
  addDroneFlight: (flight: any) => void;
  updateDroneFlight: (id: string, flight: any) => void;
  deleteDroneFlight: (id: string) => void;
  updateMenuLabel: (key: string, label: any) => void;
  updateMenuStructure: (structure: any) => void;
  updateAppSettings: (settings: any) => void;
  updateUserProfile: (profile: any) => void;
  updateDashboardWidgets: (widgets: any) => void;
  updateDailyLog: (log: any) => void;
  updateTimelinePhase: (id: number, phase: any) => void;
  isSaving: boolean;

  // --- 3D Structure Manager ---
  struct: {
      types: StructureType[];
      structures: StructureTreeItem[];
      isLoading: boolean;
      loadTypes: () => Promise<void>;
      loadStructures: () => Promise<void>;
      addStructureType: (t: any) => Promise<void>;
      updateStructureType: (id: string, t: any) => Promise<void>;
      deleteStructureType: (id: string) => Promise<void>;
      addStructure: (s: any) => Promise<void>;
      addGroup: (g: any) => Promise<void>;
      addElement: (e: any, c: any) => Promise<void>;
      deleteStructure: (id: string) => Promise<void>;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const { showToast } = useUI();
  const { setUsers } = useAuth();
  
  // 1. Core Data Persistence (Load/Save)
  const { data, setData, isSaving, reloadPolygons } = useDataPersistence(setUsers);
  
  // 2. Weather
  const weather = useWeather();

  // 3. UI State (Local)
  const [selectedPolyId, setSelectedPolyId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(1);
  const resetUnreadCount = () => setUnreadCount(0);

  // 4. Feature Managers (Hooks)
  const polygonOps = usePolygonManager(data, setData, reloadPolygons, showToast);
  const chainageOps = useChainageManager(setData, showToast);
  const entityOps = useEntityManager(setData, showToast);
  const structureOps = useStructureManager(showToast); // NEW HOOK

  // 5. Lazy Load Implementations
  const loadPvlaFiles = async (structureId?: string) => {
      const files = await apiService.fetchPVLAFiles(structureId);
      setData(prev => ({ ...prev, pvlaFiles: files }));
  };

  const loadSiteIssues = async () => {
      const issues = await apiService.fetchSiteIssues();
      setData(prev => ({ ...prev, siteIssues: issues }));
  };

  const loadNotifications = async () => {
      const notes = await apiService.fetchNotifications();
      setData(prev => ({ ...prev, notifications: notes }));
  };

  const loadMapData = async () => {
      const { notes, photos } = await apiService.fetchMapData();
      setData(prev => ({ ...prev, mapNotes: notes, sitePhotos: photos }));
  };

  const addNotificationWrapper = (note: any) => {
      entityOps.addNotification(note);
      setUnreadCount(p => p + 1);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      selectedPolyId, 
      setSelectedPolyId, 
      weather, 
      unreadCount, 
      resetUnreadCount,
      
      loadPvlaFiles,
      loadSiteIssues,
      loadNotifications,
      loadMapData,
      loadAllPolygons: polygonOps.loadAllPolygons,

      ...polygonOps,
      reloadPolygons,
      ...chainageOps,
      ...entityOps,
      addNotification: addNotificationWrapper, 
      
      struct: structureOps, // Expose new module

      isSaving
    }}>
      {children}
    </DataContext.Provider>
  );
};
