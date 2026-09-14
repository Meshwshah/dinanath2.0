import React, { useState } from 'react';
import type { PlotData, ViewMode } from '../../types/masterplan';
import { PlotSearchTypeahead } from './PlotSearchTypeahead';
import { IconShare, IconLayers } from '../common/Icons';

interface FloatingHudDockProps {
  showCategories: boolean;
  showStatus: boolean;
  onToggleCategories: () => void;
  onToggleStatus: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onSelectPlot: (plot: PlotData) => void;
  onSelectRange?: (min: number, max: number, plots: PlotData[]) => void;
  onOpenMapView: () => void;
  onShare: () => void;
  onReset: () => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

export const FloatingHudDock: React.FC<FloatingHudDockProps> = ({
  showCategories,
  showStatus,
  onToggleCategories,
  onToggleStatus,
  viewMode,
  onChangeViewMode,
  onSelectPlot,
  onSelectRange,
  onOpenMapView,
  onShare,
  onReset,
  searchRef,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const is3D = viewMode === '3D';

  const toggle3D = () => {
    onChangeViewMode(is3D ? 'PDF' : '3D');
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end pointer-events-none gap-2.5">
      {/* Mobile Toggle Button for HUD if collapsed */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto sm:hidden p-2.5 rounded-full bg-[#1c1c1c]/95 text-white border border-white/15 shadow-xl backdrop-blur-md"
        title="Toggle Controls"
      >
        <IconLayers size={18} />
      </button>

      {/* 1. TOP MINI DOCK ROW: [ 3D | Share | Compass ] */}
      <div
        className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#1c1c1c]/95 border border-white/10 shadow-2xl backdrop-blur-xl ${
          isCollapsed ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* 3D Mode Toggle */}
        <button
          onClick={toggle3D}
          className={`h-10 px-3.5 rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 shadow-sm flex items-center justify-center ${
            is3D
              ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/25'
              : 'bg-[#262626] hover:bg-[#323232] text-white'
          }`}
          title="Toggle 3D View"
        >
          3D
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#323232] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
          title="Share Masterplan"
        >
          <IconShare size={16} />
        </button>

        {/* Compass / North Arrow & Reset */}
        <button
          onClick={onReset}
          className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#323232] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
          title="Orient North / Reset View"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </button>
      </div>

      {/* 2. MAIN DOCK CONTAINER: [ Categories toggle | Status toggle | Search bar | Map View | Category chips ] */}
      <div
        className={`pointer-events-auto w-[92vw] sm:w-[320px] rounded-2xl p-2.5 flex flex-col gap-2 shadow-2xl border border-white/10 bg-[#1c1c1c]/95 backdrop-blur-2xl transition-all duration-300 ${
          isCollapsed ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* ROW 1: Categories Toggle */}
        <div
          id="toggle-categories-btn"
          onClick={onToggleCategories}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#2d2d2d] cursor-pointer transition-all select-none"
        >
          <span className="text-xs sm:text-[13px] font-semibold text-white tracking-wide">
            Categories
          </span>
          {/* iOS Toggle Pill */}
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              showCategories ? 'bg-[#0070f3]' : 'bg-[#3e3e3e]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                showCategories ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>

        {/* ROW 2: Status Toggle */}
        <div
          id="toggle-status-btn"
          onClick={onToggleStatus}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#2d2d2d] cursor-pointer transition-all select-none"
        >
          <span className="text-xs sm:text-[13px] font-semibold text-white tracking-wide">
            Status
          </span>
          {/* iOS Toggle Pill */}
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              showStatus ? 'bg-[#0070f3]' : 'bg-[#3e3e3e]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                showStatus ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>

        {/* ROW 3: Search Input Bar */}
        <div className="w-full">
          <PlotSearchTypeahead
            onSelectPlot={onSelectPlot}
            onSelectRange={onSelectRange}
            searchRef={searchRef}
          />
        </div>

        {/* ROW 3.5: "Map View" button directly below search */}
        <button
          id="map-view-btn"
          onClick={onOpenMapView}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98] border border-emerald-400/25 group"
          title="Open Satellite Map View with Layout"
        >
          <div className="flex items-center gap-2">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-200 group-hover:scale-110 transition-transform">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span className="tracking-wide">Map View</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-emerald-200 border border-emerald-400/20">
            Satellite
          </span>
        </button>

        {/* ROW 4: Legend Pills: Dynamically displays Categories or Status based on active toggle */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {showStatus ? (
            <>
              {/* Available Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                <span>Available</span>
              </div>

              {/* On Hold Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                <span>On Hold</span>
              </div>

              {/* Sold Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                <span>Sold</span>
              </div>
            </>
          ) : (
            <>
              {/* Gold Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                <span>Gold</span>
              </div>

              {/* Platinum Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] shadow-[0_0_8px_rgba(244,114,182,0.7)]" />
                <span>Platinum</span>
              </div>

              {/* Diamond Chip */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
                <span>Diamond</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

