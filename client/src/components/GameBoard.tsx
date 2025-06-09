import { useEffect, useRef, useState } from "react";
import { TouchCircle } from "./TouchCircle";
import { useGameState } from "@/lib/stores/useGameState";
import { useMultiTouch } from "@/lib/hooks/useMultiTouch";
import { useAudio } from "@/lib/stores/useAudio";
import { SettingsPage } from "./SettingsPage";
import { InstructionsPage } from "./InstructionsPage";

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
  const [selectionState, setSelectionState] = useState<{ selecting: boolean; selectedId: number | null; countdown: number }>({ selecting: false, selectedId: null, countdown: 3 });
  const [winnerInfo, setWinnerInfo] = useState<{ x: number; y: number; number: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const selectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const prevPointerCount = useRef(0);
  const prevPointerSet = useRef<any[]>([]);
  const countdownInProgress = useRef(false);
  const winnerTimeout = useRef<NodeJS.Timeout | null>(null);
  const audio = useAudio();

  // Register all sounds with Zustand on mount
  useEffect(() => {
    audio.setHitSound(new window.Audio('/sounds/hit.mp3'));
    audio.setTickSound(new window.Audio('/sounds/tick.mp3'));
    audio.setSuccessSound(new window.Audio('/sounds/success.mp3'));
    audio.setRestartSound(new window.Audio('/sounds/restart.mp3'));
  }, []);

  // Helper to reset the game state
  const resetGame = () => {
    setSelectionState({ selecting: false, selectedId: null, countdown: 3 });
    setWinnerInfo(null);
    if (selectionTimeout.current) clearTimeout(selectionTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (winnerTimeout.current) clearTimeout(winnerTimeout.current);
    countdownInProgress.current = false;
    resetPointers();
    audio.playRestart();
  };

  useEffect(() => {
    const pointerCount = pointers.size;
    if (
      prevPointerCount.current === 0 && pointerCount > 0 &&
      !countdownInProgress.current
    ) {
      countdownInProgress.current = true;
      setSelectionState({ selecting: true, selectedId: null, countdown: 3 });
      let countdownValue = 3;
      // Play tick immediately for 3
      audio.playTick();
      countdownInterval.current = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
          audio.playTick(); // Play tick for 2 and 1
        }
        setSelectionState(prev => ({ ...prev, countdown: countdownValue }));
        if (countdownValue === 0) {
          clearInterval(countdownInterval.current!);
        }
      }, 1000);
      selectionTimeout.current = setTimeout(() => {
        // Pick winner from current or last pointer set
        const pointerArr = Array.from(pointers.values());
        const candidates = pointerArr.length > 0 ? pointerArr : prevPointerSet.current;
        if (candidates.length > 0) {
          const winner = candidates[Math.floor(Math.random() * candidates.length)];
          setSelectionState({ selecting: false, selectedId: winner.id, countdown: 0 });
          setWinnerInfo({ x: winner.x, y: winner.y, number: winner.number });
          audio.playSuccess();
          winnerTimeout.current = setTimeout(() => {
            resetGame();
          }, 5000);
        } else {
          setSelectionState({ selecting: false, selectedId: null, countdown: 0 });
          setWinnerInfo(null);
        }
        countdownInProgress.current = false;
      }, 3000);
    }
    // Only reset selection state if not currently selecting (i.e., before countdown starts)
    if (pointerCount === 0 && !countdownInProgress.current && selectionState.selectedId === null) {
      setSelectionState({ selecting: false, selectedId: null, countdown: 3 });
      setWinnerInfo(null);
      if (selectionTimeout.current) clearTimeout(selectionTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (winnerTimeout.current) clearTimeout(winnerTimeout.current);
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
      if (winnerTimeout.current) clearTimeout(winnerTimeout.current);
      countdownInProgress.current = false;
    };
  }, [pointers.size]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = true;
      addPointer(9999, e.clientX, e.clientY);
      audio.playHit();
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
  }, [addPointer, updatePointer, removePointer, audio]);

  const touchRef = useMultiTouch({
    onTouchStart: (touches) => {
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        addPointer(t.identifier, t.clientX, t.clientY);
        audio.playHit();
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
        {pointers.size === 0 && selectionState.selectedId === null &&
          !showSettings && !showInstructions && (
          <span>Touch or click to join</span>
        )}
        {pointers.size > 0 && selectionState.selecting && (
          <span>Get ready... {selectionState.countdown}</span>
        )}
        {selectionState.selectedId !== null && (
          (() => {
            const winnerPointer = pointers.get(selectionState.selectedId);
            const winnerNumber = winnerPointer ? winnerPointer.number : selectionState.selectedId + 1;
            return (
              <span className="text-yellow-300 animate-bounce">🎉 Winner: {winnerNumber} 🎉</span>
            );
          })()
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
      {selectionState.selectedId === null && !winnerInfo
        ? Array.from(pointers.values()).map((pointer: any) => (
            <TouchCircle
              key={pointer.id}
              id={pointer.id}
              position={{
                x: (pointer.x / window.innerWidth) * 100,
                y: (pointer.y / window.innerHeight) * 100
              }}
              number={pointer.number}
              size={90}
            />
          ))
        : winnerInfo && (
            <TouchCircle
              key={"winner"}
              id={-999}
              position={{
                x: (winnerInfo.x / window.innerWidth) * 100,
                y: (winnerInfo.y / window.innerHeight) * 100
              }}
              number={winnerInfo.number}
              size={160}
            />
          )}
      {/* Top-right control buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Game mode switch button */}
        <button
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-lg shadow"
          title="Switch Game Mode"
          onClick={() => setGameMode((g) => g === "pointer" ? "circle" : "pointer")}
        >
          <span role="img" aria-label="switch">⇄</span>
        </button>
        <button
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-lg shadow"
          title="Settings"
          onClick={() => setShowSettings(true)}
        >
          <span role="img" aria-label="settings">⚙️</span>
        </button>
        <button
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-lg shadow"
          title="Restart"
          onClick={resetGame}
        >
          <span role="img" aria-label="restart">🔄</span>
        </button>
        <button
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-lg shadow"
          title="Instructions"
          onClick={() => setShowInstructions(true)}
        >
          <span role="img" aria-label="instructions">❓</span>
        </button>
        <button
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-lg shadow"
          title="Mute/Unmute"
          onClick={audio.toggleMute}
        >
          <span role="img" aria-label="mute">{audio.isMuted ? '🔇' : '🔊'}</span>
        </button>
      </div>
      {showSettings && (
        <SettingsPage onBack={() => setShowSettings(false)} />
      )}
      {showInstructions && (
        <InstructionsPage onBack={() => setShowInstructions(false)} />
      )}
    </div>
  );
};
