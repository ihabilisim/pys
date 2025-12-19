
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management and translation */
import { useUI } from '../../context/UIContext';
import { DroneFlight } from '../../types';

const getYouTubeID = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

export const DroneContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management */
  const { language, t } = useUI();
  const [activeDroneVideo, setActiveDroneVideo] = useState<DroneFlight | null>(null);

  useEffect(() => {
      if (data.droneFlights.length > 0 && !activeDroneVideo) {
          setActiveDroneVideo(data.droneFlights[0]);
      }
  }, [data.droneFlights]);

  const sortedFlights = [...data.droneFlights].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {activeDroneVideo ? (
              <div className="bg-iha-800 rounded-3xl border border-iha-700 overflow-hidden shadow-2xl group">
                  <div className="aspect-video w-full bg-black relative">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeID(activeDroneVideo.youtubeId)}?autoplay=0`} title={activeDroneVideo.title[language]} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full"></iframe>
                  </div>
                  <div className="p-6">
                      <div className="flex justify-between items-start">
                          <div>
                              <h2 className="text-2xl font-bold text-white mb-2">{activeDroneVideo.title[language]}</h2>
                              <p className="text-slate-400 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">calendar_today</span> {activeDroneVideo.date}
                                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                  <span className="material-symbols-outlined text-sm">location_on</span> {activeDroneVideo.location}
                              </p>
                          </div>
                          <div className="bg-iha-900 px-4 py-2 rounded-xl border border-iha-700">
                              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">IHA Drone Team</span>
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="p-12 text-center text-slate-500 bg-iha-800 rounded-3xl border border-iha-700">
                  <span className="material-symbols-outlined text-4xl mb-2">videocam_off</span>
                  <p>{t('drone.noVideo')}</p>
              </div>
          )}
          
          <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden">
              <div className="p-6 border-b border-iha-700 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-iha-blue">history</span>
                      {t('drone.prevFlights')}
                  </h3>
              </div>
              <div className="divide-y divide-iha-700">
                  {sortedFlights.map(flight => (
                      <div key={flight.id} onClick={() => setActiveDroneVideo(flight)} className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 ${activeDroneVideo?.id === flight.id ? 'bg-iha-blue/10' : 'hover:bg-iha-700/50'}`}>
                          <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black border border-iha-700">
                              <img src={flight.thumbnailUrl || `https://img.youtube.com/vi/${getYouTubeID(flight.youtubeId)}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                                  <span className="material-symbols-outlined text-white">play_circle</span>
                              </div>
                          </div>
                          <div className="flex-1">
                              <h4 className={`font-bold text-sm ${activeDroneVideo?.id === flight.id ? 'text-iha-blue' : 'text-white'}`}>{flight.title[language]}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">calendar_today</span> {flight.date}</span>
                                  <span className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">location_on</span> {flight.location}</span>
                              </div>
                          </div>
                          <div className="text-slate-500">
                              {activeDroneVideo?.id === flight.id ? <span className="material-symbols-outlined text-iha-blue animate-pulse">equalizer</span> : <span className="material-symbols-outlined">play_arrow</span>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};
