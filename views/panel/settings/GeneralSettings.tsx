
import React, { useState, useEffect } from 'react';
import { AppSettings, Language } from '../../../types';
import { SUPABASE_CONFIG } from '../../../config';
import { useUI } from '../../../context/UIContext';
import { supabase } from '../../../services/supabase';
import { MIGRATION_BLOCK, TABLE_SCHEMAS, SEED_DATA_SCHEMAS } from '../../../data/sqlSchemas';

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
    const [showSql, setShowSql] = useState(false);
    const [showSeedSql, setShowSeedSql] = useState(false);
    const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
    const [missingTables, setMissingTables] = useState<string[]>([]);
    
    // Computed SQL based on missing tables
    const [generatedSchemaSql, setGeneratedSchemaSql] = useState('');
    const [generatedSeedSql, setGeneratedSeedSql] = useState('');

    useEffect(() => {
        checkDbHealth();
    }, []);

    const checkDbHealth = async () => {
        if (!supabase) { setDbStatus('error'); return; }
        
        // List of all tables we want to check
        const tablesToCheck = Object.keys(TABLE_SCHEMAS);
        const missing: string[] = [];
        
        for (const table of tablesToCheck) {
            const { error } = await supabase.from(table).select('id').limit(1);
            // Error 42P01 means relation does not exist
            if (error && (error.code === '42P01' || error.message.includes('Could not find the table'))) {
                missing.push(table);
            }
        }
        
        setMissingTables(missing);
        
        // --- 1. SCHEMA SQL ---
        if (missing.length > 0) {
            setDbStatus('error');
            generateSmartSql(missing);
        } else {
            setDbStatus('ok');
            setGeneratedSchemaSql("-- Tüm tablolar mevcut. Sistem güncel.\n-- All tables present. System up to date.");
            
            // --- 2. ALWAYS GENERATE SEED SQL (Fix for Empty Data) ---
            let seedSql = `-- IHA PYS - FULL DEMO DATA GENERATOR\n`;
            seedSql += `-- Tablolar mevcut olsa bile verileri sıfırlayıp yükler.\n`;
            seedSql += `-- UYARI: structure_groups, structures_main vb. tablolar TEMİZLENECEKTİR.\n\n`;
            
            Object.keys(SEED_DATA_SCHEMAS).forEach(table => {
                seedSql += `\n-- Seed for ${table}\n` + SEED_DATA_SCHEMAS[table] + "\n";
            });
            
            setGeneratedSeedSql(seedSql);
        }
    };

    const generateSmartSql = (missing: string[]) => {
        let schemaSql = `-- IHA PYS - AUTOMATED SCHEMA REPAIR\n`;
        schemaSql += `-- Tespit edilen eksik tablo sayısı: ${missing.length}\n\n`;
        
        // Always include migration block for column safety
        schemaSql += MIGRATION_BLOCK + "\n";

        missing.forEach(table => {
            if (TABLE_SCHEMAS[table]) {
                schemaSql += `\n-- [MISSING] Table: ${table}\n`;
                schemaSql += TABLE_SCHEMAS[table] + "\n";
            }
        });

        setGeneratedSchemaSql(schemaSql);

        // Smart Seed Generation (Only missing or full if requested via other means, but here we prioritize missing)
        // If status is error, we still provide full seed option usually, but let's just do full seed for simplicity
        let seedSql = `-- IHA PYS - SMART SEED DATA\n`;
        seedSql += `-- Tablolar oluşturulduktan sonra çalıştırın.\n\n`;
        
        Object.keys(SEED_DATA_SCHEMAS).forEach(table => {
             seedSql += `\n-- Seed for ${table}\n` + SEED_DATA_SCHEMAS[table] + "\n";
        });

        setGeneratedSeedSql(seedSql);
    };

    const handleCopySql = (sql: string) => {
        navigator.clipboard.writeText(sql);
        showToast('SQL Kodu kopyalandı!', 'success');
    };

    const handleForceRepair = () => {
        // Force regenerate SQL with migration block even if tables exist
        let schemaSql = `-- IHA PYS - FORCED PERMISSION REPAIR\n`;
        schemaSql += `-- Tablolar mevcut olsa bile izinleri ve şemayı onarır.\n\n`;
        schemaSql += MIGRATION_BLOCK + "\n";
        setGeneratedSchemaSql(schemaSql);
        setShowSql(true);
        showToast('Onarım SQL\'i oluşturuldu. Kopyalayıp çalıştırın.', 'info');
    };

    return (
        <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isSupabaseConnected ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSupabaseConnected ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                        <span className="material-symbols-outlined text-xl">{isSupabaseConnected ? 'cloud_done' : 'cloud_off'}</span>
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${isSupabaseConnected ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isSupabaseConnected ? 'Supabase Cloud Bağlı' : 'Offline / Demo Modu'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{SUPABASE_CONFIG.url || 'Yapılandırılmadı'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isSupabaseConnected && (
                        <button type="button" onClick={onLoadDemo} disabled={isSyncing} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-lg">database</span>
                            Poligonları Yükle (Client)
                        </button>
                    )}
                </div>
            </div>

            <div className={`p-4 rounded-xl border ${dbStatus === 'error' ? 'bg-red-900/10 border-red-500/30' : 'bg-iha-900 border-iha-700'}`}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dbStatus === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            <span className="material-symbols-outlined text-lg">{dbStatus === 'error' ? 'database_off' : 'database_check'}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Veritabanı Şema Durumu</h4>
                            {dbStatus === 'error' ? (
                                <div className="mt-1">
                                    <p className="text-xs text-red-400">Eksik tablolar ({missingTables.length}): <span className="font-mono">{missingTables.slice(0, 3).join(', ')}{missingTables.length > 3 ? '...' : ''}</span></p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Sadece eksik tablolar için SQL oluşturuldu.</p>
                                </div>
                            ) : (
                                <p className="text-xs text-emerald-400 mt-1">Tüm tablolar doğrulandı.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {dbStatus === 'ok' && (
                            <button onClick={handleForceRepair} className="text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 bg-yellow-600 text-white border-yellow-500 hover:bg-yellow-500">
                                <span className="material-symbols-outlined text-sm">build</span>
                                İzinleri Onar
                            </button>
                        )}

                        <button onClick={() => { setShowSql(!showSql); setShowSeedSql(false); }} className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 ${showSql ? 'bg-blue-600 text-white border-blue-500' : 'bg-iha-900 text-slate-400 border-iha-700 hover:text-white'}`}>
                            <span className="material-symbols-outlined text-sm">code</span>
                            {showSql ? 'SQL Gizle' : `Adım 1: Tablo Oluştur`}
                        </button>
                        
                        <button onClick={() => { setShowSeedSql(!showSeedSql); setShowSql(false); }} className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 ${showSeedSql ? 'bg-green-600 text-white border-green-500' : 'bg-iha-900 text-slate-400 border-iha-700 hover:text-white'}`}>
                            <span className="material-symbols-outlined text-sm">storage</span>
                            {showSeedSql ? 'SQL Gizle' : 'Adım 2: Demo Veri Yükle'}
                        </button>
                    </div>
                </div>

                {showSql && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Akıllı Şema Onarımı</span>
                            <button onClick={() => handleCopySql(generatedSchemaSql)} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 font-bold uppercase">Kopyala</button>
                        </div>
                        <textarea readOnly value={generatedSchemaSql} className="w-full h-64 bg-black/50 border border-iha-700 rounded-lg p-3 text-[10px] font-mono text-emerald-400 focus:outline-none custom-scrollbar" />
                    </div>
                )}

                {showSeedSql && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Demo Veri SQL</span>
                            <button onClick={() => handleCopySql(generatedSeedSql)} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded hover:bg-green-500/20 font-bold uppercase">Kopyala</button>
                        </div>
                        <div className="mb-2 bg-orange-500/10 border border-orange-500/20 p-2 rounded text-[10px] text-orange-300">
                            <strong>UYARI:</strong> Bu SQL komutu tabloları temizleyip (DELETE) yeniden doldurur. Mevcut veriniz varsa yedekleyiniz.
                        </div>
                        <textarea readOnly value={generatedSeedSql} className="w-full h-64 bg-black/50 border border-iha-700 rounded-lg p-3 text-[10px] font-mono text-orange-400 focus:outline-none custom-scrollbar" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.siteName')} ({lang})</label><input value={settings.siteName[lang]} onChange={e => setSettings({...settings, siteName: {...settings.siteName, [lang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.sidebarTitle')}</label><input value={settings.sidebarTitle[lang]} onChange={e => setSettings({...settings, sidebarTitle: {...settings.sidebarTitle, [lang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" /></div>
            </div>
        </div>
    );
};
