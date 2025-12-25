
import { supabase } from './supabase';
import { Language } from '../types';

export const languageService = {
    // Fetch all overrides from SQL
    async fetchTranslations(): Promise<Record<string, Record<string, string>>> {
        if (!supabase) return {};
        
        try {
            const { data, error } = await supabase
                .from('app_translations')
                .select('key, lang, value');

            if (error) {
                // Prevent [object Object] logging, show real message
                // Ignore 'PGRST200' (Table not found) to prevent console spam on fresh installs
                const msg = error.message || '';
                if (error.code !== 'PGRST200' && error.code !== '42P01') {
                    console.error('Error fetching translations:', msg);
                }
                return {};
            }

            if (!data) return {};

            // Transform: { 'tr': { 'common.save': 'Kaydet' }, 'en': { ... } }
            const result: Record<string, Record<string, string>> = {
                tr: {},
                en: {},
                ro: {}
            };

            data.forEach((row: any) => {
                if (result[row.lang]) {
                    result[row.lang][row.key] = row.value;
                }
            });

            return result;
        } catch (e) {
            console.warn('Exception fetching translations (likely offline):', e);
            return {};
        }
    },

    // Save or Update a translation key
    async upsertTranslation(key: string, lang: Language, value: string, module: string = 'general'): Promise<{ success: boolean; error?: any }> {
        if (!supabase) {
            console.warn('Supabase client not initialized');
            return { success: false, error: 'No client' };
        }

        try {
            // Check if exists to update or insert
            const { error } = await supabase
                .from('app_translations')
                .upsert({ key, lang, value, module }, { onConflict: 'key,lang' });

            if (error) {
                console.error(`Error syncing key [${key}]:`, error.message);
                return { success: false, error };
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: e };
        }
    }
};
