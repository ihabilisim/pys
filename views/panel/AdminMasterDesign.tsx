
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { apiService } from '../../services/api';

export const AdminMasterDesign: React.FC = () => {
    const { design, data, addDesignLayer, deleteDesignLayer } = useData();
    const { currentUser } = useAuth();
    const { t, showToast } = useUI();

    // LandXML States
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // GeoJSON Alignment States
    const [geoName, setGeoName] = useState('');
    const [geoFile, setGeoFile] = useState<File | null>(null);
    const [isGeoUploading, setIsGeoUploading] = useState(false);

    useEffect(() => {
        design.loadAlignments();
    }, []);

    const handleLandXmlUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            showToast('Lütfen bir LandXML dosyası seçiniz.', 'error');
            return;
        }
        await design.parseAndSaveLandXML(selectedFile, description, currentUser?.id);
        setDescription('');
        setSelectedFile(null);
        const fileInput = document.getElementById('landxml-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Helper to read file as text using Promise
    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    };

    const handleGeoJsonUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!geoFile) {
            showToast('Lütfen bir GeoJSON dosyası seçiniz.', 'error');
            return;
        }

        setIsGeoUploading(true);
        try {
            // 1. Dosyayı Supabase Storage'a Yükle
            const { publicUrl, error } = await apiService.uploadFile(geoFile, 'app-assets', 'Alignments/GeoJSON');
            if (error) throw new Error(error);

            // 2. Dosya İçeriğini Oku (Async/Await)
            const textContent = await readFileAsText(geoFile);
            const geoJsonData = JSON.parse(textContent);
            
            // 3. Tasarım Katmanını Ekle (Yeni Tabloya)
            const layerName = geoName || geoFile.name.replace(/\.[^/.]+$/, "");
            
            addDesignLayer({
                name: layerName,
                type: 'GEOJSON',
                data: geoJsonData,
                color: '#f59e0b', // Default orange/amber for roads
                opacity: 1,
                isVisible: true
            });

            showToast('Yol ekseni tasarım katmanı olarak eklendi.', 'success');
            setGeoName('');
            setGeoFile(null);
            const fileInput = document.getElementById('geojson-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            console.error("Upload Error:", err);
            showToast(err.message || 'Dosya işlenirken hata oluştu.', 'error');
        } finally {
            setIsGeoUploading(false);
        }
    };

    if (!currentUser || (!currentUser.permissions.includes('manage_map') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">design_services</span>
                        Master Design (Aliyman & Geometri)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Projenin ana güzergah dosyalarını (LandXML ve GeoJSON) buradan yönetin.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT: LANDXML ALIGNMENT (DATA & POINTS) */}
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl flex flex-col h-full">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-iha-700 pb-2">
                        <span className="material-symbols-outlined text-green-500">upload_file</span>
                        Yatay Güzergah Yükle (LandXML)
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-4 bg-iha-900/50 p-2 rounded">
                        LandXML dosyası, projenin "Alignment" verilerini ve koordinat noktalarını veritabanına işleyerek profil ve kesit analizlerinde kullanılmasını sağlar.
                    </p>
                    
                    <form onSubmit={handleLandXmlUpload} className="space-y-4 flex-1 flex flex-col">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1 font-bold">Açıklama / Versiyon</label>
                            <input 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Örn: Rev03 - Sektör 1 Güzergahı" 
                                className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>

                        <div className="relative border-2 border-dashed border-iha-700 rounded-xl p-8 text-center hover:bg-iha-900/30 transition-all cursor-pointer group flex-1 flex flex-col justify-center items-center">
                            {design.isLoading ? (
                                <div className="flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">sync</span>
                                    <p className="text-xs text-blue-400 mt-2 font-bold uppercase">İşleniyor...</p>
                                </div>
                            ) : (
                                <>
                                    <input 
                                        id="landxml-upload"
                                        type="file" 
                                        accept=".xml,.landxml" 
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    />
                                    <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 group-hover:text-blue-500 transition-colors">description</span>
                                    <p className="text-sm font-bold text-white">
                                        {selectedFile ? selectedFile.name : 'LandXML Seçin'}
                                    </p>
                                </>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={design.isLoading || !selectedFile}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">save</span>
                            Kaydet ve İşle
                        </button>
                    </form>
                </div>

                {/* RIGHT: GEOJSON ALIGNMENT (VISUAL LAYER) */}
                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl flex flex-col h-full">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-iha-700 pb-2">
                        <span className="material-symbols-outlined text-orange-500">polyline</span>
                        Harita Katmanı Yükle (GeoJSON)
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-4 bg-iha-900/50 p-2 rounded">
                        Bu alan, harita üzerinde <strong>Yol Eksenleri</strong> olarak görünecek tasarım verilerini yüklemek içindir. "Altyapı"dan bağımsızdır.
                    </p>

                    <form onSubmit={handleGeoJsonUpload} className="space-y-4 flex-1 flex flex-col">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1 font-bold">Katman Adı</label>
                            <input 
                                value={geoName}
                                onChange={e => setGeoName(e.target.value)}
                                placeholder="Örn: Ana Yol Ekseni (Görsel)" 
                                className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition-colors"
                            />
                        </div>

                        <div className="relative border-2 border-dashed border-iha-700 rounded-xl p-8 text-center hover:bg-iha-900/30 transition-all cursor-pointer group flex-1 flex flex-col justify-center items-center">
                            {isGeoUploading ? (
                                <div className="flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">sync</span>
                                    <p className="text-xs text-orange-400 mt-2 font-bold uppercase">Yükleniyor...</p>
                                </div>
                            ) : (
                                <>
                                    <input 
                                        id="geojson-upload"
                                        type="file" 
                                        accept=".json,.geojson" 
                                        onChange={(e) => setGeoFile(e.target.files ? e.target.files[0] : null)} 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    />
                                    <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 group-hover:text-orange-500 transition-colors">hub</span>
                                    <p className="text-sm font-bold text-white">
                                        {geoFile ? geoFile.name : 'GeoJSON Seçin'}
                                    </p>
                                </>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isGeoUploading || !geoFile}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add_to_photos</span>
                            Haritaya Ekle
                        </button>
                    </form>
                </div>
            </div>

            {/* List Section (Alignments & GeoJSONs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* LandXML List */}
                <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden shadow-xl">
                    <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">upload_file</span> İşlenmiş LandXML Verileri
                    </div>
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                            <tr><th className="p-4">Ad</th><th className="p-4">Tarih</th><th className="p-4 text-right">İşlem</th></tr>
                        </thead>
                        <tbody className="divide-y divide-iha-700">
                            {design.alignments.map(item => (
                                <tr key={item.id} className="hover:bg-iha-900/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{item.name}</td>
                                    <td className="p-4 text-xs font-mono text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => { if(window.confirm('Emin misiniz?')) design.deleteAlignment(item.id); }} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                            {design.alignments.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500 italic">Veri yok.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* GeoJSON List */}
                <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden shadow-xl">
                    <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">polyline</span> Harita Tasarım Katmanları
                    </div>
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                            <tr><th className="p-4">Katman Adı</th><th className="p-4 text-right">İşlem</th></tr>
                        </thead>
                        <tbody className="divide-y divide-iha-700">
                            {data.designLayers.map(layer => (
                                <tr key={layer.id} className="hover:bg-iha-900/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{layer.name}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => { if(window.confirm('Emin misiniz?')) deleteDesignLayer(layer.id); }} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                            {data.designLayers.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-slate-500 italic">Katman yok.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
