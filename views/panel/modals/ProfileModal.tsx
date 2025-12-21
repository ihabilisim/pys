
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { ProfileAvatar, ProfileForm, ProfileShortcuts } from '../../../components/profile';
import { apiService } from '../../../services/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (tab: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onNavigate }) => {
    const { currentUser, updateUser, logout } = useAuth();
    const { showToast, t } = useUI();
    const [isUploading, setIsUploading] = useState(false);
    
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
        }
    }, [isOpen, currentUser]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            // Veritabanına kaydet
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

        // Supabase'e Yükleme: Users/{UserID}/avatar
        // Her seferinde unique isim vererek cache sorununu önleyelim
        const folderName = `Users/${currentUser.id}`;
        
        const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', folderName);

        if (error) {
            showToast(`HATA: ${error}`, 'error');
        } else if (publicUrl) {
            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            
            // Kullanıcıyı beklemeden DB'de güncelle
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

    if (!isOpen || !currentUser) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-iha-800 w-full max-w-2xl rounded-3xl border border-iha-700 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] ring-1 ring-white/10">
                
                {/* LEFT: EDIT PROFILE */}
                <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-iha-700 bg-gradient-to-b from-iha-900 via-iha-900 to-iha-800 flex flex-col relative">
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

                {/* RIGHT: SHORTCUTS */}
                <ProfileShortcuts 
                    role={currentUser.role}
                    permissions={currentUser.permissions}
                    onNavigate={handleNavigate}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};
