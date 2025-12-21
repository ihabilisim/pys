
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PvlaFileManager } from './pvla/PvlaFileManager';
import { PvlaMatrixConfig } from './pvla/PvlaMatrixConfig';

export const AdminPvla: React.FC = () => {
    const { currentUser } = useAuth();
    const [mainTab, setMainTab] = useState<'FILES' | 'MATRIX'>('FILES');

    if (!currentUser || (!currentUser.permissions.includes('manage_files') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Top Navigation Tabs */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit">
                <button 
                    onClick={() => setMainTab('FILES')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'FILES' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}
                >
                    Dosya Yönetimi
                </button>
                <button 
                    onClick={() => setMainTab('MATRIX')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'MATRIX' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}
                >
                    Matris Konfigürasyonu
                </button>
            </div>

            {/* Content Area */}
            {mainTab === 'FILES' ? <PvlaFileManager /> : <PvlaMatrixConfig />}
        </div>
    );
};
