/// <reference types="@react-three/fiber" />
// Fix: Moved react-three-fiber types reference to the top of the file to resolve JSX intrinsic element errors.
import React, { useMemo, useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ConstructionElement } from './ConstructionElement';
import { STATUS_COLORS, LABELS, MAPPING_KEYWORDS } from './constants';
import { ProgressRow, Language, MatrixColumn, MatrixStatus, MatrixCell } from '../../types';

interface CulvertGroupProps {
    row: ProgressRow;
    columns: MatrixColumn[]; 
    position: [number, number, number];
    onElementClick: (rowId: string, colId: string, cell: MatrixCell) => void;
    language: Language;
}

// --- ÖZEL GEOMETRİ BİLEŞENİ (Eğimli Duvarlar ve Trapez Zeminler İçin) ---
const CustomShapeElement = ({ position, rotation, shape, depth, color, onClick, label }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hovered ? 0.3 : 0;
        }
    });

    const extrudeSettings = useMemo(() => ({
        depth: depth,
        bevelEnabled: false
    }), [depth]);

    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial 
                    color={color} 
                    roughness={0.5} 
                    metalness={0.1} 
                    emissive={color}
                    emissiveIntensity={0}
                    side={THREE.DoubleSide} 
                />
            </mesh>
            {hovered && label && (
                <Text
                    position={[0, 2, 0]}
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.04}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
            )}
        </group>
    );
};

