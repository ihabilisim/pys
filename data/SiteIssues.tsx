
import type { SiteIssue, MapNote } from '../types';

export const DEMO_ISSUES: SiteIssue[] = [
    { id: '1', type: 'NCR', status: 'OPEN', lat: 45.6420, lng: 24.2690, description: 'Yanlış demir donatı aralığı', reportedDate: '2024-12-08', photoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=300' },
    { id: '2', type: 'SNAG', status: 'CLOSED', lat: 45.6350, lng: 24.2620, description: 'Eksik kalıp yağı', reportedDate: '2024-12-05' }
];

export const DEMO_MAP_NOTES: MapNote[] = [];
