
import { MatrixStatus, Language } from '../../types';

// --- RENK PALETİ (PVLA Statüleri ile Eşleşir) ---
export const STATUS_COLORS: Record<MatrixStatus, string> = {
    EMPTY: '#334155',      // Slate-700 (Başlanmadı)
    PREPARING: '#fbbf24',  // Amber-400 (Hazırlanıyor)
    PENDING: '#3b82f6',    // Blue-500 (Onay Bekliyor)
    SIGNED: '#10b981',     // Emerald-500 (Tamamlandı)
    REJECTED: '#ef4444'    // Red-500 (Red)
};

// --- DİL ETİKETLERİ ---
export const LABELS: Record<string, Record<Language, string>> = {
    // Bridge Labels
    pile: { tr: 'Kazık', en: 'Pile', ro: 'Pilot' },
    foundation: { tr: 'Temel', en: 'Foundation', ro: 'Fundație' },
    wall: { tr: 'Perde', en: 'Wall', ro: 'Perete' },
    colL: { tr: 'Kolon L', en: 'Column L', ro: 'Coloană S' },
    colR: { tr: 'Kolon R', en: 'Column R', ro: 'Coloană D' },
    cap: { tr: 'Başlık', en: 'Cap Beam', ro: 'Rigla' },
    bearing: { tr: 'Mesnet', en: 'Bearing', ro: 'Aparat Reazem' },
    plate: { tr: 'Plaka', en: 'Plate', ro: 'Placă' }, // NEW
    girder: { tr: 'Kiriş', en: 'Girder', ro: 'Grinda' },
    deck: { tr: 'Tabliye', en: 'Deck Slab', ro: 'Placă Suprabetonare' },
    lean: { tr: 'Grobeton', en: 'Lean Concrete', ro: 'Beton Egalizare' },
    excavation: { tr: 'Temel Kazısı', en: 'Excavation', ro: 'Săpătură' },
    platform: { tr: 'Platform', en: 'Platform', ro: 'Platformă' },
    // Culvert Labels
    stone: { tr: 'Blokaj', en: 'Stone Block', ro: 'Blocaj Piatră' },
    culvert_found: { tr: 'Radye Temel', en: 'Raft Found.', ro: 'Radier' },
    culvert_wall: { tr: 'Duvarlar', en: 'Walls', ro: 'Pereți' },
    culvert_top: { tr: 'Üst Döşeme', en: 'Top Slab', ro: 'Placă' },
    wing: { tr: 'Kanat/Havuz', en: 'Wing/Chamber', ro: 'Aripi/Camere' }
};

// --- AKILLI SÜTUN EŞLEŞTİRME ANAHTAR KELİMELERİ ---
export const MAPPING_KEYWORDS = {
    PRIORITY_TYPES: ['beton', 'concrete', '- v', ' -v', 'döküm', 'pour', 'stage 2'],
    BRIDGE: {
        // 1. PLATFORM (Öncelikli Eşleşme: "Platform - V")
        PLATFORM: {
            groups: ['platform', 'zemin', 'toprak', 'earthworks'],
            columns: ['platform - v', 'platform', 'working platform']
        },
        // 2. KAZIK İŞLERİ
        PILE: { 
            groups: ['kazık', 'pile', 'pilot'], 
            columns: ['kazık - v', 'pile - v', 'beton', 'concrete', 'kazık kırım', 'breaking'] 
        },
        // 3. TEMEL KAZISI
        EXCAVATION: {
            groups: ['temel', 'foundation', 'fundatie', 'kazı', 'excavation'],
            columns: ['temel kazısı', 'kazı', 'excavation', 'sapatura']
        },
        // 4. GROBETON
        LEAN: {
            groups: ['temel', 'foundation', 'fundatie', 'grobeton'],
            columns: ['grobeton', 'lean', 'egalizare']
        },
        // 5. TEMEL BETONU
        FOUNDATION: { 
            groups: ['temel', 'foundation', 'fundatie'], 
            columns: ['temel - v', 'foundation - v', 'beton', 'concrete'] 
        },
        // 6. ELEVASYON
        ELEVATION: { 
            groups: ['elevasyon', 'elevation', 'elevatie', 'duvar', 'wall'], 
            columns: ['elevasyon - v', 'elevation - v', 'perde duvarı - v', 'beton', 'concrete'] 
        },
        // 7. BAŞLIK
        CAP: { 
            groups: ['başlık', 'baslik', 'abutment', 'rigla', 'cap'], 
            columns: ['başlık', 'rigla pod - v', 'beton', 'concrete'] 
        },
        // 8. MESNET (NEOPREN)
        BEARING: {
            groups: ['mesnet', 'bearing', 'aparat', 'reazem'],
            columns: ['mesnet', 'bearing', 'neopren', 'reazem']
        },
        // 9. PLAKA (PLATE) - NEW
        PLATE: {
            groups: ['mesnet', 'bearing', 'aparat', 'reazem'], // Mesnet grubunda aranır
            columns: ['plaka', 'plate', 'placa']
        },
        // 10. KİRİŞ (GIRDER)
        GIRDER: {
            groups: ['kiriş', 'girder', 'beam', 'grinda'],
            columns: ['kiriş', 'girder', 'beam', 'grinda', 'montaj']
        },
        // 11. TABLİYE (DECK)
        DECK: {
            groups: ['tabliye', 'deck', 'slab', 'placa', 'suprabetonare'],
            columns: ['tabliye', 'deck', 'placa', 'beton']
        }
    },
    CULVERT: {
        STONE: ['blokaj', 'stone', 'blocaj'],
        LEAN: ['grobeton', 'lean', 'egalizare'],
        FOUNDATION: ['radye', 'raft', 'foundation', 'fundatie', 'temel'],
        WALL: ['duvar', 'wall', 'perete', 'perde'],
        SLAB: ['tabliye', 'slab', 'döşeme', 'placa', 'üst', 'top'],
    }
};
