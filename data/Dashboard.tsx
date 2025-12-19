
import type { DashboardWidgets, TimelinePhase } from '../types';

export const DEMO_WIDGETS: DashboardWidgets = {
    hse: {
      accidentFreeDays: 0, 
      manHours: 254000,
      lastIncidentDate: '2025-01-01T08:00' 
    },
    progress: {
      planned: 18.5,
      actual: 16.2,
      description: {
        tr: 'Genel Fiziksel İlerleme',
        en: 'Overall Physical Progress',
        ro: 'Progres Fizic General'
      }
    },
    production: [
      { 
        id: '1', 
        label: { tr: 'Haftalık Beton', en: 'Weekly Concrete', ro: 'Beton Săptămânal' }, 
        value: 450, 
        target: 600, 
        unit: 'm³', 
        color: '#3b82f6', // Blue
        icon: 'water_drop' 
      },
      { 
        id: '2', 
        label: { tr: 'Haftalık Kazı', en: 'Weekly Excavation', ro: 'Săpătură Săptămânală' }, 
        value: 12500, 
        target: 15000, 
        unit: 'm³', 
        color: '#d97706', // Amber
        icon: 'landscape' 
      }
    ],
    machinery: [
        { id: '1', name: { tr: 'Kamyon', en: 'Dump Trucks', ro: 'Basculante' }, total: 45, active: 40, maintenance: 5, icon: 'local_shipping' },
        { id: '2', name: { tr: 'Ekskavatör', en: 'Excavators', ro: 'Excavatoare' }, total: 12, active: 10, maintenance: 2, icon: 'agriculture' },
        { id: '3', name: { tr: 'Dozer', en: 'Dozers', ro: 'Buldozere' }, total: 8, active: 8, maintenance: 0, icon: 'grading' },
    ],
    dailyLog: {
        date: new Date().toISOString().split('T')[0],
        summary: {
            tr: "KM 12+000 - 13+000 arası dolgu çalışmaları devam ediyor. Viyadük-3'te ayak betonu döküldü.",
            en: "Fill works continue between KM 12+000 - 13+000. Pier concrete poured at Viaduct-3.",
            ro: "Lucrările de umplutură continuă între KM 12+000 - 13+000. Beton turnat la pilonul Viaduct-3."
        },
        weatherNote: "Sunny, 18C",
        personnelCount: 342
    }
};

export const DEMO_TIMELINE: TimelinePhase[] = [
    { id: 1, label: { tr: 'Mobilizasyon', en: 'Mobilization', ro: 'Mobilizare' }, status: 'COMPLETED', percentage: 100, startDate: '2024-01-01', endDate: '2024-03-01', startKm: 0, endKm: 15 },
    { id: 2, label: { tr: 'Tasarım', en: 'Design', ro: 'Proiectare' }, status: 'COMPLETED', percentage: 100, startDate: '2024-02-01', endDate: '2024-06-01', startKm: 0, endKm: 15 },
    { id: 3, label: { tr: 'Toprak İşleri', en: 'Earthworks', ro: 'Lucrări de pământ' }, status: 'IN_PROGRESS', percentage: 45, startDate: '2024-05-01', endDate: '2025-05-01', startKm: 0, endKm: 10 },
    { id: 4, label: { tr: 'Sanat Yapıları', en: 'Structures', ro: 'Structuri' }, status: 'IN_PROGRESS', percentage: 30, startDate: '2024-07-01', endDate: '2025-08-01', startKm: 5, endKm: 12 },
    { id: 5, label: { tr: 'Drenaj', en: 'Drainage', ro: 'Drenaj' }, status: 'IN_PROGRESS', percentage: 20, startDate: '2024-09-01', endDate: '2025-06-01', startKm: 0, endKm: 8 },
    { id: 6, label: { tr: 'Üstyapı', en: 'Superstructure', ro: 'Suprastructură' }, status: 'PENDING', percentage: 0, startDate: '2025-04-01', endDate: '2025-10-01', startKm: 0, endKm: 5 },
    { id: 7, label: { tr: 'Asfalt', en: 'Asphalt', ro: 'Asfalt' }, status: 'PENDING', percentage: 0, startDate: '2025-06-01', endDate: '2025-11-01', startKm: 0, endKm: 5 },
    { id: 8, label: { tr: 'Yol İşaretleme', en: 'Marking', ro: 'Marcaje' }, status: 'PENDING', percentage: 0, startDate: '2025-10-01', endDate: '2025-12-01', startKm: 0, endKm: 15 },
];
