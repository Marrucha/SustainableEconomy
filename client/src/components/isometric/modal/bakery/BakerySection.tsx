import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { BusinessEnergySection } from '../BusinessEnergySection';
import type { WorldSupplierBuilding } from '../industrySupplyConfig';
import { BakeryCrewTab } from './BakeryCrewTab';
import { BakeryCycleSnake } from './BakeryCycleSnake';
import { createDefaultBakeryState, type BakeryCapitalismState } from './bakeryTypes';

interface BakerySectionProps {
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

export const BakerySection: React.FC<BakerySectionProps> = ({
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
    (buildingState.businessEnergySource === 'wegiel' &&
      (buildingState.coalStockTons ?? 0) > 0) ||
    (buildingState.businessEnergySource === 'wegiel_drzewny' &&
      (buildingState.charcoalStockTons ?? 0) > 0);

  const rawBakery = buildingState.bakeryState;
  const bakeryState: BakeryCapitalismState =
    rawBakery && Array.isArray(rawBakery.crew) && rawBakery.stageAssignments
      ? rawBakery
      : createDefaultBakeryState();

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={building.name || 'Piekarnia Rzemieślnicza'}
        energySource={buildingState.businessEnergySource}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        allowedSources={['wegiel', 'wegiel_drzewny']}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        onSpendGold={onSpendGold}
        onUpdateAnyBuildingState={onUpdateAnyBuildingState}
        onUpdateState={onUpdateState}
      />
    );
  }

  const handleUpdateBakery = (updates: Partial<BakeryCapitalismState>) => {
    onUpdateState({
      bakeryState: {
        ...bakeryState,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Podzakładki widoku produkcyjnego */}
      <div className="flex flex-wrap items-center gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'snake', label: '🥐 Cykl Wypieku' },
          { id: 'crew', label: `👥 Załoga (${bakeryState.crew.length})` },
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
                title="Energia do wypieku zapewniona"
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'snake' && (
        <BakeryCycleSnake
          state={bakeryState}
          buildingState={buildingState}
          sizeTiles={building.sizeX * building.sizeY}
          onUpdate={handleUpdateBakery}
        />
      )}

      {subTab === 'crew' && (
        <BakeryCrewTab
          state={bakeryState}
          buildingName={building.name || 'Piekarnia Rzemieślnicza'}
          onUpdate={handleUpdateBakery}
        />
      )}

      {subTab === 'energy' && (
        <BusinessEnergySection
          businessTitle={building.name || 'Piekarnia Rzemieślnicza'}
          energySource={buildingState.businessEnergySource}
          energyScale={buildingState.businessEnergyScale || 'standard'}
          hasGreenRelief={hasGreenRelief}
          allowedSources={['wegiel', 'wegiel_drzewny']}
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
