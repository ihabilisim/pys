
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Import Auth and UI contexts for specialized operations */
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { MatrixColumn, LocalizedString, ProgressRow, Language } from '../../types';
import { apiService } from '../../services/api';

export const AdminPvla: React.FC = () => {
    const { 
        data, deletePVLAStructure, addPVLAStructure, addPVLAFile, deletePVLAFile,
        addMatrixColumn, updateMatrixColumn, deleteMatrixColumn, addMatrixRow, deleteMatrixRow
    } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useUI();
    
    // --- TABS ---
    const [mainTab, setMainTab] = useState<'FILES' | 'MATRIX'>('FILES');

    // --- FILES TAB STATES ---
    const [dragActive, setDragActive] = useState(false);
    const [activePvlaType, setActivePvlaType] = useState<'Bridge' | 'Culvert'>('Bridge');
    const [selectedStructureId, setSelectedStructureId] = useState<string>(''); 
    const [newStructureName, setNewStructureName] = useState('');
    const [newStructureKm, setNewStructureKm] = useState('');
    const [newStructurePath, setNewStructurePath] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // --- MATRIX TAB STATES ---
    const [matrixSubTab, setMatrixSubTab] = useState<'COLUMNS' | 'ROWS'>('COLUMNS');
    const [matrixTypeFilter, setMatrixTypeFilter] = useState<'Bridge' | 'Culvert'>('Bridge');
    const [selectedStructureForMatrix, setSelectedStructureForMatrix] = useState<string>('');
    const [formLang, setFormLang] = useState<Language>('tr'); // Added Language Switcher
    
    // Column Form
    const [editColId, setEditColId] = useState<string | null>(null);
    const [newColName, setNewColName] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColGroup, setNewColGroup] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColType, setNewColType] = useState<'TRASARE' | 'VERIFICARE' | 'INFO'>('TRASARE');

    // Row Form
    const [newRowLocation, setNewRowLocation] = useState('');
    const [newRowFoundation, setNewRowFoundation] = useState('');

    if (!currentUser || (!currentUser.permissions.includes('manage_files') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    // --- FILE HANDLERS ---
    const handleAddStructure = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStructureName || !newStructureKm) return;
        let finalPath = newStructurePath;
        if (!finalPath) {
            const cleanKm = newStructureKm.replace(/km/gi, '').trim();
            const folderType = activePvlaType === 'Bridge' ? 'Bridges' : 'Culverts';
            finalPath = `PVLA/${folderType}/${cleanKm}`;
        }
        addPVLAStructure({ name: newStructureName, type: activePvlaType, km: newStructureKm, path: finalPath });
        setNewStructureName(''); setNewStructureKm(''); setNewStructurePath('');
        showToast(`${activePvlaType} eklendi.`);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        setDragActive(false);
        
        if (!selectedStructureId) { 
            showToast("Lütfen yapı seçiniz.", 'error'); 
            return; 
        }
        
        const structure = data.pvlaStructures.find(s => s.id === selectedStructureId);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
           setIsUploading(true);
           const files: File[] = Array.from(e.dataTransfer.files);
           let successCount = 0;

           for (const file of files) {
               // Folder Structure: pvla/{Bridge|Culvert}/{StructureName}/
               // Clean structure name for folder path
               const safeStructName = structure?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
               const folderPath = `pvla/${structure?.type || 'General'}/${safeStructName}`;

               showToast(`${file.name} yükleniyor...`, 'info');

               const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', folderPath);

               if (error) {
                   showToast(`HATA (${file.name}): ${error}`, 'error');
               } else if (publicUrl) {
                   addPVLAFile({
                       name: file.name, 
                       type: structure?.type || 'Bridge', 
                       structureId: selectedStructureId, 
                       structureName: structure?.name || 'Unknown', 
                       date: new Date().toISOString().split('T')[0], 
                       size: (file.size / (1024 * 1024)).toFixed(2) + ' MB', 
                       path: publicUrl // Store the real Supabase URL
                   });
                   successCount++;
               }
           }

           setIsUploading(false);
           if (successCount > 0) {
               showToast(`${successCount} dosya başarıyla yüklendi.`, 'success');
           }
        }
    };

    // --- MATRIX HANDLERS ---
    const handleSaveColumn = () => {
        if(!newColName.tr || !newColGroup.tr) return;
        
        if (editColId) {
            updateMatrixColumn(matrixTypeFilter, editColId, {
                name: newColName,
                group: newColGroup,
                type: newColType
            });
            showToast('Sütun güncellendi.');
            setEditColId(null);
        } else {
            const newCol: MatrixColumn = {
                id: Math.random().toString(36).substr(2, 6),
                name: newColName,
                group: newColGroup,
                type: newColType
            };
            addMatrixColumn(matrixTypeFilter, newCol);
            showToast('Sütun eklendi.');
        }
        
        // Reset form
        setNewColName({ tr: '', en: '', ro: '' });
        setNewColGroup({ tr: '', en: '', ro: '' });
        setNewColType('TRASARE');
    };

    const startEditColumn = (col: MatrixColumn) => {
        setEditColId(col.id);
        setNewColName(col.name);
        setNewColGroup(col.group);
        setNewColType(col.type);
    };

    const handleAddRow = () => {
        if(!selectedStructureForMatrix || !newRowLocation) {
            showToast('Lütfen yapı ve lokasyon giriniz.', 'error');
            return;
        }

        const newRow: ProgressRow = {
            id: Math.random().toString(36).substr(2, 9),
            structureId: selectedStructureForMatrix,
            location: newRowLocation,
            foundationType: newRowFoundation,
            orderIndex: 999, // default to end
            cells: {} // Initialize empty cells
        };

        // Initialize cells for current columns
        const columns = data.matrixColumns[matrixTypeFilter];
        columns.forEach(col => {
            newRow.cells[col.id] = {
                code: '-',
                status: 'EMPTY'
            };
        });

        addMatrixRow(newRow);
        setNewRowLocation('');
        setNewRowFoundation('');
        showToast('Satır eklendi.');
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Top Tabs */}
            <div className="flex gap-2 bg-iha-800 p-2 rounded-2xl border border-iha-700 w-fit">
                <button onClick={() => setMainTab('FILES')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'FILES' ? 'bg-blue-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>Dosya Yönetimi</button>
                <button onClick={() => setMainTab('MATRIX')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'MATRIX' ? 'bg-purple-600 text-white shadow-lg' : 'bg-iha-900 text-slate-500 hover:text-white'}`}>Matris Konfigürasyonu</button>
            </div>

            {mainTab === 'FILES' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Structure Manager */}
                    <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">domain</span> Yapı Tanımları
                        </h3>
                        
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setActivePvlaType('Bridge')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activePvlaType === 'Bridge' ? 'bg-blue-600 text-white' : 'bg-iha-900 text-slate-500'}`}>Bridges</button>
                            <button onClick={() => setActivePvlaType('Culvert')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activePvlaType === 'Culvert' ? 'bg-emerald-600 text-white' : 'bg-iha-900 text-slate-500'}`}>Culverts</button>
                        </div>

                        <form onSubmit={handleAddStructure} className="space-y-3 mb-6 bg-iha-900/50 p-3 rounded-xl border border-iha-700">
                            <input placeholder="Yapı Adı (Örn: POD01)" value={newStructureName} onChange={e => setNewStructureName(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" />
                            <input placeholder="KM (Örn: 4+350)" value={newStructureKm} onChange={e => setNewStructureKm(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" />
                            <input placeholder="Klasör Yolu (Opsiyonel)" value={newStructurePath} onChange={e => setNewStructurePath(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" />
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">Yapı Ekle</button>
                        </form>

                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {data.pvlaStructures.filter(s => s.type === activePvlaType).map(s => (
                                <div key={s.id} onClick={() => setSelectedStructureId(s.id)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${selectedStructureId === s.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-iha-900 border-iha-700 hover:border-slate-500'}`}>
                                    <div><p className="text-xs font-bold text-white">{s.name}</p><p className="text-[10px] text-slate-500">{s.km}</p></div>
                                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Yapıyı silmek istediğinize emin misiniz?')) deletePVLAStructure(s.id); }} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* File Uploader */}
                    <div className="lg:col-span-2 bg-iha-800 p-6 rounded-2xl border border-iha-700 shadow-xl flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500">folder_open</span> Dosya Yöneticisi</h3>
                            <span className="text-xs text-slate-500">{selectedStructureId ? data.pvlaStructures.find(s => s.id === selectedStructureId)?.name : 'Yapı Seçilmedi'}</span>
                        </div>

                        {selectedStructureId ? (
                            <>
                                <div 
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-6 ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-iha-700 hover:border-slate-500'}`}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-3xl text-blue-500 animate-spin">sync</span>
                                            <p className="text-xs text-blue-400 mt-2 font-bold uppercase">Yükleniyor...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">cloud_upload</span>
                                            <p className="text-sm font-bold text-slate-300">Dosyaları buraya sürükleyin</p>
                                            <p className="text-xs text-slate-500 mt-1">veya tıklayarak seçin</p>
                                            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if(e.target.files && e.target.files.length > 0) handleDrop({ dataTransfer: { files: e.target.files } } as any) }} />
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="text-[10px] uppercase font-bold text-slate-500 bg-iha-900"><tr><th className="p-3">Dosya Adı</th><th className="p-3">Tarih</th><th className="p-3">Boyut</th><th className="p-3 text-right">İşlem</th></tr></thead>
                                        <tbody className="divide-y divide-iha-700">
                                            {data.pvlaFiles.filter(f => f.structureId === selectedStructureId).map(file => (
                                                <tr key={file.id} className="hover:bg-iha-900/50">
                                                    <td className="p-3 font-medium text-white flex items-center gap-2"><span className="material-symbols-outlined text-sm text-red-400">picture_as_pdf</span>{file.name}</td>
                                                    <td className="p-3">{file.date}</td>
                                                    <td className="p-3 font-mono">{file.size}</td>
                                                    <td className="p-3 text-right">
                                                        <a href={file.path} target="_blank" className="text-blue-400 hover:text-white mr-2"><span className="material-symbols-outlined text-sm">visibility</span></a>
                                                        <button onClick={() => deletePVLAFile(file.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                                <span className="material-symbols-outlined text-5xl mb-2">touch_app</span>
                                <p>Lütfen soldan bir yapı seçiniz.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {mainTab === 'MATRIX' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-iha-800 p-4 rounded-2xl border border-iha-700">
                        <div className="flex gap-4">
                            <button onClick={() => setMatrixTypeFilter('Bridge')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${matrixTypeFilter === 'Bridge' ? 'bg-blue-600 text-white' : 'bg-iha-900 text-slate-500'}`}>Bridges</button>
                            <button onClick={() => setMatrixTypeFilter('Culvert')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${matrixTypeFilter === 'Culvert' ? 'bg-emerald-600 text-white' : 'bg-iha-900 text-slate-500'}`}>Culverts</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMatrixSubTab('COLUMNS')} className={`px-4 py-2 rounded-lg text-xs font-bold ${matrixSubTab === 'COLUMNS' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Sütunlar</button>
                            <button onClick={() => setMatrixSubTab('ROWS')} className={`px-4 py-2 rounded-lg text-xs font-bold ${matrixSubTab === 'ROWS' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Satırlar</button>
                        </div>
                    </div>

                    {matrixSubTab === 'COLUMNS' && (
                        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold text-white">Sütun Yönetimi ({matrixTypeFilter})</h3>
                                <div className="flex gap-1">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} onClick={() => setFormLang(lang)} className={`px-2 py-1 rounded text-[10px] ${formLang === lang ? 'bg-blue-600 text-white' : 'bg-iha-900 text-slate-500'}`}>{lang.toUpperCase()}</button>))}</div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                                <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Sütun Adı ({formLang})</label><input value={newColName[formLang]} onChange={e => setNewColName({...newColName, [formLang]: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                                <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Grup Adı ({formLang})</label><input value={newColGroup[formLang]} onChange={e => setNewColGroup({...newColGroup, [formLang]: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                                <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Tip</label><select value={newColType} onChange={e => setNewColType(e.target.value as any)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs"><option value="TRASARE">TRASARE</option><option value="VERIFICARE">VERIFICARE</option><option value="INFO">INFO</option></select></div>
                                <div className="md:col-span-1 flex items-end"><button onClick={handleSaveColumn} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold">{editColId ? 'Güncelle' : 'Ekle'}</button></div>
                            </div>

                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-iha-900 text-[10px] uppercase font-bold text-slate-500"><tr><th className="p-3">Ad</th><th className="p-3">Grup</th><th className="p-3">Tip</th><th className="p-3 text-right">İşlem</th></tr></thead>
                                <tbody className="divide-y divide-iha-700">
                                    {data.matrixColumns[matrixTypeFilter].map(col => (
                                        <tr key={col.id} className="hover:bg-iha-900/50">
                                            <td className="p-3 font-bold text-white">{col.name[formLang]}</td>
                                            <td className="p-3">{col.group[formLang]}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded text-[9px] ${col.type === 'TRASARE' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>{col.type}</span></td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => startEditColumn(col)} className="text-blue-400 hover:text-white mr-2"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                <button onClick={() => deleteMatrixColumn(matrixTypeFilter, col.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {matrixSubTab === 'ROWS' && (
                        <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                            <h3 className="font-bold text-white mb-4">Satır Yönetimi</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                                <div className="md:col-span-1">
                                    <label className="text-[10px] text-slate-500 block mb-1">Yapı Seçiniz</label>
                                    <select value={selectedStructureForMatrix} onChange={e => setSelectedStructureForMatrix(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs">
                                        <option value="">-- Seç --</option>
                                        {data.pvlaStructures.filter(s => s.type === matrixTypeFilter).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Lokasyon (Örn: P1)</label><input value={newRowLocation} onChange={e => setNewRowLocation(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                                <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Temel Tipi (Örn: DR)</label><input value={newRowFoundation} onChange={e => setNewRowFoundation(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                                <div className="md:col-span-1 flex items-end"><button onClick={handleAddRow} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold">Satır Ekle</button></div>
                            </div>

                            {selectedStructureForMatrix && (
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-iha-900 text-[10px] uppercase font-bold text-slate-500 sticky top-0"><tr><th className="p-3">Yapı</th><th className="p-3">Lokasyon</th><th className="p-3">Tip</th><th className="p-3 text-right">İşlem</th></tr></thead>
                                        <tbody className="divide-y divide-iha-700">
                                            {data.progressMatrix.filter(r => r.structureId === selectedStructureForMatrix).map(row => (
                                                <tr key={row.id} className="hover:bg-iha-900/50">
                                                    <td className="p-3 font-bold text-white">{data.pvlaStructures.find(s => s.id === row.structureId)?.name}</td>
                                                    <td className="p-3">{row.location}</td>
                                                    <td className="p-3">{row.foundationType}</td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => deleteMatrixRow(row.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
