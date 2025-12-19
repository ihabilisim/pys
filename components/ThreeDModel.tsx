
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { ProgressRow, Language } from '../types';
import { BridgeGroup } from './three/BridgeGroup';
import { CulvertGroup } from './three/CulvertGroup';
import { STATUS_COLORS } from './three/constants';

interface ModelProps {
    rows: ProgressRow[];
    onElementClick: (rowId: string, colId: string) => void;
    language: Language;
}

export const ThreeDModel: React.FC<ModelProps> = ({ rows, onElementClick, language }) => {
    
    // --- AKILLI SIRALAMA ALGORİTMASI ---
    // Veritabanında 'orderIndex' olsun veya olmasın, Lokasyon ismine bakarak (C1, P1, P2... C2)
    // mantıksal bir sıralama yapar.
    const sortedRows = useMemo(() => {
        return [...rows].sort((a, b) => {
            // 1. Yardımcı fonksiyon: Lokasyona göre puan ver
            const getScore = (r: ProgressRow) => {
                // Eğer manuel orderIndex varsa onu kullan (öncelikli)
                if (r.orderIndex !== undefined && r.orderIndex !== 0) return r.orderIndex;

                const loc = r.location.toUpperCase();
                
                // Kenar Ayaklar (Abutments) - En başa ve en sona
                if (loc === 'C1' || loc === 'A1') return -1000; // Başlangıç
                if (loc === 'C2' || loc === 'A2') return 10000; // Bitiş

                // Orta Ayaklar (Piers) - P1, P2, P10...
                if (loc.startsWith('P')) {
                    const num = parseInt(loc.replace(/\D/g, '')); // "P12" -> 12
                    return isNaN(num) ? 0 : num;
                }
                
                // Bilinmeyenler sona
                return 5000;
            };

            const scoreA = getScore(a);
            const scoreB = getScore(b);

            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }

            // 2. Aynı lokasyondaysa (Örn: P1 Sağ ve P1 Sol), DR (Sağ) önce, ST (Sol) sonra gelsin
            if (a.foundationType < b.foundationType) return -1;
            if (a.foundationType > b.foundationType) return 1;

            return 0;
        });
    }, [rows]);

    return (
        <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-iha-700">
            {/* Lejand */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white pointer-events-none select-none">
                <h3 className="font-bold mb-3 text-xs uppercase tracking-wider text-slate-300">Durum Renkleri</h3>
                <div className="flex flex-col gap-2 text-[10px] font-medium">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.EMPTY}}></div> Başlanmadı</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.PREPARING}}></div> Hazırlanıyor</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.PENDING}}></div> Onay Bekliyor</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: STATUS_COLORS.SIGNED}}></div> Tamamlandı</div>
                </div>
            </div>

            <Canvas shadows camera={{ position: [30, 25, 30], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight 
                    position={[50, 80, 30]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                />
                
                <group position={[0, -2, 0]}>
                    <Grid 
                        args={[200, 200]} 
                        cellSize={2} 
                        cellThickness={1} 
                        cellColor="#1e293b" 
                        sectionSize={10} 
                        sectionThickness={1.5} 
                        sectionColor="#334155" 
                        fadeDistance={100} 
                    />
                    
                    {sortedRows.map((row, index) => {
                        // Check if it's a Culvert or Bridge
                        const isCulvert = row.foundationType === 'MAIN'; 

                        if (isCulvert) {
                            return (
                                <CulvertGroup 
                                    key={row.id}
                                    row={row}
                                    position={[0, 0, 0]} 
                                    onElementClick={onElementClick}
                                    language={language}
                                />
                            );
                        } else {
                            // Bridge Rendering Logic
                            // Z Position calculation based on SORTED index
                            // Pairs (Right/Left) are grouped roughly by dividing index by 2
                            const zPos = Math.floor(index / 2) * -20; 
                            
                            // Determine X offset based on foundation type (DR=Right, ST=Left)
                            // Default to Right if unknown
                            const xOffset = row.foundationType === 'ST' ? -6 : 6;
                            
                            // Check if this is the last pair (for abutment or closing logic)
                            const isLast = index >= sortedRows.length - 2;

                            return (
                                <BridgeGroup 
                                    key={row.id} 
                                    row={row} 
                                    position={[xOffset, 0, zPos]} 
                                    onElementClick={onElementClick}
                                    language={language}
                                    isLast={isLast}
                                />
                            );
                        }
                    })}

                    {/* Ground Plane Helper for Bridges only */}
                    {rows.some(r => r.foundationType !== 'MAIN') && (
                        <group>
                            <mesh position={[-6, 9, -50]} rotation={[0,0,0]}>
                                <boxGeometry args={[8, 0.2, 200]} />
                                <meshStandardMaterial color="#64748b" transparent opacity={0.1} />
                            </mesh>
                            <mesh position={[6, 9, -50]} rotation={[0,0,0]}>
                                <boxGeometry args={[8, 0.2, 200]} />
                                <meshStandardMaterial color="#64748b" transparent opacity={0.1} />
                            </mesh>
                        </group>
                    )}
                </group>

                <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.4} far={10} color="#000000" />
                <OrbitControls 
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 2.1} 
                    minDistance={10}
                    maxDistance={150}
                    makeDefault 
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
