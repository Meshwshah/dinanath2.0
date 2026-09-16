import React from 'react';
import type { PlotData, ViewMode, CategoryFilter } from '../../types/masterplan';
import { PlotSearchTypeahead } from './PlotSearchTypeahead';
import { IconShare } from '../common/Icons';

interface FloatingHudDockProps {
  plots?: PlotData[];
  showCategories: boolean;
  activeCategory?: CategoryFilter;
  onSelectCategory?: (cat: CategoryFilter) => void;
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
  plots,
  showCategories,
  activeCategory = null,
  onSelectCategory,
  showStatus,
  onToggleCategories,
  onToggleStatus,
  onSelectPlot,
  onSelectRange,
  onOpenMapView,
  onShare,
  onReset,
  searchRef,
}) => {
  const allPlots = plots || [];
  const industrialPlots = allPlots.filter(p => !p.id.startsWith('common-'));
  const countAvailable = industrialPlots.filter(p => p.status === 'Available').length;
  const countOnHold = industrialPlots.filter(p => p.status === 'On Hold').length;
  const countSold = industrialPlots.filter(p => p.status === 'Sold').length;

  const countGold = industrialPlots.filter(p => p.zone === 'Gold').length;
  const countPlatinum = industrialPlots.filter(p => p.zone === 'Platinum').length;
  const countDiamond = industrialPlots.filter(p => p.zone === 'Diamond').length;

  return (
    <>
      {/* ============================================================
          TOP FLOATING STATUS BANNER (Visible on all devices when Status is ON)
          Unambiguously explains: Green = Available, Yellow = On Hold, Red = Sold
          ============================================================ */}
      {showStatus && (
        <div className="fixed top-[60px] sm:top-[74px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 sm:gap-3.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#12151d]/95 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-200 select-none max-w-[96vw] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-400 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.9)] shrink-0" />
            <span>Green = Available</span>
            <span className="text-[10px] sm:text-xs text-emerald-300/80 font-mono">({countAvailable})</span>
          </div>
          <span className="w-px h-3.5 bg-white/20 shrink-0" />
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-400 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.9)] shrink-0" />
            <span>Yellow = On Hold</span>
            <span className="text-[10px] sm:text-xs text-amber-300/80 font-mono">({countOnHold})</span>
          </div>
          <span className="w-px h-3.5 bg-white/20 shrink-0" />
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-rose-400 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.9)] shrink-0" />
            <span>Red = Sold</span>
            <span className="text-[10px] sm:text-xs text-rose-300/80 font-mono">({countSold})</span>
          </div>
        </div>
      )}

      {/* ============================================================
          MOBILE FLOATING CONTROLS (Viewport < 640px)
          Search bar positioned directly ABOVE the buttons for 1-tap access
          ============================================================ */}
      <div className="fixed bottom-3 left-2.5 right-2.5 z-30 sm:hidden pointer-events-auto flex flex-col items-center gap-1.5">
        
        {/* Mobile Status Legend Pill (Appears directly in dock when Status is ON) */}
        {showStatus && (
          <div className="w-full flex items-center justify-around py-1.5 px-2.5 rounded-2xl bg-[#1c1c1c]/95 border border-emerald-500/30 backdrop-blur-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 select-none text-[11px] font-bold">
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)] shrink-0" />
              <span>Available ({countAvailable})</span>
            </div>
            <div className="w-px h-3 bg-white/15" />
            <div className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
              <span>On Hold ({countOnHold})</span>
            </div>
            <div className="w-px h-3 bg-white/15" />
            <div className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shadow-[0_0_6px_rgba(220,38,38,0.8)] shrink-0" />
              <span>Sold ({countSold})</span>
            </div>
          </div>
        )}

        {/* 1. Mobile Search Bar */}
        <div className="w-full">
          <PlotSearchTypeahead
            plots={plots}
            onSelectPlot={onSelectPlot}
            onSelectRange={onSelectRange}
            searchRef={searchRef}
          />
        </div>

        {/* 2. Mobile Category & Status Quick Pills - 1-tap direct access */}
        <div className="w-full flex items-center justify-between gap-1 p-1 rounded-2xl bg-[#1c1c1c]/95 border border-white/15 backdrop-blur-2xl shadow-xl overflow-x-auto no-scrollbar">
          {/* All Categories */}
          <button
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(activeCategory === 'all' ? null : 'all');
              } else {
                onToggleCategories();
              }
            }}
            className={`flex-1 h-8 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 ${
              activeCategory === 'all' || (showCategories && !activeCategory)
                ? 'bg-white/25 text-white border border-white/30 shadow-sm'
                : 'bg-[#262626] text-slate-300'
            }`}
          >
            <span>All</span>
          </button>

          {/* Gold */}
          <button
            onClick={() => onSelectCategory && onSelectCategory(activeCategory === 'gold' ? null : 'gold')}
            className={`flex-1 h-8 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 ${
              activeCategory === 'gold'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm'
                : 'bg-[#262626] text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
            <span>Gold</span>
          </button>

          {/* Platinum */}
          <button
            onClick={() => onSelectCategory && onSelectCategory(activeCategory === 'platinum' ? null : 'platinum')}
            className={`flex-1 h-8 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 ${
              activeCategory === 'platinum'
                ? 'bg-pink-500/30 text-pink-200 border border-pink-500/50 shadow-sm'
                : 'bg-[#262626] text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
            <span>Plat</span>
          </button>

          {/* Diamond */}
          <button
            onClick={() => onSelectCategory && onSelectCategory(activeCategory === 'diamond' ? null : 'diamond')}
            className={`flex-1 h-8 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 ${
              activeCategory === 'diamond'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 shadow-sm'
                : 'bg-[#262626] text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <span>Dia</span>
          </button>

          {/* Status Toggle */}
          <button
            onClick={onToggleStatus}
            className={`flex-1 h-8 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1 ${
              showStatus
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#262626] text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showStatus ? 'bg-emerald-300' : 'bg-slate-500'}`} />
            <span>Status</span>
          </button>
        </div>

        {/* 3. Mobile Action Dock: Map, Share, Reset View */}
        <div className="w-full flex items-center justify-between gap-1 p-1 rounded-2xl bg-[#1c1c1c]/95 border border-white/15 backdrop-blur-2xl shadow-2xl">
          {/* Satellite Map Button */}
          <button
            onClick={onOpenMapView}
            className="flex-1 h-9 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 active:scale-95 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span>Real Map</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="h-9 px-3 rounded-xl bg-[#262626] active:scale-95 text-slate-300 flex items-center justify-center gap-1 text-xs font-semibold"
            title="Share"
          >
            <IconShare size={13} />
            <span>Share</span>
          </button>

          {/* Orient North / Reset View */}
          <button
            onClick={onReset}
            className="h-9 px-3 rounded-xl bg-[#262626] active:scale-90 text-cyan-400 flex items-center justify-center gap-1 text-xs font-semibold"
            title="Reset View"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          DESKTOP FLOATING HUD DOCK (Viewport >= 640px)
          ============================================================ */}
      <div className="fixed bottom-6 right-6 z-30 hidden sm:flex flex-col items-end pointer-events-none gap-2.5">
        {/* 1. TOP MINI DOCK ROW: [ Share | Compass / Reset ] */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#1c1c1c]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#323232] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Share Masterplan"
          >
            <IconShare size={16} />
          </button>

          <button
            onClick={onReset}
            className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#323232] text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Orient North / Reset View"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2" />
            </svg>
          </button>
        </div>

        {/* 2. MAIN DOCK CONTAINER (Desktop) */}
        <div className="pointer-events-auto w-[320px] rounded-2xl p-2.5 flex flex-col gap-2 shadow-2xl border border-white/10 bg-[#1c1c1c]/95 backdrop-blur-2xl">
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
              plots={plots}
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
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-emerald-300 border border-emerald-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)] shrink-0" />
                  <span>Available ({countAvailable})</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-amber-300 border border-amber-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" />
                  <span>On Hold ({countOnHold})</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-rose-300 border border-rose-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.8)] shrink-0" />
                  <span>Sold ({countSold})</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-amber-300 border border-amber-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.7)] shrink-0" />
                  <span>Gold ({countGold})</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-pink-300 border border-pink-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.7)] shrink-0" />
                  <span>Platinum ({countPlatinum})</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#262626] text-[11px] font-semibold text-cyan-300 border border-cyan-500/20 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.7)] shrink-0" />
                  <span>Diamond ({countDiamond})</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
