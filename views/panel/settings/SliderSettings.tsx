
import React, { useState } from 'react';
import { SliderItem, LocalizedString, Language } from '../../../types';
import { useUI } from '../../../context/UIContext';
import { apiService } from '../../../services/api';

interface Props {
    slides: SliderItem[];
    addSlide: (s: any) => void;
    updateSlide: (id: string, s: any) => void;
    deleteSlide: (id: string) => void;
}

export const SliderSettings: React.FC<Props> = ({ slides, addSlide, updateSlide, deleteSlide }) => {
    const { t, showToast } = useUI();
    const [settingLang, setSettingLang] = useState<Language>('tr');
    
    const [editSlideId, setEditSlideId] = useState<string | null>(null);
    const [slideFile, setSlideFile] = useState<File | null>(null);
    const [isUploadingSlide, setIsUploadingSlide] = useState(false);
    const [newSlide, setNewSlide] = useState<{
        image: string;
        title: LocalizedString;
        subtitle: LocalizedString;
        tag: string;
    }>({
        image: '',
        title: { tr: '', en: '', ro: '' },
        subtitle: { tr: '', en: '', ro: '' },
        tag: ''
    });

    const handleSaveSlide = async (e: React.SyntheticEvent) => {
        if(e && e.preventDefault) e.preventDefault();
        let finalImageUrl = newSlide.image;
        if (slideFile) {
            setIsUploadingSlide(true);
            showToast('Banner görseli yükleniyor...', 'info');
            const { publicUrl, error } = await apiService.uploadFile(slideFile, 'app-assets', 'Banners');
            setIsUploadingSlide(false);
            if (error) { showToast(`Yükleme Hatası: ${error}`, 'error'); return; } 
            else if (publicUrl) { finalImageUrl = publicUrl; }
        }
        if (!finalImageUrl) { showToast(t('admin.settings.sliderErrorImage'), 'error'); return; }
        
        const slideData = { image: finalImageUrl, title: newSlide.title, subtitle: newSlide.subtitle, tag: newSlide.tag || 'GENEL' };
        
        if (editSlideId) { 
            updateSlide(editSlideId, slideData); 
            setEditSlideId(null); 
            showToast(t('admin.settings.sliderUpdated')); 
        } else { 
            addSlide(slideData); 
            showToast(t('admin.settings.sliderAdded')); 
        }
        setNewSlide({ image: '', title: { tr: '', en: '', ro: '' }, subtitle: { tr: '', en: '', ro: '' }, tag: '' });
        setSlideFile(null);
    };

    const startEditSlide = (slide: SliderItem) => {
        setEditSlideId(slide.id);
        setNewSlide({ image: slide.image, title: slide.title, subtitle: slide.subtitle, tag: slide.tag });
        setSlideFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-iha-900 p-5 rounded-2xl border border-iha-700">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-400">add_photo_alternate</span>{editSlideId ? t('admin.settings.sliderEdit') : t('admin.settings.sliderAdd')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-4">
                        <div className="flex gap-2">{(['tr', 'en', 'ro'] as Language[]).map(lang => (<button key={lang} type="button" onClick={() => setSettingLang(lang)} className={`px-2 py-1 rounded text-[10px] font-bold ${settingLang === lang ? 'bg-blue-600 text-white' : 'bg-iha-800 text-slate-500'}`}>{lang.toUpperCase()}</button>))}</div>
                        <input placeholder={`${t('common.title')} (${settingLang})`} value={newSlide.title[settingLang]} onChange={e => setNewSlide({...newSlide, title: {...newSlide.title, [settingLang]: e.target.value}})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                        <input placeholder={`${t('common.subtitle')} (${settingLang})`} value={newSlide.subtitle[settingLang]} onChange={e => setNewSlide({...newSlide, subtitle: {...newSlide.subtitle, [settingLang]: e.target.value}})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                    </div>
                    <div className="space-y-4 pt-6">
                        <div className="flex flex-col gap-2">
                            <div className="relative border-2 border-dashed border-iha-700 rounded-xl p-4 text-center hover:bg-iha-800/50 transition-all cursor-pointer group">
                                {isUploadingSlide ? (<div className="flex flex-col items-center"><span className="material-symbols-outlined text-blue-500 animate-spin">sync</span><span className="text-xs text-blue-400 mt-1">Yükleniyor...</span></div>) : (<><input type="file" accept="image/*" onChange={(e) => {if(e.target.files) setSlideFile(e.target.files[0])}} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><span className="material-symbols-outlined text-2xl text-slate-500 mb-1 group-hover:text-white transition-colors">cloud_upload</span><p className="text-xs text-slate-400 group-hover:text-white transition-colors">{slideFile ? slideFile.name : 'Görsel Yükle (Banners)'}</p></>)}
                            </div>
                            <div className="flex items-center gap-2"><div className="h-px bg-iha-700 flex-1"></div><span className="text-[10px] text-slate-600 font-bold uppercase">VEYA</span><div className="h-px bg-iha-700 flex-1"></div></div>
                            <input placeholder={t('admin.settings.sliderImagePlaceholder')} value={newSlide.image} onChange={e => setNewSlide({...newSlide, image: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                        </div>
                        <input placeholder={t('admin.settings.sliderTagPlaceholder')} value={newSlide.tag} onChange={e => setNewSlide({...newSlide, tag: e.target.value})} className="w-full bg-iha-800 border border-iha-700 rounded-lg p-2.5 text-white text-sm" />
                        <div className="flex gap-2">
                            <button onClick={handleSaveSlide} disabled={isUploadingSlide} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all disabled:opacity-50">{editSlideId ? t('common.update') : t('common.add')}</button>
                            {editSlideId && <button onClick={() => {setEditSlideId(null); setNewSlide({image:'',title:{tr:'',en:'',ro:''},subtitle:{tr:'',en:'',ro:''},tag:''}); setSlideFile(null);}} className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold">{t('common.cancel')}</button>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map(slide => (
                    <div key={slide.id} className="bg-iha-900 border border-iha-700 rounded-xl overflow-hidden group">
                        <div className="aspect-video relative">
                            <img src={slide.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => startEditSlide(slide)} className="p-2 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button onClick={() => {if(window.confirm(t('common.deleteConfirm'))) deleteSlide(slide.id)}} className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                        <div className="p-3"><p className="text-white text-xs font-bold truncate">{slide.title['tr']}</p><p className="text-[10px] text-slate-500 uppercase mt-1">{slide.tag}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
