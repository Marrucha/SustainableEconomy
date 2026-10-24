import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { HopCapitalismState, HopCycleStage } from './hopTypes';
import { createDefaultHopState } from './hopTypes';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { HopCycleSnake } from './HopCycleSnake';
import { HopCrewTab } from './HopCrewTab';
import { HopStorageBins } from './HopStorageBins';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface HopSectionProps {
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const CYCLE_STAGES_FLOW: HopCycleStage[] = [
  'rhizome_intake',
  'plowing_stringing',
  'training',
  'fertilizing',
  'stripping',
  'growing',
  'harvesting',
  'drying_selling',
];

export const HopSection: React.FC<HopSectionProps> = ({
  buildingState,
  businessTab,
  hasGreenRelief,
  clock,
  onUpdateState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'snake' | 'crew' | 'storage'>('snake');

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle="Farma Chmielu"
        energySource={buildingState.businessEnergySource || 'drewno'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  const rawCap = buildingState.hopState;
  const hopCap: HopCapitalismState =
    rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
      ? rawCap
      : createDefaultHopState();

  const handleUpdateHopCap = (updates: Partial<HopCapitalismState>) => {
    const nextState: HopCapitalismState = {
      ...hopCap,
      ...updates,
    };
    onUpdateState({
      hopState: nextState,
    });
  };

  const handleAdvanceCycle = () => {
    const curIdx = CYCLE_STAGES_FLOW.indexOf(hopCap.currentStage);
    let nextIdx = (curIdx + 1) % CYCLE_STAGES_FLOW.length;

    if (CYCLE_STAGES_FLOW[nextIdx] === 'fertilizing' && !hopCap.enableFertilizing) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }
    if (CYCLE_STAGES_FLOW[nextIdx] === 'stripping' && !hopCap.enableStripping) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }

    const nextStage = CYCLE_STAGES_FLOW[nextIdx];
    const isCompletedCycle = nextIdx === 0;

    const baseCones = hopCap.variety === 'golding' ? 440 : 620;
    const bonusFert = hopCap.enableFertilizing ? 260 : 0;
    const bonusStrip = hopCap.enableStripping ? 180 : 0;
    const agroMul = hopCap.agronomist.hired ? 1 + hopCap.agronomist.yieldBonusPercent / 100 : 1.0;

    const totalCones = Math.round((baseCones + bonusFert + bonusStrip) * agroMul);

    const rhizomeCost = hopCap.rhizomeSource === 'market' ? 28 : 0;
    const fertCost = hopCap.enableFertilizing ? 16 : 0;
    const stripCost = hopCap.enableStripping ? 11 : 0;
    const laborCost = hopCap.crew.reduce((acc, w) => acc + w.wageDaily, 0);
    const agroCost = hopCap.agronomist.hired ? hopCap.agronomist.wageDaily : 0;
    const cost = rhizomeCost + fertCost + stripCost + laborCost + agroCost;

    const priceCones = hopCap.variety === 'golding' ? 270 : 195;
    const rev = hopCap.productDestination === 'sell_market'
      ? Math.round((totalCones / 1000) * priceCones)
      : 0;

    const updatedDried = isCompletedCycle && hopCap.productDestination === 'store_silo'
      ? (hopCap.driedConesStockKg || 0) + totalCones
      : hopCap.driedConesStockKg;
    const updatedSpent = isCompletedCycle
      ? (hopCap.spentHopsStockKg || 0) + Math.round(totalCones * 0.35)
      : hopCap.spentHopsStockKg;

    handleUpdateHopCap({
      currentStage: nextStage,
      stageProgress: Math.min(100, Math.round(((nextIdx + 1) / CYCLE_STAGES_FLOW.length) * 100)),
      totalCyclesCompleted: isCompletedCycle ? hopCap.totalCyclesCompleted + 1 : hopCap.totalCyclesCompleted,
      driedConesStockKg: updatedDried,
      spentHopsStockKg: updatedSpent,
      lastCycleConesKg: isCompletedCycle ? totalCones : hopCap.lastCycleConesKg,
      lastCycleRevenue: isCompletedCycle ? rev : hopCap.lastCycleRevenue,
      lastCycleCost: isCompletedCycle ? cost : hopCap.lastCycleCost,
    });
  };

  return (
    <div className="space-y-4">
      {/* GŁÓWNY PRZEŁĄCZNIK ZAKŁADEK */}
      <div className="flex bg-stone-950/80 p-1 rounded-2xl border border-stone-800 text-xs gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveSubTab('snake')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'snake'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🐍</span>
          <span>Wąż Cyklu Chmielu (8 Etapów)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crew')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'crew'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">👥</span>
          <span>Załoga i Mistrz (System 2w1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('storage')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'storage'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🏛️</span>
          <span>Magazyn Oast House</span>
        </button>
      </div>

      {/* ZAWARTOŚĆ WYBRANEJ ZAKŁADKI */}
      {activeSubTab === 'snake' && (
        <HopCycleSnake
          state={hopCap}
          clock={clock}
          onUpdate={handleUpdateHopCap}
          onAdvanceCycle={handleAdvanceCycle}
          onGoToCrewTab={() => setActiveSubTab('crew')}
        />
      )}

      {activeSubTab === 'crew' && (
        <HopCrewTab state={hopCap} onUpdateState={handleUpdateHopCap} />
      )}

      {activeSubTab === 'storage' && (
        <HopStorageBins state={hopCap} onUpdateState={handleUpdateHopCap} />
      )}
    </div>
  );
};
