import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameState } from "@/lib/stores/useGameState";
import { useAudio } from "@/lib/stores/useAudio";
import { useGameLog } from "@/lib/stores/useGameLog";
import { Volume2, VolumeX, RotateCcw, BarChart3, Settings } from "lucide-react";
import Confetti from "react-confetti";

interface GameUIProps {
  onShowLog?: () => void;
  onShowSettings?: () => void;
}

export const GameUI = ({ onShowLog, onShowSettings }: GameUIProps) => {
  const { phase, countdownTime, selectedCircle, autoStartTimer, resetGame, forceStart } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  const { addGame, checkAndResetIfNeeded } = useGameLog();
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Update window dimensions for responsive confetti
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Trigger confetti when someone is selected
  useEffect(() => {
    if (phase === "reveal" && selectedCircle !== null) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [phase, selectedCircle]);
  
  const getInstructionText = () => {
    switch (phase) {
      case "waiting":
        return "Everyone put your finger on a circle";
      case "ready":
        return `Auto-start in ${autoStartTimer} seconds...`;
      case "countdown":
        return `Get ready... ${countdownTime}`;
      case "selection":
        return "Selecting...";
      case "reveal":
        return selectedCircle !== null 
          ? `Player ${selectedCircle + 1} has been chosen!`
          : "Game complete!";
      default:
        return "Touch to start";
    }
  };
  
  const getInstructionColor = () => {
    switch (phase) {
      case "waiting":
        return "text-purple-200";
      case "ready":
        return "text-green-200";
      case "countdown":
        return "text-yellow-200";
      case "selection":
        return "text-blue-200";
      case "reveal":
        return "text-red-200";
      default:
        return "text-white";
    }
  };
  
  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={200}
          recycle={false}
          colors={[
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
            '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
          ]}
          gravity={0.3}
          wind={0.05}
          initialVelocityX={5}
          initialVelocityY={15}
          className="pointer-events-none fixed inset-0 z-50"
        />
      )}
      
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top instruction text */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <Card className="bg-black/60 border-white/20 backdrop-blur-sm pointer-events-auto">
            <CardContent className="p-6 text-center">
              <h1 className={`text-2xl md:text-4xl font-bold ${getInstructionColor()} transition-colors duration-300`}>
                {getInstructionText()}
              </h1>
              {phase === "reveal" && selectedCircle !== null && (
                <div className="space-y-2">
                  <p className="text-lg md:text-xl text-red-100 mt-2 animate-bounce">
                    🎯 You've been chosen! 🎯
                  </p>
                  <Button
                    onClick={() => {
                      addGame(selectedCircle);
                      resetGame();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                  >
                    ✅ Challenge Completed!
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Control buttons */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={onShowLog}
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
            title="View Game Log"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onShowSettings}
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={resetGame}
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Begin button when ready */}
        {phase === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              onClick={forceStart}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-2xl px-12 py-8 rounded-full shadow-2xl border-4 border-green-400 animate-pulse"
            >
              🚀 BEGIN 🚀
            </Button>
          </div>
        )}

        {/* Game phase indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              phase === "waiting" ? "bg-purple-400" :
              phase === "ready" ? "bg-green-400 animate-pulse" :
              phase === "countdown" ? "bg-yellow-400 animate-pulse" :
              phase === "selection" ? "bg-blue-400 animate-spin" :
              "bg-red-400 animate-bounce"
            }`} />
            <span className="text-white text-sm font-medium capitalize">
              {phase === "reveal" ? "Complete" : phase}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};