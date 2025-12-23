
import React, { useState, useEffect } from 'react';
import { SiteIssue } from '../../types';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { apiService } from '../../services/api';

interface NCRModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number | null;
    lng: number | null;
}

export const NCRModal: React.FC<NCRModalProps> = ({ isOpen, onClose, lat, lng }) => {
    const { addSiteIssue } = useData();
    const { t, showToast } = useUI();
    const [tempIssue, setTempIssue] = useState<Partial<SiteIssue>>({ type: 'NCR', description: '', photoUrl: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTempIssue({ type: 'NCR', description: '', lat, lng, photoUrl: '' });
        }
    }, [isOpen, lat, lng]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            showToast('Fotoğraf yükleniyor...', 'info');

            // Upload to Supabase 'Site_Photos' folder
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'Site_Photos');

            if (error) {
                showToast(`Yükleme hatası: ${error}`, 'error');
            } else if (publicUrl) {
                setTempIssue(prev => ({ ...prev, photoUrl: publicUrl }));
                showToast('Fotoğraf yüklendi.');
            }
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if(lat && lng) {
            setIsSaving(true);
            // reportedDate otomatik olarak DB tarafından atanır, ancak tip uyumluluğu için gönderebiliriz.
            await addSiteIssue({ 
                type: tempIssue.type as any, 
                status: 'OPEN', 
                lat: lat, 
                lng: lng, 
                description: tempIssue.description || 'No description', 
                photoUrl: tempIssue.photoUrl,
                assignedTo: 'Admin'
            });
            setIsSaving(false);
            onClose();
        } else {
            showToast('Konum hatası.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 pointer-events-auto">
            <div className="bg-iha-800 w-full max-w-md rounded-2xl border border-iha-700 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">flag</span>
                    {t('mapTools.issue.title')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('mapTools.issue.type')}</label>
                        <select value={tempIssue.type} onChange={e => setTempIssue({...tempIssue, type: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-white focus:outline-none focus:border-red-500">
                            <option value="NCR">{t('mapTools.issue.ncr')}</option>
                            <option value="SNAG">{t('mapTools.issue.snag')}</option>
                            <option value="SAFETY">{t('mapTools.issue.safety')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('common.description')}</label>
                        <textarea value={tempIssue.description} onChange={e => setTempIssue({...tempIssue, description: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-white h-24 focus:outline-none focus:border-red-500" />
                    </div>
                    
                    {/* PHOTO UPLOAD */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('mapTools.issue.photoUrl')}</label>
                        <div className={`border-2 border-dashed border-iha-700 rounded-lg p-4 text-center cursor-pointer hover:bg-iha-900/50 transition-colors relative ${isUploading ? 'opacity-50' : ''}`}>
                            {isUploading ? (
                                <span className="text-xs text-red-400 font-bold animate-pulse">Yükleniyor...</span>
                            ) : tempIssue.photoUrl ? (
                                <div className="flex flex-col items-center">
                                    <img src={tempIssue.photoUrl} alt="Preview" className="h-20 object-cover rounded mb-2 border border-iha-600" />
                                    <span className="text-[10px] text-green-400">Fotoğraf Hazır (Değiştirmek için tıkla)</span>
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-slate-500 mb-1">add_a_photo</span>
                                    <p className="text-xs text-slate-400">Fotoğraf Yükle veya Çek</p>
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} disabled={isSaving || isUploading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                            {isSaving ? t('common.loading') : t('common.save')}
                        </button>
                        <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">{t('common.cancel')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
