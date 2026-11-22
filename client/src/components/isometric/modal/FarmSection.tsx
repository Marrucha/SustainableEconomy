import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import type { FarmCapitalismState } from './farmGridTypes';
import { createDefaultFarmCapitalismState } from './farmGridTypes';
import { BusinessEnergySection } from './BusinessEnergySection';
import { FarmCycleSnake } from './FarmCycleSnake';
import { FarmCrewTab } from './FarmCrewTab';
import type { UseGameClockReturn } from '../clock/useGameClock';
import { resolveUniqueFarmName, type WorldSupplierBuilding } from './industrySupplyConfig';

interface FarmSectionProps {
  building?: PlacedBuilding;
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  attachedFieldsCount?: number;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onRenameBuilding?: (buildingId: string, newName: string) => void;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const FarmSection: React.FC<FarmSectionProps> = ({
  building,
  buildingState,
  businessTab,
  hasGreenRelief,
  attachedFieldsCount = 0,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateAnyBuildingState,
  onRenameBuilding,
  clock,
  onUpdateState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'snake' | 'crew' | 'energy'>('snake');
  const hasEnergy = (buildingState.ownedHorses?.length ?? 0) >= 1;

  const rawCap = buildingState.farmCapitalism;
  const farmCap: FarmCapitalismState =
    rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
      ? rawCap
      : createDefaultFarmCapitalismState();

  const handleUpdateFarmCap = (updates: Partial<FarmCapitalismState>) => {
    if (updates.crew && building && onRenameBuilding) {
      const hadFarmer = (farmCap.crew || []).some(
        (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
      );
      const firstFarmer = updates.crew.find(
        (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
      );
      if (!hadFarmer && firstFarmer) {
        const uniqueName = resolveUniqueFarmName('Farma zbożowa', firstFarmer.name, allWorldBuildings, building.id);
        onRenameBuilding(building.id, uniqueName);
      }
    }
    const nextState: FarmCapitalismState = {
      ...farmCap,
      ...updates,
    };
    onUpdateState({
      farmCapitalism: nextState,
      ...(updates.cropType ? { cropType: updates.cropType } : {}),
    });
  };

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        buildingId={building?.id}
        businessTitle="Farma Zbożowa"
        energySource="konie"
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        allowedSources={['konie']}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        onSpendGold={onSpendGold}
        onUpdateAnyBuildingState={onUpdateAnyBuildingState}
        onUpdateState={onUpdateState}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {/* GŁÓWNY PRZEŁĄCZNIK ZAKŁADEK ROLNICTWA */}
      <div className="flex bg-stone-950/80 p-0.5 rounded-xl border border-stone-800 text-xs gap-1 shadow-inner">
        <button
          onClick={() => setActiveSubTab('snake')}
          className={`flex-1 py-1 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'snake'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">🐍</span>
          <span>Wąż Cyklu Produkcji (8 Etapów)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crew')}
          className={`flex-1 py-1 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'crew'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">👥</span>
          <span>Załoga i Agronom (System 2w1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('energy')}
          className={`flex-1 py-1 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'energy'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">⚡</span>
          <span>Zakup Energii</span>
          {hasEnergy && (
            <span
              className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm"
              title="Energia (konie robocze) zapewniona"
            >
              ✓
            </span>
          )}
        </button>
      </div>

      {/* 1. WIDOK: POWIĘKSZONY WĄŻ CYKLU PRODUKCJI */}
      {activeSubTab === 'snake' && (
        <FarmCycleSnake
          state={farmCap}
          attachedFieldsCount={attachedFieldsCount}
          ownedHorsesCount={(buildingState.ownedHorses || []).filter((h) => !h.isDeceased).length}
          ownedHorses={buildingState.ownedHorses}
          clock={clock}
          onUpdate={handleUpdateFarmCap}
        />
      )}

      {/* 2. WIDOK: ZAŁOGA I AGRONOM */}
      {activeSubTab === 'crew' && (
        <FarmCrewTab
          state={farmCap}
          onUpdateState={handleUpdateFarmCap}
        />
      )}

      {/* 3. WIDOK: ZAKUP ENERGII */}
      {activeSubTab === 'energy' && (
        <BusinessEnergySection
          businessTitle={building?.name || 'Farma Zbożowa'}
          energySource="konie"
          energyScale={buildingState.businessEnergyScale || 'standard'}
          hasGreenRelief={hasGreenRelief}
          allowedSources={['konie']}
          buildingState={buildingState}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateAnyBuildingState={onUpdateAnyBuildingState}
          onUpdateState={onUpdateState}
        />
      )}
    </div>
  );
};
