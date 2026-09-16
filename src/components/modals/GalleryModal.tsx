import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IconX, IconChevronLeft, IconChevronRight } from '../common/Icons';
import type { GalleryPhoto } from '../../data/galleryPhotos';
import { adminStore } from '../../services/adminStore';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => adminStore.getGalleryPhotos());

  useEffect(() => {
    if (!isOpen) return;
    setPhotos(adminStore.getGalleryPhotos());
    adminStore.syncWithCloud();

    const unsubscribe = adminStore.subscribe(() => {
      setPhotos(adminStore.getGalleryPhotos());
    });
    return unsubscribe;
  }, [isOpen]);

  const allPhotos = photos;

  // Lightbox state: if selectedPhoto is non-null, the zoom lightbox is active
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Zoom and pan state for the lightbox
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom and pan whenever photo changes or closes
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    resetZoom();
  };

  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
    resetZoom();
  };

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const prev = selectedPhotoIndex === 0 ? allPhotos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(prev);
    resetZoom();
  }, [selectedPhotoIndex, resetZoom, allPhotos.length]);

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const next = selectedPhotoIndex === allPhotos.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(next);
    resetZoom();
  }, [selectedPhotoIndex, resetZoom, allPhotos.length]);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleToggleZoom = () => {
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          handleCloseLightbox();
        } else {
          onClose();
        }
      }
      if (selectedPhotoIndex !== null) {
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'ArrowRight') handleNextPhoto();
        if (e.key === '+' || e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
        if (e.key === '0') resetZoom();
      }
    },
    [isOpen, selectedPhotoIndex, onClose, handlePrevPhoto, handleNextPhoto, resetZoom]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Pointer panning handlers for lightbox
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomScale <= 1) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (selectedPhotoIndex === null) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.25, 4));
    } else {
      setZoomScale(prev => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  if (!isOpen) return null;

  const currentPhoto: GalleryPhoto | null =
    selectedPhotoIndex !== null ? allPhotos[selectedPhotoIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (selectedPhotoIndex !== null) {
            handleCloseLightbox();
          } else {
            onClose();
          }
        }
      }}
    >
      {/* ============================================================
          MAIN MODAL CONTAINER (Single scrollable page for photos)
          ============================================================ */}
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#141820] border border-white/15 text-white shadow-2xl flex flex-col h-[90vh] max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar matching reference site */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex-shrink-0 bg-slate-950/80">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Dinanath Industrial Park — Site Photo Gallery</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
                {allPhotos.length} Photos
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real site photographs, development progress &amp; infrastructure
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="Close Gallery (Esc)"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Scrollable Photos Page */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 custom-scrollbar">
          {allPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading site photographs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => handleOpenPhoto(index)}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-amber-400/50 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-400/10 flex flex-col"
                >
                  {/* Photo Aspect Ratio Box */}
                  <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={photo.url}
                      alt={photo.alt || photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                    />

                    {/* Dark gradient on bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Hover Click to Zoom Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 scale-90 group-hover:scale-100 transition-transform">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        <span>Click to Zoom</span>
                      </span>
                    </div>
                  </div>

                  {/* Photo Caption / Title */}
                  <div className="p-3 bg-[#191e28] flex items-center justify-between gap-2 border-t border-white/5">
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-200 truncate" title={photo.title}>
                        {photo.title}
                      </h3>
                      {photo.date && (
                        <p className="text-[10px] text-slate-400 truncate">{photo.date}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono shrink-0 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any photo to open full-screen zoom view</span>
          <span className="font-mono text-slate-500 hidden sm:inline">Use mouse wheel or + / - to zoom</span>
        </div>
      </div>

      {/* ============================================================
          FULL-SCREEN ZOOM LIGHTBOX (When user clicks any photo)
          ============================================================ */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between animate-in fade-in duration-150 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseLightbox();
          }}
          onWheel={handleWheel}
        >
          {/* Lightbox Top Control Bar */}
          <div className="w-full px-4 py-3 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md z-20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={handleCloseLightbox}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              >
                <IconX size={14} />
                <span>Back to Photos</span>
              </button>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {currentPhoto.title}
              </h3>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ({selectedPhotoIndex! + 1} / {allPhotos.length})
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all"
                title="Zoom Out (-)"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <span className="font-mono text-xs font-bold text-cyan-400 px-2 min-w-[50px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all"
                title="Zoom In (+)"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <button
                onClick={resetZoom}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-slate-200 transition-all hidden sm:inline"
                title="Reset Zoom (0)"
              >
                Reset
              </button>

              <a
                href={currentPhoto.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 transition-all"
                title="Open original resolution in new tab"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Lightbox Center Image Stage (Supports Zoom, Pan & Double Click) */}
          <div
            className="relative w-full flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleToggleZoom}
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl select-none pointer-events-none"
              draggable={false}
            />

            {/* Previous Photo Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all active:scale-90 shadow-2xl z-10"
              title="Previous Photo (Left Arrow)"
            >
              <IconChevronLeft size={22} />
            </button>

            {/* Next Photo Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all active:scale-90 shadow-2xl z-10"
              title="Next Photo (Right Arrow)"
            >
              <IconChevronRight size={22} />
            </button>
          </div>

          {/* Lightbox Bottom Info Bar */}
          <div className="w-full px-4 py-2.5 sm:px-6 flex items-center justify-between border-t border-white/10 bg-black/60 backdrop-blur-md text-xs text-slate-400 z-20">
            <span className="truncate">{currentPhoto.title}</span>
            <span className="hidden sm:inline font-mono">
              Double-click to toggle 2.5x zoom • Drag to pan
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
