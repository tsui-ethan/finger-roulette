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
  const [gameMode, setGameMode] = useState<'pointer' | 'circle'>('pointer');
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
    // Reset circle mode state as well
    setPressedCircles(new Set());
    setCircleCountdown(null);
    setCircleWinner(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    circleCountdownInProgress.current = false;
    audio.playRestart();
    resetPointers();
  };

  useEffect(() => {
    const pointerCount = pointers.size;
    // Start countdown only when the first finger is placed, and do not restart if more join
    if (
      pointerCount > 0 && // any pointer present
      !countdownInProgress.current &&
      selectionState.selectedId === null &&
      !selectionState.selecting
    ) {
      countdownInProgress.current = true;
      setSelectionState({ selecting: true, selectedId: null, countdown: 3 });
      let countdownValue = 3;
      audio.playTick();
      countdownInterval.current = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
          audio.playTick();
        }
        setSelectionState(prev => ({ ...prev, countdown: countdownValue }));
        if (countdownValue === 0) {
          clearInterval(countdownInterval.current!);
        }
      }, 1000);
      selectionTimeout.current = setTimeout(() => {
        // Pure random selection from current pointers
        setTimeout(() => {
          const pointerArr = Array.from(gameState.pointers.values());
          const candidates = pointerArr.length > 0 ? pointerArr : prevPointerSet.current;
          if (candidates.length > 0) {
            // Step 3: Generate random index
            const randomIdx = Math.floor(Math.random() * candidates.length);
            // Step 4: Select user at that index
            const winner = candidates[randomIdx];
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
        }, 0);
      }, 3000);
    }
    // Only reset selection state and clear intervals/timeouts if not currently selecting (i.e., before countdown starts)
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
    // Only clear intervals/timeouts on unmount (not on every pointer change)
    // DO NOT clear intervals/timeouts here, or the timer will stop when more users join
    return () => {};
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

  // --- Circle mode preset positions ---
  const [numCircles, setNumCircles] = useState(8); // was: const NUM_CIRCLES = 8;
  const CIRCLE_RADIUS = 243; // px (increased by 35%)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const CIRCLE_CENTER_X = windowSize.width / 2;
  const CIRCLE_CENTER_Y = windowSize.height / 2;
  const presetCircles = Array.from({ length: numCircles }, (_, i) => {
    const angle = (2 * Math.PI * i) / numCircles - Math.PI / 2;
    return {
      x: CIRCLE_CENTER_X + CIRCLE_RADIUS * Math.cos(angle),
      y: CIRCLE_CENTER_Y + CIRCLE_RADIUS * Math.sin(angle),
      number: i + 1,
      id: i
    };
  });
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);

  // --- Circle mode pressed state ---
  const [pressedCircles, setPressedCircles] = useState<Set<number>>(new Set());
  const [circleCountdown, setCircleCountdown] = useState<number | null>(null);
  const [circleWinner, setCircleWinner] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const circleCountdownInProgress = useRef(false);

  // Remove countdown start logic from useEffect, only keep cleanup
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Reset state when game resets or mode changes
  useEffect(() => {
    if (gameMode !== 'circle') {
      setPressedCircles(new Set());
      setCircleCountdown(null);
      setCircleWinner(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      circleCountdownInProgress.current = false;
    }
  }, [gameMode]);

  // When a circle is pressed, add it to the set and start countdown if needed
  const handleCirclePress = (id: number) => {
    if (circleWinner !== null) {
      // Start a new round if a winner was just chosen
      setPressedCircles(new Set([id]));
      setCircleCountdown(3);
      setCircleWinner(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      circleCountdownInProgress.current = true;
      let countdown = 3;
      countdownIntervalRef.current = setInterval(() => {
        countdown--;
        setCircleCountdown(countdown);
        if (countdown === 0) {
          clearInterval(countdownIntervalRef.current!);
          setCircleCountdown(null);
          circleCountdownInProgress.current = false;
          // Pure random selection from pressed circles
          setPressedCircles((latestSet) => {
            const pressedArr = Array.from(latestSet);
            if (pressedArr.length > 0) {
              const randomIdx = Math.floor(Math.random() * pressedArr.length);
              const winner = pressedArr[randomIdx];
              setCircleWinner(winner);
            }
            return latestSet;
          });
        }
      }, 1000);
      return;
    }
    setPressedCircles((prev) => {
      const newSet = new Set(prev).add(id);
      // Start countdown immediately if not in progress and no winner
      if (!circleCountdownInProgress.current && newSet.size > 0 && circleCountdown === null && circleWinner === null) {
        setCircleCountdown(3);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        circleCountdownInProgress.current = true;
        let countdown = 3;
        countdownIntervalRef.current = setInterval(() => {
          countdown--;
          setCircleCountdown(countdown);
          if (countdown === 0) {
            clearInterval(countdownIntervalRef.current!);
            setCircleCountdown(null);
            circleCountdownInProgress.current = false;
            // Pure random selection from pressed circles
            setPressedCircles((latestSet) => {
              const pressedArr = Array.from(latestSet);
              if (pressedArr.length > 0) {
                const randomIdx = Math.floor(Math.random() * pressedArr.length);
                const winner = pressedArr[randomIdx];
                setCircleWinner(winner);
              }
              return latestSet;
            });
          }
        }, 1000);
      }
      return newSet;
    });
  };

  return (
    <div
      ref={touchRef}
      className={`w-full h-full bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 fixed top-0 left-0 right-0 bottom-0 m-0 p-0 z-0 overflow-hidden touch-none select-none`}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Instructions and countdown/winner text */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 z-50 text-2xl font-bold text-white drop-shadow-lg">
        {gameMode === 'pointer' && pointers.size === 0 && selectionState.selectedId === null &&
          !showSettings && !showInstructions && (
          <span>Touch or click to join</span>
        )}
        {gameMode === 'pointer' && pointers.size > 0 && selectionState.selecting && (
          <span>Get ready... {selectionState.countdown}</span>
        )}
        {gameMode === 'pointer' && selectionState.selectedId !== null && winnerInfo && (
          <span className="text-yellow-300 animate-bounce">🎉 Winner: {winnerInfo.number} 🎉</span>
        )}
        {gameMode === 'circle' && !showSettings && !showInstructions && (
          <span>
            {circleWinner !== null
              ? `🎉 Winner: ${circleWinner + 1} 🎉`
              : circleCountdown !== null && circleCountdown > 0
                ? `Get ready... ${circleCountdown}`
                : 'Tap a circle to select'}
          </span>
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
      {/* Show pointer mode circles */}
      {gameMode === 'pointer' && (
        Array.from(pointers.values()).map((pointer: any) => {
          // Only show the winner's circle after selection
          const isWinner = selectionState.selectedId === pointer.id && winnerInfo;
          if (selectionState.selectedId !== null && !isWinner) return null;
          const x = isWinner ? (winnerInfo!.x / window.innerWidth) * 100 : (pointer.x / window.innerWidth) * 100;
          const y = isWinner ? (winnerInfo!.y / window.innerHeight) * 100 : (pointer.y / window.innerHeight) * 100;
          return (
            <TouchCircle
              key={pointer.id}
              id={pointer.id}
              position={{ x, y }}
              number={pointer.number}
              size={isWinner ? 160 : 90}
              borderColor={isWinner ? "#fde047" : "#fb923c"}
              borderWidth={isWinner ? 8 : 6}
              highlight={!!isWinner}
            />
          );
        })
      )}
      {/* Show circle mode preset circles */}
      {gameMode === 'circle' && (
        <>
          {/* Center button to select all circles */}
          <div
            style={{
              position: 'absolute',
              left: `${CIRCLE_CENTER_X}px`,
              top: `${CIRCLE_CENTER_Y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
            }}
          >
            <button
              className="bg-blue-950 hover:bg-blue-800 shadow-lg flex items-center justify-center text-2xl font-bold border-4 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all text-center px-2 rounded-xl text-white"
              style={{ borderRadius: '1rem', width: '9rem', height: '9rem', fontSize: '2.25rem' }}
              onClick={() => {
                setPressedCircles((prev) => {
                  const all = new Set(Array.from({ length: numCircles }, (_, i) => i));
                  // If countdown hasn't started, trigger it as if a circle was pressed
                  if (!circleCountdownInProgress.current && circleCountdown === null && circleWinner === null) {
                    setCircleCountdown(3);
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    circleCountdownInProgress.current = true;
                    let countdown = 3;
                    countdownIntervalRef.current = setInterval(() => {
                      countdown--;
                      setCircleCountdown(countdown);
                      if (countdown === 0) {
                        clearInterval(countdownIntervalRef.current!);
                        setCircleCountdown(null);
                        circleCountdownInProgress.current = false;
                        // Pure random selection from all pressed circles
                        const pressedArr = Array.from(all);
                        if (pressedArr.length > 0) {
                          const randomIdx = Math.floor(Math.random() * pressedArr.length);
                          const winner = pressedArr[randomIdx];
                          setCircleWinner(winner);
                        }
                      }
                    }, 1000);
                  } else if (circleWinner !== null) {
                    // If a winner was just chosen, reset for a new round
                    setCircleCountdown(3);
                    setCircleWinner(null);
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    circleCountdownInProgress.current = true;
                    let countdown = 3;
                    countdownIntervalRef.current = setInterval(() => {
                      countdown--;
                      setCircleCountdown(countdown);
                      if (countdown === 0) {
                        clearInterval(countdownIntervalRef.current!);
                        setCircleCountdown(null);
                        circleCountdownInProgress.current = false;
                        const pressedArr = Array.from(all);
                        if (pressedArr.length > 0) {
                          const randomIdx = Math.floor(Math.random() * pressedArr.length);
                          const winner = pressedArr[randomIdx];
                          setCircleWinner(winner);
                        }
                      }
                    }, 1000);
                  }
                  return all;
                });
              }}
              disabled={circleCountdown !== null || circleWinner !== null}
              title="Select All"
            >
              Select All
            </button>
          </div>
          {/* Countdown and winner display removed from here to ensure only one text is shown */}
          {presetCircles.map((circle) => (
            <div
              key={circle.id}
              style={{
                position: 'absolute',
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
              onClick={() => handleCirclePress(circle.id)}
            >
              <TouchCircle
                id={circle.id}
                position={{ x: 50, y: 50 }}
                number={circle.number}
                size={121.5}
                highlight={pressedCircles.has(circle.id) || circleWinner === circle.id}
              />
            </div>
          ))}
        </>
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
        <SettingsPage
          onBack={() => setShowSettings(false)}
          numCircles={numCircles}
          setNumCircles={setNumCircles}
        />
      )}
      {showInstructions && (
        <InstructionsPage onBack={() => setShowInstructions(false)} />
      )}
      {/* --- Force landscape on mobile --- */}
      <div className="fixed inset-0 bg-black z-50" style={{ display: gameMode === 'circle' ? 'none' : 'block' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            For the best experience, please use landscape mode
          </h2>
          <p className="text-lg text-white mb-8 text-center">
            This game is optimized for landscape orientation. Rotate your device to continue playing.
          </p>
          <button
            onClick={() => {
              const el = document.documentElement;
              const requestMethod = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
              if (requestMethod) {
                requestMethod.call(el);
              }
            }}
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          >
            Enable Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
};
