
import type { StockItem, BoQItem } from '../types';

export const DEMO_STOCKS: StockItem[] = [
    { id: '1', name: { tr: 'Çimento', en: 'Cement', ro: 'Ciment' }, currentQuantity: 150, criticalLevel: 200, unit: 'Ton', icon: 'architecture' },
    { id: '2', name: { tr: 'İnşaat Demiri (Ø16)', en: 'Rebar (Ø16)', ro: 'Armătură (Ø16)' }, currentQuantity: 450, criticalLevel: 100, unit: 'Ton', icon: 'grid_4x4' },
    { id: '3', name: { tr: 'Agrega', en: 'Aggregate', ro: 'Agregate' }, currentQuantity: 5000, criticalLevel: 1000, unit: 'm³', icon: 'landscape' },
];

export const DEMO_BOQ: BoQItem[] = [
    { id: '1', code: 'EW-01', name: { tr: 'Genel Kazı', en: 'General Excavation', ro: 'Săpătură Generală' }, totalQuantity: 1500000, completedQuantity: 450000, unit: 'm³' },
    { id: '2', code: 'ST-05', name: { tr: 'C30/37 Beton', en: 'C30/37 Concrete', ro: 'Beton C30/37' }, totalQuantity: 85000, completedQuantity: 12000, unit: 'm³' },
];
