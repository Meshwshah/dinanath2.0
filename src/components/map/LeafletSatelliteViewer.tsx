import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { googleMapsDirectionsUrl } from '../../data/siteConfig';
import { IconX, IconCompass, IconGallery, IconInfo, IconZoomIn, IconZoomOut } from '../common/Icons';

interface LeafletSatelliteViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  onOpenGallery?: () => void;
}

// Calibrated georeferenced coordinates fitted to ground-truth GPS landmarks
// Eliminates margin stretching and ensures layout precisely fills the space between coordinates
const CALIBRATED_SOUTH = 22.1004174;
const CALIBRATED_NORTH = 22.1022930;
const CALIBRATED_WEST  = 73.1711549;
const CALIBRATED_EAST  = 73.1745380;
const CALIBRATED_CENTER_LAT = (CALIBRATED_SOUTH + CALIBRATED_NORTH) / 2; // 22.1013552
const CALIBRATED_CENTER_LNG = (CALIBRATED_WEST + CALIBRATED_EAST) / 2;   // 73.1728465

export const LeafletSatelliteViewer: React.FC<LeafletSatelliteViewerProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  onOpenGallery,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  // States
  const [mapReady, setMapReady] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.88);
  const [showInfo, setShowInfo] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [CALIBRATED_CENTER_LAT, CALIBRATED_CENTER_LNG],
        zoom: 17,
        maxZoom: 20,
        minZoom: 13,
        zoomControl: false,
      });

      // Default to Google Hybrid Satellite Layer
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: 'Google Maps Satellite Imagery',
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    } else {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [isOpen]);

  // Redraw Blueprint Image Overlay with calibrated coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) return;

    // Remove previous overlay if exists
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    const bounds: L.LatLngBoundsExpression = [
      [CALIBRATED_SOUTH, CALIBRATED_WEST],
      [CALIBRATED_NORTH, CALIBRATED_EAST],
    ];

    // Blueprint CAD Image Overlay
    const overlay = L.imageOverlay(`${import.meta.env.BASE_URL}masterplan-layout-satellite.webp`, bounds, {
      opacity: overlayOpacity,
      interactive: true,
    }).addTo(map);
    overlayRef.current = overlay;
  }, [mapReady, overlayOpacity]);

  const handleRecenter = () => {
    mapInstanceRef.current?.setView([CALIBRATED_CENTER_LAT, CALIBRATED_CENTER_LNG], 17, { animate: true });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col animate-fade-in select-none">
      {/* Map Container */}
      <div className="relative w-full h-full overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* ================= FLOATING TOP CONTROLS BAR ================= */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Park Branding */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            DP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide">DINANATH INDUSTRIAL PARK</span>
              <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Satellite View
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Manglej, Karjan, Gujarat • 22°06'01.8"N 73°10'27.2"E</div>
          </div>
        </div>

        {/* View Controls: Opacity & Close */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-2xl">
          {/* Opacity Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400 font-medium">Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.02"
              value={overlayOpacity}
              onChange={e => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-sky-400 font-mono text-[11px] w-7 text-right font-bold">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>

          {/* Close Map View */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold transition-all shadow-md flex items-center justify-center ml-1"
            title="Close Map View"
          >
            <IconX size={18} />
          </button>
        </div>
      </div>

      {/* ================= FLOATING RIGHT ACTION BUTTONS ================= */}
      <div className="absolute right-4 top-24 z-[1000] flex flex-col gap-2.5 pointer-events-auto">
        {/* Recenter Map Button */}
        <button
          onClick={handleRecenter}
          className="w-11 h-11 rounded-2xl bg-slate-900/90 text-slate-300 border border-slate-700/70 hover:bg-slate-800 hover:text-white flex items-center justify-center shadow-2xl transition-all"
          title="Recenter Map on Dinanath Park"
        >
          <IconCompass size={20} />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 rounded-2xl bg-slate-900/90 text-slate-300 border border-slate-700/70 hover:bg-slate-800 hover:text-white flex items-center justify-center shadow-2xl transition-all"
          title="Zoom In"
        >
          <IconZoomIn size={20} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 rounded-2xl bg-slate-900/90 text-slate-300 border border-slate-700/70 hover:bg-slate-800 hover:text-white flex items-center justify-center shadow-2xl transition-all"
          title="Zoom Out"
        >
          <IconZoomOut size={20} />
        </button>
      </div>

      {/* ================= FLOATING BOTTOM ACTION BAR ================= */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 pointer-events-auto bg-slate-900/95 backdrop-blur-lg px-4 py-2 rounded-full border border-slate-700/70 shadow-2xl max-w-[95vw] overflow-x-auto">
        {/* Gallery Modal Opener */}
        {onOpenGallery && (
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all"
          >
            <IconGallery size={15} />
            <span>Gallery</span>
          </button>
        )}

        {/* Project Info Drawer Opener */}
        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all"
        >
          <IconInfo size={15} />
          <span>Info</span>
        </button>

        {/* Locate in Real World (Google Maps Directions) */}
        <a
          href={googleMapsDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all"
        >
          <IconCompass size={15} />
          <span>Locate</span>
        </a>

        {/* Contact Direct */}
        <button
          onClick={onOpenContact}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <span>Inquire Site</span>
        </button>
      </div>

      {/* ================= PROJECT INFO DRAWER / MODAL ================= */}
      {showInfo && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-black text-base shadow-lg">
                  DP
                </div>
                <div>
                  <h3 className="font-black text-base text-white">DINANATH INDUSTRIAL PARK</h3>
                  <p className="text-xs text-slate-400">Manglej, Karjan, Vadodara, Gujarat</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <div className="font-bold text-sky-400 mb-1">Strategic Industrial Location</div>
                <p className="text-slate-300 leading-relaxed">
                  Located right on the Dedicated Freight & NH-48 Industrial Growth Corridor with 18.00m Wide Naliya
                  Road ingress, engineered for 40ft triple-axle container movement and heavy manufacturing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Area</div>
                  <div className="text-sm font-black text-white">33,493 SMT</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Plots</div>
                  <div className="text-sm font-black text-white">69 Units</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Road Network</div>
                  <div className="text-sm font-black text-white">18m, 17.5m, 12m, 9m</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">NH-48 Corridor</div>
                  <div className="text-sm font-black text-white">1.8 km</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={googleMapsDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-center transition-all text-white"
              >
                Google Maps Navigation
              </a>
              <button
                onClick={() => setShowInfo(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
