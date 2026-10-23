import React from 'react';
import type { UseGameClockReturn } from './clock/useGameClock';
import { formatGameDate, AGRICULTURAL_SCHEDULE } from './clock/gameClockTypes';

interface IsometricHeaderProps {
  gold: number;
  clock: UseGameClockReturn;
}

export const IsometricHeader: React.FC<IsometricHeaderProps> = ({ gold, clock }) => {
  const { date, isPlaying, speed, togglePlay, setSpeed } = clock;

  const currentSchedule = AGRICULTURAL_SCHEDULE.find((s) => s.months.includes(date.month));

  return (
    <div className="absolute top-4 left-4 bg-stone-900/95 border border-amber-600/50 rounded-2xl p-4 backdrop-blur-md shadow-2xl min-w-[320px] text-stone-200 z-30 select-none">
      {/* GÓRNY PASEK: ZEGAR I SKARBIEC */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-2.5">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold block mb-1">
            ⏱️ {formatGameDate(date)}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {currentSchedule?.seasonName || 'Rok 1880'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-stone-400 block font-mono">Skarbiec miejski:</span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            £ {gold.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* STEROWANIE ZEGAREM GRY (SZYBKOŚĆ CYKLU) */}
      <div className="flex items-center justify-between gap-2 mb-2 bg-stone-950/80 p-1.5 rounded-xl border border-stone-800/90 text-xs font-mono">
        <button
          onClick={togglePlay}
          className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
            isPlaying
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30'
              : 'bg-stone-800 border border-stone-700 text-stone-400 hover:text-white'
          }`}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span>{isPlaying ? 'Pauza' : 'Start'}</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-stone-400 mr-1">Tempo:</span>
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
                  : 'text-stone-400 hover:text-stone-200 bg-stone-900/60'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-base font-bold font-serif text-amber-100">
        Wiktoriański Plac Budowy
      </h2>
      <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
        Wybierz kategorię i budynek z dolnego paska, aby wybudować.
      </p>

      <div className="mt-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400 space-y-0.5">
        <p>🖱️ <span className="text-stone-200 font-semibold">Kliknięcie:</span> Zarządzanie budynkiem</p>
        <p>🔄 <span className="text-stone-200 font-semibold">Klawisz [R]:</span> Obrót budynku / drogi</p>
        <p>❌ <span className="text-stone-200 font-semibold">Klawisz [Esc]:</span> Anuluj / zamknij okno</p>
      </div>
    </div>
  );
};
