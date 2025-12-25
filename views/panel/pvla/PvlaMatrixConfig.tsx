
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { Language, MatrixColumn, ProgressRow, LocalizedString } from '../../../types';

export const PvlaMatrixConfig: React.FC = () => {
    const { data, struct, addMatrixColumn, updateMatrixColumn, deleteMatrixColumn, addMatrixRow, deleteMatrixRow } = useData();
    const { showToast } = useUI();

    const [matrixSubTab, setMatrixSubTab] = useState<'COLUMNS' | 'ROWS'>('COLUMNS');
    const [matrixTypeFilter, setMatrixTypeFilter] = useState<'Bridge' | 'Culvert'>('Bridge');
    const [formLang, setFormLang] = useState<Language>('tr');
    const [isSyncing, setIsSyncing] = useState(false);
    
    // Column Form
    const [editColId, setEditColId] = useState<string | null>(null);
    const [newColName, setNewColName] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColGroup, setNewColGroup] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColType, setNewColType] = useState<'TRASARE' | 'VERIFICARE' | 'INFO'>('TRASARE');
    const [newColOrder, setNewColOrder] = useState<number>(0);

    // Row Form
    const [selectedStructureForMatrix, setSelectedStructureForMatrix] = useState<string>('');

    useEffect(() => {
        // Load structures to map IDs to names in the rows list.
        struct.loadStructures();
    }, []);

    const handleSaveColumn = () => {
        if(!newColName.tr || !newColGroup.tr) return;
        
        if (editColId) {
            updateMatrixColumn(matrixTypeFilter, editColId, { name: newColName, group: newColGroup, type: newColType, orderIndex: newColOrder });
            showToast('Sütun güncellendi.');
            setEditColId(null);
        } else {
            const newCol: Omit<MatrixColumn, 'id'> = {
                name: newColName,
                group: newColGroup,
                type: newColType,
                orderIndex: newColOrder
            };
            addMatrixColumn(matrixTypeFilter, newCol);
            showToast('Sütun eklendi.');
        }
        setNewColName({ tr: '', en: '', ro: '' });
        setNewColGroup({ tr: '', en: '', ro: '' });
        setNewColType('TRASARE');
        setNewColOrder(data.matrixColumns[matrixTypeFilter].length + 1);
    };

    const startEditColumn = (col: MatrixColumn) => {
        setEditColId(col.id);
        setNewColName(col.name);
        setNewColGroup(col.group);
        setNewColType(col.type);
        setNewColOrder(col.orderIndex || 0);
    };

    // --- FIX LOGIC: SYNC MISSING ROWS ---
    const handleSyncMissingRows = async () => {
        if(!confirm("Bu işlem, Yapı Envanteri'nde olup Matris tablosunda eksik olan satırları otomatik olarak oluşturacaktır. Onaylıyor musunuz?")) return;
        
        setIsSyncing(true);
        let addedCount = 0;
        let errorCount = 0;

        try {
            // Filter structures by current tab type (Bridge/Culvert)
            const targetCode = matrixTypeFilter === 'Bridge' ? 'POD' : 'DG';
            const relevantStructures = struct.structures.filter(s => s.typeCode === targetCode);

            for (const s of relevantStructures) {
                // Determine matrix columns for this type to initialize cells
                const columns = data.matrixColumns[matrixTypeFilter];
                const initialCells: any = {};
                columns.forEach(col => {
                    initialCells[col.id] = { code: '-', status: 'EMPTY' };
                });

                for (const group of s.groups) {
                    // Check if this group already has a row in progressMatrix
                    const exists = data.progressMatrix.some(r => r.structureGroupId === group.id);
                    
                    if (!exists) {
                        // Create the missing row
                        const newRow: ProgressRow = {
                            id: crypto.randomUUID(),
                            structureId: s.code || s.name, // Legacy ID mapping
                            structureGroupId: group.id,
                            location: group.name,
                            foundationType: group.groupType,
                            orderIndex: group.orderIndex || 99,
                            direction: group.direction,
                            cells: initialCells
                        };

                        await addMatrixRow(newRow);
                        addedCount++;
                    }
                }
            }
            
            if (addedCount > 0) {
                showToast(`${addedCount} adet eksik satır başarıyla oluşturuldu.`, 'success');
            } else {
                showToast('Tüm yapılar zaten senkronize durumda.', 'info');
            }

        } catch (e) {
            console.error(e);
            showToast('Senkronizasyon sırasında hata oluştu.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    // Sort displayed columns by orderIndex
    const sortedColumns = [...data.matrixColumns[matrixTypeFilter]].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Sub-Nav for Matrix */}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                        <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Sütun Adı ({formLang})</label><input value={newColName[formLang]} onChange={e => setNewColName({...newColName, [formLang]: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                        <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Grup Adı ({formLang})</label><input value={newColGroup[formLang]} onChange={e => setNewColGroup({...newColGroup, [formLang]: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2 text-white text-xs" /></div>
                        <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Tip</label><select value={newColType} onChange={e => setNewColType(e.target.value as any)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs"><option value="TRASARE">TRASARE</option><option value="VERIFICARE">VERIFICARE</option><option value="INFO">INFO</option></select></div>
                        <div className="md:col-span-1"><label className="text-[10px] text-slate-500 block mb-1">Sıra No (Order)</label><input type="number" value={newColOrder} onChange={e => setNewColOrder(parseInt(e.target.value))} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2 text-white text-xs font-bold text-center" /></div>
                        <div className="md:col-span-1 flex items-end"><button onClick={handleSaveColumn} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold">{editColId ? 'Güncelle' : 'Ekle'}</button></div>
                    </div>

                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-iha-900 text-[10px] uppercase font-bold text-slate-500"><tr><th className="p-3 text-center w-16">Sıra</th><th className="p-3">Ad</th><th className="p-3">Grup</th><th className="p-3">Tip</th><th className="p-3 text-right">İşlem</th></tr></thead>
                        <tbody className="divide-y divide-iha-700">
                            {sortedColumns.map(col => (
                                <tr key={col.id} className="hover:bg-iha-900/50">
                                    <td className="p-3 text-center text-slate-500 font-mono">{col.orderIndex}</td>
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">Satır Yönetimi</h3>
                        
                        {/* FIX BUTTON */}
                        <button 
                            onClick={handleSyncMissingRows}
                            disabled={isSyncing} 
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                            {isSyncing ? 'Senkronize Ediliyor...' : 'Eksik Satırları Tara ve Onar'}
                        </button>
                    </div>
                    
                    <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 text-blue-200 text-sm mb-6">
                        <p className="font-bold mb-1">Bilgilendirme</p>
                        <ul className="list-disc pl-4 text-xs space-y-1 opacity-80">
                            <li>PVLA matris satırları <strong className="font-bold text-white">Yapı Envanteri</strong> modülüyle entegre çalışır.</li>
                            <li>Eğer "Bridge" veya "Culvert" listesinde bazı satırlar (Örn: Sağ eksenler) boş görünüyorsa, yukarıdaki <strong>Onar</strong> butonunu kullanarak veritabanını eşitleyebilirsiniz.</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] text-slate-500 block mb-1">Filtrelemek için Yapı Seçiniz</label>
                        <select value={selectedStructureForMatrix} onChange={e => setSelectedStructureForMatrix(e.target.value)} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-xs">
                            <option value="">-- Tümünü Göster --</option>
                            {struct.structures.filter(s => s.typeCode === (matrixTypeFilter === 'Bridge' ? 'POD' : 'DG')).map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                        </select>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-iha-900 text-[10px] uppercase font-bold text-slate-500 sticky top-0"><tr><th className="p-3">Yapı</th><th className="p-3">Lokasyon</th><th className="p-3">Yön</th><th className="p-3">Tip</th><th className="p-3 text-right">İşlem</th></tr></thead>
                            <tbody className="divide-y divide-iha-700">
                                {data.progressMatrix.filter(r => !selectedStructureForMatrix || r.structureId === selectedStructureForMatrix).map(row => (
                                    <tr key={row.id} className="hover:bg-iha-900/50">
                                        <td className="p-3 font-bold text-white">
                                            {(() => {
                                                const structure = struct.structures.find(s => s.id === row.structureId);
                                                return structure ? `${structure.code} - ${structure.name}` : 'Bilinmeyen Yapı';
                                            })()}
                                        </td>
                                        <td className="p-3">{row.location}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.direction === 'L' ? 'bg-blue-500/20 text-blue-400' : row.direction === 'R' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'}`}>
                                                {row.direction || '-'}
                                            </span>
                                        </td>
                                        <td className="p-3">{row.foundationType}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => deleteMatrixRow(row.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
