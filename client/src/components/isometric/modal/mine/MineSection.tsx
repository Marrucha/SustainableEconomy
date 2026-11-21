import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { resolveUniqueFarmName, type WorldSupplierBuilding } from '../industrySupplyConfig';
import {
  createDefaultMineCapitalismState,
  type MineCapitalismState,
} from './mineCapitalismTypes';
import { MineCrewTab } from './MineCrewTab';
import { MineCycleSnake } from './MineCycleSnake';
import { MineDepositSelector } from './MineDepositSelector';
import { MINE_DEPOSITS, type MineDepositType } from './mineTypes';

interface MineSectionProps {
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
  onRenameBuilding?: (buildingId: string, newName: string) => void;
}

export const MineSection: React.FC<MineSectionProps> = ({
  building,
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  businessTab,
  hasGreenRelief,
  onSpendGold,
  onUpdateState,
  onUpdateAnyBuildingState,
  onRenameBuilding,
}) => {
  const [subTab, setSubTab] = useState<'snake' | 'crew' | 'energy'>('snake');
  const currentDeposit = buildingState.mineDepositType;
  const isConfigured = Boolean(currentDeposit && MINE_DEPOSITS[currentDeposit]);

  const isEnergySatisfied =
    (buildingState.businessEnergySource === 'konie' &&
      (buildingState.ownedHorses?.length ?? 0) >= 1) ||
    (buildingState.businessEnergySource === 'wegiel' &&
      (buildingState.coalStockTons ?? 0) > 0);

  const rawMine = buildingState.mineCapitalism;
  const mineState: MineCapitalismState =
    rawMine && Array.isArray(rawMine.crew) && rawMine.stageAssignments
      ? rawMine
      : createDefaultMineCapitalismState(currentDeposit);

  const handleSelectDeposit = (newDeposit: MineDepositType) => {
    onUpdateState({
      mineDepositType: newDeposit,
      mineStock: 0,
      mineCapitalism: createDefaultMineCapitalismState(newDeposit),
    });
  };

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={
          isConfigured ? `${building.name} - ${MINE_DEPOSITS[currentDeposit!].name}` : building.name
        }
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

  // Jednorazowy wybór złoża dożywotniego
  if (!isConfigured) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="p-4 bg-amber-950/60 border border-amber-500/60 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛏️</span>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                Jednorazowe Uruchomienie Kopalni (Epoka 1880)
              </h3>
              <p className="text-xs text-stone-300">
                Wybierz poniżej surowiec do wydobycia.{' '}
                <strong className="text-amber-300 underline">
                  Uwaga: wybór jest ostateczny i dożywotni!
                </strong>{' '}
                Po wyborze kopalnia na stałe zwiąże się z tym złożem.
              </p>
            </div>
          </div>
        </div>

        <MineDepositSelector
          currentDeposit={'coal'}
          currentStock={0}
          onSelectDeposit={handleSelectDeposit}
        />
      </div>
    );
  }

  const depositInfo = MINE_DEPOSITS[currentDeposit!];
  const handleUpdateMine = (updates: Partial<MineCapitalismState>) => {
    let lockedNameUpdate: Partial<MineCapitalismState> = {};
    if (updates.crew && !mineState.firstManagerSurname) {
      const firstManager = updates.crew.find((w) => w.profession === 'manager');
      if (firstManager) {
        const uniqueName = resolveUniqueFarmName(
          'Kopalnia',
          firstManager.name,
          allWorldBuildings,
          building.id
        );
        lockedNameUpdate = { firstManagerSurname: uniqueName };
        if (onRenameBuilding) {
          onRenameBuilding(building.id, uniqueName);
        }
      }
    }
    onUpdateState({
      mineCapitalism: {
        ...mineState,
        ...updates,
        ...lockedNameUpdate,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Podzakładki widoku produkcyjnego */}
      <div className="flex flex-wrap items-center gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'snake', label: '⛏️ Cykl Wydobycia' },
          { id: 'crew', label: `👥 Załoga (${mineState.crew.length})` },
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
                title="Energia do wydobycia zapewniona"
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'snake' && (
        <MineCycleSnake
          state={mineState}
          buildingState={buildingState}
          depositInfo={depositInfo}
          sizeTiles={building.sizeX * building.sizeY}
          onUpdate={handleUpdateMine}
        />
      )}

      {subTab === 'crew' && (
        <MineCrewTab
          state={mineState}
          buildingName={building.name || 'Kopalnia'}
          onUpdate={handleUpdateMine}
        />
      )}

      {subTab === 'energy' && (
        <BusinessEnergySection
          businessTitle={`${building.name} - ${depositInfo.name}`}
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
