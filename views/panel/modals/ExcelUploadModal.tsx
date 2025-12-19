
import React, { useState } from 'react';
import { PolygonPoint } from '../../../types';

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (points: Omit<PolygonPoint, 'id'>[]) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [textData, setTextData] = useState('');
    const [previewCount, setPreviewCount] = useState(0);

    if (!isOpen) return null;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setTextData(text);
        
        // Simple preview count calculation
        const rows = text.trim().split('\n');
        setPreviewCount(rows.length > 0 && rows[0] !== '' ? rows.length : 0);
    };

    const processData = () => {
        const rows = textData.trim().split('\n');
        const parsedPoints: Omit<PolygonPoint, 'id'>[] = [];

        rows.forEach((row) => {
            // Excel copies are tab-separated
            const cols = row.split('\t');
            
            // Basic validation: Ensure we have enough columns based on your image
            // Col 0: P.No
            // Col 1: Road Name
            // Col 2: Km
            // Col 3: Offset
            // Col 4: East (Stereo70)
            // Col 5: North (Stereo70)
            // Col 6: Elevation
            // Col 7: Lat (WGS84 - In your image header says Easting but data is 45.x)
            // Col 8: Lng (WGS84 - In your image header says Northing but data is 24.x)
            
            if (cols.length >= 7) {
                // Determine Lat/Lng based on value magnitude to be safe
                // Romania is roughly Lat 43-48, Lng 20-29
                let lat = cols[7]?.trim().replace(',', '.');
                let lng = cols[8]?.trim().replace(',', '.');

                // Fallback check if user pasted only Stereo70 columns
                if (!lat || !lng) {
                    // Use placeholders if WGS84 is missing, map wont show location but list will show data
                    lat = '0';
                    lng = '0';
                }

                // Fixed: Added status: 'ACTIVE' to satisfy Omit<PolygonPoint, 'id'>
                parsedPoints.push({
                    polygonNo: cols[0]?.trim(),
                    roadName: cols[1]?.trim(),
                    km: cols[2]?.trim(),
                    offset: cols[3]?.trim(),
                    east: cols[4]?.trim(),
                    north: cols[5]?.trim(),
                    elevation: cols[6]?.trim(),
                    lat: lat,
                    lng: lng,
                    description: `${cols[1]?.trim()} - ${cols[2]?.trim()}`, // Auto description
                    status: 'ACTIVE'
                });
            }
        });

        if (parsedPoints.length > 0) {
            onUpload(parsedPoints);
            setTextData('');
            setPreviewCount(0);
            onClose();
        } else {
            alert("Geçerli veri bulunamadı. Lütfen Excel'den doğru sütunları kopyaladığınızdan emin olun.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-iha-800 w-full max-w-2xl rounded-2xl border border-iha-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">table_view</span>
                        Excel'den Toplu Yükleme
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4 text-sm text-blue-200">
                    <p className="font-bold mb-1">Nasıl Kullanılır?</p>
                    <p>Excel dosyanızdaki sütunları şu sırada seçip kopyalayın (Başlıkları almayın):</p>
                    <p className="font-mono text-xs mt-2 bg-black/30 p-2 rounded">
                        [P.No] [Road Name] [Km] [Offset] [East] [North] [Elevation] [Lat(45.x)] [Lng(24.x)]
                    </p>
                </div>

                <textarea 
                    value={textData}
                    onChange={handleTextChange}
                    className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-4 text-white font-mono text-xs resize-none focus:outline-none focus:border-iha-blue mb-4 custom-scrollbar whitespace-pre"
                    placeholder={`Örn:
500	Main Road	14+520	-473.67	451060.922	468395.575	376.522	45.713582	24.369800
501	Main Road	14+371	-386.81	450964.973	468252.932	375.564	45.712291	24.368582`}
                    style={{ minHeight: '200px' }}
                />

                <div className="flex justify-between items-center pt-2 border-t border-iha-700">
                    <span className="text-sm text-slate-400">
                        {previewCount > 0 ? <span className="text-green-400 font-bold">{previewCount} satır algılandı.</span> : 'Veri bekleniyor...'}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors">İptal</button>
                        <button 
                            onClick={processData} 
                            disabled={previewCount === 0}
                            className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">upload</span>
                            Yükle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
