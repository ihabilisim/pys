
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Permission } from '../../types';

// Import Modular Components
import { DailyLogPanel } from './dashboard/DailyLogPanel';
import { StatsPanel } from './dashboard/StatsPanel';
import { MachineryPanel } from './dashboard/MachineryPanel';
import { ProductionPanel } from './dashboard/ProductionPanel';
import { TimelinePanel } from './dashboard/TimelinePanel';
import { QualityPanel } from './dashboard/QualityPanel';
import { NotificationPanel } from './dashboard/NotificationPanel';

type DashboardSubTab = 'daily' | 'stats' | 'machinery' | 'production' | 'timeline' | 'general' | 'quality';

const PERMISSION_MAP: Record<DashboardSubTab, Permission> = {
    'daily': 'manage_daily_log',
    'stats': 'manage_stats',
    'machinery': 'manage_machinery',
    'production': 'manage_stats',
    'timeline': 'manage_timeline',
    'general': 'manage_notifications',
    'quality': 'manage_quality'
};

export const AdminDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { t } = useUI(); 
    const [dashboardTab, setDashboardTab] = useState<DashboardSubTab>('daily');

    const hasPermission = (perm: Permission) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        return currentUser.permissions.includes(perm);
    };

    return (
        <div className="space-y-6">
            {/* Sub-Nav */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-iha-700 mb-6 custom-scrollbar">
                {[
                    { id: 'daily', label: t('admin.dashboard.tabs.daily'), icon: 'edit_note' },
                    { id: 'stats', label: t('admin.dashboard.tabs.stats'), icon: 'monitoring' },
                    { id: 'machinery', label: t('admin.dashboard.tabs.machinery'), icon: 'agriculture' },
                    { id: 'production', label: t('admin.dashboard.tabs.production'), icon: 'analytics' },
                    { id: 'timeline', label: t('admin.dashboard.tabs.timeline'), icon: 'timeline' },
                    { id: 'quality', label: t('admin.dashboard.tabs.quality'), icon: 'flag' },
                    { id: 'general', label: t('admin.dashboard.tabs.general'), icon: 'campaign' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setDashboardTab(tab.id as DashboardSubTab)}
                        disabled={!hasPermission(PERMISSION_MAP[tab.id as DashboardSubTab])}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                            dashboardTab === tab.id 
                            ? 'bg-iha-blue text-white shadow-md' 
                            : hasPermission(PERMISSION_MAP[tab.id as DashboardSubTab])
                                ? 'bg-iha-800 text-slate-400 hover:bg-iha-700 hover:text-white'
                                : 'bg-iha-900 text-slate-600 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            {dashboardTab === 'daily' && hasPermission('manage_daily_log') && <DailyLogPanel />}
            {dashboardTab === 'stats' && <StatsPanel />}
            {dashboardTab === 'machinery' && <MachineryPanel />}
            {dashboardTab === 'production' && <ProductionPanel />}
            {dashboardTab === 'timeline' && <TimelinePanel />}
            {dashboardTab === 'quality' && hasPermission('manage_quality') && <QualityPanel />}
            {dashboardTab === 'general' && hasPermission('manage_notifications') && <NotificationPanel />}
        </div>
    );
};
