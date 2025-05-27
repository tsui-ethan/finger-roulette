import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "waiting" | "ready" | "countdown" | "selection" | "reveal";

interface TouchData {
  id: number;
  circleIndex: number;
  x: number;
  y: number;
}

interface GameState {
  phase: GamePhase;
  circles: Array<{ id: number; active: boolean; selected: boolean }>;
  activeTouches: Map<number, TouchData>;
  selectedCircle: number | null;
  countdownTime: number;
  autoStartTimer: number;
  
  // Actions
  initializeGame: (circleCount: number) => void;
  addTouch: (touchId: number, circleIndex: number, x: number, y: number) => void;
  removeTouch: (touchId: number) => void;
  startCountdown: () => void;
  selectWinner: () => void;
  resetGame: () => void;
  setCountdownTime: (time: number) => void;
  setAutoStartTimer: (time: number) => void;
  forceStart: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "waiting",
    circles: [],
    activeTouches: new Map(),
    selectedCircle: null,
    countdownTime: 3,
    autoStartTimer: 5,
    
    initializeGame: (circleCount: number) => {
      const circles = Array.from({ length: circleCount }, (_, i) => ({
        id: i,
        active: false,
        selected: false
      }));
      
      set({
        phase: "waiting",
        circles,
        activeTouches: new Map(),
        selectedCircle: null,
        countdownTime: 3,
        autoStartTimer: 5
      });
    },
    
    addTouch: (touchId: number, circleIndex: number, x: number, y: number) => {
      const { activeTouches, circles } = get();
      const newTouches = new Map(activeTouches);
      newTouches.set(touchId, { id: touchId, circleIndex, x, y });
      
      const updatedCircles = circles.map(circle => 
        circle.id === circleIndex 
          ? { ...circle, active: true }
          : circle
      );
      
      set({ 
        activeTouches: newTouches,
        circles: updatedCircles
      });
      
      // Check if at least one circle is touched to enter ready phase
      const anyTouched = updatedCircles.some(circle => circle.active);
      if (anyTouched && get().phase === "waiting") {
        set({ phase: "ready", autoStartTimer: 5 });
      }
    },
    
    removeTouch: (touchId: number) => {
      const { activeTouches, circles } = get();
      const touch = activeTouches.get(touchId);
      
      if (touch) {
        const newTouches = new Map(activeTouches);
        newTouches.delete(touchId);
        
        // Check if this circle still has other touches
        const hasOtherTouches = Array.from(newTouches.values())
          .some(t => t.circleIndex === touch.circleIndex);
        
        const updatedCircles = circles.map(circle => 
          circle.id === touch.circleIndex && !hasOtherTouches
            ? { ...circle, active: false }
            : circle
        );
        
        set({ 
          activeTouches: newTouches,
          circles: updatedCircles
        });
        
        // If no circles are touched, go back to waiting
        const anyTouched = updatedCircles.some(circle => circle.active);
        if (!anyTouched && (get().phase === "ready" || get().phase === "countdown" || get().phase === "selection")) {
          set({ phase: "waiting", countdownTime: 3, autoStartTimer: 5 });
        }
      }
    },
    
    startCountdown: () => {
      set({ phase: "countdown", countdownTime: 3 });
    },
    
    selectWinner: () => {
      const { circles } = get();
      const activeCircles = circles.filter(circle => circle.active);
      
      if (activeCircles.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeCircles.length);
        const selectedCircle = activeCircles[randomIndex];
        
        const updatedCircles = circles.map(circle => ({
          ...circle,
          selected: circle.id === selectedCircle.id
        }));
        
        set({
          phase: "reveal",
          selectedCircle: selectedCircle.id,
          circles: updatedCircles
        });
      }
    },
    
    resetGame: () => {
      const { circles } = get();
      const resetCircles = circles.map(circle => ({
        ...circle,
        active: false,
        selected: false
      }));
      
      set({
        phase: "waiting",
        circles: resetCircles,
        activeTouches: new Map(),
        selectedCircle: null,
        countdownTime: 3,
        autoStartTimer: 5
      });
    },
    
    setCountdownTime: (time: number) => {
      set({ countdownTime: time });
    },
    
    setAutoStartTimer: (time: number) => {
      set({ autoStartTimer: time });
    },
    
    forceStart: () => {
      set({ phase: "countdown", countdownTime: 3 });
    }
  }))
);
