import { useEffect, useRef, useState } from "react";
import { TouchCircle } from "./TouchCircle";
import { useGameState } from "@/lib/stores/useGameState";
import { useMultiTouch } from "@/lib/hooks/useMultiTouch";

export const GameBoard = () => {
  const gameState = useGameState();
  const {
    phase,
    pointers,
    addPointer,
    updatePointer,
    removePointer,
    resetPointers
  }: any = gameState;

  const pointerDownRef = useRef(false);
  // --- Countdown and selection state ---
  const [selectionState, setSelectionState] = useState<{ selecting: boolean; selectedId: number | null; countdown: number }>({ selecting: false, selectedId: null, countdown: 3 });
  const selectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const prevPointerCount = useRef(0);
  const prevPointerSet = useRef<any[]>([]);

  useEffect(() => {
    const pointerCount = pointers.size;
    // Start countdown if going from 0 to >0 pointers and not already selecting
    if (
      prevPointerCount.current === 0 && pointerCount > 0 &&
      !selectionState.selecting && selectionState.selectedId === null
    ) {
      setSelectionState({ selecting: true, selectedId: null, countdown: 3 });
      let localCount = 3;
      countdownInterval.current = setInterval(() => {
        localCount -= 1;
        setSelectionState(prev => {
          if (!prev.selecting) return prev;
          if (localCount > 0) {
            return { ...prev, countdown: localCount };
          } else {
            clearInterval(countdownInterval.current!);
            return { ...prev, countdown: 0 };
          }
        });
      }, 1000);
      selectionTimeout.current = setTimeout(() => {
        // Pick winner from current or last pointer set
        const pointerArr = Array.from(pointers.values());
        const candidates = pointerArr.length > 0 ? pointerArr : prevPointerSet.current;
        if (candidates.length > 0) {
          const winner = candidates[Math.floor(Math.random() * candidates.length)];
          setSelectionState({ selecting: false, selectedId: winner.id, countdown: 0 });
        } else {
          setSelectionState({ selecting: false, selectedId: null, countdown: 0 });
        }
      }, 3000);
    }
    // Only reset selection state if not currently selecting (i.e., before countdown starts)
    if (pointerCount === 0 && !selectionState.selecting && selectionState.selectedId === null) {
      setSelectionState({ selecting: false, selectedId: null, countdown: 3 });
      if (selectionTimeout.current) clearTimeout(selectionTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
    // Track the last non-empty pointer set for winner selection if all pointers are removed
    if (pointerCount > 0) {
      prevPointerSet.current = Array.from(pointers.values());
    }
    prevPointerCount.current = pointerCount;
    // Only clear intervals/timeouts on unmount
    return () => {
      if (selectionTimeout.current) clearTimeout(selectionTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [pointers.size, selectionState.selecting, selectionState.selectedId]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = true;
      addPointer(9999, e.clientX, e.clientY);
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
      const activeIds = new Set(Array.from(touches).map(t => t.identifier));
      for (let i = 0; i < event.changedTouches.length; i++) {
        const t = event.changedTouches[i];
        if (!activeIds.has(t.identifier)) {
          removePointer(t.identifier);
        }
      }
    }
  });

  useEffect(() => {
    return () => {
      resetPointers();
    };
  }, [resetPointers]);

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
      {/* Instructions and countdown/winner text */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 z-50 text-2xl font-bold text-white drop-shadow-lg">
        {pointers.size === 0 && selectionState.selectedId === null && (
          <span>Touch or click to join</span>
        )}
        {pointers.size > 0 && selectionState.selecting && (
          <span>Get ready... {selectionState.countdown}</span>
        )}
        {selectionState.selectedId !== null && (
          <span className="text-yellow-300 animate-bounce">🎉 Player Selected! 🎉</span>
        )}
      </div>
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
      {/* Show all circles if not selected, otherwise only the winner */}
      {selectionState.selectedId === null
        ? Array.from(pointers.values()).map(pointer => {
            const p = pointer as any;
            return (
              <TouchCircle
                key={p.id}
                id={p.id}
                position={{ x: (p.x / window.innerWidth) * 100, y: (p.y / window.innerHeight) * 100 }}
                number={p.number}
                size={120}
              />
            );
          })
        : Array.from(pointers.values()).map(pointer => {
            const p = pointer as any;
            return p.id === selectionState.selectedId ? (
              <TouchCircle
                key={p.id}
                id={p.id}
                position={{ x: (p.x / window.innerWidth) * 100, y: (p.y / window.innerHeight) * 100 }}
                number={p.number}
                size={160}
              />
            ) : null;
          })}
    </div>
  );
};
