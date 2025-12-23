
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { Language, LocalizedString } from '../../../types';

export const NotificationPanel: React.FC = () => {
    const { data, loadNotifications, addNotification, updateNotification, deleteNotification } = useData();
    const { t } = useUI();
    const [formLang, setFormLang] = useState<Language>('tr');
    
    const [editNoteId, setEditNoteId] = useState<string | null>(null);
    const [newUpdateMessage, setNewUpdateMessage] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newUpdateAuthor, setNewUpdateAuthor] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleAddUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdateMessage.tr) return;
        if (editNoteId) {
            updateNotification(editNoteId, { message: newUpdateMessage, author: newUpdateAuthor });
            setEditNoteId(null);
        } else {
            addNotification({
                message: newUpdateMessage,
                author: newUpdateAuthor || 'Admin',
                date: new Date().toISOString().split('T')[0],
                type: 'update'
            });
        }
        setNewUpdateMessage({ tr: '', en: '', ro: '' });
        setNewUpdateAuthor('');
    };

    const startEditNote = (note: any) => {
        setEditNoteId(note.id);
        setNewUpdateMessage(note.message);
        setNewUpdateAuthor(note.author);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4">{editNoteId ? t('admin.dashboard.editNotification') : t('admin.dashboard.newNotification')}</h3>
                <div className="flex gap-2 mb-4">
                    {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                        <button key={lang} onClick={() => setFormLang(lang)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${formLang === lang ? 'bg-iha-blue text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                    ))}
                </div>
                <form onSubmit={handleAddUpdate} className="grid gap-4">
                    <textarea placeholder={`${formLang.toUpperCase()}`} value={newUpdateMessage[formLang]} onChange={e => setNewUpdateMessage({...newUpdateMessage, [formLang]: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white h-24 resize-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder={t('admin.dashboard.author')} value={newUpdateAuthor} onChange={e => setNewUpdateAuthor(e.target.value)} className="bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        <button className="flex-1 bg-iha-blue text-white rounded-lg p-3 font-semibold">{editNoteId ? t('common.update') : t('admin.dashboard.publish')}</button>
                    </div>
                </form>
            </div>
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <div className="space-y-3">
                    {data.notifications.map(note => (
                        <div key={note.id} className="bg-iha-900 p-3 rounded-lg border border-iha-700 flex justify-between items-start">
                            <div><p className="text-white text-sm">{note.message.tr}</p><p className="text-xs text-slate-500">{note.date} • {note.author}</p></div>
                            <div className="flex gap-2"><button onClick={() => startEditNote(note)} className="text-blue-400 hover:text-white"><span className="material-symbols-outlined text-lg">edit</span></button><button onClick={() => { if(window.confirm('Silmek istediğinize emin misiniz?')) deleteNotification(note.id); }} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-lg">delete</span></button></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
