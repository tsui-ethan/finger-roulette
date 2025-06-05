import React from "react";

interface TouchCircleProps {
  id: number;
  position: { x: number; y: number };
  number: number;
  size: number;
}

export const TouchCircle = ({ id, position, number, size }: TouchCircleProps) => {
  return (
    <div
      className="absolute rounded-full border-4 border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-400/50 flex items-center justify-center font-bold text-white transform -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size / 3.5}px`,
        borderRadius: '50%',
        boxSizing: 'border-box',
        touchAction: 'none',
        userSelect: 'none',
        background: 'rgba(255, 221, 51, 0.15)'
      }}
      aria-label={`Touch circle ${number}`}
      role="button"
    >
      <span className="z-10 relative text-white drop-shadow-lg">{number}</span>
    </div>
  );
};
