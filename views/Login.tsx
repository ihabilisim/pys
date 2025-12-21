
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { mailService } from '../services/mail';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const { data } = useData();
  const { login, addUser } = useAuth();
  const { t, showToast } = useUI();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Giriş İşlemi
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
      login(user);
      onLogin();
    } else {
      setError(t('auth.loginError'));
    }
  };

  // Kayıt İşlemi
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (data.users.some(u => u.username === username)) {
      setError("Bu kullanıcı adı zaten alınmış.");
      return;
    }

    setIsLoading(true);
    // Kayıt simülasyonu
    const newUser = {
      username,
      password,
      fullName,
      email,
      role: 'viewer' as const,
      permissions: [],
      jobTitle: 'New Member'
    };

    addUser(newUser);
    
    setTimeout(() => {
        setIsLoading(false);
        showToast(t('auth.registerSuccess'), 'success');
        setMode('login');
    }, 1000);
  };

  // Şifre Sıfırlama İşlemi
  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setIsLoading(true);
      const result = await mailService.sendPasswordReset(data.settings, email);
      setIsLoading(false);

      if (result.success) {
          showToast(result.message, 'success');
          setMode('login');
      } else {
          setError(result.message);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-4 font-sans transition-colors duration-300">
        <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row h-auto lg:h-[800px] overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-[#1e293b] ring-1 ring-slate-900/5 dark:ring-white/10">
            
            {/* SOL TARAF: MARKA VE GÖRSEL */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col bg-[#0f172a]">
                <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 to-[#0f172a]/40"></div>
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                            I
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">IHA BIM & PYS</span>
                    </div>
                    <div className="max-w-md">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Geleceğin <span className="text-blue-500">Yollarını</span> Birlikte Kuruyoruz
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                            Makyol Sibiu - Făgăraș Otoyolu Lot 1 Projesi Dijital Yönetim Platformuna Hoş Geldiniz.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-blue-500 text-xl">verified_user</span>
                            <span>Secure Enterprise Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SAĞ TARAF: FORM ALANI */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-20 bg-white dark:bg-[#1e293b] relative">
                <button onClick={onBack} className="absolute top-4 right-4 lg:top-8 lg:right-8 text-slate-400 hover:text-blue-500 flex items-center gap-1 text-sm font-medium transition-all group p-2">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    {t('auth.back')}
                </button>

                <div className="w-full max-w-md flex flex-col gap-6">
                    {/* Başlık ve Mod Geçişi */}
                    <div className="text-center lg:text-left space-y-2 mb-2 mt-8 lg:mt-0">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight animate-in slide-in-from-top-4">
                            {mode === 'login' ? t('auth.loginTitle') : mode === 'register' ? t('auth.registerTitle') : t('auth.resetTitle')}
                        </h2>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">
                            {mode === 'login' ? t('auth.loginSubtitle') : mode === 'register' ? t('auth.registerSubtitle') : t('auth.resetDesc')}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-4" onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgotPassword}>
                        
                        {/* Kayıt Modu için Ekstra Alanlar */}
                        {mode === 'register' && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">badge</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder={t('auth.fullName')}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* E-posta Alanı (Kayıt ve Şifre Sıfırlama) */}
                        {(mode === 'register' || mode === 'forgot') && (
                            <div className="relative group animate-in slide-in-from-right-4 duration-300 delay-75">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">mail</span>
                                </div>
                                <input 
                                    type="email" 
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        )}

                        {/* Kullanıcı Adı Alanı (Giriş ve Kayıt) */}
                        {mode !== 'forgot' && (
                            <div className="relative group animate-in slide-in-from-right-4 duration-300 delay-100">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">person</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={t('auth.username')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        )}

                        {/* Şifre Alanı (Giriş ve Kayıt) */}
                        {mode !== 'forgot' && (
                            <div className="relative group animate-in slide-in-from-right-4 duration-300 delay-150">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        )}

                        {/* Şifre Tekrarı (Sadece Kayıt) */}
                        {mode === 'register' && (
                            <div className="relative group animate-in slide-in-from-right-4 duration-300 delay-200">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">lock_reset</span>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.confirmPassword')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        )}

                        {/* Giriş Modunda Şifremi Unuttum Linki */}
                        {mode === 'login' && (
                            <div className="flex justify-end -mt-2">
                                <button type="button" onClick={() => setMode('forgot')} className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors p-2">
                                    {t('auth.forgotPassword')}
                                </button>
                            </div>
                        )}

                        {/* Ana Buton */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined animate-spin">sync</span>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? t('auth.loginButton') : mode === 'register' ? t('auth.registerButton') : t('auth.sendLink')}</span>
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Alt Linkler ve Mod Değişimi */}
                    <div className="text-center space-y-4">
                        <div className="flex items-center gap-2 justify-center text-sm">
                            <span className="text-slate-500">
                                {mode === 'login' ? "Henüz bir hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}
                            </span>
                            <button 
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError('');
                                }} 
                                className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4 p-1"
                            >
                                {mode === 'login' ? "Hemen Kayıt Ol" : "Giriş Yap"}
                            </button>
                        </div>
                        
                        {mode === 'forgot' && (
                             <button 
                                onClick={() => setMode('login')} 
                                className="text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-1 mx-auto p-2"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                {t('auth.back')}
                            </button>
                        )}
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-700/50 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('auth.copyright')}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
