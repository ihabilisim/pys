
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { StructureElement, Language, LocalizedString } from '../../types';
import { apiService } from '../../services/api';

export const AdminStructureInventory: React.FC = () => {
    const { struct, data } = useData();
    const { showToast, language, t } = useUI();
    const { currentUser } = useAuth();

    // Default tab
    const [activeTab, setActiveTab] = useState<'TYPES' | 'INVENTORY' | 'LAYERS'>('INVENTORY');
    
    // Inventory States
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
    const [editingStructId, setEditingStructId] = useState<string | null>(null);
    const [newStruct, setNewStruct] = useState({ name: '', code: '', kmStart: '', kmEnd: '', isSplit: false, path: '' });
    const [selectedStructId, setSelectedStructId] = useState<string | null>(null);
    const [selectedLayerId, setSelectedLayerId] = useState('');
    const [isUploadingSurface, setIsUploadingSurface] = useState(false);

    // --- Element Management States ---
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [isBulkMode, setIsBulkMode] = useState(false); 
    const [bulkText, setBulkText] = useState('');
    
    // Element Form States
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [newGroup, setNewGroup] = useState<{name: string, type: 'PIER' | 'ABUTMENT' | 'SPAN' | 'OTHER', direction: 'L'|'R'|'C', order: number}>({
        name: '', type: 'PIER', direction: 'C', order: 1
    });

    const [newElement, setNewElement] = useState({
        name: '', 
        class: 'PILE' as any,
        shape: 'CYLINDER' as 'CYLINDER' | 'BOX',
        x: 0, y: 0, z: 0,
        d1: 1.2, // Diameter or Width
        d2: 12.0, // Height/Length
        d3: 0,
        polygonText: '' // New field for corner coordinates text (X Y \n X Y)
    });

    // Layers & Types States
    const [newLayer, setNewLayer] = useState<{name: LocalizedString, orderIndex: number}>({ name: { tr: '', en: '', ro: '' }, orderIndex: 0 });
    const [layerLang, setLayerLang] = useState<Language>('tr');
    const [newType, setNewType] = useState<{code: string, name: LocalizedString, icon: string}>({ code: '', name: { tr: '', en: '', ro: '' }, icon: 'category' });
    const [typeLang, setTypeLang] = useState<Language>('tr');

    useEffect(() => {
        struct.loadTypes();
        struct.loadStructures();
        struct.loadLayers();
    }, []);

    // AUTO-GENERATE PATH EFFECT (Only for new structs)
    useEffect(() => {
        if (!selectedTypeFilter || !newStruct.code || editingStructId) return;
        
        const typeObj = struct.types.find(t => t.id === selectedTypeFilter);
        if (!typeObj) return;

        let rootPath = "";
        // Basic logic: if type code is POD use defaultBridgePath, if DG use defaultCulvertPath
        if (typeObj.code === 'POD') rootPath = data.settings.defaultBridgePath;
        else if (typeObj.code === 'DG') rootPath = data.settings.defaultCulvertPath;
        else return; // Don't auto-gen for unknown types

        // Sanitize name for folder safety
        const safeName = newStruct.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const generatedPath = `${rootPath}/${newStruct.code}_${safeName}`;
        
        // Only update if path is empty or looks like an auto-generated path (basic check)
        if (!newStruct.path || newStruct.path.startsWith(rootPath)) {
            setNewStruct(prev => ({ ...prev, path: generatedPath }));
        }
    }, [newStruct.code, newStruct.name, selectedTypeFilter, data.settings, editingStructId]);

    // --- HANDLERS ---

    const handleSaveStruct = async (e: React.SyntheticEvent) => { 
        if(e && e.preventDefault) e.preventDefault();
        if (!selectedTypeFilter) { showToast('Lütfen önce tür seçiniz.', 'error'); return; }
        
        const structData = {
            typeId: selectedTypeFilter, 
            code: newStruct.code, 
            name: newStruct.name, 
            kmStart: parseFloat(newStruct.kmStart)||0, 
            kmEnd: parseFloat(newStruct.kmEnd)||0, 
            isSplit: newStruct.isSplit,
            path: newStruct.path 
        };

        if (editingStructId) {
            await struct.updateStructure(editingStructId, structData);
            setEditingStructId(null);
        } else {
            await struct.addStructure(structData);
        }
        
        setNewStruct({ name: '', code: '', kmStart: '', kmEnd: '', isSplit: false, path: '' });
    };

    const handleEditStruct = (s: any) => {
        setEditingStructId(s.id);
        setSelectedTypeFilter(s.typeId); // Ensure type is selected to show form
        setNewStruct({
            name: s.name,
            code: s.code,
            kmStart: s.kmStart?.toString() || '',
            kmEnd: s.kmEnd?.toString() || '',
            isSplit: s.isSplit,
            path: s.path || ''
        });
    };

    const handleCancelStructEdit = () => {
        setEditingStructId(null);
        setNewStruct({ name: '', code: '', kmStart: '', kmEnd: '', isSplit: false, path: '' });
    };

    const handleSaveGroup = async (e: React.SyntheticEvent) => {
        if(e && e.preventDefault) e.preventDefault();
        if(!selectedStructId || !newGroup.name) return;
        
        const groupData = {
            structureId: selectedStructId, 
            name: newGroup.name, 
            groupType: newGroup.type, 
            direction: newGroup.direction, 
            orderIndex: newGroup.order
        };

        if (editingGroupId) {
            await struct.updateGroup(editingGroupId, groupData);
            setEditingGroupId(null);
        } else {
            await struct.addGroup(groupData);
        }
        setNewGroup({ name: '', type: 'PIER', direction: 'C', order: 1 }); // Reset to default
    };

    const handleEditGroup = (g: any) => {
        setEditingGroupId(g.id);
        setNewGroup({
            name: g.name,
            type: g.groupType,
            direction: g.direction,
            order: g.orderIndex
        });
    };

    const handleCancelGroupEdit = () => {
        setEditingGroupId(null);
        setNewGroup({ name: '', type: 'PIER', direction: 'C', order: 1 });
    };

    const parsePolygonText = (text: string) => {
        const points: {x: number, y: number}[] = [];
        const lines = text.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/[\t\s,]+/); // Split by tab, space or comma
            if (parts.length >= 2) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                if (!isNaN(x) && !isNaN(y)) points.push({ x, y });
            }
        });
        return points;
    };

    const handleSaveElement = async (e: React.SyntheticEvent) => {
        if(e && e.preventDefault) e.preventDefault();
        if(!selectedGroupId || !newElement.name) return;
        
        let polygonPoints = undefined;
        // If Box/Polygon, parse the points
        if (newElement.shape === 'BOX') {
            polygonPoints = parsePolygonText(newElement.polygonText);
            if (polygonPoints.length < 3) {
                showToast('HATA: Kutu/Poligon için en az 3 nokta (X Y) girmelisiniz.', 'error');
                return;
            }
        }

        const elementData = {
            groupId: selectedGroupId,
            name: newElement.name,
            elementClass: newElement.class
        };

        const coordsData = {
            shape: newElement.shape,
            coords: { x: newElement.x, y: newElement.y, z: newElement.z },
            dimensions: { d1: newElement.d1, d2: newElement.d2, d3: newElement.d3 },
            rotation: { x: 0, y: 0, z: 0 },
            slope: 0,
            polygonPoints: polygonPoints
        };

        if (editingElementId) {
            await struct.updateElement(editingElementId, elementData, coordsData);
            showToast(`${newElement.name} güncellendi.`);
            setEditingElementId(null);
        } else {
            await struct.addElement(elementData, coordsData);
            showToast(`${newElement.name} eklendi.`);
        }
        
        // Reset form slightly for next entry
        if (!editingElementId) {
            setNewElement({ ...newElement, name: '', x: newElement.x + 5 }); // Auto increment X for convenience
        } else {
            // Full reset if we finished editing
            resetElementForm();
        }
    };

    const handleEditClick = (elm: any) => {
        setEditingElementId(elm.id);
        const coords = elm.coordinates;
        
        // Parse polygon points back to string
        let polyStr = '';
        if (coords?.polygonPoints) {
            polyStr = coords.polygonPoints.map((p: any) => `${p.x} ${p.y}`).join('\n');
        }

        setNewElement({
            name: elm.name,
            class: elm.elementClass,
            shape: coords?.shape || 'CYLINDER',
            x: coords?.coords.x || 0,
            y: coords?.coords.y || 0,
            z: coords?.coords.z || 0,
            d1: coords?.dimensions.d1 || 0,
            d2: coords?.dimensions.d2 || 0,
            d3: coords?.dimensions.d3 || 0,
            polygonText: polyStr
        });
    };

    const resetElementForm = () => {
        setEditingElementId(null);
        setNewElement({
            name: '', class: 'PILE', shape: 'CYLINDER',
            x: 0, y: 0, z: 0, d1: 1.2, d2: 12.0, d3: 0, polygonText: ''
        });
    };

    const handleBulkUpload = async () => {
        if (!selectedGroupId || !bulkText) return;
        await struct.addBulkElements(selectedGroupId, bulkText);
        setBulkText('');
        setIsBulkMode(false);
    };

    const handleAddLayer = async (e: React.SyntheticEvent) => {
        if(e && e.preventDefault) e.preventDefault();
        if(!newLayer.name.tr) return;
        await struct.addLayer({ name: newLayer.name, orderIndex: newLayer.orderIndex });
        setNewLayer({ name: { tr: '', en: '', ro: '' }, orderIndex: struct.layers.length + 1 });
    };

    const handleAddType = async (e: React.SyntheticEvent) => {
        if(e && e.preventDefault) e.preventDefault();
        if(!newType.name.tr || !newType.code) { showToast('Kod ve İsim zorunludur.', 'error'); return; }
        await struct.addStructureType(newType);
        setNewType({ code: '', name: { tr: '', en: '', ro: '' }, icon: 'category' });
    };

    const handleUploadSurface = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... Existing Surface Logic ...
        if (!selectedStructId || !selectedLayerId) { showToast('Yapı ve Katman seçiniz.', 'error'); return; }
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploadingSurface(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const geoJson = JSON.parse(event.target?.result as string);
                    // Check metric/WGS84 logic...
                    const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'Structure/Surfaces');
                    if (error) { showToast(error, 'error'); return; }
                    await struct.addSurface({ structureId: selectedStructId, layerId: selectedLayerId, fileUrl: publicUrl || '', geojson: geoJson });
                    showToast(t('structure.surfaceAdded'));
                } catch (e) { showToast('Geçersiz GeoJSON dosyası!', 'error'); } finally { setIsUploadingSurface(false); }
            };
            reader.readAsText(file);
        }
    };

    const activeStruct = struct.structures.find(s => s.id === selectedStructId);
    const activeGroup = activeStruct?.groups.find(g => g.id === selectedGroupId);
    
    // Logic Split
    const selectedTypeObj = struct.types.find(t => t.id === selectedTypeFilter);
    const isAddingSurfaceType = selectedTypeObj?.code === 'EARTHWORK' || selectedTypeObj?.code === 'SUPERSTRUCTURE';
    const activeType = struct.types.find(t => t.id === activeStruct?.typeId);
    const isSurfaceBased = activeType?.code === 'EARTHWORK' || activeType?.code === 'SUPERSTRUCTURE';

    if (!currentUser || (!currentUser.permissions.includes('manage_files') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">{t('common.noPermission')}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Tabs */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit">
                <button onClick={() => setActiveTab('INVENTORY')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}><span className="material-symbols-outlined">view_list</span> {t('structure.inventory')}</button>
                <button onClick={() => setActiveTab('TYPES')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'TYPES' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}><span className="material-symbols-outlined">category</span> {t('structure.types')}</button>
                <button onClick={() => setActiveTab('LAYERS')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'LAYERS' ? 'bg-orange-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}><span className="material-symbols-outlined">layers</span> {t('structure.layers')}</button>
            </div>

            {/* 1. INVENTORY TAB */}
            {activeTab === 'INVENTORY' && (
                <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
                    {/* LEFT PANEL: STRUCTURE LIST */}
                    <div className="w-full lg:w-1/3 bg-iha-800 rounded-2xl border border-iha-700 flex flex-col overflow-hidden shadow-xl">
                        <div className={`p-4 border-b border-iha-700 transition-colors ${editingStructId ? 'bg-blue-900/30' : 'bg-iha-900/50'}`}>
                            <h4 className={`text-sm font-bold mb-3 ${editingStructId ? 'text-blue-400' : 'text-slate-400'}`}>
                                {editingStructId ? 'Yapıyı Düzenle' : 'Yeni Yapı Ekle'}
                            </h4>
                            <select value={selectedTypeFilter} onChange={e => setSelectedTypeFilter(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm mb-3">
                                <option value="">-- Kategori Seç --</option>
                                {struct.types.map(t => <option key={t.id} value={t.id}>{t.name[language]}</option>)}
                            </select>
                            <form onSubmit={handleSaveStruct} className="grid grid-cols-2 gap-2 p-3 bg-iha-900 rounded-xl border border-iha-700">
                                {isAddingSurfaceType ? (
                                    <>
                                        <input placeholder="Adı / Sektörü" value={newStruct.name} onChange={e => setNewStruct({...newStruct, name: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs col-span-2" />
                                        <input placeholder="Başlangıç KM" value={newStruct.kmStart} onChange={e => setNewStruct({...newStruct, kmStart: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                        <input placeholder="Bitiş KM" value={newStruct.kmEnd} onChange={e => setNewStruct({...newStruct, kmEnd: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                    </>
                                ) : (
                                    <>
                                        <input placeholder="Kod (B1)" value={newStruct.code} onChange={e => setNewStruct({...newStruct, code: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                        <input placeholder="Adı (Viyadük)" value={newStruct.name} onChange={e => setNewStruct({...newStruct, name: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                        <input placeholder="Start KM" value={newStruct.kmStart} onChange={e => setNewStruct({...newStruct, kmStart: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                        <input placeholder="End KM" value={newStruct.kmEnd} onChange={e => setNewStruct({...newStruct, kmEnd: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                        
                                        <div className="col-span-2">
                                            <label className="text-[10px] text-slate-500 block mb-1">PVLA Dosya Yolu (Otomatik)</label>
                                            <input 
                                                value={newStruct.path} 
                                                onChange={e => setNewStruct({...newStruct, path: e.target.value})} 
                                                className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-yellow-500 font-mono text-[10px]" 
                                                placeholder="/PVLA/Bridge/Scan/..." 
                                            />
                                        </div>

                                        <div className="col-span-2 flex items-center gap-2 mt-1 bg-iha-800 p-2 rounded border border-iha-700">
                                            <input type="checkbox" id="isSplitCheck" checked={newStruct.isSplit} onChange={e => setNewStruct({...newStruct, isSplit: e.target.checked})} className="w-4 h-4 rounded border-iha-600 bg-iha-900 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="isSplitCheck" className="text-xs text-slate-300 cursor-pointer select-none">Ayrık Yapı (Sağ/Sol) - <span className="text-[10px] text-slate-500">Split Structure</span></label>
                                        </div>
                                    </>
                                )}
                                <div className="col-span-2 flex gap-2 mt-1">
                                    <button className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-500">
                                        {editingStructId ? 'GÜNCELLE' : 'EKLE'}
                                    </button>
                                    {editingStructId && (
                                        <button type="button" onClick={handleCancelStructEdit} className="flex-1 bg-slate-700 text-white text-xs font-bold py-2 rounded hover:bg-slate-600">İPTAL</button>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {struct.structures.filter(s => !selectedTypeFilter || s.typeId === selectedTypeFilter).map(s => (
                                <div key={s.id} onClick={() => { setSelectedStructId(s.id); setSelectedGroupId(null); }} className={`p-3 rounded-lg cursor-pointer border transition-all group relative ${selectedStructId === s.id ? 'bg-blue-600/20 border-blue-500/50' : 'bg-iha-900 border-transparent hover:bg-white/5'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white text-sm">{s.code || s.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{s.kmStart} - {s.kmEnd}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                        <p className="text-xs text-slate-300">{s.name}</p>
                                        {s.isSplit && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">SPLIT</span>}
                                    </div>
                                    
                                    {/* Edit/Delete Actions */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleEditStruct(s); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); struct.deleteStructure(s.id); }} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: EDITOR */}
                    <div className="flex-1 bg-iha-800 rounded-2xl border border-iha-700 flex flex-col relative overflow-hidden shadow-xl">
                        {selectedStructId && activeStruct ? (
                            isSurfaceBased ? (
                                // --- SURFACE EDITOR (GEOJSON) ---
                                <div className="p-6 h-full flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500">terrain</span>
                                        {activeStruct.name} <span className="text-sm font-normal text-slate-400">({activeStruct.kmStart} - {activeStruct.kmEnd})</span>
                                    </h3>
                                    <div className="bg-iha-900 p-6 rounded-2xl border border-iha-700 mb-6">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">cloud_upload</span> GeoJSON Yükle</h4>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <select value={selectedLayerId} onChange={e => setSelectedLayerId(e.target.value)} className="w-full bg-iha-800 border border-iha-600 rounded-lg p-3 text-white text-sm outline-none">
                                                    <option value="">-- Katman Seçiniz --</option>
                                                    {struct.layers.map(l => (<option key={l.id} value={l.id}>{l.name[language]}</option>))}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className={`flex items-center justify-center w-full h-11 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isUploadingSurface ? 'bg-iha-800 border-orange-500 opacity-50' : 'border-iha-600 hover:border-orange-500'}`}>
                                                    {isUploadingSurface ? (<span className="text-xs text-orange-400 font-bold animate-pulse">Yükleniyor...</span>) : (<><span className="material-symbols-outlined text-slate-400 mr-2">upload_file</span><span className="text-xs text-slate-300 font-bold">GeoJSON Seç</span><input type="file" accept=".json,.geojson" onChange={handleUploadSurface} className="hidden" /></>)}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-iha-900/50 rounded-2xl border border-iha-700 overflow-hidden flex flex-col">
                                        <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white text-sm">Yüklü Yüzeyler</div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                            {activeStruct.surfaces?.map(surf => {
                                                const layer = struct.layers.find(l => l.id === surf.layerId);
                                                return (
                                                    <div key={surf.id} className="flex justify-between items-center p-3 bg-iha-800 rounded-xl border border-iha-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><span className="material-symbols-outlined text-sm">check</span></div>
                                                            <div><p className="text-sm font-bold text-white">{layer?.name[language]}</p><p className="text-[10px] text-slate-500">{new Date(surf.updatedAt).toLocaleDateString()}</p></div>
                                                        </div>
                                                        <div className="flex gap-2"><button onClick={() => struct.deleteSurface(surf.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // --- ELEMENT EDITOR (BRIDGE/CULVERT) ---
                                <div className="flex h-full divide-x divide-iha-700">
                                    {/* 1. GROUPS COLUMN (Piers/Abutments) */}
                                    <div className="w-1/3 flex flex-col bg-iha-900/30">
                                        <div className={`p-4 border-b border-iha-700 transition-colors ${editingGroupId ? 'bg-purple-900/30' : ''}`}>
                                            <h4 className={`font-bold text-sm mb-2 flex items-center gap-2 ${editingGroupId ? 'text-purple-400' : 'text-white'}`}>
                                                <span className="material-symbols-outlined text-purple-500">account_tree</span> 
                                                {editingGroupId ? 'Grubu Düzenle' : 'Yapı Grupları (Akslar)'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-1 mb-1">
                                                <input placeholder="Adı (Örn: P1)" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs" />
                                                <input type="number" placeholder="Sıra" value={newGroup.order} onChange={e => setNewGroup({...newGroup, order: parseInt(e.target.value)})} className="bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs" />
                                            </div>
                                            <div className="flex gap-1 mb-2">
                                                <select value={newGroup.type} onChange={e => setNewGroup({...newGroup, type: e.target.value as any})} className="flex-1 bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs"><option value="PIER">Orta Ayak</option><option value="ABUTMENT">Kenar Ayak</option><option value="SPAN">Açıklık</option></select>
                                                <select value={newGroup.direction} onChange={e => setNewGroup({...newGroup, direction: e.target.value as any})} className="w-16 bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs"><option value="C">Orta</option><option value="L">Sol</option><option value="R">Sağ</option></select>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={handleSaveGroup} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded">
                                                    {editingGroupId ? 'GÜNCELLE' : 'GRUP EKLE'}
                                                </button>
                                                {editingGroupId && (
                                                    <button onClick={handleCancelGroupEdit} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded">İPTAL</button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                            {activeStruct.groups?.map(g => (
                                                <div key={g.id} onClick={() => setSelectedGroupId(g.id)} className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center group ${selectedGroupId === g.id ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-iha-800 border-iha-700 text-slate-400 hover:bg-white/5'}`}>
                                                    <div>
                                                        <div className="flex items-center gap-2"><span className="font-bold text-xs">{g.name}</span><span className={`text-[9px] px-1.5 rounded ${g.direction === 'L' ? 'bg-blue-500/20 text-blue-400' : g.direction === 'R' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'}`}>{g.direction}</span></div>
                                                        <p className="text-[9px] opacity-70 mt-0.5">{g.groupType} • {g.elements?.length || 0} Eleman</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); handleEditGroup(g); }} className="text-blue-400 hover:text-white p-1 hover:bg-blue-500/20 rounded">
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); struct.deleteGroup(g.id); }} className="text-red-400 hover:text-white p-1 hover:bg-red-500/20 rounded">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. ELEMENTS COLUMN */}
                                    <div className="flex-1 flex flex-col bg-iha-800 relative">
                                        {selectedGroupId && activeGroup ? (
                                            <>
                                                <div className={`p-4 border-b border-iha-700 bg-iha-900/30 transition-colors ${editingElementId ? 'border-b-yellow-500/30 bg-yellow-500/5' : ''}`}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className={`font-bold text-sm flex items-center gap-2 ${editingElementId ? 'text-yellow-400' : 'text-white'}`}>
                                                            <span className="material-symbols-outlined text-blue-500">{editingElementId ? 'edit' : 'view_in_ar'}</span> 
                                                            {editingElementId ? 'Eleman Düzenle' : 'Yeni Eleman Ekle'}
                                                        </h4>
                                                        
                                                        {/* Toggle Bulk/Single */}
                                                        {!editingElementId && (
                                                            <button 
                                                                onClick={() => setIsBulkMode(!isBulkMode)}
                                                                className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all border ${isBulkMode ? 'bg-green-500 text-white border-green-400' : 'bg-iha-900 text-slate-400 border-iha-700 hover:text-white'}`}
                                                            >
                                                                {isBulkMode ? 'Excel Modu Aktif' : 'Toplu Ekle (Excel)'}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isBulkMode ? (
                                                        // BULK MODE UI
                                                        <div className="animate-in fade-in slide-in-from-top-2">
                                                            <div className="bg-green-500/10 border border-green-500/20 p-2 rounded mb-2">
                                                                <p className="text-[9px] text-green-300 font-bold uppercase mb-1">EXCEL'DEN KOPYALA YAPIŞTIR:</p>
                                                                <p className="text-[9px] text-green-200/70 font-mono">Ad | X | Y | Z | Çap(D1) | Boy(D2) | Uzunluk(D3)</p>
                                                            </div>
                                                            <textarea 
                                                                value={bulkText}
                                                                onChange={(e) => setBulkText(e.target.value)}
                                                                className="w-full bg-iha-900 border border-iha-700 rounded p-2 text-[10px] text-white font-mono h-32 resize-none focus:border-green-500 outline-none"
                                                                placeholder={`P1-01\t456.12\t789.45\t34.50\t1.2\t15.0\t0\nP1-02\t458.12\t789.45\t34.50\t1.2\t15.0\t0`}
                                                            />
                                                            <button onClick={handleBulkUpload} disabled={!bulkText.trim()} className="w-full bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded mt-2 disabled:opacity-50">VERİLERİ YÜKLE</button>
                                                        </div>
                                                    ) : (
                                                        // SINGLE/EDIT MODE UI
                                                        <form onSubmit={handleSaveElement}>
                                                            <div className="grid grid-cols-12 gap-2 mb-2 animate-in fade-in">
                                                                <div className="col-span-3">
                                                                    <label className="text-[9px] text-slate-500 block">Sınıf</label>
                                                                    <select value={newElement.class} onChange={e => setNewElement({...newElement, class: e.target.value as any})} className="w-full bg-iha-900 border border-iha-600 rounded p-1.5 text-white text-xs">
                                                                        <option value="PILE">Kazık</option><option value="FOUNDATION">Temel</option><option value="COLUMN">Kolon</option><option value="CAP_BEAM">Başlık</option><option value="BEAM">Kiriş</option><option value="DECK">Döşeme</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <label className="text-[9px] text-slate-500 block">Ad</label>
                                                                    <input value={newElement.name} onChange={e => setNewElement({...newElement, name: e.target.value})} className="w-full bg-iha-900 border border-iha-600 rounded p-1.5 text-white text-xs" placeholder="Örn: K-01" />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <label className="text-[9px] text-slate-500 block">Şekil</label>
                                                                    <select value={newElement.shape} onChange={e => setNewElement({...newElement, shape: e.target.value as any})} className="w-full bg-iha-900 border border-iha-600 rounded p-1.5 text-white text-xs">
                                                                        <option value="CYLINDER">Silindir (Kazık)</option>
                                                                        <option value="BOX">Kutu / Poligon (Temel)</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-span-3 flex items-end gap-1">
                                                                    {editingElementId && <button type="button" onClick={resetElementForm} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 rounded h-[26px]">İPTAL</button>}
                                                                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 rounded h-[26px]">{editingElementId ? 'KAYDET' : 'EKLE'}</button>
                                                                </div>
                                                            </div>

                                                            {/* COORDINATE INPUTS - DYNAMIC */}
                                                            {newElement.shape === 'BOX' ? (
                                                                // BOX/POLYGON INPUTS
                                                                <div className="space-y-2 bg-iha-900/50 p-2 rounded border border-iha-700/50">
                                                                    <div className="grid grid-cols-4 gap-2">
                                                                        <div><label className="text-[8px] text-yellow-500 block font-bold text-center">Z (Üst Kot)</label><input type="number" value={newElement.z} onChange={e => setNewElement({...newElement, z: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                        <div><label className="text-[8px] text-slate-400 block font-bold text-center">Yükseklik (H)</label><input type="number" value={newElement.d2} onChange={e => setNewElement({...newElement, d2: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[8px] text-orange-400 block font-bold mb-1">Köşe Koordinatları (X Y - Her satıra bir nokta)</label>
                                                                        <textarea 
                                                                            value={newElement.polygonText} 
                                                                            onChange={e => setNewElement({...newElement, polygonText: e.target.value})} 
                                                                            className="w-full h-20 bg-iha-800 border border-iha-600 rounded p-2 text-[10px] text-white font-mono resize-none focus:border-orange-500 outline-none"
                                                                            placeholder="454600.12 567800.45&#10;454605.12 567800.45&#10;454605.12 567805.45&#10;454600.12 567805.45"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // CYLINDER INPUTS
                                                                <div className="grid grid-cols-5 gap-2 bg-iha-900/50 p-2 rounded border border-iha-700/50">
                                                                    <div><label className="text-[8px] text-blue-400 block font-bold text-center">Merkez X</label><input type="number" value={newElement.x} onChange={e => setNewElement({...newElement, x: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                    <div><label className="text-[8px] text-blue-400 block font-bold text-center">Merkez Y</label><input type="number" value={newElement.y} onChange={e => setNewElement({...newElement, y: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                    <div><label className="text-[8px] text-yellow-500 block font-bold text-center">Z (Üst Kot)</label><input type="number" value={newElement.z} onChange={e => setNewElement({...newElement, z: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                    <div><label className="text-[8px] text-slate-400 block font-bold text-center">Çap (R)</label><input type="number" value={newElement.d1} onChange={e => setNewElement({...newElement, d1: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                    <div><label className="text-[8px] text-slate-400 block font-bold text-center">Boy (L)</label><input type="number" value={newElement.d2} onChange={e => setNewElement({...newElement, d2: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-600 rounded p-1 text-white text-xs text-center" /></div>
                                                                </div>
                                                            )}
                                                        </form>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                                    {activeGroup.elements?.map(elm => (
                                                        <div 
                                                            key={elm.id} 
                                                            onClick={() => handleEditClick(elm)}
                                                            className={`p-3 rounded-lg flex justify-between items-center group transition-all cursor-pointer ${editingElementId === elm.id ? 'bg-yellow-500/10 border border-yellow-500/50' : 'bg-iha-900 border border-iha-700 hover:border-blue-500/30'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${elm.elementClass === 'PILE' ? 'bg-orange-900/30 text-orange-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        {elm.coordinates?.shape === 'BOX' ? 'check_box_outline_blank' : 'radio_button_unchecked'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className={`text-xs font-bold ${editingElementId === elm.id ? 'text-yellow-400' : 'text-white'}`}>{elm.name}</p>
                                                                    {elm.coordinates && (
                                                                        <p className="text-[9px] text-slate-500 font-mono">
                                                                            {elm.coordinates.shape === 'BOX' ? 'Polygon/Box' : `Ø${elm.coordinates.dimensions.d1} L:${elm.coordinates.dimensions.d2}`} • H:{elm.coordinates.coords.z}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button onClick={(e) => { e.stopPropagation(); struct.deleteElement(elm.id); }} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                        </div>
                                                    ))}
                                                    {(!activeGroup.elements || activeGroup.elements.length === 0) && (
                                                        <div className="text-center text-slate-500 py-8 italic text-xs">Henüz eleman eklenmemiş.</div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                                                <span className="material-symbols-outlined text-4xl mb-2">arrow_back</span>
                                                <p className="text-xs font-bold">Soldan bir aks grubu seçiniz</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (<div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50"><span className="material-symbols-outlined text-8xl mb-4">apartment</span><p className="font-bold">Lütfen soldaki listeden bir yapı seçiniz</p></div>)}
                    </div>
                </div>
            )}

            {/* ... Types and Layers Tabs remain unchanged ... */}
            {activeTab === 'TYPES' && (
                <div className="flex flex-col gap-6">
                    <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">category</span> 
                                {t('structure.types')}
                            </h3>
                            <div className="flex gap-2">
                                {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                    <button key={lang} onClick={() => setTypeLang(lang)} className={`px-3 py-1 rounded text-xs font-bold transition-all ${typeLang === lang ? 'bg-purple-600 text-white' : 'bg-iha-900 text-slate-500'}`}>{lang.toUpperCase()}</button>
                                ))}
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddType} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                            <div className="md:col-span-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tip Kodu (Sistem)</label>
                                <input 
                                    value={newType.code} 
                                    onChange={e => setNewType({...newType, code: e.target.value.toUpperCase()})} 
                                    className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm focus:border-purple-500 outline-none transition-colors font-mono uppercase"
                                    placeholder="Örn: BRIDGE" 
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Görünür İsim ({typeLang})</label>
                                <input 
                                    value={newType.name[typeLang]} 
                                    onChange={e => setNewType({...newType, name: {...newType.name, [typeLang]: e.target.value}})} 
                                    className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm focus:border-purple-500 outline-none transition-colors"
                                    placeholder="Örn: Köprü & Viyadük" 
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">İkon (Material Symbol)</label>
                                <div className="relative">
                                    <input 
                                        value={newType.icon} 
                                        onChange={e => setNewType({...newType, icon: e.target.value})} 
                                        className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 pl-10 text-white text-sm focus:border-purple-500 outline-none transition-colors"
                                        placeholder="Örn: bridge" 
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">{newType.icon || 'help'}</span>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-lg transition-all">TÜR EKLE</button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {struct.types.map(t => (
                            <div key={t.id} className="bg-iha-800 p-4 rounded-xl border border-iha-700 flex justify-between items-center group hover:border-purple-500/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-iha-900 rounded-lg flex items-center justify-center text-purple-500 border border-iha-700 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{t.name[typeLang] || t.name['tr']}</h4>
                                        <span className="text-[10px] font-mono text-slate-500 bg-iha-900 px-2 py-0.5 rounded border border-iha-700">{t.code}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { if(window.confirm('Bu türü silmek istediğinize emin misiniz?')) struct.deleteStructureType(t.id); }} 
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. LAYERS TAB */}
            {activeTab === 'LAYERS' && (
                <div className="flex flex-col gap-6">
                    <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">layers</span> 
                                Yüzey Katman Tanımları
                            </h3>
                            <div className="flex gap-2">
                                {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                                    <button key={lang} onClick={() => setLayerLang(lang)} className={`px-3 py-1 rounded text-xs font-bold transition-all ${layerLang === lang ? 'bg-orange-600 text-white' : 'bg-iha-900 text-slate-500'}`}>{lang.toUpperCase()}</button>
                                ))}
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddLayer} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Katman Adı ({layerLang})</label>
                                <input 
                                    value={newLayer.name[layerLang]} 
                                    onChange={e => setNewLayer({...newLayer, name: {...newLayer.name, [layerLang]: e.target.value}})} 
                                    className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm focus:border-orange-500 outline-none transition-colors"
                                    placeholder="Örn: Toprak İşleri, Asfalt..." 
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="w-20">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Sıra</label>
                                    <input 
                                        type="number" 
                                        value={newLayer.orderIndex} 
                                        onChange={e => setNewLayer({...newLayer, orderIndex: parseInt(e.target.value)})} 
                                        className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm text-center" 
                                    />
                                </div>
                                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-lg transition-all">EKLE</button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-iha-800 rounded-2xl border border-iha-700 shadow-xl overflow-hidden">
                        <div className="p-4 bg-iha-900 border-b border-iha-700 font-bold text-white uppercase text-xs tracking-widest">Kayıtlı Katmanlar</div>
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-iha-900/50 text-[10px] uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="p-4 w-20 text-center">Sıra</th>
                                    <th className="p-4">Katman Adı</th>
                                    <th className="p-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-iha-700">
                                {struct.layers.map(layer => (
                                    <tr key={layer.id} className="hover:bg-iha-900/50 transition-colors group">
                                        <td className="p-4 text-center font-mono text-slate-500">{layer.orderIndex}</td>
                                        <td className="p-4 font-bold text-white">
                                            {layer.name[layerLang]} 
                                            {!layer.name[layerLang] && <span className="text-slate-600 text-xs font-normal ml-2">({layer.name.tr || layer.name.en})</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => { if(window.confirm(t('common.deleteConfirm'))) struct.deleteLayer(layer.id); }} 
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {struct.layers.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-slate-500 italic">Henüz katman eklenmemiş.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
