import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGameLog, ResetInterval } from "@/lib/stores/useGameLog";
import { useAudio } from "@/lib/stores/useAudio";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Clock } from "lucide-react";

interface SettingsPageProps {
  onBack: () => void;
  numCircles: number;
  setNumCircles: (n: number) => void;
}

export const SettingsPage = ({ onBack, numCircles, setNumCircles }: SettingsPageProps) => {
  const { resetInterval, setResetInterval, resetLog, lastResetDate } = useGameLog();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[95vw] h-[95vh] bg-gradient-to-br from-slate-900 via-gray-800 to-zinc-900 rounded-2xl shadow-2xl p-4 overflow-y-auto relative flex flex-col">
        {/* Close button (top right) */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center z-10"
          aria-label="Close settings"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 pb-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div />
            <h1 className="text-3xl font-bold text-white text-center">⚙️ Settings</h1>
            <div className="w-10" /> {/* Spacer for centering */}
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

            {/* Game Mode 2: Number of Circles */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎯 Game Mode 2: Number of Circles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-white text-base">Circles</Label>
                  <button
                    className="px-3 py-1 bg-blue-700 text-white rounded-full text-lg font-bold disabled:opacity-50"
                    onClick={() => setNumCircles(Math.max(2, numCircles - 1))}
                    disabled={numCircles <= 2}
                  >
                    -
                  </button>
                  <span className="text-2xl text-white w-8 text-center">{numCircles}</span>
                  <button
                    className="px-3 py-1 bg-blue-700 text-white rounded-full text-lg font-bold"
                    onClick={() => setNumCircles(Math.min(20, numCircles + 1))}
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-gray-300">Choose between 2 and 20 circles for game mode 2.</div>
                <div className="text-xs text-yellow-300 font-semibold mt-1">8 players is recommended for best experience.</div>
              </CardContent>
            </Card>

            {/* Placeholder for future settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  ⚙️ Future Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="accent-gray-400" />
                    <span className="text-gray-400">Vibration (coming soon)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="accent-gray-400" />
                    <span className="text-gray-400">Background Music (coming soon)</span>
                  </label>
                </div>
                <div className="text-xs text-gray-400 text-center pt-4">
                  More settings coming soon!
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};