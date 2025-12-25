
import React, { useState } from 'react';
import { useUI } from '../../../context/UIContext';
import { MatrixStatus, ProgressRow, MatrixColumn } from '../../../types';

interface PvlaImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: { rowId: string, colId: string, status: MatrixStatus, code: string }[]) => void;
    visibleRows: ProgressRow[];
    visibleColumns: MatrixColumn[];
}

export const PvlaImportModal: React.FC<PvlaImportModalProps> = ({ isOpen, onClose, onSave, visibleRows, visibleColumns }) => {
    const { t } = useUI();
    const [pasteData, setPasteData] = useState('');
    const [previewUpdates, setPreviewUpdates] = useState<{ rowId: string, colId: string, status: MatrixStatus, code: string, rowName: string, colName: string }[]>([]);

    if (!isOpen) return null;

    const analyzeCell = (text: string): { status: MatrixStatus, code: string } => {
        const t = text.trim();
        
        // 1. Eğer hücre boşsa veya sadece tire/0 varsa
        if (!t || ['-', '0', '', ' '].includes(t)) {
            return { status: 'EMPTY', code: '-' };
        }

        // 2. KATI KURAL: Hücredeki metni olduğu gibi 'Code' olarak al.
        // Statü her zaman 'EMPTY' (Başlanmadı) olsun.
        // Kullanıcı sadece verileri içeri atmak istiyor.
        return { status: 'EMPTY', code: t };
    };

    const handleProcess = () => {
        if (!pasteData) return;
        const rows = pasteData.trim().split('\n');
        const updates: typeof previewUpdates = [];

        // Loop through pasted rows (limited by visible UI rows to avoid overflow mapping)
        rows.forEach((line, rIdx) => {
            if (rIdx >= visibleRows.length) return; // Ignore extra pasted rows
            
            const cols = line.split('\t');
            const targetRow = visibleRows[rIdx];

            cols.forEach((cellText, cIdx) => {
                if (cIdx >= visibleColumns.length) return; // Ignore extra pasted columns
                
                const targetCol = visibleColumns[cIdx];
                const { status, code } = analyzeCell(cellText);

                // Sadece anlamlı verileri ekle (Boş veya '-' olanları atla, veritabanını şişirme)
                if (code !== '-' && code !== '') {
                    updates.push({
                        rowId: targetRow.id,
                        colId: targetCol.id,
                        status: status,
                        code: code,
                        rowName: targetRow.location,
                        colName: targetCol.name.tr
                    });
                }
            });
        });

        setPreviewUpdates(updates);
    };

    const handleConfirm = () => {
        const simplified = previewUpdates.map(u => ({ rowId: u.rowId, colId: u.colId, status: u.status, code: u.code }));
        onSave(simplified);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-iha-800 w-full max-w-5xl rounded-2xl border border-iha-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">grid_on</span>
                        Excel'den Veri Yükle (Doğrudan Aktarım)
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-4 text-xs text-blue-200">
                    <p className="font-bold mb-1">NASIL KULLANILIR?</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Excel'den kopyaladığınız veriyi yapıştırın.</li>
                        <li><strong>Metin Aktarımı:</strong> Hücredeki metinler (Örn: "2D-1/T") sistemde <strong>Referans Kodu</strong> olarak kaydedilir.</li>
                        <li><strong>Varsayılan Durum:</strong> Tüm hücreler <strong>"BAŞLANMADI" (Gri)</strong> olarak ayarlanır.</li>
                        <li>Satır ve sütun sırasının ekrandaki tabloyla birebir aynı olduğundan emin olun.</li>
                    </ul>
                </div>

                <div className="flex-1 flex gap-4 min-h-0">
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs text-slate-500 font-bold mb-1 uppercase">1. Veriyi Buraya Yapıştırın (CTRL+V)</label>
                        <textarea 
                            value={pasteData}
                            onChange={e => setPasteData(e.target.value)}
                            className="flex-1 w-full bg-iha-900 border border-iha-700 rounded-xl p-3 text-xs text-white font-mono resize-none outline-none focus:border-blue-500 whitespace-pre"
                            placeholder={`2D-1/T\t2D-6/T\t...\n2S-1/T\t2S-6/T\t...`}
                        />
                        <button onClick={handleProcess} disabled={!pasteData} className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs disabled:opacity-50">VERİYİ ANALİZ ET</button>
                    </div>

                    <div className="flex-1 flex flex-col border-l border-iha-700 pl-4">
                        <label className="text-xs text-slate-500 font-bold mb-1 uppercase">2. Önizleme ({previewUpdates.length} Hücre)</label>
                        <div className="flex-1 bg-iha-900 border border-iha-700 rounded-xl overflow-y-auto custom-scrollbar p-2">
                            {previewUpdates.length > 0 ? (
                                <table className="w-full text-left text-[10px]">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-iha-700"><th className="pb-1">Konum</th><th className="pb-1">Veri (Kod)</th><th className="pb-1">Durum</th></tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {previewUpdates.map((u, i) => (
                                            <tr key={i} className="border-b border-iha-700/30">
                                                <td className="py-1 pr-2 truncate max-w-[80px] font-mono text-slate-500">{u.rowName} / {u.colName}</td>
                                                <td className="py-1 pr-2 font-bold text-white">{u.code}</td>
                                                <td className="py-1 font-bold">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                                                        BAŞLANMADI
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">Veri bekleniyor...</div>
                            )}
                        </div>
                        <button onClick={handleConfirm} disabled={previewUpdates.length === 0} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs disabled:opacity-50">ONAYLA VE KAYDET</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
