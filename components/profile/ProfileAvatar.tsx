
import React from 'react';

interface ProfileAvatarProps {
    avatarUrl: string | null;
    onChange: (file: File) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatarUrl, onChange }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        }
    };

    return (
        <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer w-28 h-28">
                {/* Main Avatar Image or Placeholder */}
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-iha-700 shadow-2xl relative bg-iha-800">
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-slate-500">person</span>
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-white text-2xl mb-1">add_a_photo</span>
                    <span className="text-[9px] text-white font-bold uppercase tracking-wider">Değiştir</span>
                </div>

                {/* Edit Icon Badge */}
                <div className="absolute bottom-1 right-1 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-iha-800 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-sm">edit</span>
                </div>

                {/* Hidden Input */}
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                    accept="image/*" 
                />
            </div>
        </div>
    );
};
