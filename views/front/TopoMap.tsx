
import React, { useState, useEffect } from 'react';
import { MapWidget } from '../../components/MapWidget';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { PolygonPoint, ChainageMarker } from '../../types';
import { PoligonList } from '../maps/PoligonList';
import { UtilitiesManager } from '../maps/Utilities';
import { SectionsTool, generateDetailedProfile } from '../maps/Sections';
import { DistanceTool } from '../maps/Distance';
import { AreaVolumeTool } from '../maps/AreaVolume';
import { NCRModal } from '../maps/ncr';
import { NoteModal } from '../maps/notes';
import { KmChainageModal } from '../maps/KmChainage';
import { ProfilePoint } from '../../components/Analytics';

interface TopoMapProps {
    isActive: boolean;
}

export const TopoMap: React.FC<TopoMapProps> = ({ isActive }) => {
    const { setSelectedPolyId, data, loadAllPolygons } = useData();
    const { t } = useUI();

    type ToolType = 'none' | 'profile' | 'distance' | 'area' | 'issue' | 'note' | 'utilities';
    const [activeTool, setActiveTool] = useState<ToolType>('none');
    const [measurePoints, setMeasurePoints] = useState<{lat: number, lng: number}[]>([]);
    const [profileData, setProfileData] = useState<{points: ProfilePoint[], totalDist: number} | null>(null);
    const [liveDistance, setLiveDistance] = useState<string>('');
    const [liveArea, setLiveArea] = useState<string>('');
    const [issueModalOpen, setIssueModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<ChainageMarker | null>(null);
    const [clickedCoords, setClickedCoords] = useState<{lat: number, lng: number} | null>(null);

    // Robust Data Loading: Load when component mounts OR when it becomes active if empty
    useEffect(() => {
        if (isActive && data.polygonPoints.length === 0) {
            loadAllPolygons();
        }
    }, [isActive]);

    // Force map tools reset when leaving tab
    useEffect(() => {
        if (!isActive) {
            setActiveTool('none');
            setMeasurePoints([]);
        }
    }, [isActive]);

    const handleMapClick = (lat: number, lng: number) => {
        if (activeTool === 'distance' || activeTool === 'area') {
            setMeasurePoints(prev => [...prev, { lat, lng }]);
        } else if (activeTool === 'profile') {
            let newPoints = measurePoints.length >= 2 ? [{ lat, lng }] : [...measurePoints, { lat, lng }];
            setMeasurePoints(newPoints);
            if (newPoints.length === 2) setProfileData(generateDetailedProfile(newPoints[0], newPoints[1]));
        } else if (activeTool === 'issue') {
            setClickedCoords({ lat, lng });
            setIssueModalOpen(true);
            setActiveTool('none'); 
        } else if (activeTool === 'note') {
            setClickedCoords({ lat, lng });
            setNoteModalOpen(true);
            setActiveTool('none');
        }
    };

    const handleFlyToPoly = (point: PolygonPoint) => {
        setSelectedPolyId(point.id);
    };

    const handleChainageClick = (km: string) => {
        const marker = data.chainageMarkers.find(m => m.km === km);
        if (marker) {
            setSelectedMarker(marker);
        } else {
            setSelectedMarker({ id: 'temp', km, lat: 0, lng: 0, align: 'center', type: 'MAIN', roadName: 'Unknown' });
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-iha-900">
            
            {/* 1. TOP HEADER BAR */}
            <div className="h-14 bg-iha-800 border-b border-iha-700 flex items-center justify-between px-6 shadow-md z-20 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                        <span className="material-symbols-outlined text-lg">landscape</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">{t('topo.title')}</h2>
                        <p className="text-[10px] text-slate-400">Harita & Veri Yönetimi</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 bg-iha-900 px-3 py-1.5 rounded border border-iha-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>Canlı Koordinat Akışı</span>
                    </div>
                    <button className="flex items-center gap-2 bg-iha-900 hover:bg-iha-700 border border-iha-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export (KML/CSV)
                    </button>
                </div>
            </div>

            {/* 2. SPLIT CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* A. MAP AREA (Flex-Grow) */}
                <div className="flex-1 relative flex overflow-hidden">
                    {/* Map Widget Wrapper */}
                    <div className={`flex-1 relative transition-all duration-300 h-full ${activeTool === 'utilities' ? 'mr-80' : ''}`}>
                        <MapWidget 
                            activeTool={activeTool} 
                            setActiveTool={setActiveTool}
                            onMapClick={handleMapClick} 
                            measurePoints={measurePoints} 
                            setMeasurePoints={setMeasurePoints}
                            setLiveDistance={setLiveDistance}
                            setLiveArea={setLiveArea}
                            setProfileData={setProfileData}
                            onChainageClick={handleChainageClick}
                            // Pass visibility status to force resize calculation
                            isVisible={isActive} 
                        />

                        {/* Map Tools Overlays */}
                        {(activeTool === 'issue') && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-red-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                                {t('mapTools.issue.instruction')}
                            </div>
                        )}
                        {(activeTool === 'note') && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-yellow-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                                {t('mapTools.note.instruction')}
                            </div>
                        )}
                        {(activeTool === 'profile' && measurePoints.length < 2) && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-blue-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                                {t('mapTools.profile.instruction')}
                            </div>
                        )}

                        {activeTool === 'distance' && <DistanceTool distance={liveDistance} pointsCount={measurePoints.length} />}
                        {activeTool === 'area' && <AreaVolumeTool area={liveArea} pointsCount={measurePoints.length} />}
                    </div>

                    {/* Right Utility Panel */}
                    {activeTool === 'utilities' && (
                        <div className="w-80 h-full bg-iha-900 border-l border-iha-700 relative z-[500] shadow-2xl flex-shrink-0">
                            <UtilitiesManager />
                        </div>
                    )}

                    {/* Bottom Profile Chart Overlay */}
                    {activeTool === 'profile' && (
                        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-t from-iha-900 to-transparent">
                            <SectionsTool data={profileData} pointsCount={measurePoints.length} />
                        </div>
                    )}
                </div>

                {/* B. DATA GRID AREA (Fixed Height Bottom Panel) */}
                <div className="h-[35%] min-h-[300px] max-h-[500px] bg-iha-800 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex-shrink-0">
                    <PoligonList onFlyTo={handleFlyToPoly} />
                </div>

            </div>

            {/* Modals */}
            <NCRModal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <KmChainageModal selectedMarker={selectedMarker} onClose={() => setSelectedMarker(null)} />
        </div>
    );
};
