
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { LocalizedString, Language } from '../../types';
import { apiService } from '../../services/api';

export const AdminLayout: React.FC = () => {
    const { data, addExternalLayer, deleteExternalLayer, addUtilityCategory, deleteUtilityCategory, toggleLayerVisibility } = useData();
    const { currentUser } = useAuth();
    const { showToast, t } = useUI();
    
    type LayoutSubTab = 'infra' | 'alignment';
    const [subTab, setSubTab] = useState<LayoutSubTab>('infra');

    // --- INFRA STATES ---
    const [newLayerName, setNewLayerName] = useState('');
    const [newLayerColor, setNewLayerColor] = useState('#f97316'); 
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCatName, setNewCatName] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newCatColor, setNewCatColor] = useState('#3b82f6');
    const [isUploading, setIsUploading] = useState(false);

    if (!currentUser || (!currentUser.permissions.includes('manage_map') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    const handleAddCategory = () => {
        if (!newCatName.tr) return;
        addUtilityCategory({ name: newCatName, color: newCatColor });
        setNewCatName({ tr: '', en: '', ro: '' });
        showToast(t('admin.layout.categoryAdded'));
    };

    const handleLayerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (!selectedCategory) {
                showToast(t('admin.layout.selectCategory'), 'error');
                e.target.value = '';
                return;
            }

            const file = e.target.files[0];
            setIsUploading(true);
            showToast(t('common.loading'), 'info');

            // 1. Upload to Supabase Storage
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'utilities');

            if (error) {
                showToast(`${t('admin.layout.uploadError')} ${error}`, 'error');
                setIsUploading(false);
                e.target.value = '';
                return;
            }

            // 2. Read File Content for Rendering on Map
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const geoJson = JSON.parse(event.target?.result as string);
                    const name = newLayerName || file.name.replace(/\.[^/.]+$/, "");
                    
                    addExternalLayer({
                        name: name, 
                        category: selectedCategory, 
                        type: 'GEOJSON',
                        data: geoJson, 
                        color: newLayerColor, 
                        opacity: 0.8,
                        addedDate: new Date().toISOString().split('T')[0], 
                        isVisible: true,
                        url: publicUrl || undefined // Store the cloud URL
                    });
                    
                    setNewLayerName('');
                    showToast(t('admin.layout.layerUploaded'));
                } catch (error) {
                    showToast('Geçersiz GeoJSON dosyası.', 'error');
                } finally {
                    setIsUploading(false);
                    e.target.value = '';
                }
            };
            reader.readAsText(file);
        }
    };

    const handleAlignmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            showToast(t('common.loading'), 'info');

            // 1. Upload to Supabase
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'alignments');

            if (error) {
                showToast(`${t('admin.layout.uploadError')} ${error}`, 'error');
                setIsUploading(false);
                e.target.value = '';
                return;
            }

            // 2. If it's GeoJSON, we can visualize it immediately as a layer
            if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const geoJson = JSON.parse(event.target?.result as string);
                        
                        // Use a specific reserved ID for road alignments so we can filter them in map
                        const alignCatId = 'road_alignment';
                        
                        // Add as layer
                        addExternalLayer({
                            name: file.name, 
                            category: alignCatId, 
                            type: 'GEOJSON',
                            data: geoJson, 
                            color: '#3b82f6', 
                            opacity: 1,
                            addedDate: new Date().toISOString().split('T')[0], 
                            isVisible: true,
                            url: publicUrl || undefined
                        });
                        showToast(t('admin.layout.alignmentAdded'));
                    } catch (e) {
                        console.warn('Could not parse alignment JSON for map display');
                        showToast('GeoJSON okunamadı, ancak dosya yüklendi.', 'error');
                    }
                };
                reader.readAsText(file);
            } else {
                // DWG/DXF/XML case
                showToast('Dosya buluta yüklendi. (Harita önizlemesi için GeoJSON gereklidir)', 'success');
            }

            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Nav Tabs */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit">
                <button onClick={() => setSubTab('infra')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${subTab === 'infra' ? 'bg-orange-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-lg">electrical_services</span> Alt Yapı (Utilities)
                </button>
                <button onClick={() => setSubTab('alignment')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${subTab === 'alignment' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-lg">route</span> Yol Eksen & Geometri
                </button>
            </div>

            {subTab === 'infra' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kategori Yönetimi */}
                        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">category</span> Altyapı Kategorileri
                            </h3>
                            <div className="flex gap-2 mb-6">
                                <input placeholder="Kategori Adı (TR)" value={newCatName.tr} onChange={e => setNewCatName({ tr: e.target.value, en: e.target.value, ro: e.target.value })} className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="h-10 w-10 bg-transparent border-0 cursor-pointer" />
                                <button onClick={handleAddCategory} className="bg-orange-600 text-white px-4 rounded-lg font-bold">{t('common.add')}</button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {data.utilityCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between bg-iha-900/50 p-2.5 rounded-xl border border-iha-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-sm text-white">{cat.name.tr}</span>
                                        </div>
                                        <button onClick={() => deleteUtilityCategory(cat.id)} className="text-red-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Katman Yükleme */}
                        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">upload_file</span> GeoJSON Verisi Yükle
                            </h3>
                            <div className="space-y-4">
                                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-sm">
                                    <option value="">-- Kategori Seçiniz --</option>
                                    {data.utilityCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name.tr}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <input placeholder="Katman Adı (Opsiyonel)" value={newLayerName} onChange={e => setNewLayerName(e.target.value)} className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-sm" />
                                    <input type="color" value={newLayerColor} onChange={e => setNewLayerColor(e.target.value)} className="h-12 w-12 bg-transparent border-0 cursor-pointer" />
                                </div>
                                <div className="relative border-2 border-dashed border-iha-700 rounded-xl p-8 text-center hover:bg-iha-900/30 transition-all cursor-pointer group">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">sync</span>
                                            <p className="text-xs text-blue-400 mt-2 font-bold uppercase">{t('common.loading')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <input type="file" accept=".json,.geojson" onChange={handleLayerUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            <span className="material-symbols-outlined text-3xl text-slate-600 mb-2 group-hover:text-blue-500 transition-colors">cloud_upload</span>
                                            <p className="text-xs text-slate-500 group-hover:text-slate-300">Tıklayın veya GeoJSON dosyasını buraya sürükleyin</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Katman Listesi */}
                    <div className="bg-iha-800 rounded-2xl border border-iha-700 shadow-xl overflow-hidden">
                        <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white">Yüklü Alt Yapı Katmanları</div>
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                                <tr><th className="p-4">Katman</th><th className="p-4">Kategori</th><th className="p-4">Dosya Yolu</th><th className="p-4 text-center">Görünürlük</th><th className="p-4 text-right">İşlem</th></tr>
                            </thead>
                            <tbody className="divide-y divide-iha-700">
                                {data.externalLayers.map(layer => (
                                    <tr key={layer.id} className="hover:bg-iha-900/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: layer.color }}></div>
                                                <span className="font-bold text-white">{layer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs">{data.utilityCategories.find(c => c.id === layer.category)?.name.tr || (layer.category === 'road_alignment' ? 'Yol Ekseni' : 'Genel')}</td>
                                        <td className="p-4 text-xs font-mono text-slate-500 max-w-[150px] truncate">{layer.url ? 'Supabase Storage' : 'Local Data'}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleLayerVisibility(layer.id)} className={`p-1.5 rounded-lg transition-colors ${layer.isVisible ? 'text-blue-500 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                                                <span className="material-symbols-outlined">{layer.isVisible ? 'visibility' : 'visibility_off'}</span>
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => deleteExternalLayer(layer.id)} className="text-red-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-iha-800 p-8 rounded-2xl border border-iha-700 shadow-xl text-center">
                        <span className="material-symbols-outlined text-6xl text-blue-500 mb-4">route</span>
                        <h3 className="text-xl font-bold text-white mb-2">Yol Ekseni & Proje Hattı Yönetimi</h3>
                        <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8">Otoyolun ana geometrisini (Project Line) belirlemek için koordinat dizilerini buradan yönetebilir veya toplu proje dosyalarını (DXF/DWG/XML) dönüştürerek yükleyebilirsiniz.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="p-6 bg-iha-900 rounded-2xl border border-iha-700 group hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden">
                                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 group-hover:text-blue-500">add_circle</span>
                                <h4 className="text-white font-bold">Yeni Yol Hattı</h4>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase">Manuel Giriş</p>
                            </div>
                            
                            <div className="p-6 bg-iha-900 rounded-2xl border border-iha-700 group hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden">
                                {isUploading ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span className="material-symbols-outlined text-4xl text-emerald-500 animate-spin">sync</span>
                                        <p className="text-emerald-400 text-xs font-bold mt-2">{t('common.loading')}</p>
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 group-hover:text-emerald-500">upload</span>
                                        <h4 className="text-white font-bold">Alignment İçe Aktar</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase">Toplu Yükleme (DWG, XML, JSON)</p>
                                        <input type="file" onChange={handleAlignmentUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".dwg,.dxf,.xml,.json,.geojson" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-iha-800 rounded-2xl border border-iha-700 shadow-xl overflow-hidden">
                         <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white uppercase text-xs tracking-widest">Aktif Yol Geometrileri</div>
                         {data.externalLayers.filter(l => l.category === 'road_alignment').length > 0 ? (
                             <table className="w-full text-left text-sm text-slate-300">
                                 <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                                     <tr><th className="p-4">Dosya Adı</th><th className="p-4">Görünürlük</th><th className="p-4 text-right">İşlem</th></tr>
                                 </thead>
                                 <tbody className="divide-y divide-iha-700">
                                     {data.externalLayers.filter(l => l.category === 'road_alignment').map(layer => (
                                         <tr key={layer.id}>
                                             <td className="p-4 font-bold text-white">{layer.name}</td>
                                             <td className="p-4">
                                                 <button onClick={() => toggleLayerVisibility(layer.id)} className={`p-1.5 rounded-lg transition-colors ${layer.isVisible ? 'text-blue-500 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                                                     <span className="material-symbols-outlined">{layer.isVisible ? 'visibility' : 'visibility_off'}</span>
                                                 </button>
                                             </td>
                                             <td className="p-4 text-right">
                                                 <button onClick={() => deleteExternalLayer(layer.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         ) : (
                             <div className="p-12 text-center text-slate-500">
                                 <span className="material-symbols-outlined text-4xl opacity-20 block mb-2">construction</span>
                                 Yüklenen bir eksen dosyası bulunmamaktadır.
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};
