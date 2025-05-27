import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ResetInterval = "never" | "daily" | "weekly" | "monthly" | "session";

interface DareEntry {
  id: string;
  playerId: number;
  timestamp: number;
  date: string;
}

interface DareLogState {
  dareHistory: DareEntry[];
  resetInterval: ResetInterval;
  lastResetDate: string;
  
  // Actions
  addDare: (playerId: number) => void;
  getDareCount: (playerId: number) => number;
  resetLog: () => void;
  setResetInterval: (interval: ResetInterval) => void;
  checkAndResetIfNeeded: () => void;
  getPlayerStats: () => Array<{ playerId: number; count: number; lastDare?: string }>;
}

export const useDareLog = create<DareLogState>()(
  persist(
    (set, get) => ({
      dareHistory: [],
      resetInterval: "session",
      lastResetDate: new Date().toDateString(),
      
      addDare: (playerId: number) => {
        const newDare: DareEntry = {
          id: `${Date.now()}-${playerId}`,
          playerId,
          timestamp: Date.now(),
          date: new Date().toDateString()
        };
        
        set(state => ({
          dareHistory: [...state.dareHistory, newDare]
        }));
        
        console.log(`Player ${playerId + 1} completed a dare!`);
      },
      
      getDareCount: (playerId: number) => {
        const { dareHistory } = get();
        return dareHistory.filter(dare => dare.playerId === playerId).length;
      },
      
      resetLog: () => {
        set({
          dareHistory: [],
          lastResetDate: new Date().toDateString()
        });
        console.log("Dare log reset!");
      },
      
      setResetInterval: (interval: ResetInterval) => {
        set({ resetInterval: interval });
      },
      
      checkAndResetIfNeeded: () => {
        const { resetInterval, lastResetDate } = get();
        const now = new Date();
        const lastReset = new Date(lastResetDate);
        
        let shouldReset = false;
        
        switch (resetInterval) {
          case "daily":
            shouldReset = now.toDateString() !== lastReset.toDateString();
            break;
          case "weekly":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            shouldReset = lastReset < weekAgo;
            break;
          case "monthly":
            shouldReset = now.getMonth() !== lastReset.getMonth() || 
                         now.getFullYear() !== lastReset.getFullYear();
            break;
          case "session":
            // Reset happens manually or on app restart
            break;
          case "never":
            // Never reset automatically
            break;
        }
        
        if (shouldReset) {
          get().resetLog();
        }
      },
      
      getPlayerStats: () => {
        const { dareHistory } = get();
        const stats = new Map<number, { count: number; lastDare?: string }>();
        
        // Initialize stats for players 1-8
        for (let i = 0; i < 8; i++) {
          stats.set(i, { count: 0 });
        }
        
        // Count dares and find last dare date
        dareHistory.forEach(dare => {
          const current = stats.get(dare.playerId) || { count: 0 };
          stats.set(dare.playerId, {
            count: current.count + 1,
            lastDare: dare.date
          });
        });
        
        return Array.from(stats.entries()).map(([playerId, data]) => ({
          playerId,
          count: data.count,
          lastDare: data.lastDare
        }));
      }
    }),
    {
      name: "dare-log-storage",
      version: 1
    }
  )
);