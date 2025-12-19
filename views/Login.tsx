
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const { data } = useData();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find user in stored data
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
      login(user);
      onLogin();
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-4 font-sans transition-colors duration-300">
        <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row h-auto lg:h-[800px] overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-[#1e293b] ring-1 ring-slate-900/5 dark:ring-white/10">
            {/* LEFT SIDE: IMAGE & BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col bg-[#0f172a]">
                <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC23er-tUcjpg5YPEU7WsFhMJTH7DeXlgJ3EaUAhJhcLGuq5B9-D2c_48t-FoOtyK4tm8ORjrIY-uyMo2dhcAggLMP5YJ41XplG_I7eRm1TX_TYwTMyc0jy0WbSeSlbN8N4QBLytM2UBAxxXcXMUruqwbfPkIerdlFZnrLliyeusHSNkrsurdcZzJqCZblfvNY_kt5iNQ2n1B3xOmsAE6l39RPMEBfuNWvWm1A_YMM2tOhGMOdj7PYNI3zSR9DyUD0WLI4k9GIoOOMf')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 to-[#0f172a]/40"></div>
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                            I
                        </div>
                        <span className="text-white font-bold text-xl tracking-wide">IHA BIM&PYS</span>
                    </div>
                    <div className="max-w-md">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Geleceği <span className="text-blue-500">İnşa Ediyoruz</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                            Sibiu - Făgăraș Otoyolu Lot 1 Projesi. Modern altyapı çözümleri ve sürdürülebilir mühendislik ile yolları birleştiriyoruz.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-blue-500 text-xl">engineering</span>
                                <span>Proje Yönetim Sistemi v2.4</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
                        <div className="h-1.5 w-4 bg-slate-600 rounded-full"></div>
                        <div className="h-1.5 w-4 bg-slate-600 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white dark:bg-[#1e293b] relative">
                <button onClick={onBack} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Geri Dön
                </button>

                <div className="w-full max-w-md flex flex-col gap-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            IHA Sibiu Lot1 CMS<br/>
                            <span className="text-blue-500">Yönetici Girişi</span>
                        </h2>
                        <p className="text-gray-500 dark:text-slate-400">
                            Panele güvenli erişim için kimlik bilgilerinizi giriniz.
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 ml-1" htmlFor="username">Kullanıcı Adı</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">person</span>
                                </div>
                                <input 
                                    id="username" 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="kullanici"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300" htmlFor="password">Şifre</label>
                                <a href="#" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">Şifremi Unuttum?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                                </div>
                                <input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2">
                            <span>Giriş Yap</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-slate-500">
                            Giriş yapamıyor musunuz? 
                            <a href="#" className="text-gray-700 dark:text-slate-200 font-medium hover:text-blue-500 hover:underline transition-colors ml-1">IT Destek ile iletişime geçin</a>
                        </p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-700/50 flex justify-center text-xs text-slate-400">
                        <p>© 2024 IHA Bilişim - Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
