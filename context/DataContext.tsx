
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
    AppData, 
    WeatherData, 
    StructureType, 
    StructureTreeItem, 
    StructureGroup, 
    StructureElement, 
    ElementCoordinates, 
    Notification, 
    ChangelogEntry,
    StructureLayer,
    StructureSurface,
    MapNote,
    SitePhoto
} from '../types';
import { MasterAlignment } from '../types/design'; // Added
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
import { useMasterDesign } from '../hooks/useMasterDesign'; // Added

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
  addNotification: (note: Omit<Notification, 'id'>) => Promise<void>;
  updateNotification: (id: string, note: Partial<Notification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  addInfraProject: (proj: any) => void;
  updateInfraProject: (id: string, proj: any) => void;
  deleteInfraProject: (id: string) => void;
  addShortcut: (item: any) => void;
  updateShortcut: (id: string, item: any) => void;
  deleteShortcut: (id: string) => void;
  
  // CHANGELOG (SQL CONNECTED)
  addChangelog: (item: Omit<ChangelogEntry, 'id'>) => Promise<void>;
  updateChangelog: (id: string, item: Partial<ChangelogEntry>) => Promise<void>;
  deleteChangelog: (id: string) => Promise<void>;
  
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
  addDesignLayer: (layer: any) => void; // NEW
  deleteDesignLayer: (id: string) => void; // NEW
  addLandXmlFile: (file: any) => void;
  deleteLandXmlFile: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  addUtilityCategory: (cat: any) => void;
  deleteUtilityCategory: (id: string) => void;
  
  // Site Photos (SQL)
  addSitePhoto: (photo: Omit<SitePhoto, 'id'>) => Promise<void>;
  deleteSitePhoto: (id: string) => Promise<void>;
  
  addChainageMarker: (marker: any) => void;
  updateChainageMarker: (id: string, marker: any) => void;
  deleteChainageMarker: (id: string) => void;
  addBulkChainageMarkers: (markers: any[]) => Promise<void>;

  addMachinery: (item: any) => Promise<void>;
  deleteMachinery: (id: string) => Promise<void>;
  addSiteIssue: (issue: any) => void;
  updateSiteIssue: (id: string, issue: any) => void;
  deleteSiteIssue: (id: string) => void;
  
  // Map Notes (SQL)
  addMapNote: (note: Omit<MapNote, 'id'>) => Promise<void>;
  deleteMapNote: (id: string) => Promise<void>;
  
  addStockItem: (item: any) => void;
  updateStockItem: (id: string, item: any) => void;
  deleteStockItem: (id: string) => void;
  addBoQItem: (item: any) => void;
  updateBoQItem: (id: string, item: any) => void;
  deleteBoQItem: (id: string) => void;
  
  // Matrix & PVLA
  updateMatrixCell: (rowId: string, colId: string, cellData: any) => Promise<void>;
  addMatrixColumn: (type: 'Bridge' | 'Culvert', column: any) => void;
  updateMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string, column: any) => void;
  deleteMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string) => void;
  addMatrixRow: (row: any) => Promise<void>;
  deleteMatrixRow: (rowId: string) => Promise<void>;
  
  addPVLAFile: (file: any) => Promise<void>;
  updatePVLAFile: (id: string, file: any) => void;
  deletePVLAFile: (id: string) => Promise<void>;
  updatePVLAIndex: (type: 'Bridge' | 'Culvert', config: any) => void;
  addPVLAStructure: (structure: any) => Promise<void>;
  deletePVLAStructure: (id: string) => Promise<void>;
  
  addSlide: (slide: any) => void;
  updateSlide: (id: string, slide: any) => void;
  deleteSlide: (id: string) => void;
  
  addDroneFlight: (flight: any) => Promise<void>;
  updateDroneFlight: (id: string, flight: any) => Promise<void>;
  deleteDroneFlight: (id: string) => Promise<void>;
  
  updateMenuLabel: (key: string, label: any) => void;
  updateMenuStructure: (structure: any) => void;
  updateAppSettings: (settings: any) => void;
  updateUserProfile: (profile: any) => void;
  updateDashboardWidgets: (widgets: any) => void;
  updateDailyLog: (log: any) => void;
  
  // Timeline
  addTimelinePhase: (phase: any) => void;
  updateTimelinePhase: (id: number, phase: any) => void;
  deleteTimelinePhase: (id: number) => void;

  isSaving: boolean;

  // --- 3D Structure Manager ---
  struct: {
      types: StructureType[];
      structures: StructureTreeItem[];
      layers: StructureLayer[];
      isLoading: boolean;
      loadTypes: () => Promise<void>;
      loadStructures: () => Promise<void>;
      loadLayers: () => Promise<void>;
      addStructureType: (t: any) => Promise<void>;
      updateStructureType: (id: string, t: any) => Promise<void>;
      deleteStructureType: (id: string) => Promise<void>;
      addStructure: (s: any) => Promise<void>;
      deleteStructure: (id: string) => Promise<void>;
      
      addGroup: (g: any) => Promise<void>;
      updateGroup: (id: string, g: Partial<StructureGroup>) => Promise<void>;
      deleteGroup: (id: string) => Promise<void>;
      
      addElement: (e: any, c: any) => Promise<void>;
      updateElement: (id: string, e: Partial<StructureElement>, c?: Partial<ElementCoordinates>) => Promise<void>;
      deleteElement: (id: string) => Promise<void>;
      
      addBulkElements: (groupId: string, text: string) => Promise<void>;

      // Earthworks / Layers
      addLayer: (layer: Omit<StructureLayer, 'id'>) => Promise<void>;
      deleteLayer: (id: string) => Promise<void>;
      addSurface: (surface: Omit<StructureSurface, 'id' | 'updatedAt'>) => Promise<void>;
      deleteSurface: (id: string) => Promise<void>;
  };

  // --- Master Design ---
  design: {
      alignments: MasterAlignment[];
      isLoading: boolean;
      loadAlignments: () => Promise<void>;
      parseAndSaveLandXML: (file: File, description: string, userId?: string) => Promise<void>;
      deleteAlignment: (id: string) => Promise<void>;
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
  const { setUsers, currentUser } = useAuth();
  
  // 1. Core Data Persistence (SQL aggregated fetch from db.ts)
  const { data, setData, isSaving, reloadPolygons } = useDataPersistence(setUsers);
  
  // 2. Weather
  const weather = useWeather();

  // 3. UI State (Local)
  const [selectedPolyId, setSelectedPolyId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const resetUnreadCount = () => setUnreadCount(0);

  // 4. Feature Managers (Hooks)
  const polygonOps = usePolygonManager(data, setData, reloadPolygons, showToast);
  const chainageOps = useChainageManager(setData, showToast);
  const entityOps = useEntityManager(setData, showToast);
  const structureOps = useStructureManager(showToast);
  const designOps = useMasterDesign(showToast); // Added

  // --- INITIAL SQL DATA LOAD CHECK ---
  useEffect(() => {
      // DataPersistence loads the main bulk via apiService.fetchData.
      if (data.notifications && data.notifications.length > 0) {
          setUnreadCount(data.notifications.length); 
      }
  }, [data.notifications]);

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

  // --- OVERRIDDEN HANDLERS (Direct SQL) ---

  // Notifications
  const addNotification = async (note: Omit<Notification, 'id'>) => {
      const savedNote = await apiService.addNotification(note);
      if (savedNote) {
          setData(prev => ({ ...prev, notifications: [savedNote, ...prev.notifications] }));
          setUnreadCount(p => p + 1);
          showToast('Bildirim eklendi.');
      } else {
          showToast('Bildirim eklenirken hata oluştu.', 'error');
      }
  };
  const updateNotification = async (id: string, note: Partial<Notification>) => {
      const success = await apiService.updateNotification(id, note);
      if (success) {
          setData(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, ...note } : n) }));
          showToast('Bildirim güncellendi.');
      } else { showToast('Hata oluştu.', 'error'); }
  };
  const deleteNotification = async (id: string) => {
      const success = await apiService.deleteNotification(id);
      if (success) {
          setData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
          showToast('Bildirim silindi.');
      } else { showToast('Hata oluştu.', 'error'); }
  };

  // Drone Flights
  const addDroneFlight = async (flight: any) => {
      const saved = await apiService.addDroneFlight(flight);
      if (saved) {
          setData(prev => ({ ...prev, droneFlights: [saved, ...prev.droneFlights] }));
          showToast('Drone uçuşu eklendi.');
      } else { showToast('Hata oluştu.', 'error'); }
  };
  const updateDroneFlight = async (id: string, flight: any) => {
      const success = await apiService.updateDroneFlight(id, flight);
      if(success) {
          setData(prev => ({ ...prev, droneFlights: prev.droneFlights.map(f => f.id === id ? { ...f, ...flight } : f) }));
          showToast('Güncellendi.');
      } else { showToast('Hata.', 'error'); }
  };
  const deleteDroneFlight = async (id: string) => {
      const success = await apiService.deleteDroneFlight(id);
      if(success) {
          setData(prev => ({ ...prev, droneFlights: prev.droneFlights.filter(f => f.id !== id) }));
          showToast('Silindi.');
      } else { showToast('Hata.', 'error'); }
  };

  // Machinery
  const addMachinery = async (item: any) => {
      const saved = await apiService.addMachinery(item);
      if(saved) {
          setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: [...prev.dashboardWidgets.machinery, saved] } }));
          showToast('Makine eklendi.');
      } else { showToast('Hata.', 'error'); }
  };
  const deleteMachinery = async (id: string) => {
      const success = await apiService.deleteMachinery(id);
      if(success) {
          setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: prev.dashboardWidgets.machinery.filter(m => m.id !== id) } }));
          showToast('Makine silindi.');
      } else { showToast('Hata.', 'error'); }
  };

  // PVLA STRUCTURES
  const addPVLAStructure = async (s: any) => {
      const saved = await apiService.addPvlaStructure(s);
      if(saved) {
          setData(prev => ({ ...prev, pvlaStructures: [...prev.pvlaStructures, saved] }));
          showToast('Yapı eklendi.');
      } else { showToast('Hata.', 'error'); }
  };
  const deletePVLAStructure = async (id: string) => {
      const success = await apiService.deletePvlaStructure(id);
      if(success) {
          setData(prev => ({ ...prev, pvlaStructures: prev.pvlaStructures.filter(s => s.id !== id) }));
          showToast('Yapı silindi.');
      } else { showToast('Hata.', 'error'); }
  };

  // PVLA FILES
  const addPVLAFile = async (file: any) => {
      const saved = await apiService.addPVLAFile(file);
      if(saved) {
          setData(prev => ({ ...prev, pvlaFiles: [saved, ...prev.pvlaFiles] }));
      } else { showToast('Dosya kayıt hatası.', 'error'); }
  };
  const deletePVLAFile = async (id: string) => {
      const success = await apiService.deletePVLAFile(id);
      if(success) {
          setData(prev => ({ ...prev, pvlaFiles: prev.pvlaFiles.filter(f => f.id !== id) }));
          showToast('Dosya silindi.');
      } else { showToast('Hata.', 'error'); }
  };

  // MATRIX
  const addMatrixRow = async (row: any) => {
      const success = await apiService.addMatrixRow(row);
      if(success) {
          setData(prev => ({ ...prev, progressMatrix: [...prev.progressMatrix, row] }));
      } else { showToast('Hata.', 'error'); }
  };
  const deleteMatrixRow = async (rowId: string) => {
      const success = await apiService.deleteMatrixRow(rowId);
      if(success) {
          setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.filter(r => r.id !== rowId) }));
          showToast('Satır silindi.');
      } else { showToast('Hata.', 'error'); }
  };
  const updateMatrixCell = async (rowId: string, colId: string, cellData: any) => {
      const row = data.progressMatrix.find(r => r.id === rowId);
      if (!row) return;
      const newCells = { ...row.cells, [colId]: { ...row.cells[colId], ...cellData } };
      
      const success = await apiService.updateMatrixCell(rowId, newCells);
      if(success) {
          setData(prev => ({ 
              ...prev, 
              progressMatrix: prev.progressMatrix.map(r => r.id === rowId ? { ...r, cells: newCells } : r) 
          }));
      } else { showToast('Hücre güncelleme hatası.', 'error'); }
  };

  // CHANGELOGS (Updated to SQL)
  const addChangelog = async (item: Omit<ChangelogEntry, 'id'>) => {
      const saved = await apiService.addChangelog(item);
      if(saved) {
          setData(prev => ({ ...prev, changelog: [saved, ...prev.changelog] }));
      } else { showToast('Kayıt hatası.', 'error'); }
  };
  const updateChangelog = async (id: string, item: Partial<ChangelogEntry>) => {
      const success = await apiService.updateChangelog(id, item);
      if(success) {
          setData(prev => ({ ...prev, changelog: prev.changelog.map(c => c.id === id ? { ...c, ...item } : c) }));
      } else { showToast('Güncelleme hatası.', 'error'); }
  };
  const deleteChangelog = async (id: string) => {
      const success = await apiService.deleteChangelog(id);
      if(success) {
          setData(prev => ({ ...prev, changelog: prev.changelog.filter(c => c.id !== id) }));
      } else { showToast('Silme hatası.', 'error'); }
  };

  // MAP NOTES (Updated to SQL)
  const addMapNote = async (note: Omit<MapNote, 'id'>) => {
      if(!currentUser) { showToast('Oturum açmalısınız', 'error'); return; }
      const saved = await apiService.addMapNote(note, currentUser.id);
      if (saved) {
          setData(prev => ({ ...prev, mapNotes: [...prev.mapNotes, saved] }));
          showToast('Not haritaya eklendi.');
      } else { showToast('Hata.', 'error'); }
  };
  const deleteMapNote = async (id: string) => {
      const success = await apiService.deleteMapNote(id);
      if (success) {
          setData(prev => ({ ...prev, mapNotes: prev.mapNotes.filter(n => n.id !== id) }));
          showToast('Not silindi.');
      } else { showToast('Silinemedi.', 'error'); }
  };

  // SITE PHOTOS (New SQL Method)
  const addSitePhoto = async (photo: Omit<SitePhoto, 'id'>) => {
      if(!currentUser) { showToast('Oturum açmalısınız', 'error'); return; }
      const saved = await apiService.addSitePhoto(photo, currentUser.id);
      if(saved) {
          setData(prev => ({ ...prev, sitePhotos: [...prev.sitePhotos, saved] }));
          showToast('Saha fotoğrafı eklendi.');
      } else { showToast('Hata.', 'error'); }
  };
  const deleteSitePhoto = async (id: string) => {
      const success = await apiService.deleteSitePhoto(id);
      if(success) {
          setData(prev => ({ ...prev, sitePhotos: prev.sitePhotos.filter(p => p.id !== id) }));
          showToast('Fotoğraf silindi.');
      } else { showToast('Hata.', 'error'); }
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
      
      // Override standard generic ops with specific SQL ops
      addNotification, updateNotification, deleteNotification,
      addDroneFlight, updateDroneFlight, deleteDroneFlight,
      addMachinery, deleteMachinery,
      addPVLAStructure, deletePVLAStructure,
      addPVLAFile, deletePVLAFile,
      addMatrixRow, deleteMatrixRow, updateMatrixCell,
      addChangelog, updateChangelog, deleteChangelog,
      addMapNote, deleteMapNote,
      addSitePhoto, deleteSitePhoto, // New overrides
      
      struct: structureOps, 
      design: designOps, // Added

      isSaving
    }}>
      {children}
    </DataContext.Provider>
  );
};
