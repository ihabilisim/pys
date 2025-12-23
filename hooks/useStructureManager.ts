
import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';
import { StructureType, StructureMain, StructureTreeItem, StructureGroup, StructureElement, ElementCoordinates, StructureLayer, StructureSurface } from '../types';

export const useStructureManager = (showToast: (msg: string, type?: 'success'|'error'|'info') => void) => {
    const [types, setTypes] = useState<StructureType[]>([]);
    const [structures, setStructures] = useState<StructureTreeItem[]>([]);
    const [layers, setLayers] = useState<StructureLayer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // useCallback ensures these don't change on every render, allowing them to be dependencies in useEffects
    const loadTypes = useCallback(async () => {
        const res = await apiService.fetchStructureTypes();
        setTypes(res);
    }, []);

    const loadStructures = useCallback(async () => {
        setIsLoading(true);
        const res = await apiService.fetchStructuresFull();
        setStructures(res);
        setIsLoading(false);
    }, []);

    const loadLayers = useCallback(async () => {
        const res = await apiService.fetchStructureLayers();
        setLayers(res);
    }, []);

    const addStructureType = async (type: Omit<StructureType, 'id'>) => {
        const saved = await apiService.addStructureType(type);
        if (saved) {
            setTypes(prev => [...prev, saved]);
            showToast('Yapı türü eklendi.');
        } else {
            showToast('Hata oluştu.', 'error');
        }
    };

    const updateStructureType = async (id: string, type: Partial<StructureType>) => {
        const success = await apiService.updateStructureType(id, type);
        if (success) {
            setTypes(prev => prev.map(t => {
                if (t.id !== id) return t;
                const updatedName = type.name ? { ...t.name, ...type.name } : t.name;
                return { ...t, ...type, name: updatedName };
            }));
            showToast('Yapı türü güncellendi.');
        } else {
            showToast('Güncelleme hatası.', 'error');
        }
    };

    const deleteStructureType = async (id: string) => {
        const isInUse = structures.some(s => s.typeId === id);
        if (isInUse) {
            showToast('Bu türe bağlı yapılar var! Önce yapıları siliniz.', 'error');
            return;
        }
        const success = await apiService.deleteStructureType(id);
        if (success) {
            setTypes(prev => prev.filter(t => t.id !== id));
            showToast('Yapı türü silindi.', 'info');
        } else {
            showToast('Silinemedi.', 'error');
        }
    };

    const addStructure = async (struct: Omit<StructureMain, 'id'>) => {
        const id = await apiService.addStructure(struct);
        if(id) {
            showToast('Yapı eklendi.');
            await loadStructures(); 
        } else {
            showToast('Kayıt hatası.', 'error');
        }
    };

    const deleteStructure = async (id: string) => {
        await apiService.deleteStructure(id);
        showToast('Yapı silindi.', 'info');
        await loadStructures();
    };

    // --- GROUP METHODS ---
    const addGroup = async (group: any) => {
        const id = await apiService.addGroup(group);
        if(id) {
            showToast('Grup eklendi.');
            await loadStructures();
        } else { showToast('Hata.', 'error'); }
    };

    const updateGroup = async (id: string, group: Partial<StructureGroup>) => {
        const success = await apiService.updateGroup(id, group);
        if (success) {
            showToast('Grup güncellendi.');
            await loadStructures();
        } else showToast('Hata.', 'error');
    };

    const deleteGroup = async (id: string) => {
        if(window.confirm("Bu grubu ve altındaki tüm elemanları silmek istediğinize emin misiniz?")) {
            const success = await apiService.deleteGroup(id);
            if(success) { showToast('Grup silindi.'); await loadStructures(); }
            else showToast('Silme hatası.', 'error');
        }
    };

    // --- ELEMENT METHODS ---
    const addElement = async (elem: any, coords: any) => {
        const id = await apiService.addElement(elem, coords);
        if(id) {
            showToast('Eleman ve koordinat kaydedildi.');
            await loadStructures();
        } else { showToast('Hata.', 'error'); }
    };

    const updateElement = async (id: string, elem: Partial<StructureElement>, coords?: Partial<ElementCoordinates>) => {
        const success = await apiService.updateElement(id, elem, coords);
        if (success) {
            showToast('Eleman güncellendi.');
            await loadStructures();
        } else showToast('Hata.', 'error');
    };

    const deleteElement = async (id: string) => {
        if(window.confirm("Elemanı silmek istediğinize emin misiniz?")) {
            const success = await apiService.deleteElement(id);
            if(success) { showToast('Eleman silindi.'); await loadStructures(); }
            else showToast('Silme hatası.', 'error');
        }
    };

    // --- BULK PASTE OPTIMIZED ---
    const addBulkElements = async (groupId: string, rawText: string) => {
        const rows = rawText.trim().split('\n');
        let successCount = 0;
        const promises = rows.map(async (row) => {
            if(!row.trim()) return;
            const cols = row.split('\t');
            if (cols.length >= 4) {
                const name = cols[0].trim();
                const x = parseFloat(cols[1].replace(',', '.'));
                const y = parseFloat(cols[2].replace(',', '.'));
                const z = parseFloat(cols[3].replace(',', '.'));
                const d1 = parseFloat(cols[4]?.replace(',', '.') || '0.8');
                const d2 = parseFloat(cols[5]?.replace(',', '.') || '10');
                const d3 = parseFloat(cols[6]?.replace(',', '.') || '0');
                if (isNaN(x) || isNaN(y) || isNaN(z)) return;
                const shape = d3 > 0 ? 'BOX' : 'CYLINDER';
                const id = await apiService.addElement({ groupId, name, elementClass: 'PILE' }, { shape, coords: { x, y, z }, dimensions: { d1, d2, d3 }, rotation: { x: 0, y: 0, z: 0 } });
                if (id) successCount++;
            }
        });
        await Promise.all(promises);
        if(successCount > 0) { showToast(`${successCount} eleman eklendi.`, 'success'); await loadStructures(); }
    };

    // --- NEW: EARTHWORKS LAYERS & SURFACES ---
    const addLayer = async (layer: Omit<StructureLayer, 'id'>) => {
        const saved = await apiService.addStructureLayer(layer);
        if (saved) {
            setLayers(prev => [...prev, saved]);
            showToast('Katman eklendi.');
        } else showToast('Hata.', 'error');
    };

    const deleteLayer = async (id: string) => {
        const success = await apiService.deleteStructureLayer(id);
        if (success) {
            setLayers(prev => prev.filter(l => l.id !== id));
            showToast('Katman silindi.', 'info');
        } else showToast('Hata.', 'error');
    };

    const addSurface = async (surface: Omit<StructureSurface, 'id'|'updatedAt'>) => {
        const saved = await apiService.addStructureSurface(surface);
        if (saved) {
            showToast('Yüzey kaydedildi.');
            await loadStructures(); // Refresh to see updated surfaces
        } else showToast('Kayıt hatası.', 'error');
    };

    const deleteSurface = async (id: string) => {
        const success = await apiService.deleteStructureSurface(id);
        if (success) {
            showToast('Yüzey silindi.', 'info');
            await loadStructures();
        } else showToast('Hata.', 'error');
    };

    return {
        types,
        structures,
        layers,
        isLoading,
        loadTypes,
        loadStructures,
        loadLayers,
        addStructureType,
        updateStructureType,
        deleteStructureType,
        addStructure,
        deleteStructure,
        addGroup,
        updateGroup,
        deleteGroup,
        addElement,
        updateElement,
        deleteElement,
        addBulkElements,
        addLayer,
        deleteLayer,
        addSurface,
        deleteSurface
    };
};
