
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { StructureTreeItem, StructureType } from '../../types';

export const Admin3DMonitoring: React.FC = () => {
    const { struct } = useData();
    const { t, showToast } = useUI();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'TYPES' | 'INVENTORY'>('INVENTORY');
    
    // Type Form
    const [editTypeId, setEditTypeId] = useState<string | null>(null);
    const [newType, setNewType] = useState({ code: '', nameTr: '', nameEn: '', nameRo: '', icon: 'apartment' });
    
    // Inventory Form
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
    const [newStruct, setNewStruct] = useState({ name: '', code: '', kmStart: '', kmEnd: '' });
    const [selectedStructId, setSelectedStructId] = useState<string | null>(null);
    
    // Group & Element Form
    const [newGroup, setNewGroup] = useState({ name: '', type: 'PIER', order: 0 });
    const [newElement, setNewElement] = useState({ name: '', class: 'PILE' });
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    
    // Coordinates Form
    const [coords, setCoords] = useState({ 
        shape: 'CYLINDER', 
        x: '0', y: '0', z: '0', 
        d1: '0.8', d2: '15', d3: '0',
        rx: '0', ry: '0', rz: '0'
    });

    // Initial Load
    useEffect(() => {
        struct.loadTypes();
        struct.loadStructures();
    }, []);

    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newType.code || !newType.nameTr) {
            showToast('Lütfen kod ve isim alanlarını doldurunuz.', 'error');
            return;
        }

        const payload = {
            code: newType.code,
            name: { tr: newType.nameTr, en: newType.nameEn, ro: newType.nameRo },
            icon: newType.icon || 'category' // Default icon fallback
        };

        if (editTypeId) {
            await struct.updateStructureType(editTypeId, payload);
            setEditTypeId(null);
        } else {
            await struct.addStructureType(payload);
        }
        
        setNewType({ code: '', nameTr: '', nameEn: '', nameRo: '', icon: 'apartment' });
    };

    const handleEditType = (type: StructureType) => {
        setEditTypeId(type.id);
        setNewType({
            code: type.code,
            nameTr: type.name.tr,
            nameEn: type.name.en,
            nameRo: type.name.ro,
            icon: type.icon
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteType = async (id: string) => {
        if(window.confirm('Bu yapı türünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            await struct.deleteStructureType(id);
        }
    };

    const handleAddStruct = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedTypeFilter) { showToast('Lütfen önce bir yapı tipi seçiniz.', 'error'); return; }
        await struct.addStructure({
            typeId: selectedTypeFilter,
            code: newStruct.code,
            name: newStruct.name,
            kmStart: parseFloat(newStruct.kmStart) || 0,
            kmEnd: parseFloat(newStruct.kmEnd) || 0
        });
        setNewStruct({ name: '', code: '', kmStart: '', kmEnd: '' });
    };

    const handleAddGroup = async () => {
        if(!selectedStructId) return;
        await struct.addGroup({
            structureId: selectedStructId,
            name: newGroup.name,
            groupType: newGroup.type as any,
            orderIndex: newGroup.order
        });
        setNewGroup({ name: '', type: 'PIER', order: 0 });
    };

    const handleAddElement = async () => {
        if(!selectedGroupId) return;
        await struct.addElement({
            groupId: selectedGroupId,
            name: newElement.name,
            elementClass: newElement.class as any
        }, {
            shape: coords.shape,
            coords: { x: parseFloat(coords.x), y: parseFloat(coords.y), z: parseFloat(coords.z) },
            dimensions: { d1: parseFloat(coords.d1), d2: parseFloat(coords.d2), d3: parseFloat(coords.d3) },
            rotation: { x: parseFloat(coords.rx), y: parseFloat(coords.ry), z: parseFloat(coords.rz) }
        });
        showToast('Eleman ve koordinatları eklendi.', 'success');
    };

    const activeStruct = struct.structures.find(s => s.id === selectedStructId);

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Top Tabs */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit">
                <button onClick={() => setActiveTab('INVENTORY')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined">view_list</span> Yapı Envanteri
                </button>
                <button onClick={() => setActiveTab('TYPES')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'TYPES' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined">category</span> Yapı Türleri
                </button>
            </div>

            {/* --- TYPES TAB --- */}
            {activeTab === 'TYPES' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* TYPE FORM */}
                    <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl h-fit">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">{editTypeId ? 'edit' : 'add_circle'}</span>
                            {editTypeId ? 'Yapı Türünü Düzenle' : 'Yeni Yapı Türü Ekle'}
                        </h3>
                        <form onSubmit={handleSaveType} className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Tür Kodu (Benzersiz)</label>
                                <input placeholder="Örn: BRIDGE" value={newType.code} onChange={e => setNewType({...newType, code: e.target.value.toUpperCase()})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-xs font-mono" />
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Görünür İsim (TR)</label>
                                <input placeholder="Örn: Köprü & Viyadük" value={newType.nameTr} onChange={e => setNewType({...newType, nameTr: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-xs" />
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Görünür İsim (EN)</label>
                                <input placeholder="Ex: Bridge & Viaduct" value={newType.nameEn} onChange={e => setNewType({...newType, nameEn: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-xs" />
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block flex justify-between">
                                    <span>İkon (Material Symbols)</span>
                                    <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white flex items-center gap-1">
                                        Liste <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                    </a>
                                </label>
                                <div className="flex gap-2">
                                    <input placeholder="Örn: bridge" value={newType.icon} onChange={e => setNewType({...newType, icon: e.target.value})} className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-xs" />
                                    <div className="w-12 h-10 bg-iha-900 border border-iha-700 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-400 text-xl">{newType.icon || 'help'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">{editTypeId ? 'GÜNCELLE' : 'KAYDET'}</button>
                                {editTypeId && <button type="button" onClick={() => { setEditTypeId(null); setNewType({ code: '', nameTr: '', nameEn: '', nameRo: '', icon: 'apartment' }); }} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl font-bold">İPTAL</button>}
                            </div>
                        </form>
                    </div>

                    {/* TYPE LIST */}
                    <div className="md:col-span-2 bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">list</span>
                            Tanımlı Türler ({struct.types.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {struct.types.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-iha-900 rounded-xl border border-iha-700 group hover:border-purple-500/50 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-iha-800 to-iha-900 flex items-center justify-center border border-iha-700 shadow-inner">
                                            <span className="material-symbols-outlined text-slate-400 text-2xl group-hover:text-purple-400 transition-colors">{t.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.name.tr}</p>
                                            <p className="text-[10px] text-slate-500 font-mono bg-iha-800 px-1.5 py-0.5 rounded w-fit mt-1 border border-iha-700">{t.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditType(t)} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                                        <button onClick={() => handleDeleteType(t.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </div>
                            ))}
                            {struct.types.length === 0 && (
                                <div className="col-span-2 text-center p-8 border-2 border-dashed border-iha-700 rounded-xl">
                                    <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">category</span>
                                    <p className="text-slate-500 text-sm">Henüz bir yapı türü tanımlanmamış.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- INVENTORY TAB --- */}
            {activeTab === 'INVENTORY' && (
                <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
                    {/* LEFT: MASTER LIST */}
                    <div className="w-full lg:w-1/3 bg-iha-800 rounded-2xl border border-iha-700 flex flex-col overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-iha-700 bg-iha-900/50">
                            <select value={selectedTypeFilter} onChange={e => setSelectedTypeFilter(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2.5 text-white text-sm mb-3 focus:border-blue-500 outline-none">
                                <option value="">-- Tüm Yapı Türleri --</option>
                                {struct.types.map(t => <option key={t.id} value={t.id}>{t.name.tr}</option>)}
                            </select>
                            <form onSubmit={handleAddStruct} className="grid grid-cols-2 gap-2 p-3 bg-iha-900 rounded-xl border border-iha-700">
                                <input placeholder="Kod (B1)" value={newStruct.code} onChange={e => setNewStruct({...newStruct, code: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs col-span-1" />
                                <input placeholder="Adı (Viyadük 1)" value={newStruct.name} onChange={e => setNewStruct({...newStruct, name: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs col-span-1" />
                                <input placeholder="Başlangıç KM" value={newStruct.kmStart} onChange={e => setNewStruct({...newStruct, kmStart: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                <input placeholder="Bitiş KM" value={newStruct.kmEnd} onChange={e => setNewStruct({...newStruct, kmEnd: e.target.value})} className="bg-iha-800 border border-iha-700 rounded p-2 text-white text-xs" />
                                <button className="col-span-2 bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-500 transition-colors shadow-md">YENİ YAPI EKLE</button>
                            </form>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-iha-800/50">
                            {struct.structures.filter(s => !selectedTypeFilter || s.typeId === selectedTypeFilter).map(s => (
                                <div key={s.id} onClick={() => { setSelectedStructId(s.id); setSelectedGroupId(null); }} className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${selectedStructId === s.id ? 'bg-blue-600/20 border-blue-500/50' : 'bg-iha-900 border-transparent hover:bg-white/5 hover:border-white/10'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white text-sm">{s.code}</span>
                                        <span className="text-[10px] text-slate-400 bg-black/20 px-1.5 py-0.5 rounded">{s.kmStart} - {s.kmEnd}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1">{s.name}</p>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Yapıyı silmek istediğinize emin misiniz?')) struct.deleteStructure(s.id); }} className="text-red-400 hover:text-white p-1 bg-iha-800 rounded shadow"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </div>
                            ))}
                            {struct.structures.length === 0 && <div className="text-center p-8 text-slate-500 text-xs italic">Listelenecek yapı bulunamadı.</div>}
                        </div>
                    </div>

                    {/* RIGHT: DETAIL EDITOR */}
                    <div className="flex-1 bg-iha-800 rounded-2xl border border-iha-700 flex flex-col relative overflow-hidden shadow-xl">
                        {selectedStructId && activeStruct ? (
                            <div className="flex h-full">
                                {/* HIERARCHY TREE */}
                                <div className="w-1/3 border-r border-iha-700 p-4 overflow-y-auto bg-iha-900/30 custom-scrollbar">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Yapı Bileşenleri</h4>
                                    
                                    {/* Groups */}
                                    <div className="space-y-4">
                                        {activeStruct.groups.map(g => (
                                            <div key={g.id} className="group-container">
                                                <div onClick={() => setSelectedGroupId(g.id)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedGroupId === g.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/5'}`}>
                                                    <span className="material-symbols-outlined text-sm">{g.groupType === 'PIER' ? 'view_column' : 'foundation'}</span>
                                                    <span className="text-xs font-bold">{g.name}</span>
                                                </div>
                                                <div className="pl-4 border-l border-slate-700 ml-3 mt-1 space-y-1">
                                                    {g.elements.map(el => (
                                                        <div key={el.id} className="flex items-center gap-2 p-1.5 text-[11px] text-slate-400 hover:text-white transition-colors">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${el.coordinates ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                                            {el.name}
                                                        </div>
                                                    ))}
                                                    {g.elements.length === 0 && <div className="text-[10px] text-slate-600 pl-2 italic">Eleman yok</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Group Form */}
                                    <div className="mt-6 pt-4 border-t border-iha-700 sticky bottom-0 bg-iha-800/90 backdrop-blur p-2 -mx-2 rounded-xl">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Grup Ekle</div>
                                        <input placeholder="Grup Adı (Örn: P1)" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="w-full bg-black/20 border border-iha-600 rounded p-1.5 text-white text-xs mb-2" />
                                        <div className="flex gap-1 mb-2">
                                            <select value={newGroup.type} onChange={e => setNewGroup({...newGroup, type: e.target.value})} className="flex-1 bg-black/20 border border-iha-600 rounded p-1 text-white text-[10px]">
                                                <option value="PIER">Orta Ayak</option>
                                                <option value="ABUTMENT">Kenar Ayak</option>
                                                <option value="SPAN">Açıklık</option>
                                            </select>
                                            <input type="number" placeholder="Sıra" value={newGroup.order} onChange={e => setNewGroup({...newGroup, order: parseInt(e.target.value)})} className="w-12 bg-black/20 border border-iha-600 rounded p-1 text-white text-[10px]" />
                                        </div>
                                        <button onClick={handleAddGroup} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded transition-colors shadow-lg">GRUP EKLE</button>
                                    </div>
                                </div>

                                {/* COORDINATE EDITOR */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-500">view_in_ar</span>
                                        Eleman Detayları
                                    </h4>
                                    
                                    {selectedGroupId ? (
                                        <div className="space-y-6 animate-in slide-in-from-right-4">
                                            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700 shadow-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Yeni Eleman Tanımı</label>
                                                    <div className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] border border-indigo-500/30 font-bold">
                                                        Grup: {activeStruct.groups.find(g => g.id === selectedGroupId)?.name}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2 mb-4">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-slate-500 block mb-1">Eleman Adı</label>
                                                        <input placeholder="Örn: Kazık-1" value={newElement.name} onChange={e => setNewElement({...newElement, name: e.target.value})} className="w-full bg-iha-800 border border-iha-600 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 block mb-1">Sınıf</label>
                                                        <select value={newElement.class} onChange={e => setNewElement({...newElement, class: e.target.value})} className="bg-iha-800 border border-iha-600 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none">
                                                            <option value="PILE">Kazık</option>
                                                            <option value="FOUNDATION">Temel</option>
                                                            <option value="COLUMN">Kolon</option>
                                                            <option value="CAP_BEAM">Başlık</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 border-t border-iha-700 pt-4">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Geometri Tipi</label>
                                                        <select value={coords.shape} onChange={e => setCoords({...coords, shape: e.target.value})} className="w-full bg-iha-800 border border-iha-600 rounded-lg p-2 text-white text-sm">
                                                            <option value="CYLINDER">Silindir (Kazık/Kolon)</option>
                                                            <option value="BOX">Kutu (Temel/Başlık)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Boyutlar (m)</label>
                                                        <div className="flex gap-1">
                                                            <input placeholder={coords.shape === 'CYLINDER' ? 'Yarıçap' : 'Genişlik'} value={coords.d1} onChange={e => setCoords({...coords, d1: e.target.value})} className="w-1/3 bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs text-center" />
                                                            <input placeholder="Yükseklik" value={coords.d2} onChange={e => setCoords({...coords, d2: e.target.value})} className="w-1/3 bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs text-center" />
                                                            {coords.shape === 'BOX' && <input placeholder="Uzunluk" value={coords.d3} onChange={e => setCoords({...coords, d3: e.target.value})} className="w-1/3 bg-iha-800 border border-iha-600 rounded p-1.5 text-white text-xs text-center" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Merkez Koordinat (Yerel / Proje)</label>
                                                    <div className="flex gap-2">
                                                        <input placeholder="X (Doğu)" value={coords.x} onChange={e => setCoords({...coords, x: e.target.value})} className="flex-1 bg-iha-800 border border-iha-600 rounded-lg p-2 text-white text-xs font-mono text-center" />
                                                        <input placeholder="Y (Kuzey)" value={coords.y} onChange={e => setCoords({...coords, y: e.target.value})} className="flex-1 bg-iha-800 border border-iha-600 rounded-lg p-2 text-white text-xs font-mono text-center" />
                                                        <input placeholder="Z (Kot)" value={coords.z} onChange={e => setCoords({...coords, z: e.target.value})} className="flex-1 bg-iha-800 border border-iha-600 rounded-lg p-2 text-yellow-500 font-bold text-xs font-mono text-center" />
                                                    </div>
                                                </div>

                                                <button onClick={handleAddElement} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-6 shadow-lg transition-all transform active:scale-95">ELEMANI KAYDET</button>
                                            </div>
                                            
                                            <div className="p-6 rounded-2xl border border-dashed border-iha-600 text-center cursor-pointer hover:bg-white/5 transition-colors group">
                                                <div className="w-12 h-12 bg-iha-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-iha-700 group-hover:border-slate-500 transition-colors">
                                                    <span className="material-symbols-outlined text-2xl text-slate-500 group-hover:text-white">table_view</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-300">Excel'den Toplu Koordinat Yapıştır</p>
                                                <p className="text-[10px] text-slate-500 mt-1">İsim | X | Y | Z | R/W | H | L</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                            <div className="w-20 h-20 bg-iha-900 rounded-full flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined text-4xl">arrow_back</span>
                                            </div>
                                            <p className="text-sm font-bold">Lütfen soldaki ağaçtan bir grup seçiniz.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-4">apartment</span>
                                <p className="font-bold">Lütfen soldaki listeden bir yapı seçiniz</p>
                                <p className="text-xs mt-2 opacity-60">veya yeni bir yapı ekleyiniz.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
