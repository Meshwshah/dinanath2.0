import React from 'react';
import type { PlotData, ViewMode, CategoryFilter } from '../../types/masterplan';
import { PLOTS_DATA, COMMON_PLOTS, CANVAS_BOUNDS, pointsToPath } from '../../data/plotsData';

interface SvgInteractivePlotsProps {
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
    if (activeCategory) {
      if (activeCategory === 'all') {
        switch (plot.zone) {
          case 'Gold': return isHovered ? 'rgba(245, 158, 11, 0.65)' : 'rgba(245, 158, 11, 0.45)';
          case 'Platinum': return isHovered ? 'rgba(236, 72, 153, 0.65)' : 'rgba(236, 72, 153, 0.45)';
          case 'Diamond': return isHovered ? 'rgba(56, 189, 248, 0.65)' : 'rgba(56, 189, 248, 0.45)';
        }
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        // Only this specific zone is highlighted!
        switch (plot.zone) {
          case 'Gold': return isHovered ? 'rgba(245, 158, 11, 0.75)' : 'rgba(245, 158, 11, 0.55)';
          case 'Platinum': return isHovered ? 'rgba(236, 72, 153, 0.75)' : 'rgba(236, 72, 153, 0.55)';
          case 'Diamond': return isHovered ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.55)';
        }
      } else {
        // Other non-matching categories remain subtle/dimmed
        return isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)';
      }
    }

    // When Categories toggle is ON:
    if (showCategories) {
      switch (plot.zone) {
        case 'Gold':
          return isHovered ? 'rgba(245, 158, 11, 0.65)' : 'rgba(245, 158, 11, 0.45)';
        case 'Platinum':
          return isHovered ? 'rgba(236, 72, 153, 0.65)' : 'rgba(236, 72, 153, 0.45)';
        case 'Diamond':
          return isHovered ? 'rgba(56, 189, 248, 0.65)' : 'rgba(56, 189, 248, 0.45)';
        default:
          return isHovered ? 'rgba(14, 165, 233, 0.50)' : 'rgba(14, 165, 233, 0.35)';
      }
    }

    // DEFAULT STATE (no categories clicked, clean blueprint):
    // Neutral subtle fill that brightens gracefully on hover
    if (isHovered) {
      return 'rgba(56, 189, 248, 0.28)';
    }
    return 'rgba(255, 255, 255, 0.03)';
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
          case 'Gold': return 'rgba(217, 119, 6, 0.95)';
          case 'Platinum': return 'rgba(219, 39, 119, 0.95)';
          case 'Diamond': return 'rgba(14, 165, 233, 0.95)';
        }
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        switch (plot.zone) {
          case 'Gold': return 'rgba(217, 119, 6, 0.95)';
          case 'Platinum': return 'rgba(219, 39, 119, 0.95)';
          case 'Diamond': return 'rgba(14, 165, 233, 0.95)';
        }
      } else {
        return 'rgba(255, 255, 255, 0.15)';
      }
    }

    if (showCategories) {
      switch (plot.zone) {
        case 'Gold': return 'rgba(217, 119, 6, 0.95)';
        case 'Platinum': return 'rgba(219, 39, 119, 0.95)';
        case 'Diamond': return 'rgba(14, 165, 233, 0.95)';
      }
    }

    // Default clean state: clean crisp plot boundary
    return 'rgba(255, 255, 255, 0.35)';
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
              fill={isSelected ? 'rgba(34, 197, 94, 0.65)' : isHovered ? 'rgba(34, 197, 94, 0.50)' : 'rgba(34, 197, 94, 0.30)'}
              stroke={isSelected || isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.65)'}
              strokeWidth={isSelected || isHovered ? 3 : 1.5}
              style={{
                pointerEvents: 'all',
                vectorEffect: 'non-scaling-stroke',
                transition: 'fill 0.15s ease, stroke 0.15s ease',
              }}
            />

            {/* Dark, Bold, Visible Common Plot Label */}
            <text
              x={cp.center[0]}
              y={cp.center[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#09090b"
              stroke="#ffffff"
              strokeWidth="3.5"
              paintOrder="stroke fill"
              fontSize={34}
              fontWeight="900"
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              className="pointer-events-none select-none tracking-wider"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              {cp.number}
            </text>
          </g>
        );
      })}

      {/* 2. All 69 Industrial Masterplan Plots */}
      {PLOTS_DATA.map(plot => {
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
            <path
              d={pathD}
              fill={fill}
              stroke={stroke}
              strokeWidth={isHighlighted ? 3.5 : isHovered || isSelected ? 3 : 1.2}
              style={{
                pointerEvents: 'all',
                vectorEffect: 'non-scaling-stroke',
                filter: isHighlighted ? 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.9))' : undefined,
                transition: 'fill 0.15s ease, stroke 0.15s ease',
              }}
            />

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

            {/* Dark, Bold, Clearly Visible Vector Plot Number */}
            <text
              x={plot.center[0]}
              y={plot.center[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#09090b"
              stroke="#ffffff"
              strokeWidth="3.2"
              paintOrder="stroke fill"
              fontSize={plot.areaSft > 8000 ? 34 : plot.areaSft > 5000 ? 30 : 26}
              fontWeight="900"
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              className="pointer-events-none select-none tracking-tight"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))' }}
            >
              {plot.number}
            </text>
          </g>
        );
      })}

      {/* ============================================================
          3. OUTSIDE LAYOUT CRISP VECTOR ANNOTATIONS & ROAD LABELS
          Dark, sharp, permanently visible at all zoom levels
          ============================================================ */}
      <g id="map-layer-outside-annotations" className="pointer-events-none select-none">
        {/* South: 18.00 MT. WIDE EXIST. NALIYA ROAD */}
        <g>
          <line x1="90" y1="5250" x2="3130" y2="5250" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <line x1="90" y1="5145" x2="3130" y2="5145" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="16 12" />
          <text
            x={CANVAS_BOUNDS.width / 2}
            y={5145}
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

        {/* East (Right Margin): Tree Plantation & Building Control Line */}
        <g transform="translate(3120, 3680) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f1f5f9"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="22"
            fontWeight="800"
            letterSpacing="3"
          >
            1.22 MT. WIDE FOR TREE PLANTATION
          </text>
        </g>
        <g transform="translate(3065, 3980) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#cbd5e1"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="20"
            fontWeight="800"
            letterSpacing="2.5"
          >
            BUILDING CONTROL LINE
          </text>
        </g>

        {/* West (Left Margin): Tree Plantation & Building Control Line */}
        <g transform="translate(65, 4070) rotate(-90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#cbd5e1"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="20"
            fontWeight="800"
            letterSpacing="2.5"
          >
            BUILDING CONTROL LINE
          </text>
        </g>
        <g transform="translate(35, 4950) rotate(-90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f1f5f9"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="20"
            fontWeight="800"
            letterSpacing="2"
          >
            1.22 MT. WIDE TREE PLANTATION
          </text>
        </g>

        {/* North: 12.00 MT Wide Road Frontage */}
        <g>
          <text
            x={1440}
            y={30}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="20"
            fontWeight="800"
            letterSpacing="2"
          >
            12.00 MT. WIDE ROAD
          </text>
          <text
            x={2315}
            y={30}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            stroke="#09090b"
            strokeWidth="3.5"
            paintOrder="stroke fill"
            fontSize="20"
            fontWeight="800"
            letterSpacing="2"
          >
            12.00 MT. WIDE ROAD
          </text>
        </g>

        {/* Entrance 15.00m Setback Strip */}
        <g>
          <text
            x={420}
            y={4964}
            dominantBaseline="central"
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="3"
            paintOrder="stroke fill"
            fontSize="18"
            fontWeight="800"
            letterSpacing="1.5"
          >
            15.00 M. SETBACK AREA (2,262.25 SMT)
          </text>
        </g>
      </g>
    </g>
  );
};
