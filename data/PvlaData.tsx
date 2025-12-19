
import type { PVLAIndexConfig, PVLAStructure, PVLAFile, MatrixColumn, ProgressRow } from '../types';

export const DEMO_PVLA_INDICES: { Bridge: PVLAIndexConfig; Culvert: PVLAIndexConfig } = {
    Bridge: { title: { tr: 'Köprüler', en: 'Bridges', ro: 'Poduri' }, description: { tr: 'PVLA İndeks', en: 'PVLA Index', ro: 'Index PVLA' }, fileUrl: '#', lastUpdated: '2025-12-01' },
    Culvert: { title: { tr: 'Menfezler & Alt Geçitler', en: 'Culverts & Underpasses', ro: 'Podețe & Pasaje' }, description: { tr: 'PVLA İndeks', en: 'PVLA Index', ro: 'Index PVLA' }, fileUrl: '#', lastUpdated: '2025-12-17' }
};

// PDF'teki Yapı Listesi
export const DEMO_PVLA_STRUCTURES: PVLAStructure[] = [
    // Bridges (Existing Demo)
    { id: 'b1', name: 'POD01 KM: 4+350', type: 'Bridge', km: 'KM 4+350', path: 'PVLA/Bridges/4+350' },
    { id: 'b2', name: 'POD02 KM: 4+940', type: 'Bridge', km: 'KM 4+940', path: 'PVLA/Bridges/4+940' },
    
    // New Structures from PDF
    { id: 'P003', name: 'P003 (Bretea 1)', type: 'Culvert', km: '1+740', path: 'PVLA/Culverts/P003' },
    { id: 'DG004', name: 'DG004 (Bretea 1)', type: 'Culvert', km: '2+280', path: 'PVLA/Culverts/DG004' },
    { id: 'DG005', name: 'DG005 (Bretea 2)', type: 'Culvert', km: '1+126', path: 'PVLA/Culverts/DG005' },
    { id: 'DG006', name: 'DG006 (Bretea 2)', type: 'Culvert', km: '1+750', path: 'PVLA/Culverts/DG006' },
    { id: 'P09', name: 'P09 (Bretea 4)', type: 'Culvert', km: '0+680', path: 'PVLA/Culverts/P09' },
    { id: 'DG010', name: 'DG010 (Bretea 2)', type: 'Culvert', km: '0+660', path: 'PVLA/Culverts/DG010' },
    { id: 'DG013', name: 'DG013 (Bretea 2)', type: 'Culvert', km: '0+990', path: 'PVLA/Culverts/DG013' },
    { id: 'DG014', name: 'DG014 (Bretea 3)', type: 'Culvert', km: '1+103', path: 'PVLA/Culverts/DG014' },
    { id: 'DG015', name: 'DG015 (Bretea 3)', type: 'Culvert', km: '1+074', path: 'PVLA/Culverts/DG015' },
    { id: 'DG016', name: 'DG016 (Bretea 4)', type: 'Culvert', km: '1+185', path: 'PVLA/Culverts/DG016' },
    { id: 'DG017', name: 'DG017 (Bretea 6)', type: 'Culvert', km: '1+099', path: 'PVLA/Culverts/DG017' },
    { id: 'DG021', name: 'DG021 (Bretea 8)', type: 'Culvert', km: '0+658', path: 'PVLA/Culverts/DG021' },
    { id: 'DG022', name: 'DG022 (Bretea 10)', type: 'Culvert', km: '0+212', path: 'PVLA/Culverts/DG022' },
    { id: 'P23', name: 'P23 (Bretea 10)', type: 'Culvert', km: '0+400', path: 'PVLA/Culverts/P23' },
    { id: 'DG025', name: 'DG025 (Bretea 10)', type: 'Culvert', km: '0+720', path: 'PVLA/Culverts/DG025' },
    { id: 'DG026', name: 'DG026 (Giratorie)', type: 'Culvert', km: 'Giratorie', path: 'PVLA/Culverts/DG026' },
];

