import React from 'react';

interface LayerTogglesProps {
  showZones: boolean;
  showStatus: boolean;
  onToggleZones: () => void;
  onToggleStatus: () => void;
}

export const LayerToggles: React.FC<LayerTogglesProps> = ({
  showZones,
  showStatus,
  onToggleZones,
  onToggleStatus,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Toggles Bar */}
      <div className="flex items-center gap-3">
        {/* Zones Toggle Button */}
        <button
          onClick={onToggleZones}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
            showZones
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-glow-gold'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              showZones ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span>Zones</span>
        </button>

        {/* Status Toggle Button */}
        <button
          onClick={onToggleStatus}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
            showStatus
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              showStatus ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span>Availability</span>
        </button>
      </div>

      {/* Collapsible Legends */}
      <div className="flex flex-col gap-1.5 overflow-hidden">
        {/* Zones Legend */}
        {showZones && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 animate-slide-up">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
              Gold (182–402m²)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
              Platinum (402–560m²)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#818cf8]" />
              Diamond (715–1167m²)
            </span>
          </div>
        )}

        {/* Status Legend */}
        {showStatus && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 animate-slide-up">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              Available
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              On Hold
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              Sold
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
