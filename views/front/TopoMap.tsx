
import React, { useState, useEffect, useMemo } from 'react';
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
    const { setSelectedPolyId, data, loadAllPolygons, struct } = useData();
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
    
    // NEW: Centralized map fly-to state
    const [flyToTarget, setFlyToTarget] = useState<{lat: number, lng: number, zoom?: number} | null>(null);

    useEffect(() => {
        if (isActive) {
            loadAllPolygons();
            struct.loadTypes();
            struct.loadStructures();
            struct.loadLayers();
        }
    }, [isActive]);

    const combinedRedLineGeoJSON = useMemo(() => {
        const redKeywords = ['kırmızı', 'design', 'red', 'tasarım'];
        const redLineLayer = struct.layers.find(l => redKeywords.some(k => l.name.tr.toLowerCase().includes(k)));
        if (!redLineLayer) return null;
        const features: any[] = [];
        struct.structures.forEach(s => {
            const surfaces = s.surfaces?.filter(surf => surf.layerId === redLineLayer.id);
            surfaces?.forEach(surf => {
                if (surf.geojson) {
                    const g = typeof surf.geojson === 'string' ? JSON.parse(surf.geojson) : surf.geojson;
                    if (g.features) features.push(...g.features); else features.push(g);
                }
            });
        });
        return features.length > 0 ? { type: 'FeatureCollection', features } : null;
    }, [struct.structures, struct.layers]);

    const handleMapClick = (lat: number, lng: number) => {
        if (activeTool === 'distance' || activeTool === 'area') setMeasurePoints(prev => [...prev, { lat, lng }]);
        else if (activeTool === 'profile') {
            let newPoints = measurePoints.length >= 2 ? [{ lat, lng }] : [...measurePoints, { lat, lng }];
            setMeasurePoints(newPoints);
            if (newPoints.length === 2) setProfileData(generateDetailedProfile(newPoints[0], newPoints[1], combinedRedLineGeoJSON));
            else setProfileData(null);
        } else if (activeTool === 'issue') { setClickedCoords({ lat, lng }); setIssueModalOpen(true); setActiveTool('none'); }
        else if (activeTool === 'note') { setClickedCoords({ lat, lng }); setNoteModalOpen(true); setActiveTool('none'); }
    };

    // Triggered when clicking a polygon in the list
    const handleFlyToPoly = (point: PolygonPoint) => { 
        setSelectedPolyId(point.id); 
        if(point.lat && point.lng) {
            setFlyToTarget({ lat: parseFloat(point.lat), lng: parseFloat(point.lng), zoom: 19 });
        }
    };

    // Triggered when clicking a KM row
    const handleKmRowClick = (m: ChainageMarker) => {
        setFlyToTarget({ lat: m.lat, lng: m.lng, zoom: 18 });
    };

    return (
        <div className="flex flex-col h-full w-full bg-iha-900">
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
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 relative flex overflow-hidden">
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
                            onChainageClick={(km) => setSelectedMarker(data.chainageMarkers.find(m => m.km === km)||null)} 
                            isVisible={isActive}
                            flyToTarget={flyToTarget} 
                        />

                        {/* --- RESTORED TOOLS OVERLAY --- */}
                        {activeTool === 'distance' && (
                            <DistanceTool distance={liveDistance} pointsCount={measurePoints.length} />
                        )}
                        {activeTool === 'area' && (
                            <AreaVolumeTool area={liveArea} pointsCount={measurePoints.length} />
                        )}
                    </div>
                    
                    {activeTool === 'utilities' && <div className="w-80 h-full bg-iha-900 border-l border-iha-700 z-[500] shadow-2xl flex-shrink-0"><UtilitiesManager /></div>}
                    
                    {/* CENTERED PROFILE MODAL */}
                    {activeTool === 'profile' && profileData && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5000] w-[92%] max-w-6xl h-[500px] animate-in zoom-in-95 duration-300 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl">
                            <div className="absolute -top-4 -right-4 z-50">
                                <button onClick={() => {setActiveTool('none'); setProfileData(null);}} className="bg-red-600 text-white p-3 rounded-full shadow-2xl hover:bg-red-500 transition-all border-4 border-iha-900"><span className="material-symbols-outlined font-bold">close</span></button>
                            </div>
                            <SectionsTool data={profileData} pointsCount={measurePoints.length} />
                        </div>
                    )}
                </div>

                {/* SPLIT VIEW (60/40) */}
                <div className="h-[35%] min-h-[300px] max-h-[500px] bg-iha-900 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex-shrink-0 flex divide-x divide-iha-700 border-t border-iha-700">
                    <div className="w-[65%] flex flex-col bg-iha-800">
                        <PoligonList onFlyTo={handleFlyToPoly} />
                    </div>
                    <div className="w-[35%] flex flex-col bg-iha-900 overflow-hidden">
                        <div className="p-4 bg-iha-900 border-b border-iha-700 flex justify-between items-center">
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500 text-sm">add_road</span> KM TAŞLARI LİSTESİ
                            </h3>
                            <span className="text-[10px] text-slate-500 bg-iha-800 px-2 py-0.5 rounded border border-iha-700">{data.chainageMarkers.length} Kayıt</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-xs text-slate-400">
                                <thead className="bg-iha-950/50 sticky top-0 font-bold uppercase text-[9px]">
                                    <tr><th className="p-3">Kilometre</th><th className="p-3">Koordinat</th><th className="p-3 text-right">İşlem</th></tr>
                                </thead>
                                <tbody className="divide-y divide-iha-700/50">
                                    {data.chainageMarkers.map(m => (
                                        <tr key={m.id} onClick={() => handleKmRowClick(m)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                            <td className="p-3 font-mono font-bold text-blue-400">{m.km}</td>
                                            <td className="p-3 font-mono text-[10px]">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</td>
                                            <td className="p-3 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedMarker(m); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-all"><span className="material-symbols-outlined text-xs">visibility</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <NCRModal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <KmChainageModal selectedMarker={selectedMarker} onClose={() => setSelectedMarker(null)} />
        </div>
    );
};
