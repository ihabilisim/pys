
import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { mapUtils } from '../utils/mapUtils';
import { DRONE_CONFIG } from '../views/maps/DronOtofoto';

declare const L: any;

export const useMapLayers = (
    mapRef: React.MutableRefObject<any>,
    layersRef: React.MutableRefObject<any>,
    visibleLayers: any,
    selectedPolyId: string | null,
    activeTool: string,
    onChainageClick?: (km: string) => void
) => {
    const { data, setSelectedPolyId } = useData();
    const { t } = useUI();

    useEffect(() => {
        if (!mapRef.current || !layersRef.current.polygons) return;

        // Drone Overlay
        if (visibleLayers.drone) {
            if (!layersRef.current.droneOverlay) {
                layersRef.current.droneOverlay = L.imageOverlay(DRONE_CONFIG.imageUrl, DRONE_CONFIG.bounds, {
                    opacity: 0.9,
                    interactive: true,
                    attribution: DRONE_CONFIG.attribution
                }).addTo(mapRef.current);
            }
        } else {
            if (layersRef.current.droneOverlay) {
                mapRef.current.removeLayer(layersRef.current.droneOverlay);
                layersRef.current.droneOverlay = null;
            }
        }

        // Chainage Markers
        layersRef.current.chainage.clearLayers();
        if (visibleLayers.chainage) {
            data.chainageMarkers.forEach(m => {
                L.marker([m.lat, m.lng], { icon: mapUtils.createChainageIcon(m.km) })
                    .on('click', () => onChainageClick?.(m.km))
                    .addTo(layersRef.current.chainage);
            });
        }

        // Project Line (Alignments)
        // Includes: 1. GeoJSON Alignments (Uploaded via Admin > Layout)
        //           2. LandXML Alignments (Uploaded via Admin > Topo)
        layersRef.current.projectLine.clearLayers();
        if (visibleLayers.projectLine) {
            // 1. GeoJSON Alignments
            data.externalLayers.forEach(layer => {
                if (layer.isVisible && layer.data && layer.category === 'road_alignment') {
                    L.geoJSON(layer.data, { 
                        style: { color: layer.color || '#ef4444', weight: 4, dashArray: '10, 10', opacity: 0.8 },
                        onEachFeature: (f: any, l: any) => l.bindPopup(`<strong>${layer.name}</strong><br/>Proje Hattı (GeoJSON)`)
                    }).addTo(layersRef.current.projectLine);
                }
            });

            // 2. LandXML Alignments
            // Since we cannot parse real XML in browser efficiently without heavy libs,
            // we render a placeholder line for visualization proof-of-concept using metadata.
            data.landXmlFiles.filter(f => f.type === 'ALIGNMENT' && f.isVisible).forEach(file => {
                // Placeholder: Draw a line near the site center to represent the uploaded file visually
                const placeholderLine = [
                    [45.6321, 24.2612],
                    [45.6410, 24.2680], 
                    [45.6520, 24.2790],
                    [45.7135, 24.3698]
                ];
                
                L.polyline(placeholderLine, {
                    color: file.color || '#ef4444',
                    weight: 5,
                    opacity: file.opacity || 0.8
                })
                .bindPopup(`
                    <div style="font-family: Inter, sans-serif;">
                        <h4 style="margin:0; font-weight:bold; color:${file.color}">${file.name}</h4>
                        <div style="font-size:10px; color:#64748b;">LandXML Alignment (Güzergah)</div>
                        <p style="font-size:11px; margin:4px 0;">${file.description || 'Açıklama yok'}</p>
                    </div>
                `)
                .addTo(layersRef.current.projectLine);
            });
        }

        // Cut/Fill Analysis (Surfaces)
        layersRef.current.cutFill.clearLayers();
        if (visibleLayers.cutFill) {
            data.landXmlFiles.filter(f => f.type === 'SURFACE').forEach(file => {
                // Render placeholder polygon for LandXML surface
                // In real app, this would come from parsed XML faces
                const placeholderBounds = [
                    [45.6450, 24.2700],
                    [45.6480, 24.2850],
                    [45.6420, 24.2820],
                    [45.6400, 24.2750]
                ];

                L.polygon(placeholderBounds, {
                    color: 'transparent',
                    fillColor: file.color || '#3b82f6',
                    fillOpacity: file.opacity || 0.5
                })
                .bindPopup(`
                    <div style="font-family: Inter, sans-serif;">
                        <h4 style="margin:0; font-weight:bold; color:${file.color}">${file.name}</h4>
                        <div style="font-size:10px; color:#64748b;">LandXML Surface (Yüzey)</div>
                        <p style="font-size:11px; margin:4px 0;">${file.description || 'Açıklama yok'}</p>
                    </div>
                `)
                .addTo(layersRef.current.cutFill);
            });
        }

        // Polygons (Points)
        layersRef.current.polygons.clearLayers();
        if (visibleLayers.polygons) {
            data.polygonPoints.forEach(p => {
                if (p.lat && p.lng) {
                    const isSelected = p.id === selectedPolyId;
                    const marker = L.marker([parseFloat(p.lat), parseFloat(p.lng)], { 
                        icon: mapUtils.createPolygonIcon(p.polygonNo, isSelected),
                        zIndexOffset: isSelected ? 1000 : 0
                    });

                    const statusLabel = p.status === 'ACTIVE' ? t('topo.grid.active') : t('topo.grid.lost');
                    const popupContent = `
                        <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <h3 style="font-weight: 700; color: white; font-size: 14px; margin: 0;">${p.polygonNo}</h3>
                                <span style="font-size: 10px; background: rgba(59,130,246,0.2); color: #93c5fd; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(59,130,246,0.3);">${statusLabel}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 12px;">
                                <div style="color: #94a3b8;">${t('topo.grid.roadName')}:</div><div style="font-family: monospace; color: white; text-align: right;">${p.roadName || '-'}</div>
                                <div style="color: #94a3b8;">${t('topo.grid.km')}:</div><div style="font-family: monospace; color: white; text-align: right;">${p.km || '-'}</div>
                                <div style="color: #94a3b8;">${t('topo.grid.offset')}:</div><div style="font-family: monospace; color: white; text-align: right;">${p.offset || '-'}</div>
                                <div style="grid-column: span 2; height: 1px; background: rgba(255,255,255,0.05); margin: 4px 0;"></div>
                                <div style="color: #94a3b8;">${t('topo.grid.east')}:</div><div style="font-family: monospace; color: #fbbf24; text-align: right;">${p.east}</div>
                                <div style="color: #94a3b8;">${t('topo.grid.north')}:</div><div style="font-family: monospace; color: #fbbf24; text-align: right;">${p.north}</div>
                                <div style="color: #94a3b8;">${t('topo.grid.elevation')}:</div><div style="font-family: monospace; font-weight: 700; color: #34d399; text-align: right;">${p.elevation}</div>
                            </div>
                            ${p.description ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #64748b; font-style: italic;">${p.description}</div>` : ''}
                        </div>
                    `;

                    marker.bindPopup(popupContent, { 
                        closeButton: false, 
                        autoPan: false,
                        offset: [0, -40]
                    });

                    marker.on('click', () => { 
                        if(activeTool === 'none') {
                            setSelectedPolyId(p.id);
                        }
                    });
                    
                    marker.addTo(layersRef.current.polygons);
                    
                    if (isSelected) {
                        const targetLat = parseFloat(p.lat) + 0.00025;
                        mapRef.current.flyTo([targetLat, parseFloat(p.lng)], 18, {
                            animate: true,
                            duration: 1.5
                        });
                        setTimeout(() => marker.openPopup(), 500);
                    }
                }
            });
        }

        // Issues
        layersRef.current.issues.clearLayers();
        if (visibleLayers.issues) {
            data.siteIssues.forEach(issue => {
                L.marker([issue.lat, issue.lng], { icon: mapUtils.flagIcon }).bindPopup(issue.description).addTo(layersRef.current.issues);
            });
        }

        // Notes
        layersRef.current.notes.clearLayers();
        if (visibleLayers.notes) {
            data.mapNotes.forEach(note => {
                L.marker([note.lat, note.lng], { icon: mapUtils.noteIcon }).bindPopup(note.text).addTo(layersRef.current.notes);
            });
        }

        // Utilities (Separate from Project Line now)
        layersRef.current.utilities.clearLayers();
        data.externalLayers.forEach(layer => {
            if (layer.isVisible && layer.data && layer.category !== 'road_alignment') {
                if (visibleLayers.utilities) {
                    L.geoJSON(layer.data, { 
                        style: { color: layer.color, weight: 3, opacity: layer.opacity },
                        onEachFeature: (f: any, l: any) => l.bindPopup(layer.name)
                    }).addTo(layersRef.current.utilities);
                }
            }
        });

    }, [data, visibleLayers, selectedPolyId, activeTool, t]);
};
