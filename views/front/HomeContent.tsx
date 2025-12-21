
import React from 'react';
import { DashboardContent } from './DashboardContent';
import { DashboardBottomContent } from './DashboardBottomContent';

export const HomeContent: React.FC = () => {
    return (
        <div className="space-y-0">
            <DashboardContent />
            <DashboardBottomContent />
        </div>
    );
};
