
import React from 'react';
import { PolygonPoint } from '../types';
import { apiService } from '../services/api';

export const usePolygonManager = (
    data: any, 
    setData: React.Dispatch<React.SetStateAction<any>>, 
    reloadPolygons: () => Promise<void>,
    showToast: (msg: string, type?: 'success'|'error'|'info') => void
) => {
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // New: Load all polygons for Site View Map
    const loadAllPolygons = async () => {
        const points = await apiService.getAllPolygons();
        setData((prev: any) => ({ ...prev, polygonPoints: points }));
    };

    const addPolygonPoint = async (point: Omit<PolygonPoint, 'id'>) => {
        const tempId = generateId();
        const newPoint = { ...point, id: tempId };
        
        setData((prev: any) => ({ ...prev, polygonPoints: [...prev.polygonPoints, newPoint] }));
        
        const savedPoint = await apiService.upsertPolygon(point);
        if (savedPoint) {
            setData((prev: any) => ({
                ...prev,
                polygonPoints: prev.polygonPoints.map((p: any) => p.id === tempId ? savedPoint : p)
            }));
        } else {
            showToast("Kayıt başarısız oldu", 'error');
            setData((prev: any) => ({ ...prev, polygonPoints: prev.polygonPoints.filter((p: any) => p.id !== tempId) }));
        }
    };

    const updatePolygonPoint = async (id: string, point: Partial<PolygonPoint>) => {
        const oldPoint = data.polygonPoints.find((p: any) => p.id === id);
        
        setData((prev: any) => ({ ...prev, polygonPoints: prev.polygonPoints.map((p: any) => p.id === id ? { ...p, ...point } : p) }));

        const fullPoint = { ...oldPoint, ...point };
        const saved = await apiService.upsertPolygon(fullPoint);
        if (!saved) {
            showToast("Güncelleme başarısız", 'error');
            if(oldPoint) setData((prev: any) => ({ ...prev, polygonPoints: prev.polygonPoints.map((p: any) => p.id === id ? oldPoint : p) }));
        }
    };

    const deletePolygonPoint = async (id: string): Promise<boolean> => {
        const oldList = data.polygonPoints;
        // Optimistic delete from global state
        setData((prev: any) => ({ ...prev, polygonPoints: prev.polygonPoints.filter((p: any) => p.id !== id) }));

        const success = await apiService.deletePolygon(id);
        if (!success) {
            showToast("Silme başarısız! Veritabanında hata.", 'error');
            // Revert global state
            setData((prev: any) => ({ ...prev, polygonPoints: oldList }));
            return false;
        }
        return true;
    };

    const addBulkPolygonPoints = async (points: Omit<PolygonPoint, 'id'>[]) => {
        const tempPoints = points.map(p => ({ ...p, id: generateId() }));
        setData((prev: any) => ({ ...prev, polygonPoints: [...prev.polygonPoints, ...tempPoints] }));
        showToast(`${points.length} nokta kuyruğa eklendi, kaydediliyor...`, 'info');

        const success = await apiService.bulkInsertPolygons(points);
        if (success) {
            showToast("Tüm noktalar veritabanına kaydedildi.");
            await reloadPolygons(); // This reloads full data, effectively updating polygons list
        } else {
            showToast("Toplu yükleme hatası!", 'error');
            // We might want to remove them if failed, but usually we just reload to sync with DB
            await reloadPolygons(); 
        }
    };

    return {
        loadAllPolygons,
        addPolygonPoint,
        updatePolygonPoint,
        deletePolygonPoint,
        addBulkPolygonPoints
    };
};