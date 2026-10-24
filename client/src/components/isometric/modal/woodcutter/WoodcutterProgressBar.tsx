import React from 'react';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import type { WoodcutterCrewStaff } from './woodcutterTypes';
import { calculateWoodcutterProgress } from './woodcutterProgressMath';
import { MONTH_NAMES } from '../../clock/gameClockTypes';

interface WoodcutterProgressBarProps {
  crew: WoodcutterCrewStaff;
  efficiency: number;
  clock?: UseGameClockReturn;
}

export const WoodcutterProgressBar: React.FC<WoodcutterProgressBarProps> = ({
  crew,
  clock,
}) => {
  const currentDate = clock?.date || { day: 15, month: 11, year: 1880 };
  const prog = calculateWoodcutterProgress(currentDate, crew);
  const monthName = MONTH_NAMES[currentDate.month - 1] || 'Listopad';

  return (
    <div className="p-3.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-emerald-500/40 shadow-inner space-y-2.5 select-none">
      {/* GÓRNY WIERSZ: ETAP I KALENDARZ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">{prog.stageInfo.icon}</span>
          <span className="font-bold text-emerald-100">
            Krok {prog.stageInfo.stepNumber}/4: {prog.stageInfo.label}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            ({currentDate.day} {monthName} {currentDate.year})
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={prog.isStageReady ? 'text-emerald-400 text-[11px]' : 'text-red-400 text-[11px] font-bold'}>
            {prog.isStageReady ? `✓ ${prog.stageInfo.requiredRole} na stanowisku` : `⚠️ Wstrzymano: ${prog.missingRole}`}
          </span>
          <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
            {prog.progressPercent}% rocznego cyklu
          </span>
        </div>
      </div>

      {/* GŁÓWNY PASEK ROCZNEGO CYKLU PRODUKCYJNEGO */}
      <div className="w-full bg-stone-950 h-3 rounded-full border border-stone-800 p-0.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 shadow-sm ${
            prog.isStageReady
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-300'
              : 'bg-red-500'
          }`}
          style={{ width: `${prog.progressPercent}%` }}
        />
      </div>

      {/* DOLNY WIERSZ: 4 KROKI CYKLU OD LISTOPADA */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-stone-400 font-mono gap-1 pt-0.5">
        <span className={prog.currentStage === 'inventory' ? 'text-emerald-300 font-bold' : 'text-stone-500'}>
          1. Inwentaryzacja (XI)
        </span>
        <span className="text-stone-700">→</span>
        <span className={prog.currentStage === 'logging' ? 'text-emerald-300 font-bold' : 'text-stone-500'}>
          2. Wyręb (XII–I)
        </span>
        <span className="text-stone-700">→</span>
        <span className={prog.currentStage === 'hauling' ? 'text-emerald-300 font-bold' : 'text-stone-500'}>
          3. Zwózka z końmi (II)
        </span>
        <span className="text-stone-700">→</span>
        <span className={prog.currentStage === 'drying' ? 'text-emerald-300 font-bold' : 'text-stone-500'}>
          4. Suszenie 8 msc (III–X)
        </span>
      </div>
    </div>
  );
};
