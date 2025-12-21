
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { apiService } from '../../../services/api';

export const PvlaFileManager: React.FC = () => {
    const { data, addPVLAStructure, deletePVLAStructure, addPVLAFile, deletePVLAFile, loadPvlaFiles } = useData();
    const { showToast } = useUI();

    const [activePvlaType, setActivePvlaType] = useState<'Bridge' | 'Culvert'>('Bridge');
    const [selectedStructureId, setSelectedStructureId] = useState<string>(''); 
    const [newStructureName, setNewStructureName] = useState('');
    const [newStructureKm, setNewStructureKm] = useState('');
    const [newStructurePath, setNewStructurePath] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Lazy load when structure is selected
    useEffect(() => {
        if (selectedStructureId) {
            const load = async () => {
                setIsLoadingFiles(true);
                await loadPvlaFiles(selectedStructureId);
                setIsLoadingFiles(false);
            };
            load();
        }
    }, [selectedStructureId]);

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
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        
        if (!selectedStructureId) { showToast("Lütfen yapı seçiniz.", 'error'); return; }
        
        const structure = data.pvlaStructures.find(s => s.id === selectedStructureId);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
           setIsUploading(true);
           const files: File[] = Array.from(e.dataTransfer.files);
           let successCount = 0;

           for (const file of files) {
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
                       path: publicUrl
                   });
                   successCount++;
               }
           }
           setIsUploading(false);
           if (successCount > 0) showToast(`${successCount} dosya başarıyla yüklendi.`, 'success');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
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
                            {isLoadingFiles ? (
                                <div className="p-8 text-center">
                                    <span className="material-symbols-outlined animate-spin text-3xl text-slate-500">sync</span>
                                    <p className="text-xs text-slate-500 mt-2">Dosyalar Yükleniyor...</p>
                                </div>
                            ) : (
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
                            )}
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
    );
};
