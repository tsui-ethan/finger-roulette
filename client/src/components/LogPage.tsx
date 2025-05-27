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
  
  // Find the player with most games
  const topPlayer = playerStats.reduce((max: any, player: any) => 
    player.count > max.count ? player : max, 
    { playerId: 0, count: 0 }
  );

  const getPlayerRank = (count: number) => {
    const sortedCounts = [...new Set(playerStats.map((p: any) => p.count))].sort((a, b) => b - a);
    return sortedCounts.indexOf(count) + 1;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  const getBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1: return "default";
      case 2: return "secondary";
      case 3: return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
          
          <h1 className="text-3xl font-bold text-white">Game Statistics</h1>
          
          <Button
            onClick={resetLog}
            variant="outline"
            className="bg-red-600/20 border-red-400/50 text-red-200 hover:bg-red-600/30"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400">{totalGames}</div>
              <div className="text-white/80">Total Games</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400">{playerStats.length}</div>
              <div className="text-white/80">Active Players</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400">{topPlayer.count}</div>
              <div className="text-white/80">Highest Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Player Rankings */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Player Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playerStats.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No games played yet. Start a game to see statistics!
              </div>
            ) : (
              <div className="space-y-3">
                {playerStats
                  .sort((a: any, b: any) => b.count - a.count)
                  .map(({ playerId, count, lastGame }: any) => {
                    const rank = getPlayerRank(count);
                    return (
                      <div
                        key={playerId}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getRankEmoji(rank)}</div>
                          <div>
                            <div className="text-white font-semibold">
                              Player {playerId + 1}
                            </div>
                            {lastGame && (
                              <div className="text-white/60 text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {lastGame}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={getBadgeVariant(rank) as any}
                            className="text-sm font-medium"
                          >
                            {count} {count === 1 ? "game" : "games"}
                          </Badge>
                          <div className="text-white/60 text-sm">
                            #{rank}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Games */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameHistory.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No games recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameHistory
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((game: any) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10"
                    >
                      <span className="text-white">
                        Player {game.playerId + 1} was selected
                      </span>
                      <span className="text-white/60 text-sm">
                        {game.date}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};