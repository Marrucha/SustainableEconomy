import React from 'react';
import type { FruitType } from './orchardTypes';
import { FRUITS_CONFIG } from './orchardTypes';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { calculateOrchardProgress, ORCHARD_FRUIT_VEGETATION } from './orchardProgressMath';
import { MONTH_NAMES } from '../../clock/gameClockTypes';

interface OrchardProgressBarProps {
  fruitType: FruitType;
  clock?: UseGameClockReturn;
}

export const OrchardProgressBar: React.FC<OrchardProgressBarProps> = ({
  fruitType,
  clock,
}) => {
  const currentDate = clock?.date || { day: 15, month: 4, year: 1880 };
  const fruitInfo = FRUITS_CONFIG[fruitType] || FRUITS_CONFIG.jablko;
  const vegCfg = ORCHARD_FRUIT_VEGETATION[fruitType] || ORCHARD_FRUIT_VEGETATION.jablko;

  const progress = calculateOrchardProgress(fruitType, currentDate);
  const currentMonthName = MONTH_NAMES[currentDate.month - 1] || 'Kwiecień';

  return (
    <div className="p-3.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-amber-500/40 shadow-inner space-y-2.5">
      {/* GÓRNY WIERSZ: ETAP I KALENDARZ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">{progress.phaseIcon}</span>
          <span className="font-bold text-amber-100">{progress.phaseLabel}</span>
          <span className="text-[10px] text-stone-400 font-mono">
            ({currentDate.day} {currentMonthName} {currentDate.year})
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-stone-400 text-[11px]">{progress.seasonDesc}</span>
          <span className="font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
            {progress.progressPercent}%
          </span>
        </div>
      </div>

      {/* PASEK POSTĘPU */}
      <div className="w-full bg-stone-950 h-3 rounded-full border border-stone-800 p-0.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-300 shadow-sm"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>

      {/* DOLNY WIERSZ: RAMY CZASOWE WEGETACJI */}
      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
        <span className="flex items-center gap-1 text-stone-400">
          <span>🌱</span>
          <span>Start wegetacji: <strong>1 Marca</strong></span>
        </span>

        <span className="text-stone-500">
          • Dzień cyklu: {progress.currentSeasonDay} / {progress.totalSeasonDays} •
        </span>

        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <span>{fruitInfo.icon}</span>
          <span>Zbiory ({fruitInfo.name.split(' ')[0]}): <strong>{vegCfg.harvestMonthName}</strong></span>
        </span>
      </div>
    </div>
  );
};
