
import React from 'react';
/* Import useUI for translations */
import { useUI } from '../../context/UIContext';

export const DRONE_CONFIG = {
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    bounds: [[45.6300, 24.2500], [45.6600, 24.3100]] as [[number, number], [number, number]],
    attribution: 'IHA Drone Team'
};

interface DronOtofotoInfoProps {
    isActive: boolean;
}

export const DronOtofotoInfo: React.FC<DronOtofotoInfoProps> = ({ isActive }) => {
    /* Use UI context for translation function */
    const { t } = useUI();

    if (!isActive) return null;

    return (
        <div className="absolute top-20 right-4 bg-iha-900/80 backdrop-blur border border-iha-700 p-2 rounded-lg z-[999] animate-in fade-in slide-in-from-right-4 pointer-events-none">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[10px] font-bold text-white uppercase">{t('mapWidget.droneActive')}</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1 pl-4">{t('mapWidget.lastFlight')}: 12.12.2024</p>
        </div>
    );
};
