import React from 'react';
import { SITE, googleMapsDirectionsUrl } from '../../data/siteConfig';
import { IconGallery, IconInfo } from './Icons';

interface HeaderBarProps {
  onOpenGallery: () => void;
  onOpenInfo: () => void;
  onOpenContact: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenGallery,
  onOpenInfo,
  onOpenContact,
}) => {
  const handleDirections = () => {
    window.open(googleMapsDirectionsUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-2.5 sm:p-4 flex items-center justify-between gap-2">
      {/* Brand Identity Card */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1c1c1c]/95 border border-white/10 backdrop-blur-xl shadow-2xl transition-all max-w-[190px] sm:max-w-none shrink-0">
        <div className="h-8 sm:h-10 px-1 py-0.5 rounded-xl bg-white shadow-md flex items-center justify-center border border-white/20 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}maitri-logo.png`}
            alt="Maitri Developers Logo"
            className="h-full w-auto object-contain"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[11px] sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
              {SITE.name}
            </h1>
            <span className="hidden lg:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold shrink-0">
              Manglej, Karjan
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium leading-none mt-0.5 flex items-center gap-1">
            <span className="text-amber-400/90 font-semibold truncate">Maitri Developers</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">33,493 SMT</span>
          </p>
        </div>
      </div>

      {/* Top-Right Action Buttons: Compact on mobile, full on desktop */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 shrink-0">
        {/* 1. Gallery Button */}
        <button
          onClick={onOpenGallery}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#222222]/90 hover:bg-[#2e2e2e] text-white border border-white/10 text-xs sm:text-sm font-medium backdrop-blur-md shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          title="Gallery"
        >
          <IconGallery size={16} className="text-slate-300" />
          <span className="hidden sm:inline">Gallery</span>
        </button>

        {/* 2. Info Button */}
        <button
          onClick={onOpenInfo}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#222222]/90 hover:bg-[#2e2e2e] text-white border border-white/10 text-xs sm:text-sm font-medium backdrop-blur-md shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          title="Project Info"
        >
          <IconInfo size={16} className="text-slate-300" />
          <span className="hidden sm:inline">Info</span>
        </button>

        {/* 3. Contact Button */}
        <button
          onClick={onOpenContact}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#222222]/90 hover:bg-[#2e2e2e] text-white border border-white/10 text-xs sm:text-sm font-medium backdrop-blur-md shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          title="Contact Developer"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="hidden sm:inline">Contact</span>
        </button>

        {/* 4. Directions Button */}
        <button
          onClick={handleDirections}
          className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#0070f3] hover:bg-[#0060df] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-1.5"
          title="Directions"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span className="hidden sm:inline">Directions</span>
        </button>
      </div>
    </header>
  );
};

