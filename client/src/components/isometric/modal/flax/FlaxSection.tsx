import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { FlaxCapitalismState, FlaxCycleStage } from './flaxTypes';
import { createDefaultFlaxState } from './flaxTypes';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { FlaxCycleSnake } from './FlaxCycleSnake';
import { FlaxCrewTab } from './FlaxCrewTab';
import { FlaxStorageBins } from './FlaxStorageBins';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface FlaxSectionProps {
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const CYCLE_STAGES_FLOW: FlaxCycleStage[] = [
  'seed_intake',
  'plowing',
  'sowing',
  'fertilizing',
  'weeding',
  'growing',
  'harvesting',
  'processing_selling',
];

export const FlaxSection: React.FC<FlaxSectionProps> = ({
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
        businessTitle="Plantacja Lnu"
        energySource={buildingState.businessEnergySource || 'drewno'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  const rawCap = buildingState.flaxState;
  const flaxCap: FlaxCapitalismState =
    rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
      ? rawCap
      : createDefaultFlaxState();

  const handleUpdateFlaxCap = (updates: Partial<FlaxCapitalismState>) => {
    const nextState: FlaxCapitalismState = {
      ...flaxCap,
      ...updates,
    };
    onUpdateState({
      flaxState: nextState,
    });
  };

  const handleAdvanceCycle = () => {
    const curIdx = CYCLE_STAGES_FLOW.indexOf(flaxCap.currentStage);
    let nextIdx = (curIdx + 1) % CYCLE_STAGES_FLOW.length;

    if (CYCLE_STAGES_FLOW[nextIdx] === 'fertilizing' && !flaxCap.enableFertilizing) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }
    if (CYCLE_STAGES_FLOW[nextIdx] === 'weeding' && !flaxCap.enableWeeding) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }

    const nextStage = CYCLE_STAGES_FLOW[nextIdx];
    const isCompletedCycle = nextIdx === 0;

    const baseFiber = flaxCap.variety === 'wloknisty' ? 480 : 240;
    const baseLinseed = flaxCap.variety === 'wloknisty' ? 220 : 560;
    const bonusFert = flaxCap.enableFertilizing ? 220 : 0;
    const bonusWeed = flaxCap.enableWeeding ? 160 : 0;
    const agroMul = flaxCap.agronomist.hired ? 1 + flaxCap.agronomist.yieldBonusPercent / 100 : 1.0;

    const totalFiber = Math.round((baseFiber + bonusFert + bonusWeed) * agroMul);
    const totalLinseed = Math.round(baseLinseed * agroMul);

    const seedCost = flaxCap.seedSource === 'market' ? 22 : 0;
    const fertCost = flaxCap.enableFertilizing ? 14 : 0;
    const weedCost = flaxCap.enableWeeding ? 9 : 0;
    const laborCost = flaxCap.crew.reduce((acc, w) => acc + w.wageDaily, 0);
    const agroCost = flaxCap.agronomist.hired ? flaxCap.agronomist.wageDaily : 0;
    const cost = seedCost + fertCost + weedCost + laborCost + agroCost;

    const priceFiber = flaxCap.variety === 'wloknisty' ? 180 : 120;
    const priceLinseed = flaxCap.variety === 'wloknisty' ? 110 : 135;
    const rev = flaxCap.productDestination === 'sell_market'
      ? Math.round((totalFiber / 1000) * priceFiber + (totalLinseed / 1000) * priceLinseed)
      : 0;

    const updatedFiber = isCompletedCycle && flaxCap.productDestination === 'store_silo'
      ? (flaxCap.fiberStockKg || 0) + totalFiber
      : flaxCap.fiberStockKg;
    const updatedLinseed = isCompletedCycle && flaxCap.productDestination === 'store_silo'
      ? (flaxCap.linseedStockKg || 0) + totalLinseed
      : flaxCap.linseedStockKg;
    const updatedTow = isCompletedCycle
      ? (flaxCap.towStockKg || 0) + Math.round(totalFiber * 0.45)
      : flaxCap.towStockKg;

    handleUpdateFlaxCap({
      currentStage: nextStage,
      stageProgress: Math.min(100, Math.round(((nextIdx + 1) / CYCLE_STAGES_FLOW.length) * 100)),
      totalCyclesCompleted: isCompletedCycle ? flaxCap.totalCyclesCompleted + 1 : flaxCap.totalCyclesCompleted,
      fiberStockKg: updatedFiber,
      linseedStockKg: updatedLinseed,
      towStockKg: updatedTow,
      lastCycleFiberKg: isCompletedCycle ? totalFiber : flaxCap.lastCycleFiberKg,
      lastCycleLinseedKg: isCompletedCycle ? totalLinseed : flaxCap.lastCycleLinseedKg,
      lastCycleRevenue: isCompletedCycle ? rev : flaxCap.lastCycleRevenue,
      lastCycleCost: isCompletedCycle ? cost : flaxCap.lastCycleCost,
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
          <span>Wąż Cyklu Lnu (8 Etapów)</span>
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
          <span className="text-base">🧵</span>
          <span>Spichlerz i Magazyn (Przegródki)</span>
        </button>
      </div>

      {/* 1. WIDOK: WĄŻ CYKLU */}
      {activeSubTab === 'snake' && (
        <FlaxCycleSnake
          state={flaxCap}
          clock={clock}
          onUpdate={handleUpdateFlaxCap}
          onAdvanceCycle={handleAdvanceCycle}
          onGoToCrewTab={() => setActiveSubTab('crew')}
        />
      )}

      {/* 2. WIDOK: ZAŁOGA */}
      {activeSubTab === 'crew' && (
        <FlaxCrewTab
          state={flaxCap}
          onUpdateState={handleUpdateFlaxCap}
        />
      )}

      {/* 3. WIDOK: MAGAZYN */}
      {activeSubTab === 'storage' && (
        <FlaxStorageBins
          state={flaxCap}
          onUpdateState={handleUpdateFlaxCap}
        />
      )}
    </div>
  );
};
