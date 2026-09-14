import React, { useState, useRef, useEffect } from 'react';
import type { PlotData } from '../../types/masterplan';
import { PLOTS_DATA } from '../../data/plotsData';
import { IconSearch, IconX } from '../common/Icons';

interface PlotSearchTypeaheadProps {
  onSelectPlot: (plot: PlotData) => void;
  onSelectRange?: (minSft: number, maxSft: number, plots: PlotData[]) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

const SQFT_RANGES = [
  { label: 'Under 2,500 sq.ft', min: 0, max: 2500, desc: 'Compact Micro Industrial' },
  { label: '2,500 – 3,500 sq.ft', min: 2500, max: 3500, desc: 'Standard Gold Units' },
  { label: '3,500 – 6,000 sq.ft', min: 3500, max: 6000, desc: 'Medium Platinum Sheds' },
  { label: '6,000 – 13,000 sq.ft', min: 6000, max: 13000, desc: 'Heavy Diamond & Flagship Plots' },
];

export const PlotSearchTypeahead: React.FC<PlotSearchTypeaheadProps> = ({
  onSelectPlot,
  onSelectRange,
  searchRef,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeRange, setActiveRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = searchRef || internalInputRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse numeric search input for sq.ft
  const numericMatch = query.match(/\d+/g);
  const isNumericSearch = numericMatch !== null && numericMatch.length > 0;
  const searchNum = isNumericSearch ? parseInt(numericMatch[0], 10) : null;
  const searchNum2 = isNumericSearch && numericMatch.length > 1 ? parseInt(numericMatch[1], 10) : null;

  // Filter plots based on query or active range
  const filteredPlots = (() => {
    if (activeRange) {
      return PLOTS_DATA.filter(p => p.areaSft >= activeRange.min && p.areaSft <= activeRange.max);
    }

    if (query.trim() === '') {
      return [];
    }

    const q = query.toLowerCase().replace(/^(plot\s*|#)/, '').trim();

    // Check if user is searching for sqft range (e.g. "2500 - 3500" or "3000 sqft")
    if (isNumericSearch && searchNum && searchNum > 100) {
      if (searchNum2 && searchNum2 > 100) {
        const minVal = Math.min(searchNum, searchNum2);
        const maxVal = Math.max(searchNum, searchNum2);
        return PLOTS_DATA.filter(p => p.areaSft >= minVal && p.areaSft <= maxVal);
      }
      // Single number search: plots within ±600 sq.ft of the number
      return PLOTS_DATA.filter(p => Math.abs(p.areaSft - searchNum) <= 650);
    }

    // Default text search by plot number, zone, status
    return PLOTS_DATA.filter(p => {
      const numMatch = p.number.toString().includes(q);
      const zoneMatch = p.zone.toLowerCase().includes(q);
      const statusMatch = p.status.toLowerCase().includes(q);
      const sqftMatch = Math.round(p.areaSft).toString().includes(q);
      return numMatch || zoneMatch || statusMatch || sqftMatch;
    }).slice(0, 8);
  })();

  const handleSelectRange = (r: typeof SQFT_RANGES[0]) => {
    setActiveRange({ min: r.min, max: r.max });
    setQuery(`${r.min.toLocaleString()} – ${r.max.toLocaleString()} sq.ft`);
    const matching = PLOTS_DATA.filter(p => p.areaSft >= r.min && p.areaSft <= r.max);
    if (onSelectRange && matching.length > 0) {
      onSelectRange(r.min, r.max, matching);
    }
    setIsOpen(false);
  };

  const handleSelect = (plot: PlotData) => {
    onSelectPlot(plot);
    setQuery(`Plot #${plot.number} (${Math.round(plot.areaSft).toLocaleString()} sq.ft)`);
    setActiveRange(null);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredPlots.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredPlots.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredPlots.length) % filteredPlots.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPlots[selectedIndex]) {
        handleSelect(filteredPlots[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <IconSearch size={15} />
        </div>
        <input
          id="plot-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveRange(null);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search Plot # or Sq.Ft size..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#262626] border border-white/5 focus:border-[#0070f3] text-white placeholder-slate-400 text-xs font-medium outline-none transition-all"
        />

        {/* Action icons in input */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setActiveRange(null);
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <IconX size={13} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400 border border-white/10">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Autocomplete & Size Range Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 max-h-80 overflow-y-auto rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl z-50 p-2 custom-scrollbar animate-scale-in">
          {/* 1. Quick Range Suggestions */}
          <div className="mb-2 pb-2 border-b border-white/10">
            <div className="px-2 py-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>Filter by Sq.Ft Size Range</span>
              <span className="text-[9px] text-slate-500 font-sans">Click to Zoom</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {SQFT_RANGES.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRange(r)}
                  className="text-left px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-500/40 border border-white/5 transition-all text-xs text-white flex flex-col group"
                >
                  <span className="font-bold text-[11px] text-slate-200 group-hover:text-cyan-300">
                    {r.label}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Filtered Plots Result List */}
          {filteredPlots.length > 0 ? (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
                <span>Matching Plots ({filteredPlots.length})</span>
                {activeRange && (
                  <span className="text-amber-400 text-[10px] font-semibold">Filtered Area</span>
                )}
              </div>
              <div className="space-y-1">
                {filteredPlots.map((plot, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={plot.id}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(plot)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-xs font-mono text-white">
                          #{plot.number}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            plot.zone === 'Gold'
                              ? 'bg-amber-500/20 text-amber-300'
                              : plot.zone === 'Platinum'
                              ? 'bg-pink-500/20 text-pink-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {plot.zone}
                        </span>
                        <span className="text-xs text-cyan-300 font-mono font-bold">
                          {Math.round(plot.areaSft).toLocaleString()} sq.ft
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            plot.status === 'Available'
                              ? 'bg-emerald-400'
                              : plot.status === 'On Hold'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {plot.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : query.trim() !== '' ? (
            <div className="py-4 text-center text-xs text-slate-400">
              No plots found matching &quot;{query}&quot;. Try a different size or plot number.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
