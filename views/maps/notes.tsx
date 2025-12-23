
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number | null;
    lng: number | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, lat, lng }) => {
    const { addMapNote } = useData();
    const [text, setText] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private' | 'admin'>('public');

    useEffect(() => {
        if (isOpen) {
            setText('');
            setPrivacy('public');
        }
    }, [isOpen]);

    const handleSave = () => {
        if(lat && lng && text) {
            addMapNote({ 
                lat, 
                lng, 
                text, 
                author: 'User', 
                date: new Date().toISOString().split('T')[0],
                privacy: privacy 
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 pointer-events-auto">
            <div className="bg-iha-800 w-full max-w-sm rounded-2xl border border-iha-700 p-6 shadow-2xl transform transition-all">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">sticky_note_2</span>
                    Harita Notu Ekle
                </h3>
                
                <div className="space-y-3">
                    <textarea 
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        className="w-full bg-yellow-100 text-black border-2 border-yellow-400 rounded-lg p-3 h-32 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                        placeholder="Notunuzu buraya yazın..." 
                        autoFocus
                    />
                    
                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block uppercase">Gizlilik</label>
                        <select 
                            value={privacy} 
                            onChange={e => setPrivacy(e.target.value as any)} 
                            className="w-full bg-iha-900 border border-iha-600 rounded-lg p-2 text-white text-sm"
                        >
                            <option value="public">Herkes Görebilir</option>
                            <option value="private">Sadece Ben</option>
                            <option value="admin">Sadece Yöneticiler</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/20">Yapıştır</button>
                        <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">İptal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
