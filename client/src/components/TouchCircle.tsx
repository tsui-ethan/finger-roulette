import React, { useState } from "react";
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
  const [isMousePressed, setIsMousePressed] = useState(false);

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onTouch) {
      onTouch(id, event.clientX, event.clientY);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsMousePressed(true);
    if (onTouch) {
      onTouch(id, event.clientX, event.clientY);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsMousePressed(false);
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsMousePressed(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onTouch && event.touches.length > 0) {
      const touch = event.touches[0];
      onTouch(id, touch.clientX, touch.clientY);
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
        selected && "border-red-500 bg-red-500/30 shadow-xl shadow-red-500/70 scale-125 animate-pulse",
        isMousePressed && !selected && "scale-105 bg-blue-500/20 border-blue-400"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
        fontSize: `${size / 4}px`,
        borderRadius: '50%',
        boxSizing: 'border-box',
        touchAction: 'none', // Prevents browser gestures on mobile
        userSelect: 'none', // Prevents text selection on desktop
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none',
        background: 'rgba(0,0,0,0.01)'
      }}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      data-circle-id={id}
      tabIndex={0} // Make focusable for keyboard
      onWheel={e => e.stopPropagation()} // Prevent scroll events from bubbling
      onScroll={e => e.stopPropagation()} // Prevent scroll events from bubbling
      aria-label={`Touch circle ${id + 1}`}
      role="button"
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
