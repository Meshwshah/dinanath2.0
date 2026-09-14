import React from 'react';
import type { ViewMode } from '../../types/masterplan';
import { CANVAS_BOUNDS } from '../../data/plotsData';

interface SvgBaseBlueprintProps {
  viewMode: ViewMode;
}

export const SvgBaseBlueprint: React.FC<SvgBaseBlueprintProps> = ({ viewMode }) => {
  const isDark = viewMode === 'Dark';
  const isSatellite = viewMode === 'Satellite';

  return (
    <g id="map-layer-1-base" className="select-none pointer-events-none">
      {/* 
        Authentic Architectural Masterplan Layout Blueprint
        Transparent outer boundary directly blending with the #1F1F1F dark charcoal background
      */}
      <image
        href={`${import.meta.env.BASE_URL}masterplan-layout.webp`}
        x="0"
        y="0"
        width={CANVAS_BOUNDS.width}
        height={CANVAS_BOUNDS.height}
        preserveAspectRatio="none"
        style={{
          filter: isDark
            ? 'invert(0.92) hue-rotate(185deg) brightness(0.88) contrast(1.15)'
            : isSatellite
            ? 'contrast(1.1) brightness(0.95)'
            : 'none',
          transition: 'filter 0.3s ease',
        }}
      />
    </g>
  );
};
