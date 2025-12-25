// @FIX: Add react-three-fiber types reference to fix JSX intrinsic element errors.
/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { ProgressRow, Language, MatrixColumn, MatrixCell } from '../types';
import { BridgeGroup } from './three/BridgeGroup';
import { CulvertGroup } from './three/CulvertGroup';
import { STATUS_COLORS } from './three/constants';

interface ModelProps {
    rows: ProgressRow[];
    columns: MatrixColumn[]; 
    onElementClick: (rowId: string, colId: string, cell: MatrixCell) => void;
    language: Language;
}

export const ThreeDModel: React.FC<ModelProps> = ({ rows, columns, onElementClick, language }) => {
    
    // --- AKILLI SIRALAMA ve POZİSYONLAMA ALGORİTMASI ---
    // Her satırın Z (uzunlamasına) pozisyonunu ismine göre belirle.
    // Örn: C1 -> 0, P1 -> 20, P2 -> 40... C2 -> Son
    const processedRows = useMemo(() => {
        // 1. Kenar Ayakları ve Orta Ayakları Ayrıştır
        const abutments = rows.filter(r => r.location.startsWith('C') || r.location.startsWith('A') || r.foundationType === 'ABUTMENT');
        const piers = rows.filter(r => r.location.startsWith('P') && r.foundationType !== 'ABUTMENT');
        const others = rows.filter(r => !abutments.includes(r) && !piers.includes(r));

        // 2. Pier'leri numarasına göre sırala (P1, P2...)
        piers.sort((a, b) => {
            const numA = parseInt(a.location.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.location.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        // 3. Abutment'ları C1/A1 başa, C2/A2 sona gelecek şekilde ayarla
        abutments.sort((a, b) => {
            const numA = parseInt(a.location.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.location.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        // 4. Z Pozisyonlarını Ata
        // Start Abutment (C1) -> 0
        // Piers (P1, P2...) -> 20, 40...
        // End Abutment (C2) -> Son Pier + 20
        
        const SPACING = 25;
        const positionMap = new Map<string, number>(); // Row ID -> Z Position

        // C1 (Başlangıç)
        const startAbs = abutments.filter(a => a.location.includes('1'));
        startAbs.forEach(r => positionMap.set(r.id, 0));

        // Piers
        piers.forEach(r => {
            const num = parseInt(r.location.replace(/\D/g, '')) || 1;
            // P1 should be at SPACING * 1, P2 at SPACING * 2...
            positionMap.set(r.id, num * SPACING);
        });

        // C2 (Bitiş)
        const lastPierNum = piers.length > 0 
            ? Math.max(...piers.map(p => parseInt(p.location.replace(/\D/g, '')) || 0)) 
            : 0;
        
        const endAbs = abutments.filter(a => a.location.includes('2'));
        endAbs.forEach(r => positionMap.set(r.id, (lastPierNum + 1) * SPACING));

        // Diğerleri (Menfezler vb. düz sırala)
        others.forEach((r, idx) => positionMap.set(r.id, idx * SPACING));

        return rows.map(row => ({
            ...row,
            calculatedZ: positionMap.get(row.id) || 0
        }));

    }, [rows]);

    return (
        <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-iha-700">
            {/* Lejand */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white pointer-events-none select-none">
                <h3 className="font-bold mb-3 text-xs uppercase tracking-wider">Durum Renkleri</h3>
                <div className="flex flex-col gap-2 text-[10px] font-medium">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.EMPTY}}></div> Başlanmadı</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.PREPARING}}></div> Hazırlanıyor</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.PENDING}}></div> Onay Bekliyor</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.SIGNED}}></div> Tamamlandı</div>
                </div>
            </div>

            <Canvas shadows camera={{ position: [40, 30, 40], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight 
                    position={[50, 80, 30]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                />
                
                <group position={[0, -2, 0]}>
                    <Grid 
                        args={[200, 400]} 
                        cellSize={2} 
                        cellThickness={1} 
                        cellColor="#1e293b" 
                        sectionSize={10} 
                        sectionThickness={1.5} 
                        sectionColor="#334155" 
                        fadeDistance={150} 
                    />
                    
                    {processedRows.map((row) => {
                        const isCulvert = row.foundationType === 'MAIN'; 

                        if (isCulvert) {
                            return (
                                <CulvertGroup 
                                    key={row.id}
                                    row={row}
                                    columns={columns} 
                                    position={[0, 0, 0]} 
                                    onElementClick={onElementClick}
                                    language={language}
                                />
                            );
                        } else {
                            // --- X POZİSYONU (Direction'a göre) ---
                            let xOffset = 0;
                            // Database'den gelen 'L', 'R', 'C' değerine göre
                            if (row.direction === 'L') xOffset = -8; // Sola kaydır
                            else if (row.direction === 'R') xOffset = 8; // Sağa kaydır
                            else xOffset = 0; // Merkez

                            // Z Pozisyonu hesaplanmış değer
                            const zPos = -1 * (row as any).calculatedZ;

                            return (
                                <BridgeGroup 
                                    key={row.id} 
                                    row={row}
                                    columns={columns}
                                    position={[xOffset, 0, zPos]} 
                                    onElementClick={onElementClick}
                                    language={language}
                                    isLast={false} // Mantığı basitleştirdik, kirişler her zaman çizilsin
                                />
                            );
                        }
                    })}

                    {/* Ground Plane Helper for Bridges only */}
                    {rows.some(r => r.foundationType !== 'MAIN') && (
                        <group>
                            <mesh position={[-8, 9, -100]} rotation={[0,0,0]} raycast={() => null}>
                                <boxGeometry args={[10, 0.2, 400]} />
                                <meshStandardMaterial color="#64748b" transparent opacity={0.1} />
                            </mesh>
                            <mesh position={[8, 9, -100]} rotation={[0,0,0]} raycast={() => null}>
                                <boxGeometry args={[10, 0.2, 400]} />
                                <meshStandardMaterial color="#64748b" transparent opacity={0.1} />
                            </mesh>
                        </group>
                    )}
                </group>

                <ContactShadows resolution={1024} scale={400} blur={2} opacity={0.4} far={10} color="#000000" />
                <OrbitControls 
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 2.1} 
                    minDistance={10}
                    maxDistance={250}
                    makeDefault 
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
