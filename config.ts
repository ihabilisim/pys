// Supabase Proje Bilgileri
// Özel sunucu: api.ibilisim.net

// Helper to safely access env variables
const getEnv = (key: string, defaultValue: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || defaultValue;
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is not supported
  }
  return defaultValue;
};

// Canlı ortamda .env dosyasından okur, yoksa aşağıdaki sabitleri kullanır.
export const SUPABASE_CONFIG = {
    // Hosted URL (Self-Hosted)
    url: getEnv('VITE_SUPABASE_URL', 'https://api.ibilisim.net'),
   
    // Supabase Anon Public Key
    key: getEnv('VITE_SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2MTY0MTY5LCJleHAiOjIwODE1MjQxNjl9.cR1S45JCEh74yT1mJE_mgw42OGvg1Tb5xQiqkswGdfE')
};