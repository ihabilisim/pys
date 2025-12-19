
import { ExternalMapLayer } from '../../types';

export const ELECTRIC_LAYER: ExternalMapLayer = { 
    id: 'util_elec', 
    name: 'YG Elektrik Hattı (154kV)', 
    category: 'electric', 
    type: 'GEOJSON', 
    data: {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": { "name": "Transelectrica HV" },
            "geometry": { "type": "LineString", "coordinates": [[24.2600, 45.6500], [24.2700, 45.6500], [24.2800, 45.6450], [24.2900, 45.6400]] }
        }]
    }, 
    color: '#eab308', 
    opacity: 0.8, 
    addedDate: '2025-12-17', 
    isVisible: true 
};
