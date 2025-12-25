
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { Language, ChangelogEntry, LocalizedString } from '../../types';

export const AdminChangelog: React.FC = () => {
    const { data, addChangelog, updateChangelog, deleteChangelog } = useData();
    const { showToast, t } = useUI();
    const [formLang, setFormLang] = useState<Language>('tr');

    // Sort logs: newest date first, then highest version
    const sortedLogs = [...data.changelog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Form States
    const [editId, setEditId] = useState<string | null>(null);
    const [entry, setEntry] = useState<{
        version: string;
        date: string;
        type: 'major' | 'minor' | 'patch';
        title: LocalizedString;
        changesText: { tr: string; en: string; ro: string }; // Now multilingual
    }>({
        version: '',
        date: new Date().toISOString().split('T')[0],
        type: 'minor',
        title: { tr: '', en: '', ro: '' },
        changesText: { tr: '', en: '', ro: '' }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!entry.version || !entry.title.tr) {
            showToast('Lütfen versiyon ve başlık giriniz.', 'error');
            return;
        }

        // Convert text areas to arrays
        const changesArrays = {
            tr: entry.changesText.tr.split('\n').filter(line => line.trim() !== ''),
            en: entry.changesText.en.split('\n').filter(line => line.trim() !== ''),
            ro: entry.changesText.ro.split('\n').filter(line => line.trim() !== '')
        };

        // If English or Romanian changes are empty, fallback to Turkish
        if (changesArrays.en.length === 0) changesArrays.en = [...changesArrays.tr];
        if (changesArrays.ro.length === 0) changesArrays.ro = [...changesArrays.tr];

        const payload = {
            version: entry.version,
            date: entry.date,
            type: entry.type,
            title: entry.title,
            changes: changesArrays
        };

        if(editId) {
            updateChangelog(editId, payload);
            showToast('Günlük güncellendi.', 'success');
            setEditId(null);
        } else {
            addChangelog(payload);
            showToast('Yeni sürüm notu eklendi.', 'success');
        }

        // Reset
        setEntry({
            version: '',
            date: new Date().toISOString().split('T')[0],
            type: 'minor',
            title: { tr: '', en: '', ro: '' },
            changesText: { tr: '', en: '', ro: '' }
        });
    };

    const startEdit = (log: ChangelogEntry) => {
        setEditId(log.id);
        setEntry({
            version: log.version,
            date: log.date,
            type: log.type,
            title: log.title,
            changesText: {
                tr: log.changes.tr.join('\n'),
                en: log.changes.en.join('\n'),
                ro: log.changes.ro.join('\n')
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEntry({
            version: '',
            date: new Date().toISOString().split('T')[0],
            type: 'minor',
            title: { tr: '', en: '', ro: '' },
            changesText: { tr: '', en: '', ro: '' }
        });
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t('common.deleteConfirm'))) {
            deleteChangelog(id);
            showToast('Kayıt silindi.', 'info');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">history_edu</span>
                        Değişiklik Günlüğü (Changelog)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Uygulama versiyonlarını ve yapılan değişiklikleri buradan yönetebilirsiniz.</p>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{editId ? 'Kaydı Düzenle' : 'Yeni Sürüm Ekle'}</h4>
                    <div className="flex gap-2">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-purple-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>))}</div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 font-bold">Versiyon (Örn: v2.5.0)</label>
                            <input value={entry.version} onChange={e => setEntry({...entry, version: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono" placeholder="vX.X.X" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 font-bold">Yayın Tarihi</label>
                            <input type="date" value={entry.date} onChange={e => setEntry({...entry, date: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 font-bold">Tip</label>
                            <select value={entry.type} onChange={e => setEntry({...entry, type: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white">
                                <option value="major">Major (Büyük)</option>
                                <option value="minor">Minor (Özellik)</option>
                                <option value="patch">Patch (Düzeltme)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 block mb-1 font-bold">Başlık ({formLang})</label>
                        <input value={entry.title[formLang]} onChange={e => setEntry({...entry, title: {...entry.title, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder="Sürüm Başlığı" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 block mb-1 font-bold">Değişiklikler ({formLang}) - Her satır bir madde</label>
                        <textarea 
                            value={entry.changesText[formLang]} 
                            onChange={e => setEntry({...entry, changesText: { ...entry.changesText, [formLang]: e.target.value }})} 
                            className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm h-32" 
                            placeholder={`- Yeni özellik eklendi\n- Hata giderildi...`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        {editId && <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">İptal</button>}
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg">{editId ? 'Güncelle' : 'Yayınla'}</button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                {sortedLogs.map(log => (
                    <div key={log.id} className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden group hover:border-purple-500/30 transition-all">
                        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-iha-700 bg-iha-900/30">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${log.type === 'major' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : log.type === 'minor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                                        {log.type}
                                    </span>
                                    <h4 className="text-xl font-bold text-white font-mono">{log.version}</h4>
                                    <span className="text-sm text-slate-500 border-l border-slate-700 pl-3">{log.date}</span>
                                </div>
                                <h5 className="text-sm font-bold text-slate-300">{log.title[formLang] || log.title['tr']}</h5>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(log)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-2">
                                {(log.changes[formLang] && log.changes[formLang].length > 0 ? log.changes[formLang] : log.changes['tr']).map((change, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="material-symbols-outlined text-base text-purple-500 mt-0.5">check_small</span>
                                        <span className="leading-relaxed">{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
