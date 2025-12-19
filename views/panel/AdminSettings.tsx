
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Language, LocalizedString, SliderItem } from '../../types';
import { apiService } from '../../services/api';
import { SUPABASE_CONFIG } from '../../config';
import { INITIAL_DATA } from '../../data/InitialData';

type SettingsSubTab = 'general' | 'project' | 'footer' | 'seo' | 'menu' | 'files' | 'slider';

export const AdminSettings: React.FC = () => {
    const { data, updateAppSettings, updateMenuLabel, addSlide, updateSlide, deleteSlide } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI(); 
    const [settingsTab, setSettingsTab] = useState<SettingsSubTab>('general');
    const [settingLang, setSettingLang] = useState<Language>('tr');
    
    const [tempSettings, setTempSettings] = useState(data.settings);
    const [tempMenuConfig, setTempMenuConfig] = useState(data.menuConfig);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [editSlideId, setEditSlideId] = useState<string | null>(null);
    const [newSlide, setNewSlide] = useState<{
        image: string;
        title: LocalizedString;
        subtitle: LocalizedString;
        tag: string;
    }>({
        image: '',
        title: { tr: '', en: '', ro: '' },
        subtitle: { tr: '', en: '', ro: '' },
        tag: ''
    });

    useEffect(() => {
        setTempSettings(data.settings);
        setTempMenuConfig(data.menuConfig);
    }, [data.settings, data.menuConfig]);

    if (!currentUser || (!currentUser.permissions.includes('manage_settings') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateAppSettings(tempSettings);
        Object.keys(tempMenuConfig).forEach(key => {
            updateMenuLabel(key, tempMenuConfig[key]);
        });
        showToast(t('admin.settings.settingsSaved'), 'success');
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            showToast('Logo yükleniyor...', 'info');
            
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'branding');
            
            if (error) {
                if (error.includes('row-level security')) {
                    showToast('HATA: Supabase "Insert" izni yok. Storage > Policies ayarını kontrol edin.', 'error');
                } else {
                    showToast(`Logo Yükleme Hatası: ${error}`, 'error');
                }
            } else if (publicUrl) {
                setTempSettings({...tempSettings, logoUrl: publicUrl});
                showToast('Logo başarıyla yüklendi.');
            }
        }
    };

    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            showToast('Favicon yükleniyor...', 'info');

            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'branding');

            if (error) {
                if (error.includes('row-level security')) {
                    showToast('HATA: Supabase "Insert" izni yok. Storage > Policies ayarını kontrol edin.', 'error');
                } else {
                    showToast(`Favicon Yükleme Hatası: ${error}`, 'error');
                }
            } else if (publicUrl) {
                setTempSettings({...tempSettings, faviconUrl: publicUrl});
                showToast('Favicon başarıyla yüklendi.');
            }
        }
    };

    const handleSaveSlide = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlide.image) { 
            showToast(t('admin.settings.sliderErrorImage'), 'error'); 
            return; 
        }

        const slideData = {
            image: newSlide.image,
            title: newSlide.title,
            subtitle: newSlide.subtitle,
            tag: newSlide.tag || 'GENEL'
        };
        
        if (editSlideId) {
            updateSlide(editSlideId, slideData);
            setEditSlideId(null);
            showToast(t('admin.settings.sliderUpdated'));
        } else {
            addSlide(slideData);
            showToast(t('admin.settings.sliderAdded'));
        }
        setNewSlide({ image: '', title: { tr: '', en: '', ro: '' }, subtitle: { tr: '', en: '', ro: '' }, tag: '' });
    };

    const startEditSlide = (slide: SliderItem) => {
        setEditSlideId(slide.id);
        setNewSlide({ image: slide.image, title: slide.title, subtitle: slide.subtitle, tag: slide.tag });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTestConnection = async () => {
        setIsSyncing(true);
        const res = await apiService.testConnection();
        setIsSyncing(false);
        if (res.success) {
            showToast(res.message, 'success');
        } else {
            showToast(res.message, 'error');
        }
    };

    const handleSync = async () => {
        if(!window.confirm("Bu işlem tarayıcınızdaki yerel verileri Supabase bulutuna yükleyecektir. Buluttaki mevcut veriler güncellenecektir. Devam edilsin mi?")) return;
        
        setIsSyncing(true);
        showToast('Veriler buluta aktarılıyor, lütfen bekleyiniz...', 'info');
        
        const result = await apiService.migrateLocalToCloud();
        
        setIsSyncing(false);
        if(result.success) {
            showToast(result.message, 'success');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleSeedData = async () => {
        if(!window.confirm("Tabloları SQL ile oluşturduysanız, bu işlem tüm DEMO/Başlangıç verilerini (Initial Data) veritabanına yükleyecektir. İşlem biraz sürebilir. Devam edilsin mi?")) return;

        setIsSyncing(true);
        showToast('Başlangıç verileri yükleniyor...', 'info');

        const result = await apiService.seedDatabase(INITIAL_DATA);

        setIsSyncing(false);
        if(result.success) {
            showToast(result.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast(result.message, 'error');
        }
    }

    const isSupabaseConnected = SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes('192.168');

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Sub Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-iha-700 mb-4 custom-scrollbar">
                {[
                    {id:'general', l: t('admin.settings.tabs.general')},
                    {id:'project', l: t('admin.settings.tabs.project')},
                    {id:'footer', l: t('admin.settings.tabs.footer')},
                    {id:'seo', l: t('admin.settings.tabs.seo')},
                    {id:'menu', l: t('admin.settings.tabs.menu')},
                    {id:'files', l: t('admin.settings.tabs.files')},
                    {id:'slider', l: t('admin.settings.tabs.slider')}
                ].map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setSettingsTab(t.id as any)} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${settingsTab === t.id ? 'bg-iha-blue text-white shadow-lg' : 'bg-iha-800 text-slate-400 hover:text-white'}`}
                    >
                        {t.l}
                    </button>
                ))}
            </div>

            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <form onSubmit={handleSettingsSave} className="space-y-6">
                    {/* Language Selection for Form */}
                    {settingsTab !== 'files' && settingsTab !== 'slider' && (
                        <div className="flex gap-2 mb-4 border-b border-iha-700 pb-4">
                            {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                <button key={lang} type="button" onClick={() => setSettingLang(lang)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settingLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-500'}`}>
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {settingsTab === 'general' && (
                        <div className="space-y-4">
                            {/* Cloud Status Indicator & Sync Button */}
                            <div className={`p-4 rounded-xl border flex flex-col items-start gap-4 ${isSupabaseConnected ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                                <div className="flex items-center gap-3 w-full">
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
                                    <div className="flex flex-wrap gap-2 w-full pt-2 border-t border-white/5">
                                        <button 
                                            type="button" 
                                            onClick={handleTestConnection} 
                                            disabled={isSyncing}
                                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-sm">network_check</span>
                                            Bağlantı Testi
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleSeedData} 
                                            disabled={isSyncing}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                                        >
                                            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>database</span>
                                            {isSyncing ? 'Yükleniyor...' : 'Veritabanını Kur / Sıfırla'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleSync} 
                                            disabled={isSyncing}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 ml-auto"
                                        >
                                            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync_alt</span>
                                            {isSyncing ? 'Aktarılıyor...' : 'Yerel Veriyi Gönder'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.siteName')} ({settingLang})</label><input value={tempSettings.siteName[settingLang]} onChange={e => setTempSettings({...tempSettings, siteName: {...tempSettings.siteName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.sidebarTitle')}</label><input value={tempSettings.sidebarTitle[settingLang]} onChange={e => setTempSettings({...tempSettings, sidebarTitle: {...tempSettings.sidebarTitle, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white border-l-4 border-blue-500 pl-3">{t('admin.settings.brandVisuals')}</h4>
                                    <div className="flex items-center gap-6 bg-iha-900 p-4 rounded-xl border border-iha-700">
                                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                                            {tempSettings.logoUrl ? <img src={tempSettings.logoUrl} className="object-contain w-full h-full" /> : <span className="material-symbols-outlined text-3xl text-slate-700">image</span>}
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
                                        <input value={tempSettings.version} onChange={e => setTempSettings({...tempSettings, version: e.target.value})} className="w-full bg-transparent border-0 text-white font-mono text-lg focus:ring-0 p-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'project' && (
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.projectName')}</label><input value={tempSettings.projectName[settingLang]} onChange={e => setTempSettings({...tempSettings, projectName: {...tempSettings.projectName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.siteAddress')}</label><textarea value={tempSettings.siteAddress[settingLang]} onChange={e => setTempSettings({...tempSettings, siteAddress: {...tempSettings.siteAddress, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-20" /></div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.sidebarSubtitle')}</label><input value={tempSettings.sidebarSubtitle[settingLang]} onChange={e => setTempSettings({...tempSettings, sidebarSubtitle: {...tempSettings.sidebarSubtitle, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                        </div>
                    )}

                    {settingsTab === 'footer' && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-white border-l-4 border-purple-500 pl-3 mb-4">{t('admin.settings.footerInfo')}</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">{t('admin.settings.companyName')}</label>
                                    <input value={tempSettings.companyName[settingLang]} onChange={e => setTempSettings({...tempSettings, companyName: {...tempSettings.companyName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-bold" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">{t('admin.settings.footerProjectName')}</label>
                                    <input value={tempSettings.footerProjectName[settingLang]} onChange={e => setTempSettings({...tempSettings, footerProjectName: {...tempSettings.footerProjectName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">{t('admin.settings.copyright')}</label>
                                    <input value={tempSettings.copyrightText[settingLang]} onChange={e => setTempSettings({...tempSettings, copyrightText: {...tempSettings.copyrightText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">{t('admin.settings.privacyLink')}</label>
                                        <input value={tempSettings.privacyText[settingLang]} onChange={e => setTempSettings({...tempSettings, privacyText: {...tempSettings.privacyText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">{t('admin.settings.termsLink')}</label>
                                        <input value={tempSettings.termsText[settingLang]} onChange={e => setTempSettings({...tempSettings, termsText: {...tempSettings.termsText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'seo' && (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                                <p className="text-xs text-blue-300">{t('admin.settings.seoHelp')}</p>
                            </div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.seoTitle')}</label><input value={tempSettings.seoTitle[settingLang]} onChange={e => setTempSettings({...tempSettings, seoTitle: {...tempSettings.seoTitle, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.seoDesc')}</label><textarea value={tempSettings.seoDescription[settingLang]} onChange={e => setTempSettings({...tempSettings, seoDescription: {...tempSettings.seoDescription, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24" /></div>
                            <div className="pt-4">
                                <label className="text-xs text-slate-500 block mb-2">{t('admin.settings.favicon')}</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">{tempSettings.faviconUrl ? <img src={tempSettings.faviconUrl} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-slate-400">public</span>}</div>
                                    <label className="cursor-pointer bg-iha-700 hover:bg-iha-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                        {t('common.upload')}
                                        <input type="file" onChange={handleFaviconChange} className="hidden" accept="image/x-icon,image/png" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'menu' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(tempMenuConfig).map(key => (
                                <div key={key} className="bg-iha-900 p-3 rounded-xl border border-iha-700">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Key: {key}</label>
                                    <input 
                                        value={tempMenuConfig[key][settingLang]} 
                                        onChange={e => setTempMenuConfig({...tempMenuConfig, [key]: {...tempMenuConfig[key], [settingLang]: e.target.value}})} 
                                        className="w-full bg-transparent border-0 text-white font-medium focus:ring-0 p-0 text-sm"
                                        placeholder={t('admin.settings.menuLabelPlaceholder')}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {settingsTab === 'files' && (
                        <div className="space-y-6">
                            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                                <h4 className="text-sm font-bold text-white mb-4 border-b border-iha-700 pb-2">{t('admin.settings.filePaths')}</h4>
                                <div className="space-y-4">
                                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.bridgePath')}</label><input value={tempSettings.defaultBridgePath} onChange={e => setTempSettings({...tempSettings, defaultBridgePath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.culvertPath')}</label><input value={tempSettings.defaultCulvertPath} onChange={e => setTempSettings({...tempSettings, defaultCulvertPath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.shortcutPath')}</label><input value={tempSettings.defaultShortcutPath} onChange={e => setTempSettings({...tempSettings, defaultShortcutPath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                                </div>
                            </div>

                            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-iha-700 pb-2">
                                    <span className="material-symbols-outlined text-yellow-500">folder_special</span>
                                    {t('admin.settings.specialPaths')}
                                </h4>
                                <div className="overflow-x-auto max-h-64 custom-scrollbar">
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-500 uppercase font-bold border-b border-iha-700">
                                            <tr>
                                                <th className="py-2">{t('common.type')}</th>
                                                <th className="py-2">{t('common.title')}</th>
                                                <th className="py-2">KM</th>
                                                <th className="py-2">Path</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-iha-800 text-slate-300">
                                            {data.pvlaStructures.filter(s => s.path).map(s => (
                                                <tr key={s.id} className="hover:bg-iha-800/50">
                                                    <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${s.type === 'Bridge' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'}`}>{s.type}</span></td>
                                                    <td className="py-2 font-bold">{s.name}</td>
                                                    <td className="py-2">{s.km}</td>
                                                    <td className="py-2 font-mono text-yellow-500">{s.path}</td>
                                                </tr>
                                            ))}
                                            {!data.pvlaStructures.some(s => s.path) && (
                                                <tr>
                                                    <td colSpan={4} className="py-4 text-center text-slate-500 italic">{t('admin.settings.noSpecialPaths')}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'slider' && (
                        <div className="space-y-6">
                            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">add_photo_alternate</span>
                                    {editSlideId ? t('admin.settings.sliderEdit') : t('admin.settings.sliderAdd')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                                <button key={lang} type="button" onClick={() => setSettingLang(lang)} className={`px-2 py-1 rounded text-[10px] font-bold ${settingLang === lang ? 'bg-blue-600 text-white' : 'bg-iha-800 text-slate-500'}`}>{lang.toUpperCase()}</button>
                                            ))}
                                        </div>
                                        <input placeholder={`${t('common.title')} (${settingLang})`} value={newSlide.title[settingLang]} onChange={e => setNewSlide({...newSlide, title: {...newSlide.title, [settingLang]: e.target.value}})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                        <input placeholder={`${t('common.subtitle')} (${settingLang})`} value={newSlide.subtitle[settingLang]} onChange={e => setNewSlide({...newSlide, subtitle: {...newSlide.subtitle, [settingLang]: e.target.value}})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                    </div>
                                    <div className="space-y-4 pt-6">
                                        <input placeholder={t('admin.settings.sliderImagePlaceholder')} value={newSlide.image} onChange={e => setNewSlide({...newSlide, image: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                        <input placeholder={t('admin.settings.sliderTagPlaceholder')} value={newSlide.tag} onChange={e => setNewSlide({...newSlide, tag: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveSlide} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">{editSlideId ? t('common.update') : t('common.add')}</button>
                                            {editSlideId && <button onClick={() => {setEditSlideId(null); setNewSlide({image:'',title:{tr:'',en:'',ro:''},subtitle:{tr:'',en:'',ro:''},tag:''})}} className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold">{t('common.cancel')}</button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.slides.map(slide => (
                                    <div key={slide.id} className="bg-iha-900 border border-iha-700 rounded-xl overflow-hidden group">
                                        <div className="aspect-video relative">
                                            <img src={slide.image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => startEditSlide(slide)} className="p-2 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => {if(window.confirm(t('common.deleteConfirm'))) deleteSlide(slide.id)}} className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-white text-xs font-bold truncate">{slide.title['tr']}</p>
                                            <p className="text-[10px] text-slate-500 uppercase mt-1">{slide.tag}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {settingsTab !== 'slider' && (
                        <div className="pt-6 border-t border-iha-700 flex justify-end">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">save</span>
                                {t('admin.settings.saveAll')}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
