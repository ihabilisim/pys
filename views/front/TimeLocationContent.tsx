
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management */
import { useUI } from '../../context/UIContext';

export const TimeLocationContent: React.FC = () => {
  const { data } = useData();
  /* Use UI context for language management */
  const { language, t } = useUI();

  return (
      <div className="bg-iha-800 p-6 rounded-2xl border border-iha-700 animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">query_stats</span>
                  {t('timeloc.title')}
              </h3>
              <div className="text-xs text-slate-400">
                  KM 0 - KM 15
              </div>
          </div>
          <div className="flex-1 bg-iha-900 rounded-xl border border-iha-700 relative overflow-hidden p-8">
              <div className="absolute inset-0 flex">
                  {/* Y Axis: Time (Months) */}
                  <div className="w-16 h-full border-r border-slate-700 flex flex-col justify-between py-8 text-xs text-slate-500 pr-2">
                      <span>Jan 26</span><span>Jul 25</span><span>Jan 25</span><span>Jul 24</span><span>Jan 24</span>
                  </div>
                  {/* Chart Area */}
                  <div className="flex-1 relative">
                      {/* Grid X */}
                      {[0, 20, 40, 60, 80, 100].map(p => (
                          <div key={p} className="absolute top-0 bottom-0 border-l border-slate-800" style={{ left: `${p}%` }}></div>
                      ))}
                      {/* X Axis Labels */}
                      <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-700">
                          <span>KM 0</span><span>KM 3</span><span>KM 6</span><span>KM 9</span><span>KM 12</span><span>KM 15</span>
                      </div>

                      {/* Phase Bars (Simulated Placement) */}
                      {data.timelinePhases.map((phase, idx) => {
                          const left = (phase.startKm / 15) * 100;
                          const width = ((phase.endKm - phase.startKm) / 15) * 100;
                          const top = 10 + (idx * 10); // Simplified Y placement
                          const height = 8;
                          const color = phase.status === 'COMPLETED' ? 'bg-green-600' : phase.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-slate-700';
                          
                          return (
                              <div 
                                key={phase.id}
                                className={`absolute ${color} opacity-80 rounded-md flex items-center justify-center text-[9px] text-white font-bold shadow-lg hover:opacity-100 cursor-pointer transition-all hover:scale-105`}
                                style={{ left: `${left}%`, width: `${width}%`, top: `${top}%`, height: `${height}%` }}
                                title={`${phase.label[language]} (${phase.startKm}-${phase.endKm} KM)`}
                              >
                                  {phase.label[language]}
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      </div>
  );
};
