
import { ExternalMapLayer } from '../../types';

export const WATER_LAYER: ExternalMapLayer = { 
    id: 'util_water', 
    name: 'Şebeke Suyu Hattı', 
    category: 'water', 
    type: 'GEOJSON', 
    data: {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": { "name": "Apa Canal Main" },
            "geometry": { "type": "LineString", "coordinates": [[24.2620, 45.6350], [24.2720, 45.6380], [24.2820, 45.6420], [24.2920, 45.6450]] }
        }]
    }, 
    color: '#3b82f6', 
    opacity: 0.8, 
    addedDate: '2025-12-17', 
    isVisible: true 
};
