import { useEffect, useCallback, useRef } from "react";
import { TouchCircle } from "./TouchCircle";
import { useGameState } from "@/lib/stores/useGameState";
import { useMultiTouch } from "@/lib/hooks/useMultiTouch";

export const GameBoard = () => {
  const {
    mode,
    setMode,
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

  // Render fixed mode (previous way: set buttons)
  if (mode === 'fixed') {
    // Example: render 8 fixed buttons in a circle
    const CIRCLE_COUNT = 8;
    const CIRCLE_SIZE = 120;
    const circlePositions = Array.from({ length: CIRCLE_COUNT }, (_, i) => {
      const angle = (i * 360) / CIRCLE_COUNT;
      const centerX = 50;
      const centerY = 50;
      const radius = 25;
      const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
      const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
      return { x, y };
    });
    return (
      <div className={`w-full h-full bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 relative overflow-hidden touch-none select-none`}>
        <button
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/80 rounded shadow text-black font-bold hover:bg-white"
          onClick={() => setMode('dynamic')}
        >
          Switch to Dynamic Mode
        </button>
        {circlePositions.map((pos, i) => (
          <TouchCircle
            key={i}
            id={i}
            position={{ x: pos.x, y: pos.y }}
            number={i + 1}
            size={CIRCLE_SIZE}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={touchRef}
      className={`w-full h-full bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 relative overflow-hidden touch-none select-none`}
    >
      {/* Game mode toggle button */}
      <button
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/80 rounded shadow text-black font-bold hover:bg-white"
        onClick={() => setMode(mode === 'dynamic' ? 'fixed' : 'dynamic')}
      >
        Switch to {mode === 'dynamic' ? 'Set Buttons' : 'Dynamic'} Mode
      </button>
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
          size={120}
        />
      ))}
    </div>
  );
};
