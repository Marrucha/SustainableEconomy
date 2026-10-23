import React from 'react';
import type { LivestockCapitalismState } from './livestockTypes';
import { CattlePipeline } from './CattlePipeline';
import { SheepPipeline } from './SheepPipeline';
import { LivestockProgressBarsHeader } from './LivestockProgressBarsHeader';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface LivestockPipelineProps {
  state: LivestockCapitalismState;
  clock?: UseGameClockReturn;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const LivestockPipeline: React.FC<LivestockPipelineProps> = ({
  state,
  clock,
  onUpdateState,
  onGoToCrewTab,
}) => {
  const activeSpecies = state.activeSpecies || 'cattle';

  return (
    <div className="space-y-4">
      {/* PASKI POSTĘPU WZROSTU I CIĄŻY ORAZ PODAŻ MLEKA I NAWOZU ZGODNIE Z MIESIĄCAMI */}
      <LivestockProgressBarsHeader state={state} clock={clock} />

      {/* DEDYKOWANY RUROCIĄG BIOLOGICZNY W ZALEŻNOŚCI OD GATUNKU */}
      {activeSpecies === 'cattle' ? (
        <CattlePipeline
          state={state}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      ) : (
        <SheepPipeline
          state={state}
          onUpdateState={onUpdateState}
          onGoToCrewTab={onGoToCrewTab}
        />
      )}
    </div>
  );
};
