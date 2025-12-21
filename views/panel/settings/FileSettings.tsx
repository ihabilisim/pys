
import React from 'react';
import { AppSettings, PVLAStructure } from '../../../types';
import { useUI } from '../../../context/UIContext';

interface Props {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    structures: PVLAStructure[];
}

export const FileSettings: React.FC<Props> = ({ settings, setSettings, structures }) => {
    const { t } = useUI();
    return (
        <div className="space-y-6">
            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                <h4 className="text-sm font-bold text-white mb-4 border-b border-iha-700 pb-2">{t('admin.settings.filePaths')}</h4>
                <div className="space-y-4">
                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.bridgePath')}</label><input value={settings.defaultBridgePath} onChange={e => setSettings({...settings, defaultBridgePath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.culvertPath')}</label><input value={settings.defaultCulvertPath} onChange={e => setSettings({...settings, defaultCulvertPath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                    <div><label className="text-xs text-slate-500 block mb-1">{t('admin.settings.shortcutPath')}</label><input value={settings.defaultShortcutPath} onChange={e => setSettings({...settings, defaultShortcutPath: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                </div>
            </div>
            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-iha-700 pb-2"><span className="material-symbols-outlined text-yellow-500">folder_special</span>{t('admin.settings.specialPaths')}</h4>
                <div className="overflow-x-auto max-h-64 custom-scrollbar">
                    <table className="w-full text-left text-xs">
                        <thead className="text-slate-500 uppercase font-bold border-b border-iha-700">
                            <tr><th className="py-2">{t('common.type')}</th><th className="py-2">{t('common.title')}</th><th className="py-2">KM</th><th className="py-2">Path</th></tr>
                        </thead>
                        <tbody className="divide-y divide-iha-800 text-slate-300">
                            {structures.filter(s => s.path).map(s => (
                                <tr key={s.id} className="hover:bg-iha-800/50">
                                    <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${s.type === 'Bridge' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'}`}>{s.type}</span></td>
                                    <td className="py-2 font-bold">{s.name}</td>
                                    <td className="py-2">{s.km}</td>
                                    <td className="py-2 font-mono text-yellow-500">{s.path}</td>
                                </tr>
                            ))}
                            {!structures.some(s => s.path) && (<tr><td colSpan={4} className="py-4 text-center text-slate-500 italic">{t('admin.settings.noSpecialPaths')}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
