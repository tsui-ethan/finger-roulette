import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "waiting" | "ready" | "countdown" | "selection" | "reveal";

interface PointerData {
  id: number; // pointerId or touch identifier
  x: number;
  y: number;
  number: number; // unique number assigned to this pointer
}

interface GameState {
  phase: GamePhase;
  pointers: Map<number, PointerData>; // dynamic pointers
  selectedCircle: number | null;
  countdownTime: number;
  autoStartTimer: number;
  
  // Actions
  addPointer: (id: number, x: number, y: number) => void;
  updatePointer: (id: number, x: number, y: number) => void;
  removePointer: (id: number) => void;
  resetPointers: () => void;
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
    pointers: new Map(),
    selectedCircle: null,
    countdownTime: 3,
    autoStartTimer: 5,
    
    addPointer: (id, x, y) => {
      const { pointers, phase } = get();
      if (pointers.has(id)) return; // already exists
      // Find the lowest available number starting from 1
      const usedNumbers = new Set(Array.from(pointers.values()).map(p => p.number));
      let assignedNumber = 1;
      while (usedNumbers.has(assignedNumber)) {
        assignedNumber++;
      }
      const newPointers = new Map(pointers);
      newPointers.set(id, { id, x, y, number: assignedNumber });
      set({ pointers: newPointers });
      // If now at least 2 pointers and phase is waiting, start countdown
      if (newPointers.size >= 2 && phase === "waiting") {
        set({ phase: "countdown", countdownTime: 3 });
        // Start a timer to pick a winner after 3 seconds
        setTimeout(() => {
          const { pointers: currentPointers, phase: currentPhase } = get();
          if (currentPhase === "countdown" && currentPointers.size >= 2) {
            // Pick a winner
            const activePointers = Array.from(currentPointers.values());
            const randomIndex = Math.floor(Math.random() * activePointers.length);
            const selectedPointer = activePointers[randomIndex];
            set({ phase: "reveal", selectedCircle: selectedPointer.number });
          }
        }, 3000);
      }
    },
    
    updatePointer: (id, x, y) => {
      const { pointers } = get();
      if (!pointers.has(id)) return;
      const newPointers = new Map(pointers);
      const pointer = newPointers.get(id)!;
      newPointers.set(id, { ...pointer, x, y });
      set({ pointers: newPointers });
    },
    
    removePointer: (id) => {
      const { pointers, phase } = get();
      if (!pointers.has(id)) return;
      const newPointers = new Map(pointers);
      newPointers.delete(id);
      set({ pointers: newPointers });
      // If less than 2 remain during countdown, reset to waiting
      if (phase === "countdown" && newPointers.size < 2) {
        set({ phase: "waiting", countdownTime: 3, selectedCircle: null });
      }
    },
    
    resetPointers: () => {
      set({ pointers: new Map() });
    },
    
    startCountdown: () => {
      set({ phase: "countdown", countdownTime: 3 });
    },
    
    selectWinner: () => {
      const { pointers } = get();
      const activePointers = Array.from(pointers.values());
      
      if (activePointers.length > 0) {
        const randomIndex = Math.floor(Math.random() * activePointers.length);
        const selectedPointer = activePointers[randomIndex];
        
        set({
          phase: "reveal",
          selectedCircle: selectedPointer.number,
        });
      }
    },
    
    resetGame: () => {
      set({
        phase: "waiting",
        pointers: new Map(),
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
