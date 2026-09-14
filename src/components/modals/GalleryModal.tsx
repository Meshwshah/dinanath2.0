import React, { useState, useEffect, useCallback } from 'react';
import { IconX, IconChevronLeft, IconChevronRight } from '../common/Icons';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  desc: string;
  imageSrc?: string;
  renderType?: 'warehouse' | 'gate' | 'roads' | 'ecopark' | 'connectivity';
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryItems: GalleryItem[] = [
    {
      id: 'masterplan',
      title: 'Official Masterplan Layout Blueprint',
      category: 'Master Layout',
      badge: 'Official Blueprint',
      desc: 'Complete 33,493 SMT industrial plotting layout with 69 industrial plots, 18.00m highway frontage, wide internal circulation roads, and two common utility plots.',
      imageSrc: `${import.meta.env.BASE_URL}masterplan-layout.webp`,
    },
    {
      id: 'warehouse',
      title: 'Pre-Engineered Industrial Warehouse (PEB)',
      category: 'Architecture & Engineering',
      badge: 'Shed Concept',
      desc: 'Standard modular PEB shed design featuring 9m clear height, heavy overhead crane gantries, insulated standing-seam roofing, and dedicated container loading docks.',
      renderType: 'warehouse',
    },
    {
      id: 'gate',
      title: 'Grand Entrance Gateway & Security Axis',
      category: 'Access & Logistics',
      badge: '18m Road Access',
      desc: 'Grand security gateway directly off 18.00m Naliya Road with 24/7 security cabin, automated boom barriers, and wide trailer turning radius.',
      renderType: 'gate',
    },
    {
      id: 'roads',
      title: 'Heavy-Vehicle Road Network & Utilities',
      category: 'Infrastructure',
      badge: 'Concrete Roads',
      desc: '17.50m cross-over and 12.00m internal circulation roads engineered with heavy RCC storm drains, full-spectrum LED street lighting, and underground utility conduits.',
      renderType: 'roads',
    },
    {
      id: 'ecopark',
      title: 'Common Plot 01 Landscaped Green Zone',
      category: 'Green Amenities',
      badge: '1,965 SMT Park',
      desc: 'Central landscaped open parkland equipped with rainwater harvesting percolation wells, indigenous shade tree plantations, and electrical substation enclaves.',
      renderType: 'ecopark',
    },
    {
      id: 'connectivity',
      title: 'NH-48 Industrial Freight Corridor',
      category: 'Strategic Location',
      badge: 'Karjan / Vadodara',
      desc: 'Strategically located at Manglej, Karjan with rapid highway access to the Golden Quadrilateral (NH-48), connecting Vadodara, Bharuch, and Dahej PCPIR industrial hubs.',
      renderType: 'connectivity',
    },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
      }
    },
    [isOpen, onClose, galleryItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const current = galleryItems[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#141820] border border-white/15 p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wide uppercase">
              {current.badge}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {activeIndex + 1} of {galleryItems.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="Close Gallery (Esc)"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Main Image / Render Display Area */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[380px] my-3 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center">
          {/* Real Masterplan Blueprint */}
          {current.imageSrc ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[#1F1F1F] p-2">
              <img
                src={current.imageSrc}
                alt={current.title}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
              />
              <a
                href={current.imageSrc}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5"
              >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span>Full Blueprint</span>
              </a>
            </div>
          ) : current.renderType === 'warehouse' ? (
            /* PEB Warehouse Concept Visual */
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-full max-w-md h-48 sm:h-56" viewBox="0 0 400 220" fill="none">
                <line x1="20" y1="180" x2="380" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <polygon points="60,180 60,90 200,45 340,90 340,180" fill="#f59e0b10" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="60" y1="90" x2="340" y2="90" stroke="#f59e0b88" strokeWidth="1.5" />
                <line x1="200" y1="45" x2="200" y2="180" stroke="#f59e0b66" strokeWidth="1.5" />
                <line x1="130" y1="67" x2="130" y2="180" stroke="#f59e0b44" strokeWidth="1" />
                <line x1="270" y1="67" x2="270" y2="180" stroke="#f59e0b44" strokeWidth="1" />
                <rect x="80" y="105" width="240" height="8" rx="2" fill="#38bdf8" opacity="0.8" />
                <rect x="180" y="113" width="40" height="20" rx="3" fill="#38bdf8" />
                <line x1="200" y1="133" x2="200" y2="155" stroke="#38bdf8" strokeWidth="2" />
                <rect x="90" y="130" width="35" height="50" fill="#f59e0b25" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="140" y="130" width="35" height="50" fill="#f59e0b25" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="255" y="135" width="70" height="45" rx="3" fill="#ffffff15" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="275" cy="180" r="7" fill="#f59e0b" />
                <circle cx="310" cy="180" r="7" fill="#f59e0b" />
                <text x="200" y="32" fill="#f59e0b" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  MODULAR PEB SHED (9M CLEAR HEIGHT)
                </text>
                <text x="200" y="100" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  HEAVY CRANE GANTRY READY
                </text>
              </svg>
            </div>
          ) : current.renderType === 'gate' ? (
            /* Grand Entrance Gate Visual */
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-full max-w-md h-48 sm:h-56" viewBox="0 0 400 220" fill="none">
                <polygon points="80,195 320,195 240,110 160,110" fill="#10b98115" stroke="#10b981" strokeWidth="1.5" />
                <line x1="200" y1="195" x2="200" y2="110" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" />
                <rect x="120" y="60" width="24" height="100" rx="2" fill="#10b98125" stroke="#10b981" strokeWidth="2" />
                <rect x="256" y="60" width="24" height="100" rx="2" fill="#10b98125" stroke="#10b981" strokeWidth="2" />
                <rect x="110" y="45" width="180" height="18" rx="3" fill="#10b981" />
                <text x="200" y="58" fill="#022c22" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  DINANATH INDUSTRIAL PARK
                </text>
                <rect x="290" y="100" width="45" height="40" rx="3" fill="#ffffff15" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="312" cy="90" r="3" fill="#10b981" />
                <line x1="144" y1="135" x2="200" y2="135" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
                <line x1="200" y1="135" x2="256" y2="135" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
                <text x="200" y="210" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  18.00 MT. WIDE EXIST. NALIYA ROAD
                </text>
              </svg>
            </div>
          ) : current.renderType === 'roads' ? (
            /* Concrete Road Network Visual */
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-full max-w-md h-48 sm:h-56" viewBox="0 0 400 220" fill="none">
                <rect x="40" y="90" width="320" height="45" rx="4" fill="#06b6d415" stroke="#06b6d4" strokeWidth="2" />
                <line x1="40" y1="112" x2="360" y2="112" stroke="#06b6d4" strokeWidth="2" strokeDasharray="8 6" />
                <rect x="25" y="90" width="15" height="45" rx="2" fill="#06b6d430" stroke="#06b6d4" strokeWidth="1.5" />
                <rect x="360" y="90" width="15" height="45" rx="2" fill="#06b6d430" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="70" y1="90" x2="70" y2="35" stroke="#38bdf8" strokeWidth="2" />
                <line x1="70" y1="35" x2="85" y2="35" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="85" cy="38" r="4" fill="#fbbf24" />
                <line x1="330" y1="90" x2="330" y2="35" stroke="#38bdf8" strokeWidth="2" />
                <line x1="330" y1="35" x2="315" y2="35" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="315" cy="38" r="4" fill="#fbbf24" />
                <line x1="20" y1="165" x2="380" y2="165" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
                <text x="200" y="160" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  UNDERGROUND POWER & FIBER CONDUITS
                </text>
                <text x="200" y="195" fill="#06b6d4" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  17.50M / 12.00M HEAVY-DUTY CONCRETE CORRIDOR
                </text>
              </svg>
            </div>
          ) : current.renderType === 'ecopark' ? (
            /* Eco Park Visual */
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/20 to-lime-950/20 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-full max-w-md h-48 sm:h-56" viewBox="0 0 400 220" fill="none">
                <rect x="60" y="40" width="280" height="135" rx="16" fill="#10b98115" stroke="#10b981" strokeWidth="2" />
                <circle cx="140" cy="105" r="28" fill="#38bdf820" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="140" cy="105" r="14" fill="#38bdf840" />
                <text x="140" y="148" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  RECHARGE WELL
                </text>
                <circle cx="230" cy="85" r="18" fill="#10b98140" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="270" cy="115" r="16" fill="#10b98140" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="245" cy="130" r="14" fill="#10b98140" stroke="#10b981" strokeWidth="1.5" />
                <rect x="80" y="55" width="30" height="24" rx="3" fill="#f59e0b20" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="95" y="70" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  SUB
                </text>
                <text x="200" y="195" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  COMMON PLOT 01 • 1,965.79 SMT ECO-PARK
                </text>
              </svg>
            </div>
          ) : (
            /* Regional Connectivity Map Visual */
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-full max-w-md h-48 sm:h-56" viewBox="0 0 400 220" fill="none">
                <line x1="60" y1="30" x2="340" y2="190" stroke="#818cf8" strokeWidth="4" />
                <line x1="60" y1="30" x2="340" y2="190" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 4" />
                <circle cx="95" cy="50" r="8" fill="#818cf8" />
                <text x="110" y="55" fill="#ffffff" fontSize="11" fontWeight="bold">
                  Vadodara (24 km)
                </text>
                <circle cx="200" cy="110" r="14" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="200" cy="110" r="5" fill="#ffffff" />
                <text x="200" y="138" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                  DINANATH PARK (Manglej, Karjan)
                </text>
                <circle cx="305" cy="170" r="8" fill="#818cf8" />
                <text x="295" y="190" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="end">
                  Bharuch / Dahej (42 km)
                </text>
                <text x="200" y="25" fill="#818cf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  GOLDEN QUADRILATERAL (NH-48) INDUSTRIAL AXIS
                </text>
              </svg>
            </div>
          )}

          {/* Left / Right Nav Arrows */}
          <button
            onClick={() => setActiveIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-xl"
            title="Previous (Left Arrow)"
          >
            <IconChevronLeft size={18} />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-xl"
            title="Next (Right Arrow)"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        {/* Caption & Description */}
        <div className="flex-shrink-0 px-1 py-1">
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            {current.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {current.desc}
          </p>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar flex-shrink-0">
          {galleryItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                idx === activeIndex
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="truncate max-w-[120px] sm:max-w-[140px] font-bold">
                {item.title}
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                {item.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
