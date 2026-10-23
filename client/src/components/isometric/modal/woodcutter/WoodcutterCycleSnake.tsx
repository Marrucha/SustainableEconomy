import React from 'react';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import {
  WOODCUTTER_STAGES,
  WOODCUTTER_FLOW,
  getWoodcutterStageForMonth,
  type WoodcutterCrewStaff,
  checkIsWoodcutterStageReady,
} from './woodcutterTypes';
import { MONTH_NAMES } from '../../clock/gameClockTypes';

interface WoodcutterCycleSnakeProps {
  crew: WoodcutterCrewStaff;
  forestTiles: number;
  efficiency: number;
  clock?: UseGameClockReturn;
  onGoToCrewTab: () => void;
}

export const WoodcutterCycleSnake: React.FC<WoodcutterCycleSnakeProps> = ({
  crew,
  forestTiles,
  efficiency,
  clock,
  onGoToCrewTab,
}) => {
  const currentDate = clock?.date || { day: 15, month: 11, year: 1880 };
  const currentStageId = getWoodcutterStageForMonth(currentDate.month);
  const activeStage = WOODCUTTER_STAGES[currentStageId];
  const stageReady = checkIsWoodcutterStageReady(currentStageId, crew);

  const monthName = MONTH_NAMES[currentDate.month - 1] || 'Listopad';

  return (
    <div className="space-y-4 select-none">
      {/* NAGŁÓWEK AKTUALNEGO ETAPU CYKLU */}
      <div className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeStage.icon}</span>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-300">
              Krok {activeStage.stepNumber} z 4 • {activeStage.label}
            </span>
          </div>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-xl">
            {activeStage.desc}
          </p>
        </div>

        <div className="bg-stone-950/90 border border-stone-800 px-3.5 py-2 rounded-xl text-right font-mono text-xs">
          <span className="text-stone-400 block text-[10px]">Aktualna data gry:</span>
          <span className="text-amber-300 font-bold">{currentDate.day} {monthName} {currentDate.year}</span>
        </div>
      </div>

      {/* 4 ETAPY WĘŻA PRODUKCYJNEGO (OD LISTOPADA) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {WOODCUTTER_FLOW.map((sKey) => {
          const st = WOODCUTTER_STAGES[sKey];
          const isCurrent = sKey === currentStageId;
          const ready = checkIsWoodcutterStageReady(sKey, crew);

          return (
            <div
              key={sKey}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-emerald-950/50 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl p-1 bg-stone-900 rounded-lg border border-stone-800">
                    {st.icon}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    Krok {st.stepNumber}
                  </span>
                </div>

                <h4 className={`text-xs font-bold ${isCurrent ? 'text-emerald-100' : 'text-stone-300'}`}>
                  {st.label}
                </h4>

                <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                  {st.monthsLabel}
                </span>

                <p className="text-[11px] text-stone-400 leading-relaxed mt-2 line-clamp-3">
                  {st.desc}
                </p>
              </div>

              {/* WYMÓG ZAŁOGI */}
              <div className="pt-2.5 mt-3 border-t border-stone-800/80 text-[10px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 flex items-center gap-1">
                    <span>{st.requiredRoleIcon}</span>
                    <span>{st.requiredRole}:</span>
                  </span>
                  <span className={ready.isReady ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {ready.isReady ? '✓ Przypisany' : '✗ Brak'}
                  </span>
                </div>

                {st.secondaryRequirement && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1">
                      <span>{st.secondaryRequirementIcon}</span>
                      <span>{st.secondaryRequirement}:</span>
                    </span>
                    <span className={crew.horsesCount >= 2 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {crew.horsesCount >= 2 ? `${crew.horsesCount} konie` : 'Wymagane'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PASEK ZASOBNOŚCI I WYDAJNOŚCI */}
      <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between text-xs font-mono">
        <span className="text-stone-400 flex items-center gap-1.5">
          <span>🌲</span>
          <span>Baza surowcowa: <strong>{forestTiles}/32 pól leśnych</strong></span>
        </span>

        <span className="text-emerald-400 font-bold">
          Wydajność zrębu: {efficiency}%
        </span>

        {!stageReady.isReady && (
          <button
            onClick={onGoToCrewTab}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Uzupełnij załogę ({stageReady.missing[0]})
          </button>
        )}
      </div>
    </div>
  );
};