export const DEMO_PVLA_FILES: PVLAFile[] = [
    { id: '1', name: '2D-1-T_Signed.pdf', type: 'Bridge', structureId: 'b1', structureName: 'POD01 KM: 4+350', date: '2025-12-01', size: '2.4 MB', path: 'PVLA/Bridges/4+350' },
    { id: '2', name: 'P003-Trasare.pdf', type: 'Culvert', structureId: 'P003', structureName: 'P003 (Bretea 1)', date: '2025-12-10', size: '1.1 MB', path: 'PVLA/Culverts/P003' },
];

// --- COLUMNS DEFINITION ---
export const DEMO_MATRIX_COLUMNS: { Bridge: MatrixColumn[]; Culvert: MatrixColumn[]; } = {
    Bridge: [
        { id: 'pile_set', name: { tr: 'KAZIK APLİK.', en: 'PILE SETTING OUT', ro: 'TRASARE PILOTI' }, group: { tr: 'KAZIK / PILOTI', en: 'PILES', ro: 'PILOȚI' }, type: 'TRASARE' },
        { id: 'exc_verif', name: { tr: 'KAZI KOTU', en: 'EXC. LEVEL', ro: 'COTA SAPATURA' }, group: { tr: 'TEMEL KAZISI', en: 'FOUNDATION EXC.', ro: 'SĂPĂTURĂ FUNDAȚIE' }, type: 'VERIFICARE' },
        { id: 'lean_verif', name: { tr: 'GROBETON', en: 'LEAN CONCRETE', ro: 'BETON EGALIZARE' }, group: { tr: 'GROBETON', en: 'LEAN CONCRETE', ro: 'BETON EGALIZARE' }, type: 'VERIFICARE' },
        { id: 'pile_break', name: { tr: 'KAZIK KIRIM', en: 'PILE BREAKING', ro: 'SPARGERE CAP' }, group: { tr: 'KAZIK İŞLERİ', en: 'PILE WORKS', ro: 'LUCRĂRI PILOȚI' }, type: 'VERIFICARE' },
        { id: 'rebar_verif', name: { tr: 'DONATI', en: 'REBAR', ro: 'ARMATURA' }, group: { tr: 'DONATI / REBAR', en: 'REBAR WORKS', ro: 'ARMATURĂ' }, type: 'VERIFICARE' },
        { id: 'pile_verif', name: { tr: 'KAZIK PV', en: 'PILE VERIF.', ro: 'VERIFICARE PILOTI' }, group: { tr: 'KAZIK KONTROL', en: 'PILE CHECK', ro: 'VERIFICARE PILOȚI' }, type: 'VERIFICARE' },
        { id: 'found_set', name: { tr: 'TEMEL APLİK.', en: 'FOUND. SETTING', ro: 'TRASARE FUNDATIE' }, group: { tr: 'TEMEL BETONU', en: 'FOUNDATION CONC.', ro: 'BETON FUNDAȚIE' }, type: 'TRASARE' },
        { id: 'found_verif', name: { tr: 'TEMEL KOTU', en: 'FOUND. LEVEL', ro: 'VERIF. FUNDATIE' }, group: { tr: 'TEMEL BETONU', en: 'FOUNDATION CONC.', ro: 'BETON FUNDAȚIE' }, type: 'VERIFICARE' },
        { id: 'elev_set', name: { tr: 'ELEV. APLİK.', en: 'ELEV. SETTING', ro: 'TRASARE ELEVATIE' }, group: { tr: 'ELEVASYON', en: 'ELEVATION', ro: 'ELEVAȚIE' }, type: 'TRASARE' },
        { id: 'elev_verif', name: { tr: 'ELEV. KOTU', en: 'ELEV. LEVEL', ro: 'VERIF. ELEVATIE' }, group: { tr: 'ELEVASYON', en: 'ELEVATION', ro: 'ELEVAȚIE' }, type: 'VERIFICARE' },
        { id: 'cap_set', name: { tr: 'BAŞLIK APLİK.', en: 'CAP SETTING', ro: 'TRASARE RIGLA' }, group: { tr: 'BAŞLIK KİRİŞİ', en: 'CAP BEAM', ro: 'RIGLA POD' }, type: 'TRASARE' },
        { id: 'cap_verif', name: { tr: 'BAŞLIK KOTU', en: 'CAP LEVEL', ro: 'VERIF. RIGLA' }, group: { tr: 'BAŞLIK KİRİŞİ', en: 'CAP BEAM', ro: 'RIGLA POD' }, type: 'VERIFICARE' },
    ],
    // --- CULVERT COLUMNS ---
    Culvert: [
        { id: 'c_trasare', name: { tr: 'EKSEN APLİK.', en: 'CENTER SETTING', ro: 'TRASARE CENTRU' }, group: { tr: 'APLİKASYON', en: 'SETTING OUT', ro: 'TRASARE' }, type: 'TRASARE' },
        { id: 'c_fund_level', name: { tr: 'KAZI KOTU', en: 'FOUND. LEVEL', ro: 'COTA FUNDARE' }, group: { tr: 'KAZI / ZEMİN', en: 'EXCAVATION', ro: 'TEREN FUNDARE' }, type: 'VERIFICARE' },
        { id: 'c_extra_exc', name: { tr: 'EKSTRA KAZI', en: 'EXTRA EXC.', ro: 'EXTRA EXCAV.' }, group: { tr: 'KAZI / ZEMİN', en: 'EXCAVATION', ro: 'TEREN FUNDARE' }, type: 'VERIFICARE' },
        { id: 'c_stone_block', name: { tr: 'BLOKAJ KOTU', en: 'STONE BLOCK', ro: 'COTA BLOCAJ' }, group: { tr: 'BLOKAJ', en: 'STONE FILL', ro: 'BLOCAJ PIATRĂ' }, type: 'VERIFICARE' },
        { id: 'c_formwork', name: { tr: 'KALIP KONTROL', en: 'FORMWORK', ro: 'DIM. COFRAJE' }, group: { tr: 'KALIP', en: 'FORMWORK', ro: 'COFRAJE' }, type: 'VERIFICARE' },
        { id: 'c_concrete', name: { tr: 'TEMEL BETON', en: 'FOUND. CONC.', ro: 'BETONARE' }, group: { tr: 'BETON', en: 'CONCRETE', ro: 'FUNDAȚIE' }, type: 'VERIFICARE' },
        { id: 'c_slope', name: { tr: 'GROBETON/EĞİM', en: 'SLOPE CONC.', ro: 'BETON PANTA' }, group: { tr: 'GROBETON', en: 'LEAN CONCRETE', ro: 'BETON PANTĂ' }, type: 'VERIFICARE' },
        { id: 'c_hydro', name: { tr: 'İZOLASYON', en: 'HYDRO INSUL.', ro: 'HIDROIZOLATIE' }, group: { tr: 'YALITIM', en: 'INSULATION', ro: 'PROTECTIE' }, type: 'VERIFICARE' },
        { id: 'c_drain', name: { tr: 'DRENAJ', en: 'DRAINAGE', ro: 'DREN' }, group: { tr: 'DRENAJ', en: 'DRAINAGE', ro: 'CALITATE DREN' }, type: 'VERIFICARE' },
        { id: 'c_mattress', name: { tr: 'TAŞ DOLGU', en: 'STONE MAT.', ro: 'SALTEA PIATRA' }, group: { tr: 'PERE', en: 'RIPRAP', ro: 'SALTEA' }, type: 'VERIFICARE' },
        { id: 'c_chambers', name: { tr: 'DÜŞÜ HAVUZU', en: 'DROP CHAMBER', ro: 'CAMERE CADERE' }, group: { tr: 'SANAT YAPISI', en: 'STRUCTURE', ro: 'CAMERE' }, type: 'VERIFICARE' },
    ]
};

