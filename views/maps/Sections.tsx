
import React from 'react';
import { ProfilePoint, ElevationChart } from '../../components/Analytics';
import { useUI } from '../../context/UIContext';

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

// Updated Profile Generator with Cut/Fill Logic
export const generateDetailedProfile = (start: {lat:number, lng:number}, end: {lat:number, lng:number}): { points: ProfilePoint[], totalDist: number } => {
    const totalDist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const steps = 15; // More resolution
    const points: ProfilePoint[] = [];

    // Terrain Function (Existing)
    const getElev = (lat: number, lng: number) => {
        const base = 380;
        const noise1 = Math.sin(lat * 3000 + lng * 3000) * 15; 
        const noise2 = Math.cos(lat * 8000) * 5;
        return base + Math.abs(noise1 + noise2); 
    };

    // Design Surface Function (Simulated)
    // A smoother curve representing the road
    const getDesignElev = (lat: number, lng: number) => {
        const base = 385; 
        const gradient = (lat - 45.64) * 200; // General trend
        return base + gradient;
    };

    const startElev = getElev(start.lat, start.lng);
    const endElev = getElev(end.lat, end.lng);
    const startDesign = getDesignElev(start.lat, start.lng);
    const endDesign = getDesignElev(end.lat, end.lng);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps; 
        const curLat = lerp(start.lat, end.lat, t);
        const curLng = lerp(start.lng, end.lng, t);
        
        // Terrain calculation with noise
        const trendElev = lerp(startElev, endElev, t);
        const randomBump = i === 0 || i === steps ? 0 : (Math.random() - 0.5) * 8; 
        const ngl = parseFloat((trendElev + randomBump).toFixed(2));

        // Design calculation (Smoother)
        const designTrend = lerp(startDesign, endDesign, t);
        const designCurve = Math.sin(t * Math.PI) * 2; // Slight vertical curve
        const design = parseFloat((designTrend + designCurve).toFixed(2));

        points.push({
            distance: t * totalDist,
            elevation: ngl,
            designElevation: design, // Added design Z
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
        <div className="space-y-4">
            {data && <ElevationChart points={data.points} totalDistance={data.totalDist} />}
        </div>
    );
};
