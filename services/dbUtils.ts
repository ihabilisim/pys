
import { PolygonPoint } from '../types';

export const logError = (context: string, error: any) => {
    if (!error) return;
    
    // Check if error is an object and try to extract message or stringify
    let msg = '';
    if (typeof error === 'string') {
        msg = error;
    } else if (error && typeof error === 'object') {
        // Prefer message, then details, then hint, then stringify
        msg = error.message || error.details || error.hint || JSON.stringify(error);
    }

    // Ignore benign errors (like empty result sets on some queries)
    if (error?.code === 'PGRST200') return; 

    if (msg.includes('Failed to fetch') || msg.includes('Network request failed') || msg.includes('connection error')) {
        console.warn(`[Offline/Network] Could not fetch ${context}. Using local/empty data.`);
        return;
    }

    const isMissingTable = error?.code === '42P01' || 
                           msg.includes('Could not find the table') ||
                           msg.includes('schema cache');

    if (isMissingTable) {
        console.warn(`[Supabase Setup Needed] '${context}' tablosu bulunamadı. Lütfen Ayarlar > Genel sekmesinden Master SQL kurulumunu yapın.`);
        return;
    }

    console.error(`DB Error (${context}):`, msg);
};

export const mapPolygonFromDB = (p: any): PolygonPoint => {
    return {
      id: String(p.id), 
      polygonNo: p.polygon_no, 
      roadName: p.road_name || '',
      km: p.km || '', 
      offset: String(p.offset_val || ''),
      east: String(p.east), 
      north: String(p.north), 
      elevation: String(p.elevation), 
      lat: String(p.lat || ''), 
      lng: String(p.lng || ''), 
      description: p.description || '', 
      status: p.status as any
    };
};
