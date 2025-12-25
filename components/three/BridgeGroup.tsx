// @FIX: Add react-three-fiber types reference to fix JSX intrinsic element errors.
/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ConstructionElement } from './ConstructionElement';
import { STATUS_COLORS, LABELS, MAPPING_KEYWORDS } from './constants';
import { ProgressRow, Language, MatrixCell, MatrixColumn } from '../../types';

interface BridgeGroupProps {
    row: ProgressRow;
    columns: MatrixColumn[];
    position: [number, number, number];
    onElementClick: (rowId: string, colId: string, cell: MatrixCell) => void;
    language: Language;
    isLast?: boolean;
}

export const BridgeGroup: React.FC<BridgeGroupProps> = ({ row, columns, position, onElementClick, language, isLast }) => {
    
    const direction = row.direction || 'C'; 
    const isCenter = direction === 'C'; 
    
    // --- AKILLI SÜTUN EŞLEŞTİRME ---
    const { pileId, foundId, capId, elevId, leanId, excId, platformId, bearingId, plateId, girderId, deckId } = useMemo(() => {
        
        const findBestColumn = (config: { groups: string[], columns: string[] }) => {
            let relevantColumns = columns.filter(c => {
                const groupName = (c.group.tr + ' ' + c.group.en).toLowerCase();
                return config.groups.some(g => groupName.includes(g));
            });

            const verifColumns = relevantColumns.filter(c => c.type === 'VERIFICARE');
            if (verifColumns.length > 0) relevantColumns = verifColumns;

            if (relevantColumns.length === 0) {
                const fallbackMatch = columns.find(c => {
                    const colName = (c.name.tr + ' ' + c.name.en).toLowerCase();
                    return c.type === 'VERIFICARE' && config.columns.some(k => colName.includes(k));
                });
                return fallbackMatch ? fallbackMatch.id : undefined;
            }

            const priorityMatch = relevantColumns.find(c => {
                const colName = (c.name.tr + ' ' + c.name.en).toLowerCase();
                return config.columns.some(k => colName.includes(k));
            });

            if (priorityMatch) return priorityMatch.id;

            const genericMatch = relevantColumns.find(c => {
                const colName = (c.name.tr + ' ' + c.name.en).toLowerCase();
                return colName.includes('- v') || colName.includes(' -v') || colName.includes('beton');
            });

            return genericMatch ? genericMatch.id : relevantColumns[relevantColumns.length - 1].id;
        };

        return {
            platformId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.PLATFORM),
            pileId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.PILE),
            excId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.EXCAVATION),
            leanId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.LEAN),       
            foundId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.FOUNDATION),
            elevId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.ELEVATION),
            capId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.CAP),
            bearingId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.BEARING),
            plateId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.PLATE),
            girderId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.GIRDER),
            deckId: findBestColumn(MAPPING_KEYWORDS.BRIDGE.DECK)
        };
    }, [columns]);

    const getCell = (colId: string | undefined) => colId ? row.cells[colId] : undefined;

    const pileCell = getCell(pileId);
    const foundCell = getCell(foundId);
    const capCell = getCell(capId);
    const elevCell = getCell(elevId);
    const leanCell = getCell(leanId);
    const excCell = getCell(excId);
    const platformCell = getCell(platformId);
    const bearingCell = getCell(bearingId);
    const plateCell = getCell(plateId);
    const girderCell = getCell(girderId);
    const deckCell = getCell(deckId);

    const emptyCell: MatrixCell = { code: '-', status: 'EMPTY' };

    const handleClick = (colId: string | undefined, cell: MatrixCell | undefined) => {
        if (colId) {
            onElementClick(row.id, colId, cell || emptyCell);
        }
    };

    // --- GEOMETRİ AYARLARI ---
    const PILE_H = 6;
    const FOUND_H = 1.5;
    const ELEV_H = 6;
    const CAP_H = 1.8;

    const FOUND_W = isCenter ? 14 : 7; 
    const CAP_W = isCenter ? 16 : 8; 
    const FOUND_D = 6; 

    const LEAN_H = 0.2;
    const LEAN_W = FOUND_W + 0.2;
    const LEAN_D = FOUND_D + 0.2; 

    // DETAY AYARLARI (Technical Drawings)
    const PEDESTAL_H = 0.15; 
    const PEDESTAL_SIZE = 0.7; 
    const BEARING_H = 0.1;   
    const BEARING_SIZE = 0.5; 
    const PLATE_H = 0.05;    
    
    // --- YENİ: Çift Sıra Mesnet Ayarları ---
    // Başlık kirişi üzerinde iki sıra mesnet var (İleri ve Geri aksı)
    const BEARING_ROW_OFFSET = 0.6; // Merkezden 60cm ileri ve geri

    // Deprem takozu (Seismic Block / Opritor)
    const BLOCK_H = 0.6;
    const BLOCK_W = 0.5;
    const BLOCK_D = 0.8; // Biraz daha daraltıldı, iki mesnet arası sığsın

    // Kiriş (Girder)
    const GIRDER_H = 1.2; 
    const GIRDER_W = 0.8; 
    const SPAN_LENGTH = 24; 

    // Kiriş Sayısı ve Yerleşimi
    const girderCount = isCenter ? 8 : 4; 
    const spacing = CAP_W / (girderCount + 0.5);

    // Yükseklik Seviyeleri (Stacking)
    const BASE_Y = LEAN_H + FOUND_H + ELEV_H + CAP_H; // Başlık üst kotu
    const PEDESTAL_Y = BASE_Y + PEDESTAL_H/2;
    const BEARING_Y = BASE_Y + PEDESTAL_H + BEARING_H/2;
    const PLATE_Y = BASE_Y + PEDESTAL_H + BEARING_H + PLATE_H/2; 
    const BLOCK_Y = BASE_Y + BLOCK_H/2;
    const GIRDER_Y = BASE_Y + PEDESTAL_H + BEARING_H + PLATE_H + GIRDER_H/2; 
    const DECK_Y = GIRDER_Y + GIRDER_H/2 + 0.15;

    // KAZI AYARLARI
    const EXC_H = FOUND_H + LEAN_H; 
    const WORKING_SPACE = 1.0; 
    const EXC_BOT_W = FOUND_W + (WORKING_SPACE * 2);
    const EXC_BOT_D = FOUND_D + (WORKING_SPACE * 2);
    const EXC_TOP_W = EXC_BOT_W + (EXC_H * 2); 
    const EXC_TOP_D = EXC_BOT_D + (EXC_H * 2);

    // PLATFORM AYARLARI
    const PLAT_W = EXC_TOP_W + 3; 
    const PLAT_D = EXC_TOP_D + 3; 

    const excavationGeometry = useMemo(() => {
        const h = EXC_H;
        const wb = EXC_BOT_W / 2;
        const db = EXC_BOT_D / 2;
        const wt = EXC_TOP_W / 2;
        const dt = EXC_TOP_D / 2;

        const positions = [
            -wb, 0,  db,  wb, 0,  db,  wb, 0, -db, -wb, 0, -db,
            -wt, h,  dt,  wt, h,  dt,  wt, h, -dt, -wt, h, -dt
        ];
        
        const indices = [
            0, 2, 1,  0, 3, 2, 
            4, 5, 6,  4, 6, 7, 
            0, 1, 5,  0, 5, 4, 
            1, 2, 6,  1, 6, 5, 
            2, 3, 7,  2, 7, 6, 
            3, 0, 4,  3, 4, 7  
        ];

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions.flat(), 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
    }, [EXC_H, EXC_BOT_W, EXC_BOT_D, EXC_TOP_W, EXC_TOP_D]);

    const renderPiles = () => {
        const pileCountX = isCenter ? 3 : 2;
        const pileCountZ = 2;
        const spacingX = FOUND_W / (pileCountX + 0.5);
        const spacingZ = FOUND_D / (pileCountZ + 1);
        
        const piles = [];
        for(let ix=0; ix<pileCountX; ix++) {
            for(let iz=0; iz<pileCountZ; iz++) {
                 const px = (ix - (pileCountX-1)/2) * spacingX;
                 const pz = (iz - (pileCountZ-1)/2) * spacingZ;
                 piles.push(
                     <ConstructionElement 
                        key={`pile-${ix}-${iz}`}
                        type="cylinder"
                        args={[0.5, 0.5, PILE_H, 16]}
                        position={[px, -PILE_H/2, pz]}
                        color={STATUS_COLORS[pileCell?.status || 'EMPTY']}
                        onClick={() => handleClick(pileId, pileCell)}
                     />
                 );
            }
        }
        return <group>{piles}</group>;
    };

    const renderElevation = () => {
        const isPier = row.foundationType === 'PIER';
        if (isPier) {
            const colDist = FOUND_W / 4;
            return (
                <group>
                    <ConstructionElement 
                        type="cylinder"
                        args={[0.8, 0.8, ELEV_H, 16]}
                        position={[-colDist, LEAN_H + FOUND_H + ELEV_H/2, 0]}
                        color={STATUS_COLORS[elevCell?.status || 'EMPTY']}
                        label={LABELS.colL[language]}
                        onClick={() => handleClick(elevId, elevCell)}
                    />
                     <ConstructionElement 
                        type="cylinder"
                        args={[0.8, 0.8, ELEV_H, 16]}
                        position={[colDist, LEAN_H + FOUND_H + ELEV_H/2, 0]}
                        color={STATUS_COLORS[elevCell?.status || 'EMPTY']}
                        label={LABELS.colR[language]}
                        onClick={() => handleClick(elevId, elevCell)}
                    />
                </group>
            );
        } else {
             return (
                <ConstructionElement 
                    type="box"
                    args={[FOUND_W * 0.8, ELEV_H, 1.5]}
                    position={[0, LEAN_H + FOUND_H + ELEV_H/2, 0]}
                    color={STATUS_COLORS[elevCell?.status || 'EMPTY']}
                    label={LABELS.wall[language]}
                    onClick={() => handleClick(elevId, elevCell)}
                />
             );
        }
    };

    const renderSuperstructure = () => {
        const items = [];
        
        for (let i = 0; i < girderCount; i++) {
            const px = (i - (girderCount - 1) / 2) * spacing;
            
            // --- BACKWARD BEARING ROW (Önceki açıklıktan gelen kirişler için) ---
            // 1. Pedestal (Back)
            items.push(
                <mesh key={`pedestal-b-${i}`} position={[px, PEDESTAL_Y, -BEARING_ROW_OFFSET]} onClick={(e) => { e.stopPropagation(); handleClick(bearingId, bearingCell); }}>
                    <boxGeometry args={[PEDESTAL_SIZE, PEDESTAL_H, PEDESTAL_SIZE]} />
                    <meshStandardMaterial color={STATUS_COLORS[bearingCell?.status || 'EMPTY']} />
                </mesh>
            );
            // 2. Bearing (Back)
            items.push(
                <mesh key={`bearing-b-${i}`} position={[px, BEARING_Y, -BEARING_ROW_OFFSET]} onClick={(e) => { e.stopPropagation(); handleClick(bearingId, bearingCell); }}>
                    <boxGeometry args={[BEARING_SIZE, BEARING_H, BEARING_SIZE]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            );
            // 3. Plate (Back)
            items.push(
                <ConstructionElement
                    key={`plate-b-${i}`}
                    type="box"
                    args={[BEARING_SIZE + 0.1, PLATE_H, BEARING_SIZE + 0.1]}
                    position={[px, PLATE_Y, -BEARING_ROW_OFFSET]}
                    color={STATUS_COLORS[plateCell?.status || 'EMPTY']}
                    onClick={() => handleClick(plateId, plateCell)}
                />
            );

            // --- FORWARD BEARING ROW (Bu açıklıktan giden kirişler için) ---
            // 1. Pedestal (Forward)
            items.push(
                <mesh key={`pedestal-f-${i}`} position={[px, PEDESTAL_Y, BEARING_ROW_OFFSET]} onClick={(e) => { e.stopPropagation(); handleClick(bearingId, bearingCell); }}>
                    <boxGeometry args={[PEDESTAL_SIZE, PEDESTAL_H, PEDESTAL_SIZE]} />
                    <meshStandardMaterial color={STATUS_COLORS[bearingCell?.status || 'EMPTY']} />
                </mesh>
            );
            // 2. Bearing (Forward)
            items.push(
                <mesh key={`bearing-f-${i}`} position={[px, BEARING_Y, BEARING_ROW_OFFSET]} onClick={(e) => { e.stopPropagation(); handleClick(bearingId, bearingCell); }}>
                    <boxGeometry args={[BEARING_SIZE, BEARING_H, BEARING_SIZE]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            );
            // 3. Plate (Forward)
            items.push(
                <ConstructionElement
                    key={`plate-f-${i}`}
                    type="box"
                    args={[BEARING_SIZE + 0.1, PLATE_H, BEARING_SIZE + 0.1]}
                    position={[px, PLATE_Y, BEARING_ROW_OFFSET]}
                    color={STATUS_COLORS[plateCell?.status || 'EMPTY']}
                    onClick={() => handleClick(plateId, plateCell)}
                />
            );

            // --- GIRDER (KİRİŞ) ---
            // Kiriş, "İleri" (Forward) mesnetin üzerine oturur ve ileri doğru uzanır.
            // Havada durmaması için Z pozisyonunu ileri mesnete hizalıyoruz.
            // Kiriş boyu: SPAN_LENGTH
            // Başlangıç: +BEARING_ROW_OFFSET
            // Merkez: BEARING_ROW_OFFSET + (SPAN_LENGTH / 2)
            items.push(
                <ConstructionElement 
                    key={`girder-${i}`}
                    type="box"
                    args={[GIRDER_W, GIRDER_H, SPAN_LENGTH]} 
                    position={[px, GIRDER_Y, BEARING_ROW_OFFSET + (SPAN_LENGTH / 2)]} 
                    color={STATUS_COLORS[girderCell?.status || 'EMPTY']}
                    onClick={() => handleClick(girderId, girderCell)}
                />
            );

            // --- SEISMIC BLOCK (OPRITOR) ---
            // Kirişlerin arasında, iki mesnet sırasının ortasında (Z=0)
            if (i < girderCount - 1) {
                const midX = px + spacing / 2;
                items.push(
                    <ConstructionElement
                        key={`block-${i}`}
                        type="box"
                        args={[BLOCK_W, BLOCK_H, BLOCK_D]}
                        position={[midX, BLOCK_Y, 0]} 
                        color={STATUS_COLORS[capCell?.status || 'EMPTY']}
                        onClick={() => handleClick(capId, capCell)}
                    />
                );
            }
        }

        // 6. Deck Slab - Covers the forward span
        items.push(
            <ConstructionElement
                key="deck"
                type="box"
                args={[CAP_W, 0.25, SPAN_LENGTH]}
                position={[0, DECK_Y, BEARING_ROW_OFFSET + (SPAN_LENGTH / 2)]}
                color={STATUS_COLORS[deckCell?.status || 'EMPTY']}
                label={LABELS.deck[language]}
                onClick={() => handleClick(deckId, deckCell)}
            />
        );

        return <group>{items}</group>;
    };

    return (
        <group position={position}>
            {/* 0. PLATFORM (Resized) */}
            <mesh 
                position={[0, EXC_H, 0]} 
                rotation={[-Math.PI/2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); handleClick(platformId, platformCell); }}
            >
                <planeGeometry args={[PLAT_W, PLAT_D]} />
                <meshStandardMaterial 
                    color={platformCell && platformCell.status !== 'EMPTY' ? STATUS_COLORS[platformCell.status] : "#64748b"} 
                    transparent 
                    opacity={platformCell && platformCell.status !== 'EMPTY' ? 0.6 : 0.15} 
                    side={THREE.DoubleSide} 
                />
            </mesh>
            <Text position={[PLAT_W/2 - 2, EXC_H + 0.1, PLAT_D/2 - 2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color={platformCell && platformCell.status !== 'EMPTY' ? STATUS_COLORS[platformCell.status] : "#94a3b8"}>
                {LABELS.platform[language]}
            </Text>

            {/* 1. KAZI (DEFAULT COLOR FIXED: STATUS_COLORS.EMPTY) */}
            <group>
                <mesh geometry={excavationGeometry} position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); handleClick(excId, excCell); }}>
                    <meshStandardMaterial 
                        color={excCell && excCell.status !== 'EMPTY' ? STATUS_COLORS[excCell.status] : STATUS_COLORS.EMPTY} 
                        transparent 
                        opacity={excCell && excCell.status !== 'EMPTY' ? 0.3 : 0.1} 
                        side={THREE.BackSide} 
                        depthWrite={false} 
                    />
                </mesh>
                <mesh geometry={excavationGeometry} position={[0, 0, 0]} pointerEvents="none">
                     <meshBasicMaterial color={excCell && excCell.status !== 'EMPTY' ? STATUS_COLORS[excCell.status] : STATUS_COLORS.EMPTY} wireframe={true} transparent opacity={0.3} />
                </mesh>
                {excCell && excCell.status !== 'EMPTY' && <Text position={[EXC_TOP_W/2 + 1, EXC_H, 0]} fontSize={0.4} color={STATUS_COLORS[excCell.status]}>{LABELS.excavation[language]}</Text>}
            </group>

            {/* 2. KAZIKLAR */}
            {renderPiles()}

            {/* 3. GROBETON */}
            <ConstructionElement type="box" args={[LEAN_W, LEAN_H, LEAN_D]} position={[0, LEAN_H/2, 0]} color={STATUS_COLORS[leanCell?.status || 'EMPTY']} label={`${LABELS.lean[language]}`} onClick={() => handleClick(leanId, leanCell)} />

            {/* 4. TEMEL */}
            <ConstructionElement type="box" args={[FOUND_W, FOUND_H, FOUND_D]} position={[0, LEAN_H + FOUND_H/2, 0]} color={STATUS_COLORS[foundCell?.status || 'EMPTY']} label={`${LABELS.foundation[language]}`} onClick={() => handleClick(foundId, foundCell)} />

            {/* 5. ELEVASYON */}
            {renderElevation()}

            {/* 6. BAŞLIK KİRİŞİ */}
            <ConstructionElement type="box" args={[CAP_W, CAP_H, 2.5]} position={[0, LEAN_H + FOUND_H + ELEV_H + CAP_H/2, 0]} color={STATUS_COLORS[capCell?.status || 'EMPTY']} label={LABELS.cap[language]} onClick={() => handleClick(capId, capCell)} />

            {/* 7. ÜST YAPI (MESNETLER, PLAKALAR, KİRİŞLER...) */}
            {renderSuperstructure()}

            {/* 8. ETİKET */}
            <Text position={[0, 0.1, FOUND_D/2 + 2.5]} rotation={[-Math.PI/2, 0, 0]} fontSize={1.2} color="white" anchorX="center" anchorY="top">
                {row.location}
            </Text>
        </group>
    );
};
