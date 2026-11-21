import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { BusinessEnergySection } from '../BusinessEnergySection';
import type { WorldSupplierBuilding } from '../industrySupplyConfig';
import { MillCrewTab } from './MillCrewTab';
import { MillCycleSnake } from './MillCycleSnake';
import { createDefaultMillState, type MillCapitalismState } from './millTypes';

interface MillSectionProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
}

export const MillSection: React.FC<MillSectionProps> = ({
  building,
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  businessTab,
  hasGreenRelief,
  onSpendGold,
  onUpdateState,
  onUpdateAnyBuildingState,
}) => {
  const [subTab, setSubTab] = useState<'snake' | 'crew' | 'energy'>('snake');
  const isEnergySatisfied =
    (buildingState.businessEnergySource === 'konie' &&
      (buildingState.ownedHorses?.length ?? 0) >= 1) ||
    (buildingState.businessEnergySource === 'wegiel' &&
      (buildingState.coalStockTons ?? 0) > 0);

  const rawMill = buildingState.millState;
  const millState: MillCapitalismState =
    rawMill && Array.isArray(rawMill.crew) && rawMill.stageAssignments
      ? rawMill
      : createDefaultMillState();

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={building.name || 'Młyn Parowy'}
        energySource={buildingState.businessEnergySource}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        allowedSources={['konie', 'wegiel']}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        onSpendGold={onSpendGold}
        onUpdateAnyBuildingState={onUpdateAnyBuildingState}
        onUpdateState={onUpdateState}
      />
    );
  }

  const handleUpdateMill = (updates: Partial<MillCapitalismState>) => {
    onUpdateState({
      millState: {
        ...millState,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Podzakładki widoku produkcyjnego */}
      <div className="flex flex-wrap items-center gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'snake', label: '⚙️ Cykl Przemiału' },
          { id: 'crew', label: `👥 Załoga (${millState.crew.length})` },
          { id: 'energy', label: '⚡ Zakup Energii', check: isEnergySatisfied },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id as 'snake' | 'crew' | 'energy')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              subTab === tab.id
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.check && (
              <span
                className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm"
                title="Energia do produkcji zapewniona"
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'snake' && (
        <MillCycleSnake
          state={millState}
          buildingState={buildingState}
          sizeTiles={building.sizeX * building.sizeY}
          onUpdate={handleUpdateMill}
        />
      )}

      {subTab === 'crew' && (
        <MillCrewTab
          state={millState}
          buildingName={building.name || 'Młyn Parowy'}
          onUpdate={handleUpdateMill}
        />
      )}

      {subTab === 'energy' && (
        <BusinessEnergySection
          businessTitle={building.name || 'Młyn Parowy'}
          energySource={buildingState.businessEnergySource}
          energyScale={buildingState.businessEnergyScale || 'standard'}
          hasGreenRelief={hasGreenRelief}
          allowedSources={['konie', 'wegiel']}
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
