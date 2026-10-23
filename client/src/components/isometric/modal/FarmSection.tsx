import React, { useState } from 'react';
import type { BuildingState } from '../types';
import type { FarmCapitalismState, FarmCycleStage } from './farmGridTypes';
import { createDefaultFarmCapitalismState } from './farmGridTypes';
import { BusinessEnergySection } from './BusinessEnergySection';
import { FarmCycleSnake } from './FarmCycleSnake';
import { FarmCrewTab } from './FarmCrewTab';
import { FarmStorageBins } from './FarmStorageBins';
import type { UseGameClockReturn } from '../clock/useGameClock';

interface FarmSectionProps {
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const CYCLE_STAGES_FLOW: FarmCycleStage[] = [
  'seed_intake',
  'plowing',
  'sowing',
  'fertilizing',
  'weeding',
  'growing',
  'harvesting',
  'storing_selling',
];

export const FarmSection: React.FC<FarmSectionProps> = ({
  buildingState,
  businessTab,
  hasGreenRelief,
  clock,
  onUpdateState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'snake' | 'crew' | 'grain'>('snake');

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle="Farma Zbożowa"
        energySource={buildingState.businessEnergySource || 'drewno'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  const rawCap = buildingState.farmCapitalism;
  const farmCap: FarmCapitalismState =
    rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
      ? rawCap
      : createDefaultFarmCapitalismState();

  const handleUpdateFarmCap = (updates: Partial<FarmCapitalismState>) => {
    const nextState: FarmCapitalismState = {
      ...farmCap,
      ...updates,
    };
    onUpdateState({
      farmCapitalism: nextState,
      ...(updates.cropType ? { cropType: updates.cropType } : {}),
    });
  };

  const handleAdvanceCycle = () => {
    const curIdx = CYCLE_STAGES_FLOW.indexOf(farmCap.currentStage);
    let nextIdx = (curIdx + 1) % CYCLE_STAGES_FLOW.length;

    // Pomiń nawożenie lub pielenie, jeśli wyłączone
    if (CYCLE_STAGES_FLOW[nextIdx] === 'fertilizing' && !farmCap.enableFertilizing) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }
    if (CYCLE_STAGES_FLOW[nextIdx] === 'weeding' && !farmCap.enableWeeding) {
      nextIdx = (nextIdx + 1) % CYCLE_STAGES_FLOW.length;
    }

    const nextStage = CYCLE_STAGES_FLOW[nextIdx];
    const isCompletedCycle = nextIdx === 0;

    // Obliczenia plonu i bilansu
    const baseYield = 650;
    const bonusFert = farmCap.enableFertilizing ? 250 : 0;
    const bonusWeed = farmCap.enableWeeding ? 180 : 0;
    const agroMul = farmCap.agronomist.hired ? 1 + farmCap.agronomist.yieldBonusPercent / 100 : 1.0;
    const totalYield = Math.round((baseYield + bonusFert + bonusWeed) * agroMul);

    const seedCost = farmCap.seedSource === 'market' ? 22 : 0;
    const fertCost = farmCap.enableFertilizing ? 14 : 0;
    const sprayCost = farmCap.enableWeeding ? 9 : 0;
    const laborCost = farmCap.crew.reduce((acc, w) => acc + w.wageDaily, 0);
    const agroCost = farmCap.agronomist.hired ? farmCap.agronomist.wageDaily : 0;
    const cost = seedCost + fertCost + sprayCost + laborCost + agroCost;
    const rev = farmCap.wheatDestination === 'sell_market' ? Math.round((totalYield / 1000) * 110) : 0;

    const activeCrop = farmCap.cropType || 'pszenica';
    const updatedGrainStock = isCompletedCycle && farmCap.wheatDestination === 'store_silo'
      ? {
          ...(farmCap.grainStockKg || { pszenica: 450, zyto: 120, owies: 80, jeczmien: 0 }),
          [activeCrop]: ((farmCap.grainStockKg?.[activeCrop]) ?? 0) + totalYield,
        }
      : farmCap.grainStockKg;

    handleUpdateFarmCap({
      currentStage: nextStage,
      stageProgress: Math.min(100, Math.round(((nextIdx + 1) / CYCLE_STAGES_FLOW.length) * 100)),
      totalCyclesCompleted: isCompletedCycle ? farmCap.totalCyclesCompleted + 1 : farmCap.totalCyclesCompleted,
      grainStockKg: updatedGrainStock,
      strawStockKg: isCompletedCycle ? (farmCap.strawStockKg || 0) + Math.round(totalYield * 0.7) : (farmCap.strawStockKg || 600),
      wheatStockKg: isCompletedCycle
        ? farmCap.wheatDestination === 'store_silo'
          ? farmCap.wheatStockKg + totalYield
          : farmCap.wheatStockKg
        : farmCap.wheatStockKg,
      lastCycleYieldKg: isCompletedCycle ? totalYield : farmCap.lastCycleYieldKg,
      lastCycleRevenue: isCompletedCycle ? rev : farmCap.lastCycleRevenue,
      lastCycleCost: isCompletedCycle ? cost : farmCap.lastCycleCost,
    });
  };

  return (
    <div className="space-y-4">
      {/* GŁÓWNY PRZEŁĄCZNIK ZAKŁADEK ROLNICTWA */}
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
          <span>Wąż Cyklu Produkcji (8 Etapów)</span>
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
          <span>Załoga i Agronom (System 2w1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grain')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'grain'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🌾</span>
          <span>Spichlerz i Magazyn (Przegródki)</span>
        </button>
      </div>

      {/* 1. WIDOK: POWIĘKSZONY WĄŻ CYKLU PRODUKCJI */}
      {activeSubTab === 'snake' && (
        <FarmCycleSnake
          state={farmCap}
          clock={clock}
          onUpdate={handleUpdateFarmCap}
          onAdvanceCycle={handleAdvanceCycle}
          onGoToCrewTab={() => setActiveSubTab('crew')}
        />
      )}

      {/* 2. WIDOK: ZAŁOGA I AGRONOM */}
      {activeSubTab === 'crew' && (
        <FarmCrewTab
          state={farmCap}
          onUpdateState={handleUpdateFarmCap}
        />
      )}

      {/* 3. WIDOK: SPICHLERZ, GRAFICZNE PRZEGRÓDKI I ZAPASY (1880 r.) */}
      {activeSubTab === 'grain' && (
        <FarmStorageBins
          state={farmCap}
          onUpdateState={handleUpdateFarmCap}
        />
      )}
    </div>
  );
};
