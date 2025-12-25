
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { siteRepository } from '../../services/repositories/siteRepository';

export const FeedbackPage: React.FC = () => {
    const { t, showToast, setActiveTab } = useUI();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Geliştirme Önerisi',
        content: ''
    });
    
    // Simple Math Captcha
    const [captcha, setCaptcha] = useState(() => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        return { a, b, result: a + b, userValue: '' };
    });

    const resetCaptcha = () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptcha({ a, b, result: a + b, userValue: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(parseInt(captcha.userValue) !== captcha.result) {
            showToast(t('v2.feedback.errorCaptcha'), 'error');
            resetCaptcha();
            return;
        }

        setIsLoading(true);
        const success = await siteRepository.submitFeedback(formData);
        setIsLoading(false);

        if (success) {
            setIsSubmitted(true);
            showToast(t('v2.feedback.successSubmit'), 'success');
            setTimeout(() => setActiveTab('dashboard'), 3000);
        } else {
            showToast(t('v2.feedback.errorSubmit'), 'error');
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic">{t('v2.feedback.successTitle')}</h2>
                <p className="text-slate-400 mb-8">{t('v2.feedback.successMessage')}</p>
                <button onClick={() => setActiveTab('dashboard')} className="text-blue-500 font-bold hover:underline flex items-center gap-2 mx-auto">
                    <span className="material-symbols-outlined">arrow_back</span> {t('v2.feedback.backToHome')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-iha-800 rounded-3xl border border-iha-700 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-9xl">rate_review</span></div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl backdrop-blur-md relative z-10">
                        <span className="material-symbols-outlined text-4xl">reviews</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight relative z-10">{t('v2.feedback.title')}</h2>
                    <p className="text-blue-100 text-sm mt-2 opacity-90 relative z-10">{t('v2.feedback.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">{t('v2.feedback.fullName')}</label>
                            <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-bold" placeholder={t('v2.feedback.placeholder.fullName')} />
                        </div>
                        <div className="group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">{t('v2.feedback.email')}</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" placeholder={t('v2.feedback.placeholder.email')} />
                        </div>
                         <div className="group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">{t('v2.feedback.phone')}</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" placeholder={t('v2.feedback.placeholder.phone')} />
                        </div>
                    </div>

                    <div className="group">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">{t('v2.feedback.subject')}</label>
                        <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-bold cursor-pointer">
                            <option>{t('v2.feedback.subjects.suggestion')}</option>
                            <option>{t('v2.feedback.subjects.bug')}</option>
                            <option>{t('v2.feedback.subjects.data')}</option>
                            <option>{t('v2.feedback.subjects.feature')}</option>
                            <option>{t('v2.feedback.subjects.other')}</option>
                        </select>
                    </div>

                    <div className="group">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">{t('v2.feedback.content')}</label>
                        <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-2xl p-4 text-white h-40 resize-none focus:border-blue-500 outline-none transition-all shadow-inner leading-relaxed" />
                    </div>

                    <div className="bg-iha-900/50 p-5 rounded-3xl border border-iha-700 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-mono font-black border border-slate-700 shadow-lg text-lg">
                                {captcha.a} + {captcha.b}
                            </div>
                            <span className="material-symbols-outlined text-slate-600">equal</span>
                            <input required value={captcha.userValue} onChange={e => setCaptcha({...captcha, userValue: e.target.value})} className="w-24 bg-iha-900 border border-iha-700 rounded-xl p-3 text-center text-white font-black text-xl outline-none focus:border-blue-500" placeholder={t('v2.feedback.placeholder.captcha')} />
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{t('v2.feedback.captcha')}</p>
                             <button type="button" onClick={resetCaptcha} className="text-[8px] text-blue-500 font-bold hover:underline">{t('v2.feedback.captchaChange')}</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50">
                            {isLoading ? (<span className="material-symbols-outlined animate-spin">sync</span>) : (<><span>{t('v2.feedback.submit')}</span><span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span></>)}
                        </button>
                        <button type="button" onClick={() => setActiveTab('dashboard')} className="w-full text-slate-500 text-[10px] font-black hover:text-slate-300 transition-colors uppercase tracking-[0.2em]">
                            {t('v2.feedback.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
