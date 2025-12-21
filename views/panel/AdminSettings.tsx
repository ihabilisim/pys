
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Language } from '../../types';
import { apiService } from '../../services/api';

// Sub Components
import { GeneralSettings } from './settings/GeneralSettings';
import { MailSettings } from './settings/MailSettings';
import { SliderSettings } from './settings/SliderSettings';
import { MenuSettings } from './settings/MenuSettings';
import { FileSettings } from './settings/FileSettings';

type SettingsSubTab = 'general' | 'project' | 'footer' | 'seo' | 'menu' | 'files' | 'slider' | 'mail';

export const AdminSettings: React.FC = () => {
    const { data, updateAppSettings, updateMenuLabel, addSlide, updateSlide, deleteSlide, reloadPolygons } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI(); 
    const [settingsTab, setSettingsTab] = useState<SettingsSubTab>('general');
    const [settingLang, setSettingLang] = useState<Language>('tr');
    
    // Safety init
    const [tempSettings, setTempSettings] = useState(data.settings);
    const [tempMenuConfig, setTempMenuConfig] = useState(data.menuConfig);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const safeSettings = { ...data.settings };
        if (!safeSettings.smtp) {
            safeSettings.smtp = { host: '', port: 587, user: '', pass: '', secure: true, fromName: '', fromEmail: '' };
        }
        setTempSettings(safeSettings);
        setTempMenuConfig(data.menuConfig);
    }, [data.settings, data.menuConfig]);

    if (!currentUser || (!currentUser.permissions.includes('manage_settings') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateAppSettings(tempSettings);
        Object.keys(tempMenuConfig).forEach(key => {
            updateMenuLabel(key, tempMenuConfig[key]);
        });
        showToast(t('admin.settings.settingsSaved'), 'success');
    };

    const handleLoadDemo = async () => {
        if(!window.confirm("Bu işlem mevcut poligon veritabanını SİLECEK ve Demo veriyi yükleyecektir. Emin misiniz?")) return;
        setIsSyncing(true);
        showToast('Demo veriler yükleniyor...', 'info');
        const success = await apiService.loadDemoPolygons();
        setIsSyncing(false);
        if(success) { showToast('Demo veriler yüklendi.', 'success'); await reloadPolygons(); } 
        else { showToast('Demo yükleme hatası.', 'error'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Sub Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-iha-700 mb-4 custom-scrollbar">
                {[
                    {id:'general', l: t('admin.settings.tabs.general')},
                    {id:'mail', l: 'Mail Ayarları'},
                    {id:'project', l: t('admin.settings.tabs.project')},
                    {id:'footer', l: t('admin.settings.tabs.footer')},
                    {id:'seo', l: t('admin.settings.tabs.seo')},
                    {id:'menu', l: t('admin.settings.tabs.menu')},
                    {id:'files', l: t('admin.settings.tabs.files')},
                    {id:'slider', l: t('admin.settings.tabs.slider')}
                ].map(tItem => (
                    <button 
                        key={tItem.id} 
                        onClick={() => setSettingsTab(tItem.id as any)} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${settingsTab === tItem.id ? 'bg-iha-blue text-white shadow-lg' : 'bg-iha-800 text-slate-400 hover:text-white'}`}
                    >
                        {tItem.l}
                    </button>
                ))}
            </div>

            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <form onSubmit={handleSettingsSave} className="space-y-6">
                    {/* Language Selection for Form */}
                    {['general', 'project', 'footer', 'seo', 'menu'].includes(settingsTab) && (
                        <div className="flex gap-2 mb-4 border-b border-iha-700 pb-4">
                            {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                <button key={lang} type="button" onClick={() => setSettingLang(lang)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settingLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-500'}`}>{lang.toUpperCase()}</button>
                            ))}
                        </div>
                    )}
                    
                    {settingsTab === 'general' && (
                        <GeneralSettings 
                            settings={tempSettings} 
                            setSettings={setTempSettings} 
                            lang={settingLang} 
                            setLang={setSettingLang} 
                            onLoadDemo={handleLoadDemo} 
                            isSyncing={isSyncing} 
                        />
                    )}

                    {settingsTab === 'mail' && <MailSettings settings={tempSettings} setSettings={setTempSettings} />}
                    {settingsTab === 'menu' && <MenuSettings menuConfig={tempMenuConfig} setMenuConfig={setTempMenuConfig} lang={settingLang} />}
                    {settingsTab === 'files' && <FileSettings settings={tempSettings} setSettings={setTempSettings} structures={data.pvlaStructures} />}
                    {settingsTab === 'slider' && <SliderSettings slides={data.slides} addSlide={addSlide} updateSlide={updateSlide} deleteSlide={deleteSlide} />}

                    {/* Simple Inline Tabs (Project, Footer, SEO) - Too small to split */}
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
                                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.companyName')}</label><input value={tempSettings.companyName[settingLang]} onChange={e => setTempSettings({...tempSettings, companyName: {...tempSettings.companyName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-bold" /></div>
                                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.footerProjectName')}</label><input value={tempSettings.footerProjectName[settingLang]} onChange={e => setTempSettings({...tempSettings, footerProjectName: {...tempSettings.footerProjectName, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.copyright')}</label><input value={tempSettings.copyrightText[settingLang]} onChange={e => setTempSettings({...tempSettings, copyrightText: {...tempSettings.copyrightText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.privacyLink')}</label><input value={tempSettings.privacyText[settingLang]} onChange={e => setTempSettings({...tempSettings, privacyText: {...tempSettings.privacyText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.termsLink')}</label><input value={tempSettings.termsText[settingLang]} onChange={e => setTempSettings({...tempSettings, termsText: {...tempSettings.termsText, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'seo' && (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4"><p className="text-xs text-blue-300">{t('admin.settings.seoHelp')}</p></div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.seoTitle')}</label><input value={tempSettings.seoTitle[settingLang]} onChange={e => setTempSettings({...tempSettings, seoTitle: {...tempSettings.seoTitle, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.seoDesc')}</label><textarea value={tempSettings.seoDescription[settingLang]} onChange={e => setTempSettings({...tempSettings, seoDescription: {...tempSettings.seoDescription, [settingLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24" /></div>
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
