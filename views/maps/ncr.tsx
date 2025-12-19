
import React, { useState, useEffect } from 'react';
import { SiteIssue } from '../../types';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

interface NCRModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number | null;
    lng: number | null;
}

export const NCRModal: React.FC<NCRModalProps> = ({ isOpen, onClose, lat, lng }) => {
    const { addSiteIssue } = useData();
    const { t } = useUI();
    const [tempIssue, setTempIssue] = useState<Partial<SiteIssue>>({ type: 'NCR', description: '' });

    useEffect(() => {
        if (isOpen) {
            setTempIssue({ type: 'NCR', description: '', lat, lng });
        }
    }, [isOpen, lat, lng]);

    const handleSave = () => {
        if(lat && lng) {
            addSiteIssue({ 
                type: tempIssue.type as any, 
                status: 'OPEN', 
                lat: lat, 
                lng: lng, 
                description: tempIssue.description || 'No description', 
                reportedDate: new Date().toISOString().split('T')[0],
                photoUrl: tempIssue.photoUrl
            });
            onClose();
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
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('mapTools.issue.photoUrl')}</label>
                        <input value={tempIssue.photoUrl || ''} onChange={e => setTempIssue({...tempIssue, photoUrl: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-white focus:outline-none focus:border-red-500" placeholder="https://..." />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">{t('common.save')}</button>
                        <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">{t('common.cancel')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
