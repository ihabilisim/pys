
// Supabase Proje Bilgileri
// Bu bilgileri Kendi Sunucunuzdaki Supabase Studio'dan (Ayarlar > API) veya .env dosyasından alabilirsiniz.

export const SUPABASE_CONFIG = {
    // Hosted URL (Supabase Cloud / Self-Hosted)
    url: process.env.REACT_APP_SUPABASE_URL || 'https://api.ibilisim.net', 
    
    // Supabase Anon Public Key
    key: process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2MTY0MTY5LCJleHAiOjIwODE1MjQxNjl9.cR1S45JCEh74yT1mJE_mgw42OGvg1Tb5xQiqkswGdfE' 
};
