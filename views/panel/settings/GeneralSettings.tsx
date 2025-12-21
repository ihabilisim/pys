
import React from 'react';
import { AppSettings, Language } from '../../../types';
import { SUPABASE_CONFIG } from '../../../config';
import { apiService } from '../../../services/api';
import { useUI } from '../../../context/UIContext';

interface Props {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    lang: Language;
    setLang: (l: Language) => void;
    onLoadDemo: () => void;
    isSyncing: boolean;
}

export const GeneralSettings: React.FC<Props> = ({ settings, setSettings, lang, setLang, onLoadDemo, isSyncing }) => {
    const { t, showToast } = useUI();
    const isSupabaseConnected = SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes('192.168');

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            showToast('Logo yükleniyor...', 'info');
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'branding');
            if (error) { showToast(`Hata: ${error}`, 'error'); } 
            else if (publicUrl) { setSettings(prev => ({...prev, logoUrl: publicUrl})); showToast('Logo yüklendi.'); }
        }
    };

    return (
        <div className="space-y-4">
            {/* Cloud Status */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isSupabaseConnected ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSupabaseConnected ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                        <span className="material-symbols-outlined text-xl">{isSupabaseConnected ? 'cloud_done' : 'cloud_off'}</span>
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${isSupabaseConnected ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isSupabaseConnected ? 'Supabase Cloud Bağlı' : 'Offline / Demo Modu'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {SUPABASE_CONFIG.url ? SUPABASE_CONFIG.url.split('//')[1].split('.')[0] + '...' : 'Yapılandırılmadı'}
                        </p>
                    </div>
                </div>
                {isSupabaseConnected && (
                    <button 
                        type="button" 
                        onClick={onLoadDemo} 
                        disabled={isSyncing}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                    >
                        <span className={`material-symbols-outlined text-lg ${isSyncing ? 'animate-spin' : ''}`}>database</span>
                        {isSyncing ? 'Yükleniyor...' : 'Demo Poligon Verisi Yükle'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.siteName')} ({lang})</label><input value={settings.siteName[lang]} onChange={e => setSettings({...settings, siteName: {...settings.siteName, [lang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.sidebarTitle')}</label><input value={settings.sidebarTitle[lang]} onChange={e => setSettings({...settings, sidebarTitle: {...settings.sidebarTitle, [lang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white border-l-4 border-blue-500 pl-3">{t('admin.settings.brandVisuals')}</h4>
                    <div className="flex items-center gap-6 bg-iha-900 p-4 rounded-xl border border-iha-700">
                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                            {settings.logoUrl ? <img src={settings.logoUrl} className="object-contain w-full h-full" /> : <span className="material-symbols-outlined text-3xl text-slate-700">image</span>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-2">{t('admin.settings.logo')} (.png, .svg)</p>
                            <label className="cursor-pointer bg-iha-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all inline-block">
                                {t('common.upload')}
                                <input type="file" onChange={handleLogoChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white border-l-4 border-orange-500 pl-3">{t('admin.settings.appInfo')}</h4>
                    <div className="bg-iha-900 p-4 rounded-xl border border-iha-700">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">{t('admin.settings.version')}</label>
                        <input value={settings.version} onChange={e => setSettings({...settings, version: e.target.value})} className="w-full bg-transparent border-0 text-white font-mono text-lg focus:ring-0 p-0" />
                    </div>
                </div>
            </div>
        </div>
    );
};
