
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Language, LocalizedString, ShortcutItem } from '../../types';
import { apiService } from '../../services/api';

export const AdminShortcuts: React.FC = () => {
    const { data, addShortcut, updateShortcut, deleteShortcut } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI();
    const [formLang, setFormLang] = useState<Language>('tr');
    
    const [editShortcutId, setEditShortcutId] = useState<string | null>(null);
    const [newShortcut, setNewShortcut] = useState<{
        name: LocalizedString;
        description: LocalizedString;
        type: 'PDF' | 'DWG';
        sourceType: 'FILE' | 'LINK';
        url: string;
        file?: File | null;
        revisionDate: string;
    }>({
        name: { tr: '', en: '', ro: '' },
        description: { tr: '', en: '', ro: '' }, 
        type: 'PDF',
        sourceType: 'FILE',
        url: '',
        file: null,
        revisionDate: new Date().toISOString().split('T')[0]
    });

    if (!currentUser || (!currentUser.permissions.includes('manage_files') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    const handleAddShortcut = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShortcut.name.tr) {
            showToast(t('admin.shortcuts.name'), 'error');
            return;
        }

        let finalPath = newShortcut.url;

        // Dosya Yükleme İşlemi
        if (newShortcut.sourceType === 'FILE') {
            if (newShortcut.file) {
                showToast(t('common.loading'), 'info');
                const { publicUrl, error } = await apiService.uploadFile(newShortcut.file, 'app-assets', 'shortcuts');

                if (error) {
                    showToast(`Upload Error: ${error}`, 'error');
                    return; 
                } else if (publicUrl) {
                    finalPath = publicUrl;
                }
            } else if (editShortcutId) {
                const existing = data.shortcuts.find(s => s.id === editShortcutId);
                if (existing) finalPath = existing.pathOrUrl;
            } else {
                showToast(t('admin.shortcuts.fileUpload'), 'error');
                return;
            }
        }

        const shortcutData: Omit<ShortcutItem, 'id'> = {
            name: newShortcut.name,
            description: newShortcut.description,
            type: newShortcut.type,
            sourceType: newShortcut.sourceType,
            pathOrUrl: finalPath,
            revisionDate: newShortcut.revisionDate
        };

        if (editShortcutId) {
            updateShortcut(editShortcutId, shortcutData);
            setEditShortcutId(null);
            showToast(t('admin.shortcuts.success'));
        } else {
            addShortcut(shortcutData);
            showToast(t('admin.shortcuts.success'));
        }
        
        setNewShortcut({ name: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, type: 'PDF', sourceType: 'FILE', url: '', file: null, revisionDate: new Date().toISOString().split('T')[0] });
    };

    const startEditShortcut = (item: ShortcutItem) => {
        setEditShortcutId(item.id);
        setNewShortcut({
            name: item.name,
            description: item.description,
            type: item.type,
            sourceType: item.sourceType,
            url: item.sourceType === 'LINK' ? item.pathOrUrl : '',
            file: null,
            revisionDate: item.revisionDate || new Date().toISOString().split('T')[0]
        });
    };

    const cancelEditShortcut = () => {
        setEditShortcutId(null);
        setNewShortcut({ name: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, type: 'PDF', sourceType: 'FILE', url: '', file: null, revisionDate: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4">{editShortcutId ? t('admin.shortcuts.titleEdit') : t('admin.shortcuts.titleNew')}</h3>
                <form onSubmit={handleAddShortcut} className="space-y-4">
                    <div className="flex gap-2 mb-2">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>))}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder={`${t('admin.shortcuts.name')} (${formLang})`} value={newShortcut.name[formLang]} onChange={e => setNewShortcut({...newShortcut, name: {...newShortcut.name, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        <input placeholder={`${t('common.description')} (${formLang})`} value={newShortcut.description[formLang]} onChange={e => setNewShortcut({...newShortcut, description: {...newShortcut.description, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={newShortcut.type} onChange={e => setNewShortcut({...newShortcut, type: e.target.value as any})} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white"><option value="PDF">PDF</option><option value="DWG">DWG</option></select>
                        <select value={newShortcut.sourceType} onChange={e => setNewShortcut({...newShortcut, sourceType: e.target.value as any})} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white"><option value="FILE">{t('admin.shortcuts.fileUpload')}</option><option value="LINK">{t('admin.shortcuts.externalLink')}</option></select>
                        
                        {newShortcut.sourceType === 'LINK' ? (
                            <input placeholder="URL (https://...)" value={newShortcut.url} onChange={e => setNewShortcut({...newShortcut, url: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        ) : (
                            <div className="relative">
                                <input type="file" onChange={e => setNewShortcut({...newShortcut, file: e.target.files ? e.target.files[0] : null})} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-iha-700 file:text-white hover:file:bg-iha-600 cursor-pointer" accept={newShortcut.type === 'PDF' ? '.pdf' : '.dwg'} />
                                {editShortcutId && !newShortcut.file && <span className="text-[10px] text-yellow-500 absolute -bottom-4 left-0">{t('admin.shortcuts.fileSelect')}</span>}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-iha-blue hover:bg-blue-600 text-white rounded-lg p-3 font-bold transition-colors">{editShortcutId ? t('common.update') : t('common.add')}</button>
                        {editShortcutId && <button type="button" onClick={cancelEditShortcut} className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-3 font-bold transition-colors">{t('common.cancel')}</button>}
                    </div>
                </form>
            </div>
            <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden">
                <table className="w-full text-left text-sm"><thead className="bg-iha-900 text-slate-400"><tr><th className="p-4">{t('common.title')}</th><th className="p-4">{t('common.type')}</th><th className="p-4">{t('common.date')}</th><th className="p-4 text-right">{t('common.actions')}</th></tr></thead><tbody className="divide-y divide-iha-700 text-slate-300">{data.shortcuts.map(item => (<tr key={item.id} className="hover:bg-iha-900/50"><td className="p-4 font-bold text-white"><div className="flex flex-col"><span className="text-sm">{item.name['tr']}</span><a href={item.pathOrUrl} target="_blank" className="text-[10px] text-blue-400 hover:underline truncate max-w-[200px]">{item.pathOrUrl}</a></div></td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'DWG' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>{item.type}</span></td><td className="p-4">{item.revisionDate}</td><td className="p-4 text-right"><button onClick={() => startEditShortcut(item)} className="text-blue-400 hover:text-white mr-2">{t('common.edit')}</button><button onClick={() => {if(window.confirm(t('common.deleteConfirm'))) deleteShortcut(item.id)}} className="text-red-400 hover:text-white">{t('common.delete')}</button></td></tr>))}</tbody></table>
            </div>
        </div>
    );
};
