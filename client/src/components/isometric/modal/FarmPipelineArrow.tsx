import React from 'react';

interface FarmPipelineArrowProps {
  direction: 'right' | 'left' | 'down';
  status: 'ready' | 'blocked' | 'optional_bypassed';
  isActivePulse?: boolean;
  label?: string;
}

export const FarmPipelineArrow: React.FC<FarmPipelineArrowProps> = ({
  direction,
  status,
  isActivePulse = false,
}) => {
  // Kolory i poświaty rurociągu
  let strokeColor = '#10b981'; // Zielony (ready)
  let filterGlow = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))';
  let isDashed = false;

  if (isActivePulse) {
    strokeColor = '#ef4444'; // Czerwony pulsujący dla strzałki za aktywnym krokiem
    filterGlow = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.95))';
  } else if (status === 'blocked') {
    strokeColor = '#f43f5e'; // Czerwony (blocked)
    filterGlow = 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.9))';
  } else if (status === 'optional_bypassed') {
    strokeColor = '#f59e0b'; // Żółty (bypassed optional)
    filterGlow = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))';
    isDashed = true;
  }

  if (direction === 'down') {
    return (
      <div className={`flex items-center justify-center py-0 select-none ${isActivePulse ? 'animate-pulse' : ''}`}>
        <svg width="20" height="18" viewBox="0 0 24 20" style={{ filter: filterGlow }} className="overflow-visible">
          {isActivePulse && (
            <>
              <line x1="12" y1="1" x2="12" y2="12" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
              <polygon points="6,10 12,18 18,10" fill="#ffffff" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
            </>
          )}
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="12"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={isDashed ? '4 3' : undefined}
          />
          <polygon
            points="6,10 12,18 18,10"
            fill={strokeColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // POZIOME STRZAŁKI W PRAWO LUB W LEWO — IDENTYCZNY STYL JAK STRZAŁKA W DÓŁ
  const isRight = direction === 'right';

  return (
    <div className={`flex items-center justify-center w-full my-auto select-none ${isActivePulse ? 'animate-pulse' : ''}`}>
      <svg
        width="22"
        height="20"
        viewBox="0 0 24 24"
        style={{ filter: filterGlow }}
        className="overflow-visible"
      >
        {isRight ? (
          <>
            {isActivePulse && (
              <>
                <line x1="3" y1="12" x2="14" y2="12" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                <polygon points="12,6 21,12 12,18" fill="#ffffff" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
              </>
            )}
            <line
              x1="3"
              y1="12"
              x2="14"
              y2="12"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '4 3' : undefined}
            />
            <polygon
              points="12,6 21,12 12,18"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            {isActivePulse && (
              <>
                <line x1="21" y1="12" x2="10" y2="12" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                <polygon points="12,6 3,12 12,18" fill="#ffffff" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
              </>
            )}
            <line
              x1="21"
              y1="12"
              x2="10"
              y2="12"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '4 3' : undefined}
            />
            <polygon
              points="12,6 3,12 12,18"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </div>
  );
};