export const CulvertGroup: React.FC<CulvertGroupProps> = ({ row, columns, position, onElementClick, language }) => {
    
    // --- AKILLI SÜTUN EŞLEŞTİRME ---
    const { stoneId, leanId, raftId, wallId, slabId } = useMemo(() => {
        
        const findBestColumn = (keywords: string[]) => {
            // 1. Adayları bul
            let candidates = columns.filter(c => {
                const text = (c.group.tr + ' ' + c.name.tr + ' ' + c.group.en + ' ' + c.name.en).toLowerCase();
                return keywords.some(k => text.includes(k));
            });

            // --- DEĞİŞİKLİK: 'VERIFICARE' ÖNCELİĞİ ---
            // Sadece doğrulama/imalat sütunlarını al
            const verifCandidates = candidates.filter(c => c.type === 'VERIFICARE');
            if (verifCandidates.length > 0) {
                candidates = verifCandidates;
            }

            if (candidates.length === 0) return undefined;

            // 2. Beton/Concrete önceliği (Zaten VERIFICARE filtresinden geçtiği için burası ikincil bir doğrulama olur)
            const priorityMatch = candidates.find(c => {
                const text = (c.name.tr + ' ' + c.name.en).toLowerCase();
                return MAPPING_KEYWORDS.PRIORITY_TYPES.some(pt => text.includes(pt));
            });

            return priorityMatch ? priorityMatch.id : candidates[candidates.length - 1].id;
        };

        return {
            stoneId: findBestColumn(MAPPING_KEYWORDS.CULVERT.STONE),
            leanId: findBestColumn(MAPPING_KEYWORDS.CULVERT.LEAN),
            raftId: findBestColumn(MAPPING_KEYWORDS.CULVERT.FOUNDATION),
            wallId: findBestColumn(MAPPING_KEYWORDS.CULVERT.WALL),
            slabId: findBestColumn(MAPPING_KEYWORDS.CULVERT.SLAB)
        };
    }, [columns]);

    // --- DURUM VERİLERİ ---
    const getStatus = (columnId: string | undefined): { status: MatrixStatus, id: string | undefined } => {
        if (!columnId || !row.cells) return { status: 'EMPTY', id: undefined };
        const cell = row.cells[columnId];
        return { status: cell?.status || 'EMPTY', id: columnId };
    };

    // Mapping 3D Parts to Logical Columns
    const stoneData = getStatus(stoneId);
    const leanData = getStatus(leanId);
    const foundationData = getStatus(raftId);
    const wallData = getStatus(wallId);
    const slabData = getStatus(slabId);

    const emptyCell: MatrixCell = { code: '', status: 'EMPTY' };

    const handleClick = (colId: string | undefined) => {
        if(colId) {
            onElementClick(row.id, colId, row.cells?.[colId] || emptyCell);
        } else {
            console.warn("Bu eleman için matris sütunu bulunamadı.");
        }
    };

    const labelPrefix = `${row.location}`;

    // --- GEOMETRİK AYARLAR ---
    const BARREL_WIDTH = 3.5;   // Menfez dış genişlik
    const BARREL_HEIGHT = 3.0;  // Menfez dış yükseklik
    const WALL_THICKNESS = 0.35; 
    const SEGMENT_LENGTH = 2.0; 
    const SEGMENT_COUNT = 8;
    const TOTAL_LENGTH = SEGMENT_LENGTH * SEGMENT_COUNT;
    
    const WING_LENGTH = 4.5;    // Kanat uzunluğu
    const WING_START_H = 3.0;   // Kanat başlangıç yüksekliği 
    const WING_END_H = 1.0;     // Kanat uç yüksekliği
    const FLARE_ANGLE = Math.PI / 6; // 30 Derece dışa açılma
    const HEADWALL_HEIGHT = 0.6; 

    // --- ŞEKİL OLUŞTURUCULAR ---

    // 1. KANAT DUVARI PROFİLİ 
    const wingShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, WING_START_H); 
        shape.lineTo(WING_LENGTH, WING_END_H); 
        shape.lineTo(WING_LENGTH, 0); 
        shape.closePath();
        return shape;
    }, []);

    // 2. KANAT TEMELİ (Footer)
    const wingFooterShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 0.4); 
        shape.lineTo(WING_LENGTH + 0.2, 0.4); 
        shape.lineTo(WING_LENGTH + 0.2, 0);
        shape.closePath();
        return shape;
    }, []);

    // 3. APRON PROFİLİ
    const apronShape = useMemo(() => {
        const shape = new THREE.Shape();
        const startHalfW = (BARREL_WIDTH / 2) - 0.1; 
        const flareOffset = Math.tan(FLARE_ANGLE) * WING_LENGTH;
        const endHalfW = startHalfW + flareOffset;

        shape.moveTo(-startHalfW, 0);
        shape.lineTo(startHalfW, 0);
        shape.lineTo(endHalfW, WING_LENGTH);
        shape.lineTo(-endHalfW, WING_LENGTH);
        shape.closePath();
        return shape;
    }, []);

    // 4. PREFABRİK GÖVDE KESİTİ
    const segmentShape = useMemo(() => {
        const shape = new THREE.Shape();
        const w = BARREL_WIDTH / 2;
        const h = BARREL_HEIGHT;
        const t = WALL_THICKNESS;
        const chamfer = 0.3; 

        // Dış Kare
        shape.moveTo(-w, 0);
        shape.lineTo(w, 0);
        shape.lineTo(w, h);
        shape.lineTo(-w, h);
        shape.closePath();
        
        // İç Boşluk (Pahlı)
        const hole = new THREE.Path();
        const iw = w - t;
        const ih = h - t;
        const ib = t; 
        
        hole.moveTo(-iw + chamfer, ib);
        hole.lineTo(iw - chamfer, ib);
        hole.lineTo(iw, ib + chamfer);
        hole.lineTo(iw, ih - chamfer);
        hole.lineTo(iw - chamfer, ih);
        hole.lineTo(-iw + chamfer, ih);
        hole.lineTo(-iw, ih - chamfer);
        hole.lineTo(-iw, ib + chamfer);
        hole.closePath();
        
        shape.holes.push(hole);
        return shape;
    }, []);

    return (
        <group position={position}>
            
            {/* 0. BLOKAJ / ZEMİN İYİLEŞTİRME (Stone Block / Backfill) */}
            <ConstructionElement 
                type="box"
                args={[BARREL_WIDTH + 6, 0.4, TOTAL_LENGTH + (WING_LENGTH * 3.0)]} 
                position={[0, -0.5, 0]} // En dipte
                color={STATUS_COLORS[stoneData.status]}
                label={`${LABELS.stone[language]} (Backfill)`}
                onClick={() => handleClick(stoneData.id)}
            />

            {/* 1. GROBETON (Lean) - Blokajın üzerinde */}
            <ConstructionElement 
                type="box"
                args={[BARREL_WIDTH + 4, 0.2, TOTAL_LENGTH + (WING_LENGTH * 2.5)]} 
                position={[0, -0.2, 0]} 
                color={STATUS_COLORS[leanData.status]}
                label={`${LABELS.stone[language]} (Lean)`}
                onClick={() => handleClick(leanData.id)}
            />

            {/* 2. GÖVDE (Duvarlar + Tabliye aslında, ama burada segment olarak çiziyoruz) */}
            {/* Eğer Tabliye veya Duvarlar seçilirse bu kısım renklenir */}
            <group position={[0, 0, -TOTAL_LENGTH / 2]}>
                {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
                    <group key={i} position={[0, 0, i * SEGMENT_LENGTH]}>
                        <CustomShapeElement 
                            shape={segmentShape}
                            depth={SEGMENT_LENGTH - 0.05} 
                            // Gövde için hem duvar hem tabliye durumunu kontrol edebiliriz, öncelik duvarda
                            color={STATUS_COLORS[wallData.status === 'EMPTY' ? slabData.status : wallData.status]}
                            onClick={() => handleClick(wallData.id || slabData.id)}
                            label={i === Math.floor(SEGMENT_COUNT/2) ? 'Culvert Body' : ''}
                        />
                        {/* Bitüm İzolasyon Çizgisi */}
                        <mesh position={[0, BARREL_HEIGHT/2, SEGMENT_LENGTH - 0.025]}>
                            <boxGeometry args={[BARREL_WIDTH + 0.05, BARREL_HEIGHT + 0.05, 0.05]} />
                            <meshStandardMaterial color="#1f2937" />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 3. GİRİŞ VE ÇIKIŞ YAPILARI */}
            {[1, -1].map((dir) => {
                const zOffset = (TOTAL_LENGTH / 2) * dir;
                
                return (
                    <group key={`end-${dir}`} position={[0, 0, zOffset]} rotation={[0, dir === -1 ? Math.PI : 0, 0]}>
                        
                        {/* A. BAŞLIK KİRİŞİ (HEADWALL) - Duvarlara bağlı */}
                        <ConstructionElement 
                            type="box"
                            args={[BARREL_WIDTH, HEADWALL_HEIGHT, 0.4]} 
                            position={[0, BARREL_HEIGHT + (HEADWALL_HEIGHT/2), 0.2]} 
                            color={STATUS_COLORS[wallData.status]} 
                            onClick={() => handleClick(wallData.id)}
                        />

                        {/* B. APRON (Genişleyen Zemin) - Temele bağlı */}
                        <group rotation={[Math.PI / 2, 0, 0]}> 
                            <CustomShapeElement 
                                shape={apronShape}
                                depth={0.6} 
                                color={STATUS_COLORS[foundationData.status]}
                                onClick={() => handleClick(foundationData.id)}
                            />
                        </group>

                        {/* C. SOL KANAT - Duvarlara bağlı */}
                        <group position={[-BARREL_WIDTH/2, 0, 0]} rotation={[0, Math.PI + FLARE_ANGLE, 0]}>
                            <CustomShapeElement 
                                shape={wingShape}
                                depth={WALL_THICKNESS}
                                color={STATUS_COLORS[wallData.status]}
                                label={dir === 1 ? `${LABELS.wing[language]}` : ''}
                                onClick={() => handleClick(wallData.id)}
                            />
                            {/* Temel Çıkıntısı - Temele bağlı */}
                            <group position={[0, -0.4, 0]}> 
                                <CustomShapeElement 
                                    shape={wingFooterShape}
                                    depth={WALL_THICKNESS + 0.3} 
                                    color={STATUS_COLORS[foundationData.status]}
                                    onClick={() => handleClick(foundationData.id)}
                                />
                            </group>
                        </group>

                        {/* D. SAĞ KANAT */}
                        <group position={[BARREL_WIDTH/2, 0, 0]} rotation={[0, -FLARE_ANGLE, 0]}>
                            <group position={[-WALL_THICKNESS, 0, 0]}>
                                <CustomShapeElement 
                                    shape={wingShape}
                                    depth={WALL_THICKNESS}
                                    color={STATUS_COLORS[wallData.status]}
                                    onClick={() => handleClick(wallData.id)}
                                />
                                <group position={[-0.2, -0.4, 0]}>
                                    <CustomShapeElement 
                                        shape={wingFooterShape}
                                        depth={WALL_THICKNESS + 0.3}
                                        color={STATUS_COLORS[foundationData.status]}
                                        onClick={() => handleClick(foundationData.id)}
                                    />
                                </group>
                            </group>
                        </group>

                        {/* E. DİŞ (CUT-OFF WALL) - Temele bağlı */}
                        <ConstructionElement 
                            type="box"
                            args={[BARREL_WIDTH * 2.2, 1.5, 0.5]} 
                            position={[0, -0.75, WING_LENGTH]} 
                            color={STATUS_COLORS[foundationData.status]}
                            onClick={() => handleClick(foundationData.id)}
                        />

                    </group>
                );
            })}

            {/* Üst Etiket */}
            <Text 
                position={[0, BARREL_HEIGHT + 2, 0]} 
                fontSize={1.2} 
                color="white"
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.1}
                outlineColor="#000"
            >
                {labelPrefix}
            </Text>
        </group>
    );
};