import React, { useState } from 'react';
import type { BuildingState } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import type { HorseAnimal } from './livestock/livestockTypes';
import { createDefaultLivestockState } from './livestock/livestockTypes';
import { createDefaultHorsesList } from './livestock/HorseRosterSection';
import { getDefaultHorsePriceForAge } from './LivestockFinanceSummary';

interface HorsePurchaseOfferPanelProps {
  ownedHorses: HorseAnimal[];
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const HorsePurchaseOfferPanel: React.FC<HorsePurchaseOfferPanelProps> = ({
  ownedHorses,
  allWorldBuildings,
  buildingsState,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const livestockFarms = allWorldBuildings.filter((b) => b.typeId === 'livestock_farm');
  // Domyślnie puste okno — gracz sam wybiera fermę z listy
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  const activeFarmId = livestockFarms.some((f) => f.id === selectedFarmId) ? selectedFarmId : '';

  const getHorsePrice = (ls: ReturnType<typeof createDefaultLivestockState>, ageYears: number): number => {
    const custom = ls.horsePricesByAge?.[ageYears];
    if (typeof custom === 'number' && custom > 0) return custom;
    return getDefaultHorsePriceForAge(ageYears, ls.horseSalePrice ?? 85);
  };

  const getFarmHorsesForSale = (farmId: string) => {
    const ls = buildingsState[farmId]?.livestockState || createDefaultLivestockState();
    const fullList =
      ls.herd.horses && ls.herd.horses.length > 0 ? ls.herd.horses : createDefaultHorsesList();
    return {
      ls,
      horses: fullList.filter((h) => h.group === 'sale'),
      fullList,
    };
  };

  const activeOffer = activeFarmId ? getFarmHorsesForSale(activeFarmId) : null;

  const handleBuyHorse = (horse: HorseAnimal) => {
    if (!activeFarmId || !activeOffer) return;
    const ls = activeOffer.ls;
    const nextList = activeOffer.fullList.filter((h) => h.id !== horse.id);
    const price = getHorsePrice(ls, horse.ageYears);

    onSpendGold?.(price);
    onUpdateAnyBuildingState?.(activeFarmId, {
      livestockState: {
        ...ls,
        herd: {
          ...ls.herd,
          horses: nextList,
          adultDraftHorses: nextList.filter((h) => h.group === 'breeding').length,
          growingFoalsCount: nextList.filter((h) => h.group === 'growth').length,
          horsesForSale: nextList.filter((h) => h.group === 'sale').length,
          horsesFlockCount: nextList.length,
        },
        lastCycleRevenue: Number(((ls.lastCycleRevenue || 0) + price).toFixed(2)),
      },
    });
    onUpdateState({
      ownedHorses: [...ownedHorses, { ...horse, group: 'breeding' }],
    });
    setFeedback(`🐎 Zakupiono konia ${horse.name} (${horse.ageYears} lat) za £${price}!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
          🐎 Zakup Koni z Oferty Fermy (Jednorazowo)
        </span>
        <span className="text-[11px] font-mono text-emerald-300 font-bold">
          Posiadane konie: {ownedHorses.length} szt.
        </span>
      </div>

      {feedback && (
        <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl">
          {feedback}
        </div>
      )}

      {livestockFarms.length === 0 ? (
        <div className="text-[11px] text-stone-400 font-mono">
          Brak Fermy Hodowlanej na mapie — wybuduj ją, aby kupować konkretne konie.
        </div>
      ) : (
        <>
          <select
            value={activeFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 cursor-pointer"
          >
            <option value="">-- Wybierz fermę hodowlaną (Gracz • Miasto • Ferma) --</option>
            {livestockFarms.map((f) => {
              const info = getFarmHorsesForSale(f.id);
              return (
                <option key={f.id} value={f.id}>
                  🐎 {formatSupplierOrderLabel(f)} (na sprzedaż: {info.horses.length} szt.)
                </option>
              );
            })}
          </select>

          {activeOffer && (
            activeOffer.horses.length === 0 ? (
              <div className="text-[11px] text-stone-400 font-mono py-1">
                Ta ferma nie ma obecnie koni wystawionych na sprzedaż.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeOffer.horses.map((h) => {
                  const price = getHorsePrice(activeOffer.ls, h.ageYears);
                  return (
                    <div
                      key={h.id}
                      className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="text-amber-100 font-bold">
                          🐎 {h.name}{' '}
                          <span className={h.sex === 'male' ? 'text-sky-300' : 'text-pink-300'}>
                            ({h.sex === 'male' ? '♂' : '♀'})
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400">Wiek: {h.ageYears} / 15 lat</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBuyHorse(h)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/50 text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        🛒 Kup (£{price})
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};
