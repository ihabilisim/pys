
import React from 'react';
import { useUI } from '../../context/UIContext';

interface ProfileFormProps {
    name: string;
    phone: string;
    title: string;
    email: string;
    onNameChange: (val: string) => void;
    onPhoneChange: (val: string) => void;
    onEmailChange: (val: string) => void; 
    onSubmit: (e: React.FormEvent) => void;
    onLogout: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ 
    name, phone, title, email, 
    onNameChange, onPhoneChange, onEmailChange, 
    onSubmit, onLogout 
}) => {
    const { t } = useUI();

    return (
        <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-5">
            <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block group-focus-within:text-blue-500 transition-colors">{t('profile.fullName')}</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500">badge</span>
                        <input 
                            value={name} 
                            onChange={e => onNameChange(e.target.value)} 
                            className="w-full bg-iha-900 border border-iha-700 rounded-xl py-2.5 pl-10 pr-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-bold" 
                            placeholder={t('profile.fullName')}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block group-focus-within:text-blue-500 transition-colors">{t('profile.phone')}</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500">call</span>
                        <input 
                            value={phone} 
                            onChange={e => onPhoneChange(e.target.value)} 
                            className="w-full bg-iha-900 border border-iha-700 rounded-xl py-2.5 pl-10 pr-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-mono" 
                            placeholder="+40..." 
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block group-focus-within:text-blue-500 transition-colors">{t('profile.email')}</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500">mail</span>
                        <input 
                            value={email} 
                            onChange={e => onEmailChange(e.target.value)} 
                            className="w-full bg-iha-900 border border-iha-700 rounded-xl py-2.5 pl-10 pr-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" 
                            placeholder="mail@makyol.com" 
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">{t('profile.role')}</label>
                    <div className="w-full bg-iha-900/50 border border-iha-700 rounded-xl py-2.5 px-3 text-slate-400 text-sm flex items-center gap-2 cursor-not-allowed">
                        <span className="material-symbols-outlined text-slate-600">work</span>
                        {title}
                        <span className="ml-auto text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">READ ONLY</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 flex gap-3 border-t border-iha-700">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">save</span>
                    {t('profile.update')}
                </button>
                <button type="button" onClick={onLogout} className="px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all border border-red-500/20 active:scale-95 flex items-center gap-2 group">
                    <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">logout</span>
                    {t('profile.logout')}
                </button>
            </div>
        </form>
    );
};
