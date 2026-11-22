import React from 'react';
import {
  computeLivestockHorseRequirement,
  type LivestockCapitalismState,
} from './livestockTypes';
import { CattlePipeline } from './CattlePipeline';
import { SheepPipeline } from './SheepPipeline';
import { HorsePipeline } from './HorsePipeline';
import { PoultryPipeline } from './PoultryPipeline';
import { LivestockProgressBarsHeader } from './LivestockProgressBarsHeader';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface LivestockPipelineProps {
  state: LivestockCapitalismState;
  ownedHorsesCount?: number;
  clock?: UseGameClockReturn;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const LivestockPipeline: React.FC<LivestockPipelineProps> = ({
  state,
  ownedHorsesCount = 0,
  clock,
  onUpdateState,
  onGoToCrewTab,
}) => {
  const activeSpecies = state.activeSpecies || 'cattle';
  const horseReq = computeLivestockHorseRequirement(state, ownedHorsesCount);

  return (
    <div className="space-y-4">
      {activeSpecies !== 'horses' && (
        <div
          className={`px-3.5 py-2 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
            horseReq.isSatisfied
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200 font-semibold'
          }`}
        >
          <span>
            🐎 Energia konna (pasza i wywóz obornika):{' '}
            <strong className="font-mono text-amber-300">
              {horseReq.ownedHorsesCount} / {horseReq.requiredHorses} koni
            </strong>
          </span>
          <span className="text-[11px] font-mono">
            {horseReq.isSatisfied
              ? '✓ Siła pociągowa zabezpieczona (1 koń / 20 krów, 50 owiec, 500 kur)'
              : '⛔ Kup konie w zakładce ⚡ Energia, aby uruchomić produkcję i inseminację'}
          </span>
        </div>
      )}

      {/* PASKI POSTĘPU WZROSTU I CIĄŻY ORAZ PODAŻ MLEKA I NAWOZU ZGODNIE Z MIESIĄCAMI */}
      <LivestockProgressBarsHeader state={state} clock={clock} />

      {/* DEDYKOWANY RUROCIĄG BIOLOGICZNY W ZALEŻNOŚCI OD GATUNKU */}
      {activeSpecies === 'cattle' ? (
        <CattlePipeline
          state={state}
          ownedHorsesCount={ownedHorsesCount}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      ) : activeSpecies === 'sheep' ? (
        <SheepPipeline
          state={state}
          ownedHorsesCount={ownedHorsesCount}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      ) : activeSpecies === 'poultry' ? (
        <PoultryPipeline
          state={state}
          ownedHorsesCount={ownedHorsesCount}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      ) : (
        <HorsePipeline
          state={state}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      )}
    </div>
  );
};
