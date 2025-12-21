
import React from 'react';
import { AppData } from '../types';

// Bu Hook, Poligon ve KM dışındaki diğer tüm veri tipleri için basit 
// Ekleme/Çıkarma/Güncelleme fonksiyonlarını üretir.
export const useEntityManager = (setData: React.Dispatch<React.SetStateAction<AppData>>, showToast: (msg: string) => void) => {
    
    // GÜNCELLENDİ: SQL UUID formatına uygun ID üretici.
    // Eski kısa ID'ler (Math.random().toString(36)) SQL insert işlemlerinde "invalid input syntax for type uuid" hatası verir.
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // --- Generic Helpers to reduce code repetition ---
    const addItem = (key: keyof AppData, item: any, toastMsg?: string) => {
        const newItem = { ...item, id: generateId() };
        setData(prev => ({ ...prev, [key]: [newItem, ...(prev[key] as any[])] }));
        if(toastMsg) showToast(toastMsg);
    };

    const updateItem = (key: keyof AppData, id: string, updatedFields: any) => {
        setData(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).map((i: any) => i.id === id ? { ...i, ...updatedFields } : i)
        }));
    };

    const deleteItem = (key: keyof AppData, id: string) => {
        setData(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).filter((i: any) => i.id !== id)
        }));
    };

    // --- Specific Implementations ---

    // Notifications
    const addNotification = (n: any) => { addItem('notifications', n, 'Bildirim eklendi'); };
    const updateNotification = (id: string, n: any) => updateItem('notifications', id, n);
    const deleteNotification = (id: string) => deleteItem('notifications', id);

    // Infra Projects
    const addInfraProject = (p: any) => addItem('infraProjects', p);
    const updateInfraProject = (id: string, p: any) => updateItem('infraProjects', id, p);
    const deleteInfraProject = (id: string) => deleteItem('infraProjects', id);

    // Shortcuts
    const addShortcut = (s: any) => addItem('shortcuts', s);
    const updateShortcut = (id: string, s: any) => updateItem('shortcuts', id, s);
    const deleteShortcut = (id: string) => deleteItem('shortcuts', id);

    // Changelog
    const addChangelog = (c: any) => addItem('changelog', c, 'Kayıt eklendi.');
    const updateChangelog = (id: string, c: any) => updateItem('changelog', id, c);
    const deleteChangelog = (id: string) => deleteItem('changelog', id);

    // Topo Items
    const addTopoItem = (t: any) => addItem('topoItems', t);
    const updateTopoItem = (id: string, t: any) => updateItem('topoItems', id, t);
    const deleteTopoItem = (id: string) => deleteItem('topoItems', id);

    // Map Layers & Files
    const addExternalLayer = (l: any) => { setData(prev => ({ ...prev, externalLayers: [...prev.externalLayers, { ...l, id: generateId() }] })); };
    const deleteExternalLayer = (id: string) => deleteItem('externalLayers', id);
    const addLandXmlFile = (f: any) => { setData(prev => ({ ...prev, landXmlFiles: [...prev.landXmlFiles, { ...f, id: generateId() }] })); };
    const deleteLandXmlFile = (id: string) => deleteItem('landXmlFiles', id);
    const toggleLayerVisibility = (id: string) => setData(prev => ({ ...prev, externalLayers: prev.externalLayers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l) }));
    
    // Utilities
    const addUtilityCategory = (c: any) => addItem('utilityCategories', c);
    const deleteUtilityCategory = (id: string) => deleteItem('utilityCategories', id);
    
    // Photos
    const addSitePhoto = (p: any) => addItem('sitePhotos', p);
    const deleteSitePhoto = (id: string) => deleteItem('sitePhotos', id);

    // Dashboard & Machinery
    const addMachinery = (m: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: [...prev.dashboardWidgets.machinery, { ...m, id: generateId() }] } }));
    const deleteMachinery = (id: string) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: prev.dashboardWidgets.machinery.filter(m => m.id !== id) } }));
    
    // Issues & Notes
    const addSiteIssue = (i: any) => addItem('siteIssues', i);
    const updateSiteIssue = (id: string, i: any) => updateItem('siteIssues', id, i);
    const deleteSiteIssue = (id: string) => deleteItem('siteIssues', id);
    const addMapNote = (n: any) => addItem('mapNotes', n);
    const deleteMapNote = (id: string) => deleteItem('mapNotes', id);

    // Materials
    const addStockItem = (s: any) => addItem('stocks', s);
    const updateStockItem = (id: string, s: any) => updateItem('stocks', id, s);
    const deleteStockItem = (id: string) => deleteItem('stocks', id);
    const addBoQItem = (b: any) => addItem('boqItems', b);
    const updateBoQItem = (id: string, b: any) => updateItem('boqItems', id, b);
    const deleteBoQItem = (id: string) => deleteItem('boqItems', id);

    // Matrix & PVLA
    const updateMatrixCell = (rowId: string, colId: string, cell: any) => setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: { ...r.cells[colId], ...cell } } } : r) }));
    const addMatrixColumn = (type: 'Bridge' | 'Culvert', column: any) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: [...prev.matrixColumns[type], column] } })); };
    const updateMatrixColumn = (type: 'Bridge' | 'Culvert', colId: string, updatedCol: any) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].map(c => c.id === colId ? { ...c, ...updatedCol } : c) } })); };
    const deleteMatrixColumn = (type: 'Bridge' | 'Culvert', colId: string) => { setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].filter(c => c.id !== colId) } })); };
    const addMatrixRow = (row: any) => { setData(prev => ({ ...prev, progressMatrix: [...prev.progressMatrix, row] })); };
    const deleteMatrixRow = (rowId: string) => { setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.filter(r => r.id !== rowId) })); };
    
    const addPVLAFile = (f: any) => { setData(prev => ({ ...prev, pvlaFiles: [{ ...f, id: generateId() }, ...prev.pvlaFiles] })); }; // Add to top
    const updatePVLAFile = (id: string, f: any) => updateItem('pvlaFiles', id, f);
    const deletePVLAFile = (id: string) => deleteItem('pvlaFiles', id);
    const updatePVLAIndex = (type: any, cfg: any) => setData(prev => ({ ...prev, pvlaIndices: { ...prev.pvlaIndices, [type]: { ...prev.pvlaIndices[type], ...cfg } } }));
    const addPVLAStructure = (s: any) => addItem('pvlaStructures', s);
    const deletePVLAStructure = (id: string) => deleteItem('pvlaStructures', id);

    // Media & Config
    const addSlide = (s: any) => addItem('slides', s);
    const updateSlide = (id: string, s: any) => updateItem('slides', id, s);
    const deleteSlide = (id: string) => deleteItem('slides', id);
    const addDroneFlight = (f: any) => { setData(prev => ({ ...prev, droneFlights: [{ ...f, id: generateId() }, ...prev.droneFlights] })); };
    const updateDroneFlight = (id: string, f: any) => updateItem('droneFlights', id, f);
    const deleteDroneFlight = (id: string) => deleteItem('droneFlights', id);

    const updateMenuLabel = (key: string, l: any) => setData(prev => ({ ...prev, menuConfig: { ...prev.menuConfig, [key]: l } }));
    const updateMenuStructure = (structure: any) => setData(prev => ({ ...prev, menuStructure: structure }));
    const updateAppSettings = (s: any) => setData(prev => ({ ...prev, settings: { ...prev.settings, ...s } }));
    const updateUserProfile = (p: any) => setData(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...p } }));
    const updateDashboardWidgets = (w: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, ...w } }));
    const updateDailyLog = (l: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, dailyLog: l } }));
    const updateTimelinePhase = (id: number, p: any) => setData(prev => ({ ...prev, timelinePhases: prev.timelinePhases.map(ph => ph.id === id ? { ...ph, ...p } : ph) }));

    return {
        addNotification, updateNotification, deleteNotification,
        addInfraProject, updateInfraProject, deleteInfraProject,
        addShortcut, updateShortcut, deleteShortcut,
        addChangelog, updateChangelog, deleteChangelog,
        addTopoItem, updateTopoItem, deleteTopoItem,
        addExternalLayer, deleteExternalLayer, addLandXmlFile, deleteLandXmlFile, toggleLayerVisibility,
        addUtilityCategory, deleteUtilityCategory,
        addSitePhoto, deleteSitePhoto,
        addMachinery, deleteMachinery,
        addSiteIssue, updateSiteIssue, deleteSiteIssue, addMapNote, deleteMapNote,
        addStockItem, updateStockItem, deleteStockItem,
        addBoQItem, updateBoQItem, deleteBoQItem,
        updateMatrixCell, addMatrixColumn, updateMatrixColumn, deleteMatrixColumn, addMatrixRow, deleteMatrixRow,
        addPVLAFile, updatePVLAFile, deletePVLAFile, updatePVLAIndex, addPVLAStructure, deletePVLAStructure,
        addSlide, updateSlide, deleteSlide,
        addDroneFlight, updateDroneFlight, deleteDroneFlight,
        updateMenuLabel, updateMenuStructure, updateAppSettings, updateUserProfile, updateDashboardWidgets, updateDailyLog, updateTimelinePhase
    };
};
