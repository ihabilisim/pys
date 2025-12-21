
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { User, Permission } from '../../types';

// Use Translation Keys for labels and groups
const PERMISSIONS_LIST: { id: Permission; labelKey: string; groupKey: string }[] = [
    { id: 'manage_users', labelKey: 'permissions.manage_users', groupKey: 'permissions.group_system' },
    { id: 'manage_settings', labelKey: 'permissions.manage_settings', groupKey: 'permissions.group_system' },
    { id: 'manage_daily_log', labelKey: 'permissions.manage_daily_log', groupKey: 'permissions.group_site' },
    { id: 'manage_stats', labelKey: 'permissions.manage_stats', groupKey: 'permissions.group_site' },
    { id: 'manage_machinery', labelKey: 'permissions.manage_machinery', groupKey: 'permissions.group_resources' },
    { id: 'manage_materials', labelKey: 'permissions.manage_materials', groupKey: 'permissions.group_resources' },
    { id: 'manage_timeline', labelKey: 'permissions.manage_timeline', groupKey: 'permissions.group_planning' },
    { id: 'manage_map', labelKey: 'permissions.manage_map', groupKey: 'permissions.group_technical' },
    { id: 'manage_files', labelKey: 'permissions.manage_files', groupKey: 'permissions.group_technical' },
    { id: 'manage_quality', labelKey: 'permissions.manage_quality', groupKey: 'permissions.group_technical' },
    { id: 'manage_drone', labelKey: 'permissions.manage_drone', groupKey: 'permissions.group_media' },
    { id: 'manage_notifications', labelKey: 'permissions.manage_notifications', groupKey: 'permissions.group_media' },
];

