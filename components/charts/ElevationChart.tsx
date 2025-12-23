
import React from 'react';
import { useUI } from '../../context/UIContext';

export interface ProfilePoint {
    distance: number;
    elevation: number;
    designElevation?: number; 
    label?: string;
}

interface ElevationChartProps {
    points: ProfilePoint[];
    totalDistance: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ points, totalDistance }) => {
    const { t } = useUI();
    if (!points || points.length < 2) return null;

    const hasDesignData = points.some(p => p.designElevation !== undefined);

    const allElevs = points.flatMap(p => 
        hasDesignData && p.designElevation !== undefined 
            ? [p.elevation, p.designElevation] 
            : [p.elevation]
    );
    
    const minElev = Math.min(...allElevs);
    const maxElev = Math.max(...allElevs);
    const buffer = (maxElev - minElev) * 0.25 || 2.5;
    const minY = minElev - buffer;
    const maxY = maxElev + buffer;
    const rangeY = maxY - minY;

    const width = 1000;
    const height = 400;
    const paddingX = 80;
    const paddingY = 60;

    const getX = (dist: number) => paddingX + (dist / totalDistance) * (width - 2 * paddingX);
    const getY = (elev: number) => height - paddingY - ((elev - minY) / rangeY) * (height - 2 * paddingY);

    // Paths
    let dNGL = `M ${getX(points[0].distance)} ${getY(points[0].elevation)}`;
    points.forEach((p, i) => { if (i > 0) dNGL += ` L ${getX(p.distance)} ${getY(p.elevation)}`; });

    let dDesign = '';
    if (hasDesignData) {
        dDesign = `M ${getX(points[0].distance)} ${getY(points[0].designElevation || points[0].elevation)}`;
        points.forEach((p, i) => {
            if (i > 0) dDesign += ` L ${getX(p.distance)} ${getY(p.designElevation || p.elevation)}`;
        });
    }

    // Advanced Hatching with Intersections
    const hatchPolygons: { points: string, type: 'CUT' | 'FILL', depth: string, midX: number, midY: number }[] = [];

    if (hasDesignData) {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i+1];
            const x1 = getX(p1.distance);
            const x2 = getX(p2.distance);
            const ngl1 = p1.elevation;
            const ngl2 = p2.elevation;
            const des1 = p1.designElevation || ngl1;
            const des2 = p2.designElevation || ngl2;

            const diff1 = ngl1 - des1;
            const diff2 = ngl2 - des2;

            // Detect Intersection
            if ((diff1 > 0 && diff2 < 0) || (diff1 < 0 && diff2 > 0)) {
                const ratio = Math.abs(diff1) / (Math.abs(diff1) + Math.abs(diff2));
                const interX = x1 + (x2 - x1) * ratio;
                const interY = getY(ngl1 + (ngl2 - ngl1) * ratio);

                // Part 1
                hatchPolygons.push({
                    points: `${x1},${getY(ngl1)} ${interX},${interY} ${x1},${getY(des1)}`,
                    type: diff1 > 0 ? 'CUT' : 'FILL',
                    depth: Math.abs(diff1).toFixed(2) + 'm',
                    midX: x1 + (interX-x1)/2, midY: Math.min(getY(ngl1), getY(des1)) - 20
                });
                // Part 2
                hatchPolygons.push({
                    points: `${interX},${interY} ${x2},${getY(ngl2)} ${x2},${getY(des2)}`,
                    type: diff2 > 0 ? 'CUT' : 'FILL',
                    depth: Math.abs(diff2).toFixed(2) + 'm',
                    midX: interX + (x2-interX)/2, midY: Math.min(getY(ngl2), getY(des2)) - 20
                });
            } else {
                hatchPolygons.push({
                    points: `${x1},${getY(ngl1)} ${x2},${getY(ngl2)} ${x2},${getY(des2)} ${x1},${getY(des1)}`,
                    type: diff1 > 0 ? 'CUT' : 'FILL',
                    depth: Math.abs(diff1).toFixed(2) + 'm',
                    midX: (x1+x2)/2, midY: Math.min(getY(ngl1), getY(des1)) - 30
                });
            }
        }
    }

    // LABEL OPTIMIZATION: Show approx 5 labels total
    const labelStep = Math.max(1, Math.floor(hatchPolygons.length / 5));

    return (
        <div className="w-full h-full flex flex-col bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <div className="flex justify-between items-center px-8 py-5 bg-slate-900/90 border-b border-white/5">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2"><div className="w-8 h-1 bg-red-500 border-t border-dashed border-white"></div><span className="text-[10px] font-black text-white tracking-widest uppercase">TASARIM (KIRMIZI KOT)</span></div>
                    <div className="flex items-center gap-2"><div className="w-8 h-1.5 bg-slate-400 rounded-full"></div><span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ARAZİ (SİYAH KOT)</span></div>
                </div>
                <div className="flex gap-8">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600/30 border border-red-500/50 rounded flex overflow-hidden"><div className="w-full h-full opacity-50" style={{backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 0, transparent 4px)'}}></div></div><span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">KAZI</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-600/30 border border-emerald-500/50 rounded flex overflow-hidden"><div className="w-full h-full opacity-50" style={{backgroundImage: 'repeating-linear-gradient(-45deg, #10b981 0, #10b981 1px, transparent 0, transparent 4px)'}}></div></div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">DOLGU</span></div>
                </div>
            </div>

            <div className="flex-1 relative p-6">
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible">
                    <defs>
                        <pattern id="cutHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="2" opacity="0.6" />
                        </pattern>
                        <pattern id="fillHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-45)">
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#10b981" strokeWidth="2" opacity="0.6" />
                        </pattern>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = height - paddingY - (t * (height - 2 * paddingY));
                        const val = minY + (t * rangeY);
                        return (
                            <g key={t}>
                                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
                                <text x={paddingX - 15} y={y + 5} fill="#64748b" fontSize="12" textAnchor="end" fontFamily="monospace" fontWeight="black">{val.toFixed(1)}</text>
                            </g>
                        );
                    })}

                    {/* Hatching Areas */}
                    {hatchPolygons.map((h, i) => (
                        <g key={i}>
                            <polygon points={h.points} fill={h.type === 'CUT' ? 'url(#cutHatch)' : 'url(#fillHatch)'} />
                            {/* Smart Labeling: Show only at optimized intervals */}
                            {i % labelStep === 0 && parseFloat(h.depth) > 0.1 && (
                                <text x={h.midX} y={h.midY} fill="white" fontSize="22" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))">
                                    {h.type === 'FILL' ? '-' : ''}{h.depth}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* Main Profile Lines */}
                    <path d={dNGL} fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    {hasDesignData && <path d={dDesign} fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="15,10" strokeLinecap="butt" filter="url(#glow)" />}

                    {/* X-Axis Labels */}
                    <line x1={paddingX} y1={height-paddingY} x2={width-paddingX} y2={height-paddingY} stroke="#475569" strokeWidth="3" />
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const x = paddingX + (t * (width - 2 * paddingX));
                        return (
                            <g key={t}>
                                <line x1={x} y1={height-paddingY} x2={x} y2={height-paddingY+12} stroke="#475569" strokeWidth="3" />
                                <text x={x} y={height-paddingY+35} fill="#94a3b8" fontSize="14" textAnchor="middle" fontWeight="black" fontFamily="monospace">{Math.round(t * totalDistance)}m</text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};
