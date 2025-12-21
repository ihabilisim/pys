
import React, { useState, useEffect } from 'react';
import { MenuConfig, Language, MenuItemConfig } from '../../../types';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

interface Props {
    menuConfig: MenuConfig;
    setMenuConfig: React.Dispatch<React.SetStateAction<MenuConfig>>;
    lang: Language;
}

// Defined outside component to be accessible for useState type definition
interface FlatMenuItem extends MenuItemConfig {
    depth: number;
    parentId: string | null;
}

export const MenuSettings: React.FC<Props> = ({ lang }) => {
    const { data, updateMenuStructure } = useData();
    const { t, showToast } = useUI();
    // Initialize state with FlatMenuItem[] to support depth and parentId properties
    const [items, setItems] = useState<FlatMenuItem[]>([]);

    useEffect(() => {
        // Convert hierarchical structure to flat list for editing
        const flatten = (nodes: MenuItemConfig[], depth = 0, parentId: string | null = null): FlatMenuItem[] => {
            let flat: FlatMenuItem[] = [];
            nodes.forEach(node => {
                flat.push({ ...node, depth, parentId });
                if (node.children && node.children.length > 0) {
                    flat = flat.concat(flatten(node.children, depth + 1, node.id));
                }
            });
            return flat;
        };
        
        // Sort by order before flattening
        const sorted = sortItemsRecursive([...data.menuStructure]);
        setItems(flatten(sorted));
    }, [data.menuStructure]);

    const sortItemsRecursive = (nodes: MenuItemConfig[]): MenuItemConfig[] => {
        return nodes.sort((a, b) => a.order - b.order).map(node => ({
            ...node,
            children: node.children ? sortItemsRecursive(node.children) : []
        }));
    };

    // Reconstruct tree from flat list
    const buildTree = (flatItems: FlatMenuItem[]): MenuItemConfig[] => {
        const root: MenuItemConfig[] = [];
        const map: Record<string, MenuItemConfig> = {};

        // First pass: create nodes
        flatItems.forEach((item, index) => {
            map[item.id] = { 
                id: item.id, 
                label: item.label, 
                icon: item.icon, 
                visible: item.visible, 
                order: index, 
                children: [] 
            };
        });

        // Second pass: connect tree
        flatItems.forEach((item) => {
            if (item.depth === 0) {
                root.push(map[item.id]);
            } else {
                // Logic: Find the first item ABOVE this one that has depth = item.depth - 1
                let parentFound = false;
                const currentIndex = flatItems.findIndex(i => i.id === item.id);
                
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (flatItems[i].depth === item.depth - 1) {
                        map[flatItems[i].id].children?.push(map[item.id]);
                        parentFound = true;
                        break;
                    }
                }
                if (!parentFound) root.push(map[item.id]);
            }
        });

        return root;
    };

    const handleLabelChange = (id: string, l: Language, value: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, label: { ...item.label, [l]: value } } : item));
    };
    
    const handleIconChange = (id: string, value: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, icon: value } : item));
    };

    const toggleVisibility = (id: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setItems(newItems);
    };

    const indentItem = (index: number) => {
        if (index === 0) return; 
        const prevItem = items[index - 1];
        const currentItem = items[index];

        if (currentItem.depth >= 2) {
            showToast("Maksimum derinliğe ulaşıldı.", "info");
            return;
        }
        if (prevItem.depth < currentItem.depth) return; 

        const newItems = [...items];
        newItems[index] = { ...currentItem, depth: currentItem.depth + 1 };
        setItems(newItems);
    };

    const outdentItem = (index: number) => {
        const currentItem = items[index];
        if (currentItem.depth === 0) return;

        const newItems = [...items];
        newItems[index] = { ...currentItem, depth: currentItem.depth - 1 };
        setItems(newItems);
    };

    // --- NEW: Add Item ---
    const handleAddItem = () => {
        const newItem: FlatMenuItem = {
            id: `custom_${Date.now()}`,
            label: { tr: 'Yeni Menü', en: 'New Menu', ro: 'Meniu Nou' },
            icon: 'circle',
            visible: true,
            order: items.length,
            children: [],
            depth: 0,
            parentId: null
        };
        setItems(prev => [...prev, newItem]);
        setTimeout(() => {
            const el = document.getElementById('menu-list-end');
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // --- UPDATED: Delete Item (Recursive) ---
    const handleDeleteItem = (index: number) => {
        if(!window.confirm("Bu menü öğesini ve varsa alt menülerini silmek istediğinize emin misiniz?")) return;
        
        const itemDepth = items[index].depth;
        let countToDelete = 1;

        // Check for children (items immediately following with higher depth)
        for (let i = index + 1; i < items.length; i++) {
            if (items[i].depth > itemDepth) {
                countToDelete++;
            } else {
                break;
            }
        }

        const newItems = [...items];
        newItems.splice(index, countToDelete);
        setItems(newItems);
    };

    const handleSave = () => {
        const tree = buildTree(items);
        updateMenuStructure(tree);
        showToast('Menü yapısı ve hiyerarşi güncellendi.', 'success');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <div className="flex gap-3 items-start">
                    <span className="material-symbols-outlined text-blue-400">account_tree</span>
                    <div>
                        <p className="text-xs text-blue-200 leading-relaxed font-bold mb-1">
                            Menü Yapılandırması
                        </p>
                        <p className="text-[10px] text-blue-200/70 max-w-md">
                            Sıralama için <strong>Yukarı/Aşağı</strong>, Alt menü yapmak için <strong>Sağ Ok</strong>, Ana menü yapmak için <strong>Sol Ok</strong> kullanın.
                        </p>
                    </div>
                </div>
                <button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Yeni Ekle
                </button>
            </div>

            <div className="space-y-2">
                {items.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`
                            relative flex items-center gap-2 p-2 rounded-xl border transition-all duration-300
                            ${item.visible ? 'bg-iha-900 border-iha-700' : 'bg-slate-900/50 border-slate-800 opacity-60'}
                            hover:border-iha-blue/30
                        `}
                        style={{ marginLeft: `${item.depth * 32}px` }}
                    >
                        {/* Hierarchy Lines */}
                        {item.depth > 0 && (
                            <div className="absolute -left-4 top-1/2 w-4 h-px bg-slate-600"></div>
                        )}
                        {item.depth > 0 && (
                            <div className="absolute -left-4 top-0 h-1/2 w-px bg-slate-600"></div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-5 h-5 flex items-center justify-center rounded bg-iha-800 hover:bg-iha-700 text-slate-400 disabled:opacity-20"><span className="material-symbols-outlined text-xs">expand_less</span></button>
                            <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="w-5 h-5 flex items-center justify-center rounded bg-iha-800 hover:bg-iha-700 text-slate-400 disabled:opacity-20"><span className="material-symbols-outlined text-xs">expand_more</span></button>
                        </div>

                        {/* Indent/Outdent Controls */}
                        <div className="flex gap-1 mr-2">
                            <button onClick={() => outdentItem(index)} disabled={item.depth === 0} className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 disabled:opacity-20 border border-slate-700" title="Sola Taşı"><span className="material-symbols-outlined text-xs">chevron_left</span></button>
                            <button onClick={() => indentItem(index)} disabled={index === 0 || item.depth >= 2} className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 disabled:opacity-20 border border-slate-700" title="Sağa Taşı"><span className="material-symbols-outlined text-xs">chevron_right</span></button>
                        </div>

                        {/* Icon Input */}
                        <div className="relative group/icon" title="Material Icon Adı">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer ${item.visible ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                            </div>
                            <input 
                                value={item.icon}
                                onChange={(e) => handleIconChange(item.id, e.target.value)}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" // invisible overlay input if we had a picker, for now simple text input below
                            />
                            {/* Simple text input for icon editing */}
                            <input 
                                value={item.icon}
                                onChange={(e) => handleIconChange(item.id, e.target.value)}
                                className="absolute -bottom-8 left-0 w-20 bg-iha-900 border border-iha-700 text-[9px] text-white p-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity z-20"
                            />
                        </div>

                        {/* Labels */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {['tr', 'en', 'ro'].map(l => (
                                <div key={l} className="relative">
                                    <span className="absolute left-2 top-1.5 text-[8px] text-slate-500 font-bold uppercase">{l}</span>
                                    <input 
                                        value={(item.label as any)[l]} 
                                        onChange={(e) => handleLabelChange(item.id, l as Language, e.target.value)}
                                        className="w-full bg-iha-800 border border-iha-700 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <button onClick={() => toggleVisibility(item.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.visible ? 'text-green-400 bg-green-500/10' : 'text-slate-600 bg-slate-800'}`}>
                                <span className="material-symbols-outlined text-base">{item.visible ? 'visibility' : 'visibility_off'}</span>
                            </button>
                            <button onClick={() => handleDeleteItem(index)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-red-400 hover:bg-red-500/20 bg-slate-800">
                                <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
                <div id="menu-list-end" />
            </div>

            <div className="sticky bottom-6 flex justify-end animate-in slide-in-from-bottom-4 pt-4 border-t border-iha-700 bg-iha-800/90 backdrop-blur pb-2">
                <button 
                    onClick={handleSave} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-900/50 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">save_as</span>
                    Yapıyı Kaydet
                </button>
            </div>
        </div>
    );
};
