
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Fixed: Imported useAuth and useUI to access currentUser and showToast */
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Language, LocalizedString, DroneFlight } from '../../types';

// Helper to extract ID from various YouTube URL formats
const extractYouTubeID = (url: string) => {
    if (!url) return '';
    // If it's already an ID (short length, no slashes), return it
    if (!url.includes('/') && url.length === 11) return url;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

export const AdminDrone: React.FC = () => {
    /* Fixed: Destructured data and methods from useData, currentUser from useAuth, and showToast from useUI */
    const { data, addDroneFlight, updateDroneFlight, deleteDroneFlight } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useUI();
    const [formLang, setFormLang] = useState<Language>('tr');
    
    const [editFlightId, setEditFlightId] = useState<string | null>(null);
    const [newFlight, setNewFlight] = useState<{
        title: LocalizedString;
        date: string;
        youtubeUrl: string;
        location: string;
    }>({
        title: { tr: '', en: '', ro: '' },
        date: new Date().toISOString().split('T')[0],
        youtubeUrl: '',
        location: 'KM 0 - KM 15'
    });

    if (!currentUser || !currentUser.permissions.includes('manage_drone') && currentUser.role !== 'admin') {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFlight.title.tr || !newFlight.youtubeUrl) {
            showToast('Lütfen başlık ve YouTube linki giriniz.', 'error');
            return;
        }

        const youtubeId = extractYouTubeID(newFlight.youtubeUrl);
        if (youtubeId.length !== 11) {
            showToast('Geçersiz YouTube linki.', 'error');
            return;
        }

        const flightData: Omit<DroneFlight, 'id'> = {
            title: newFlight.title,
            date: newFlight.date,
            youtubeId: youtubeId,
            location: newFlight.location,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
        };

        if (editFlightId) {
            updateDroneFlight(editFlightId, flightData);
            setEditFlightId(null);
        } else {
            addDroneFlight(flightData);
        }
        
        // Reset Form
        setNewFlight({ 
            title: { tr: '', en: '', ro: '' }, 
            date: new Date().toISOString().split('T')[0], 
            youtubeUrl: '', 
            location: 'KM 0 - KM 15' 
        });
    };

    const startEdit = (flight: DroneFlight) => {
        setEditFlightId(flight.id);
        setNewFlight({
            title: flight.title,
            date: flight.date,
            youtubeUrl: `https://youtu.be/${flight.youtubeId}`,
            location: flight.location
        });
    };

    const cancelEdit = () => {
        setEditFlightId(null);
        setNewFlight({ 
            title: { tr: '', en: '', ro: '' }, 
            date: new Date().toISOString().split('T')[0], 
            youtubeUrl: '', 
            location: 'KM 0 - KM 15' 
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* FORM SECTION */}
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">flight</span>
                        {editFlightId ? 'Uçuş Kaydını Düzenle' : 'Yeni Drone Uçuşu Ekle'}
                    </h3>
                    <div className="flex gap-2">
                        {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                            <button key={lang} type="button" onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${formLang === lang ? 'bg-indigo-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs text-slate-500 mb-1">Uçuş Başlığı ({formLang})</label>
                            <input 
                                value={newFlight.title[formLang]} 
                                onChange={e => setNewFlight({...newFlight, title: {...newFlight.title, [formLang]: e.target.value}})} 
                                className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                placeholder="Örn: Aralık 2024 - 2. Hafta"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">YouTube Linki</label>
                            <input 
                                value={newFlight.youtubeUrl} 
                                onChange={e => setNewFlight({...newFlight, youtubeUrl: e.target.value})} 
                                className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Tarih</label>
                                <input 
                                    type="date"
                                    value={newFlight.date} 
                                    onChange={e => setNewFlight({...newFlight, date: e.target.value})} 
                                    className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Lokasyon / Açıklama</label>
                                <input 
                                    value={newFlight.location} 
                                    onChange={e => setNewFlight({...newFlight, location: e.target.value})} 
                                    className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-iha-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20">
                            {editFlightId ? 'Güncelle' : 'Kaydet'}
                        </button>
                        {editFlightId && (
                            <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* LIST SECTION */}
            <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden shadow-xl">
                <div className="p-4 bg-iha-900 border-b border-iha-700 flex justify-between items-center">
                    <h4 className="font-bold text-white">Mevcut Uçuş Kayıtları</h4>
                    <span className="text-xs bg-iha-800 px-2 py-1 rounded text-slate-400 border border-iha-700">{data.droneFlights.length} Video</span>
                </div>
                
                {data.droneFlights.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Henüz video eklenmemiş.</div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-iha-900/50 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="p-4">Video</th>
                                <th className="p-4">Başlık</th>
                                <th className="p-4">Tarih</th>
                                <th className="p-4">Lokasyon</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-iha-700">
                            {data.droneFlights.map(flight => (
                                <tr key={flight.id} className="hover:bg-iha-900/50 transition-colors group">
                                    <td className="p-4 w-32">
                                        <div className="w-24 h-14 bg-black rounded-lg overflow-hidden border border-iha-700 relative">
                                            <img src={`https://img.youtube.com/vi/${flight.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-2xl drop-shadow-md">play_circle</span></span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-white">
                                        {flight.title['tr']}
                                        {/* Optional: Show icon if translation missing */}
                                        {(!flight.title.en || !flight.title.ro) && <span className="ml-2 text-[10px] text-yellow-500" title="Bazı diller eksik">⚠️</span>}
                                    </td>
                                    <td className="p-4 font-mono text-xs">{flight.date}</td>
                                    <td className="p-4 text-xs text-slate-400">{flight.location}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => startEdit(flight)} className="text-blue-400 hover:text-white mr-3 p-1 hover:bg-blue-500/20 rounded transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        <button onClick={() => deleteDroneFlight(flight.id)} className="text-red-400 hover:text-white p-1 hover:bg-red-500/20 rounded transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
