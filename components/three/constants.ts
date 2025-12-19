
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
    // Culvert Labels
    stone: { tr: 'Blokaj', en: 'Stone Block', ro: 'Blocaj Piatră' },
    culvert_found: { tr: 'Radye Temel', en: 'Raft Found.', ro: 'Radier' },
    culvert_wall: { tr: 'Duvarlar', en: 'Walls', ro: 'Pereți' },
    culvert_top: { tr: 'Üst Döşeme', en: 'Top Slab', ro: 'Placă' },
    wing: { tr: 'Kanat/Havuz', en: 'Wing/Chamber', ro: 'Aripi/Camere' }
};
