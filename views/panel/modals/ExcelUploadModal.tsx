
import React, { useState } from 'react';
import { PolygonPoint, ChainageMarker, RoadType } from '../../../types';
import { useUI } from '../../../context/UIContext';

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload?: (points: Omit<PolygonPoint, 'id'>[]) => void;
    onUploadKm?: (markers: Omit<ChainageMarker, 'id'>[]) => void;
    availableRoads?: string[]; // List of Alignment Names for KM mode
    mode?: 'POLYGON' | 'KM';
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ 
    isOpen, onClose, onUpload, onUploadKm, availableRoads = [], mode = 'POLYGON' 
}) => {
    const { t } = useUI();
    const [textData, setTextData] = useState('');
    const [previewCount, setPreviewCount] = useState(0);
    
    // KM Mode Specific States
    const [selectedRoad, setSelectedRoad] = useState('');
    const [selectedRoadType, setSelectedRoadType] = useState<RoadType>('MAIN');

    if (!isOpen) return null;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setTextData(text);
        const rows = text.trim().split('\n').filter(r => r.trim() !== '');
        setPreviewCount(rows.length);
    };

    const processData = () => {
        const rows = textData.trim().split('\n');
        const cleanNumber = (val: string) => val ? val.replace(',', '.').trim() : '0';

        if (mode === 'POLYGON' && onUpload) {
            const parsedPoints: Omit<PolygonPoint, 'id'>[] = [];
            rows.forEach((row) => {
                if (!row.trim()) return;
                const cols = row.split('\t');
                
                // Expected: P.No | Road | Km | Offset | East | North | Elev | Lat | Lng
                if (cols.length >= 7) {
                    const pNo = cols[0]?.trim();
                    if (pNo) {
                        parsedPoints.push({
                            polygonNo: pNo,
                            roadName: cols[1]?.trim(),
                            km: cols[2]?.trim(),
                            offset: cleanNumber(cols[3]),
                            east: cleanNumber(cols[4]),
                            north: cleanNumber(cols[5]),
                            elevation: cleanNumber(cols[6]),
                            lat: cols[7] ? cleanNumber(cols[7]) : '0',
                            lng: cols[8] ? cleanNumber(cols[8]) : '0',
                            description: `${cols[1]?.trim() || ''} - ${cols[2]?.trim() || ''}`, 
                            status: 'ACTIVE'
                        });
                    }
                }
            });
            if (parsedPoints.length > 0) { onUpload(parsedPoints); onClose(); }
            else { alert(t('excel.errorPoly')); }

        } else if (mode === 'KM' && onUploadKm) {
            if(!selectedRoad) { alert(t('excel.errorRoad')); return; }

            const parsedMarkers: Omit<ChainageMarker, 'id'>[] = [];
            rows.forEach((row) => {
                if (!row.trim()) return;
                const cols = row.split('\t');
                
                // Expected for KM: KM_Label | Lat | Lng
                // Example: 12+500 | 45.641 | 24.268
                if (cols.length >= 3) {
                    const kmLabel = cols[0]?.trim();
                    const lat = cleanNumber(cols[1]);
                    const lng = cleanNumber(cols[2]);

                    if (kmLabel && lat && lng) {
                        parsedMarkers.push({
                            km: kmLabel,
                            lat: parseFloat(lat),
                            lng: parseFloat(lng),
                            align: 'center',
                            roadName: selectedRoad,
                            type: selectedRoadType
                        });
                    }
                }
            });
            if (parsedMarkers.length > 0) { onUploadKm(parsedMarkers); onClose(); }
            else { alert(t('excel.errorKm')); }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-iha-800 w-full max-w-3xl rounded-2xl border border-iha-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">table_view</span>
                        {mode === 'POLYGON' ? t('excel.titlePolygon') : t('excel.titleKm')}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {mode === 'KM' && (
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-iha-900/50 p-4 rounded-xl border border-iha-700">
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">{t('excel.roadAlignment')}</label>
                            <div className="relative">
                                <input 
                                    list="roadList" 
                                    value={selectedRoad} 
                                    onChange={(e) => setSelectedRoad(e.target.value)} 
                                    className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-sm"
                                    placeholder={t('common.search')} 
                                />
                                <datalist id="roadList">
                                    {availableRoads.map((r, i) => <option key={i} value={r} />)}
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">{t('excel.sectionType')}</label>
                            <select 
                                value={selectedRoadType} 
                                onChange={(e) => setSelectedRoadType(e.target.value as RoadType)} 
                                className="w-full bg-iha-900 border border-iha-700 rounded-lg p-2 text-white text-sm"
                            >
                                <option value="MAIN">{t('excel.types.MAIN')}</option>
                                <option value="SECONDARY">{t('excel.types.SECONDARY')}</option>
                                <option value="RAMP">{t('excel.types.RAMP')}</option>
                                <option value="INTERSECTION">{t('excel.types.INTERSECTION')}</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4 text-sm text-blue-200">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-400 text-xl mt-0.5">info</span>
                        <div>
                            <p className="font-bold mb-1 text-white">Excel Format:</p>
                            {mode === 'POLYGON' ? (
                                <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px] uppercase text-white">
                                    <span className="bg-slate-700 px-2 py-1 rounded">1. P.No</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded">2. Road</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded">3. Km</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded">4. Offset</span>
                                    <span className="bg-emerald-800 px-2 py-1 rounded">5. East</span>
                                    <span className="bg-emerald-800 px-2 py-1 rounded">6. North</span>
                                    <span className="bg-yellow-800 px-2 py-1 rounded">7. Elev</span>
                                    <span className="bg-blue-800 px-2 py-1 rounded border border-blue-500">8. Lat</span>
                                    <span className="bg-blue-800 px-2 py-1 rounded border border-blue-500">9. Lng</span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px] uppercase text-white">
                                    <span className="bg-slate-700 px-2 py-1 rounded">1. KM (12+500)</span>
                                    <span className="bg-blue-800 px-2 py-1 rounded border border-blue-500">2. Lat (45.x)</span>
                                    <span className="bg-blue-800 px-2 py-1 rounded border border-blue-500">3. Lng (24.x)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <textarea 
                    value={textData}
                    onChange={handleTextChange}
                    className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-4 text-white font-mono text-xs resize-none focus:outline-none focus:border-iha-blue mb-4 custom-scrollbar whitespace-pre"
                    placeholder={t('excel.pasteArea')}
                    style={{ minHeight: '200px' }}
                />

                <div className="flex justify-between items-center pt-4 border-t border-iha-700">
                    <div className="text-sm">
                        {previewCount > 0 ? (
                            <span className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {previewCount} {t('excel.detectedRows')}
                            </span>
                        ) : (
                            <span className="text-slate-500 italic">{t('excel.waiting')}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors text-sm">{t('common.cancel')}</button>
                        <button 
                            onClick={processData} 
                            disabled={previewCount === 0}
                            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-green-900/20"
                        >
                            <span className="material-symbols-outlined text-lg">cloud_upload</span>
                            {t('excel.upload')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
