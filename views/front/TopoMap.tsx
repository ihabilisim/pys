
import React, { useState } from 'react';
import { MapWidget } from '../../components/MapWidget';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { PolygonPoint } from '../../types';
import { PoligonList } from '../maps/PoligonList';
import { UtilitiesManager } from '../maps/Utilities';
import { SectionsTool, generateDetailedProfile } from '../maps/Sections';
import { DistanceTool } from '../maps/Distance';
import { AreaVolumeTool } from '../maps/AreaVolume';
import { NCRModal } from '../maps/ncr';
import { NoteModal } from '../maps/notes';
import { KmChainageModal } from '../maps/KmChainage';
import { ProfilePoint } from '../../components/Analytics';

export const TopoMap: React.FC = () => {
    const { setSelectedPolyId } = useData();
    const { t } = useUI();

    type ToolType = 'none' | 'profile' | 'distance' | 'area' | 'issue' | 'note' | 'utilities';
    const [activeTool, setActiveTool] = useState<ToolType>('none');
    const [measurePoints, setMeasurePoints] = useState<{lat: number, lng: number}[]>([]);
    const [profileData, setProfileData] = useState<{points: ProfilePoint[], totalDist: number} | null>(null);
    const [liveDistance, setLiveDistance] = useState<string>('');
    const [liveArea, setLiveArea] = useState<string>('');
    const [issueModalOpen, setIssueModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedCrossSection, setSelectedCrossSection] = useState<string | null>(null);
    const [clickedCoords, setClickedCoords] = useState<{lat: number, lng: number} | null>(null);

    const handleMapClick = (lat: number, lng: number) => {
        if (activeTool === 'distance' || activeTool === 'area') {
            setMeasurePoints(prev => [...prev, { lat, lng }]);
        } else if (activeTool === 'profile') {
            let newPoints = measurePoints.length >= 2 ? [{ lat, lng }] : [...measurePoints, { lat, lng }];
            setMeasurePoints(newPoints);
            if (newPoints.length === 2) setProfileData(generateDetailedProfile(newPoints[0], newPoints[1]));
        } else if (activeTool === 'issue') {
            setClickedCoords({ lat, lng });
            setIssueModalOpen(true);
            setActiveTool('none'); 
        } else if (activeTool === 'note') {
            setClickedCoords({ lat, lng });
            setNoteModalOpen(true);
            setActiveTool('none');
        }
    };

    const handleFlyToPoly = (point: PolygonPoint) => {
        setSelectedPolyId(point.id);
        const element = document.getElementById('topo-map');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-5 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('topo.title')}</h2>
                    <p className="text-xs text-slate-500 mt-1">{t('topo.subtitle')}</p>
                </div>
            </div>
            
            <div className={`grid grid-cols-1 gap-6 ${activeTool === 'utilities' ? 'lg:grid-cols-4' : ''}`}>
                <div className={`relative ${activeTool === 'utilities' ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                    <MapWidget 
                        activeTool={activeTool} 
                        setActiveTool={setActiveTool}
                        onMapClick={handleMapClick} 
                        measurePoints={measurePoints} 
                        setMeasurePoints={setMeasurePoints}
                        setLiveDistance={setLiveDistance}
                        setLiveArea={setLiveArea}
                        setProfileData={setProfileData}
                        onChainageClick={setSelectedCrossSection}
                    />

                    {/* Instruction Overlays */}
                    {(activeTool === 'issue') && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-red-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                            {t('mapTools.issue.instruction')}
                        </div>
                    )}
                    {(activeTool === 'note') && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-yellow-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                            {t('mapTools.note.instruction')}
                        </div>
                    )}
                    {(activeTool === 'profile' && measurePoints.length < 2) && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-blue-400/30 whitespace-nowrap uppercase tracking-widest animate-in fade-in pointer-events-none">
                            {t('mapTools.profile.instruction')}
                        </div>
                    )}

                    {activeTool === 'distance' && <DistanceTool distance={liveDistance} pointsCount={measurePoints.length} />}
                    {activeTool === 'area' && <AreaVolumeTool area={liveArea} pointsCount={measurePoints.length} />}
                </div>

                {activeTool === 'utilities' && <div className="lg:col-span-1"><UtilitiesManager /></div>}
            </div>
            
            {activeTool === 'profile' && <SectionsTool data={profileData} pointsCount={measurePoints.length} />}
            
            <PoligonList onFlyTo={handleFlyToPoly} />

            <NCRModal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} lat={clickedCoords?.lat || null} lng={clickedCoords?.lng || null} />
            <KmChainageModal selectedKm={selectedCrossSection} onClose={() => setSelectedCrossSection(null)} />
        </div>
    );
};
