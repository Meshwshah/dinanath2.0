import React from 'react';
import type { PlotData, ViewMode } from '../../types/masterplan';
import { PLOTS_DATA, COMMON_PLOTS, pointsToPath } from '../../data/plotsData';

interface SvgInteractivePlotsProps {
  selectedPlotId: string | null;
  hoveredPlotId: string | null;
  showCategories: boolean;
  showStatus: boolean;
  viewMode: ViewMode;
  onPlotClick: (plot: PlotData) => void;
  onPlotHover: (plotId: string | null) => void;
  wasDragged?: () => boolean;
}

export const SvgInteractivePlots: React.FC<SvgInteractivePlotsProps> = ({
  selectedPlotId,
  hoveredPlotId,
  showCategories,
  showStatus,
  onPlotClick,
  onPlotHover,
  wasDragged,
}) => {
  // Helper to determine plot fill color
  const getPlotFill = (plot: PlotData, isHovered: boolean, isSelected: boolean): string => {
    if (isSelected) {
      if (showStatus) {
        switch (plot.status) {
          case 'Available': return 'rgba(34, 197, 94, 0.65)';
          case 'On Hold': return 'rgba(245, 158, 11, 0.65)';
          case 'Sold': return 'rgba(239, 68, 68, 0.65)';
        }
      }
      switch (plot.zone) {
        case 'Gold': return 'rgba(245, 158, 11, 0.52)';
        case 'Platinum': return 'rgba(236, 72, 153, 0.52)';
        case 'Diamond': return 'rgba(56, 189, 248, 0.52)';
        default: return 'rgba(14, 165, 233, 0.45)';
      }
    }

    // When Status toggle is clicked (ON):
    // Colors clearly indicate inventory status across all plots!
    if (showStatus) {
      switch (plot.status) {
        case 'Available':
          return isHovered ? 'rgba(34, 197, 94, 0.60)' : 'rgba(34, 197, 94, 0.44)';
        case 'On Hold':
          return isHovered ? 'rgba(245, 158, 11, 0.62)' : 'rgba(245, 158, 11, 0.45)';
        case 'Sold':
          return isHovered ? 'rgba(239, 68, 68, 0.62)' : 'rgba(239, 68, 68, 0.45)';
      }
    }

    // When Categories toggle is clicked (ON):
    // Zone colors brighten with vivid, clean, uniform fills!
    if (showCategories) {
      switch (plot.zone) {
        case 'Gold':
          return isHovered ? 'rgba(245, 158, 11, 0.58)' : 'rgba(245, 158, 11, 0.40)';
        case 'Platinum':
          return isHovered ? 'rgba(236, 72, 153, 0.58)' : 'rgba(236, 72, 153, 0.40)';
        case 'Diamond':
          return isHovered ? 'rgba(56, 189, 248, 0.58)' : 'rgba(56, 189, 248, 0.40)';
        default:
          return isHovered ? 'rgba(14, 165, 233, 0.40)' : 'rgba(14, 165, 233, 0.25)';
      }
    }

    // Without clicking Categories or Status (both OFF):
    // Colors are lightened / soft translucent pastel tint allowing blueprint to show through
    if (isHovered) {
      switch (plot.zone) {
        case 'Gold': return 'rgba(245, 158, 11, 0.24)';
        case 'Platinum': return 'rgba(236, 72, 153, 0.24)';
        case 'Diamond': return 'rgba(56, 189, 248, 0.24)';
        default: return 'rgba(14, 165, 233, 0.18)';
      }
    }
    switch (plot.zone) {
      case 'Gold':
        return 'rgba(245, 158, 11, 0.05)';
      case 'Platinum':
        return 'rgba(236, 72, 153, 0.05)';
      case 'Diamond':
        return 'rgba(56, 189, 248, 0.05)';
      default:
        return 'rgba(255, 255, 255, 0.001)';
    }
  };

  // Helper to determine plot stroke color
  const getPlotStroke = (plot: PlotData, isHovered: boolean, isSelected: boolean): string => {
    if (isSelected) {
      return '#0284c7';
    }
    if (isHovered) {
      return '#0284c7';
    }

    if (showStatus) {
      switch (plot.status) {
        case 'Available': return 'rgba(22, 163, 74, 0.90)';
        case 'On Hold': return 'rgba(217, 119, 6, 0.90)';
        case 'Sold': return 'rgba(220, 38, 38, 0.90)';
      }
    }

    if (showCategories) {
      switch (plot.zone) {
        case 'Gold': return 'rgba(217, 119, 6, 0.85)';
        case 'Platinum': return 'rgba(219, 39, 119, 0.85)';
        case 'Diamond': return 'rgba(14, 165, 233, 0.85)';
      }
    }

    // When both are OFF, subtle stroke
    switch (plot.zone) {
      case 'Gold': return 'rgba(217, 119, 6, 0.20)';
      case 'Platinum': return 'rgba(219, 39, 119, 0.20)';
      case 'Diamond': return 'rgba(14, 165, 233, 0.20)';
      default: return 'transparent';
    }
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
              fill={
                isSelected
                  ? 'rgba(132, 204, 22, 0.50)'
                  : isHovered
                  ? 'rgba(132, 204, 22, 0.35)'
                  : showCategories
                  ? 'rgba(132, 204, 22, 0.35)'
                  : 'rgba(132, 204, 22, 0.05)'
              }
              stroke={isSelected || isHovered ? '#65a30d' : showCategories ? 'rgba(101, 163, 13, 0.65)' : 'transparent'}
              strokeWidth={isHovered || isSelected ? 3 : 1}
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
        const fill = getPlotFill(plot, isHovered, isSelected);
        const stroke = getPlotStroke(plot, isHovered, isSelected);
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
              strokeWidth={isHovered || isSelected ? 3 : 1.2}
              style={{
                pointerEvents: 'all',
                vectorEffect: 'non-scaling-stroke',
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


            {/* Crisp Hover Tooltip Callout when hovering */}
            {isHovered && !isSelected && (
              <g
                transform={`translate(${plot.center[0]}, ${plot.bbox.y - 20})`}
                className="pointer-events-none select-none"
              >
                <rect
                  x="-75"
                  y="-18"
                  width="150"
                  height="34"
                  rx="8"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  style={{
                    vectorEffect: 'non-scaling-stroke',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                  }}
                />
                <text
                  x="0"
                  y="-2"
                  fill="#ffffff"
                  fontSize="13"
                  fontFamily="sans-serif"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {plot.label} • {plot.areaSmt} SMT
                </text>
                <text
                  x="0"
                  y="12"
                  fill={
                    plot.status === 'Available'
                      ? '#4ade80'
                      : plot.status === 'On Hold'
                      ? '#fbbf24'
                      : '#f87171'
                  }
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {plot.zone} Zone • {plot.status}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
