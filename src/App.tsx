import { useState, useRef, useEffect, useCallback } from 'react';
import type { PlotData, ViewMode, ToastMessage } from './types/masterplan';
import { PLOTS_DATA } from './data/plotsData';
import { SITE } from './data/siteConfig';
import { useViewportCamera } from './hooks/useViewportCamera';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { MasterplanViewer } from './components/map/MasterplanViewer';
import { PlotInfoDrawer } from './components/drawer/PlotInfoDrawer';
import { FloatingHudDock } from './components/hud/FloatingHudDock';
import { HeaderBar } from './components/common/HeaderBar';
import { ProjectInfoModal } from './components/modals/ProjectInfoModal';
import { GalleryModal } from './components/modals/GalleryModal';
import { InquiryModal } from './components/modals/InquiryModal';
import { ContactModal } from './components/modals/ContactModal';
import { LeafletSatelliteViewer } from './components/map/LeafletSatelliteViewer';
import { ToastContainer } from './components/common/Toast';

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Masterplan selection and view state
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Layer toggles & View Mode
  const [showCategories, setShowCategories] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('PDF');

  // Modals state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);
  const [inquiryPlot, setInquiryPlot] = useState<PlotData | null>(null);
  const [highlightedPlotIds, setHighlightedPlotIds] = useState<string[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Viewport camera hook with panel offset calculations & gestures
  const {
    camera,
    isDragging,
    wasDragged,
    resetCamera,
    zoomIn,
    zoomOut,
    zoomToArea,
    listeners,
  } = useViewportCamera({
    containerRef,
    selectedBBox: selectedPlot ? selectedPlot.bbox : null,
    selectedCenter: selectedPlot ? selectedPlot.center : null,
    isDrawerOpen,
  });

  // Plot selection handler
  const handleSelectPlot = useCallback((plot: PlotData) => {
    setHighlightedPlotIds([]);
    if (selectedPlot?.id === plot.id && isDrawerOpen) {
      // If clicking the currently selected plot while drawer is already open, toggle closed
      setSelectedPlot(null);
      setIsDrawerOpen(false);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Open plot details popup drawer
      setSelectedPlot(plot);
      setIsDrawerOpen(true);
      window.history.replaceState({}, '', `?plot=${plot.number}`);
    }
  }, [selectedPlot, isDrawerOpen]);

  // Deselect / Reset handler
  const handleReset = useCallback(() => {
    setSelectedPlot(null);
    setHighlightedPlotIds([]);
    setIsDrawerOpen(false);
    resetCamera();
    window.history.replaceState({}, '', window.location.pathname);
  }, [resetCamera]);

  // Toggle Categories handler (brighten / lighten)
  const handleToggleCategories = useCallback(() => {
    setShowCategories(prev => {
      const next = !prev;
      if (next) {
        setShowStatus(false);
      }
      return next;
    });
  }, []);

  // Toggle Status handler (activates inventory status view)
  const handleToggleStatus = useCallback(() => {
    setShowStatus(prev => {
      const next = !prev;
      if (next) {
        setShowCategories(false);
      } else {
        setShowCategories(true);
      }
      return next;
    });
  }, []);

  // Cycle to Previous Plot
  const handlePrevPlot = useCallback(() => {
    if (!selectedPlot) {
      handleSelectPlot(PLOTS_DATA[0]);
      return;
    }
    const currentIndex = PLOTS_DATA.findIndex(p => p.id === selectedPlot.id);
    const prevIndex = (currentIndex - 1 + PLOTS_DATA.length) % PLOTS_DATA.length;
    handleSelectPlot(PLOTS_DATA[prevIndex]);
  }, [selectedPlot, handleSelectPlot]);

  // Cycle to Next Plot
  const handleNextPlot = useCallback(() => {
    if (!selectedPlot) {
      handleSelectPlot(PLOTS_DATA[0]);
      return;
    }
    const currentIndex = PLOTS_DATA.findIndex(p => p.id === selectedPlot.id);
    const nextIndex = (currentIndex + 1) % PLOTS_DATA.length;
    handleSelectPlot(PLOTS_DATA[nextIndex]);
  }, [selectedPlot, handleSelectPlot]);

  // Share handler
  const handleShare = useCallback((plotToShare?: PlotData | null) => {
    const targetPlot = plotToShare || selectedPlot;
    const url = targetPlot
      ? `${window.location.origin}${window.location.pathname}?plot=${targetPlot.number}`
      : window.location.href;

    const title = targetPlot
      ? `${targetPlot.label} (${targetPlot.areaSmt} SMT) - ${SITE.name}`
      : `${SITE.name} Masterplan`;

    if (navigator.share) {
      navigator
        .share({
          title,
          text: `Check out ${targetPlot ? targetPlot.label : 'masterplan plots'} at ${SITE.name}, Manglej, Karjan:`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        addToast('Link copied to clipboard!', 'success');
      });
    }
  }, [selectedPlot, addToast]);

  // Open inquiry modal for specific plot
  const handleOpenInquiry = useCallback((plot: PlotData) => {
    setInquiryPlot(plot);
    setIsInquiryOpen(true);
  }, []);

  // Sq.ft range search zoom handler
  const handleSelectRange = useCallback((min: number, max: number, matchedPlots: PlotData[]) => {
    if (!matchedPlots.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    matchedPlots.forEach(p => {
      minX = Math.min(minX, p.bbox.x);
      minY = Math.min(minY, p.bbox.y);
      maxX = Math.max(maxX, p.bbox.x + p.bbox.width);
      maxY = Math.max(maxY, p.bbox.y + p.bbox.height);
    });
    const bbox = {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 400),
      height: Math.max(maxY - minY, 400),
    };
    const center: [number, number] = [minX + bbox.width / 2, minY + bbox.height / 2];
    zoomToArea(bbox, center);
    setHighlightedPlotIds(matchedPlots.map(p => p.id));
    addToast(`Zoomed & highlighted ${matchedPlots.length} plots (${min.toLocaleString()} – ${max.toLocaleString()} sq.ft)`, 'info');
  }, [zoomToArea, addToast]);

  // Keyboard navigation shortcuts
  const isAnyModalOpen = isGalleryOpen || isInfoOpen || isInquiryOpen || isContactOpen || isMapViewOpen;
  const handleCloseAllModals = useCallback(() => {
    setIsGalleryOpen(false);
    setIsInfoOpen(false);
    setIsInquiryOpen(false);
    setIsContactOpen(false);
    setIsMapViewOpen(false);
  }, []);

  useKeyboardNav({
    onReset: handleReset,
    onNextPlot: handleNextPlot,
    onPrevPlot: handlePrevPlot,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    isModalOpen: isAnyModalOpen,
    onCloseModal: handleCloseAllModals,
  });

  // URL Deep-Linking on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plotParam = params.get('plot');
    if (plotParam) {
      const match = PLOTS_DATA.find(
        p => p.number.toString() === plotParam || p.id === `plot-${plotParam}`
      );
      if (match) {
        setSelectedPlot(match);
        setIsDrawerOpen(true);
      }
    }
  }, []);

  return (
    <div className={`relative w-screen h-[100dvh] overflow-hidden ${
      'bg-[#1F1F1F]'
    } text-slate-100 font-sans`}>
      {/* Top Glass Header Bar with 4 action buttons matching user reference */}
      <HeaderBar
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Interactive SVG Masterplan Stage */}
      <main className="w-full h-full">
        <MasterplanViewer
          containerRef={containerRef}
          camera={camera}
          isDragging={isDragging}
          viewMode={viewMode}
          selectedPlot={selectedPlot}
          hoveredPlotId={hoveredPlotId}
          highlightedPlotIds={highlightedPlotIds}
          showCategories={showCategories}
          showStatus={showStatus}
          onPlotClick={handleSelectPlot}
          onPlotHover={setHoveredPlotId}
          onBackdropClick={handleReset}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetCamera={handleReset}
          listeners={listeners}
          wasDragged={wasDragged}
        />
      </main>

      {/* Slide-Out Info Drawer (Desktop Left / Mobile Bottom Sheet) */}
      <PlotInfoDrawer
        plot={selectedPlot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPrevPlot={handlePrevPlot}
        onNextPlot={handleNextPlot}
        onOpenInquiry={handleOpenInquiry}
        onShare={handleShare}
      />

      {/* Floating HUD Dock (Bottom-Right) matching user reference */}
      <FloatingHudDock
        showCategories={showCategories}
        showStatus={showStatus}
        onToggleCategories={handleToggleCategories}
        onToggleStatus={handleToggleStatus}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          if (mode === 'Satellite') {
            setIsMapViewOpen(true);
          }
          setViewMode(mode);
        }}
        onSelectPlot={handleSelectPlot}
        onSelectRange={handleSelectRange}
        onOpenMapView={() => setIsMapViewOpen(true)}
        onShare={() => handleShare()}
        onReset={handleReset}
        searchRef={searchInputRef}
      />

      {/* Project Overview Modal */}
      <ProjectInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Media & Drone Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Priority Booking & WhatsApp Inquiry Modal */}
      <InquiryModal
        plot={inquiryPlot || selectedPlot}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        onSuccessToast={msg => addToast(msg, 'success')}
      />

      {/* Contact Direct Modal (+91 6354 045 409) */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Leaflet Satellite Map Viewer with Georeferenced Masterplan Overlay */}
      <LeafletSatelliteViewer
        isOpen={isMapViewOpen}
        onClose={() => {
          setIsMapViewOpen(false);
          if (viewMode === 'Satellite') {
            setViewMode('PDF');
          }
        }}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      {/* Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
