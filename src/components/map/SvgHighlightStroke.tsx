import React from 'react';
import type { PlotData } from '../../types/masterplan';
import { pointsToPath } from '../../data/plotsData';

interface SvgHighlightStrokeProps {
  selectedPlot: PlotData | null;
}

export const SvgHighlightStroke: React.FC<SvgHighlightStrokeProps> = ({ selectedPlot }) => {
  if (!selectedPlot) return null;

  const pathD = pointsToPath(selectedPlot.points);
  const strokeColor =
    selectedPlot.zone === 'Gold'
      ? '#f59e0b'
      : selectedPlot.zone === 'Platinum'
      ? '#ec4899'
      : selectedPlot.zone === 'Diamond'
      ? '#0284c7'
      : '#84cc16'; // Common

  return (
    <g id="map-highlight" className="pointer-events-none select-none">
      {/* Outer ambient glow */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="10"
        opacity="0.35"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />

      {/* Crisp primary non-scaling stroke */}
      <path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />

      {/* Inner color stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />

      {/* Pulsing focal reticle at plot center */}
      <g transform={`translate(${selectedPlot.center[0]}, ${selectedPlot.center[1]})`}>
        <circle
          r="22"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          className="animate-ping-slow"
          opacity="0.75"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
        <circle
          r="6"
          fill="#ffffff"
          stroke={strokeColor}
          strokeWidth="2"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      </g>

      {/* Corner target reticles */}
      {selectedPlot.points.map(([x, y], idx) => (
        <circle
          key={idx}
          cx={x}
          cy={y}
          r="4.5"
          fill="#ffffff"
          stroke={strokeColor}
          strokeWidth="2"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      ))}
    </g>
  );
};
