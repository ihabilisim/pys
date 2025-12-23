
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { User, Permission, UserGroup, LocalizedString, Language } from '../../types';
import { apiService } from '../../services/api';

// Static Permissions List (Kept for fallback or base definition)
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
    
    // --- TABS ---
    const [activeTab, setActiveTab] = useState<'USERS' | 'GROUPS'>('USERS');

    // --- USER MODAL STATES ---
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({ permissions: [] });

    // --- GROUP MANAGEMENT STATES ---
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Partial<UserGroup>>({ 
        name: { tr: '', en: '', ro: '' }, 
        color: '#3b82f6', 
        icon: 'group',
        permissions: [] 
    });
    const [groupLang, setGroupLang] = useState<Language>('tr');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const groups = await apiService.fetchUserGroups();
        setUserGroups(groups);
    };

    if (!currentUser || (!currentUser.permissions.includes('manage_users') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    // --- USER HANDLERS ---

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
            permissions: editingUser.permissions || [],
            groupId: editingUser.groupId || undefined,
            avatarUrl: editingUser.avatarUrl || null
        };

        if (editingUser.id) updateUser(editingUser.id, userData);
        else addUser(userData);
        
        showToast(editingUser.id ? t('admin.users.saveSuccess') : t('admin.users.createSuccess'));
        setIsUserModalOpen(false);
    };

    const handleGroupSelectionForUser = (groupId: string) => {
        const group = userGroups.find(g => g.id === groupId);
        if (group) {
            setEditingUser({
                ...editingUser,
                groupId: group.id,
                permissions: group.permissions, // Auto-fill permissions
                jobTitle: group.name['tr'] // Optional: auto-fill job title
            });
        } else {
            setEditingUser({ ...editingUser, groupId: undefined });
        }
    };

    const togglePermissionForUser = (perm: Permission) => {
        const current = editingUser.permissions || [];
        setEditingUser({ 
            ...editingUser, 
            permissions: current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm] 
        });
    };

    // --- GROUP HANDLERS ---

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGroup.name?.tr) {
            showToast('Lütfen grup adını giriniz.', 'error');
            return;
        }

        const groupData: Omit<UserGroup, 'id'> = {
            name: editingGroup.name,
            color: editingGroup.color || '#3b82f6',
            icon: editingGroup.icon || 'group',
            permissions: editingGroup.permissions || []
        };

        if (editingGroup.id) {
            await apiService.updateUserGroup(editingGroup.id, groupData);
            showToast('Birim güncellendi.');
        } else {
            await apiService.addUserGroup(groupData);
            showToast('Yeni birim oluşturuldu.');
        }
        
        setIsGroupModalOpen(false);
        loadGroups();
    };

    const handleDeleteGroup = async (id: string) => {
        if (window.confirm('Bu birimi silmek istediğinize emin misiniz?')) {
            await apiService.deleteUserGroup(id);
            loadGroups();
            showToast('Birim silindi.');
        }
    };

    const togglePermissionForGroup = (perm: Permission) => {
        const current = editingGroup.permissions || [];
        setEditingGroup({ 
            ...editingGroup, 
            permissions: current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm] 
        });
    };

    // Group permissions helper
    const groupedPermissions = PERMISSIONS_LIST.reduce((acc, perm) => {
        if (!acc[perm.groupKey]) acc[perm.groupKey] = [];
        acc[perm.groupKey].push(perm);
        return acc;
    }, {} as Record<string, typeof PERMISSIONS_LIST>);

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            
            {/* Top Navigation */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit mb-6">
                <button 
                    onClick={() => setActiveTab('USERS')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'USERS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-lg">group</span> {t('admin.users.title')}
                </button>
                <button 
                    onClick={() => setActiveTab('GROUPS')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'GROUPS' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-lg">diversity_3</span> Birimler & Yetkiler
                </button>
            </div>

            {/* --- USERS TAB --- */}
            {activeTab === 'USERS' && (
                <>
                    <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">manage_accounts</span>
                                {t('admin.users.subtitle')}
                            </h3>
                        </div>
                        <button 
                            onClick={() => { setEditingUser({ permissions: [], role: 'viewer' }); setIsUserModalOpen(true); }} 
                            className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined">person_add</span> {t('admin.users.newUser')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.users.map(user => {
                            const userGroup = userGroups.find(g => g.id === user.groupId);
                            return (
                                <div key={user.id} className="bg-iha-800 border border-iha-700 rounded-2xl overflow-hidden group hover:shadow-2xl hover:border-blue-500/30 transition-all">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-slate-600" alt={user.username} />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-lg font-bold text-white border border-slate-600">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-white">{user.fullName}</h4>
                                                    <p className="text-xs text-blue-400 font-medium">{user.jobTitle || t(`roles.${user.role}`)}</p>
                                                </div>
                                            </div>
                                            {userGroup && (
                                                <span 
                                                    className="px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1"
                                                    style={{ backgroundColor: `${userGroup.color}20`, color: userGroup.color, borderColor: `${userGroup.color}40` }}
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">{userGroup.icon}</span>
                                                    {userGroup.name['tr']}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="material-symbols-outlined text-sm">person</span> {user.username}
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
                            );
                        })}
                    </div>
                </>
            )}

            {/* --- GROUPS TAB --- */}
            {activeTab === 'GROUPS' && (
                <>
                    <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">diversity_3</span>
                                Birim & Grup Yönetimi
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Personel gruplarını tanımlayın ve toplu yetkilendirme yapın.</p>
                        </div>
                        <button 
                            onClick={() => { setEditingGroup({ name: { tr: '', en: '', ro: '' }, permissions: [], color: '#3b82f6', icon: 'group' }); setIsGroupModalOpen(true); }} 
                            className="bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined">add_circle</span> Yeni Birim Ekle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userGroups.map(group => (
                            <div key={group.id} className="bg-iha-800 border border-iha-700 rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all">
                                <div className="p-5 border-b border-iha-700 flex justify-between items-center" style={{ backgroundColor: `${group.color}10` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: group.color }}>
                                            <span className="material-symbols-outlined">{group.icon}</span>
                                        </div>
                                        <h4 className="font-bold text-white">{group.name['tr']}</h4>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }} className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white"><span className="material-symbols-outlined text-sm">edit</span></button>
                                        <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 hover:bg-red-500/20 rounded text-slate-300 hover:text-red-400"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-3">Tanımlı Yetkiler ({group.permissions.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.permissions.slice(0, 6).map(perm => (
                                            <span key={perm} className="text-[9px] bg-iha-900 border border-iha-700 px-2 py-1 rounded text-slate-300">
                                                {t(`permissions.${perm}`) !== `permissions.${perm}` ? t(`permissions.${perm}`) : perm}
                                            </span>
                                        ))}
                                        {group.permissions.length > 6 && (
                                            <span className="text-[9px] bg-iha-900 border border-iha-700 px-2 py-1 rounded text-slate-500">+{group.permissions.length - 6} daha</span>
                                        )}
                                        {group.permissions.length === 0 && <span className="text-xs text-slate-600 italic">Yetki yok</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* --- USER MODAL --- */}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Account Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3">{t('admin.users.accountInfo')}</h4>
                                        <input value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder={t('admin.users.username')} required />
                                        <input type="text" value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder={t('admin.users.password')} required />
                                        <input value={editingUser.fullName || ''} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder={t('admin.users.fullName')} />
                                        <input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder={t('admin.users.email')} />
                                    </div>

                                    {/* Unit & Role Assignment */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest border-l-4 border-orange-500 pl-3">Birim ve Yetki</h4>
                                        
                                        {/* GROUP SELECTOR */}
                                        <div className="bg-iha-900 border border-iha-700 p-4 rounded-xl">
                                            <label className="block text-xs text-slate-400 mb-2 font-bold uppercase">Bağlı Olduğu Birim (Departman)</label>
                                            <select 
                                                value={editingUser.groupId || ''} 
                                                onChange={e => handleGroupSelectionForUser(e.target.value)}
                                                className="w-full bg-iha-800 border border-iha-600 rounded-lg p-3 text-white outline-none focus:border-purple-500"
                                            >
                                                <option value="">-- Özel Yetkilendirme (Birim Yok) --</option>
                                                {userGroups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name['tr']}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-500 mt-2">
                                                * Birim seçildiğinde, birime ait yetkiler otomatik olarak aşağıya yansıtılır.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={editingUser.jobTitle || ''} onChange={e => setEditingUser({...editingUser, jobTitle: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white" placeholder={t('admin.users.jobTitle')} />
                                            <select value={editingUser.role || 'viewer'} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white">
                                                <option value="viewer">{t('roles.viewer')}</option>
                                                <option value="editor">{t('roles.editor')}</option>
                                                <option value="admin">{t('roles.admin')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* PERMISSIONS MATRIX (Read-onlyish if group selected, or fully editable) */}
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">{t('admin.users.authMatrix')}</h4>
                                        {editingUser.groupId && <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">Birimden gelen yetkiler seçili</span>}
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
                                                            <input type="checkbox" className="hidden" checked={editingUser.permissions?.includes(perm.id)} onChange={() => togglePermissionForUser(perm.id)} />
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

            {/* --- GROUP MODAL --- */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-iha-800 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-iha-700 shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-iha-700 flex justify-between items-center bg-iha-900/50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="p-2 bg-purple-600 rounded-lg"><span className="material-symbols-outlined text-white">diversity_3</span></span>
                                {editingGroup.id ? 'Birimi Düzenle' : 'Yeni Birim Oluştur'}
                            </h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="groupForm" onSubmit={handleSaveGroup} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 flex gap-2 mb-2">
                                        {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                            <button key={lang} type="button" onClick={() => setGroupLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${groupLang === lang ? 'bg-purple-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                                        ))}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-500 mb-1">Birim Adı ({groupLang})</label>
                                        <input 
                                            value={editingGroup.name?.[groupLang] || ''} 
                                            onChange={e => setEditingGroup({...editingGroup, name: { ...editingGroup.name, [groupLang]: e.target.value } as LocalizedString })} 
                                            className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                                            placeholder="Örn: Harita Ekibi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Birim Rengi</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={editingGroup.color} onChange={e => setEditingGroup({...editingGroup, color: e.target.value})} className="h-11 w-16 bg-transparent border-0 cursor-pointer rounded" />
                                            <input value={editingGroup.color} readOnly className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-xs" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Birim İkonu (Material Symbol)</label>
                                        <div className="relative">
                                            <input value={editingGroup.icon} onChange={e => setEditingGroup({...editingGroup, icon: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none" placeholder="group" />
                                            <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">{editingGroup.icon || 'help'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white border-b border-iha-700 pb-2">Birim Yetkileri</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(groupedPermissions).map(([groupKey, perms]) => (
                                            <div key={groupKey} className="bg-iha-900 border border-iha-700 rounded-xl p-3">
                                                <h5 className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{t(groupKey)}</h5>
                                                <div className="space-y-1">
                                                    {perms.map(perm => (
                                                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer group hover:bg-white/5 p-1 rounded">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-iha-600 bg-iha-800 text-purple-500 focus:ring-purple-500" checked={editingGroup.permissions?.includes(perm.id)} onChange={() => togglePermissionForGroup(perm.id)} />
                                                            <span className={`text-xs ${editingGroup.permissions?.includes(perm.id) ? 'text-white' : 'text-slate-400'}`}>{t(perm.labelKey)}</span>
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
                            <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">{t('common.cancel')}</button>
                            <button type="submit" form="groupForm" className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/20 transition-colors">{t('common.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
