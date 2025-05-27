import { useCallback, useEffect, useRef } from "react";

interface TouchHandler {
  onTouchStart?: (touches: TouchList, event: TouchEvent) => void;
  onTouchMove?: (touches: TouchList, event: TouchEvent) => void;
  onTouchEnd?: (touches: TouchList, event: TouchEvent) => void;
}

export const useMultiTouch = (handlers: TouchHandler) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = useCallback((event: TouchEvent) => {
    event.preventDefault();
    if (handlers.onTouchStart) {
      handlers.onTouchStart(event.touches, event);
    }
  }, [handlers.onTouchStart]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();
    if (handlers.onTouchMove) {
      handlers.onTouchMove(event.touches, event);
    }
  }, [handlers.onTouchMove]);
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    event.preventDefault();
    if (handlers.onTouchEnd) {
      handlers.onTouchEnd(event.touches, event);
    }
  }, [handlers.onTouchEnd]);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return elementRef;
};
