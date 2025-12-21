
import React from 'react';
import { Text } from '@react-three/drei';
import { ConstructionElement } from './ConstructionElement';
import { STATUS_COLORS, LABELS } from './constants';
import { ProgressRow, Language } from '../../types';

interface BridgeGroupProps {
    row: ProgressRow;
    position: [number, number, number];
    onElementClick: (rowId: string, colId: string) => void;
    language: Language;
    isLast?: boolean;
}

export const BridgeGroup: React.FC<BridgeGroupProps> = ({ row, position, onElementClick, language, isLast }) => {
    // Matris verisinden durumları çek
    const pileStatus = row.cells['pile_verif']?.status || 'EMPTY';
    const foundationStatus = row.cells['found_verif']?.status || 'EMPTY';
    const elevationStatus = row.cells['elev_verif']?.status || 'EMPTY';
    const capStatus = row.cells['cap_verif']?.status || 'EMPTY';

    const isAbutment = row.location.startsWith('C') || row.location.startsWith('A'); 
    const labelPrefix = `${row.location}-${row.foundationType}`;

    // --- GEOMETRİK SABİTLER ---
    const PILE_HEIGHT = 6;
    const PILE_RADIUS = 0.5;
    const F_WIDTH = 6;
    const F_HEIGHT = 1.5;
    const F_DEPTH = 8;
    const E_HEIGHT = 5;
    const C_WIDTH = 7;
    const C_HEIGHT = 1.5;
    const C_DEPTH = 3;

    // --- KİRİŞ (BEAM) AYARLARI ---
    const SPAN_LENGTH = 20; // İki ayak arası merkezden merkeze mesafe
    const EXPANSION_GAP = 0.35; // Derz Boşluğu (35 cm) - Görsel olarak net ayrım için
    const ACTUAL_SPAN = SPAN_LENGTH - EXPANSION_GAP; // Net Kiriş Boyu

    const BEAM_HEIGHT = 1.2;
    const BEAM_WIDTH = 0.6;
    const BEAM_COUNT = 5;
    const DECK_THICKNESS = 0.3;
    const DECK_WIDTH = C_WIDTH + 1; // Platform genişliği

    // Yükseklik Hesapları
    const capTopY = F_HEIGHT + E_HEIGHT + C_HEIGHT; // Başlık üst kotu
    
    // Kirişler (Beams)
    // Başlık kirişinin üzerinden başlar.
    const beamCenterY = capTopY + BEAM_HEIGHT/2;
    // Döşeme (Deck)
    // Kirişlerin üzerinden başlar.
    const deckCenterY = capTopY + BEAM_HEIGHT + DECK_THICKNESS/2;

    const beams = [];
    if (!isLast) {
        // Kiriş Rengi: Başlık tamamlandıysa beton, yoksa koyu (gölge gibi)
        const beamColor = capStatus === 'SIGNED' ? '#cbd5e1' : '#1e293b';
        
        const spacing = (C_WIDTH - 1.5) / (BEAM_COUNT - 1);
        const startX = -((C_WIDTH - 1.5) / 2);

        for(let i=0; i<BEAM_COUNT; i++) {
            beams.push(
                <mesh key={`beam-${i}`} position={[startX + i * spacing, beamCenterY, -SPAN_LENGTH/2]}>
                    <boxGeometry args={[BEAM_WIDTH, BEAM_HEIGHT, ACTUAL_SPAN]} />
                    <meshStandardMaterial color={beamColor} roughness={0.7} />
                </mesh>
            );
        }
    }

    // Kazık Pozisyonları
    const piles = [];
    const pileXSpacing = F_WIDTH / 2.5;
    const pileZSpacing = F_DEPTH / 3.5;

    for(let x=-1; x<=1; x+=2) {
        for(let z=-1; z<=1; z++) {
            piles.push(
                <ConstructionElement 
                    key={`pile-${x}-${z}`}
                    type="cylinder"
                    args={[PILE_RADIUS, PILE_RADIUS, PILE_HEIGHT, 16]}
                    position={[x * pileXSpacing, -PILE_HEIGHT/2, z * pileZSpacing * 2]}
                    color={STATUS_COLORS[pileStatus]}
                    label={`${LABELS.pile[language]} (${labelPrefix})`}
                    onClick={() => onElementClick(row.id, 'pile_verif')}
                />
            );
        }
    }

    return (
        <group position={position}>
            {/* 1. KAZIKLAR */}
            <group position={[0, -0.2, 0]}>
                {piles}
            </group>

            {/* 2. TEMEL */}
            <ConstructionElement 
                type="box"
                args={[F_WIDTH, F_HEIGHT, F_DEPTH]}
                position={[0, F_HEIGHT/2, 0]} 
                color={STATUS_COLORS[foundationStatus]}
                label={`${LABELS.foundation[language]} (${labelPrefix})`}
                onClick={() => onElementClick(row.id, 'found_verif')}
            />

            {/* 3. ELEVASYON */}
            {isAbutment ? (
                <ConstructionElement 
                    type="box"
                    args={[F_WIDTH * 0.9, E_HEIGHT, 1.5]}
                    position={[0, F_HEIGHT + E_HEIGHT/2, 0]}
                    color={STATUS_COLORS[elevationStatus]}
                    label={`${LABELS.wall[language]} (${labelPrefix})`}
                    onClick={() => onElementClick(row.id, 'elev_verif')}
                />
            ) : (
                <group>
                    <ConstructionElement 
                        type="cylinder"
                        args={[0.8, 0.8, E_HEIGHT, 32]}
                        position={[-1.5, F_HEIGHT + E_HEIGHT/2, 0]}
                        color={STATUS_COLORS[elevationStatus]}
                        label={`${LABELS.colL[language]} (${labelPrefix})`}
                        onClick={() => onElementClick(row.id, 'elev_verif')}
                    />
                    <ConstructionElement 
                        type="cylinder"
                        args={[0.8, 0.8, E_HEIGHT, 32]}
                        position={[1.5, F_HEIGHT + E_HEIGHT/2, 0]}
                        color={STATUS_COLORS[elevationStatus]}
                        label={`${LABELS.colR[language]} (${labelPrefix})`}
                        onClick={() => onElementClick(row.id, 'elev_verif')}
                    />
                </group>
            )}

            {/* 4. BAŞLIK KİRİŞİ */}
            <ConstructionElement 
                type="box"
                args={[C_WIDTH, C_HEIGHT, C_DEPTH]}
                position={[0, F_HEIGHT + E_HEIGHT + C_HEIGHT/2, 0]}
                color={STATUS_COLORS[capStatus]}
                label={`${LABELS.cap[language]} (${labelPrefix})`}
                onClick={() => onElementClick(row.id, 'cap_verif')}
            />

            {/* 5. PREFABRİK KİRİŞLER (BEAMS) - Bağımsız Aralıklar */}
            {beams}

            {/* 6. YOL DÖŞEMESİ (DECK) - Kiriş boyunda kesilmiş */}
            {!isLast && (
                <mesh position={[0, deckCenterY, -SPAN_LENGTH/2]}>
                    <boxGeometry args={[DECK_WIDTH, DECK_THICKNESS, ACTUAL_SPAN]} />
                    <meshStandardMaterial color="#374151" roughness={0.9} /> {/* Asfalt Rengi */}
                </mesh>
            )}
            
            {/* Lokasyon Etiketi */}
            <Text 
                position={[0, 0.1, F_DEPTH/2 + 2]} 
                rotation={[-Math.PI/2, 0, 0]} 
                fontSize={1.2} 
                color="white"
                anchorX="center"
                anchorY="top"
            >
                {labelPrefix}
            </Text>
        </group>
    );
};