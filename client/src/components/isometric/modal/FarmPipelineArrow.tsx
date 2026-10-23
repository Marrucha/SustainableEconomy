import React from 'react';

interface FarmPipelineArrowProps {
  direction: 'right' | 'left' | 'down';
  status: 'ready' | 'blocked' | 'optional_bypassed';
  label?: string;
}

export const FarmPipelineArrow: React.FC<FarmPipelineArrowProps> = ({
  direction,
  status,
}) => {
  // Kolory i poświaty rurociągu
  let strokeColor = '#10b981'; // Zielony (ready)
  let filterGlow = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))';
  let isDashed = false;

  if (status === 'blocked') {
    strokeColor = '#f43f5e'; // Czerwony (blocked)
    filterGlow = 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.9))';
  } else if (status === 'optional_bypassed') {
    strokeColor = '#f59e0b'; // Żółty (bypassed optional)
    filterGlow = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))';
    isDashed = true;
  }

  if (direction === 'down') {
    return (
      <div className="flex flex-col items-center justify-center py-1 relative select-none">
        {/* PIONOWA GRUBA RURA Z DUŻĄ STRZAŁKĄ W DÓŁ */}
        <div className="flex items-center justify-center bg-stone-950/90 border border-stone-800 p-2 rounded-2xl shadow-xl">
          <svg width="32" height="32" viewBox="0 0 36 36" style={{ filter: filterGlow }}>
            <line
              x1="18"
              y1="4"
              x2="18"
              y2="22"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '6 4' : undefined}
            />
            <polygon
              points="10,18 18,30 26,18"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  // POZIOME STRZAŁKI W PRAWO (──►►) LUB W LEWO (◄◄──)
  const isRight = direction === 'right';

  return (
    <div className="flex items-center justify-center w-full my-auto px-1 select-none">
      <svg
        width="100%"
        height="32"
        viewBox="0 0 60 32"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: filterGlow }}
        className="overflow-visible"
      >
        {isRight ? (
          <>
            {/* GRUBA RURA W PRAWO (──►►) */}
            <line
              x1="4"
              y1="16"
              x2="44"
              y2="16"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '6 4' : undefined}
            />
            {/* PODWÓJNY DUŻY GROT STRZAŁKI */}
            <polygon
              points="34,8 48,16 34,24"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="44,8 56,16 44,24"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            {/* GRUBA RURA W LEWO (◄◄──) */}
            <line
              x1="56"
              y1="16"
              x2="16"
              y2="16"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '6 4' : undefined}
            />
            {/* PODWÓJNY DUŻY GROT STRZAŁKI W LEWO */}
            <polygon
              points="26,8 12,16 26,24"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="16,8 4,16 16,24"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </div>
  );
};
