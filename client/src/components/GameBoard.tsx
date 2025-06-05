import { useEffect, useCallback, useRef } from "react";
import { TouchCircle } from "./TouchCircle";
import { useGameState } from "@/lib/stores/useGameState";
import { useMultiTouch } from "@/lib/hooks/useMultiTouch";

const CIRCLE_SIZE = 120;

export const GameBoard = () => {
  const {
    phase,
    pointers,
    addPointer,
    updatePointer,
    removePointer,
    resetPointers
  } = useGameState();

  // --- Pointer/mouse event handlers ---
  const pointerDownRef = useRef(false);

  // Mouse events
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = true;
      addPointer(9999, e.clientX, e.clientY); // 9999: single mouse pointer id
    };
    const handlePointerMove = (e: MouseEvent) => {
      if (!pointerDownRef.current) return;
      updatePointer(9999, e.clientX, e.clientY);
    };
    const handlePointerUp = () => {
      pointerDownRef.current = false;
      removePointer(9999);
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [addPointer, updatePointer, removePointer]);

  // Touch events (multi-touch)
  const touchRef = useMultiTouch({
    onTouchStart: (touches) => {
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        addPointer(t.identifier, t.clientX, t.clientY);
      }
    },
    onTouchMove: (touches) => {
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        updatePointer(t.identifier, t.clientX, t.clientY);
      }
    },
    onTouchEnd: (touches, event) => {
      // Remove ended touches
      const activeIds = new Set(Array.from(touches).map(t => t.identifier));
      for (let i = 0; i < event.changedTouches.length; i++) {
        const t = event.changedTouches[i];
        if (!activeIds.has(t.identifier)) {
          removePointer(t.identifier);
        }
      }
    }
  });

  // Clean up all pointers on unmount
  useEffect(() => {
    return () => {
      resetPointers();
    };
  }, [resetPointers]);

  // --- UI ---
  const getBackgroundGradient = () => {
    switch (phase) {
      case "waiting":
        return "from-purple-900 via-purple-800 to-indigo-900";
      case "ready":
        return "from-green-900 via-emerald-800 to-teal-900";
      case "countdown":
        return "from-yellow-900 via-orange-800 to-red-900";
      case "selection":
        return "from-blue-900 via-indigo-800 to-purple-900";
      case "reveal":
        return "from-red-900 via-pink-800 to-purple-900";
      default:
        return "from-gray-900 via-gray-800 to-black";
    }
  };

  return (
    <div
      ref={touchRef}
      className={`w-full h-full bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 relative overflow-hidden touch-none select-none`}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 50 + 10}px`,
              height: `${Math.random() * 50 + 10}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
      {/* Dynamic touch/mouse circles */}
      {Array.from(pointers.values()).map(pointer => (
        <TouchCircle
          key={pointer.id}
          id={pointer.id}
          position={{ x: (pointer.x / window.innerWidth) * 100, y: (pointer.y / window.innerHeight) * 100 }}
          number={pointer.number}
          size={CIRCLE_SIZE}
        />
      ))}
    </div>
  );
};
