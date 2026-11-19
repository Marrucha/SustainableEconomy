import React, { useEffect, useRef, useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import type { FarmCapitalismState } from './farmGridTypes';
import { createDefaultFarmCapitalismState, getManureBinCapacityKg } from './farmGridTypes';
import { getContractMeta } from './industryContracts';
import { BusinessEnergySection } from './BusinessEnergySection';
import { FarmCycleSnake } from './FarmCycleSnake';
import { FarmCrewTab } from './FarmCrewTab';
import { FarmStorageBins } from './FarmStorageBins';
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
  const [activeSubTab, setActiveSubTab] = useState<'snake' | 'crew' | 'grain'>('snake');

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
        const uniqueName = resolveUniqueFarmName('Farma', firstFarmer.name, allWorldBuildings, building.id);
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

  // Miesięczne dostawy zakontraktowanego obornika z wybranej fermy zwierzęcej
  const lastManureMonthRef = useRef<string>('');
  useEffect(() => {
    if (!clock || !farmCap.manureOrder) return;
    const mKey = `${clock.date.year}-${clock.date.month}`;
    if (!lastManureMonthRef.current) {
      lastManureMonthRef.current = mKey;
      return;
    }
    if (lastManureMonthRef.current === mKey) return;
    lastManureMonthRef.current = mKey;

    const order = farmCap.manureOrder;
    const supplierState = buildingsState[order.supplierId]?.livestockState;
    if (!supplierState) return;

    const capKg = getManureBinCapacityKg(farmCap.manureLevel ?? 1);
    const spaceLeft = Math.max(0, capKg - (farmCap.manureStockKg || 0));
    const avail = supplierState.storage?.manureKg ?? 0;
    const delivered = Math.min(order.monthlyQuantityKg, avail, spaceLeft);
    const meta = getContractMeta(order.contractType);
    const pricePer100 = farmCap.manurePricePer100Kg ?? 12;
    const cost = delivered > 0 ? Number(((delivered / 100) * pricePer100 * (1 - meta.discountPercent / 100)).toFixed(2)) : 0;

    if (delivered > 0) {
      if (cost > 0) onSpendGold?.(cost);
      onUpdateAnyBuildingState?.(order.supplierId, {
        livestockState: {
          ...supplierState,
          storage: {
            ...supplierState.storage,
            manureKg: Math.max(0, avail - delivered),
          },
          lastCycleRevenue: Number(((supplierState.lastCycleRevenue || 0) + cost).toFixed(2)),
        },
      });
    }

    const nextOrder =
      meta.durationMonths > 0
        ? order.monthsRemaining - 1 > 0
          ? { ...order, monthsRemaining: order.monthsRemaining - 1 }
          : undefined
        : order;

    if (delivered > 0 || nextOrder !== order) {
      handleUpdateFarmCap({
        manureStockKg: (farmCap.manureStockKg || 0) + delivered,
        manureOrder: nextOrder,
        lastCycleCost: Number(((farmCap.lastCycleCost || 0) + cost).toFixed(2)),
      });
    }
  }, [clock?.date.year, clock?.date.month]);

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
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
          onClick={() => setActiveSubTab('grain')}
          className={`flex-1 py-1 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'grain'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">🌾</span>
          <span>Spichlerz i Magazyn (Przegródki)</span>
        </button>
      </div>

      {/* 1. WIDOK: POWIĘKSZONY WĄŻ CYKLU PRODUKCJI */}
      {activeSubTab === 'snake' && (
        <FarmCycleSnake
          state={farmCap}
          attachedFieldsCount={attachedFieldsCount}
          ownedHorsesCount={buildingState.ownedHorses?.length ?? 0}
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

      {/* 3. WIDOK: SPICHLERZ, GRAFICZNE PRZEGRÓDKI I ZAPASY (1880 r.) */}
      {activeSubTab === 'grain' && (
        <FarmStorageBins
          currentBuildingId={building?.id}
          state={farmCap}
          attachedFieldsCount={attachedFieldsCount}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateAnyBuildingState={onUpdateAnyBuildingState}
          onUpdateState={handleUpdateFarmCap}
        />
      )}
    </div>
  );
};
