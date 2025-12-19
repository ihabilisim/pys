
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { ProfileAvatar, ProfileForm, ProfileShortcuts } from '../../../components/profile';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (tab: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onNavigate }) => {
    const { currentUser, updateUser, logout } = useAuth();
    const { showToast } = useUI();
    
    // State to hold form data
    const [formData, setFormData] = useState({
        name: '', 
        title: '', 
        phone: '', 
        email: '', 
        avatarUrl: '' as string | null
    });

    // Reset state when modal opens
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
            updateUser(currentUser.id, { 
                fullName: formData.name,
                phone: formData.phone,
                email: formData.email,
                avatarUrl: formData.avatarUrl
            });
            showToast('Profil bilgileri başarıyla güncellendi.');
        }
        onClose();
    };

    const handleAvatarChange = (file: File) => {
        const url = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, avatarUrl: url }));
    };

    const handleLogout = () => {
        if(window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
            logout();
            onClose();
        }
    };

    const handleNavigate = (tab: string) => {
        if (onNavigate) {
            onNavigate(tab);
            // Optional: Close modal after navigation? 
            // onClose(); 
        }
    };

    if (!isOpen || !currentUser) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-iha-800 w-full max-w-2xl rounded-3xl border border-iha-700 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] ring-1 ring-white/10">
                
                {/* LEFT: EDIT PROFILE */}
                <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-iha-700 bg-gradient-to-b from-iha-900 via-iha-900 to-iha-800 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30">
                            <span className="material-symbols-outlined text-white text-sm">account_circle</span>
                        </span>
                        Profilim
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
