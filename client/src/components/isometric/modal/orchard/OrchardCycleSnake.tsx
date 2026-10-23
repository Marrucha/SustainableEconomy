import React from 'react';
import type {
  OrchardCapitalismState,
  OrchardCycleStage,
} from './orchardTypes';
import {
  ORCHARD_STAGE_LABELS,
  FRUITS_CONFIG,
  checkIsOrchardReady,
} from './orchardTypes';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface OrchardCycleSnakeProps {
  state: OrchardCapitalismState;
  clock?: UseGameClockReturn;
  onAdvanceCycle: () => void;
  onGoToCrewTab: () => void;
}

const ORCHARD_FLOW: OrchardCycleStage[] = [
  'whitewash',
  'pruning',
  'blossoming',
  'weeding',
  'growing',
  'harvesting',
  'storing_selling',
];

export const OrchardCycleSnake: React.FC<OrchardCycleSnakeProps> = ({
  state,
  onAdvanceCycle,
  onGoToCrewTab,
}) => {
  const readyCheck = checkIsOrchardReady(state);
  const activeFruit = FRUITS_CONFIG[state.fruitType || 'jablko'] || FRUITS_CONFIG.jablko;
  const currentIdx = ORCHARD_FLOW.indexOf(state.currentStage);

  return (
    <div className="space-y-5">
      {/* 1. STAŁE NASADZENIE SADU (ZDECYDOWANE PRZY BUDOWIE) */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-amber-300 font-mono uppercase tracking-wider block">
              Zasada Sadownictwa 1880 • Stały Gatunek Nasadzony przy Budowie
            </span>
            <h3 className="text-sm font-bold text-amber-100 flex items-center gap-2 mt-0.5">
              <span>{activeFruit.icon}</span> Uprawiany Gatunek: {activeFruit.name}
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Drzewa owocowe rosną dziesiątki lat – gatunek został zadecydowany przy budowie sadu i nie podlega zmianie.
            </p>
          </div>
          <div className="bg-stone-950/90 border border-amber-500/50 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-stone-400 font-mono block">Nasadzenie sadu:</span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
              <span>{activeFruit.icon}</span>
              <span>{activeFruit.name.split(' ')[0]} (Stały)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. WĄŻ CYKLU PRODUKCJI SADU (7 ETAPÓW) */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>🐍</span> Wąż Cyklu Sadowniczego (7 Etapów Wegetacji)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Zamiast zasiewu: wiosenne przycinanie koron drzewek. Brak zakupu nasion i nawożenia.
            </p>
          </div>
          <div className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            Ukończone cykle: <span className="text-amber-300 font-bold">{state.totalCyclesCompleted}</span>
          </div>
        </div>

        {/* SIATKA KROKÓW WĘŻA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {ORCHARD_FLOW.map((stageKey, idx) => {
            const stInfo = ORCHARD_STAGE_LABELS[stageKey];
            const isCurrent = state.currentStage === stageKey;
            const isPast = currentIdx > idx;
            const assignedWorkerId = state.stageAssignments[stageKey];
            const assignedWorker = state.crew.find((w) => w.id === assignedWorkerId);

            return (
              <div
                key={stageKey}
                className={`relative rounded-2xl p-3.5 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-950/60 to-stone-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                    : isPast
                    ? 'bg-stone-900/60 border-emerald-800/40 opacity-80'
                    : 'bg-stone-950/40 border-stone-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
                      Krok {idx + 1}/7
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        W toku
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ Gotowe
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xl p-1 bg-stone-900 rounded-xl border border-stone-800">
                      {stInfo.icon}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-amber-100">{stInfo.label}</h5>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {stInfo.season}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
                    {stInfo.desc}
                  </p>
                </div>

                {/* OBSADA ROLI */}
                <div className="pt-2 border-t border-stone-800/60 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Sadownik:</span>
                    {assignedWorker ? (
                      <span className="font-bold text-amber-200 flex items-center gap-1">
                        <span>{assignedWorker.avatar}</span>
                        <span>{assignedWorker.name}</span>
                      </span>
                    ) : (
                      <button
                        onClick={onGoToCrewTab}
                        className="text-rose-400 font-bold hover:underline cursor-pointer"
                      >
                        ⚠️ Brak obsady
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. BELKA STEROWANIA CYKLEM */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">
                Bieżący etap wegetacji: {ORCHARD_STAGE_LABELS[state.currentStage].label}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ({state.stageProgress}%)
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-[2.5] mt-0.5">
              {readyCheck.isReady
                ? 'Sadownicy i Mistrz Pomolog pracują w sadzie. Możesz pchnąć cykl do kolejnego etapu.'
                : `⚠️ Sad wstrzymany: uzupełnij brakujące role (${readyCheck.missingRoles.join(', ')}).`}
            </p>
          </div>

          <button
            onClick={onAdvanceCycle}
            disabled={!readyCheck.isReady}
            className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer leading-[2.5] ${
              readyCheck.isReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-md font-bold'
                : 'bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <span>⏭️</span>
            <span>Kolejny etap sadu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
