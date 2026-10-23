import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type {
  OrchardCapitalismState,
  OrchardCycleStage,
} from './orchardTypes';
import {
  createDefaultOrchardState,
  FRUITS_CONFIG,
} from './orchardTypes';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { OrchardCycleSnake } from './OrchardCycleSnake';
import { OrchardCrewTab } from './OrchardCrewTab';
import { OrchardStorageBins } from './OrchardStorageBins';
import { OrchardProfileSelector } from './OrchardProfileSelector';
import { OrchardProgressBar } from './OrchardProgressBar';
import { ORCHARD_FRUIT_VEGETATION } from './orchardProgressMath';
import type { UseGameClockReturn } from '../../clock/useGameClock';

interface OrchardSectionProps {
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
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

export const OrchardSection: React.FC<OrchardSectionProps> = ({
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
        businessTitle="Sad Owocowy"
        energySource={buildingState.businessEnergySource || 'drewno'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  const rawState = buildingState.orchardState;
  const orchardState: OrchardCapitalismState =
    rawState && Array.isArray(rawState.crew) && rawState.pomologist && rawState.stageAssignments
      ? rawState
      : createDefaultOrchardState();

  const handleUpdateOrchard = (patch: Partial<OrchardCapitalismState>) => {
    const nextState: OrchardCapitalismState = {
      ...orchardState,
      ...patch,
    };
    onUpdateState({
      orchardState: nextState,
      ...(patch.fruitType ? { fruitType: patch.fruitType } : {}),
      ...(patch.isFruitLocked !== undefined ? { orchardFruitLocked: patch.isFruitLocked } : {}),
    });
  };

  // 1. SAD NIEURUCHOMIONY: JEDNORAZOWY WYBÓR PROFILU
  if (!orchardState.isFruitLocked) {
    return (
      <OrchardProfileSelector
        onSelectFruit={(fruitType) => {
          handleUpdateOrchard({
            fruitType,
            isFruitLocked: true,
          });
        }}
      />
    );
  }

  const activeFruitKey = orchardState.fruitType || 'jablko';
  const fruitInfo = FRUITS_CONFIG[activeFruitKey] || FRUITS_CONFIG.jablko;
  const vegCfg = ORCHARD_FRUIT_VEGETATION[activeFruitKey] || ORCHARD_FRUIT_VEGETATION.jablko;

  const handleAdvanceCycle = () => {
    const curIdx = ORCHARD_FLOW.indexOf(orchardState.currentStage);
    const nextIdx = (curIdx + 1) % ORCHARD_FLOW.length;
    const nextStage = ORCHARD_FLOW[nextIdx];
    const isCompletedCycle = nextIdx === 0;

    const fruit = FRUITS_CONFIG[orchardState.fruitType || 'jablko'] || FRUITS_CONFIG.jablko;
    const pomBonus = orchardState.pomologist.hired ? 1 + orchardState.pomologist.yieldBonusPercent / 100 : 1.0;
    const trimBonus = orchardState.enableTreeTrimmingBonus ? 1.15 : 1.0;
    const totalYield = Math.round(fruit.baseYield * pomBonus * trimBonus);

    const laborCost = orchardState.crew.reduce((acc, w) => acc + w.wageDaily, 0) * 10;
    const pomCost = orchardState.pomologist.hired ? orchardState.pomologist.wageDaily * 10 : 0;
    const cycleCost = Math.round(laborCost + pomCost);

    const rev = orchardState.fruitDestination === 'sell_market' ? Math.round((totalYield / 1000) * fruit.marketPricePerTon) : 0;

    const updatedFruitStock = isCompletedCycle && orchardState.fruitDestination === 'store_crates'
      ? {
          ...orchardState.fruitStockKg,
          [activeFruitKey]: (orchardState.fruitStockKg[activeFruitKey] || 0) + totalYield,
        }
      : orchardState.fruitStockKg;

    const updatedCider = isCompletedCycle && orchardState.fruitDestination === 'press_cider'
      ? (orchardState.ciderStockL || 0) + Math.round((totalYield / 100) * fruit.ciderYieldLitersPer100Kg)
      : (orchardState.ciderStockL || 280);

    const updatedWood = isCompletedCycle
      ? (orchardState.prunedWoodKg || 0) + 95
      : (orchardState.prunedWoodKg || 190);

    handleUpdateOrchard({
      currentStage: nextStage,
      stageProgress: Math.min(100, Math.round(((nextIdx + 1) / ORCHARD_FLOW.length) * 100)),
      totalCyclesCompleted: isCompletedCycle ? orchardState.totalCyclesCompleted + 1 : orchardState.totalCyclesCompleted,
      fruitStockKg: updatedFruitStock,
      ciderStockL: updatedCider,
      prunedWoodKg: updatedWood,
      lastCycleYieldKg: isCompletedCycle ? totalYield : orchardState.lastCycleYieldKg,
      lastCycleRevenue: isCompletedCycle ? rev : orchardState.lastCycleRevenue,
      lastCycleCost: isCompletedCycle ? cycleCost : orchardState.lastCycleCost,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* NAGŁÓWEK DOŻYWOTNIEGO PROFILU (INNE GATUNKI USUNIĘTE Z OKNA) */}
      <div className="p-3.5 bg-stone-950/90 rounded-2xl border border-stone-800 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 rounded-xl border border-stone-700 shadow-inner flex items-center justify-center text-3xl">
            {fruitInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🔒 Profil Dożywotni: {fruitInfo.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Zbiory: {vegCfg.harvestMonthName}
              </span>
            </div>
            <h3 className="text-base font-bold text-amber-100 mt-0.5">{fruitInfo.name}</h3>
            <p className="text-xs text-stone-400 max-w-xl">{fruitInfo.desc}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block font-mono">Cena rynkowa:</span>
          <span className="text-lg font-bold text-amber-300 font-mono">£ {fruitInfo.marketPricePerTon} / t</span>
        </div>
      </div>

      {/* PASEK POSTĘPU SADU (SPÓJNY Z WIDOKIEM WIEJSKIM) */}
      <OrchardProgressBar
        fruitType={activeFruitKey}
        clock={clock}
      />

      {/* GŁÓWNY PRZEŁĄCZNIK ZAKŁADEK SADOWNICTWA */}
      <div className="flex bg-stone-950/80 p-1 rounded-2xl border border-stone-800 text-xs gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveSubTab('snake')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'snake'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">{fruitInfo.icon}</span>
          <span>Wąż Cyklu Sadowniczego (7 Etapów)</span>
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
          <span>Załoga i Pomolog (System 2w1)</span>
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
          <span>Spichlerz, Chłodnia i Tłocznia</span>
        </button>
      </div>

      {/* 1. WIDOK: WĄŻ CYKLU PRODUKCJI SADU */}
      {activeSubTab === 'snake' && (
        <OrchardCycleSnake
          state={orchardState}
          clock={clock}
          onAdvanceCycle={handleAdvanceCycle}
          onGoToCrewTab={() => setActiveSubTab('crew')}
        />
      )}

      {/* 2. WIDOK: ZAŁOGA I POMOLOG */}
      {activeSubTab === 'crew' && (
        <OrchardCrewTab
          state={orchardState}
          onUpdateState={handleUpdateOrchard}
        />
      )}

      {/* 3. WIDOK: SPICHLERZ OWOCÓW, TŁOCZNIA I DREWNO */}
      {activeSubTab === 'storage' && (
        <OrchardStorageBins
          state={orchardState}
          onUpdateState={handleUpdateOrchard}
        />
      )}
    </div>
  );
};

