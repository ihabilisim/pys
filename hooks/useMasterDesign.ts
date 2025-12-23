
import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { MasterAlignment } from '../types/design';

export const useMasterDesign = (showToast: (msg: string, type?: 'success'|'error'|'info') => void) => {
    const [alignments, setAlignments] = useState<MasterAlignment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadAlignments = useCallback(async () => {
        setIsLoading(true);
        const res = await apiService.fetchAlignments();
        setAlignments(res);
        setIsLoading(false);
    }, []);

    // --- LANDXML PARSING LOGIC ---
    // Note: Complex geometries (Spirals, Curves) are linearly interpolated here for MVP.
    // For engineering-grade precision on curves, a clothoid library is needed.
    const parseAndSaveLandXML = async (file: File, description: string, userId?: string) => {
        setIsLoading(true);
        showToast('LandXML işleniyor... (Bu işlem biraz sürebilir)', 'info');

        try {
            // 1. Upload File
            const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', 'Dizayn/Alignments');
            if (error) throw new Error(error);

            // 2. Read File Content
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            // 3. Find Alignment Element
            const alignments = xmlDoc.getElementsByTagName("Alignment");
            if (alignments.length === 0) throw new Error("LandXML içinde Alignment bulunamadı.");

            const alignmentName = alignments[0].getAttribute("name") || file.name.replace('.xml', '');
            
            // 4. Create Master Record
            const alignmentId = await apiService.createAlignment(alignmentName, description, publicUrl || '', userId);
            if (!alignmentId) throw new Error("Aliyman kaydı oluşturulamadı.");

            // 5. Parse Coordinate Geometry
            const coordGeom = alignments[0].getElementsByTagName("CoordGeom")[0];
            if (!coordGeom) throw new Error("CoordGeom verisi bulunamadı.");

            // Extract geometry elements to interpolate points
            // This simplificated parser iterates elements and generates points
            const pointsToInsert: any[] = [];
            const elements = Array.from(coordGeom.children); // Line, Curve, Spiral
            
            // Helper to get coords from string "Y X" or "N E"
            const parseCoord = (node: Element) => {
                const txt = node.textContent?.trim() || "";
                const parts = txt.split(/\s+/); // Split by space
                // LandXML usually is "North East" -> Y X
                return { y: parseFloat(parts[0]), x: parseFloat(parts[1]) };
            };

            let currentKm = 0; // Ideally extract 'staStart' from Alignment
            const staStart = parseFloat(alignments[0].getAttribute("staStart") || "0");
            currentKm = staStart;

            // Simplified Parsing: We grab Start/End of elements and fill in 10m gaps
            // Warning: Does not calculate exact Curve/Spiral midpoint coordinates mathematically.
            // Uses linear interpolation between element vertices for DB population purposes.
            
            for (const el of elements) {
                const start = el.getElementsByTagName("Start")[0];
                const end = el.getElementsByTagName("End")[0];
                const len = parseFloat(el.getAttribute("length") || "0");

                if (start && end) {
                    const p1 = parseCoord(start);
                    const p2 = parseCoord(end);
                    
                    const steps = Math.ceil(len / 10); // Every 10m approximately
                    const dx = (p2.x - p1.x) / steps;
                    const dy = (p2.y - p1.y) / steps;

                    for (let i = 0; i < steps; i++) {
                        // Skip first point if not first element to avoid duplicates
                        if (i === 0 && pointsToInsert.length > 0) continue;

                        pointsToInsert.push({
                            alignmentId,
                            km: currentKm + (i * 10), // Approx KM
                            x: p1.x + (dx * i),
                            y: p1.y + (dy * i),
                            zRed: null, // Profile parse logic would go here
                            zBlack: null,
                            superelevation: null,
                            bearing: null
                        });
                    }
                    currentKm += len;
                }
            }

            // 6. Bulk Insert
            if (pointsToInsert.length > 0) {
                showToast(`${pointsToInsert.length} nokta veritabanına yazılıyor...`, 'info');
                await apiService.bulkInsertPoints(pointsToInsert);
                showToast('Aliyman ve noktalar başarıyla kaydedildi.', 'success');
            } else {
                showToast('Geometri okunamadı veya nokta üretilemedi.', 'error');
            }

            await loadAlignments();

        } catch (e: any) {
            console.error(e);
            showToast(`Hata: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAlignment = async (id: string) => {
        const success = await apiService.deleteAlignment(id);
        if (success) {
            showToast('Aliyman silindi.', 'success');
            loadAlignments();
        } else {
            showToast('Silme hatası.', 'error');
        }
    };

    return {
        alignments,
        isLoading,
        loadAlignments,
        parseAndSaveLandXML,
        deleteAlignment
    };
};
