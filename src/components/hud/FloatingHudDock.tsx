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
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const is3D = viewMode === '3D';

  const toggle3D = () => {
    onChangeViewMode(is3D ? 'PDF' : '3D');
  };

  return (
    <>
      {/* ============================================================
          MOBILE FLOATING CONTROLS (Viewport < 640px)
          Categories and Status directly visible on screen without popup
          ============================================================ */}
      <div className="fixed bottom-3 left-2.5 right-2.5 z-30 sm:hidden pointer-events-auto flex flex-col items-center gap-1.5">
        
        {/* Direct Active Legend Chip - Always visible without clicking any layers button */}
        <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c]/95 border border-white/15 backdrop-blur-xl shadow-xl text-[10px] font-bold text-slate-200 tracking-wide select-none">
          {showStatus ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                <span className="text-emerald-300">Available</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
                <span className="text-amber-300">On Hold</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shadow-[0_0_6px_#dc2626]" />
                <span className="text-rose-300">Sold</span>
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_6px_#eab308]" />
                <span className="text-yellow-300">Gold</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_6px_#ec4899]" />
                <span className="text-pink-300">Platinum</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
                <span className="text-cyan-300">Diamond</span>
              </span>
            </>
          )}
        </div>

        {/* Mobile Action Dock: 1-tap direct toggles for Categories and Status */}
        <div className="w-full flex items-center justify-between gap-1 p-1 rounded-2xl bg-[#1c1c1c]/95 border border-white/15 backdrop-blur-2xl shadow-2xl">
          {/* 1. Direct Categories Button */}
          <button
            onClick={onToggleCategories}
            className={`flex-1 h-9 px-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
              showCategories
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-[#262626] text-slate-300 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showCategories ? 'bg-cyan-300' : 'bg-slate-500'}`} />
            <span>Categories</span>
          </button>

          {/* 2. Direct Status Button */}
          <button
            onClick={onToggleStatus}
            className={`flex-1 h-9 px-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
              showStatus
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'bg-[#262626] text-slate-300 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showStatus ? 'bg-emerald-300' : 'bg-slate-500'}`} />
            <span>Status</span>
          </button>

          {/* 3. Search Trigger Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`h-9 px-2.5 rounded-xl text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1 ${
              isMobileSearchOpen
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-[#262626] text-slate-200'
            }`}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search</span>
          </button>

          {/* 4. 3D Mode Toggle */}
          <button
            onClick={toggle3D}
            className={`h-9 px-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
              is3D
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                : 'bg-[#262626] text-white'
            }`}
          >
            3D
          </button>

          {/* 5. Satellite Map Button */}
          <button
            onClick={onOpenMapView}
            className="h-9 px-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 active:scale-95 text-white text-[11px] font-bold shadow-md flex items-center gap-1"
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span>Map</span>
          </button>

          {/* 6. Share Button */}
          <button
            onClick={onShare}
            className="w-9 h-9 rounded-xl bg-[#262626] active:scale-95 text-slate-300 flex items-center justify-center shrink-0"
            title="Share"
          >
            <IconShare size={14} />
          </button>
        </div>
      </div>

      {/* MOBILE POPUP: Search Bar Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed bottom-24 left-3 right-3 z-30 sm:hidden pointer-events-auto animate-scale-in">
          <div className="p-3 rounded-2xl bg-[#1c1c1c]/98 border border-white/15 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Search Plot or Size</span>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <PlotSearchTypeahead
              onSelectPlot={(p) => {
                onSelectPlot(p);
                setIsMobileSearchOpen(false);
              }}
              onSelectRange={(min, max, plots) => {
                onSelectRange?.(min, max, plots);
                setIsMobileSearchOpen(false);
              }}
              searchRef={searchRef}
            />
          </div>
        </div>
      )}

      {/* ============================================================
          DESKTOP FLOATING HUD DOCK (Viewport >= 640px)
          ============================================================ */}
      <div className="fixed bottom-6 right-6 z-30 hidden sm:flex flex-col items-end pointer-events-none gap-2.5">
        {/* Toggle Collapse Button on Desktop */}
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="pointer-events-auto p-2 rounded-full bg-[#1c1c1c]/95 text-white border border-white/15 shadow-xl backdrop-blur-md hover:bg-[#2c2c2c] transition-all"
          title="Toggle Controls Panel"
        >
          <IconLayers size={18} />
        </button>

        {/* 1. TOP MINI DOCK ROW: [ 3D | Share | Compass ] */}
        <div
          className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#1c1c1c]/95 border border-white/10 shadow-2xl backdrop-blur-xl transition-all ${
            isDesktopCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
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

          <button
            onClick={onShare}
            className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#323232] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Share Masterplan"
          >
            <IconShare size={16} />
          </button>

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

        {/* 2. MAIN DOCK CONTAINER (Desktop) */}
        <div
          className={`pointer-events-auto w-[320px] rounded-2xl p-2.5 flex flex-col gap-2 shadow-2xl border border-white/10 bg-[#1c1c1c]/95 backdrop-blur-2xl transition-all duration-300 ${
            isDesktopCollapsed ? 'opacity-0 scale-95 pointer-events-none h-0 p-0 overflow-hidden' : 'opacity-100 scale-100'
          }`}
        >
          {/* Categories Toggle */}
          <div
            id="toggle-categories-btn"
            onClick={onToggleCategories}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#2d2d2d] cursor-pointer transition-all select-none"
          >
            <span className="text-[13px] font-semibold text-white tracking-wide">
              Categories
            </span>
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${showCategories ? 'bg-[#0070f3]' : 'bg-[#3e3e3e]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${showCategories ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </div>
          </div>

          {/* Status Toggle */}
          <div
            id="toggle-status-btn"
            onClick={onToggleStatus}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#2d2d2d] cursor-pointer transition-all select-none"
          >
            <span className="text-[13px] font-semibold text-white tracking-wide">
              Status
            </span>
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${showStatus ? 'bg-[#0070f3]' : 'bg-[#3e3e3e]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${showStatus ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="w-full">
            <PlotSearchTypeahead
              onSelectPlot={onSelectPlot}
              onSelectRange={onSelectRange}
              searchRef={searchRef}
            />
          </div>

          {/* Map View Satellite Button */}
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

          {/* Legend Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {showStatus ? (
              <>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <span>On Hold</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  <span>Sold</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                  <span>Gold</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.7)]" />
                  <span>Platinum</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-slate-200 border border-white/5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
                  <span>Diamond</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
