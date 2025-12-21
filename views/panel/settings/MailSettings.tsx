
import React, { useState } from 'react';
import { AppSettings, SmtpConfig } from '../../../types';
import { mailService } from '../../../services/mail';
import { useUI } from '../../../context/UIContext';

interface Props {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const MailSettings: React.FC<Props> = ({ settings, setSettings }) => {
    const { showToast } = useUI();
    const [testEmail, setTestEmail] = useState('');
    const [isTestingMail, setIsTestingMail] = useState(false);
    
    // Fallback safe access
    const smtp = settings.smtp || { host: '', port: 587, user: '', pass: '', secure: true, fromName: '', fromEmail: '' };

    const handleTestMail = async () => {
        if (!testEmail) { showToast('Lütfen test için bir e-posta adresi girin.', 'error'); return; }
        setIsTestingMail(true);
        const result = await mailService.sendTestMail(smtp, testEmail);
        setIsTestingMail(false);
        if (result.success) showToast(result.message, 'success');
        else showToast(result.message, 'error');
    };

    const updateSmtp = (updates: Partial<SmtpConfig>) => {
        setSettings(prev => ({ ...prev, smtp: { ...smtp, ...updates } }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-orange-500">warning</span>
                <div>
                    <h4 className="text-orange-400 font-bold text-sm">Dikkat: SMTP Konfigürasyonu</h4>
                    <p className="text-xs text-orange-200/70 mt-1">Burada gireceğiniz bilgiler "Şifremi Unuttum" gibi işlemlerde e-posta göndermek için kullanılacaktır.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs text-slate-500 block mb-1">SMTP Host</label><input value={smtp.host} onChange={e => updateSmtp({host: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" placeholder="smtp.office365.com" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">SMTP Port</label><input type="number" value={smtp.port} onChange={e => updateSmtp({port: parseInt(e.target.value)})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" placeholder="587" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">Kullanıcı Adı (Email)</label><input value={smtp.user} onChange={e => updateSmtp({user: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">Şifre</label><input type="password" value={smtp.pass} onChange={e => updateSmtp({pass: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white font-mono text-sm" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">Gönderen Adı</label><input value={smtp.fromName} onChange={e => updateSmtp({fromName: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-sm" /></div>
                <div><label className="text-xs text-slate-500 block mb-1">Gönderen E-Mail</label><input value={smtp.fromEmail} onChange={e => updateSmtp({fromEmail: e.target.value})} className="w-full bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-sm" /></div>
            </div>

            <div className="pt-4 border-t border-iha-700">
                <h4 className="text-sm font-bold text-white mb-2">Bağlantıyı Test Et</h4>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="Test için e-posta adresi (örn: admin@site.com)" 
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1 bg-iha-900 border border-iha-700 rounded-lg p-3 text-white text-sm"
                    />
                    <button 
                        type="button" 
                        onClick={handleTestMail}
                        disabled={isTestingMail}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                        {isTestingMail ? 'Gönderiliyor...' : 'Test Maili Gönder'}
                        <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
