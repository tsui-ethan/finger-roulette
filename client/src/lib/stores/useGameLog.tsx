import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ResetInterval = "never" | "daily" | "weekly" | "monthly" | "session";

interface GameEntry {
  id: string;
  playerId: number;
  timestamp: number;
  date: string;
}

interface GameLogState {
  gameHistory: GameEntry[];
  resetInterval: ResetInterval;
  lastResetDate: string;
  
  // Actions
  addGame: (playerId: number) => void;
  getGameCount: (playerId: number) => number;
  resetLog: () => void;
  setResetInterval: (interval: ResetInterval) => void;
  checkAndResetIfNeeded: () => void;
  getPlayerStats: () => Array<{ playerId: number; count: number; lastGame?: string }>;
}

export const useGameLog = create<GameLogState>()(
  persist(
    (set, get) => ({
      gameHistory: [],
      resetInterval: "session",
      lastResetDate: new Date().toDateString(),
      
      addGame: (playerId: number) => {
        const newGame: GameEntry = {
          id: `${Date.now()}-${playerId}`,
          playerId,
          timestamp: Date.now(),
          date: new Date().toDateString()
        };
        
        set(state => ({
          gameHistory: [...state.gameHistory, newGame]
        }));
        
        console.log(`Player ${playerId + 1} was selected!`);
      },
      
      getGameCount: (playerId: number) => {
        const { gameHistory } = get();
        return gameHistory.filter(game => game.playerId === playerId).length;
      },
      
      resetLog: () => {
        set({
          gameHistory: [],
          lastResetDate: new Date().toDateString()
        });
        console.log("Game log reset!");
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
        const { gameHistory } = get();
        const stats = new Map<number, { count: number; lastGame?: string }>();
        
        // Initialize stats for players 1-8
        for (let i = 0; i < 8; i++) {
          stats.set(i, { count: 0 });
        }
        
        // Count games and find last game date
        gameHistory.forEach(game => {
          const current = stats.get(game.playerId) || { count: 0 };
          stats.set(game.playerId, {
            count: current.count + 1,
            lastGame: game.date
          });
        });
        
        return Array.from(stats.entries()).map(([playerId, data]) => ({
          playerId,
          count: data.count,
          lastGame: data.lastGame
        }));
      }
    }),
    {
      name: "game-log-storage",
      version: 1
    }
  )
);