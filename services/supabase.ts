
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';
import { Database } from '../types/supabase';

// URL veya Key, bariz placeholder (yer tutucu) değerlerse bağlantı kurma.
// Kendi sunucunuzun IP'si veya domaini girildiğinde burası 'true' dönecektir.
const isConfigured = 
    SUPABASE_CONFIG.url && 
    SUPABASE_CONFIG.url !== 'https://PROJECT_ID.supabase.co' && 
    SUPABASE_CONFIG.key && 
    SUPABASE_CONFIG.key !== 'PUBLIC_ANON_KEY';

if (!isConfigured) {
    console.warn("Supabase API bilgileri config.ts dosyasında eksik veya varsayılan değerde. Uygulama Offline/Demo modunda çalışıyor.");
}

export const supabase = isConfigured
    ? createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key)
    : null;
