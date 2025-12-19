
import { ExternalMapLayer } from '../../types';

export const GAS_LAYER: ExternalMapLayer = { 
    id: 'util_gas', 
    name: 'Mevcut Doğalgaz Hattı', 
    category: 'gas', 
    type: 'GEOJSON', 
    data: {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": { "name": "Distrigaz Main Line" },
            "geometry": { "type": "LineString", "coordinates": [[24.2650, 45.6400], [24.2700, 45.6450], [24.2750, 45.6480], [24.2800, 45.6520]] }
        }]
    }, 
    color: '#ef4444', 
    opacity: 0.8, 
    addedDate: '2025-12-17', 
    isVisible: true 
};
