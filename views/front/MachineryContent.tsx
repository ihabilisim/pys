
import React from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { MachineryWidget } from '../../components/Analytics';

export const MachineryContent: React.FC = () => {
  const { data } = useData();
  const { language } = useUI();

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
          <MachineryWidget stats={data.dashboardWidgets.machinery} lang={language} />
      </div>
  );
};
