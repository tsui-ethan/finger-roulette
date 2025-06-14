import React from "react";

interface TouchCircleProps {
  id: number;
  position: { x: number; y: number };
  number: number;
  size: number;
  highlight?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

export const TouchCircle = ({ id, position, number, size, highlight, borderColor, borderWidth }: TouchCircleProps) => {
  return (
    <div
      className="absolute rounded-full flex items-center justify-center font-bold transform -translate-x-1/2 -translate-y-1/2 select-none"
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
        background: highlight ? '#f6e05e' : 'rgba(255, 221, 51, 0.15)',
        border: borderColor ? `${borderWidth || 4}px solid ${borderColor}` : 'none',
        boxShadow: 'none',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      aria-label={`Touch circle ${number}`}
      role="button"
    >
      <span
        style={highlight ? { color: '#222', textShadow: 'none' } : {}}
        className={highlight ? 'z-10 relative' : 'z-10 relative text-white drop-shadow-lg'}
      >
        {number}
      </span>
    </div>
  );
};
