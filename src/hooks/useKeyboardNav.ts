import { useEffect } from 'react';

interface UseKeyboardNavProps {
  onReset: () => void;
  onNextPlot: () => void;
  onPrevPlot: () => void;
  onFocusSearch: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
}

export function useKeyboardNav({
  onReset,
  onNextPlot,
  onPrevPlot,
  onFocusSearch,
  onZoomIn,
  onZoomOut,
  isModalOpen,
  onCloseModal,
}: UseKeyboardNavProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (isModalOpen) {
          onCloseModal();
        } else {
          onReset();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onNextPlot();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onPrevPlot();
      } else if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onFocusSearch();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        onZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        onZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onReset,
    onNextPlot,
    onPrevPlot,
    onFocusSearch,
    onZoomIn,
    onZoomOut,
    isModalOpen,
    onCloseModal,
  ]);
}
