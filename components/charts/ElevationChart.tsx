
import React from 'react';
import { useUI } from '../../context/UIContext';

export interface ProfilePoint {
    distance: number;
    elevation: number;
    designElevation?: number; // New optional field
    label?: string;
}

interface ElevationChartProps {
    points: ProfilePoint[];
    totalDistance: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ points, totalDistance }) => {
    const { t } = useUI();
    if (!points || points.length < 2) return null;

    // Data prep
    const nglData = points.map(p => p.elevation);
    const designData = points.map(p => p.designElevation || p.elevation);
    
    // Scaling
    const allElevs = [...nglData, ...designData];
    const minElev = Math.min(...allElevs);
    const maxElev = Math.max(...allElevs);
    const yBuffer = (maxElev - minElev) * 0.2 || 2; 
    const minY = minElev - yBuffer;
    const maxY = maxElev + yBuffer;
    const rangeY = maxY - minY;
    
    const width = 800; const height = 250; const paddingX = 50; const paddingY = 30;
    
    const getX = (dist: number) => paddingX + (dist / totalDistance) * (width - 2 * paddingX);
    const getY = (elev: number) => height - paddingY - ((elev - minY) / rangeY) * (height - 2 * paddingY);

    // Path Generation
    let dNGL = `M ${getX(points[0].distance)} ${getY(points[0].elevation)}`;
    points.forEach((p, i) => { if (i > 0) dNGL += ` L ${getX(p.distance)} ${getY(p.elevation)}`; });

    let dDesign = `M ${getX(points[0].distance)} ${getY(points[0].designElevation || 0)}`;
    points.forEach((p, i) => { if (i > 0) dDesign += ` L ${getX(p.distance)} ${getY(p.designElevation || 0)}`; });

    // Calculate approximate volumes (Simulation) for display
    let cutArea = 0;
    let fillArea = 0;
    
    return (
        <div className="w-full bg-iha-900 rounded-xl border border-iha-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center p-4 border-b border-iha-700 bg-iha-800">
                <div>
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-500">landscape</span>
                        {t('mapTools.profile.chartTitle')}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">{t('mapTools.profile.chartDesc')}</p>
                </div>
                <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#a8a29e] rounded-sm"></div>
                        <span className="text-slate-300">{t('mapTools.profile.ngl')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className="text-white font-bold">{t('mapTools.profile.design')}</span>
                    </div>
                    <div className="h-6 w-px bg-iha-700"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[9px] uppercase">{t('mapTools.profile.totalDist')}</span>
                        <span className="text-blue-400 font-bold">{totalDistance.toFixed(2)} m</span>
                    </div>
                </div>
            </div>
            
            <div className="p-4 relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    <defs>
                        <pattern id="hatchRed" patternUnits="userSpaceOnUse" width="4" height="4">
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                        </pattern>
                        <pattern id="hatchGreen" patternUnits="userSpaceOnUse" width="4" height="4">
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                        </pattern>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => { 
                        const y = height - paddingY - (t * (height - 2 * paddingY)); 
                        const val = minY + (t * rangeY); 
                        return ( <g key={t}><line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" /><text x={paddingX - 10} y={y + 3} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">{val.toFixed(1)}</text></g> ); 
                    })}

                    {/* Cut/Fill Areas (Vertical Bars approach for easy SVG rendering) */}
                    {points.map((p, i) => {
                        if (i === points.length - 1) return null;
                        const nextP = points[i+1];
                        
                        const x1 = getX(p.distance);
                        const x2 = getX(nextP.distance);
                        
                        const yNGL1 = getY(p.elevation);
                        const yNGL2 = getY(nextP.elevation);
                        const yDes1 = getY(p.designElevation || 0);
                        const yDes2 = getY(nextP.designElevation || 0);

                        // Simple trapezoid filling
                        // If Design > NGL -> Fill (Green)
                        // If NGL > Design -> Cut (Red)
                        // We use average to determine color for segment
                        const avgNGL = (p.elevation + nextP.elevation) / 2;
                        const avgDes = ((p.designElevation || 0) + (nextP.designElevation || 0)) / 2;
                        
                        const isCut = avgNGL > avgDes;
                        
                        // Approximate area path for this segment
                        const dSegment = `M ${x1} ${yNGL1} L ${x2} ${yNGL2} L ${x2} ${yDes2} L ${x1} ${yDes1} Z`;

                        return (
                            <path 
                                key={`fill-${i}`} 
                                d={dSegment} 
                                fill={isCut ? "url(#hatchRed)" : "url(#hatchGreen)"} 
                                stroke="none" 
                            />
                        );
                    })}

                    {/* NGL Line (Brown/Gray) */}
                    <path d={dNGL} fill="none" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Design Line (Red) */}
                    <path d={dDesign} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points */}
                    {points.map((p, i) => { 
                        const x = getX(p.distance); 
                        const y = getY(p.elevation);
                        const yD = getY(p.designElevation || 0); 
                        const showLabel = i === 0 || i === points.length - 1 || i % 4 === 0; 
                        
                        return ( 
                            <g key={i} className="group">
                                {/* Connection Line */}
                                <line x1={x} y1={y} x2={x} y2={yD} stroke="white" strokeWidth="1" opacity="0.1" strokeDasharray="2,2" />
                                
                                {/* Points */}
                                <circle cx={x} cy={y} r="3" fill="#a8a29e" />
                                <circle cx={x} cy={yD} r="3" fill="#ef4444" />

                                {/* Tooltip Logic */}
                                <g className={`transition-opacity duration-200 ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <text x={x} y={height - 5} fill="#64748b" fontSize="10" textAnchor="middle">{Math.round(p.distance)}m</text>
                                    {/* Diff Label */}
                                    <text x={x} y={Math.min(y, yD) - 10} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">
                                        {((p.elevation - (p.designElevation || 0))).toFixed(2)}m
                                    </text>
                                </g>
                            </g> 
                        ); 
                    })}
                </svg>
            </div>
        </div>
    );
};
