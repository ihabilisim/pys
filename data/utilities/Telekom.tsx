
import { ExternalMapLayer } from '../../types';

export const TELEKOM_LAYER: ExternalMapLayer = { 
    id: 'util_tel', 
    name: 'Fiber Optik Kablo', 
    category: 'telecom', 
    type: 'GEOJSON', 
    data: {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": { "name": "Digi Fiber Optics" },
            "geometry": { "type": "LineString", "coordinates": [[24.2680, 45.6410], [24.2685, 45.6420], [24.2690, 45.6430], [24.2700, 45.6440]] }
        }]
    }, 
    color: '#a855f7', 
    opacity: 0.8, 
    addedDate: '2025-12-17', 
    isVisible: true 
};
