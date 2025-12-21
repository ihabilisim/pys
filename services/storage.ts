
import { supabase } from './supabase';

export const storageService = {
  async uploadFile(file: File, bucket: string = 'app-assets', folder: string = 'general'): Promise<{ publicUrl: string | null; error: string | null }> {
    if (!supabase) return { publicUrl: URL.createObjectURL(file), error: null };

    try {
        const fileExt = file.name.split('.').pop();
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${folder}/${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) return { publicUrl: null, error: uploadError.message };

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return { publicUrl: data.publicUrl, error: null };
    } catch (error: any) {
        return { publicUrl: null, error: error.message };
    }
  }
};
