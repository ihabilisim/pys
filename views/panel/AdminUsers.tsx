
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { User, Permission } from '../../types';

// Definition of all available permissions with labels
const PERMISSIONS_LIST: { id: Permission; label: string; group: string }[] = [
    { id: 'manage_users', label: 'Kullanıcı Yönetimi', group: 'Sistem' },
    { id: 'manage_settings', label: 'Genel Ayarlar', group: 'Sistem' },
    { id: 'manage_daily_log', label: 'Günlük Raporlar', group: 'Saha Yönetimi' },
    { id: 'manage_stats', label: 'İstatistik & İSG', group: 'Saha Yönetimi' },
    { id: 'manage_machinery', label: 'Makine Parkı', group: 'Kaynaklar' },
    { id: 'manage_materials', label: 'Malzeme & BoQ', group: 'Kaynaklar' },
    { id: 'manage_timeline', label: 'İş Programı (Time-Loc)', group: 'Planlama' },
    { id: 'manage_map', label: 'Harita & Topoğrafya', group: 'Teknik' },
    { id: 'manage_files', label: 'PVLA & Dosyalar', group: 'Teknik' },
    { id: 'manage_quality', label: 'Kalite (NCR/Snag)', group: 'Teknik' },
    { id: 'manage_drone', label: 'Drone Verileri', group: 'Medya' },
    { id: 'manage_notifications', label: 'Duyurular', group: 'Medya' },
];

export const AdminUsers: React.FC = () => {
    const { data } = useData();
    const { currentUser, addUser, updateUser, deleteUser } = useAuth();
    const { showToast } = useUI();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({ permissions: [] });

    if (!currentUser || (!currentUser.permissions.includes('manage_users') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingUser.username || !editingUser.password) {
            showToast('Kullanıcı adı ve şifre zorunludur.', 'error');
            return;
        }
        
        const userData: User = {
            id: editingUser.id || '', // Will be generated if new
            username: editingUser.username,
            password: editingUser.password,
            fullName: editingUser.fullName || 'Yeni Kullanıcı',
            jobTitle: editingUser.jobTitle || '',
            email: editingUser.email || '',
            phone: editingUser.phone || '',
            address: editingUser.address || '',
            role: editingUser.role || 'viewer',
            permissions: editingUser.permissions || [] 
        };

        if (editingUser.id) updateUser(editingUser.id, userData);
        else addUser(userData);
        
        showToast(editingUser.id ? 'Kullanıcı profili güncellendi' : 'Yeni kullanıcı oluşturuldu');
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
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm);
        return acc;
    }, {} as Record<string, typeof PERMISSIONS_LIST>);

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">manage_accounts</span>
                        Kullanıcı Yönetimi
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Personel profilleri ve sistem erişim yetkileri</p>
                </div>
                <button 
                    onClick={() => { setEditingUser({ permissions: [], role: 'viewer' }); setIsUserModalOpen(true); }} 
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined">person_add</span> Yeni Kullanıcı
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
                                        <p className="text-xs text-blue-400 font-medium">{user.jobTitle || user.role}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                    {user.role}
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
                                <span className="text-[10px] text-slate-500 font-bold">{user.permissions.length} YETKİ TANIMLI</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit_note</span></button>
                                    <button onClick={() => { if(window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) deleteUser(user.id); }} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
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
                                {editingUser.id ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
                            </h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="userForm" onSubmit={handleSaveUser} className="space-y-8">
                                {/* ACCOUNT INFO */}
                                <div>
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 border-l-4 border-blue-500 pl-3">Hesap Bilgileri</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs text-slate-500 mb-1">Kullanıcı Adı *</label><input value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" required /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">Şifre *</label><input type="text" value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" required /></div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Sistem Rolü</label>
                                            <select value={editingUser.role || 'viewer'} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none">
                                                <option value="viewer">Görüntüleyici (Viewer)</option>
                                                <option value="editor">Editör (Editor)</option>
                                                <option value="admin">Yönetici (Admin)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* PROFILE DETAILS */}
                                <div>
                                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4 border-l-4 border-orange-500 pl-3">Profil Detayları</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs text-slate-500 mb-1">Ad Soyad</label><input value={editingUser.fullName || ''} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">Unvan / Meslek</label><input value={editingUser.jobTitle || ''} onChange={e => setEditingUser({...editingUser, jobTitle: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Örn: Harita Mühendisi" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">Telefon</label><input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">E-Posta</label><input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                        <div className="md:col-span-2"><label className="block text-xs text-slate-500 mb-1">Adres / Lokasyon</label><input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none" /></div>
                                    </div>
                                </div>

                                {/* PERMISSIONS MATRIX */}
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Yetkilendirme</h4>
                                        <button type="button" onClick={toggleAllPermissions} className="text-xs text-blue-400 hover:text-white underline">Tümünü Seç / Kaldır</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                                            <div key={groupName} className="bg-iha-900 border border-iha-700 rounded-xl p-4">
                                                <h5 className="text-xs font-bold text-slate-400 mb-3 uppercase border-b border-iha-800 pb-2">{groupName}</h5>
                                                <div className="space-y-2">
                                                    {perms.map(perm => (
                                                        <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${editingUser.permissions?.includes(perm.id) ? 'bg-emerald-500 border-emerald-600' : 'bg-iha-800 border-iha-600 group-hover:border-slate-500'}`}>
                                                                {editingUser.permissions?.includes(perm.id) && <span className="material-symbols-outlined text-sm text-white font-bold">check</span>}
                                                            </div>
                                                            <input type="checkbox" className="hidden" checked={editingUser.permissions?.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                                                            <span className={`text-sm ${editingUser.permissions?.includes(perm.id) ? 'text-white font-medium' : 'text-slate-400'}`}>{perm.label}</span>
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
                            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">İptal</button>
                            <button type="submit" form="userForm" className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-colors">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
