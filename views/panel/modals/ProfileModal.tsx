
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { ProfileAvatar, ProfileForm, ProfileShortcuts } from '../../../components/profile';
import { apiService } from '../../../services/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (tab: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onNavigate }) => {
    const { currentUser, updateUser, logout } = useAuth();
    const { data, deleteMapNote } = useData();
    const { showToast, t } = useUI();
    const [isUploading, setIsUploading] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState<'SHORTCUTS' | 'NOTES'>('SHORTCUTS');
    
    const [formData, setFormData] = useState({
        name: '', title: '', phone: '', email: '', 
        avatarUrl: '' as string | null
    });

    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData({
                name: currentUser.fullName,
                title: currentUser.jobTitle || currentUser.role,
                phone: currentUser.phone || '',
                email: currentUser.email || '',
                avatarUrl: currentUser.avatarUrl || null 
            });
            setActiveRightTab('SHORTCUTS'); // Reset tab on open
        }
    }, [isOpen, currentUser]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            updateUser(currentUser.id, { 
                fullName: formData.name,
                phone: formData.phone,
                email: formData.email,
                avatarUrl: formData.avatarUrl
            });
            showToast(t('profile.success'));
        }
        onClose();
    };

    const handleAvatarChange = async (file: File) => {
        if (!currentUser) return;

        setIsUploading(true);
        showToast(t('profile.uploading'), 'info');

        const folderName = `Users/${currentUser.id}`;
        const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', folderName);

        if (error) {
            showToast(`HATA: ${error}`, 'error');
        } else if (publicUrl) {
            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            updateUser(currentUser.id, { avatarUrl: publicUrl });
            showToast(t('profile.photoSuccess'));
        }
        setIsUploading(false);
    };

    const handleLogout = () => {
        if(window.confirm(t('profile.logoutConfirm'))) {
            logout();
            onClose();
        }
    };

    const handleNavigate = (tab: string) => {
        if (onNavigate) onNavigate(tab);
    };

    const handleDeleteNote = async (id: string) => {
        if(window.confirm(t('common.deleteConfirm'))) {
            await deleteMapNote(id);
        }
    };

    // Filter user's notes
    const myNotes = currentUser ? data.mapNotes.filter(n => n.author === currentUser.id) : [];

    if (!isOpen || !currentUser) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Updated max-width to 5xl for wider layout */}
            <div className="bg-iha-800 w-full max-w-5xl rounded-3xl border border-iha-700 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] ring-1 ring-white/10">
                
                {/* LEFT: EDIT PROFILE (Fixed Width) */}
                <div className="w-full md:w-80 lg:w-96 flex-shrink-0 p-8 border-b md:border-b-0 md:border-r border-iha-700 bg-gradient-to-b from-iha-900 via-iha-900 to-iha-800 flex flex-col relative">
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-bold animate-pulse">{t('common.loading')}</span>
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30">
                            <span className="material-symbols-outlined text-white text-sm">account_circle</span>
                        </span>
                        {t('profile.title')}
                    </h3>
                    
                    <ProfileAvatar 
                        avatarUrl={formData.avatarUrl} 
                        onChange={handleAvatarChange} 
                    />
                    
                    <ProfileForm 
                        name={formData.name}
                        phone={formData.phone}
                        email={formData.email}
                        title={formData.title}
                        onNameChange={(val) => setFormData(prev => ({...prev, name: val}))}
                        onPhoneChange={(val) => setFormData(prev => ({...prev, phone: val}))}
                        onEmailChange={(val) => setFormData(prev => ({...prev, email: val}))}
                        onSubmit={handleSave}
                        onLogout={handleLogout}
                    />
                </div>

                {/* RIGHT: TABS (SHORTCUTS & NOTES) (Fluid Width) */}
                <div className="flex-1 bg-iha-800 flex flex-col min-w-0">
                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between p-6 border-b border-iha-700">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveRightTab('SHORTCUTS')}
                                className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg flex items-center gap-2 ${activeRightTab === 'SHORTCUTS' ? 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/50' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-lg">star</span>
                                {t('profile.authorizedAreas')}
                            </button>
                            <button 
                                onClick={() => setActiveRightTab('NOTES')}
                                className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg flex items-center gap-2 ${activeRightTab === 'NOTES' ? 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/50' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-lg">sticky_note_2</span>
                                Notlarım
                                <span className="bg-iha-900 text-slate-400 px-2 py-0.5 rounded-full text-[10px] border border-iha-700 ml-1">{myNotes.length}</span>
                            </button>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-iha-900 text-slate-400 hover:text-white hover:bg-red-500 transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative bg-slate-900/20">
                        {activeRightTab === 'SHORTCUTS' ? (
                            <ProfileShortcuts 
                                role={currentUser.role}
                                permissions={currentUser.permissions}
                                onNavigate={onNavigate}
                                onClose={onClose} 
                            />
                        ) : (
                            <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-3">
                                {myNotes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myNotes.map(note => (
                                            <div key={note.id} className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl relative group hover:bg-yellow-500/10 transition-all hover:border-yellow-500/40 hover:shadow-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                                        <span className="material-symbols-outlined text-yellow-500 text-sm">location_on</span>
                                                        <span className="text-[10px] text-yellow-200/90 font-mono font-bold">{note.lat.toFixed(5)}, {note.lng.toFixed(5)}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500">{note.date}</span>
                                                </div>
                                                <p className="text-white text-sm font-medium leading-relaxed pr-8 line-clamp-3">{note.text}</p>
                                                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${note.privacy === 'private' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                                        {note.privacy === 'private' ? 'Gizli' : 'Herkese Açık'}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-[10px] font-bold"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span> SİL
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <div className="w-16 h-16 bg-iha-900 rounded-full flex items-center justify-center mb-4 border border-iha-700">
                                            <span className="material-symbols-outlined text-3xl opacity-50">note_add</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">Henüz not eklenmedi.</p>
                                        <p className="text-xs mt-1">Harita üzerinden bir noktaya tıklayarak not ekleyebilirsiniz.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
