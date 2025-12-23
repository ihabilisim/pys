
import { DashboardWidgets, TimelinePhase } from '../types';

export const DEMO_WIDGETS: DashboardWidgets = {
    hse: {
        accidentFreeDays: 0,
        manHours: 0,
        lastIncidentDate: new Date().toISOString()
    },
    progress: {
        planned: 0,
        actual: 0,
        description: { tr: 'Genel Fiziksel İlerleme', en: 'Overall Physical Progress', ro: 'Progres Fizic General' }
    },
    production: [],
    machinery: [],
    dailyLog: {
        date: new Date().toISOString().split('T')[0],
        summary: { tr: '', en: '', ro: '' },
        weatherNote: '',
        personnelCount: 0
    }
};

export const DEMO_TIMELINE: TimelinePhase[] = [];
