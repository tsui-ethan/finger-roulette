import { useEffect, useCallback, useRef } from "react";
import { TouchCircle } from "./TouchCircle";
import { useGameState } from "@/lib/stores/useGameState";
import { useMultiTouch } from "@/lib/hooks/useMultiTouch";
import { useAudio } from "@/lib/stores/useAudio";

const CIRCLE_COUNT = 8;
const CIRCLE_SIZE = 120;

export const GameBoard = () => {
  const { 
    phase, 
    circles, 
    countdownTime,
    autoStartTimer,
    initializeGame, 
    addTouch, 
    removeTouch, 
    selectWinner,
    setCountdownTime,
    setAutoStartTimer,
    forceStart
  } = useGameState();
  
  const { playHit, playSuccess } = useAudio();
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoStartRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame(CIRCLE_COUNT);
  }, [initializeGame]);
  
  // Generate circle positions in a circular pattern
  const circlePositions = Array.from({ length: CIRCLE_COUNT }, (_, i) => {
    const angle = (i * 360) / CIRCLE_COUNT;
    const centerX = 50;
    const centerY = 50;
    const radius = 25; // Percentage from center
    
    const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    return { x, y };
  });
  
  // Handle auto-start timer
  useEffect(() => {
    if (phase === "ready" && autoStartTimer > 0) {
      autoStartRef.current = setTimeout(() => {
        setAutoStartTimer(autoStartTimer - 1);
        playHit(); // Play tick sound
      }, 1000);
    } else if (phase === "ready" && autoStartTimer === 0) {
      forceStart(); // Auto-start the game
    }
    
    return () => {
      if (autoStartRef.current) {
        clearTimeout(autoStartRef.current);
      }
    };
  }, [phase, autoStartTimer, setAutoStartTimer, forceStart, playHit]);

  // Handle countdown timer
  useEffect(() => {
    if (phase === "countdown" && countdownTime > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdownTime(countdownTime - 1);
        playHit(); // Play tick sound
      }, 1000);
    } else if (phase === "countdown" && countdownTime === 0) {
      // Start selection phase
      useGameState.setState({ phase: "selection" });
      
      // Select winner after a brief moment
      selectionTimeoutRef.current = setTimeout(() => {
        selectWinner();
        playSuccess(); // Play selection sound
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [phase, countdownTime, setCountdownTime, selectWinner, playHit, playSuccess]);
  
  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      if (autoStartRef.current) {
        clearTimeout(autoStartRef.current);
      }
    };
  }, []);
  
  // Direct circle touch handler
  const handleCircleTouch = useCallback((circleId: number, x: number, y: number) => {
    if (phase !== "waiting" && phase !== "ready" && phase !== "countdown") return;
    
    // Use a unique touch ID for direct touches (starting from 1000 to avoid conflicts)
    const touchId = 1000 + circleId + Date.now();
    addTouch(touchId, circleId, x, y);
    playHit(); // Play touch feedback sound
    
    console.log(`Circle ${circleId + 1} touched at (${x}, ${y})`);
  }, [phase, addTouch, playHit]);

  // Touch event handlers for multi-touch
  const handleTouchStart = useCallback((touches: TouchList, event: TouchEvent) => {
    if (phase !== "waiting" && phase !== "ready" && phase !== "countdown") return;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element && element.hasAttribute('data-circle-id')) {
        const circleId = parseInt(element.getAttribute('data-circle-id') || '0');
        addTouch(touch.identifier, circleId, touch.clientX, touch.clientY);
        playHit(); // Play touch feedback sound
      }
    }
  }, [phase, addTouch, playHit]);
  
  const handleTouchEnd = useCallback((touches: TouchList, event: TouchEvent) => {
    // Get all touch identifiers that ended
    const activeTouchIds = new Set(Array.from(touches).map(t => t.identifier));
    const allTouchIds = new Set(Array.from(event.changedTouches).map(t => t.identifier));
    
    // Remove touches that ended
    allTouchIds.forEach(touchId => {
      if (!activeTouchIds.has(touchId)) {
        removeTouch(touchId);
      }
    });
  }, [removeTouch]);
  
  const touchRef = useMultiTouch({
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  });
  
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
      
      {/* Touch circles */}
      {circles.map((circle, index) => (
        <TouchCircle
          key={circle.id}
          id={circle.id}
          active={circle.active}
          selected={circle.selected}
          position={circlePositions[index]}
          size={CIRCLE_SIZE}
          onTouch={handleCircleTouch}
        />
      ))}
      
      {/* Selection animation overlay */}
      {phase === "selection" && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-6xl animate-spin">🎲</div>
        </div>
      )}
    </div>
  );
};
