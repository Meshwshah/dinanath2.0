import React from 'react';
import type { ViewMode } from '../../types/masterplan';
import { IconMap } from '../common/Icons';

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  onChangeViewMode,
}) => {
  const modes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'PDF',
      label: 'PDF Plan',
      icon: <IconMap size={13} />,
    },
    {
      id: 'Dark',
      label: 'CAD Dark',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      id: 'Satellite',
      label: 'Satellite',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 overflow-x-auto custom-scrollbar">
      {modes.map(m => {
        const isActive = viewMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChangeViewMode(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              isActive
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
