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

      {/* 
        Solid Crisp White Architectural Vector Typography for Outsider Texts
        Guarantees 100% sharp, readable white letters on dark background
      */}
      {/* 18.00 MT. WIDE EXIST. NALIYA ROAD */}
      <text
        x="1710"
        y="5142"
        fill="#FFFFFF"
        fontSize="34"
        fontFamily="Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        letterSpacing="0.25em"
        textAnchor="middle"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
        }}
      >
        18.00 MT. W I D E   E X I S T.   N A L I Y A   R O A D
      </text>

      {/* Building Control Line */}
      <text
        x="3050"
        y="4960"
        fill="#FFFFFF"
        fontSize="22"
        fontFamily="Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        letterSpacing="0.12em"
        transform="rotate(-90, 3050, 4960)"
        textAnchor="middle"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
        }}
      >
        Building control line
      </text>
    </g>
  );
};
