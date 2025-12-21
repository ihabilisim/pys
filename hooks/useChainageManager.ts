
import React from 'react';
import { ChainageMarker } from '../types';
import { apiService } from '../services/api';

export const useChainageManager = (
    setData: React.Dispatch<React.SetStateAction<any>>,
    showToast: (msg: string, type?: 'success'|'error'|'info') => void
) => {
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addChainageMarker = (marker: Omit<ChainageMarker, 'id'>) => {
        setData((prev: any) => ({ 
            ...prev, 
            chainageMarkers: [...prev.chainageMarkers, { ...marker, id: generateId() }] 
        }));
    };

    const updateChainageMarker = (id: string, marker: Partial<ChainageMarker>) => {
        setData((prev: any) => ({ 
            ...prev, 
            chainageMarkers: prev.chainageMarkers.map((m: any) => m.id === id ? { ...m, ...marker } : m) 
        }));
    };

    const deleteChainageMarker = (id: string) => {
        setData((prev: any) => ({ 
            ...prev, 
            chainageMarkers: prev.chainageMarkers.filter((m: any) => m.id !== id) 
        }));
    };
    
    const addBulkChainageMarkers = async (markers: Omit<ChainageMarker, 'id'>[]) => {
        const tempMarkers = markers.map(m => ({ ...m, id: generateId() }));
        setData((prev: any) => ({ 
            ...prev, 
            chainageMarkers: [...prev.chainageMarkers, ...tempMarkers] 
        }));
        showToast(`${markers.length} KM Taşı eklendi, kaydediliyor...`, 'info');
        
        const success = await apiService.bulkInsertChainage(markers);
        if (success) {
            showToast("KM taşları kaydedildi.");
        } else {
            showToast("Kayıt hatası!", 'error');
        }
    };

    return {
        addChainageMarker,
        updateChainageMarker,
        deleteChainageMarker,
        addBulkChainageMarkers
    };
};