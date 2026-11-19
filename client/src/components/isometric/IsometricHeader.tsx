import React from 'react';
import type { UseGameClockReturn } from './clock/useGameClock';
import { formatGameDate } from './clock/gameClockTypes';

interface IsometricHeaderProps {
  gold: number;
  clock: UseGameClockReturn;
}

export const IsometricHeader: React.FC<IsometricHeaderProps> = ({ gold, clock }) => {
  const { date } = clock;

  return (
    <div className="flex items-center gap-3.5 text-sm sm:text-base font-mono text-stone-100 select-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-nowrap">
      <span className="font-bold uppercase tracking-wider text-amber-200">
        {formatGameDate(date)}
      </span>
      <span className="text-stone-500">•</span>
      <span className="font-bold tracking-wide text-sky-300">JOHN BIG</span>
      <span className="text-stone-500">•</span>
      <span className="font-bold text-emerald-400 text-base sm:text-lg">
        £ {gold.toLocaleString('en-US')}
      </span>
    </div>
  );
};

export const IsometricClockControls: React.FC<{
  clock: UseGameClockReturn;
  onOpenAdmin?: () => void;
}> = ({ clock, onOpenAdmin }) => {
  const { isPlaying, speed, togglePlay, setSpeed } = clock;

  return (
    <div className="flex items-center gap-2 bg-stone-900/90 px-2.5 py-1 rounded-xl border border-stone-800 text-xs font-mono shadow-xl backdrop-blur-md select-none">
      {onOpenAdmin && (
        <button
          onClick={onOpenAdmin}
          title="Panel administracyjny — parametry gry"
          className="px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:text-amber-200"
        >
          <span>⚙️</span>
          <span>Admin</span>
        </button>
      )}
      <button
        onClick={togglePlay}
        className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
          isPlaying
            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30'
            : 'bg-stone-800 border border-stone-700 text-stone-400 hover:text-white'
        }`}
      >
        <span>{isPlaying ? '⏸️' : '▶️'}</span>
        <span>{isPlaying ? 'Pauza' : 'Start'}</span>
      </button>

      <div className="flex items-center gap-1">
        <span className="text-[10px] text-stone-400 mr-0.5">Tempo:</span>
        {[
          { val: 1, label: '1x' },
          { val: 2, label: '2x' },
          { val: 5, label: '5x' },
        ].map((sp) => (
          <button
            key={sp.val}
            onClick={() => setSpeed(sp.val)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
              speed === sp.val
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 bg-stone-950/60'
            }`}
          >
            {sp.label}
          </button>
        ))}
      </div>
    </div>
  );
};
