
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { PolygonPoint, ChainageMarker, PolygonStatus } from '../../types';
import { ExcelUploadModal } from './modals/ExcelUploadModal';
import { MapWidget } from '../../components/MapWidget';
import { apiService } from '../../services/api';

export const AdminTopo: React.FC = () => {
    const { 
        data, 
        addPolygonPoint, updatePolygonPoint, addBulkPolygonPoints, deletePolygonPoint, 
        addChainageMarker, updateChainageMarker, deleteChainageMarker, addBulkChainageMarkers,
        addLandXmlFile, deleteLandXmlFile 
    } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useUI();
    
    type TopoSubTab = 'polygons' | 'km_stones' | 'landxml';
    const [subTab, setSubTab] = useState<TopoSubTab>('polygons');

    // PAGINATION STATES
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [paginatedPolygons, setPaginatedPolygons] = useState<PolygonPoint[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [tableSearch, setTableSearch] = useState('');

    // MAP STATES
    const [activeTool, setActiveTool] = useState<any>('none');
    const [measurePoints, setMeasurePoints] = useState<{lat: number, lng: number}[]>([]);
    const [liveDistance, setLiveDistance] = useState('');
    const [liveArea, setLiveArea] = useState('');

    // POLYGON CRUD
    const [editPolyId, setEditPolyId] = useState<string | null>(null);
    const [newPoly, setNewPoly] = useState({ 
        no: '', roadName: '', km: '', offset: '', east: '', north: '', elev: '', lat: '', lng: '', desc: '', status: 'ACTIVE' as PolygonStatus
    });

    // KM CRUD
    const [editKmId, setEditKmId] = useState<string | null>(null);
    const [newKm, setNewKm] = useState({ km: '', lat: '', lng: '', align: 'center' as any });

    // LANDXML CRUD
    const [newLandXml, setNewLandXml] = useState<{ 
        type: 'SURFACE' | 'ALIGNMENT', 
        description: string,
        color: string,
        opacity: number
    }>({ 
        type: 'SURFACE', 
        description: '',
        color: '#3b82f6', 
        opacity: 0.6
    });
    const [isUploading, setIsUploading] = useState(false);

    // MODAL STATES
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [uploadMode, setUploadMode] = useState<'POLYGON' | 'KM'>('POLYGON');

    // --- FETCH PAGINATED DATA ---
    const fetchTableData = async () => {
        setIsLoadingTable(true);
        const res = await apiService.getPolygonsPaginated(page, limit, tableSearch);
        setPaginatedPolygons(res.data);
        setTotalCount(res.count);
        setIsLoadingTable(false);
    };

    useEffect(() => {
        if (subTab === 'polygons') {
            fetchTableData();
        }
    }, [page, tableSearch, subTab]);

    // DYNAMIC ROAD LIST FOR KM UPLOAD
    const availableRoads = useMemo(() => {
        const fromXML = data.landXmlFiles.filter(f => f.type === 'ALIGNMENT').map(f => f.name);
        const fromGeo = data.externalLayers.filter(l => l.category === 'road_alignment').map(l => l.name);
        return Array.from(new Set([...fromXML, ...fromGeo, 'Main Road', 'Secondary Road']));
    }, [data.landXmlFiles, data.externalLayers]);

    if (!currentUser || (!currentUser.permissions.includes('manage_map') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleSavePolygon = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newPoly.no) return;
        const polyData: Omit<PolygonPoint, 'id'> = { 
            polygonNo: newPoly.no, roadName: newPoly.roadName, km: newPoly.km, offset: newPoly.offset, 
            east: newPoly.east, north: newPoly.north, elevation: newPoly.elev, lat: newPoly.lat, lng: newPoly.lng, 
            description: newPoly.desc, status: newPoly.status
        };
        if (editPolyId) { 
            await updatePolygonPoint(editPolyId, polyData); 
            showToast('Poligon güncellendi.'); 
        } else { 
            await addPolygonPoint(polyData); 
            showToast('Poligon eklendi.'); 
        }
        resetPolyForm();
        fetchTableData(); // Refresh table
    };

    const handleDeletePolygon = async (id: string) => {
        if(window.confirm('Bu poligonu silmek istediğinize emin misiniz?')) {
            const success = await deletePolygonPoint(id);
            if(success) {
                showToast('Poligon silindi.', 'success');
                fetchTableData();
            }
        }
    };

    // ... (KM Stone Save Logic - Existing)
    const handleSaveKmStone = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newKm.km || !newKm.lat) return;
        const kmData: Omit<ChainageMarker, 'id'> = { 
            km: newKm.km, lat: parseFloat(newKm.lat), lng: parseFloat(newKm.lng), align: newKm.align,
            roadName: 'Manual Entry', type: 'MAIN'
        };
        if (editKmId) { updateChainageMarker(editKmId, kmData); showToast('KM taşı güncellendi.'); }
        else { addChainageMarker(kmData); showToast('KM taşı eklendi.'); }
        resetKmForm();
    };

    // ... (LandXML Upload Logic - Existing)
    const handleLandXMLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            showToast(`${file.name} yükleniyor...`, 'info');

            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'Survey/LandXML');

            if (error) {
                showToast(`HATA: ${error}`, 'error');
            } else if (publicUrl) {
                addLandXmlFile({
                    name: file.name,
                    type: newLandXml.type,
                    description: newLandXml.description,
                    uploadDate: new Date().toISOString().split('T')[0],
                    uploadedBy: currentUser.fullName,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    url: publicUrl,
                    color: newLandXml.color,
                    opacity: newLandXml.opacity,
                    isVisible: false 
                });
                showToast('LandXML dosyası başarıyla eklendi.');
                setNewLandXml(prev => ({ ...prev, description: '' }));
            }
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const resetPolyForm = () => { setEditPolyId(null); setNewPoly({ no: '', roadName: '', km: '', offset: '', east: '', north: '', elev: '', lat: '', lng: '', desc: '', status: 'ACTIVE' }); };
    const resetKmForm = () => { setEditKmId(null); setNewKm({ km: '', lat: '', lng: '', align: 'center' }); };

    const handleMapClick = (lat: number, lng: number) => {
        if (subTab === 'polygons') { setNewPoly(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) })); }
        else if (subTab === 'km_stones') { setNewKm(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) })); }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* 1. ÜST KISIM: SABİT HARİTA */}
            <div className="bg-iha-800 p-2 rounded-2xl border border-iha-700 shadow-xl overflow-hidden">
                <MapWidget 
                    activeTool={activeTool} setActiveTool={setActiveTool}
                    onMapClick={handleMapClick} measurePoints={measurePoints} setMeasurePoints={setMeasurePoints}
                    setLiveDistance={setLiveDistance} setLiveArea={setLiveArea}
                />
            </div>

            {/* 2. ORTA KISIM: TAB SİSTEMİ */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-iha-800 p-2 rounded-2xl border border-iha-700">
                <div className="flex gap-2 p-1 overflow-x-auto">
                    <button onClick={() => setSubTab('polygons')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subTab === 'polygons' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                        <span className="material-symbols-outlined text-lg">format_list_bulleted</span> Poligon Yönetimi
                    </button>
                    <button onClick={() => setSubTab('km_stones')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subTab === 'km_stones' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                        <span className="material-symbols-outlined text-lg">add_road</span> KM Taşları
                    </button>
                    <button onClick={() => setSubTab('landxml')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subTab === 'landxml' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                        <span className="material-symbols-outlined text-lg">landscape</span> BIM & LandXML
                    </button>
                </div>
                
                {/* UPLOAD BUTTON (Depends on Tab) */}
                {subTab === 'polygons' && (
                    <button onClick={() => { setUploadMode('POLYGON'); setIsExcelModalOpen(true); }} className="mr-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-500 transition-all shadow-lg">
                        <span className="material-symbols-outlined text-sm">table_view</span> Poligon Yükle (Excel)
                    </button>
                )}
                {subTab === 'km_stones' && (
                    <button onClick={() => { setUploadMode('KM'); setIsExcelModalOpen(true); }} className="mr-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-500 transition-all shadow-lg">
                        <span className="material-symbols-outlined text-sm">upload_file</span> KM Toplu Yükle (Excel)
                    </button>
                )}
            </div>

            {/* 3. ALT KISIM: FORM VE LİSTE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* --- LANDXML SECTION --- */}
                {subTab === 'landxml' && (
                    <div className="lg:col-span-12 space-y-6">
                        {/* ... Existing LandXML UI Code ... */}
                        <div className="bg-gradient-to-r from-purple-900/40 to-iha-800 p-8 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                        <span className="p-2 bg-purple-600 rounded-lg"><span className="material-symbols-outlined text-white">view_in_ar</span></span>
                                        BIM Entegrasyon Verileri
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Topografik yüzeyler (Surface) ve yol güzergahları (Alignment) için <strong>LandXML</strong> formatındaki dosyaları buradan yükleyebilirsiniz.
                                        Yüklenen dosya varsayılan olarak haritada <strong>kapalı</strong> gelir.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Veri Tipi</label>
                                        <select value={newLandXml.type} onChange={e => setNewLandXml({...newLandXml, type: e.target.value as any})} className="w-full bg-iha-900 border border-iha-700 rounded-xl p-3 text-white">
                                            <option value="SURFACE">Yüzey / Arazi (Surface)</option>
                                            <option value="ALIGNMENT">Güzergah (Alignment)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Açıklama</label>
                                        <input placeholder="Opsiyonel açıklama..." value={newLandXml.description} onChange={e => setNewLandXml({...newLandXml, description: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Görünüm Rengi</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={newLandXml.color} onChange={e => setNewLandXml({...newLandXml, color: e.target.value})} className="h-11 w-16 bg-transparent border-0 cursor-pointer rounded" />
                                            <input value={newLandXml.color} readOnly className="flex-1 bg-iha-900 border border-iha-700 rounded-xl p-3 text-white font-mono text-xs" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Opaklık (Transparanlık): {newLandXml.opacity}</label>
                                        <input type="range" min="0.1" max="1" step="0.1" value={newLandXml.opacity} onChange={e => setNewLandXml({...newLandXml, opacity: parseFloat(e.target.value)})} className="w-full h-2 bg-iha-700 rounded-lg appearance-none cursor-pointer mt-4" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-center">
                                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${isUploading ? 'bg-iha-900 border-purple-500 opacity-50' : 'border-iha-600 hover:border-purple-500 hover:bg-purple-900/10'}`}>
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-purple-500 animate-spin">sync</span>
                                            <p className="text-purple-400 text-xs font-bold mt-2 uppercase">Yükleniyor...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-purple-400 mb-2 transition-colors">upload_file</span>
                                            <p className="text-sm font-bold text-white">Dosya Seç</p>
                                            <p className="text-[10px] text-slate-500 uppercase mt-1">.XML, .LandXML</p>
                                            <input type="file" className="hidden" accept=".xml,.landxml" onChange={handleLandXMLUpload} />
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="bg-iha-800 rounded-2xl border border-iha-700 shadow-xl overflow-hidden">
                            <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">folder_data</span> Yüklü LandXML Dosyaları
                            </div>
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                                    <tr>
                                        <th className="p-4">Dosya Adı</th>
                                        <th className="p-4">Tip</th>
                                        <th className="p-4">Stil</th>
                                        <th className="p-4">Açıklama</th>
                                        <th className="p-4">Yükleyen / Tarih</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-iha-700">
                                    {data.landXmlFiles.map(file => (
                                        <tr key={file.id} className="hover:bg-iha-900/50 transition-colors">
                                            <td className="p-4 font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-slate-500 text-lg">description</span>{file.name}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${file.type === 'SURFACE' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>{file.type}</span></td>
                                            <td className="p-4"><div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded border border-white/20" style={{backgroundColor: file.color, opacity: file.opacity}}></div><span className="font-mono">{file.opacity * 100}%</span></div></td>
                                            <td className="p-4 text-xs text-slate-400">{file.description || '-'}</td>
                                            <td className="p-4 text-xs"><div className="text-white">{file.uploadedBy}</div><div className="text-slate-500">{file.uploadDate}</div></td>
                                            <td className="p-4 text-right"><a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 text-blue-400 hover:bg-blue-500/10 rounded mr-1"><span className="material-symbols-outlined text-lg">download</span></a><button onClick={() => {if(window.confirm('Dosyayı silmek istediğinize emin misiniz?')) deleteLandXmlFile(file.id)}} className="inline-flex p-2 text-red-400 hover:bg-red-500/10 rounded"><span className="material-symbols-outlined text-lg">delete</span></button></td>
                                        </tr>
                                    ))}
                                    {data.landXmlFiles.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">Henüz yüklenmiş LandXML dosyası yok.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- POLYGONS & KM STONES --- */}
                {subTab !== 'landxml' && (
                    <>
                        <div className="lg:col-span-4 space-y-4">
                            {subTab === 'polygons' ? (
                                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl animate-in slide-in-from-left-4">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-emerald-500 text-lg">{editPolyId ? 'edit' : 'add_circle'}</span>
                                        {editPolyId ? 'Poligon Düzenle' : 'Yeni Topografik Veri'}
                                    </h3>
                                    <form onSubmit={handleSavePolygon} className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Poligon Durumu</label>
                                            <select value={newPoly.status} onChange={e => setNewPoly({...newPoly, status: e.target.value as PolygonStatus})} className="w-full border rounded-lg p-2.5 text-sm font-bold outline-none bg-emerald-900/30 border-emerald-500/50 text-emerald-400">
                                                <option value="ACTIVE">AKTİF (Kullanılabilir)</option>
                                                <option value="LOST">KAYIP (Bulunamadı)</option>
                                                <option value="DAMAGED">HASARLI (Güvenilmez)</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2"><input placeholder="P.No" value={newPoly.no} onChange={e => setNewPoly({...newPoly, no: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm" /><input placeholder="KM" value={newPoly.km} onChange={e => setNewPoly({...newPoly, km: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm" /></div>
                                        <input placeholder="Yol / Yapı Adı" value={newPoly.roadName} onChange={e => setNewPoly({...newPoly, roadName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-iha-700"><input placeholder="Doğu (Y)" value={newPoly.east} onChange={e => setNewPoly({...newPoly, east: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs font-mono" /><input placeholder="Kuzey (X)" value={newPoly.north} onChange={e => setNewPoly({...newPoly, north: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs font-mono" /></div>
                                        <input placeholder="Kot (H)" value={newPoly.elev} onChange={e => setNewPoly({...newPoly, elev: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm font-bold text-yellow-500" />
                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2 uppercase tracking-widest">KAYDET</button>
                                        {editPolyId && <button type="button" onClick={resetPolyForm} className="w-full text-slate-500 text-[10px] hover:underline uppercase">VAZGEÇ</button>}
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl animate-in slide-in-from-left-4">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-blue-500 text-lg">add_road</span>
                                        {editKmId ? 'KM Taşı Düzenle' : 'Yeni KM Taşı Ekle'}
                                    </h3>
                                    <form onSubmit={handleSaveKmStone} className="space-y-3">
                                        <input placeholder="Kilometre (Örn: 12+500)" value={newKm.km} onChange={e => setNewKm({...newKm, km: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm font-bold" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input placeholder="WGS84 Lat" value={newKm.lat} onChange={e => setNewKm({...newKm, lat: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs font-mono" />
                                            <input placeholder="WGS84 Lng" value={newKm.lng} onChange={e => setNewKm({...newKm, lng: e.target.value})} className="bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs font-mono" />
                                        </div>
                                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2 uppercase tracking-widest">KM TAŞI EKLE</button>
                                        {editKmId && <button type="button" onClick={resetKmForm} className="w-full text-slate-500 text-[10px] hover:underline uppercase">VAZGEÇ</button>}
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8 bg-iha-800 rounded-2xl border border-iha-700 shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-4 bg-iha-900 border-b border-iha-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {subTab === 'polygons' ? 'TOPLAM KAYIT (DB):' : 'KM TAŞLARI LİSTESİ'}
                                    <span className="bg-slate-800 text-emerald-400 font-mono text-sm px-2 py-0.5 rounded border border-slate-700">
                                        {subTab === 'polygons' ? totalCount : data.chainageMarkers.length}
                                    </span>
                                </span>
                                {subTab === 'polygons' && <input placeholder="Ara (Enter)..." value={tableSearch} onChange={e => setTableSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchTableData()} className="bg-iha-800 border border-iha-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 w-48 transition-all focus:w-64" />}
                            </div>
                            
                            <div className="flex-1 overflow-x-auto min-h-[300px] relative">
                                {isLoadingTable && (
                                    <div className="absolute inset-0 bg-iha-900/80 z-20 flex items-center justify-center">
                                        <span className="material-symbols-outlined animate-spin text-4xl text-emerald-500">sync</span>
                                    </div>
                                )}
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500 sticky top-0 z-10">
                                        {subTab === 'polygons' ? (
                                            <tr><th className="p-4">Statü</th><th className="p-4">P.No</th><th className="p-4">Yapı / KM</th><th className="p-4">Koordinatlar</th><th className="p-4">Kot</th><th className="p-4 text-right">İşlem</th></tr>
                                        ) : (
                                            <tr><th className="p-4">Yol</th><th className="p-4">Kilometre</th><th className="p-4">Tip</th><th className="p-4">Koordinatlar</th><th className="p-4 text-right">İşlem</th></tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-iha-700">
                                        {subTab === 'polygons' ? (
                                            paginatedPolygons.map(p => (
                                                <tr key={p.id} className={`hover:bg-iha-900/50 group transition-colors ${p.status !== 'ACTIVE' ? 'opacity-60 bg-red-900/10' : ''}`}>
                                                    <td className="p-4"><span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${p.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : p.status === 'LOST' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}`}>{p.status}</span></td>
                                                    <td className={`p-4 font-bold ${p.status !== 'ACTIVE' ? 'text-red-400 line-through' : 'text-white'}`}>{p.polygonNo}</td>
                                                    <td className="p-4 text-[11px]"><div>{p.roadName}</div><div className="text-slate-500">{p.km}</div></td>
                                                    <td className="p-4 font-mono text-[10px]"><div className="text-slate-400">Y: {p.east}</div><div className="text-slate-400">X: {p.north}</div></td>
                                                    <td className="p-4 font-bold text-yellow-500">{p.elevation}</td>
                                                    <td className="p-4 text-right"><div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditPolyId(p.id); setNewPoly({no:p.polygonNo, roadName:p.roadName||'', km:p.km||'', offset:p.offset||'', east:p.east, north:p.north, elev:p.elevation, lat:p.lat||'', lng:p.lng||'', desc:p.description, status:p.status}); }} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"><span className="material-symbols-outlined text-sm">edit</span></button><button onClick={() => handleDeletePolygon(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"><span className="material-symbols-outlined text-sm">delete</span></button></div></td>
                                                </tr>
                                            ))
                                        ) : (
                                            data.chainageMarkers.map(m => (
                                                <tr key={m.id} className="hover:bg-iha-900/50 group transition-colors">
                                                    <td className="p-4 font-bold text-white text-xs">{m.roadName || 'Unknown'}</td>
                                                    <td className="p-4 font-mono font-bold text-blue-400">{m.km}</td>
                                                    <td className="p-4"><span className="text-[10px] bg-slate-700 px-2 py-1 rounded border border-slate-600 uppercase">{m.type || 'MAIN'}</span></td>
                                                    <td className="p-4 font-mono text-[10px] text-slate-400">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</td>
                                                    <td className="p-4 text-right"><div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditKmId(m.id); setNewKm({km:m.km, lat:m.lat.toString(), lng:m.lng.toString(), align:m.align}); }} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"><span className="material-symbols-outlined text-sm">edit</span></button><button onClick={() => deleteChainageMarker(m.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"><span className="material-symbols-outlined text-sm">delete</span></button></div></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {subTab === 'polygons' && (
                                <div className="p-4 border-t border-iha-700 flex justify-between items-center bg-iha-900">
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-iha-800 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-iha-700">Önceki</button>
                                    <span className="text-xs text-slate-400">Sayfa {page} / {Math.ceil(totalCount / limit)}</span>
                                    <button disabled={page * limit >= totalCount} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-iha-800 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-iha-700">Sonraki</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ExcelUploadModal 
                isOpen={isExcelModalOpen} 
                onClose={() => { setIsExcelModalOpen(false); fetchTableData(); }} 
                mode={uploadMode}
                onUpload={addBulkPolygonPoints}
                onUploadKm={addBulkChainageMarkers}
                availableRoads={availableRoads}
            />
        </div>
    );
};
