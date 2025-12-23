
import { supabase } from './supabase';
import { MasterAlignment, AlignmentPoint } from '../types/design';

export const designService = {
    // --- Alignment Master CRUD ---
    
    async fetchAlignments(): Promise<MasterAlignment[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('alignments_master')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Veri çekme hatası (Alignments):', error.message);
            if (error.code === '42501') {
                console.warn("RLS İzin Hatası: Lütfen db_init.sql dosyasını Supabase SQL Editöründe çalıştırın.");
            }
            return [];
        }
        
        return (data || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            filePath: a.file_path,
            isActive: a.is_active,
            createdAt: a.created_at
        }));
    },

    async createAlignment(name: string, description: string, filePath: string, userId?: string): Promise<string | null> {
        if (!supabase) return null;
        
        // Validate UUID to prevent Postgres error "invalid input syntax for type uuid"
        // If userId is legacy "admin-1" or invalid, send NULL to avoid crash
        const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const safeUserId = (userId && isValidUUID(userId)) ? userId : null;

        if (userId && !safeUserId) {
            console.warn(`Invalid UUID provided for userId: ${userId}. Using NULL for created_by.`);
        }

        const payload = {
            name,
            description,
            file_path: filePath,
            created_by: safeUserId,
            is_active: true
        };

        const { data, error } = await supabase
            .from('alignments_master')
            .insert(payload)
            .select('id')
            .single();

        if (error) {
            console.error('Kayıt oluşturma hatası (Alignment):', error.message);
            if (error.code === '42501') {
                alert("Veritabanı izni reddedildi (RLS Policy). Lütfen projenin ana dizinindeki 'db_init.sql' dosyasındaki SQL komutlarını Supabase'de çalıştırın.");
            } else if (error.code === '22P02') {
                // Invalid text representation (UUID)
                alert("Veritabanı UUID format hatası. Kullanıcı ID'si geçersiz.");
            }
            return null;
        }
        return data?.id || null;
    },

    async deleteAlignment(id: string): Promise<boolean> {
        if (!supabase) return false;
        
        const { error } = await supabase
            .from('alignments_master')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Silme hatası:', error.message);
            if (error.code === '42501') {
                alert("Silme izni reddedildi. Lütfen 'db_init.sql' dosyasını çalıştırın.");
            }
            return false;
        }
        return true;
    },

    async toggleAlignment(id: string, currentState: boolean): Promise<boolean> {
        if (!supabase) return false;
        const { error } = await supabase
            .from('alignments_master')
            .update({ is_active: !currentState })
            .eq('id', id);
            
        if (error) {
            console.error('Güncelleme hatası:', error.message);
            return false;
        }
        return true;
    },

    // --- Points CRUD ---

    async bulkInsertPoints(points: Omit<AlignmentPoint, 'id'>[]): Promise<boolean> {
        if (!supabase || points.length === 0) return true;
        
        const payload = points.map(p => ({
            alignment_id: p.alignmentId,
            km: p.km,
            x: p.x,
            y: p.y,
            z_red_kot: p.zRed,
            z_black_kot: p.zBlack,
            superelevation: p.superelevation,
            bearing: p.bearing
        }));

        const BATCH_SIZE = 1000;
        let hasError = false;

        for (let i = 0; i < payload.length; i += BATCH_SIZE) {
            const chunk = payload.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('alignment_points').insert(chunk);
            if (error) {
                console.error('Toplu ekleme hatası:', error.message);
                if (error.code === '42501') {
                    alert("Toplu veri yazma izni reddedildi. Lütfen 'db_init.sql' dosyasını çalıştırın.");
                    return false; // Stop immediately
                }
                hasError = true;
                break;
            }
        }

        return !hasError;
    },

    async getPointsPaginated(alignmentId: string, page: number, limit: number): Promise<{ data: AlignmentPoint[], count: number }> {
        if (!supabase) return { data: [], count: 0 };
        
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('alignment_points')
            .select('*', { count: 'exact' })
            .eq('alignment_id', alignmentId)
            .order('km', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Nokta verisi çekme hatası:', error.message);
            return { data: [], count: 0 };
        }

        return {
            count: count || 0,
            data: (data || []).map((p: any) => ({
                id: p.id,
                alignmentId: p.alignment_id,
                km: p.km,
                x: p.x,
                y: p.y,
                zRed: p.z_red_kot,
                zBlack: p.z_black_kot,
                superelevation: p.superelevation,
                bearing: p.bearing
            }))
        };
    }
};
