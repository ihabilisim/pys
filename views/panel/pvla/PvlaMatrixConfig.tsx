
import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { Language, MatrixColumn, ProgressRow, LocalizedString } from '../../../types';

export const PvlaMatrixConfig: React.FC = () => {
    const { data, addMatrixColumn, updateMatrixColumn, deleteMatrixColumn, addMatrixRow, deleteMatrixRow } = useData();
    const { showToast } = useUI();

    const [matrixSubTab, setMatrixSubTab] = useState<'COLUMNS' | 'ROWS'>('COLUMNS');
    const [matrixTypeFilter, setMatrixTypeFilter] = useState<'Bridge' | 'Culvert'>('Bridge');
    const [formLang, setFormLang] = useState<Language>('tr');
    
    // Column Form
    const [editColId, setEditColId] = useState<string | null>(null);
    const [newColName, setNewColName] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColGroup, setNewColGroup] = useState<LocalizedString>({ tr: '', en: '', ro: '' });
    const [newColType, setNewColType] = useState<'TRASARE' | 'VERIFICARE' | 'INFO'>('TRASARE');

    // Row Form
    const [selectedStructureForMatrix, setSelectedStructureForMatrix] = useState<string>('');
    const [newRowLocation, setNewRowLocation] = useState('');
    const [newRowFoundation, setNewRowFoundation] = useState('');

    const handleSaveColumn = () => {
        if(!newColName.tr || !newColGroup.tr) return;
        
        if (editColId) {
            updateMatrixColumn(matrixTypeFilter, editColId, { name: newColName, group: newColGroup, type: newColType });
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
            orderIndex: 999,
            cells: {}
        };
        // Initialize cells
        data.matrixColumns[matrixTypeFilter].forEach(col => {
            newRow.cells[col.id] = { code: '-', status: 'EMPTY' };
        });
        addMatrixRow(newRow);
        setNewRowLocation(''); setNewRowFoundation('');
        showToast('Satır eklendi.');
    };

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
    );
};
