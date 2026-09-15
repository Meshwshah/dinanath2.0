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
        return isHovered ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0)';
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        // Only this specific zone is highlighted!
        return isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0)';
      } else {
        // Other non-matching categories are dimmed
        return isHovered ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.40)';
      }
    }

    // When Categories toggle is ON:
    if (showCategories) {
      return isHovered ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0)';
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
          case 'Gold': return 'rgba(217, 119, 6, 0.85)';
          case 'Platinum': return 'rgba(219, 39, 119, 0.85)';
          case 'Diamond': return 'rgba(14, 165, 233, 0.85)';
        }
      } else if (activeCategory.toLowerCase() === plot.zone.toLowerCase()) {
        switch (plot.zone) {
          case 'Gold': return '#f59e0b';
          case 'Platinum': return '#ec4899';
          case 'Diamond': return '#38bdf8';
        }
      } else {
        return 'rgba(255, 255, 255, 0.10)';
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

        {/* East (Right Margin): Tree Plantation, Building Control, and Zone Dimensions */}
        <g transform="translate(3140, 3680) rotate(90)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#4ade80"
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
        <g transform="translate(3085, 4250) rotate(90)">
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
        <g transform="translate(2955, 1450) rotate(90)">
          <text textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="18" fontWeight="700">183.98</text>
        </g>
        <g transform="translate(3030, 3550) rotate(90)">
          <text textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="18" fontWeight="700">139.98</text>
        </g>

        {/* West (Left Margin): Tree Plantation, Building Control, and Boundary Dimensions */}
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
            fill="#4ade80"
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
        <g>
          <text x={60} y={450} dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="17" fontWeight="700">55.04</text>
          <text x={90} y={930} dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="17" fontWeight="700">31.89 / 21.78</text>
          <text x={715} y={2000} transform="rotate(-90, 715, 2000)" textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="17" fontWeight="700">28.16</text>
          <text x={745} y={2520} transform="rotate(-90, 745, 2520)" textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="17" fontWeight="700">81.69</text>
          <text x={420} y={3450} textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">50.69</text>
          <text x={50} y={3280} textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">22.52</text>
          <text x={45} y={4200} transform="rotate(-90, 45, 4200)" textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">46.03</text>
          <text x={45} y={4550} transform="rotate(-90, 45, 4550)" textAnchor="middle" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">118.43</text>
        </g>

        {/* North: 12.00 MT Wide Road Frontage & Boundary Dimensions */}
        <g>
          <text
            x={1500}
            y={28}
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
            x={2350}
            y={28}
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
          <text x={1185} y={32} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">16.37</text>
          <text x={1700} y={32} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">49.30</text>
          <text x={2550} y={32} textAnchor="middle" dominantBaseline="central" fill="#f8fafc" stroke="#09090b" strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="700">63.39</text>
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
