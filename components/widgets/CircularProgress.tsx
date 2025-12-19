
import React from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label: string;
  subLabel?: string;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  size = 120, 
  strokeWidth = 10, 
  label, 
  subLabel,
  color = '#3b82f6' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 transition-all duration-1000 ease-out"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#334155" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-white font-mono">{Math.round(value)}%</span>
        {subLabel && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{subLabel}</span>}
      </div>
      <div className="absolute -bottom-8 w-40 text-center"><p className="text-xs font-bold text-slate-300">{label}</p></div>
    </div>
  );
};
