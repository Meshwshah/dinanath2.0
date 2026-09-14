import React from 'react';
import { SITE, googleMapsDirectionsUrl } from '../../data/siteConfig';
import {
  IconX,
  IconCompass,
  IconPhone,
  IconExternalLink,
} from '../common/Icons';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-white/15 p-6 sm:p-8 text-white shadow-2xl custom-scrollbar animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
            Architectural Project Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {SITE.name}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {SITE.location} • Industrial Plotting Masterplan
          </p>
        </div>

        {/* Masterplan Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Total Site Area</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">33,493 m²</div>
            <span className="text-[10px] text-slate-500">360,526 SFT</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Total Plots</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{SITE.totalPlots}</div>
            <span className="text-[10px] text-slate-500">Gold / Plat / Dia</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Common Plots</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">2,969 m²</div>
            <span className="text-[10px] text-slate-500">CP-01 & CP-02</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Naliya Road</span>
            <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">18.00 MT</div>
            <span className="text-[10px] text-slate-500">Wide Highway Link</span>
          </div>
        </div>

        {/* Key Features List */}
        <div className="space-y-4 mb-6 text-sm">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Infrastructure & Strategic Highlights
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span><strong>Prime Connectivity:</strong> Directly connected via 18.00m Wide Naliya Road with 17.50m crossover spine.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span><strong>Heavy Logistics:</strong> 12.00m and 9.00m wide arterial internal roads for multi-axle trailers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span><strong>Eco Greenery:</strong> 1.22m dedicated tree plantation corridor along the entire northern perimeter.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span><strong>Legal Compliance:</strong> Verified building control setback line and approved N.A. industrial plotting.</span>
              </li>
            </ul>
          </div>

          {/* Project Stakeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Developer</span>
                <div className="text-base font-bold text-white mt-1">Maitri Developers</div>
                <p className="text-xs text-slate-400 mt-0.5">{SITE.client}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Industrial Infrastructure Developer</p>
              </div>
              <div className="h-12 w-auto px-2 py-1 rounded-xl bg-white shadow-md border border-white/10 shrink-0 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}maitri-logo.png`}
                  alt="Maitri Developers"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400">Architect & Engineer</span>
              <div className="text-base font-bold text-white mt-1">{SITE.architect}</div>
              <p className="text-xs text-slate-400 mt-0.5">{SITE.engineer}</p>
              <p className="text-[11px] text-slate-500 mt-1">{SITE.officeAddress}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
          <a
            href={googleMapsDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <IconCompass size={16} />
            <span>Open in Google Maps ({SITE.lat}, {SITE.lng})</span>
            <IconExternalLink size={13} />
          </a>

          <a
            href={`tel:${SITE.contactPhone}`}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <IconPhone size={15} />
            <span>Call: {SITE.contactPhone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
