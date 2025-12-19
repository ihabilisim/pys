
import React from 'react';
import { useData } from '../../context/DataContext';
/* Import useUI to access language management */
import { useUI } from '../../context/UIContext';

export const UtilitiesManager: React.FC = () => {
    const { data, toggleLayerVisibility } = useData();
    /* Use UI context for language management */
    const { language, t } = useUI();

    // Group layers by category
    const layersByCategory: Record<string, typeof data.externalLayers> = {};
    
    // Initialize with all categories to ensure empty ones show up if desired (or filter them out)
    data.utilityCategories.forEach(cat => {
        layersByCategory[cat.id] = [];
    });

    // Populate
    data.externalLayers.forEach(layer => {
        if (!layersByCategory[layer.category]) {
            // Fallback for deleted categories or legacy data
            layersByCategory['uncategorized'] = layersByCategory['uncategorized'] || [];
            layersByCategory['uncategorized'].push(layer);
        } else {
            layersByCategory[layer.category].push(layer);
        }
    });

    return (
        <div className="bg-iha-800 rounded-xl border border-iha-700 shadow-xl overflow-hidden animate-in slide-in-from-left-4 flex flex-col h-full">
            <div className="p-4 border-b border-iha-700 bg-iha-900/50 flex justify-between items-center flex-shrink-0">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">electrical_services</span>
                    {t('mapWidget.utilityTitle')}
                </h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                    {data.externalLayers.length} {t('mapWidget.layer')}
                </span>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {data.utilityCategories.map(cat => (
                    <div key={cat.id} className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-iha-700 pb-1 mb-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.name[language]}</h4>
                        </div>
                        
                        {layersByCategory[cat.id] && layersByCategory[cat.id].length > 0 ? (
                            <div className="grid gap-2">
                                {layersByCategory[cat.id].map(layer => (
                                    <div 
                                        key={layer.id} 
                                        onClick={() => toggleLayerVisibility(layer.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${layer.isVisible ? 'bg-iha-900 border-blue-500/50 shadow-md' : 'bg-iha-900/50 border-iha-700 hover:border-slate-500'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${layer.isVisible ? 'bg-blue-500 text-white' : 'bg-iha-800 text-slate-500'}`}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {layer.isVisible ? 'visibility' : 'visibility_off'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${layer.isVisible ? 'text-white' : 'text-slate-400'}`}>{layer.name}</p>
                                                <p className="text-[9px] text-slate-500">{layer.addedDate}</p>
                                            </div>
                                        </div>
                                        {layer.isVisible && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-600 italic pl-4">{t('common.noDataInCategory')}</p>
                        )}
                    </div>
                ))}

                {/* Uncategorized Fallback */}
                {layersByCategory['uncategorized'] && layersByCategory['uncategorized'].length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-iha-700 pb-1 mb-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('common.other')}</h4>
                        </div>
                        <div className="grid gap-2">
                            {layersByCategory['uncategorized'].map(layer => (
                                <div 
                                    key={layer.id} 
                                    onClick={() => toggleLayerVisibility(layer.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${layer.isVisible ? 'bg-iha-900 border-blue-500/50 shadow-md' : 'bg-iha-900/50 border-iha-700 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${layer.isVisible ? 'bg-blue-500 text-white' : 'bg-iha-800 text-slate-500'}`}>
                                            <span className="material-symbols-outlined text-lg">
                                                {layer.isVisible ? 'visibility' : 'visibility_off'}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-bold ${layer.isVisible ? 'text-white' : 'text-slate-400'}`}>{layer.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.externalLayers.length === 0 && (
                    <div className="p-8 text-center text-slate-500 border-2 border-dashed border-iha-700 rounded-xl">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">layers_clear</span>
                        <p className="text-xs">{t('common.noLayerUploaded')}</p>
                        <p className="text-[10px] mt-2 text-slate-600">{t('common.adminUploadHint')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
