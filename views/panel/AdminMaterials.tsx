
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
/* Import useAuth to access current user data */
import { useAuth } from '../../context/AuthContext';
import { Language, LocalizedString } from '../../types';

export const AdminMaterials: React.FC = () => {
    const { data, addStockItem, updateStockItem, deleteStockItem, addBoQItem, updateBoQItem, deleteBoQItem } = useData();
    /* Use Auth context for currentUser */
    const { currentUser } = useAuth();
    const [formLang, setFormLang] = useState<Language>('tr');

    const [newStock, setNewStock] = useState<{name: LocalizedString, quantity: number, unit: string, critical: number, icon: string}>({
        name: { tr: '', en: '', ro: '' }, quantity: 0, unit: 'Ton', critical: 0, icon: 'inventory_2'
    });
    const [newBoQ, setNewBoQ] = useState<{code: string, name: LocalizedString, total: number, unit: string}>({
        code: '', name: { tr: '', en: '', ro: '' }, total: 0, unit: 'm3'
    });

    if (!currentUser || (!currentUser.permissions.includes('manage_materials') && currentUser.role !== 'admin')) {
        return <div className="text-slate-500 p-8 text-center">Bu alana erişim yetkiniz yok.</div>;
    }

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newStock.name.tr) return;
        addStockItem({
            name: newStock.name,
            currentQuantity: newStock.quantity,
            criticalLevel: newStock.critical,
            unit: newStock.unit,
            icon: newStock.icon
        });
        setNewStock({ name: { tr: '', en: '', ro: '' }, quantity: 0, unit: 'Ton', critical: 0, icon: 'inventory_2' });
    };

    const handleAddBoQ = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newBoQ.name.tr) return;
        addBoQItem({ 
            code: newBoQ.code,
            name: newBoQ.name,
            totalQuantity: newBoQ.total,
            unit: newBoQ.unit,
            completedQuantity: 0 
        });
        setNewBoQ({ code: '', name: { tr: '', en: '', ro: '' }, total: 0, unit: 'm3' });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Lang Switcher for Materials */}
            <div className="flex gap-2 justify-end">
                {(['tr', 'en', 'ro'] as Language[]).map(lang => (
                    <button key={lang} onClick={() => setFormLang(lang)} className={`px-3 py-1 rounded text-xs font-bold ${formLang === lang ? 'bg-purple-600 text-white' : 'bg-iha-900 text-slate-400'}`}>{lang.toUpperCase()}</button>
                ))}
            </div>

            {/* STOCK */}
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">inventory_2</span>
                    Malzeme Stok Takibi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {data.stocks.map(stock => (
                        <div key={stock.id} className="bg-iha-900 border border-iha-700 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">{stock.icon}</span>
                                <div>
                                    <p className="font-bold text-white text-sm">{stock.name[formLang]}</p>
                                    <p className="text-xs text-slate-500">Kritik: {stock.criticalLevel} {stock.unit}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={stock.currentQuantity} 
                                    onChange={(e) => updateStockItem(stock.id, { currentQuantity: parseFloat(e.target.value) })}
                                    className="w-20 bg-iha-800 border border-iha-700 rounded p-1 text-white text-right font-mono text-sm"
                                />
                                <span className="text-xs text-slate-400 w-8">{stock.unit}</span>
                                <button onClick={() => deleteStockItem(stock.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-iha-900/50 p-4 rounded-xl border border-iha-700 flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] text-slate-500 mb-1">Malzeme Adı ({formLang})</label>
                        <input value={newStock.name[formLang]} onChange={e => setNewStock({...newStock, name: { tr: e.target.value, en: e.target.value, ro: e.target.value }})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="w-24">
                        <label className="block text-[10px] text-slate-500 mb-1">Miktar</label>
                        <input type="number" value={newStock.quantity} onChange={e => setNewStock({...newStock, quantity: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="w-24">
                        <label className="block text-[10px] text-slate-500 mb-1">Kritik</label>
                        <input type="number" value={newStock.critical} onChange={e => setNewStock({...newStock, critical: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <button type="button" onClick={handleAddStock} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm h-10">Ekle</button>
                </div>
            </div>

            {/* BoQ */}
            <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">request_quote</span>
                    Sözleşme Kalemleri (BoQ)
                </h3>
                <div className="overflow-x-auto mb-4">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-iha-900 text-slate-500 text-xs">
                            <tr>
                                <th className="p-3">Poz No</th>
                                <th className="p-3">Tanım</th>
                                <th className="p-3">Toplam (Sözleşme)</th>
                                <th className="p-3">Tamamlanan</th>
                                <th className="p-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-iha-700">
                            {data.boqItems.map(item => (
                                <tr key={item.id} className="hover:bg-iha-900/50">
                                    <td className="p-3 font-mono text-xs text-blue-400">{item.code}</td>
                                    <td className="p-3">{item.name[formLang]}</td>
                                    <td className="p-3 font-mono">{item.totalQuantity.toLocaleString()} {item.unit}</td>
                                    <td className="p-3">
                                        <input 
                                            type="number" 
                                            value={item.completedQuantity} 
                                            onChange={(e) => updateBoQItem(item.id, { completedQuantity: parseFloat(e.target.value) })}
                                            className="w-24 bg-iha-900 border border-iha-700 rounded p-1 text-white text-right font-mono text-xs"
                                        />
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteBoQItem(item.id)} className="text-red-400 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-iha-900/50 p-4 rounded-xl border border-iha-700 flex flex-wrap gap-2 items-end">
                    <div className="w-24">
                        <label className="block text-[10px] text-slate-500 mb-1">Poz No</label>
                        <input value={newBoQ.code} onChange={e => setNewBoQ({...newBoQ, code: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] text-slate-500 mb-1">Tanım ({formLang})</label>
                        <input value={newBoQ.name[formLang]} onChange={e => setNewBoQ({...newBoQ, name: { tr: e.target.value, en: e.target.value, ro: e.target.value }})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="w-32">
                        <label className="block text-[10px] text-slate-500 mb-1">Toplam Miktar</label>
                        <input type="number" value={newBoQ.total} onChange={e => setNewBoQ({...newBoQ, total: parseFloat(e.target.value)})} className="w-full bg-iha-800 border border-iha-700 rounded p-2 text-white text-sm" />
                    </div>
                    <button type="button" onClick={handleAddBoQ} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm h-10">Ekle</button>
                </div>
            </div>
        </div>
    );
};
