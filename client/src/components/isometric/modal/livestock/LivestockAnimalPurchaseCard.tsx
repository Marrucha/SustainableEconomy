import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from '../industrySupplyConfig';
import { generateRandomEnglishName } from '../englishNames';
import type { HorseAnimal, LivestockCapitalismState } from './livestockTypes';

interface LivestockAnimalPurchaseCardProps {
  currentBuildingId?: string;
  state: LivestockCapitalismState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  notify: (msg: string) => void;
}

type AnimalChoice =
  | 'cow'
  | 'bull'
  | 'sheep'
  | 'ram'
  | 'mare'
  | 'stallion'
  | 'hen'
  | 'rooster';

const ANIMAL_META: Record<
  AnimalChoice,
  { label: string; icon: string; shipPrice: number; farmPrice: number }
> = {
  cow: { label: 'Krowa mleczna / rozrodowa', icon: '🐄', shipPrice: 45, farmPrice: 38 },
  bull: { label: 'Buhaj rozpłodowy', icon: '🐂', shipPrice: 65, farmPrice: 55 },
  sheep: { label: 'Owca dorosła (maciorka)', icon: '🐑', shipPrice: 12, farmPrice: 10 },
  ram: { label: 'Baran rozpłodowy', icon: '🐏', shipPrice: 22, farmPrice: 18 },
  mare: { label: 'Klacz rozrodowa', icon: '🐎', shipPrice: 85, farmPrice: 72 },
  stallion: { label: 'Ogier rozpłodowy', icon: '🐎', shipPrice: 95, farmPrice: 80 },
  hen: { label: 'Kura nioska', icon: '🐔', shipPrice: 3, farmPrice: 2 },
  rooster: { label: 'Kogut rozpłodowy', icon: '🐓', shipPrice: 5, farmPrice: 4 },
};

