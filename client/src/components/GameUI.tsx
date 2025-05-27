import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameState } from "@/lib/stores/useGameState";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export const GameUI = () => {
  const { phase, countdownTime, selectedCircle, resetGame } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  
  const getInstructionText = () => {
    switch (phase) {
      case "waiting":
        return "Everyone put your finger on a circle";
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
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top instruction text */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <Card className="bg-black/60 border-white/20 backdrop-blur-sm pointer-events-auto">
          <CardContent className="p-6 text-center">
            <h1 className={`text-2xl md:text-4xl font-bold ${getInstructionColor()} transition-colors duration-300`}>
              {getInstructionText()}
            </h1>
            {phase === "reveal" && selectedCircle !== null && (
              <p className="text-lg md:text-xl text-red-100 mt-2 animate-bounce">
                🎯 Do the dare! 🎯
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Control buttons */}
      <div className="absolute top-8 right-8 flex flex-col gap-2 pointer-events-auto">
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
      
      {/* Game phase indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            phase === "waiting" ? "bg-purple-400" :
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
  );
};
