
import React from 'react';
import { Permission } from '../../types';
import { useUI } from '../../context/UIContext';

interface ProfileShortcutsProps {
    role: string;
    permissions: Permission[];
    onNavigate: (tab: string) => void;
    onClose: () => void;
}

// Map permissions to translation keys
const SHORTCUT_MAP: Record<string, { labelKey: string; tab: string; icon: string; color: string }> = {
    'manage_map': { labelKey: 'permissions.manage_map', tab: 'topo', icon: 'landscape', color: 'from-emerald-500 to-green-600' },
    'manage_machinery': { labelKey: 'permissions.manage_machinery', tab: 'machinery', icon: 'agriculture', color: 'from-orange-500 to-amber-600' },
    'manage_materials': { labelKey: 'permissions.manage_materials', tab: 'materials', icon: 'inventory_2', color: 'from-purple-500 to-indigo-600' },
    'manage_daily_log': { labelKey: 'permissions.manage_daily_log', tab: 'dashboard', icon: 'edit_note', color: 'from-blue-500 to-cyan-600' },
    'manage_files': { labelKey: 'permissions.manage_files', tab: 'pvla', icon: 'folder_shared', color: 'from-indigo-500 to-blue-600' },
    'manage_drone': { labelKey: 'permissions.manage_drone', tab: 'drone', icon: 'flight', color: 'from-red-500 to-rose-600' },
    'manage_timeline': { labelKey: 'permissions.manage_timeline', tab: 'timeloc', icon: 'calendar_month', color: 'from-teal-500 to-emerald-600' },
    'manage_quality': { labelKey: 'permissions.manage_quality', tab: 'topo', icon: 'flag', color: 'from-pink-500 to-rose-600' }
};

export const ProfileShortcuts: React.FC<ProfileShortcutsProps> = ({ role, permissions, onNavigate, onClose }) => {
    const { t } = useUI();

    // Determine available shortcuts based on permissions
    const availableShortcuts = role === 'admin' 
        ? Object.values(SHORTCUT_MAP) 
        : permissions
            .filter(p => SHORTCUT_MAP[p])
            .map(p => SHORTCUT_MAP[p]);

    // Unique shortcuts to avoid duplicates
    const uniqueShortcuts = Array.from(new Set(availableShortcuts.map(s => s.tab)))
        .map(tab => availableShortcuts.find(s => s.tab === tab)!);

    return (
        <div className="w-full h-full p-6 flex flex-col">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-yellow-500">star</span>
                    {t('profile.authorizedAreas')}
                </h3>
                <p className="text-xs text-slate-400">
                    {t('profile.authDesc')}
                </p>
            </div>

            {/* Enhanced Grid System: Scales to 3 columns on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar flex-1 content-start pb-4">
                {uniqueShortcuts.map((shortcut, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onNavigate(shortcut.tab)}
                        className="group relative flex flex-col items-center justify-center p-6 bg-iha-900 border border-iha-700 rounded-2xl hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-1 group-hover:translate-y-0`}>
                            <span className="material-symbols-outlined text-blue-400 text-sm">arrow_outward</span>
                        </div>
                        
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg bg-gradient-to-br ${shortcut.color} group-hover:scale-110 transition-transform duration-300`}>
                            <span className="material-symbols-outlined text-2xl drop-shadow-md">{shortcut.icon}</span>
                        </div>
                        
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors text-center">
                            {t(shortcut.labelKey)}
                        </span>
                        
                        {/* Decorative background glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}></div>
                    </button>
                ))}
                
                {uniqueShortcuts.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-iha-700 rounded-2xl flex flex-col items-center justify-center bg-iha-900/50">
                        <div className="w-16 h-16 bg-iha-800 rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-slate-600 text-3xl">lock_person</span>
                        </div>
                        <p className="text-sm font-bold text-slate-400">{t('profile.noAuth')}</p>
                        <p className="text-xs text-slate-500 mt-1">Lütfen yetki tanımlaması için yönetici ile görüşün.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-iha-700">
                <div className="flex items-center gap-3 p-3 bg-blue-900/10 rounded-xl border border-blue-500/10">
                    <span className="material-symbols-outlined text-blue-400">help</span>
                    <div className="text-xs text-blue-200">
                        <p className="font-bold">{t('profile.helpTitle')}</p>
                        <p className="opacity-70">{t('profile.helpDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