export const AdminUsers: React.FC = () => {
    const { data } = useData();
    const { currentUser, addUser, updateUser, deleteUser } = useAuth();
    const { showToast, t } = useUI();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({ permissions: [] });

    if (!currentUser || (!currentUser.permissions.includes('manage_users') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingUser.username || !editingUser.password) {
            showToast(t('auth.loginError'), 'error');
            return;
        }
        
        const userData: User = {
            id: editingUser.id || '', 
            username: editingUser.username,
            password: editingUser.password,
            fullName: editingUser.fullName || 'New User',
            jobTitle: editingUser.jobTitle || '',
            email: editingUser.email || '',
            phone: editingUser.phone || '',
            address: editingUser.address || '',
            role: editingUser.role || 'viewer',
            permissions: editingUser.permissions || [] 
        };

        if (editingUser.id) updateUser(editingUser.id, userData);
        else addUser(userData);
        
        showToast(editingUser.id ? t('admin.users.saveSuccess') : t('admin.users.createSuccess'));
        setIsUserModalOpen(false);
    };

    const togglePermission = (perm: Permission) => {
        const current = editingUser.permissions || [];
        setEditingUser({ 
            ...editingUser, 
            permissions: current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm] 
        });
    };

    const toggleAllPermissions = () => {
        if ((editingUser.permissions || []).length === PERMISSIONS_LIST.length) {
            setEditingUser({ ...editingUser, permissions: [] });
        } else {
            setEditingUser({ ...editingUser, permissions: PERMISSIONS_LIST.map(p => p.id) });
        }
    };

    // Group permissions for UI
    const groupedPermissions = PERMISSIONS_LIST.reduce((acc, perm) => {
        if (!acc[perm.groupKey]) acc[perm.groupKey] = [];
        acc[perm.groupKey].push(perm);
        return acc;
    }, {} as Record<string, typeof PERMISSIONS_LIST>);

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">manage_accounts</span>
                        {t('admin.users.title')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{t('admin.users.subtitle')}</p>
                </div>
                <button 
                    onClick={() => { setEditingUser({ permissions: [], role: 'viewer' }); setIsUserModalOpen(true); }} 
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined">person_add</span> {t('admin.users.newUser')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.users.map(user => (
                    <div key={user.id} className="bg-iha-800 border border-iha-700 rounded-2xl overflow-hidden group hover:shadow-2xl hover:border-blue-500/30 transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-lg font-bold text-white border border-slate-600">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{user.fullName}</h4>
                                        <p className="text-xs text-blue-400 font-medium">{user.jobTitle || t(`roles.${user.role}`)}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                    {t(`roles.${user.role}`)}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="material-symbols-outlined text-sm">person</span> {user.username}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="material-symbols-outlined text-sm">call</span> {user.phone || '-'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="material-symbols-outlined text-sm">mail</span> {user.email || '-'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-iha-700 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-bold">{user.permissions.length} {t('admin.users.permDefined')}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit_note</span></button>
                                    <button onClick={() => { if(window.confirm(t('common.deleteConfirm'))) deleteUser(user.id); }} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isUserModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-iha-800 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-iha-700 shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-iha-700 flex justify-between items-center bg-iha-900/50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="p-2 bg-blue-600 rounded-lg"><span className="material-symbols-outlined text-white">badge</span></span>
                                {editingUser.id ? t('admin.users.editUser') : t('admin.users.newUser')}
                            </h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="userForm" onSubmit={handleSaveUser} className="space-y-8">
                                {/* ACCOUNT INFO */}
                                <div>
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 border-l-4 border-blue-500 pl-3">{t('admin.users.accountInfo')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.username')} *</label><input value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" required /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.password')} *</label><input type="text" value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" required /></div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">{t('admin.users.role')}</label>
                                            <select value={editingUser.role || 'viewer'} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none">
                                                <option value="viewer">{t('roles.viewer')}</option>
                                                <option value="editor">{t('roles.editor')}</option>
                                                <option value="admin">{t('roles.admin')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* PROFILE DETAILS */}
                                <div>
                                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4 border-l-4 border-orange-500 pl-3">{t('admin.users.profileDetails')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.fullName')}</label><input value={editingUser.fullName || ''} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.jobTitle')}</label><input value={editingUser.jobTitle || ''} onChange={e => setEditingUser({...editingUser, jobTitle: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Ex: Engineer" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.phone')}</label><input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">{t('admin.users.email')}</label><input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div className="md:col-span-2"><label className="block text-xs text-slate-500 mb-1">{t('admin.users.address')}</label><input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                    </div>
                                </div>

                                {/* PERMISSIONS MATRIX */}
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">{t('admin.users.authMatrix')}</h4>
                                        <button type="button" onClick={toggleAllPermissions} className="text-xs text-blue-400 hover:text-white underline">{t('admin.users.selectAll')}</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(groupedPermissions).map(([groupKey, perms]) => (
                                            <div key={groupKey} className="bg-iha-900 border border-iha-700 rounded-xl p-4">
                                                <h5 className="text-xs font-bold text-slate-400 mb-3 uppercase border-b border-iha-800 pb-2">{t(groupKey)}</h5>
                                                <div className="space-y-2">
                                                    {perms.map(perm => (
                                                        <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${editingUser.permissions?.includes(perm.id) ? 'bg-emerald-500 border-emerald-600' : 'bg-iha-800 border-iha-600 group-hover:border-slate-500'}`}>
                                                                {editingUser.permissions?.includes(perm.id) && <span className="material-symbols-outlined text-sm text-white font-bold">check</span>}
                                                            </div>
                                                            <input type="checkbox" className="hidden" checked={editingUser.permissions?.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                                                            <span className={`text-sm ${editingUser.permissions?.includes(perm.id) ? 'text-white font-medium' : 'text-slate-400'}`}>{t(perm.labelKey)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-iha-700 bg-iha-900/50 rounded-b-2xl flex justify-end gap-3">
                            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">{t('common.cancel')}</button>
                            <button type="submit" form="userForm" className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-colors">{t('common.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
