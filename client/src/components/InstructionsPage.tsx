import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface InstructionsPageProps {
  onBack: () => void;
}

export const InstructionsPage = ({ onBack }: InstructionsPageProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[95vw] h-[95vh] bg-gradient-to-br from-slate-900 via-gray-800 to-zinc-900 rounded-2xl shadow-2xl p-4 overflow-y-auto relative flex flex-col">
        {/* Close button (top right) */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center z-10"
          aria-label="Close instructions"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 pb-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div />
            <h1 className="text-3xl font-bold text-white text-center">❓ How to Play</h1>
            <div className="w-10" />
          </div>
          <div className="space-y-6 text-white text-lg max-w-2xl mx-auto">
            <p>
              <strong>Finger Roulette</strong> is a fast-paced party game designed to break the ice, pick a random player, or add excitement to any group gathering!
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Everyone places a finger (or pointer) on the screen or clicks to join the game.</li>
              <li>Once the first player joins, a countdown begins (with sound beeps for suspense!).</li>
              <li>When the countdown ends, the game randomly selects one player as the winner (or the next to do a challenge, dare, or task).</li>
              <li>The winner's circle is highlighted for a few seconds, then the game resets for the next round.</li>
            </ol>
            <p>
              <strong>Use Cases:</strong>
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Decide who goes first in a game</li>
                <li>Pick someone for a dare or challenge</li>
                <li>Break ties or make group decisions</li>
                <li>Just have fun with friends!</li>
              </ul>
            </p>
            <p>
              <strong>Tips:</strong>
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Use on any touchscreen device or with a mouse</li>
                <li>Turn sound on for the best experience</li>
                <li>Try different game modes for more variety (coming soon!)</li>
              </ul>
            </p>
            <p className="text-center text-gray-300 mt-8">
              Enjoy the game and let chance decide!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
