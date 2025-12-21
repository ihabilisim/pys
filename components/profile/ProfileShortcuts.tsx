
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
    'manage_map': { labelKey: 'permissions.manage_map', tab: 'topo', icon: 'landscape', color: 'bg-emerald-500' },
    'manage_machinery': { labelKey: 'permissions.manage_machinery', tab: 'machinery', icon: 'agriculture', color: 'bg-orange-500' },
    'manage_materials': { labelKey: 'permissions.manage_materials', tab: 'materials', icon: 'inventory_2', color: 'bg-purple-500' },
    'manage_daily_log': { labelKey: 'permissions.manage_daily_log', tab: 'dashboard', icon: 'edit_note', color: 'bg-indigo-500' },
    'manage_files': { labelKey: 'permissions.manage_files', tab: 'pvla', icon: 'folder_shared', color: 'bg-blue-500' },
    'manage_drone': { labelKey: 'permissions.manage_drone', tab: 'drone', icon: 'flight', color: 'bg-red-500' },
    'manage_timeline': { labelKey: 'permissions.manage_timeline', tab: 'timeloc', icon: 'calendar_month', color: 'bg-teal-500' },
    'manage_quality': { labelKey: 'permissions.manage_quality', tab: 'topo', icon: 'flag', color: 'bg-rose-500' }
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
        <div className="w-full md:w-1/2 p-6 bg-iha-800 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">star</span>
                    {t('profile.authorizedAreas')}
                </h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-iha-900 text-slate-400 hover:text-white hover:bg-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {t('profile.authDesc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1 content-start">
                {uniqueShortcuts.map((shortcut, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onNavigate(shortcut.tab)}
                        className="flex flex-col items-center justify-center p-4 bg-iha-900 border border-iha-700 rounded-xl hover:border-blue-500 hover:bg-iha-700 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <span className="material-symbols-outlined text-slate-500 text-xs">arrow_outward</span>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-lg ${shortcut.color} group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined">{shortcut.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors text-center">{t(shortcut.labelKey)}</span>
                    </button>
                ))}
                
                {uniqueShortcuts.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-iha-700 rounded-xl flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">lock_person</span>
                        <p className="text-xs text-slate-500">{t('profile.noAuth')}</p>
                    </div>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-iha-700">
                <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-xl border border-blue-500/20">
                    <span className="material-symbols-outlined text-blue-400">info</span>
                    <div className="text-xs text-blue-200">
                        <p className="font-bold">{t('profile.helpTitle')}</p>
                        <p className="opacity-70">{t('profile.helpDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
