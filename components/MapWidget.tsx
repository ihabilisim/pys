
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
}

export const MapWidget: React.FC<MapWidgetProps> = ({ 
    activeTool, setActiveTool, onMapClick, measurePoints, setMeasurePoints, 
    setLiveDistance, setLiveArea, setProfileData, onChainageClick 
}) => {
    const { data, selectedPolyId } = useData();
    const { t } = useUI();
    
    const mapRef = useRef<any>(null);
    const layersRef = useRef<Record<string, any>>({});
    const onMapClickRef = useRef(onMapClick);

    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);
    const [baseMap, setBaseMap] = useState<'schematic' | 'satellite'>('schematic');
    
    const [visibleLayers, setVisibleLayers] = useState({
        drone: false,
        chainage: true,
        projectLine: true,
        polygons: true,
        issues: true,
        utilities: false,
        notes: true,
        cutFill: false 
    });

    const [mapStats, setMapStats] = useState({ zoom: 15, avgElevation: '405.37' });
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

    const updateStats = () => {
        if (!mapRef.current) return;
        const zoom = mapRef.current.getZoom();
        const bounds = mapRef.current.getBounds();
        const visible = data.polygonPoints.filter(p => {
            const lat = parseFloat(p.lat || '0');
            const lng = parseFloat(p.lng || '0');
            return bounds.contains([lat, lng]);
        });
        let avg = 0;
        if (visible.length > 0) {
            avg = visible.reduce((sum, p) => sum + parseFloat(p.elevation || '0'), 0) / visible.length;
        }
        setMapStats({ zoom, avgElevation: visible.length > 0 ? avg.toFixed(2) : '---' });
    };

    // Initialize Map
    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map('topo-map', { zoomControl: false, attributionControl: false }).setView([45.6450, 24.2780], 15);
        mapRef.current = map;

        layersRef.current.polygons = L.featureGroup().addTo(map);
        layersRef.current.cutFill = L.featureGroup().addTo(map); 
        layersRef.current.tools = L.featureGroup().addTo(map);
        layersRef.current.issues = L.featureGroup().addTo(map);
        layersRef.current.notes = L.featureGroup().addTo(map);
        layersRef.current.chainage = L.featureGroup().addTo(map);
        layersRef.current.projectLine = L.featureGroup().addTo(map);
        layersRef.current.utilities = L.featureGroup().addTo(map);
        layersRef.current.userLocation = L.featureGroup().addTo(map);

        map.on('click', (e: any) => onMapClickRef.current(e.latlng.lat, e.latlng.lng));
        map.on('moveend', updateStats);
        
        map.on('locationfound', (e: any) => {
            setIsLocating(false);
            layersRef.current.userLocation.clearLayers();
            L.marker(e.latlng, { icon: mapUtils.userLocationIcon })
             .bindPopup(t('mapWidget.userLocation'))
             .addTo(layersRef.current.userLocation);
            L.circle(e.latlng, { radius: e.accuracy / 2, color: '#3b82f6', fillOpacity: 0.1, weight: 1 })
             .addTo(layersRef.current.userLocation);
        });

        map.on('locationerror', (e: any) => {
            setIsLocating(false);
            alert("Konum bulunamadı: " + e.message);
        });
        
        updateStats();
        return () => { map.remove(); mapRef.current = null; };
    }, []);

    // Base Layer Logic
    useEffect(() => {
        if (!mapRef.current) return;
        if (layersRef.current.base) mapRef.current.removeLayer(layersRef.current.base);
        if (baseMap === 'schematic') {
            layersRef.current.base = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(mapRef.current);
        } else {
            layersRef.current.base = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(mapRef.current);
        }
    }, [baseMap]);

    // Use Custom Hook for Layers
    useMapLayers(mapRef, layersRef, visibleLayers, selectedPolyId, activeTool, onChainageClick);

    // Tools Drawing Logic
    useEffect(() => {
        if (!layersRef.current.tools) return;
        layersRef.current.tools.clearLayers();
        measurePoints.forEach(p => L.circleMarker([p.lat, p.lng], { radius: 5, color: '#fff', fillColor: '#3b82f6', fillOpacity: 1 }).addTo(layersRef.current.tools));
        if (measurePoints.length > 1) {
            const latlngs = measurePoints.map(p => L.latLng(p.lat, p.lng));
            if (activeTool === 'distance' || activeTool === 'profile') {
                L.polyline(latlngs, { color: '#3b82f6', weight: 4, dashArray: '10, 10' }).addTo(layersRef.current.tools);
                let dist = 0;
                for(let i=0; i<latlngs.length-1; i++) dist += latlngs[i].distanceTo(latlngs[i+1]);
                setLiveDistance(dist.toFixed(2));
            } else if (activeTool === 'area') {
                L.polygon(latlngs, { color: '#10b981', weight: 2, fillOpacity: 0.2 }).addTo(layersRef.current.tools);
                if (measurePoints.length > 2) setLiveArea("Simulated " + (1250 * measurePoints.length));
            }
        }
    }, [measurePoints, activeTool]);

    return (
        <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-iha-700 shadow-2xl bg-iha-900 group">
            <div id="topo-map" className="w-full h-full z-0"></div>

            <DronOtofotoInfo isActive={visibleLayers.drone} />

            {/* Top Left Toolbar */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                <button onClick={() => setIsToolsExpanded(!isToolsExpanded)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl border transition-all ${isToolsExpanded ? 'bg-iha-blue text-white border-blue-500' : 'bg-iha-800/90 text-slate-300 border-iha-700 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">{isToolsExpanded ? 'close' : 'widgets'}</span>
                </button>
                {isToolsExpanded && (
                    <div className="bg-iha-800/90 backdrop-blur-md border border-iha-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 animate-in slide-in-from-top-4 duration-200">
                        {[
                            { id: 'profile', icon: 'landscape', label: t('mapWidget.tools.profile'), color: 'text-slate-300' },
                            { id: 'distance', icon: 'straighten', label: t('mapWidget.tools.distance'), color: 'text-slate-300' },
                            { id: 'area', icon: 'square_foot', label: t('mapWidget.tools.area'), color: 'text-slate-300' },
                            { id: 'issue', icon: 'flag', label: t('mapWidget.tools.issue'), color: 'text-red-500' },
                            { id: 'note', icon: 'sticky_note_2', label: t('mapWidget.tools.note'), color: 'text-yellow-500' },
                            { id: 'utilities', icon: 'electrical_services', label: t('mapWidget.tools.utilities'), color: 'text-orange-500' }
                        ].map(toolItem => (
                            <button key={toolItem.id} onClick={() => { setActiveTool(activeTool === toolItem.id ? 'none' : toolItem.id); setMeasurePoints([]); }} className={`p-2.5 rounded-lg transition-all relative group/tool ${activeTool === toolItem.id ? 'bg-iha-blue text-white shadow-lg' : 'text-slate-400 hover:bg-iha-700 hover:text-white'}`} title={toolItem.label}>
                                <span className={`material-symbols-outlined text-[22px] ${activeTool !== toolItem.id ? (toolItem.color || '') : ''}`}>{toolItem.icon}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Layer Panel */}
            <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-3">
                <button onClick={() => setShowLayerPanel(!showLayerPanel)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl border transition-all ${showLayerPanel ? 'bg-iha-700 text-white border-iha-600' : 'bg-iha-800/90 text-slate-300 border-iha-700 hover:text-white'}`}>
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
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={visibleLayers.drone} onChange={() => setVisibleLayers(v => ({...v, drone: !v.drone}))} className="w-4 h-4 rounded border-iha-600 bg-iha-900 text-blue-500" />
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{t('mapWidget.drone')} (12.12.24)</span>
                                </label>
                                
                                {/* Cut/Fill Layer Toggle - Now Independent */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={visibleLayers.cutFill} onChange={() => setVisibleLayers(v => ({...v, cutFill: !v.cutFill}))} className="w-4 h-4 rounded border-iha-600 bg-iha-900 text-blue-500" />
                                    <div className="flex gap-0.5">
                                        <div className="w-2 h-3 bg-red-500 rounded-sm opacity-80"></div>
                                        <div className="w-2 h-3 bg-green-500 rounded-sm opacity-80"></div>
                                    </div>
                                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{t('mapWidget.cutFill')} (Yüzey)</span>
                                </label>

                                {[
                                    { id: 'chainage', l: t('mapWidget.chainage'), color: 'bg-blue-500' },
                                    { id: 'projectLine', l: t('mapWidget.projectLine'), color: 'bg-red-500' },
                                    { id: 'polygons', l: t('mapWidget.polygons'), color: 'bg-emerald-500' },
                                    { id: 'issues', l: t('mapWidget.issues'), color: 'bg-red-500' },
                                    { id: 'utilities', l: t('mapWidget.utilities'), color: 'bg-orange-400' },
                                    { id: 'notes', l: t('mapWidget.notes'), color: 'bg-yellow-500' }
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

            <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3">
                <div className="bg-iha-900/90 backdrop-blur-md border border-iha-700 rounded-xl flex items-stretch shadow-2xl overflow-hidden divide-x divide-iha-700">
                    <div className="px-5 py-3 flex flex-col items-center min-w-[80px]"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t('mapWidget.zoom')}</span><span className="text-sm font-mono font-bold text-white">{mapStats.zoom}</span></div>
                    <div className="px-6 py-3 flex flex-col items-center min-w-[140px]"><div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('mapWidget.avgElevation')}</span><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div></div><span className="text-sm font-mono font-bold text-yellow-400">{mapStats.avgElevation} m</span></div>
                </div>
                <button onClick={() => { setIsLocating(true); mapRef.current.locate({setView: true, maxZoom: 18}); }} className={`w-12 h-12 bg-iha-800 border border-iha-700 rounded-xl shadow-2xl flex items-center justify-center transition-all ${isLocating ? 'text-blue-500 animate-pulse border-blue-500' : 'text-slate-400 hover:text-white'}`}><span className="material-symbols-outlined">{isLocating ? 'gps_fixed' : 'my_location'}</span></button>
            </div>
            <div className="absolute bottom-6 left-6 z-[1000] bg-iha-900/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-slate-400 border border-white/5 font-mono shadow-xl italic">500 m <span className="mx-2 opacity-30">|</span> <span className="text-white/20 tracking-tighter">––––––––––</span></div>
        </div>
    );
};
