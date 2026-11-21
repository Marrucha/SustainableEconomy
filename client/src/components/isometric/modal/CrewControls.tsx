import React from 'react';

interface WorkdayHoursBarProps {
  workdayHours?: number;
  onChangeHours: (hours: number) => void;
}

export const WorkdayHoursBar: React.FC<WorkdayHoursBarProps> = ({
  workdayHours = 10,
  onChangeHours,
}) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">🕒</span>
        <div>
          <span className="text-xs font-bold text-amber-200">
            Dzień pracy załogi:{' '}
            <span className="font-mono text-emerald-300">{workdayHours} godz./dzień</span>
          </span>
          <p className="text-[10px] text-stone-400">
            Ustaw długość zmiany (6–16 godz.) dla pracowników tego zakładu.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[8, 10, 12, 14].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onChangeHours(h)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors border ${
                workdayHours === h
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
        <input
          type="range"
          min={6}
          max={16}
          step={1}
          value={workdayHours}
          onChange={(e) => onChangeHours(Number(e.target.value))}
          className="w-24 accent-amber-500 cursor-pointer"
          title={`Długość dnia pracy: ${workdayHours} godz.`}
        />
      </div>
    </div>
  );
};

interface WorkerDailyWageInputProps {
  wage: number;
  min?: number;
  max?: number;
  step?: number;
  onChangeWage: (nextWage: number) => void;
}

export const WorkerDailyWageInput: React.FC<WorkerDailyWageInputProps> = ({
  wage,
  min = 0.5,
  max = 20,
  step = 0.5,
  onChangeWage,
}) => {
  const clamp = (v: number) =>
    Math.min(max, Math.max(min, Number(v.toFixed(2))));

  return (
    <div className="inline-flex items-center gap-1 bg-stone-950/90 border border-stone-700 rounded-lg px-1 py-0.5">
      <button
        type="button"
        onClick={() => onChangeWage(clamp(wage - step))}
        className="w-4 h-4 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center cursor-pointer"
        title="Zmniejsz stawkę dzienną"
      >
        -
      </button>
      <span className="text-[10px] font-mono font-bold text-amber-300">£</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={wage}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          if (!Number.isNaN(parsed)) onChangeWage(clamp(parsed));
        }}
        className="w-11 bg-transparent text-center font-mono text-[11px] font-bold text-amber-300 focus:outline-none"
      />
      <span className="text-[10px] font-mono text-stone-400">/d</span>
      <button
        type="button"
        onClick={() => onChangeWage(clamp(wage + step))}
        className="w-4 h-4 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center cursor-pointer"
        title="Zwiększ stawkę dzienną"
      >
        +
      </button>
    </div>
  );
};