// Helper for Bridge Rows (Ensuring Order)
const createBridgeRows = (structId: string): ProgressRow[] => {
    const locations = [];
    // Creating rows in Correct KM Order: C1 (Start) -> P1...P12 -> C2 (End)
    // Left (ST) and Right (DR) variants for each
    locations.push({ loc: 'C1', type: 'DR' });
    locations.push({ loc: 'C1', type: 'ST' });
    for (let i = 1; i <= 12; i++) {
        locations.push({ loc: `P${i}`, type: 'DR' });
        locations.push({ loc: `P${i}`, type: 'ST' });
    }
    locations.push({ loc: 'C2', type: 'DR' });
    locations.push({ loc: 'C2', type: 'ST' });

    return locations.map((l, idx) => ({
        id: `${structId}_row_${idx}`,
        structureId: structId,
        location: l.loc,
        foundationType: l.type,
        orderIndex: idx, // Important: Ensures visual order in 3D
        cells: {
            'pile_set': { code: `2D-1/T`, status: idx < 10 ? 'SIGNED' : 'PENDING' },
            'exc_verif': { code: `2D-2/V`, status: idx < 8 ? 'SIGNED' : 'EMPTY' },
            'lean_verif': { code: `2D-3/V`, status: idx < 8 ? 'SIGNED' : 'EMPTY' },
            'pile_break': { code: `2D-4/V`, status: idx < 6 ? 'SIGNED' : 'EMPTY' },
            'rebar_verif': { code: `2D-5/V`, status: idx < 6 ? 'SIGNED' : 'EMPTY' },
            'pile_verif': { code: `2D-1/V`, status: idx < 6 ? 'SIGNED' : 'EMPTY' },
            'found_set': { code: `2D-6/T`, status: idx < 4 ? 'SIGNED' : 'PREPARING' },
            'found_verif': { code: `2D-6/V`, status: idx < 4 ? 'SIGNED' : 'EMPTY' },
            'elev_set': { code: `2D-7/T`, status: idx < 2 ? 'SIGNED' : 'EMPTY' },
            'elev_verif': { code: `2D-7/V`, status: idx < 2 ? 'SIGNED' : 'EMPTY' },
            'cap_set': { code: `2D-8/T`, status: 'EMPTY' },
            'cap_verif': { code: `2D-8/V`, status: 'EMPTY' }
        }
    }));
};

