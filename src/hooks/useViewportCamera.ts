import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlotBBox, CameraState } from '../types/masterplan';
import { CANVAS_BOUNDS } from '../data/plotsData';

interface UseViewportCameraProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedBBox: PlotBBox | null;
  selectedCenter: [number, number] | null;
  isDrawerOpen: boolean;
}

export function useViewportCamera({
  containerRef,
  selectedBBox,
  selectedCenter,
  isDrawerOpen,
}: UseViewportCameraProps) {
  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: 0,
    scale: 0.35,
    isTransitioning: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; camX: number; camY: number }>({
    x: 0,
    y: 0,
    camX: 0,
    camY: 0,
  });

  const touchDistRef = useRef<number | null>(null);

  // Calculate idle overview camera parameters (fits entire masterplan with generous margin)
  const getIdleTransform = useCallback((): CameraState => {
    if (!containerRef.current) {
      return { x: 0, y: 0, scale: 0.35, isTransitioning: false };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const paddingX = 24;
    const paddingY = 24;
    const availW = rect.width - paddingX * 2;
    const availH = rect.height - paddingY * 2;

    const scaleX = availW / CANVAS_BOUNDS.width;
    const scaleY = availH / CANVAS_BOUNDS.height;
    const scale = Math.min(scaleX, scaleY);

    const x = (rect.width - CANVAS_BOUNDS.width * scale) / 2;
    const y = (rect.height - CANVAS_BOUNDS.height * scale) / 2;

    return { x, y, scale, isTransitioning: true };
  }, [containerRef]);

  // Calculate focused camera parameters for a selected plot
  const getFocusTransform = useCallback(
    (bbox: PlotBBox, center: [number, number]): CameraState => {
      if (!containerRef.current) {
        return { x: 0, y: 0, scale: 0.35, isTransitioning: false };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const isDesktop = rect.width >= 768;

      let targetScreenX: number;
      let targetScreenY: number;
      let availW: number;
      let availH: number;

      if (isDesktop && isDrawerOpen) {
        const drawerW = Math.min(410, rect.width * 0.36);
        availW = rect.width - drawerW;
        availH = rect.height;
        targetScreenX = drawerW + availW / 2;
        targetScreenY = availH / 2;
      } else if (!isDesktop && isDrawerOpen) {
        const sheetH = Math.min(320, rect.height * 0.42);
        availW = rect.width;
        availH = rect.height - sheetH;
        targetScreenX = availW / 2;
        targetScreenY = availH / 2;
      } else {
        availW = rect.width;
        availH = rect.height;
        targetScreenX = rect.width / 2;
        targetScreenY = rect.height / 2;
      }

      const PLOT_FILL = 0.42;
      const targetW = Math.max(bbox.width, 420);
      const targetH = Math.max(bbox.height, 420);

      const scaleX = (availW * PLOT_FILL) / targetW;
      const scaleY = (availH * PLOT_FILL) / targetH;
      let targetScale = Math.min(scaleX, scaleY);
      targetScale = Math.max(0.24, Math.min(0.58, targetScale));

      const x = targetScreenX - center[0] * targetScale;
      const y = targetScreenY - center[1] * targetScale;

      return { x, y, scale: targetScale, isTransitioning: true };
    },
    [containerRef, isDrawerOpen]
  );

  // Auto-focus when selection changes or window resizes
  useEffect(() => {
    let timer: number;
    if (selectedBBox && selectedCenter) {
      const target = getFocusTransform(selectedBBox, selectedCenter);
      setCamera({ ...target, isTransitioning: true });
      timer = window.setTimeout(() => {
        setCamera(prev => ({ ...prev, isTransitioning: false }));
      }, 340);
    } else {
      const idle = getIdleTransform();
      setCamera({ ...idle, isTransitioning: true });
      timer = window.setTimeout(() => {
        setCamera(prev => ({ ...prev, isTransitioning: false }));
      }, 340);
    }

    return () => window.clearTimeout(timer);
  }, [selectedBBox, selectedCenter, isDrawerOpen, getIdleTransform, getFocusTransform]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (selectedBBox && selectedCenter) {
        setCamera({
          ...getFocusTransform(selectedBBox, selectedCenter),
          isTransitioning: false,
        });
      } else {
        setCamera({
          ...getIdleTransform(),
          isTransitioning: false,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedBBox, selectedCenter, getIdleTransform, getFocusTransform]);

  // Manual zoom in / out helpers
  const zoomBy = useCallback((factor: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setCamera(prev => {
      const newScale = Math.max(0.08, Math.min(5.5, prev.scale * factor));
      const newX = centerX - (centerX - prev.x) * (newScale / prev.scale);
      const newY = centerY - (centerY - prev.y) * (newScale / prev.scale);
      return {
        x: newX,
        y: newY,
        scale: newScale,
        isTransitioning: true,
      };
    });

    setTimeout(() => {
      setCamera(prev => ({ ...prev, isTransitioning: false }));
    }, 250);
  }, [containerRef]);

  // Reset camera to idle overview
  const resetCamera = useCallback(() => {
    const idle = getIdleTransform();
    setCamera({ ...idle, isTransitioning: true });
    setTimeout(() => {
      setCamera(prev => ({ ...prev, isTransitioning: false }));
    }, 340);
  }, [getIdleTransform]);

  // Intercept Ctrl + Keyboard zoom (+, -, 0) to zoom SVG instead of browser page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') {
          e.preventDefault();
          zoomBy(1.25);
        } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault();
          zoomBy(0.8);
        } else if (e.key === '0') {
          e.preventDefault();
          resetCamera();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomBy, resetCamera]);

  // Prevent trackpad / touch gesture zoom on browser level
  useEffect(() => {
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // Global Wheel handler: ONLY zooms the SVG map; prevents whole website buttons from zooming!
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If user is scrolling inside a scrollable drawer or modal, let normal panel scroll proceed
      const target = e.target as HTMLElement | null;
      const isScrollable = target?.closest('.custom-scrollbar, [data-scrollable="true"]');
      if (isScrollable) {
        return;
      }

      // Intercept and prevent ANY browser page zoom or page scrolling
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Smooth zoom step
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

      setCamera(prev => {
        const newScale = Math.max(0.08, Math.min(5.5, prev.scale * zoomFactor));
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        return {
          x: newX,
          y: newY,
          scale: newScale,
          isTransitioning: false,
        };
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [containerRef]);

  const dragDistanceRef = useRef(0);
  const isPointerDownRef = useRef(false);

  // Pointer drag handling (mouse and single touch)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isPointerDownRef.current = true;
    dragDistanceRef.current = 0;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  }, [camera.x, camera.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // CRITICAL: NEVER pan or drag unless the pointer is actively held down!
    if (!isPointerDownRef.current) return;
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      isPointerDownRef.current = false;
      setIsDragging(false);
      return;
    }

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    dragDistanceRef.current = dist;

    // Only pan if user deliberately dragged beyond 8px threshold
    if (dist > 8) {
      if (!isDragging) {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      setIsDragging(true);
      setCamera(prev => ({
        ...prev,
        x: dragStartRef.current.camX + dx,
        y: dragStartRef.current.camY + dy,
        isTransitioning: false,
      }));
    }
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch (_) {}
    setIsDragging(false);
    // Reset drag distance shortly after click handler has finished evaluating
    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 50);
  }, []);

  // Multi-touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchDistRef.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current !== null && containerRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = newDist / touchDistRef.current;
      touchDistRef.current = newDist;

      const rect = containerRef.current.getBoundingClientRect();
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      setCamera(prev => {
        const newScale = Math.max(0.08, Math.min(5.5, prev.scale * factor));
        const newX = midX - (midX - prev.x) * (newScale / prev.scale);
        const newY = midY - (midY - prev.y) * (newScale / prev.scale);
        return {
          x: newX,
          y: newY,
          scale: newScale,
          isTransitioning: false,
        };
      });
    }
  }, [containerRef]);

  const handleTouchEnd = useCallback(() => {
    touchDistRef.current = null;
  }, []);

  return {
    camera,
    isDragging,
    wasDragged: () => dragDistanceRef.current > 8,
    resetCamera,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(0.8),
    zoomToArea: (bbox: PlotBBox, center: [number, number]) => {
      const target = getFocusTransform(bbox, center);
      setCamera({ ...target, isTransitioning: true });
      setTimeout(() => {
        setCamera(prev => ({ ...prev, isTransitioning: false }));
      }, 340);
    },
    listeners: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
