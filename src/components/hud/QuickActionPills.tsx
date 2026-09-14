import React from 'react';
import {
  IconGallery,
  IconInfo,
  IconCompass,
  IconShare,
  IconHome,
} from '../common/Icons';
import { googleMapsDirectionsUrl } from '../../data/siteConfig';

interface QuickActionPillsProps {
  onOpenGallery: () => void;
  onOpenInfo: () => void;
  onShare: () => void;
  onReset: () => void;
}

export const QuickActionPills: React.FC<QuickActionPillsProps> = ({
  onOpenGallery,
  onOpenInfo,
  onShare,
  onReset,
}) => {
  const handleLocateClick = () => {
    window.open(googleMapsDirectionsUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Gallery Pill */}
      <button
        onClick={onOpenGallery}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95"
      >
        <IconGallery size={14} className="text-cyan-400" />
        <span>Gallery</span>
      </button>

      {/* Info Pill */}
      <button
        onClick={onOpenInfo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95"
      >
        <IconInfo size={14} className="text-amber-400" />
        <span>Project Info</span>
      </button>

      {/* Locate Pill */}
      <button
        onClick={handleLocateClick}
        title="Open GPS Directions in Google Maps"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95"
      >
        <IconCompass size={14} className="text-emerald-400" />
        <span>Directions</span>
      </button>

      {/* Share Pill */}
      <button
        onClick={onShare}
        title="Share Masterplan Link"
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-all active:scale-95"
      >
        <IconShare size={14} />
      </button>

      {/* Home / Reset Pill */}
      <button
        onClick={onReset}
        title="Reset Zoom & Selection (Home / Esc)"
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-all active:scale-95"
      >
        <IconHome size={14} />
      </button>
    </div>
  );
};
