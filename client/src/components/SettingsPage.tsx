import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDareLog, ResetInterval } from "@/lib/stores/useDareLog";
import { useAudio } from "@/lib/stores/useAudio";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Clock } from "lucide-react";

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage = ({ onBack }: SettingsPageProps) => {
  const { resetInterval, setResetInterval, resetLog, lastResetDate } = useDareLog();
  const { isMuted, toggleMute } = useAudio();

  const resetIntervalOptions: Array<{ value: ResetInterval; label: string; description: string }> = [
    { value: "never", label: "Never", description: "Keep dare counts forever" },
    { value: "session", label: "Each Session", description: "Reset when app is restarted" },
    { value: "daily", label: "Daily", description: "Reset every day at midnight" },
    { value: "weekly", label: "Weekly", description: "Reset every 7 days" },
    { value: "monthly", label: "Monthly", description: "Reset every month" }
  ];

  const handleResetIntervalChange = (value: ResetInterval) => {
    setResetInterval(value);
  };

  const handleManualReset = () => {
    if (window.confirm("Are you sure you want to reset all dare counts now? This cannot be undone.")) {
      resetLog();
    }
  };

  const formatLastReset = () => {
    return new Date(lastResetDate).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-zinc-900 p-4">
      <div className="max-w-2xl mx-auto">
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
            ⚙️ Settings
          </h1>
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-base">Sound Effects</Label>
                  <p className="text-white/70 text-sm">Enable or disable game sounds</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMute}
                  className={`${
                    isMuted 
                      ? "bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      : "bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Enabled
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dare Log Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Dare Log Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white text-base mb-3 block">Reset Interval</Label>
                <Select value={resetInterval} onValueChange={handleResetIntervalChange}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {resetIntervalOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-gray-700"
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-300">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <Label className="text-white text-base">Last Reset</Label>
                  <p className="text-white/70 text-sm">{formatLastReset()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualReset}
                  className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Now
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                <h4 className="text-blue-200 font-medium mb-2">Reset Interval Explanation</h4>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  <li>• <strong>Never:</strong> Dare counts persist indefinitely</li>
                  <li>• <strong>Session:</strong> Counts reset when you restart the app</li>
                  <li>• <strong>Daily:</strong> Counts reset automatically each day</li>
                  <li>• <strong>Weekly:</strong> Counts reset every 7 days</li>
                  <li>• <strong>Monthly:</strong> Counts reset at the start of each month</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Game Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/70 text-sm space-y-2">
                <p>• Touch or click on circles to activate them</p>
                <p>• Game starts when at least one circle is touched</p>
                <p>• Auto-start timer: 5 seconds after first touch</p>
                <p>• Manual start: Click the "Begin" button</p>
                <p>• Selected player gets to do a dare!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};