
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Language, LocalizedString, InfrastructureProject } from '../../types';
import { GenericTable, Column } from '../../components/shared/GenericTable';

export const AdminInfra: React.FC = () => {
    const { data, addInfraProject, updateInfraProject, deleteInfraProject } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI();
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
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
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
            showToast(t('common.update'));
        } else {
            addInfraProject(infraData);
            showToast(t('common.save'));
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

    // Columns Definition for Generic Table
    const columns: Column<InfrastructureProject>[] = [
        { 
            header: t('admin.infra.projectName'), 
            accessor: (item) => <span className="font-bold text-white">{item.name['tr']}</span> 
        },
        { 
            header: t('common.description'), 
            accessor: (item) => item.description['tr'] 
        },
        {
            header: 'Link',
            accessor: (item) => item.link ? <a href={item.link} target="_blank" className="text-blue-400 hover:underline text-xs">Link</a> : '-'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4">{editInfraId ? t('admin.infra.titleEdit') : t('admin.infra.titleNew')}</h3>
                <form onSubmit={handleAddInfra} className="space-y-4">
                    <div className="flex gap-2 mb-2">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>))}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder={`${t('admin.infra.projectName')} (${formLang})`} value={newInfra.name[formLang]} onChange={e => setNewInfra({...newInfra, name: {...newInfra.name, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                        <input placeholder={`${t('common.description')} (${formLang})`} value={newInfra.description[formLang]} onChange={e => setNewInfra({...newInfra, description: {...newInfra.description, [formLang]: e.target.value}})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                    </div>
                    <input placeholder={t('admin.infra.link')} value={newInfra.link} onChange={e => setNewInfra({...newInfra, link: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-iha-blue text-white rounded-lg p-3 font-bold">{editInfraId ? t('common.update') : t('common.add')}</button>
                        {editInfraId && <button type="button" onClick={cancelEditInfra} className="bg-slate-700 text-white rounded-lg p-3 font-bold">{t('common.cancel')}</button>}
                    </div>
                </form>
            </div>
            
            <GenericTable 
                data={data.infraProjects}
                columns={columns}
                keyField="id"
                onEdit={startEditInfra}
                onDelete={(item) => deleteInfraProject(item.id)}
            />
        </div>
    );
};
