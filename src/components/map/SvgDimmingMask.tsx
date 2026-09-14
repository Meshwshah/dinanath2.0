import React from 'react';
import type { PlotData } from '../../types/masterplan';
import { CANVAS_BOUNDS, pointsToPath } from '../../data/plotsData';

interface SvgDimmingMaskProps {
  selectedPlot: PlotData | null;
  onBackdropClick: () => void;
}

export const SvgDimmingMask: React.FC<SvgDimmingMaskProps> = ({
  selectedPlot,
  onBackdropClick,
}) => {
  if (!selectedPlot) return null;

  // Outer full-canvas box
  const outerPath = `M 0 0 H ${CANVAS_BOUNDS.width} V ${CANVAS_BOUNDS.height} H 0 Z`;
  // Selected plot inner polygon subpath
  const innerPath = pointsToPath(selectedPlot.points);

  // Combined inverted hole-punch path
  const combinedD = `${outerPath} ${innerPath}`;

  return (
    <g id="map-dim" className="transition-opacity duration-300">
      <path
        d={combinedD}
        fill="rgba(15, 23, 42, 0.55)"
        fillRule="evenodd"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onBackdropClick();
        }}
        style={{
          transition: 'opacity 0.35s ease',
        }}
      />
    </g>
  );
};
