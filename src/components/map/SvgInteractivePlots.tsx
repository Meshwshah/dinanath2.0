import React from 'react';
import type { PlotData, ViewMode, CategoryFilter } from '../../types/masterplan';
import { PLOTS_DATA, COMMON_PLOTS, pointsToPath } from '../../data/plotsData';

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
    </g>
  );
};
