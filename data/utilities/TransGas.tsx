
import { ExternalMapLayer } from '../../types';

export const TRANSGAS_LAYER: ExternalMapLayer = { 
    id: 'util_trans', 
    name: 'TransGaz Ana Boru', 
    category: 'transgaz', 
    type: 'GEOJSON', 
    data: {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": { "name": "TransGaz High Pressure" },
            "geometry": { "type": "LineString", "coordinates": [[24.2500, 45.6600], [24.2600, 45.6550], [24.2700, 45.6520], [24.3000, 45.6500]] }
        }]
    }, 
    color: '#f97316', 
    opacity: 0.8, 
    addedDate: '2025-12-17', 
    isVisible: true 
};