export const LivestockAnimalPurchaseCard: React.FC<LivestockAnimalPurchaseCardProps> = ({
  currentBuildingId,
  state,
  allWorldBuildings,
  buildingsState,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
  notify,
}) => {
  const defaultChoice: AnimalChoice =
    state.activeSpecies === 'sheep'
      ? 'sheep'
      : state.activeSpecies === 'horses'
      ? 'mare'
      : state.activeSpecies === 'poultry'
      ? 'hen'
      : 'cow';
  const [animalChoice, setAnimalChoice] = useState<AnimalChoice>(defaultChoice);
  const [sourceId, setSourceId] = useState<string>('trade_ship_init');
  const [qty, setQty] = useState<number>(1);

  const shipBuilding: WorldSupplierBuilding = allWorldBuildings.find(
    (b) => b.typeId === 'trade_ship'
  ) || {
    id: 'trade_ship_init',
    typeId: 'trade_ship',
    name: 'Statek Handlowy (Port Londyn)',
    x: 1,
    y: 0,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 0,
    mapType: 'city',
  };

  const otherFarms = allWorldBuildings.filter(
    (b) => b.typeId === 'livestock_farm' && b.id !== currentBuildingId
  );

  const getFarmAvailableCount = (farmId: string): number => {
    const ls = buildingsState[farmId]?.livestockState;
    if (!ls) return 0;
    if (animalChoice === 'cow' || animalChoice === 'bull') return ls.herd.cattleForSale ?? 0;
    if (animalChoice === 'sheep' || animalChoice === 'ram') return ls.herd.sheepForSale ?? 0;
    if (animalChoice === 'hen' || animalChoice === 'rooster') return ls.herd.poultryForSale ?? 0;
    const saleHorses = (ls.herd.horses || []).filter(
      (h) =>
        !h.isDeceased &&
        h.group === 'sale' &&
        (h.sex ?? 'female') === (animalChoice === 'stallion' ? 'male' : 'female')
    );
    return saleHorses.length;
  };

  const isShip = sourceId === shipBuilding.id || sourceId.startsWith('trade_ship');
  const effectiveSourceId =
    isShip || otherFarms.some((f) => f.id === sourceId) ? sourceId : shipBuilding.id;
  const maxAvailable = isShip ? 50 : getFarmAvailableCount(effectiveSourceId);
  const effectiveQty = Math.max(1, Math.min(qty, Math.max(1, maxAvailable)));
  const unitPrice = isShip
    ? ANIMAL_META[animalChoice].shipPrice
    : ANIMAL_META[animalChoice].farmPrice;
  const totalCost = unitPrice * effectiveQty;

  const handleBuy = () => {
    if (!isShip && maxAvailable < effectiveQty) {
      notify('⚠️ Wybrana ferma nie ma tylu sztuk na sprzedaż.');
      return;
    }

    if (onSpendGold) onSpendGold(totalCost);

    // Jeśli kupujemy od innej fermy, odejmij jej sztuki z grupy "na sprzedaż"
    if (!isShip && onUpdateAnyBuildingState) {
      const sellerLs = buildingsState[effectiveSourceId]?.livestockState;
      if (sellerLs) {
        if (animalChoice === 'cow' || animalChoice === 'bull') {
          onUpdateAnyBuildingState(effectiveSourceId, {
            livestockState: {
              ...sellerLs,
              herd: {
                ...sellerLs.herd,
                cattleForSale: Math.max(0, (sellerLs.herd.cattleForSale ?? 0) - effectiveQty),
              },
            },
          });
        } else if (animalChoice === 'sheep' || animalChoice === 'ram') {
          const nextSale = Math.max(0, (sellerLs.herd.sheepForSale ?? 0) - effectiveQty);
          onUpdateAnyBuildingState(effectiveSourceId, {
            livestockState: {
              ...sellerLs,
              herd: {
                ...sellerLs.herd,
                sheepForSale: nextSale,
                sheepFlockCount:
                  (sellerLs.herd.adultSheepCount || 0) +
                  (sellerLs.herd.growingLambsCount || 0) +
                  nextSale,
              },
            },
          });
        } else if (animalChoice === 'hen' || animalChoice === 'rooster') {
          const nextSale = Math.max(0, (sellerLs.herd.poultryForSale ?? 0) - effectiveQty);
          onUpdateAnyBuildingState(effectiveSourceId, {
            livestockState: {
              ...sellerLs,
              herd: {
                ...sellerLs.herd,
                poultryForSale: nextSale,
                poultryFlockCount:
                  (sellerLs.herd.adultHensCount || 0) +
                  (sellerLs.herd.growingChicksCount || 0) +
                  nextSale,
              },
            },
          });
        } else {
          const targetSex = animalChoice === 'stallion' ? 'male' : 'female';
          let removed = 0;
          const remaining = (sellerLs.herd.horses || []).filter((h) => {
            if (
              removed < effectiveQty &&
              !h.isDeceased &&
              h.group === 'sale' &&
              (h.sex ?? 'female') === targetSex
            ) {
              removed += 1;
              return false;
            }
            return true;
          });
          onUpdateAnyBuildingState(effectiveSourceId, {
            livestockState: {
              ...sellerLs,
              herd: {
                ...sellerLs.herd,
                horses: remaining,
                horsesForSale: remaining.filter((h) => h.group === 'sale' && !h.isDeceased).length,
                horsesFlockCount: remaining.filter((h) => !h.isDeceased).length,
              },
            },
          });
        }
      }
    }

    // Dodaj kupione zwierzęta do bieżącej fermy
    if (animalChoice === 'cow') {
      onUpdateState({
        activeSpecies: 'cattle',
        herd: {
          ...state.herd,
          milkingGroupCows: (state.herd.milkingGroupCows || 0) + effectiveQty,
        },
      });
    } else if (animalChoice === 'bull') {
      onUpdateState({
        activeSpecies: 'cattle',
        herd: {
          ...state.herd,
          bullsCount: (state.herd.bullsCount || 0) + effectiveQty,
        },
      });
    } else if (animalChoice === 'sheep') {
      const nextAdult = (state.herd.adultSheepCount || 0) + effectiveQty;
      onUpdateState({
        activeSpecies: 'sheep',
        herd: {
          ...state.herd,
          adultSheepCount: nextAdult,
          sheepFlockCount:
            nextAdult + (state.herd.growingLambsCount || 0) + (state.herd.sheepForSale || 0),
        },
      });
    } else if (animalChoice === 'ram') {
      const nextRams = (state.herd.ramsCount || 0) + effectiveQty;
      onUpdateState({
        activeSpecies: 'sheep',
        herd: {
          ...state.herd,
          ramsCount: nextRams,
          sheepFlockCount:
            (state.herd.adultSheepCount || 0) +
            nextRams +
            (state.herd.growingLambsCount || 0) +
            (state.herd.sheepForSale || 0),
        },
      });
    } else if (animalChoice === 'hen') {
      const nextHens = (state.herd.adultHensCount || 0) + effectiveQty;
      onUpdateState({
        activeSpecies: 'poultry',
        herd: {
          ...state.herd,
          adultHensCount: nextHens,
          poultryFlockCount:
            nextHens +
            (state.herd.roostersCount || 0) +
            (state.herd.growingChicksCount || 0) +
            (state.herd.poultryForSale || 0),
        },
      });
    } else if (animalChoice === 'rooster') {
      const nextRoosters = (state.herd.roostersCount || 0) + effectiveQty;
      onUpdateState({
        activeSpecies: 'poultry',
        herd: {
          ...state.herd,
          roostersCount: nextRoosters,
          poultryFlockCount:
            (state.herd.adultHensCount || 0) +
            nextRoosters +
            (state.herd.growingChicksCount || 0) +
            (state.herd.poultryForSale || 0),
        },
      });
    } else {
      const sex: 'female' | 'male' = animalChoice === 'stallion' ? 'male' : 'female';
      const newHorses: HorseAnimal[] = Array.from({ length: effectiveQty }).map((_, i) => ({
        id: `horse_buy_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        name: generateRandomEnglishName(),
        sex,
        ageYears: 3.5,
        ageMonths: 42,
        vitalityPercent: 100,
        group: 'breeding',
        breedingStatus: 'waiting',
        breedingWaitMonths: 0,
        postGrowthTarget: 'breeding',
      }));
      const nextHorses = [...(state.herd.horses || []), ...newHorses];
      onUpdateState({
        activeSpecies: 'horses',
        herd: {
          ...state.herd,
          horses: nextHorses,
          adultDraftHorses: nextHorses.filter((h) => h.group === 'breeding' && !h.isDeceased).length,
          growingFoalsCount: nextHorses.filter((h) => h.group === 'growth' && !h.isDeceased).length,
          horsesForSale: nextHorses.filter((h) => h.group === 'sale' && !h.isDeceased).length,
          horsesFlockCount: nextHorses.filter((h) => !h.isDeceased).length,
        },
      });
    }

    notify(
      `✓ Kupiono jednorazowo: ${effectiveQty}× ${ANIMAL_META[animalChoice].label} za £${totalCost}!`
    );
  };

  return (
    <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚢</span>
          <div>
            <h4 className="text-xs font-bold text-sky-200">
              Zakup jednorazowy zwierząt (z innej fermy lub ze Statku)
            </h4>
            <p className="text-[10px] font-mono text-stone-400">
              Natychmiastowe powiększenie stada bez stałego kontraktu
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-[10px] text-stone-400 block mb-1">Zwierzę</label>
          <select
            value={animalChoice}
            onChange={(e) => setAnimalChoice(e.target.value as AnimalChoice)}
            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-white font-bold cursor-pointer"
          >
            {(Object.keys(ANIMAL_META) as AnimalChoice[]).map((k) => (
              <option key={k} value={k}>
                {ANIMAL_META[k].icon} {ANIMAL_META[k].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-stone-400 block mb-1">Źródło zakupu</label>
          <select
            value={effectiveSourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
          >
            <option value={shipBuilding.id}>
              🚢 Statek Handlowy (£{ANIMAL_META[animalChoice].shipPrice}/szt.)
            </option>
            {otherFarms.map((f) => {
              const avail = getFarmAvailableCount(f.id);
              return (
                <option key={f.id} value={f.id} disabled={avail <= 0}>
                  🐄 {formatSupplierOrderLabel(f, buildingsState, allWorldBuildings)} (dostępne:{' '}
                  {avail} szt. • £{ANIMAL_META[animalChoice].farmPrice}/szt.)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-stone-400 block mb-1">Ilość (szt.)</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span className="flex-1 text-center font-mono font-bold text-amber-300 bg-stone-950 border border-stone-800 rounded py-1">
              {effectiveQty} szt.
            </span>
            <button
              type="button"
              onClick={() => setQty((v) => Math.min(Math.max(1, maxAvailable), v + 1))}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!isShip && maxAvailable <= 0}
        onClick={handleBuy}
        className="w-full py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors"
      >
        ✓ Kup teraz ({effectiveQty} szt. • £{totalCost})
      </button>
    </div>
  );
};
