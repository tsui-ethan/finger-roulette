import { cn } from "@/lib/utils";

interface TouchCircleProps {
  id: number;
  active: boolean;
  selected: boolean;
  position: { x: number; y: number };
  size: number;
  onTouch?: (circleId: number, x: number, y: number) => void;
}

export const TouchCircle = ({ 
  id, 
  active, 
  selected, 
  position, 
  size,
  onTouch 
}: TouchCircleProps) => {
  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    if (onTouch) {
      onTouch(id, event.clientX, event.clientY);
    }
  };
  
  return (
    <div
      className={cn(
        "absolute rounded-full border-4 transition-all duration-300 ease-out",
        "flex items-center justify-center font-bold text-white",
        "cursor-pointer select-none touch-none",
        "transform -translate-x-1/2 -translate-y-1/2",
        active && !selected && "border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-400/50 scale-110",
        !active && !selected && "border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hover:scale-105",
        selected && "border-red-500 bg-red-500/30 shadow-xl shadow-red-500/70 scale-125 animate-pulse"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size / 4}px`
      }}
      onPointerDown={handlePointerDown}
      data-circle-id={id}
    >
      {selected && (
        <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
      )}
      <span className={cn(
        "z-10 relative",
        selected && "text-red-100 font-extrabold"
      )}>
        {id + 1}
      </span>
      
      {/* Glow effect for active circles */}
      {active && !selected && (
        <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-sm scale-110" />
      )}
      
      {/* Winner glow effect */}
      {selected && (
        <div className="absolute inset-0 rounded-full bg-red-500/30 blur-md scale-150 animate-pulse" />
      )}
    </div>
  );
};
