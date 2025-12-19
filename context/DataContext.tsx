
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { AppData, InfrastructureProject, Notification, PVLAFile, PVLAIndexConfig, PVLAStructure, SliderItem, ShortcutItem, TopoItem, AppSettings, PolygonPoint, UserProfile, DashboardWidgets, TimelinePhase, WeatherData, DroneFlight, ExternalMapLayer, DailyLog, SitePhoto, ChainageMarker, MachineryStat, SiteIssue, MapNote, StockItem, BoQItem, MatrixCell, UtilityCategory, MatrixColumn, ProgressRow, LandXMLFile } from '../types';
import { INITIAL_DATA } from '../data/InitialData';
import { apiService } from '../services/api';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { SUPABASE_CONFIG } from '../config';

interface DataContextType {
  data: AppData;
  selectedPolyId: string | null;
  setSelectedPolyId: (id: string | null) => void;
  weather: WeatherData | null;
  unreadCount: number;
  resetUnreadCount: () => void;
  addNotification: (note: Omit<Notification, 'id'>) => void;
  updateNotification: (id: string, note: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  addInfraProject: (proj: Omit<InfrastructureProject, 'id'>) => void;
  updateInfraProject: (id: string, proj: Partial<InfrastructureProject>) => void;
  deleteInfraProject: (id: string) => void;
  addShortcut: (item: Omit<ShortcutItem, 'id'>) => void;
  updateShortcut: (id: string, item: Partial<ShortcutItem>) => void;
  deleteShortcut: (id: string) => void;
  addTopoItem: (item: Omit<TopoItem, 'id'>) => void;
  updateTopoItem: (id: string, item: Partial<TopoItem>) => void;
  deleteTopoItem: (id: string) => void;
  addPolygonPoint: (point: Omit<PolygonPoint, 'id'>) => void;
  updatePolygonPoint: (id: string, point: Partial<PolygonPoint>) => void;
  addBulkPolygonPoints: (points: Omit<PolygonPoint, 'id'>[]) => void;
  deletePolygonPoint: (id: string) => void;
  addExternalLayer: (layer: Omit<ExternalMapLayer, 'id'>) => void;
  deleteExternalLayer: (id: string) => void;
  addLandXmlFile: (file: Omit<LandXMLFile, 'id'>) => void;
  deleteLandXmlFile: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  addUtilityCategory: (cat: Omit<UtilityCategory, 'id'>) => void;
  deleteUtilityCategory: (id: string) => void;
  addSitePhoto: (photo: Omit<SitePhoto, 'id'>) => void;
  deleteSitePhoto: (id: string) => void;
  addChainageMarker: (marker: Omit<ChainageMarker, 'id'>) => void;
  updateChainageMarker: (id: string, marker: Partial<ChainageMarker>) => void;
  deleteChainageMarker: (id: string) => void;
  addMachinery: (item: Omit<MachineryStat, 'id'>) => void;
  deleteMachinery: (id: string) => void;
  addSiteIssue: (issue: Omit<SiteIssue, 'id'>) => void;
  updateSiteIssue: (id: string, issue: Partial<SiteIssue>) => void;
  deleteSiteIssue: (id: string) => void;
  addMapNote: (note: Omit<MapNote, 'id'>) => void;
  deleteMapNote: (id: string) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, item: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  addBoQItem: (item: Omit<BoQItem, 'id'>) => void;
  updateBoQItem: (id: string, item: Partial<BoQItem>) => void;
  deleteBoQItem: (id: string) => void;
  
  // Matrix Operations
  updateMatrixCell: (rowId: string, colId: string, cellData: Partial<MatrixCell>) => void;
  addMatrixColumn: (type: 'Bridge' | 'Culvert', column: MatrixColumn) => void;
  updateMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string, column: Partial<MatrixColumn>) => void;
  deleteMatrixColumn: (type: 'Bridge' | 'Culvert', colId: string) => void;
  addMatrixRow: (row: ProgressRow) => void;
  deleteMatrixRow: (rowId: string) => void;

