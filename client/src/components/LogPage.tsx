import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameLog } from "@/lib/stores/useGameLog";
import { ArrowLeft, Trophy, Calendar, RotateCcw } from "lucide-react";

interface LogPageProps {
  onBack: () => void;
}

export const LogPage = ({ onBack }: LogPageProps) => {
  const { getPlayerStats, resetLog, gameHistory } = useGameLog();
  
  const playerStats = getPlayerStats();
  const totalGames = gameHistory.length;
  
  // Find the player with most dares
  const topPlayer = playerStats.reduce((max, player) => 
    player.count > max.count ? player : max, 
    { playerId: 0, count: 0 }
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all dare counts? This cannot be undone.")) {
      resetLog();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          
          <h1 className="text-3xl font-bold text-white text-center">
            🎯 Dare Log
          </h1>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalDares}</div>
              <div className="text-white/70">Total Dares</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-500/20 border-yellow-400/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-200">
                Player {topPlayer.playerId + 1}
              </div>
              <div className="text-yellow-200/70">Most Dares ({topPlayer.count})</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/20 border-blue-400/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-200">
                {playerStats.filter(p => p.count > 0).length}
              </div>
              <div className="text-blue-200/70">Active Players</div>
            </CardContent>
          </Card>
        </div>

        {/* Player Statistics */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Player Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerStats.map(({ playerId, count, lastDare }) => (
                <div
                  key={playerId}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    count > 0
                      ? "bg-white/10 border-white/30"
                      : "bg-gray-500/10 border-gray-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Player {playerId + 1}
                    </h3>
                    <Badge
                      variant={count > 0 ? "default" : "secondary"}
                      className={`${
                        count > 0
                          ? "bg-green-500/20 text-green-200 border-green-400/30"
                          : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                      }`}
                    >
                      {count} dares
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Calendar className="w-4 h-4" />
                    Last dare: {formatDate(lastDare)}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: totalDares > 0 ? `${(count / Math.max(topPlayer.count, 1)) * 100}%` : "0%"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {dareHistory.length > 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {dareHistory
                  .slice(-10)
                  .reverse()
                  .map((dare) => (
                    <div
                      key={dare.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                    >
                      <span className="text-white">
                        Player {dare.playerId + 1} completed a dare
                      </span>
                      <span className="text-white/60 text-sm">
                        {new Date(dare.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};