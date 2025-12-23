
import React, { useEffect } from 'react';
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
    const { data, setSelectedPolyId, struct } = useData();
    const { t, showToast } = useUI();

    useEffect(() => {
        if (!mapRef.current || !layersRef.current.polygons) return;

        // --- 1. DRONE OVERLAY ---
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

        // --- 2. CHAINAGE MARKERS ---
        layersRef.current.chainage.clearLayers();
        if (visibleLayers.chainage) {
            data.chainageMarkers.forEach(m => {
                L.marker([m.lat, m.lng], { icon: mapUtils.createChainageIcon(m.km) })
                    .on('click', () => onChainageClick?.(m.km))
                    .addTo(layersRef.current.chainage);
            });
        }

        // --- 3. RED LINE (ELEGANT DESIGN) ---
        if (layersRef.current.redLine) {
            layersRef.current.redLine.clearLayers();
            if (visibleLayers.redLine) {
                const redLineKeywords = ['kırmızı', 'kirmizi', 'design', 'tasarım', 'tasarim', 'red'];
                const redLayerIds = struct.layers
                    .filter(l => {
                        const nameTr = (l.name.tr || "").toLowerCase();
                        const nameEn = (l.name.en || "").toLowerCase();
                        return redLineKeywords.some(key => nameTr.includes(key) || nameEn.includes(key));
                    })
                    .map(l => l.id);

                struct.structures.forEach(s => {
                    const surfaces = s.surfaces?.filter(surf => redLayerIds.includes(surf.layerId));
                    surfaces?.forEach(surf => {
                        if (surf.geojson) {
                            try {
                                const geoData = typeof surf.geojson === 'string' ? JSON.parse(surf.geojson) : surf.geojson;
                                L.geoJSON(geoData, {
                                    style: { 
                                        color: '#00f2ff', // Electric Cyan
                                        weight: 1.5, 
                                        opacity: 0.9,
                                        fillColor: '#00f2ff',
                                        fillOpacity: 0.12,
                                        dashArray: '5, 5' 
                                    }
                                }).addTo(layersRef.current.redLine);
                            } catch (err) { console.error(err); }
                        }
                    });
                });
            }
        }

        // --- 4. NCR / QUALITY ---
        layersRef.current.issues.clearLayers();
        if (visibleLayers.issues) {
            data.siteIssues.forEach(issue => {
                L.marker([issue.lat, issue.lng], { icon: mapUtils.flagIcon })
                    .bindPopup(`<strong>${issue.type}</strong><br/>${issue.description}`)
                    .addTo(layersRef.current.issues);
            });
        }

        // --- 5. SITE NOTES ---
        layersRef.current.notes.clearLayers();
        if (visibleLayers.notes) {
            data.mapNotes.forEach(note => {
                L.marker([note.lat, note.lng], { icon: mapUtils.noteIcon })
                    .bindPopup(`<strong>Not</strong><br/>${note.text}`)
                    .addTo(layersRef.current.notes);
            });
        }

        // --- 6. UTILITIES (GEOJSON) ---
        layersRef.current.utilities.clearLayers();
        if (visibleLayers.utilities) {
            data.externalLayers.forEach(layer => {
                // IMPORTANT: Filter out anything that accidentally got categorized as road alignment
                // though now we use a separate table, it's good to be safe.
                if (layer.isVisible && layer.data) {
                    L.geoJSON(layer.data, { 
                        style: { color: layer.color, weight: 2.5, opacity: layer.opacity },
                        onEachFeature: (f: any, l: any) => l.bindPopup(`<b>${layer.name}</b>`)
                    }).addTo(layersRef.current.utilities);
                }
            });
        }

        // --- 6.5 ALIGNMENTS (DESIGN LAYERS) ---
        // New section for "Yol Eksenleri" coming from 'design_layers' table
        if (layersRef.current.alignments) {
            layersRef.current.alignments.clearLayers();
            if (visibleLayers.alignments && data.designLayers) {
                data.designLayers.forEach(layer => {
                    if (layer.isVisible && layer.data) {
                        L.geoJSON(layer.data, {
                            style: { 
                                color: layer.color || '#f59e0b', // Default Amber
                                weight: 4, 
                                opacity: 1 
                            },
                            onEachFeature: (f: any, l: any) => l.bindPopup(`<b>${layer.name}</b><br/>Yol Ekseni`)
                        }).addTo(layersRef.current.alignments);
                    }
                });
            }
        }

        // --- 7. POLYGONS ---
        layersRef.current.polygons.clearLayers();
        if (visibleLayers.polygons) {
            data.polygonPoints.forEach(p => {
                if (p.lat && p.lng) {
                    const isSelected = p.id === selectedPolyId;
                    
                    const marker = L.marker([parseFloat(p.lat), parseFloat(p.lng)], { 
                        icon: mapUtils.createPolygonIcon(p.polygonNo, isSelected),
                        zIndexOffset: isSelected ? 1000 : 0
                    });

                    // Popup ve Tıklama Olayı
                    marker.bindPopup(`
                        <div style="text-align:center;">
                            <strong style="font-size:14px; color:#3b82f6;">${p.polygonNo}</strong><br/>
                            <span style="font-size:11px; color:#94a3b8;">${p.roadName || ''}</span><br/>
                            <div style="margin-top:4px; font-weight:bold; color:#f59e0b;">Elev: ${p.elevation}</div>
                            <div style="font-size:10px; font-family:monospace; margin-top:2px;">
                                E: ${p.east}<br/>N: ${p.north}
                            </div>
                        </div>
                    `);
                    
                    marker.on('click', () => {
                        setSelectedPolyId(p.id); // Context'i güncelle
                    });

                    marker.addTo(layersRef.current.polygons);
                    
                    if(isSelected) {
                        marker.openPopup();
                    }
                }
            });
        }
    }, [data, struct.structures, struct.layers, visibleLayers, selectedPolyId, activeTool, t]);
};
