
import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { mapUtils } from '../utils/mapUtils';
import { DronOtofotoInfo } from '../views/maps/DronOtofoto';
import { useMapLayers } from '../hooks/useMapLayers';

declare const L: any;

interface MapWidgetProps {
    activeTool: 'none' | 'profile' | 'distance' | 'area' | 'issue' | 'note' | 'utilities';
    setActiveTool: (tool: any) => void;
    onMapClick: (lat: number, lng: number) => void;
    measurePoints: { lat: number, lng: number }[];
    setMeasurePoints: (points: any[]) => void;
    setLiveDistance: (dist: string) => void;
    setLiveArea: (area: string) => void;
    setProfileData?: (data: any) => void;
    onChainageClick?: (km: string) => void; 
    isVisible?: boolean;
    flyToTarget?: { lat: number, lng: number, zoom?: number } | null;
}

export const MapWidget: React.FC<MapWidgetProps> = ({ 
    activeTool, setActiveTool, onMapClick, measurePoints, setMeasurePoints, 
    setLiveDistance, setLiveArea, setProfileData, onChainageClick, isVisible = true,
    flyToTarget 
}) => {
    const { data, selectedPolyId, loadSiteIssues, loadMapData } = useData();
    const { t, showToast } = useUI();
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const layersRef = useRef<Record<string, any>>({});
    const onMapClickRef = useRef(onMapClick);
    const prevActiveToolRef = useRef(activeTool);

    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);
    const [baseMap, setBaseMap] = useState<'schematic' | 'satellite'>('schematic');
    const [isLocating, setIsLocating] = useState(false);
    
    const [visibleLayers, setVisibleLayers] = useState({
        drone: false,
        chainage: true,
        projectLine: true,
        redLine: false, 
        polygons: true,
        issues: true,
        utilities: false,
        alignments: true, 
        notes: true
    });

    const [mapStats, setMapStats] = useState({ zoom: 15, avgElevation: '---' });

    useEffect(() => {
        loadSiteIssues();
        loadMapData(); 
    }, []);

    useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;
        const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([45.6450, 24.2780], 15);
        mapRef.current = map;

        layersRef.current.polygons = L.featureGroup().addTo(map);
        layersRef.current.tools = L.featureGroup().addTo(map);
        layersRef.current.issues = L.featureGroup().addTo(map);
        layersRef.current.notes = L.featureGroup().addTo(map);
        layersRef.current.chainage = L.featureGroup().addTo(map);
        layersRef.current.redLine = L.featureGroup().addTo(map); 
        layersRef.current.utilities = L.featureGroup().addTo(map);
        layersRef.current.alignments = L.featureGroup().addTo(map);
        layersRef.current.userLocation = L.featureGroup().addTo(map);

        map.on('click', (e: any) => onMapClickRef.current(e.latlng.lat, e.latlng.lng));
        map.on('moveend', updateStats);
        
        // Initial update after a slight delay to ensure data might be ready
        setTimeout(updateStats, 1000);

        return () => { map.remove(); mapRef.current = null; };
    }, []);

    // Re-run stats update when polygon data changes
    useEffect(() => {
        if (data.polygonPoints.length > 0) {
            updateStats();
        }
    }, [data.polygonPoints]);
    
    // --- FIX: Force map to re-evaluate its size when it becomes visible ---
    useEffect(() => {
        if (mapRef.current && isVisible) {
            const timer = setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize(true);
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);
    
    // --- FIX: Force map to resize when Utilities panel is toggled ---
    useEffect(() => {
        if ((activeTool === 'utilities' || prevActiveToolRef.current === 'utilities') && mapRef.current) {
             const timer = setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize({ animate: true });
                }
            }, 350); // Match CSS transition duration of sidebar
            return () => clearTimeout(timer);
        }
        prevActiveToolRef.current = activeTool;
    }, [activeTool]);

    const updateStats = () => {
        if (!mapRef.current) return;
        try {
            const zoom = mapRef.current.getZoom();
            const bounds = mapRef.current.getBounds();
            
            let totalElev = 0;
            let count = 0;
            data.polygonPoints.forEach(p => {
                const lat = parseFloat(p.lat || '0');
                const lng = parseFloat(p.lng || '0');
                const elev = parseFloat(p.elevation || '0');
                if (lat !== 0 && lng !== 0 && !isNaN(elev) && bounds.contains([lat, lng])) {
                    totalElev += elev;
                    count++;
                }
            });

            const calculatedAvg = count > 0 ? (totalElev / count).toFixed(2) : null;
            setMapStats(prev => ({ zoom, avgElevation: calculatedAvg || prev.avgElevation }));
        } catch(e) {
            // Can happen if map is not fully initialized, safe to ignore
        }
    };

    // --- FLY TO TARGET EFFECT ---
    useEffect(() => {
        if (flyToTarget && mapRef.current) {
            mapRef.current.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom || 19, {
                animate: true,
                duration: 1.5
            });
        }
    }, [flyToTarget]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (layersRef.current.base) mapRef.current.removeLayer(layersRef.current.base);
        if (baseMap === 'schematic') {
            layersRef.current.base = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(mapRef.current);
        } else {
            layersRef.current.base = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(mapRef.current);
        }
    }, [baseMap]);

    useMapLayers(mapRef, layersRef, visibleLayers, selectedPolyId, activeTool, onChainageClick);

    // --- GEODESIC AREA CALCULATION ---
    const calculateArea = (latLngs: {lat: number, lng: number}[]) => {
        if (latLngs.length < 3) return 0;
        const radius = 6378137;
        let area = 0;
        const len = latLngs.length;
        for (let i = 0; i < len; i++) {
            const p1 = latLngs[i];
            const p2 = latLngs[(i + 1) % len];
            area += ((p2.lng - p1.lng) * Math.PI / 180) * 
                    (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
        }
        return Math.abs(area * radius * radius / 2);
    };

    useEffect(() => {
        if (!layersRef.current.tools) return;
        layersRef.current.tools.clearLayers();
        
        // Draw Points
        measurePoints.forEach(p => L.circleMarker([p.lat, p.lng], { radius: 5, color: '#fff', fillColor: '#3b82f6', fillOpacity: 1 }).addTo(layersRef.current.tools));
        
        if (measurePoints.length > 1) {
            const latlngs = measurePoints.map(p => L.latLng(p.lat, p.lng));
            
            if (activeTool === 'distance' || activeTool === 'profile') {
                L.polyline(latlngs, { color: '#3b82f6', weight: 4, dashArray: '10, 10' }).addTo(layersRef.current.tools);
                
                // Distance Calculation
                let dist = 0;
                for(let i=0; i<latlngs.length-1; i++) dist += latlngs[i].distanceTo(latlngs[i+1]);
                setLiveDistance(dist.toFixed(2));
            } 
            else if (activeTool === 'area') {
                L.polygon(latlngs, { color: '#10b981', weight: 2, fillOpacity: 0.2 }).addTo(layersRef.current.tools);
                
                // Area Calculation
                if (measurePoints.length >= 3) {
                    const area = calculateArea(measurePoints);
                    setLiveArea(area.toFixed(2));
                } else {
                    setLiveArea('');
                }
            }
        } else {
            // Reset if points cleared
            setLiveDistance('');
            setLiveArea('');
        }
    }, [measurePoints, activeTool]);

    // Handle User Location
    const handleLocateUser = () => {
        if (!navigator.geolocation) {
            showToast('Konum servisi desteklenmiyor.', 'error');
            return;
        }
        
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                if(mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 18, { animate: true, duration: 1.5 });
                    
                    if (layersRef.current.userLocation) {
                        layersRef.current.userLocation.clearLayers();
                        L.marker([latitude, longitude], { icon: mapUtils.userLocationIcon })
                            .addTo(layersRef.current.userLocation)
                            .bindPopup(t('mapWidget.userLocation'))
                            .openPopup();
                    }
                }
                setIsLocating(false);
            },
            (err) => {
                console.error(err);
                showToast(t('mapWidget.locationError'), 'error');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="relative w-full h-full bg-iha-900 group">
            <div ref={mapContainerRef} id="topo-map" className="w-full h-full z-0"></div>
            <DronOtofotoInfo isActive={visibleLayers.drone} />
            
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                <button onClick={() => setIsToolsExpanded(!isToolsExpanded)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl border transition-all ${isToolsExpanded ? 'bg-iha-blue text-white border-blue-500' : 'bg-iha-800/90 text-slate-300 border-iha-700 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">{isToolsExpanded ? 'close' : 'widgets'}</span>
                </button>
                {isToolsExpanded && (
                    <div className="bg-iha-800/90 backdrop-blur-md border border-iha-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 animate-in slide-in-from-top-4 duration-200">
                        {[
                            { id: 'profile', icon: 'landscape', label: t('mapWidget.tools.profile') },
                            { id: 'distance', icon: 'straighten', label: t('mapWidget.tools.distance') },
                            { id: 'area', icon: 'square_foot', label: t('mapWidget.tools.area') },
                            { id: 'issue', icon: 'flag', label: t('mapWidget.tools.issue'), color: 'text-red-500' },
                            { id: 'note', icon: 'sticky_note_2', label: t('mapWidget.tools.note'), color: 'text-yellow-500' },
                            { id: 'utilities', icon: 'electrical_services', label: t('mapWidget.tools.utilities'), color: 'text-orange-500' }
                        ].map(toolItem => (
                            <button key={toolItem.id} onClick={() => { setActiveTool(activeTool === toolItem.id ? 'none' : toolItem.id); setMeasurePoints([]); }} className={`p-2.5 rounded-lg transition-all relative group/tool ${activeTool === toolItem.id ? 'bg-iha-blue text-white' : 'text-slate-400 hover:bg-iha-700'}`} title={toolItem.label}>
                                <span className={`material-symbols-outlined text-[22px] ${(toolItem as any).color || ''}`}>{toolItem.icon}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-3">
                <button onClick={() => setShowLayerPanel(!showLayerPanel)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl border transition-all ${showLayerPanel ? 'bg-iha-700 text-white' : 'bg-iha-800/90 text-slate-300 border-iha-700 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">layers</span>
                </button>
                {showLayerPanel && (
                    <div className="bg-[#1e293b]/95 backdrop-blur-xl border border-iha-700 rounded-xl shadow-2xl overflow-hidden w-64 animate-in slide-in-from-right-4 duration-200">
                        <div className="p-4 border-b border-iha-700 bg-iha-900/50"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('mapWidget.baseMap')}</span></div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                            <button onClick={() => setBaseMap('schematic')} className={`py-2 text-[10px] font-bold rounded-lg transition-all border ${baseMap === 'schematic' ? 'bg-blue-600 text-white border-blue-500' : 'bg-iha-900 text-slate-500 border-iha-700 hover:text-white'}`}>{t('mapWidget.schematic')}</button>
                            <button onClick={() => setBaseMap('satellite')} className={`py-2 text-[10px] font-bold rounded-lg transition-all border ${baseMap === 'satellite' ? 'bg-blue-600 text-white border-blue-500' : 'bg-iha-900 text-slate-500 border-iha-700 hover:text-white'}`}>{t('mapWidget.satellite')}</button>
                        </div>
                        <div className="p-4 border-t border-iha-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t('mapWidget.activeLayers')}</span>
                            <div className="space-y-4">
                                {[
                                    { id: 'drone', l: t('mapWidget.drone'), color: 'bg-orange-500' },
                                    { id: 'redLine', l: 'Kırmızı Kot (Tasarım)', color: 'bg-cyan-400' },
                                    { id: 'alignments', l: 'Yol Eksenleri', color: 'bg-amber-500' }, 
                                    { id: 'chainage', l: t('mapWidget.chainage'), color: 'bg-blue-500' },
                                    { id: 'polygons', l: t('mapWidget.polygons'), color: 'bg-emerald-500' },
                                    { id: 'issues', l: 'Kalite / NCR', color: 'bg-red-500' },
                                    { id: 'utilities', l: 'Altyapı (Utilities)', color: 'bg-purple-500' },
                                    { id: 'notes', l: 'Saha Notları', color: 'bg-yellow-500' }
                                ].map(l => (
                                    <label key={l.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={(visibleLayers as any)[l.id]} onChange={() => setVisibleLayers(v => ({...v, [l.id]: !(v as any)[l.id]}))} className="w-4 h-4 rounded border-iha-600 bg-iha-900 text-blue-500" />
                                        <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                                        <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{l.l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Locate Me Button */}
            <div className="absolute bottom-24 right-6 z-[1000]">
                <button 
                    onClick={handleLocateUser}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl border transition-all ${isLocating ? 'bg-white text-blue-600 border-blue-500' : 'bg-iha-800/90 text-slate-300 border-iha-700 hover:text-white hover:bg-iha-700'}`}
                    title={t('mapWidget.userLocation')}
                >
                    <span className={`material-symbols-outlined text-2xl ${isLocating ? 'animate-spin' : ''}`}>
                        {isLocating ? 'my_location' : 'near_me'}
                    </span>
                </button>
            </div>

            <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3">
                <div className="bg-iha-900/90 backdrop-blur-md border border-iha-700 rounded-xl flex items-stretch shadow-2xl overflow-hidden divide-x divide-iha-700">
                    <div className="px-5 py-3 flex flex-col items-center min-w-[80px]"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t('mapWidget.zoom')}</span><span className="text-sm font-mono font-bold text-white">{mapStats.zoom}</span></div>
                    <div className="px-6 py-3 flex flex-col items-center min-w-[140px]"><div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('mapWidget.avgElevation')}</span><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div></div><span className="text-sm font-mono font-bold text-yellow-400">{mapStats.avgElevation !== '---' ? mapStats.avgElevation + ' m' : '---'}</span></div>
                </div>
            </div>
        </div>
    );
};