// Helper for Culvert Rows
const createCulvertRows = (): ProgressRow[] => {
    // List from PDF
    const list = [
        { id: 'P003', code: 'P003' }, { id: 'DG004', code: 'DG004' }, { id: 'DG005', code: 'DG005' },
        { id: 'DG006', code: 'DG006' }, { id: 'P09', code: 'P09' }, { id: 'DG010', code: 'DG010' },
        { id: 'DG013', code: 'DG013' }, { id: 'DG014', code: 'DG014' }, { id: 'DG015', code: 'DG015' },
        { id: 'DG016', code: 'DG016' }, { id: 'DG017', code: 'DG017' }, { id: 'DG021', code: 'DG021' },
        { id: 'DG022', code: 'DG022' }, { id: 'P23', code: 'P23' }, { id: 'DG025', code: 'DG025' },
        { id: 'DG026', code: 'DG026' }
    ];

    return list.map((item, idx) => ({
        id: `${item.id}_row`,
        structureId: item.id,
        location: 'GENEL',
        foundationType: 'MAIN',
        orderIndex: idx, // Visual Order
        cells: {
            'c_trasare': { code: `${item.code}/T/STR`, status: 'SIGNED' },
            'c_fund_level': { code: `${item.code}-1/T/STR`, status: 'SIGNED' },
            'c_extra_exc': { code: `${item.code}-2/T/STR`, status: 'PREPARING' },
            'c_stone_block': { code: `${item.code}-3/T/STR`, status: 'PREPARING' },
            'c_formwork': { code: `${item.code}-4/T/STR`, status: 'EMPTY' },
            'c_concrete': { code: `${item.code}-5/T/STR`, status: 'EMPTY' },
            'c_slope': { code: `${item.code}-6/T/STR`, status: 'EMPTY' },
            'c_hydro': { code: `${item.code}-7/T/STR`, status: 'EMPTY' },
            'c_drain': { code: `${item.code}-8/T/STR`, status: 'EMPTY' },
            'c_mattress': { code: `${item.code}-9/T/STR`, status: 'EMPTY' },
            'c_chambers': { code: `${item.code}-10/T/STR`, status: 'EMPTY' },
        }
    }));
}

export const DEMO_MATRIX_ROWS: ProgressRow[] = [
    ...createBridgeRows('b1'),
    ...createBridgeRows('b2'),
    ...createCulvertRows()
];
