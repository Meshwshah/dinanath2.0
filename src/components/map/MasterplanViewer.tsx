import React, { useState } from 'react';
import type { PlotData, ViewMode, CameraState } from '../../types/masterplan';
import { CANVAS_BOUNDS } from '../../data/plotsData';
import { SvgBaseBlueprint } from './SvgBaseBlueprint';
import { SvgInteractivePlots } from './SvgInteractivePlots';
import { SvgHighlightStroke } from './SvgHighlightStroke';

interface MasterplanViewerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  camera: CameraState;
  isDragging: boolean;
  viewMode: ViewMode;
  selectedPlot: PlotData | null;
  hoveredPlotId: string | null;
  showCategories: boolean;
  showStatus: boolean;
  onPlotClick: (plot: PlotData) => void;
  onPlotHover: (plotId: string | null) => void;
  onBackdropClick: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;
  listeners: Record<string, any>;
  wasDragged?: () => boolean;
}

export const MasterplanViewer: React.FC<MasterplanViewerProps> = ({
  containerRef,
  camera,
  isDragging,
  viewMode,
  selectedPlot,
  hoveredPlotId,
  showCategories,
  showStatus,
  onPlotClick,
  onPlotHover,
  onBackdropClick,
  listeners,
  wasDragged,
}) => {
  const is3D = viewMode === '3D';

  // Simple, normal 3D architectural isometric perspective state
  const [pitch, setPitch] = useState(28); // gentle 28° architectural tilt
  const [yaw, setYaw] = useState(-10); // subtle -10° isometric perspective

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${
        isDragging ? 'cursor-grabbing [&_*]:!cursor-grabbing' : 'cursor-grab'
      } ${
        viewMode === 'Satellite'
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
          : viewMode === 'Dark'
          ? 'bg-[#060a12]'
          : 'bg-[#1F1F1F]'
      }`}
      onPointerDown={listeners.onPointerDown}
      onPointerMove={listeners.onPointerMove}
      onPointerUp={listeners.onPointerUp}
      onPointerCancel={listeners.onPointerUp}
      onTouchStart={listeners.onTouchStart}
      onTouchMove={listeners.onTouchMove}
      onTouchEnd={listeners.onTouchEnd}
      onClick={(e) => {
        // If the user was dragging/panning the map, do not trigger deselect
        if (wasDragged && wasDragged()) return;

        // If clicking anywhere outside interactive plots and HUD controls, deselect
        const target = e.target as HTMLElement | SVGElement | null;
        const isInteractive = target?.closest(
          'button, a, input, select, textarea, [role="button"], #map-layer-2-interactive, #map-layer-3-interactive, [data-interactive="true"], .pointer-events-auto'
        );
        if (!isInteractive) {
          onBackdropClick();
        }
      }}
    >
      {/* 3D Perspective Wrapper */}
      <div
        className="w-full h-full transform-gpu"
        style={{
          perspective: is3D ? '1400px' : 'none',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* 3D Elevation & Isometric Rotation */}
        <div
          className="w-full h-full transform-gpu origin-center"
          style={{
            transform: is3D ? `rotateX(${pitch}deg) rotateZ(${yaw}deg)` : 'rotateX(0deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Camera Viewport: Pans and Zooms accurately in 2D and 3D */}
          <div
            className="w-full h-full origin-top-left transform-gpu"
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              transformOrigin: '0 0',
              transition: camera.isTransitioning
                ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
                : 'none',
              filter: is3D
                ? 'drop-shadow(0 40px 65px rgba(0,0,0,0.85)) drop-shadow(0 15px 30px rgba(0,0,0,0.6))'
                : 'none',
            }}
          >
            {/* Main Masterplan SVG */}
            <svg
              id="masterplan-svg"
              viewBox={`0 0 ${CANVAS_BOUNDS.width} ${CANVAS_BOUNDS.height}`}
              width={CANVAS_BOUNDS.width}
              height={CANVAS_BOUNDS.height}
              className="overflow-visible block"
              style={{
                shapeRendering: 'geometricPrecision',
                textRendering: 'geometricPrecision',
              }}
            >
              {/* Layer 1: Base Blueprint & Road Networks */}
              <SvgBaseBlueprint viewMode={viewMode} />

              {/* Layer 2 & 3: Masterplan Vector Interactive Plots & Hover FX */}
              <SvgInteractivePlots
                selectedPlotId={selectedPlot?.id ?? null}
                hoveredPlotId={hoveredPlotId}
                showCategories={showCategories}
                showStatus={showStatus}
                viewMode={viewMode}
                onPlotClick={onPlotClick}
                onPlotHover={onPlotHover}
                wasDragged={wasDragged}
              />

              {/* Layer 4: Active Selection Stroke & Glow */}
              <SvgHighlightStroke selectedPlot={selectedPlot} />
            </svg>
          </div>
        </div>
      </div>

      {/* 3D SIMPLE CONTROL BAR (Only displayed in 3D Mode) */}
      {is3D && (
        <div className="absolute top-20 left-4 sm:left-6 z-30 pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-[#1c1c1c]/90 border border-white/10 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>3D Isometric</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Preset Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setPitch(28); setYaw(-10); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                pitch === 28 && yaw === -10
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => { setPitch(20); setYaw(0); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                pitch === 20 && yaw === 0
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Top Tilt
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Simple Tilt Stepper / Slider */}
          <div className="flex items-center gap-1 text-xs text-slate-300 px-1">
            <span className="text-[10px] font-mono text-cyan-400">{pitch}°</span>
            <input
              type="range"
              min="0"
              max="45"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-16 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title="Adjust 3D tilt angle"
            />
          </div>

          {/* Reset View */}
          <button
            onClick={() => { setPitch(28); setYaw(-10); }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
            title="Reset 3D Angle"
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      )}

      {/* Subtle Scale & Status Indicator (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-white/10 backdrop-blur-md text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE MASTERPLAN</span>
        </span>
        <span className="text-white/20">|</span>
        <span>SCALE: {Math.round(camera.scale * 100)}%</span>
        <span className="text-white/20">|</span>
        <span>69 PLOTS</span>
      </div>
    </div>
  );
};
