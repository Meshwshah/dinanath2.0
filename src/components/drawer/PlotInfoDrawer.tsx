import React from 'react';
import type { PlotData } from '../../types/masterplan';
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconWhatsApp,
  IconPhone,
  IconShare,
} from '../common/Icons';
import { SITE } from '../../data/siteConfig';

interface PlotInfoDrawerProps {
  plot: PlotData | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevPlot: () => void;
  onNextPlot: () => void;
  onOpenInquiry: (plot: PlotData) => void;
  onShare: (plot: PlotData) => void;
}

export const PlotInfoDrawer: React.FC<PlotInfoDrawerProps> = ({
  plot,
  isOpen,
  onClose,
  onPrevPlot,
  onNextPlot,
  onOpenInquiry,
  onShare,
}) => {
  if (!plot) return null;

  const zoneColor =
    plot.zone === 'Gold'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : plot.zone === 'Platinum'
      ? 'text-pink-400 border-pink-500/30 bg-pink-500/10'
      : 'text-sky-400 border-sky-500/30 bg-sky-500/10';

  const statusColor =
    plot.status === 'Available'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : plot.status === 'On Hold'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <>
      {/* ============================================================
          DESKTOP LEFT SLIDE-OUT DRAWER (min-width: 768px)
          ============================================================ */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 hidden md:flex flex-col w-[380px] h-full bg-slate-950/85 backdrop-blur-2xl border-r border-white/10 shadow-2xl text-white transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Close and Navigation */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPlot}
              title="Previous Plot (Left Arrow)"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={onNextPlot}
              title="Next Plot (Right Arrow)"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <IconChevronRight size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 ml-1">
              Plot {plot.number} of 69
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(plot)}
              title="Share Plot Link"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <IconShare size={15} />
            </button>
            <button
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors flex items-center justify-center"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          {/* Title and Badges */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${zoneColor}`}>
                {plot.zone} Zone
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {plot.status}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              {plot.label}
              <span className="text-sm font-normal text-slate-400 font-mono">
                {SITE.village}, Karjan
              </span>
            </h1>
          </div>

          {/* Dual Stat Area Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Plot Area
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {plot.areaSmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] font-mono text-slate-500">SQ. METERS (SMT)</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Imperial Area
              </span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {plot.areaSft.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] font-mono text-slate-500">SQ. FEET (SFT)</span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3.5 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">Dimensions</span>
              <span className="font-mono font-semibold text-slate-200">{plot.dimensions.label}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Road Frontage</span>
              <span className="font-semibold text-right text-slate-200 max-w-[200px] truncate text-xs" title={plot.roadFrontage}>
                {plot.roadFrontage}
              </span>
            </div>
          </div>

          {/* Plot Features Tags */}
          {plot.features && plot.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Key Highlights
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {plot.features.map((feat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-medium"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-slate-950/70 space-y-2.5">
          <button
            onClick={() => onOpenInquiry(plot)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold tracking-wide shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <IconWhatsApp size={18} />
            <span>Inquire About This Plot</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${SITE.contactPhone.replace(/\s+/g, '')}`}
              className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
              title={`Call: ${SITE.contactPhone}`}
            >
              <IconPhone size={12} className="text-cyan-400 shrink-0" />
              <span className="truncate">{SITE.contactPhone}</span>
            </a>
            <a
              href={`tel:${SITE.contactPhone2.replace(/\s+/g, '')}`}
              className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
              title={`Call: ${SITE.contactPhone2}`}
            >
              <IconPhone size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate">{SITE.contactPhone2}</span>
            </a>
          </div>
        </div>
      </aside>

      {/* ============================================================
          MOBILE BOTTOM SHEET (max-width: 767px)
          ============================================================ */}
      <aside
        className={`fixed left-0 right-0 bottom-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/15 rounded-t-2xl shadow-2xl text-white transition-transform duration-400 cubic-bezier(0.22, 1, 0.36, 1) max-h-[38vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Mobile Header */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{plot.label}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${statusColor}`}>
              {plot.status}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${zoneColor}`}>
              {plot.zone}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(plot)}
              className="p-1.5 rounded-lg bg-white/5 text-slate-300"
            >
              <IconShare size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 text-slate-300"
            >
              <IconX size={15} />
            </button>
          </div>
        </div>

        {/* Mobile Metrics & Specs */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400">AREA (SMT)</span>
              <div className="text-base font-bold font-mono text-cyan-400">{plot.areaSmt.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400">AREA (SQFT)</span>
              <div className="text-base font-bold font-mono text-amber-400">{plot.areaSft.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-300 border-b border-white/5 pb-1.5">
            <span>Dimensions</span>
            <span className="font-mono font-semibold">{plot.dimensions.label}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-300 border-b border-white/5 pb-1.5">
            <span>Road</span>
            <span className="truncate max-w-[180px] font-medium text-right">{plot.roadFrontage}</span>
          </div>

          <button
            onClick={() => onOpenInquiry(plot)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <IconWhatsApp size={16} />
            <span>Inquire on WhatsApp</span>
          </button>
        </div>
      </aside>
    </>
  );
};
