
import React from 'react';
import { AppData } from '../types';
import { apiService } from '../services/api';

// Bu Hook, Poligon ve KM dışındaki diğer tüm veri tipleri için basit 
// Ekleme/Çıkarma/Güncelleme fonksiyonlarını üretir.
export const useEntityManager = (setData: React.Dispatch<React.SetStateAction<AppData>>, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => {
    
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

    const updateItem = (key: keyof AppData, id: string | number, updatedFields: any) => {
        setData(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).map((i: any) => i.id === id ? { ...i, ...updatedFields } : i)
        }));
    };

    const deleteItem = (key: keyof AppData, id: string | number) => {
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

    // Infra Projects (SQL)
    const addInfraProject = async (p: any) => {
        const saved = await apiService.addInfraProject(p);
        if(saved) setData(prev => ({ ...prev, infraProjects: [saved, ...prev.infraProjects] }));
        else showToast('Hata.', 'error');
    };
    const updateInfraProject = async (id: string, p: any) => {
        const success = await apiService.updateInfraProject(id, p);
        if(success) setData(prev => ({ ...prev, infraProjects: prev.infraProjects.map(item => item.id === id ? { ...item, ...p } : item) }));
    };
    const deleteInfraProject = async (id: string) => {
        const success = await apiService.deleteInfraProject(id);
        if(success) setData(prev => ({ ...prev, infraProjects: prev.infraProjects.filter(item => item.id !== id) }));
    };

    // Shortcuts (SQL)
    const addShortcut = async (s: any) => {
        const saved = await apiService.addShortcut(s);
        if(saved) setData(prev => ({ ...prev, shortcuts: [saved, ...prev.shortcuts] }));
        else showToast('Hata.', 'error');
    };
    const updateShortcut = async (id: string, s: any) => {
        const success = await apiService.updateShortcut(id, s);
        if(success) setData(prev => ({ ...prev, shortcuts: prev.shortcuts.map(item => item.id === id ? { ...item, ...s } : item) }));
    };
    const deleteShortcut = async (id: string) => {
        const success = await apiService.deleteShortcut(id);
        if(success) setData(prev => ({ ...prev, shortcuts: prev.shortcuts.filter(item => item.id !== id) }));
    };

    // Changelog
    const addChangelog = async (c: any) => {
        const saved = await apiService.addChangelog(c);
        if (saved) {
            setData(prev => ({ ...prev, changelog: [saved, ...prev.changelog] }));
        } else {
            showToast('Changelog eklenemedi.', 'error');
        }
    };
    const updateChangelog = async (id: string, c: any) => {
        const success = await apiService.updateChangelog(id, c);
        if (success) {
            setData(prev => ({ ...prev, changelog: prev.changelog.map(item => item.id === id ? { ...item, ...c } : item) }));
        } else {
            showToast('Güncelleme hatası.', 'error');
        }
    };
    const deleteChangelog = async (id: string) => {
        const success = await apiService.deleteChangelog(id);
        if (success) {
            setData(prev => ({ ...prev, changelog: prev.changelog.filter(item => item.id !== id) }));
        } else {
            showToast('Silme hatası.', 'error');
        }
    };

    // Topo Items (Currently JSON, could be SQL)
    const addTopoItem = (t: any) => addItem('topoItems', t);
    const updateTopoItem = (id: string, t: any) => updateItem('topoItems', id, t);
    const deleteTopoItem = (id: string) => deleteItem('topoItems', id);

    // Map Layers (SQL Connected)
    const addExternalLayer = async (l: any) => { 
        const saved = await apiService.addMapLayer(l);
        if (saved) {
            setData(prev => ({ ...prev, externalLayers: [...prev.externalLayers, saved] }));
        } else showToast('Hata.', 'error');
    };
    const deleteExternalLayer = async (id: string) => {
        const success = await apiService.deleteMapLayer(id);
        if (success) {
            setData(prev => ({ ...prev, externalLayers: prev.externalLayers.filter(l => l.id !== id) }));
        } else showToast('Hata.', 'error');
    };
    const toggleLayerVisibility = async (id: string) => {
        const layer = setData(prev => ({ 
            ...prev, 
            externalLayers: prev.externalLayers.map(l => {
                if (l.id === id) {
                    const newVal = !l.isVisible;
                    apiService.toggleMapLayer(id, newVal); // Fire and forget
                    return { ...l, isVisible: newVal };
                }
                return l;
            }) 
        }));
    };

    // --- DESIGN LAYERS (NEW) ---
    const addDesignLayer = async (l: any) => {
        const saved = await apiService.addDesignLayer(l);
        if (saved) {
            setData(prev => ({ ...prev, designLayers: [...prev.designLayers, saved] }));
        } else showToast('Tasarım katmanı eklenemedi.', 'error');
    };
    const deleteDesignLayer = async (id: string) => {
        const success = await apiService.deleteDesignLayer(id);
        if (success) {
            setData(prev => ({ ...prev, designLayers: prev.designLayers.filter(l => l.id !== id) }));
        } else showToast('Silinemedi.', 'error');
    };

    const addLandXmlFile = (f: any) => { setData(prev => ({ ...prev, landXmlFiles: [...prev.landXmlFiles, { ...f, id: generateId() }] })); };
    const deleteLandXmlFile = (id: string) => deleteItem('landXmlFiles', id);
    
    // Utilities (SQL Connected)
    const addUtilityCategory = async (c: any) => { 
        const saved = await apiService.addUtilityCategory(c);
        if(saved) setData(prev => ({ ...prev, utilityCategories: [...prev.utilityCategories, saved] }));
        else showToast('Hata.', 'error');
    };
    const deleteUtilityCategory = async (id: string) => { 
        const success = await apiService.deleteUtilityCategory(id);
        if(success) setData(prev => ({ ...prev, utilityCategories: prev.utilityCategories.filter(cat => cat.id !== id) }));
        else showToast('Silinemedi.', 'error');
    };
    
    // Photos
    const addSitePhoto = (p: any) => addItem('sitePhotos', p);
    const deleteSitePhoto = (id: string) => deleteItem('sitePhotos', id);

    // Dashboard & Machinery (Machinery is SQL)
    const addMachinery = async (m: any) => {
        const saved = await apiService.addMachinery(m);
        if(saved) setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: [...prev.dashboardWidgets.machinery, saved] } }));
    };
    const deleteMachinery = async (id: string) => {
        const success = await apiService.deleteMachinery(id);
        if(success) setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, machinery: prev.dashboardWidgets.machinery.filter(m => m.id !== id) } }));
    };
    
    // Issues & Notes
    const addSiteIssue = async (i: any) => {
        const tempId = generateId();
        setData(prev => ({ ...prev, siteIssues: [{...i, id: tempId}, ...prev.siteIssues] }));
        
        const saved = await apiService.addSiteIssue(i);
        if(saved) {
            setData(prev => ({ ...prev, siteIssues: prev.siteIssues.map(issue => issue.id === tempId ? saved : issue) }));
            showToast('NCR kaydedildi.');
        } else {
            showToast('Hata! Kaydedilemedi.', 'error');
            setData(prev => ({ ...prev, siteIssues: prev.siteIssues.filter(issue => issue.id !== tempId) }));
        }
    };
    const updateSiteIssue = async (id: string, i: any) => {
        setData(prev => ({ ...prev, siteIssues: prev.siteIssues.map(issue => issue.id === id ? {...issue, ...i} : issue) }));
        const success = await apiService.updateSiteIssue(id, i);
        if(!success) showToast('Güncelleme başarısız.', 'error');
    };
    const deleteSiteIssue = async (id: string) => {
        setData(prev => ({ ...prev, siteIssues: prev.siteIssues.filter(issue => issue.id !== id) }));
        const success = await apiService.deleteSiteIssue(id);
        if(!success) showToast('Silme başarısız.', 'error');
    };

    const addMapNote = (n: any) => addItem('mapNotes', n);
    const deleteMapNote = (id: string) => deleteItem('mapNotes', id);

    // Materials (SQL)
    const addStockItem = async (s: any) => {
        const saved = await apiService.addStock(s);
        if(saved) setData(prev => ({ ...prev, stocks: [...prev.stocks, saved] }));
        else showToast('Hata.', 'error');
    };
    const updateStockItem = async (id: string, s: any) => {
        const success = await apiService.updateStock(id, s);
        if(success) setData(prev => ({ ...prev, stocks: prev.stocks.map(item => item.id === id ? { ...item, ...s } : item) }));
    };
    const deleteStockItem = async (id: string) => {
        const success = await apiService.deleteStock(id);
        if(success) setData(prev => ({ ...prev, stocks: prev.stocks.filter(item => item.id !== id) }));
    };

    // BoQ (SQL)
    const addBoQItem = async (b: any) => {
        const saved = await apiService.addBoQ(b);
        if(saved) setData(prev => ({ ...prev, boqItems: [...prev.boqItems, saved] }));
    };
    const updateBoQItem = async (id: string, b: any) => {
        const success = await apiService.updateBoQ(id, b);
        if(success) setData(prev => ({ ...prev, boqItems: prev.boqItems.map(item => item.id === id ? { ...item, ...b } : item) }));
    };
    const deleteBoQItem = async (id: string) => {
        const success = await apiService.deleteBoQ(id);
        if(success) setData(prev => ({ ...prev, boqItems: prev.boqItems.filter(item => item.id !== id) }));
    };

    // --- MATRIX & PVLA SQL UPDATE ---
    const updateMatrixCell = (rowId: string, colId: string, cell: any) => setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: { ...r.cells[colId], ...cell } } } : r) }));
    
    // Matrix Column - SQL
    const addMatrixColumn = async (type: 'Bridge' | 'Culvert', column: any) => {
        const saved = await apiService.addMatrixColumn(type, column);
        if (saved) {
            setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: [...prev.matrixColumns[type], saved] } }));
        } else showToast('Sütun eklenemedi.', 'error');
    };
    const updateMatrixColumn = async (type: 'Bridge' | 'Culvert', colId: string, updatedCol: any) => {
        const success = await apiService.updateMatrixColumn(colId, updatedCol);
        if(success) {
            setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].map(c => c.id === colId ? { ...c, ...updatedCol } : c) } }));
        } else showToast('Sütun güncellenemedi.', 'error');
    };
    const deleteMatrixColumn = async (type: 'Bridge' | 'Culvert', colId: string) => {
        const success = await apiService.deleteMatrixColumn(colId);
        if(success) {
            setData(prev => ({ ...prev, matrixColumns: { ...prev.matrixColumns, [type]: prev.matrixColumns[type].filter(c => c.id !== colId) } }));
        } else showToast('Sütun silinemedi.', 'error');
    };

    const addMatrixRow = (row: any) => { setData(prev => ({ ...prev, progressMatrix: [...prev.progressMatrix, row] })); };
    const deleteMatrixRow = (rowId: string) => { setData(prev => ({ ...prev, progressMatrix: prev.progressMatrix.filter(r => r.id !== rowId) })); };
    
    const addPVLAFile = (f: any) => { setData(prev => ({ ...prev, pvlaFiles: [{ ...f, id: generateId() }, ...prev.pvlaFiles] })); }; 
    const updatePVLAFile = (id: string, f: any) => updateItem('pvlaFiles', id, f);
    const deletePVLAFile = (id: string) => deleteItem('pvlaFiles', id);
    
    // PVLA Indices - SQL
    const updatePVLAIndex = async (type: 'Bridge'|'Culvert', cfg: any) => {
        const success = await apiService.updatePvlaIndex(type, cfg);
        if(success) {
            setData(prev => ({ ...prev, pvlaIndices: { ...prev.pvlaIndices, [type]: { ...prev.pvlaIndices[type], ...cfg } } }));
        } else showToast('İndeks güncellenemedi.', 'error');
    };

    const addPVLAStructure = (s: any) => addItem('pvlaStructures', s);
    const deletePVLAStructure = (id: string) => deleteItem('pvlaStructures', id);

    // Media & Config (SQL)
    const addSlide = async (s: any) => {
        const saved = await apiService.addSlide(s);
        if(saved) setData(prev => ({ ...prev, slides: [...prev.slides, saved] }));
    };
    const updateSlide = async (id: string, s: any) => {
        const success = await apiService.updateSlide(id, s);
        if(success) setData(prev => ({ ...prev, slides: prev.slides.map(item => item.id === id ? { ...item, ...s } : item) }));
    };
    const deleteSlide = async (id: string) => {
        const success = await apiService.deleteSlide(id);
        if(success) setData(prev => ({ ...prev, slides: prev.slides.filter(item => item.id !== id) }));
    };

    const addDroneFlight = (f: any) => { setData(prev => ({ ...prev, droneFlights: [{ ...f, id: generateId() }, ...prev.droneFlights] })); };
    const updateDroneFlight = (id: string, f: any) => updateItem('droneFlights', id, f);
    const deleteDroneFlight = (id: string) => deleteItem('droneFlights', id);

    const updateMenuLabel = (key: string, l: any) => setData(prev => ({ ...prev, menuConfig: { ...prev.menuConfig, [key]: l } }));
    const updateMenuStructure = async (structure: any) => {
        setData(prev => ({ ...prev, menuStructure: structure }));
        await apiService.saveMenuStructure(structure);
    };
    
    const updateAppSettings = (s: any) => setData(prev => ({ ...prev, settings: { ...prev.settings, ...s } }));
    const updateUserProfile = (p: any) => setData(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...p } }));
    const updateDashboardWidgets = (w: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, ...w } }));
    const updateDailyLog = (l: any) => setData(prev => ({ ...prev, dashboardWidgets: { ...prev.dashboardWidgets, dailyLog: l } }));
    
    // Timeline (SQL)
    const addTimelinePhase = async (p: any) => {
        const saved = await apiService.addTimelinePhase(p);
        if(saved) setData(prev => ({ ...prev, timelinePhases: [...prev.timelinePhases, saved] }));
    };
    const updateTimelinePhase = async (id: number, p: any) => {
        const success = await apiService.updateTimelinePhase(id, p);
        if(success) setData(prev => ({ ...prev, timelinePhases: prev.timelinePhases.map(item => item.id === id ? { ...item, ...p } : item) }));
    };
    const deleteTimelinePhase = async (id: number) => {
        const success = await apiService.deleteTimelinePhase(id);
        if(success) setData(prev => ({ ...prev, timelinePhases: prev.timelinePhases.filter(item => item.id !== id) }));
    };

    return {
        addNotification, updateNotification, deleteNotification,
        addInfraProject, updateInfraProject, deleteInfraProject,
        addShortcut, updateShortcut, deleteShortcut,
        addChangelog, updateChangelog, deleteChangelog,
        addTopoItem, updateTopoItem, deleteTopoItem,
        addExternalLayer, deleteExternalLayer, addLandXmlFile, deleteLandXmlFile, toggleLayerVisibility,
        addDesignLayer, deleteDesignLayer, 
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
        updateMenuLabel, updateMenuStructure, updateAppSettings, updateUserProfile, updateDashboardWidgets, updateDailyLog, 
        updateTimelinePhase, addTimelinePhase, deleteTimelinePhase
    };
};
