
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
    AppData, 
    WeatherData, 
    StructureType, 
    StructureTreeItem, 
    StructureGroup, 
    StructureElement, 
    ElementCoordinates, 
    Notification, 
    UserNotification,
    ChangelogEntry,
    StructureLayer,
    StructureSurface,
    MapNote,
    SitePhoto,
    ProgressRow
} from '../types';
import { MasterAlignment } from '../types/design'; 
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { supabase } from '../services/supabase';

// Import Modular Hooks
import { useDataPersistence } from '../hooks/useDataPersistence';
import { useWeather } from '../hooks/useWeather';
import { usePolygonManager } from '../hooks/usePolygonManager';
import { useChainageManager } from '../hooks/useChainageManager';
import { useEntityManager } from '../hooks/useEntityManager';
import { useStructureManager } from '../hooks/useStructureManager';
import { useMasterDesign } from '../hooks/useMasterDesign'; 

interface DataContextType {
  data: AppData;
  selectedPolyId: string | null;
  setSelectedPolyId: (id: string | null) => void;
  weather: WeatherData | null;
  unreadCount: number; // General unread (Chat + System)
  resetUnreadCount: () => void;
  
  // Notification Methods
  notifications: UserNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendSystemNotification: (type: 'PVLA' | 'QUALITY' | 'SYSTEM', title: string, message: string, targetRole?: string) => Promise<void>;

  // Lazy Load Methods
  loadPvlaFiles: (structureId?: string) => Promise<void>;
  loadSiteIssues: () => Promise<void>;
  loadNotifications: () => Promise<void>; // Announcements
  loadUserNotifications: () => Promise<void>; // Personal Alerts
  loadMapData: () => Promise<void>;
  loadAllPolygons: () => Promise<void>;
  loadMatrixRows: () => Promise<void>;

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
  addDesignLayer: (layer: any) => void; 
  deleteDesignLayer: (id: string) => void; 
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

  struct: any;
  design: any;
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
  
  // 1. Core Data Persistence
  const { data, setData, isSaving, reloadPolygons } = useDataPersistence(setUsers);
  
  // 2. Weather
  const weather = useWeather();

