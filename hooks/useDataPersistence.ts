
import { useState, useEffect, useRef } from 'react';
import { AppData, User } from '../types';
import { apiService } from '../services/api';
import { INITIAL_DATA } from '../data/InitialData';

export const useDataPersistence = (setUsers: (users: User[]) => void) => {
    const [data, setData] = useState<AppData>(INITIAL_DATA);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<any>(null);

    // --- LOAD DATA ---
    const loadFullData = async () => {
        const res = await apiService.fetchData(INITIAL_DATA);
        setData(res);
        setUsers(res.users);
        setIsLoaded(true);
    };

    useEffect(() => {
        loadFullData();
    }, []);

    // --- DEBOUNCED SAVE (Config & JSONs) ---
    // Watches specific heavy objects to trigger auto-save
    useEffect(() => {
        if (!isLoaded) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            await apiService.saveData(data);
            setIsSaving(false);
        }, 2000);
    }, [
        data.settings, 
        data.menuConfig,
        data.menuStructure,
        data.dashboardWidgets, 
        data.timelinePhases, 
        data.stocks, 
        data.boqItems, 
        data.infraProjects, 
        data.shortcuts, 
        data.slides, 
        data.droneFlights, 
        data.landXmlFiles, 
        data.chainageMarkers,
        data.changelog, // EKLENDİ: Artık değişiklik günlüğündeki değişimler de kaydı tetikleyecek.
        isLoaded
    ]);

    const reloadPolygons = async () => {
        const res = await apiService.fetchData(INITIAL_DATA);
        setData(prev => ({ ...prev, polygonPoints: res.polygonPoints }));
    };

    return { data, setData, isLoaded, isSaving, reloadPolygons };
};
