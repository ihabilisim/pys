
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { CircularProgress, ProductionCard, ConcreteStatusCard, StockWidget, DailyLogWidget } from '../../components/Analytics';

export const DashboardContent: React.FC = () => {
  const { data, weather } = useData();
  const { language, setActiveTab, t } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hseDays, setHseDays] = useState(0);
  const slides = data.slides;

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    const calculateDays = () => {
        if (!data.dashboardWidgets.hse.lastIncidentDate) return;
        const incidentDate = new Date(data.dashboardWidgets.hse.lastIncidentDate);
        incidentDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - incidentDate.getTime();
        const days = diffTime > 0 ? Math.round(diffTime / (1000 * 60 * 60 * 24)) : 0;
        setHseDays(days);
    };
    calculateDays(); 
  }, [data.dashboardWidgets.hse.lastIncidentDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-2">
      
      {/* HERO BANNER SLIDER */}
      {slides.length > 0 && (
        <div className="relative h-64 md:h-[24rem] w-full rounded-3xl overflow-hidden shadow-2xl border border-iha-700 group">
            {slides.map((slide, index) => (
                <div 
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                >
                <img src={slide.image} alt={slide.title[language]} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-iha-900/95 via-iha-900/40 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-iha-blue/90 text-white text-[10px] md:text-xs font-bold tracking-widest rounded mb-3 w-fit shadow-lg backdrop-blur-sm animate-in slide-in-from-left duration-700">{slide.tag}</span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 shadow-sm animate-in slide-in-from-left duration-700 delay-100 leading-tight tracking-tight">{slide.title[language]}</h1>
                    <p className="text-slate-200 text-base md:text-xl shadow-sm animate-in slide-in-from-left duration-700 delay-200 opacity-90">{slide.subtitle[language]}</p>
                </div>
                </div>
            ))}

            {/* CTA Buttons - Right Side Overlay */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-3 z-20">
                <button 
                    onClick={() => setActiveTab('feedback')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-3 transition-all group hover:scale-105 shadow-2xl"
                >
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                        <span className="material-symbols-outlined">reviews</span>
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Geliştirme Önerisi</p>
                        <p className="text-sm font-black">Geri Bildirim Bırak</p>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab('chat')}
                    className="bg-blue-600/90 backdrop-blur-md hover:bg-blue-500 text-white border border-blue-400/30 px-6 py-4 rounded-2xl flex items-center gap-3 transition-all group hover:scale-105 shadow-2xl"
                >
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:-rotate-12 transition-transform">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Canlı Destek</p>
                        <p className="text-sm font-black">Takım Sohbeti</p>
                    </div>
                </button>
            </div>

            <div className="absolute bottom-6 left-12 flex space-x-2 z-10">{slides.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-iha-blue' : 'w-2 bg-white/40 hover:bg-white/80'}`} />))}</div>
        </div>
      )}

      {/* TOP WIDGETS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. ADVANCED ANALYTICS */}
          <div className="lg:col-span-2 bg-iha-800 rounded-2xl border border-iha-700 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6"><div><h3 className="text-white font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">analytics</span>{t('dashboard.siteAnalysis')}</h3><p className="text-slate-400 text-xs mt-1">Progress & Production</p></div><span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">{t('dashboard.activeLot')}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-center border-r border-iha-700/50 pr-0 md:pr-8"><CircularProgress value={data.dashboardWidgets.progress.actual} label={data.dashboardWidgets.progress.description[language]} subLabel={t('admin.dashboard.actual')} size={160} strokeWidth={12} color="#10b981" /><div className="mt-4 text-center"><p className="text-xs text-slate-500">{t('admin.dashboard.planned')}</p><p className="text-white font-mono">{data.dashboardWidgets.progress.planned}%</p></div></div>
                  <div className="md:col-span-2 grid grid-cols-1 gap-4">
                      {data.dashboardWidgets.production && data.dashboardWidgets.production.map(stat => (<ProductionCard key={stat.id} stat={stat} lang={language} />))}
                  </div>
              </div>
          </div>

          {/* 2. HSE & WEATHER */}
          <div className="flex flex-col gap-6">
              <div className="bg-emerald-900/20 rounded-2xl border border-emerald-500/30 p-5 relative overflow-hidden group shadow-xl">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
                              <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                          </div>
                          <div>
                              <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-0.5">{t('dashboard.accidentFree')}</h3>
                              <p className="text-emerald-200/60 text-[10px] font-mono">{t('dashboard.manHours')}: <span className="text-white">{data.dashboardWidgets.hse.manHours.toLocaleString()}</span></p>
                          </div>
                      </div>
                      <div className="text-5xl font-black text-white font-mono tracking-tighter">{hseDays}</div>
                  </div>
              </div>

              <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6 relative overflow-hidden shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-white font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined text-yellow-500">partly_cloudy_day</span>{t('dashboard.weather')}</h3>
                          <p className="text-slate-400 text-xs mt-1">Avrig, Sibiu Lot 1</p>
                      </div>
                      <div className="text-right">
                          <p className="text-3xl font-bold text-white font-mono">{weather?.temp || '--'}°C</p>
                          <p className="text-xs text-slate-500">{weather?.code && weather.code < 3 ? t('dashboard.clear') : t('dashboard.cloudyRain')}</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-iha-900 p-3 rounded-xl border border-iha-700 flex items-center gap-3"><span className="material-symbols-outlined text-slate-500">air</span><div><p className="text-[10px] text-slate-500 uppercase">{t('dashboard.wind')}</p><p className="text-sm font-bold text-white">{weather?.wind || 0} km/h</p></div></div>
                      <div className="bg-iha-900 p-3 rounded-xl border border-iha-700 flex items-center gap-3"><span className="material-symbols-outlined text-slate-500">humidity_percentage</span><div><p className="text-[10px] text-slate-500 uppercase">{t('dashboard.windStatus')}</p><p className="text-sm font-bold text-white">{weather?.code && weather.code > 50 ? 'Yağışlı' : 'Normal'}</p></div></div>
                  </div>
              </div>
              <ConcreteStatusCard weather={weather} lang={language} />
          </div>
      </div>
    </div>
  );
};
