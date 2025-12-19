
import React from 'react';
import { WeatherData } from '../../types';
import { useUI } from '../../context/UIContext';

interface ConcreteStatusProps {
    weather: WeatherData | null;
    lang?: 'tr' | 'en' | 'ro';
}

export const ConcreteStatusCard: React.FC<ConcreteStatusProps> = ({ weather, lang = 'tr' }) => {
    const { t } = useUI();
    const { tr, en, ro } = {
        tr: { title: "AKILLI BETON ASİSTANI", green: "Beton dökümü için koşullar uygun.", greenD: "Standart prosedürleri uygulayınız.", yellow: "Önlem alarak döküm yapınız.", yellowCold: "Soğuk hava. Kürleme ve örtü gereklidir.", yellowWind: "Rüzgarlı. Plastik rötre çatlağı riski.", red: "Döküm önerilmez / Riskli!", redCold: "Don riski yüksek. Isıtma zorunlu.", redRain: "Yağışlı hava. Yüzey bozulabilir.", redWind: "Aşırı rüzgar. Vinç operasyonu riskli.", ts: "TS EN 206" },
        en: { title: "SMART CONCRETE ASSISTANT", green: "Conditions suitable for pouring.", greenD: "Apply standard procedures.", yellow: "Pour with precautions.", yellowCold: "Cold weather. Curing and cover required.", yellowWind: "Windy. Risk of plastic shrinkage cracking.", red: "Pouring not recommended / Risky!", redCold: "High frost risk. Heating mandatory.", redRain: "Rainy weather. Surface damage risk.", redWind: "Excessive wind. Crane operation risky.", ts: "EN 206" },
        ro: { title: "ASISTENT INTELIGENT BETON", green: "Condiții optime pentru turnare.", greenD: "Aplicați procedurile standard.", yellow: "Turnați cu măsuri de precauție.", yellowCold: "Vreme rece. Necesită protecție.", yellowWind: "Vânt. Risc de fisuri.", red: "Turnare nerecomandată / Riscant!", redCold: "Risc îngheț. Încălzire obligatorie.", redRain: "Ploaie. Risc deteriorare suprafață.", redWind: "Vânt excesiv. Risc macara.", ts: "SR EN 206" }
    };

    if (!weather) return (
        <div className="bg-iha-800 rounded-xl p-4 border border-iha-700 animate-pulse h-24"></div>
    );

    let status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    
    const txt = lang === 'en' ? en : lang === 'ro' ? ro : tr;
    
    let message = txt.green;
    let details = txt.greenD;

    if (weather.temp < -3 || weather.code >= 60 || weather.wind > 40) {
        status = 'RED';
        message = txt.red;
        if (weather.temp < -3) details = txt.redCold;
        else if (weather.code >= 60) details = txt.redRain;
        else details = txt.redWind;
    } else if (weather.temp < 5 || weather.wind > 20) {
        status = 'YELLOW';
        message = txt.yellow;
        if (weather.temp < 5) details = txt.yellowCold;
        else details = txt.yellowWind;
    } else {
        message = txt.green;
        details = txt.greenD;
    }

    const colorClass = status === 'GREEN' ? 'bg-green-500' : status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500';
    const textClass = status === 'GREEN' ? 'text-green-500' : status === 'YELLOW' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-iha-800 rounded-2xl border border-iha-700 p-6 flex items-center justify-between relative group">
            <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl ${colorClass}`}></div>
            <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-sm">science</span>{txt.title}</h3>
                <h2 className="text-white font-bold text-lg">{message}</h2>
                <p className="text-slate-400 text-xs mt-1">{details}</p>
            </div>
            <div className="relative group/icon cursor-help flex flex-col items-center">
                 <div className={`w-12 h-12 rounded-full border-4 border-iha-900 shadow-xl flex items-center justify-center ${colorClass} text-iha-900`}><span className="material-symbols-outlined font-bold text-2xl">{status === 'GREEN' ? 'check' : status === 'YELLOW' ? 'priority_high' : 'block'}</span></div>
                 <span className={`text-[10px] font-bold mt-2 ${textClass}`}>{txt.ts}</span>
                 
                 {/* Tooltip */}
                 <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 p-3 bg-black/95 backdrop-blur-xl text-white text-[11px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover/icon:opacity-100 transition-all duration-300 pointer-events-none z-50 text-center border border-white/10 transform translate-y-2 group-hover/icon:translate-y-0">
                    {t('dashboard.concreteStandardInfo')}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/95 border-r border-b border-white/10 rotate-45"></div>
                 </div>
            </div>
        </div>
    );
};