  addPVLAFile: (file: Omit<PVLAFile, 'id'>) => void;
  updatePVLAFile: (id: string, file: Partial<PVLAFile>) => void;
  deletePVLAFile: (id: string) => void;
  updatePVLAIndex: (type: 'Bridge' | 'Culvert', config: Partial<PVLAIndexConfig>) => void;
  addPVLAStructure: (structure: Omit<PVLAStructure, 'id'>) => void;
  deletePVLAStructure: (id: string) => void;
  addSlide: (slide: Omit<SliderItem, 'id'>) => void;
  updateSlide: (id: string, slide: Partial<SliderItem>) => void;
  deleteSlide: (id: string) => void;
  addDroneFlight: (flight: Omit<DroneFlight, 'id'>) => void;
  updateDroneFlight: (id: string, flight: Partial<DroneFlight>) => void;
  deleteDroneFlight: (id: string) => void;
  updateMenuLabel: (key: string, label: any) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateDashboardWidgets: (widgets: Partial<DashboardWidgets>) => void;
  updateDailyLog: (log: DailyLog) => void;
  updateTimelinePhase: (id: number, phase: Partial<TimelinePhase>) => void;
  isSaving: boolean;
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
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPolyId, setSelectedPolyId] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [unreadCount, setUnreadCount] = useState(1);

  const saveTimeoutRef = useRef<any>(null);

  // 1. Initial Data Load
  useEffect(() => {
    apiService.fetchData(INITIAL_DATA).then(res => {
      setData(res);
      setUsers(res.users);
      setIsLoaded(true);
    });

    // Weather logic (omitted for brevity, same as before)
    const fetchWeather = async () => {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.7262&longitude=24.3765&current_weather=true&windspeed_unit=kmh&timezone=auto');
            if (!res.ok) throw new Error(`Weather API Error`);
            const weatherData = await res.json();
            if (weatherData && weatherData.current_weather) {
                setWeather({
                    temp: weatherData.current_weather.temperature,
                    wind: weatherData.current_weather.windspeed,
                    code: weatherData.current_weather.weathercode
                });
            }
        } catch (error) {
            setWeather({ temp: 18, wind: 12, code: 1 });
        }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000); 
    return () => clearInterval(weatherInterval);
  }, []);

  // 2. Auto-Save to DB on Change (Migration Logic)
  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    // Auto-save debounce (2 seconds)
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      // This will upsert all current state to the DB tables
      await apiService.saveData(data);
      setIsSaving(false);
    }, 2000);
  }, [data, isLoaded]);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const resetUnreadCount = () => setUnreadCount(0);

  // --- ACTIONS ---
  // All actions update local state, which triggers useEffect above to save to DB
  
  const addNotification = (note: any) => { setData(prev => ({ ...prev, notifications: [{ ...note, id: generateId() }, ...prev.notifications] })); setUnreadCount(p => p + 1); showToast('Bildirim eklendi'); };
  const updateNotification = (id: string, note: any) => setData(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, ...note } : n) }));
  const deleteNotification = (id: string) => setData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
  const addExternalLayer = (layer: any) => setData(prev => ({ ...prev, externalLayers: [...prev.externalLayers, { ...layer, id: generateId() }] }));
  const deleteExternalLayer = (id: string) => setData(prev => ({ ...prev, externalLayers: prev.externalLayers.filter(l => l.id !== id) }));
  const addLandXmlFile = (file: any) => setData(prev => ({ ...prev, landXmlFiles: [...prev.landXmlFiles, { ...file, id: generateId() }] }));
  const deleteLandXmlFile = (id: string) => setData(prev => ({ ...prev, landXmlFiles: prev.landXmlFiles.filter(l => l.id !== id) }));
  const toggleLayerVisibility = (id: string) => setData(prev => ({ ...prev, externalLayers: prev.externalLayers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l) }));
  const addInfraProject = (proj: any) => setData(prev => ({ ...prev, infraProjects: [...prev.infraProjects, { ...proj, id: generateId() }] }));
  const updateInfraProject = (id: string, proj: any) => setData(prev => ({ ...prev, infraProjects: prev.infraProjects.map(p => p.id === id ? { ...p, ...proj } : p) }));
  const deleteInfraProject = (id: string) => setData(prev => ({ ...prev, infraProjects: prev.infraProjects.filter(p => p.id !== id) }));
  const addShortcut = (item: any) => setData(prev => ({ ...prev, shortcuts: [...prev.shortcuts, { ...item, id: generateId() }] }));
  const updateShortcut = (id: string, item: any) => setData(prev => ({ ...prev, shortcuts: prev.shortcuts.map(s => s.id === id ? { ...s, ...item } : s) }));
  const deleteShortcut = (id: string) => setData(prev => ({ ...prev, shortcuts: prev.shortcuts.filter(s => s.id !== id) }));
  const addTopoItem = (item: any) => setData(prev => ({ ...prev, topoItems: [...prev.topoItems, { ...item, id: generateId() }] }));
  const updateTopoItem = (id: string, item: any) => setData(prev => ({ ...prev, topoItems: prev.topoItems.map(t => t.id === id ? { ...t, ...item } : t) }));
  const deleteTopoItem = (id: string) => setData(prev => ({ ...prev, topoItems: prev.topoItems.filter(t => t.id !== id) }));
  const addPolygonPoint = (p: any) => setData(prev => ({ ...prev, polygonPoints: [...prev.polygonPoints, { ...p, id: generateId() }] }));
  const updatePolygonPoint = (id: string, point: any) => setData(prev => ({ ...prev, polygonPoints: prev.polygonPoints.map(p => p.id === id ? { ...p, ...point } : p) }));
  const addBulkPolygonPoints = (pts: any[]) => setData(prev => ({ ...prev, polygonPoints: [...prev.polygonPoints, ...pts.map(p => ({ ...p, id: generateId() }))] }));
  const deletePolygonPoint = (id: string) => setData(prev => ({ ...prev, polygonPoints: prev.polygonPoints.filter(p => p.id !== id) }));
  const addUtilityCategory = (cat: any) => setData(prev => ({ ...prev, utilityCategories: [...prev.utilityCategories, { ...cat, id: generateId() }] }));
  const deleteUtilityCategory = (id: string) => setData(prev => ({ ...prev, utilityCategories: prev.utilityCategories.filter(c => c.id !== id) }));
  const addSitePhoto = (photo: any) => setData(prev => ({ ...prev, sitePhotos: [...prev.sitePhotos, { ...photo, id: generateId() }] }));
  const deleteSitePhoto = (id: string) => setData(prev => ({ ...prev, sitePhotos: prev.sitePhotos.filter(p => p.id !== id) }));
  const addChainageMarker = (marker: any) => setData(prev => ({ ...prev, chainageMarkers: [...prev.chainageMarkers, { ...marker, id: generateId() }] }));
  const updateChainageMarker = (id: string, marker: any) => setData(prev => ({ ...prev, chainageMarkers: prev.chainageMarkers.map(m => m.id === id ? { ...m, ...marker } : m) }));
  const deleteChainageMarker = (id: string) => setData(prev => ({ ...prev, chainageMarkers: prev.chainageMarkers.filter(m => m.id !== id) }));
  const addMachinery = (m: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: [...prev.dashboardWidgets.machinery, { ...m, id: generateId() }] } }));
  const deleteMachinery = (id: string) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: prev.dashboardWidgets.machinery.filter(m => m.id !== id) } }));
  const addSiteIssue = (issue: any) => setData(prev => ({ ...prev, siteIssues: [...prev.siteIssues, { ...issue, id: generateId() }] }));
  const updateSiteIssue = (id: string, issue: any) => setData(prev => ({ ...prev, siteIssues: prev.siteIssues.map(i => i.id === id ? { ...i, ...issue } : i) }));
  const deleteSiteIssue = (id: string) => setData(prev => ({ ...prev, siteIssues: prev.siteIssues.filter(i => i.id !== id) }));
  const addMapNote = (note: any) => setData(prev => ({ ...prev, mapNotes: [...prev.mapNotes, { ...note, id: generateId() }] }));
  const deleteMapNote = (id: string) => setData(prev => ({ ...prev, mapNotes: prev.mapNotes.filter(n => n.id !== id) }));
  const addStockItem = (s: any) => setData(prev => ({ ...prev, stocks: [...prev.stocks, { ...s, id: generateId() }] }));
  const updateStockItem = (id: string, s: any) => setData(prev => ({ ...prev, stocks: prev.stocks.map(i => i.id === id ? { ...i, ...s } : i) }));
  const deleteStockItem = (id: string) => setData(prev => ({ ...prev, stocks: prev.stocks.filter(i => i.id !== id) }));
  const addBoQItem = (b: any) => setData(prev => ({ ...prev, boqItems: [...prev.boqItems, { ...b, id: generateId() }] }));
  const updateBoQItem = (id: string, b: any) => setData(prev => ({ ...prev, boqItems: prev.boqItems.map(i => i.id === id ? { ...i, ...b } : i) }));
  const deleteBoQItem = (id: string) => setData(prev => ({ ...prev, boqItems: prev.boqItems.filter(i => i.id !== id) }));
  
  const updateMatrixCell = (rowId: string, colId: string, cell: any) => setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: { ...r.cells[colId], ...cell } } } : r) }));
  const addMatrixColumn = (type: 'Bridge' | 'Culvert', column: MatrixColumn) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: [...prev.matrixColumns[type], column] } })); };
  const updateMatrixColumn = (type: 'Bridge' | 'Culvert', colId: string, updatedCol: Partial<MatrixColumn>) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].map(c => c.id === colId ? { ...c, ...updatedCol } : c) } })); };
  const deleteMatrixColumn = (type: 'Bridge' | 'Culvert', colId: string) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].filter(c => c.id !== colId) } })); };
  const addMatrixRow = (row: ProgressRow) => { setData(prev => ({ ...prev, progressMatrix: [...prev.progressMatrix, row] })); };
  const deleteMatrixRow = (rowId: string) => { setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.filter(r => r.id !== rowId) })); };

  const addPVLAFile = (f: any) => setData(prev => ({ ...prev, pvlaFiles: [{ ...f, id: generateId() }, ...prev.pvlaFiles] }));
  const updatePVLAFile = (id: string, f: any) => setData(prev => ({ ...prev, pvlaFiles: prev.pvlaFiles.map(i => i.id === id ? { ...i, ...f } : i) }));
  const deletePVLAFile = (id: string) => setData(prev => ({ ...prev, pvlaFiles: prev.pvlaFiles.filter(i => i.id !== id) }));
  const updatePVLAIndex = (type: any, cfg: any) => setData(prev => ({ ...prev, pvlaIndices: { ...prev.pvlaIndices, [type]: { ...prev.pvlaIndices[type], ...cfg } } }));
  const addPVLAStructure = (s: any) => setData(prev => ({ ...prev, pvlaStructures: [...prev.pvlaStructures, { ...s, id: generateId() }] }));
  const deletePVLAStructure = (id: string) => setData(prev => ({ ...prev, pvlaStructures: prev.pvlaStructures.filter(s => s.id !== id) }));
  const addSlide = (s: any) => setData(prev => ({ ...prev, slides: [...prev.slides, { ...s, id: generateId() }] }));
  const updateSlide = (id: string, s: any) => setData(prev => ({ ...prev, slides: prev.slides.map(i => i.id === id ? { ...i, ...s } : i) }));
  const deleteSlide = (id: string) => setData(prev => ({ ...prev, slides: prev.slides.filter(i => i.id !== id) }));
  const addDroneFlight = (f: any) => setData(prev => ({ ...prev, droneFlights: [{ ...f, id: generateId() }, ...prev.droneFlights] }));
  const updateDroneFlight = (id: string, f: any) => setData(prev => ({ ...prev, droneFlights: prev.droneFlights.map(i => i.id === id ? { ...i, ...f } : i) }));
  const deleteDroneFlight = (id: string) => setData(prev => ({ ...prev, droneFlights: prev.droneFlights.filter(i => i.id !== id) }));
  const updateMenuLabel = (key: string, l: any) => setData(prev => ({ ...prev, menuConfig: { ...prev.menuConfig, [key]: l } }));
  const updateAppSettings = (s: any) => setData(prev => ({ ...prev, settings: { ...prev.settings, ...s } }));
  const updateUserProfile = (p: any) => setData(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...p } }));
  const updateDashboardWidgets = (w: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, ...w } }));
  const updateDailyLog = (l: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, dailyLog: l } }));
  const updateTimelinePhase = (id: number, p: any) => setData(prev => ({ ...prev, timelinePhases: prev.timelinePhases.map(ph => ph.id === id ? { ...ph, ...p } : ph) }));

  return (
    <DataContext.Provider value={{ 
      data, selectedPolyId, setSelectedPolyId, weather, unreadCount, resetUnreadCount,
      addNotification, updateNotification, deleteNotification, addInfraProject, updateInfraProject, deleteInfraProject, 
      addShortcut, updateShortcut, deleteShortcut, addTopoItem, updateTopoItem, deleteTopoItem,
      addPolygonPoint, updatePolygonPoint, addBulkPolygonPoints, deletePolygonPoint, addExternalLayer, deleteExternalLayer, 
      addLandXmlFile, deleteLandXmlFile, toggleLayerVisibility,
      addUtilityCategory, deleteUtilityCategory,
      addSitePhoto, deleteSitePhoto, addChainageMarker, updateChainageMarker, deleteChainageMarker, addMachinery, deleteMachinery,
      addSiteIssue, updateSiteIssue, deleteSiteIssue, addMapNote, deleteMapNote,
      addStockItem, updateStockItem, deleteStockItem, addBoQItem, updateBoQItem, deleteBoQItem,
      updateMatrixCell, addMatrixColumn, updateMatrixColumn, deleteMatrixColumn, addMatrixRow, deleteMatrixRow,
      addPVLAFile, updatePVLAFile, deletePVLAFile, updatePVLAIndex, addPVLAStructure, deletePVLAStructure,
      addSlide, updateSlide, deleteSlide, addDroneFlight, updateDroneFlight, deleteDroneFlight,
      updateMenuLabel, updateAppSettings, updateUserProfile, updateDashboardWidgets, updateDailyLog, updateTimelinePhase,
      isSaving
    }}>
      {children}
    </DataContext.Provider>
  );
};
