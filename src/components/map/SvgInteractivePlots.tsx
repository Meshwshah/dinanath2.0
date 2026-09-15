import React from 'react';
import type { PlotData, ViewMode, CategoryFilter } from '../../types/masterplan';
import { PLOTS_DATA, COMMON_PLOTS, CANVAS_BOUNDS, pointsToPath } from '../../data/plotsData';

interface SvgInteractivePlotsProps {
  plots?: PlotData[];
  selectedPlotId: string | null;
  hoveredPlotId: string | null;
  highlightedPlotIds?: string[];
  showCategories: boolean;
  activeCategory?: CategoryFilter;
  showStatus: boolean;
  viewMode: ViewMode;
  onPlotClick: (plot: PlotData) => void;
  onPlotHover: (plotId: string | null) => void;
  wasDragged?: () => boolean;
}

export const SvgInteractivePlots: React.FC<SvgInteractivePlotsProps> = ({
  plots = PLOTS_DATA,
  selectedPlotId,
  hoveredPlotId,
  highlightedPlotIds = [],
  showCategories,
  activeCategory = null,
  showStatus,
  onPlotClick,
  onPlotHover,
  wasDragged,
}) => {
  // Helper to determine plot fill color
  const getPlotFill = (plot: PlotData, isHovered: boolean, isSelected: boolean, isHighlighted: boolean): string => {
    if (isSelected) {
      if (showStatus) {
        switch (plot.status) {
          case 'Available': return 'rgba(34, 197, 94, 0.85)';
          case 'On Hold': return 'rgba(245, 158, 11, 0.85)';
          case 'Sold': return 'rgba(220, 38, 38, 0.85)';
        }
      }
      switch (plot.zone) {
        case 'Gold': return 'rgba(245, 158, 11, 0.70)';
        case 'Platinum': return 'rgba(236, 72, 153, 0.70)';
        case 'Diamond': return 'rgba(56, 189, 248, 0.70)';
        default: return 'rgba(14, 165, 233, 0.60)';
      }
    }

    // When plot is matched by range search, glow prominently!
    if (isHighlighted) {
      if (showStatus) {
        switch (plot.status) {
          case 'Available': return 'rgba(34, 197, 94, 0.80)';
          case 'On Hold': return 'rgba(245, 158, 11, 0.80)';
          case 'Sold': return 'rgba(220, 38, 38, 0.80)';
        }
      }
      return 'rgba(56, 189, 248, 0.60)';
    }

    // When Status toggle is clicked (ON):
    // Vivid bright status colors: bright light green, dark yellow / rich orange, dark red
    if (showStatus) {
      switch (plot.status) {
        case 'Available':
          return isHovered ? 'rgba(34, 197, 94, 0.85)' : 'rgba(34, 197, 94, 0.68)';
        case 'On Hold':
          return isHovered ? 'rgba(245, 158, 11, 0.85)' : 'rgba(245, 158, 11, 0.70)';
        case 'Sold':
          return isHovered ? 'rgba(220, 38, 38, 0.85)' : 'rgba(220, 38, 38, 0.70)';
      }
    }

    // When a specific category filter is active:
    // User requirement: ONLY the clicked category itself becomes highlighted in its vivid color!
    // The other categories must NOT become dark (no dark overlay, keep transparent & visible).
    if (activeCategory) {
      if (activeCategory === 'all') {
        switch (plot.zone) {
          case 'Gold': return isHovered ? 'rgba(245, 158, 11, 0.60)' : 'rgba(245, 158, 11, 0.42)';
          case 'Platinum': return isHovered ? 'rgba(236, 72, 153, 0.60)' : 'rgba(236, 72, 153, 0.42)';
          case 'Diamond': return isHovered ? 'rgba(14, 165, 233, 0.60)' : 'rgba(14, 165, 233, 0.42)';
        }
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        // Only this specific zone is highlighted in its vivid zone color!
        switch (plot.zone) {
          case 'Gold': return isHovered ? 'rgba(245, 158, 11, 0.65)' : 'rgba(245, 158, 11, 0.45)';
          case 'Platinum': return isHovered ? 'rgba(236, 72, 153, 0.65)' : 'rgba(236, 72, 153, 0.45)';
          case 'Diamond': return isHovered ? 'rgba(14, 165, 233, 0.65)' : 'rgba(14, 165, 233, 0.45)';
        }
      } else {
        // Other non-matching categories: DO NOT DARKEN! Transparent fill so blueprint remains completely visible!
        return isHovered ? 'rgba(56, 189, 248, 0.20)' : 'rgba(0, 0, 0, 0)';
      }
    }

    // When Categories toggle is ON (no specific activeCategory):
    if (showCategories) {
      switch (plot.zone) {
        case 'Gold': return isHovered ? 'rgba(245, 158, 11, 0.60)' : 'rgba(245, 158, 11, 0.42)';
        case 'Platinum': return isHovered ? 'rgba(236, 72, 153, 0.60)' : 'rgba(236, 72, 153, 0.42)';
        case 'Diamond': return isHovered ? 'rgba(14, 165, 233, 0.60)' : 'rgba(14, 165, 233, 0.42)';
      }
    }

    // DEFAULT STATE (no categories clicked, clean blueprint):
    // Transparent fill so pristine darkened blueprint shows through, brightening on hover
    if (isHovered) {
      return 'rgba(56, 189, 248, 0.25)';
    }
    return 'rgba(0, 0, 0, 0)';
  };

  // Helper to determine plot stroke color
  const getPlotStroke = (plot: PlotData, isHovered: boolean, isSelected: boolean, isHighlighted: boolean): string => {
    if (isSelected) {
      return '#00e5ff';
    }
    if (isHighlighted) {
      return '#00e5ff';
    }
    if (isHovered) {
      return '#38bdf8';
    }

    if (showStatus) {
      switch (plot.status) {
        case 'Available': return '#15803d';
        case 'On Hold': return '#b45309';
        case 'Sold': return '#991b1b';
      }
    }

    if (activeCategory) {
      if (activeCategory === 'all') {
        switch (plot.zone) {
          case 'Gold': return '#f59e0b';
          case 'Platinum': return '#ec4899';
          case 'Diamond': return '#0ea5e9';
        }
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        switch (plot.zone) {
          case 'Gold': return '#f59e0b';
          case 'Platinum': return '#ec4899';
          case 'Diamond': return '#0ea5e9';
        }
      } else {
        // Normal subtle boundary for other categories (NOT dimmed to invisible!)
        return 'rgba(255, 255, 255, 0.25)';
      }
    }

    if (showCategories) {
      switch (plot.zone) {
        case 'Gold': return '#f59e0b';
        case 'Platinum': return '#ec4899';
        case 'Diamond': return '#0ea5e9';
      }
    }

    // Default clean state: clean subtle boundary
    return 'rgba(255, 255, 255, 0.25)';
  };

  return (
    <g id="map-layer-2-interactive" className="select-none">
      {/* 1. Common Plots (CP-01 & CP-02) */}
      {COMMON_PLOTS.map(cp => {
        const isHovered = hoveredPlotId === cp.id;
        const isSelected = selectedPlotId === cp.id;
        const pathD = pointsToPath(cp.points);

        // Adapt common plot to PlotData interface for click handling
        const commonAsPlot: PlotData = {
          id: cp.id,
          number: cp.number as any,
          label: cp.label,
          zone: 'Common',
          status: 'Available',
          areaSmt: cp.areaSmt,
          areaSft: cp.areaSft,
          dimensions: { width: Math.round(cp.bbox.width * 0.05), length: Math.round(cp.bbox.height * 0.05), label: `${cp.areaSmt} SMT` },
          roadFrontage: 'Internal Park Corridor',
          features: ['Dedicated Green Zone', 'Landscaped Buffer', 'Park Utility Access'],
          price: { ratePerSft: 'Community Utility', totalEstimate: 'Common Amenity' },
          points: cp.points,
          center: cp.center,
          bbox: cp.bbox,
        };

        return (
          <g
            key={cp.id}
            id={cp.id}
            data-interactive="true"
            role="button"
            aria-label={cp.label}
            className="cursor-pointer"
            onClick={(e) => {
              if (wasDragged && wasDragged()) return;
              e.stopPropagation();
              onPlotClick(commonAsPlot);
            }}
            onPointerEnter={() => onPlotHover(cp.id)}
            onPointerLeave={() => onPlotHover(null)}
          >
            <path
              d={pathD}
              fill={isSelected ? 'rgba(34, 197, 94, 0.45)' : isHovered ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0)'}
              stroke={isSelected || isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.35)'}
              strokeWidth={isSelected || isHovered ? 3 : 1.5}
              style={{
                pointerEvents: 'all',
                vectorEffect: 'non-scaling-stroke',
                transition: 'fill 0.15s ease, stroke 0.15s ease',
              }}
            />
          </g>
        );
      })}

      {/* 2. All 69 Industrial Masterplan Plots */}
      {plots.map(plot => {
        const isSelected = selectedPlotId === plot.id;
        const isHovered = hoveredPlotId === plot.id;
        const isHighlighted = highlightedPlotIds.includes(plot.id);
        const fill = getPlotFill(plot, isHovered, isSelected, isHighlighted);
        const stroke = getPlotStroke(plot, isHovered, isSelected, isHighlighted);
        const pathD = pointsToPath(plot.points);

        return (
          <g
            key={plot.id}
            id={plot.id}
            data-interactive="true"
            role="button"
            aria-label={plot.label}
            className="cursor-pointer"
            onClick={(e) => {
              if (wasDragged && wasDragged()) return;
              e.stopPropagation();
              onPlotClick(plot);
            }}
            onPointerEnter={() => onPlotHover(plot.id)}
            onPointerLeave={() => onPlotHover(null)}
          >
            {/* Interactive Hit Polygon */}
            {(() => {
              const isMatchingCategory = Boolean(
                activeCategory &&
                (activeCategory === 'all' || activeCategory.toLowerCase() === plot.zone.toLowerCase())
              );
              return (
                <path
                  d={pathD}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isHighlighted ? 3.5 : isHovered || isSelected ? 3 : isMatchingCategory ? 2.5 : 1.2}
                  style={{
                    pointerEvents: 'all',
                    vectorEffect: 'non-scaling-stroke',
                    filter: isHighlighted
                      ? 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.9))'
                      : isMatchingCategory
                      ? (plot.zone === 'Gold'
                          ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))'
                          : plot.zone === 'Platinum'
                          ? 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))'
                          : 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.6))')
                      : undefined,
                    transition: 'fill 0.15s ease, stroke 0.15s ease',
                  }}
                />
              );
            })()}

            {/* Subtle crosshatching for SOLD plots when status toggle is ON */}
            {showStatus && plot.status === 'Sold' && (
              <path
                d={pathD}
                fill="none"
                stroke="rgba(220, 38, 38, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                style={{ vectorEffect: 'non-scaling-stroke' }}
              />
            )}
          </g>
        );
      })}

      {/* ============================================================
          3. OUTSIDE LAYOUT CRISP VECTOR ANNOTATIONS & ROAD LABELS
          Permanent, razor-sharp, perfectly visible at all zoom levels
          ============================================================ */}
      <g id="map-layer-outside-annotations" className="pointer-events-none select-none">
        {/* South: 18.00 MT. WIDE EXIST. NALIYA ROAD */}
        <g>
          <line x1="80" y1="5280" x2="3140" y2="5280" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <line x1="80" y1="5180" x2="3140" y2="5180" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="16 12" />
          <text
            x={CANVAS_BOUNDS.width / 2}
            y={5180}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="4"
            paintOrder="stroke fill"
            fontSize="30"
            fontWeight="900"
            letterSpacing="5"
          >
            18.00 MT. WIDE EXIST. NALIYA ROAD
          </text>
        </g>

        {/* Setback Area annotation under Plots 1 to 6 */}
        <g>
          <text
            x={550}
            y={4965}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="18"
            fontWeight="800"
            letterSpacing="1.5"
          >
            NALIYA SETBACK AREA : 592.25 SMT.
          </text>
        </g>

        {/* South Boundary Dimensions */}
        <g>
          <text x={85} y={5060} dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">45.49</text>
          <text x={2280} y={5070} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">18.05</text>
          <text x={2530} y={5070} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">18.05</text>
          <text x={2820} y={5070} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">21.21</text>
          <text x={3045} y={4950} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">54.51</text>
        </g>


        {/* Central Spine Road Labels */}
        <g transform="translate(1965, 1500) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="22"
            fontWeight="800"
            letterSpacing="4"
          >
            17.50 MT. WIDE CROSS-OVER ROAD
          </text>
        </g>
        <g transform="translate(1965, 3000) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="22"
            fontWeight="800"
            letterSpacing="4"
          >
            17.50 MT. WIDE CROSS-OVER ROAD
          </text>
        </g>
        <g transform="translate(1965, 4400) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="22"
            fontWeight="800"
            letterSpacing="4"
          >
            17.50 MT. WIDE CROSS-OVER ROAD
          </text>
        </g>
      </g>
    </g>
  );
};
