
import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { StructureType, StructureMain, StructureTreeItem } from '../types';

export const useStructureManager = (showToast: (msg: string, type?: 'success'|'error'|'info') => void) => {
    const [types, setTypes] = useState<StructureType[]>([]);
    const [structures, setStructures] = useState<StructureTreeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
            setTypes(prev => prev.map(t => t.id === id ? { ...t, ...type, name: { ...t.name, ...type.name } } : t));
            showToast('Yapı türü güncellendi.');
        } else {
            showToast('Güncelleme hatası.', 'error');
        }
    };

    const deleteStructureType = async (id: string) => {
        // Optimistic check: Ensure no local structures actully use this type to give fast feedback
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
            // Fallback for server-side constraint
            showToast('Silinemedi. Bu türe bağlı kayıtlar olabilir.', 'error');
        }
    };

    const addStructure = async (struct: Omit<StructureMain, 'id'>) => {
        const id = await apiService.addStructure(struct);
        if(id) {
            showToast('Yapı eklendi.');
            await loadStructures(); // Reload tree
        } else {
            showToast('Kayıt hatası.', 'error');
        }
    };

    const addGroup = async (group: any) => {
        const id = await apiService.addGroup(group);
        if(id) {
            showToast('Grup eklendi.');
            await loadStructures();
        } else { showToast('Hata.', 'error'); }
    };

    const addElement = async (elem: any, coords: any) => {
        const id = await apiService.addElement(elem, coords);
        if(id) {
            showToast('Eleman ve koordinat kaydedildi.');
            await loadStructures();
        } else { showToast('Hata.', 'error'); }
    };

    const deleteStructure = async (id: string) => {
        await apiService.deleteStructure(id);
        showToast('Yapı silindi.', 'info');
        await loadStructures();
    };

    return {
        types,
        structures,
        isLoading,
        loadTypes,
        loadStructures,
        addStructureType,
        updateStructureType,
        deleteStructureType,
        addStructure,
        addGroup,
        addElement,
        deleteStructure
    };
};
