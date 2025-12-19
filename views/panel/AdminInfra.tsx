
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Import useAuth to access user related data */
import { useAuth } from '../../context/AuthContext';
import { Language, LocalizedString, InfrastructureProject } from '../../types';

export const AdminInfra: React.FC = () => {
    const { data, addInfraProject, updateInfraProject, deleteInfraProject } = useData();
    /* Use Auth context for currentUser */
    const { currentUser } = useAuth();
    const [formLang, setFormLang] = useState<Language>('tr');
    
    const [editInfraId, setEditInfraId] = useState<string | null>(null);
    const [newInfra, setNewInfra] = useState<{
        name: LocalizedString;
        description: LocalizedString;
        link: string;
    }>({ 
        name: { tr: '', en: '', ro: '' }, 
        description: { tr: '', en: '', ro: '' }, 
        link: '' 
    });

    if (!currentUser || (!currentUser.permissions.includes('manage_files') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleAddInfra = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInfra.name.tr) return;
        const infraData: Omit<InfrastructureProject, 'id'> = {
            name: newInfra.name,
            description: newInfra.description,
            link: newInfra.link
        };
        if (editInfraId) {
            updateInfraProject(editInfraId, infraData);
            setEditInfraId(null);
        } else {
            addInfraProject(infraData);
        }
        setNewInfra({ name: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, link: '' });
    };

    const startEditInfra = (proj: InfrastructureProject) => {
        setEditInfraId(proj.id);
        setNewInfra({ name: proj.name, description: proj.description, link: proj.link || '' });
    };

    const cancelEditInfra = () => {
        setEditInfraId(null);
        setNewInfra({ name: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, link: '' });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4">{editInfraId ? 'Altyapı Projesini Düzenle' : 'Yeni Altyapı Projesi Ekle'}</h3>
                <form onSubmit={handleAddInfra} className="space-y-4">
                    <div className="flex gap-2 mb-2">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>))}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder={`Proje Adı (${formLang})`} value={newInfra.name[formLang]} onChange={e => setNewInfra({...newInfra, name: {...newInfra.name, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        <input placeholder={`Açıklama (${formLang})`} value={newInfra.description[formLang]} onChange={e => setNewInfra({...newInfra, description: {...newInfra.description, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                    </div>
                    <input placeholder="Bağlantı Linki (Opsiyonel)" value={newInfra.link} onChange={e => setNewInfra({...newInfra, link: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-iha-blue text-white rounded-lg p-3 font-bold">{editInfraId ? 'Güncelle' : 'Ekle'}</button>
                        {editInfraId && <button type="button" onClick={cancelEditInfra} className="bg-slate-700 text-white rounded-lg p-3 font-bold">İptal</button>}
                    </div>
                </form>
            </div>
            <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300"><thead className="bg-iha-900 text-slate-500"><tr><th className="p-4">Proje Adı</th><th className="p-4">Açıklama</th><th className="p-4 text-right">İşlem</th></tr></thead><tbody className="divide-y divide-iha-700">{data.infraProjects.map(proj => (<tr key={proj.id}><td className="p-4 font-bold text-white">{proj.name['tr']}</td><td className="p-4">{proj.description['tr']}</td><td className="p-4 text-right"><button onClick={() => startEditInfra(proj)} className="text-blue-400 hover:text-white mr-2">Düzenle</button><button onClick={() => deleteInfraProject(proj.id)} className="text-red-400 hover:text-white">Sil</button></td></tr>))}</tbody></table>
            </div>
        </div>
    );
};