  // 3. UI State (Local)
  const [selectedPolyId, setSelectedPolyId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // 4. Feature Managers (Hooks)
  const polygonOps = usePolygonManager(data, setData, reloadPolygons, showToast);
  const chainageOps = useChainageManager(setData, showToast);
  const entityOps = useEntityManager(setData, showToast);
  
  const addMatrixRow = useCallback(async (row: ProgressRow) => {
      const success = await apiService.addMatrixRow(row);
      if(success) {
          setData(prev => ({ ...prev, progressMatrix: [...prev.progressMatrix, row] }));
      } else { showToast('Matris satırı eklenemedi.', 'error'); }
  }, [setData, showToast]);

  const structureOps = useStructureManager(showToast, data.matrixColumns, addMatrixRow);
  const designOps = useMasterDesign(showToast); 

  // --- REAL-TIME & NOTIFICATIONS SETUP ---
  useEffect(() => {
      if (!currentUser || !supabase) return;

      loadUserNotifications();

      const channel = supabase
          .channel(`user_alerts:${currentUser.id}`)
          .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${currentUser.id}` }, 
              (payload) => {
                  const newNotif = payload.new as any;
                  setNotifications(prev => [
                      { 
                          id: newNotif.id, 
                          userId: newNotif.user_id, 
                          type: newNotif.type, 
                          title: newNotif.title, 
                          message: newNotif.message, 
                          link: newNotif.link, 
                          isRead: newNotif.is_read, 
                          createdAt: newNotif.created_at 
                      }, 
                      ...prev
                  ]);
                  showToast(newNotif.title, 'info');
              }
          )
          .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  useEffect(() => {
      const unreadAlerts = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unreadAlerts); 
  }, [notifications]);

  const loadUserNotifications = async () => {
      if (!currentUser) return;
      const notes = await apiService.fetchUserNotifications(currentUser.id);
      setNotifications(notes);
  };

  const markNotificationRead = async (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await apiService.markNotificationRead(id);
  };

  const markAllNotificationsRead = async () => {
      setNotifications([]);
      if(currentUser) await apiService.markAllNotificationsRead(currentUser.id);
  };

  const sendSystemNotification = async (type: 'PVLA'|'QUALITY'|'SYSTEM', title: string, message: string, targetRole?: string) => {
      if (!data.users) return;
      
      const targets = targetRole 
          ? data.users.filter(u => u.role === targetRole || u.role === 'admin')
          : data.users.filter(u => u.role === 'admin' || u.role === 'editor'); 

      for (const u of targets) {
          if (u.id !== currentUser?.id) {
              await apiService.addUserNotification({
                  userId: u.id,
                  type,
                  title,
                  message,
                  link: type === 'PVLA' ? 'pvla' : type === 'QUALITY' ? 'topo' : 'dashboard'
              });
          }
      }
  };

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

  const loadMatrixRows = async () => {
      const matrix = await apiService.fetchMatrix();
      setData(prev => ({ ...prev, progressMatrix: matrix }));
  };

  // --- OVERRIDDEN HANDLERS ---
  const addNotification = async (note: Omit<Notification, 'id'>) => {
      const savedNote = await apiService.addNotification(note);
      if (savedNote) {
          setData(prev => ({ ...prev, notifications: [savedNote, ...prev.notifications] }));
          showToast('Bildirim eklendi.');
          sendSystemNotification('SYSTEM', 'Yeni Duyuru', note.message.tr, 'viewer');
      } else {
          showToast('Hata oluştu.', 'error');
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

  // PVLA FILES
  const addPVLAFile = async (file: any) => {
      const saved = await apiService.addPVLAFile(file);
      if(saved) {
          setData(prev => ({ ...prev, pvlaFiles: [saved, ...prev.pvlaFiles] }));
          // Notify
          const structName = structureOps.structures.find(s => s.id === saved.structureId)?.name || 'Bilinmeyen Yapı';
          sendSystemNotification('PVLA', 'Yeni Dosya Yüklendi', `${structName} için ${file.name} yüklendi.`);
      } else { showToast('Dosya kayıt hatası.', 'error'); }
  };
  const deletePVLAFile = async (id: string) => {
      const success = await apiService.deletePVLAFile(id);
      if(success) {
          setData(prev => ({ ...prev, pvlaFiles: prev.pvlaFiles.filter(f => f.id !== id) }));
          showToast('Dosya silindi.');
      } else { showToast('Hata.', 'error'); }
  };

  // MATRIX & STATUS UPDATES (Relational Fix)
  const updateMatrixCell = async (rowId: string, colId: string, cellData: any) => {
      // Optimistic update
      const row = data.progressMatrix.find(r => r.id === rowId);
      if (!row) return;
      const newCells = { ...row.cells, [colId]: { ...row.cells[colId], ...cellData } };
      
      setData(prev => ({ 
          ...prev, 
          progressMatrix: prev.progressMatrix.map(r => r.id === rowId ? { ...r, cells: newCells } : r) 
      }));

      // Call API with specific cell data
      const success = await apiService.updateMatrixCell(rowId, colId, cellData);
      
      if(success) {
          if (['PENDING', 'SIGNED', 'REJECTED'].includes(cellData.status)) {
              const structName = structureOps.structures.find(s => s.id === row.structureId)?.name || 'Yapı';
              let title = 'PVLA Güncellemesi';
              let msg = '';

              switch(cellData.status) {
                  case 'PENDING':
                      title = '⚠️ Onay Bekliyor';
                      msg = `${structName} - ${row.location} onayınıza sunuldu.`;
                      break;
                  case 'SIGNED':
                      title = '✅ İmalat Onaylandı';
                      msg = `${structName} - ${row.location} tamamlandı ve imzalandı.`;
                      break;
                  case 'REJECTED':
                      title = '⛔ İmalat Reddedildi';
                      msg = `${structName} - ${row.location} reddedildi, lütfen kontrol ediniz.`;
                      break;
              }
              sendSystemNotification('PVLA', title, msg);
          }

      } else { showToast('Hücre güncelleme hatası.', 'error'); }
  };

  const deleteMatrixRow = async (rowId: string) => {
      const success = await apiService.deleteMatrixRow(rowId);
      if(success) {
          setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.filter(r => r.id !== rowId) }));
          showToast('Satır silindi.');
      } else { showToast('Hata.', 'error'); }
  };

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

  const addMapNote = async (note: Omit<MapNote, 'id'>) => {
      if(!currentUser) { showToast('Oturum açmalısınız', 'error'); return; }
      const { data: saved, error } = await apiService.addMapNote(note, currentUser.id);
      if (saved) {
          setData(prev => ({ ...prev, mapNotes: [...prev.mapNotes, saved] }));
          showToast('Not haritaya eklendi.');
      } else { showToast(`Hata: ${error || 'Bilinmeyen Hata'}`, 'error'); }
  };
  const deleteMapNote = async (id: string) => {
      const success = await apiService.deleteMapNote(id);
      if (success) {
          setData(prev => ({ ...prev, mapNotes: prev.mapNotes.filter(n => n.id !== id) }));
          showToast('Not silindi.');
      } else { showToast('Silinemedi.', 'error'); }
  };

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

  const resetUnreadCount = () => {
      setUnreadCount(0);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      selectedPolyId, 
      setSelectedPolyId, 
      weather, 
      unreadCount, 
      resetUnreadCount,
      
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      sendSystemNotification,
      loadUserNotifications,

      loadPvlaFiles,
      loadSiteIssues,
      loadNotifications,
      loadMapData,
      loadMatrixRows,
      loadAllPolygons: polygonOps.loadAllPolygons,

      ...polygonOps,
      reloadPolygons,
      ...chainageOps,
      ...entityOps,
      
      addNotification, updateNotification, deleteNotification,
      addDroneFlight, updateDroneFlight, deleteDroneFlight,
      addMachinery, deleteMachinery,
      addPVLAFile, deletePVLAFile,
      addMatrixRow, deleteMatrixRow, updateMatrixCell,
      addChangelog, updateChangelog, deleteChangelog,
      addMapNote, deleteMapNote,
      addSitePhoto, deleteSitePhoto, 
      
      struct: structureOps, 
      design: designOps, 

      isSaving
    }}>
      {children}
    </DataContext.Provider>
  );
};
