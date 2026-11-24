import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState, ShipInterventionLogEntry } from './types';
import { resolveTradeShipStateId } from './modal/TradeShipInterventionLogsTab';
import type { GameDate } from './clock/gameClockTypes';
import { loadGameParameters } from './admin/gameParameters';
import {
  computeDailyManureKg,
  computeLivestockHorseRequirement,
  type LivestockCapitalismState,
} from './modal/livestock/livestockTypes';
import { processMonthlyLivestockSupply } from './livestockMonthlySupply';
import {
  processMonthlyLivestockBreeding,
  processYearlyHorseAging,
} from './livestockMonthlyBreeding';

interface UseLivestockWorldTickParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Globalny dzienny tick dla wszystkich ferm zwierzęcych (działa nawet przy zamkniętym oknie budynku):
 * - Naliczanie dziennego przyrostu obornika w zagrodzie i automatyczny wywóz na hałdę po osiągnięciu 100%,
 * - Dzienne zużycie paszy i ściółki oraz regeneracja/utrata witalności koni,
 * - Dzienna produkcja jaj oraz postęp inkubacji drobiu.
 */
export function useLivestockWorldTick({
  clockDate,
  placedBuildings,
  setBuildingsState,
  setGold,
}: UseLivestockWorldTickParams) {
  const placedRef = useRef(placedBuildings);
  placedRef.current = placedBuildings;
  const lastClockKeyRef = useRef<string>('');
  const lastMonthKeyRef = useRef<string>('');
  const lastYearRef = useRef<number | null>(null);

  useEffect(() => {
    const key = `${clockDate.year}-${clockDate.month}-${clockDate.day}`;
    const mKey = `${clockDate.year}-${clockDate.month}`;
    if (!lastClockKeyRef.current) {
      lastClockKeyRef.current = key;
      lastMonthKeyRef.current = mKey;
      lastYearRef.current = clockDate.year;
      return;
    }
    if (lastClockKeyRef.current === key) return;
    lastClockKeyRef.current = key;

    const isNewMonth = lastMonthKeyRef.current !== mKey;
    if (isNewMonth) {
      lastMonthKeyRef.current = mKey;
    }
    const isNewYear = lastYearRef.current !== null && lastYearRef.current !== clockDate.year;
    if (isNewYear) {
      lastYearRef.current = clockDate.year;
    }

    const farms = placedRef.current.filter((b) => b.typeId === 'livestock_farm');
    if (farms.length === 0) return;

    const params = loadGameParameters();
    const perAnimalCap = params.manurePenCapacityKg || 1000;
    const manureHeapCap = params.manureBinBaseCapacityKg || 100000;
    const baseFeedPerHorse = params.horseDailyFeedKg || 10;
    const ripMonths = Math.max(1, params.deceasedRemovalMonths || 3);
    const dailyVitLoss = params.horseDailyVitalityLossNoFeedPercent ?? 1;
    let totalGoldSpent = 0;

    setBuildingsState((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const farm of farms) {
        if (isNewMonth) {
          const supplyRes = processMonthlyLivestockSupply(farm.id, next, clockDate);
          if (supplyRes.changed) {
            changed = true;
            totalGoldSpent += supplyRes.totalCost;
          }
          const afterSupply = next[farm.id]?.livestockState;
          if (afterSupply) {
            const bredState = processMonthlyLivestockBreeding(afterSupply);
            if (bredState) {
              changed = true;
              next[farm.id] = { ...next[farm.id], livestockState: bredState };
            }
          }
        }

        if (isNewYear) {
          const curForAging = next[farm.id]?.livestockState;
          if (curForAging) {
            const agedState = processYearlyHorseAging(curForAging);
            if (agedState) {
              changed = true;
              next[farm.id] = { ...next[farm.id], livestockState: agedState };
            }
          }
        }

        const bState = next[farm.id];
        const livestockState = bState?.livestockState;
        if (!livestockState) continue;

        const h = livestockState.herd;
        const sp = livestockState.activeSpecies || 'cattle';
        const animalCount =
          sp === 'cattle'
            ? (h.milkingGroupCows || 0) + (h.growingGroupCalves || 0) + (h.cattleForSale ?? 0)
            : sp === 'sheep'
            ? (h.adultSheepCount || 0) + (h.growingLambsCount || 0) + (h.sheepForSale ?? 0)
            : sp === 'poultry'
            ? (h.adultHensCount || 0) + (h.growingChicksCount || 0) + (h.poultryForSale ?? 0)
            : h.horses && h.horses.length > 0
            ? h.horses.filter((x) => !x.isDeceased).length
            : (h.adultDraftHorses ?? 0) + (h.growingFoalsCount ?? 0) + (h.horsesForSale ?? 0);

        if (animalCount <= 0) continue;

        const cap = Math.max(perAnimalCap, animalCount * perAnimalCap);
        const cur = livestockState.penManureKg ?? 0;

        const recoveringHorsesCount =
          sp === 'horses' && h.horses && h.horses.length > 0
            ? h.horses.filter((x) => !x.isDeceased && (x.vitalityPercent ?? 100) < 100).length
            : 0;
        const dailyFeedNeedKg =
          sp === 'horses'
            ? (animalCount + recoveringHorsesCount) * baseFeedPerHorse
            : sp === 'cattle'
            ? animalCount * 8
            : sp === 'poultry'
            ? Number((animalCount * 0.12).toFixed(2))
            : animalCount * 2;
        const dailyStrawNeedKg = sp === 'horses' ? animalCount * 15 : 0;

        const curSupplies = livestockState.supplies || { strawBeddingKg: 0, feedGrainKg: 0 };
        const availFeedKg = curSupplies.feedGrainKg || 0;
        const availStrawKg = curSupplies.strawBeddingKg || 0;

        const hasEnoughFeed = availFeedKg >= dailyFeedNeedKg;
        let nextFeedGrainKg = Math.max(0, Number((availFeedKg - dailyFeedNeedKg).toFixed(2)));
        let nextStrawBeddingKg = Math.max(0, Number((availStrawKg - dailyStrawNeedKg).toFixed(2)));

        let nextFeedZeroDays =
          nextFeedGrainKg <= 0 && dailyFeedNeedKg > 0
            ? (livestockState.feedZeroDaysCount ?? 0) + 1
            : 0;
        let nextStrawZeroDays =
          nextStrawBeddingKg <= 0 && dailyStrawNeedKg > 0
            ? (livestockState.strawZeroDaysCount ?? 0) + 1
            : 0;

        const feedHeapCap = params.grainSiloBaseCapacityKg || 50000;
        const strawHeapCap = params.strawStackBaseCapacityKg || 20000;
        const emergencyLogs: ShipInterventionLogEntry[] = [];

        if (livestockState.interventionBuyEnabled) {
          if (nextFeedZeroDays >= 2) {
            const monthlyFeedKg = Math.min(feedHeapCap - nextFeedGrainKg, Math.round(dailyFeedNeedKg * 30));
            if (monthlyFeedKg > 0) {
              nextFeedGrainKg += monthlyFeedKg;
              const cost = Number(((monthlyFeedKg / 100) * 11 * 1.1).toFixed(2));
              totalGoldSpent += cost;
              emergencyLogs.push({
                id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                year: clockDate.year,
                month: clockDate.month,
                buyerId: farm.id,
                buyerLabel: farm.name || 'Ferma Hodowlana',
                supplierId: 'trade_ship',
                productLabel: 'Pasza na cały miesiąc (interwencyjnie po 2 dniach braku)',
                shortfallKg: monthlyFeedKg,
                costGbp: cost,
              });
            }
            nextFeedZeroDays = 0;
          }

          if (nextStrawZeroDays >= 2) {
            const monthlyStrawKg = Math.min(strawHeapCap - nextStrawBeddingKg, Math.round(dailyStrawNeedKg * 30));
            if (monthlyStrawKg > 0) {
              nextStrawBeddingKg += monthlyStrawKg;
              const cost = Number(((monthlyStrawKg / 100) * 6.6 * 1.1).toFixed(2));
              totalGoldSpent += cost;
              emergencyLogs.push({
                id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                year: clockDate.year,
                month: clockDate.month,
                buyerId: farm.id,
                buyerLabel: farm.name || 'Ferma Hodowlana',
                supplierId: 'trade_ship',
                productLabel: 'Ściółka na cały miesiąc (interwencyjnie po 2 dniach braku)',
                shortfallKg: monthlyStrawKg,
                costGbp: cost,
              });
            }
            nextStrawZeroDays = 0;
          }
        }

        if (emergencyLogs.length > 0) {
          const shipId = resolveTradeShipStateId(next);
          const prevLogs = next[shipId]?.shipInterventionLogs || [];
          next[shipId] = {
            ...next[shipId],
            shipInterventionLogs: [...emergencyLogs, ...prevLogs].slice(0, 100),
          };
        }

        let nextHerd = h;
        if (sp === 'horses' && h.horses && h.horses.length > 0) {
          const updatedVitalityHorses = h.horses.map((horse) => {
            if (horse.isDeceased) return horse;
            const curVit = horse.vitalityPercent ?? 100;
            if (!hasEnoughFeed && dailyFeedNeedKg > 0) {
              const nextVit = Math.max(0, Number((curVit - dailyVitLoss).toFixed(1)));
              if (nextVit <= 0) {
                return { ...horse, vitalityPercent: 0, isDeceased: true, deceasedMonthsRemaining: ripMonths };
              }
              return { ...horse, vitalityPercent: nextVit };
            }
            return curVit < 100
              ? { ...horse, vitalityPercent: Math.min(100, Number((curVit + dailyVitLoss).toFixed(1))) }
              : horse;
          });
          nextHerd = {
            ...h,
            horses: updatedVitalityHorses,
            adultDraftHorses: updatedVitalityHorses.filter((x) => x.group === 'breeding' && !x.isDeceased).length,
            growingFoalsCount: updatedVitalityHorses.filter((x) => x.group === 'growth' && !x.isDeceased).length,
            horsesForSale: updatedVitalityHorses.filter((x) => x.group === 'sale' && !x.isDeceased).length,
            horsesFlockCount: updatedVitalityHorses.filter((x) => !x.isDeceased).length,
          };
        }

        const ownedHorsesCount = bState?.ownedHorses?.length ?? 0;
        const horseReq = computeLivestockHorseRequirement(livestockState, ownedHorsesCount);
        const isPoultry = sp === 'poultry';
        const nextPoultryIncubation =
          isPoultry && horseReq.isSatisfied && livestockState.poultryStage === 'gestation_9m'
            ? Math.min(21, (livestockState.poultryIncubationDays ?? 0) + 1)
            : livestockState.poultryIncubationDays;
        const dailyEggs =
          isPoultry && horseReq.isSatisfied && (livestockState.selectedPoultryBranch || 'milking') === 'milking'
            ? Math.max(0, Math.round((h.adultHensCount ?? 0) * 0.8))
            : 0;
        const poultryPatch: Partial<LivestockCapitalismState> = isPoultry
          ? {
              poultryIncubationDays: nextPoultryIncubation,
              ...(dailyEggs > 0
                ? {
                    storage: {
                      ...livestockState.storage,
                      eggsCount: (livestockState.storage.eggsCount || 0) + dailyEggs,
                    },
                  }
                : {}),
            }
          : {};

        const hasEnoughStraw =
          availStrawKg > 0 && (dailyStrawNeedKg === 0 || availStrawKg >= dailyStrawNeedKg);
        const dailyGain = hasEnoughStraw ? computeDailyManureKg(sp, animalCount) : 0;
        const rawNext = Math.round(cur + dailyGain);
        const dailyPatch: Partial<LivestockCapitalismState> =
          rawNext >= cap
            ? {
                ...poultryPatch,
                herd: nextHerd,
                penManureKg: rawNext - cap,
                penManureCapacityKg: cap,
                feedZeroDaysCount: nextFeedZeroDays,
                strawZeroDaysCount: nextStrawZeroDays,
                supplies: { feedGrainKg: nextFeedGrainKg, strawBeddingKg: nextStrawBeddingKg },
                storage: {
                  ...(poultryPatch.storage || livestockState.storage),
                  manureKg: Math.min(manureHeapCap, (livestockState.storage.manureKg || 0) + cap),
                },
              }
            : {
                ...poultryPatch,
                herd: nextHerd,
                penManureKg: rawNext,
                penManureCapacityKg: cap,
                feedZeroDaysCount: nextFeedZeroDays,
                strawZeroDaysCount: nextStrawZeroDays,
                supplies: { feedGrainKg: nextFeedGrainKg, strawBeddingKg: nextStrawBeddingKg },
              };

        changed = true;
        next[farm.id] = {
          ...bState,
          livestockState: {
            ...livestockState,
            ...dailyPatch,
          },
        };
      }

      if (totalGoldSpent > 0) {
        const spent = Number(totalGoldSpent.toFixed(2));
        queueMicrotask(() => setGold((g) => Math.max(0, Number((g - spent).toFixed(2)))));
      }

      return changed ? next : prev;
    });
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
