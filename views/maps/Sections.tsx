
import React from 'react';
import { ProfilePoint, ElevationChart } from '../../components/Analytics';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Logic to extract Z from 3D Geometry (Polygon or LineString)
const getZFromGeoJSON = (lat: number, lng: number, geoJson: any): number | undefined => {
    if (!geoJson) return undefined;

    let closestZ: number | undefined = undefined;
    let minDistance = 0.00015; // Precision threshold (~15m)

    const features = geoJson.features || (geoJson.type === 'Feature' ? [geoJson] : []);

    features.forEach((feature: any) => {
        const geom = feature.geometry;
        if (!geom) return;

        // Handle both Polygon and LineString for 3D surfaces
        const coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates;
        
        if (Array.isArray(coords)) {
            coords.forEach((coord: any) => {
                // GeoJSON: [lng, lat, z]
                const d = Math.sqrt(Math.pow(coord[1] - lat, 2) + Math.pow(coord[0] - lng, 2));
                if (d < minDistance) {
                    minDistance = d;
                    closestZ = coord[2];
                }
            });
        }
    });

    return closestZ;
};

export const generateDetailedProfile = (
    start: {lat:number, lng:number}, 
    end: {lat:number, lng:number},
    redLineData?: any
): { points: ProfilePoint[], totalDist: number } => {
    const totalDist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const steps = 30; 
    const points: ProfilePoint[] = [];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Simulate Realistic Terrain Variation
    const baseElev = 386.5;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps; 
        const currentLat = lerp(start.lat, end.lat, t);
        const currentLng = lerp(start.lng, end.lng, t);

        // NGL: Base elevation with some perlin-like noise simulation
        const currentNGL = baseElev + (Math.sin(t * 10) * 1.5) + (Math.cos(t * 5) * 0.5);

        // Design: Fetch from 3D GeoJSON
        let currentDesign = getZFromGeoJSON(currentLat, currentLng, redLineData);

        points.push({
            distance: t * totalDist,
            elevation: parseFloat(currentNGL.toFixed(2)),
            designElevation: currentDesign ? parseFloat(currentDesign.toFixed(2)) : undefined,
            label: i === 0 ? 'START' : i === steps ? 'END' : undefined
        });
    }

    return { points, totalDist };
};

interface SectionsToolProps {
    data: { points: ProfilePoint[], totalDist: number } | null;
    pointsCount: number;
}

export const SectionsTool: React.FC<SectionsToolProps> = ({ data, pointsCount }) => {
    return (
        <div className="w-full h-full">
            {data && <ElevationChart points={data.points} totalDistance={data.totalDist} />}
        </div>
    );
};
