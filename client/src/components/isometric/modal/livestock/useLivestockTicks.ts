import { useEffect, useRef } from 'react';
import type { BuildingState } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { getContractMeta } from '../industryContracts';
import { loadGameParameters } from '../../admin/gameParameters';
import { createDefaultHorsesList } from './HorseRosterSection';
import {
  getInseminationSuccessPercent,
  type HorseAnimal,
  type LivestockCapitalismState,
} from './livestockTypes';

interface UseLivestockTicksParams {
  clock?: UseGameClockReturn;
  livestockState: LivestockCapitalismState;
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export function useLivestockTicks({
  clock,
  livestockState,
  buildingsState,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}: UseLivestockTicksParams) {
  // 1. Codzienny przyrost obornika i zużycie paszy
  const lastClockKeyRef = useRef<string>('');
  useEffect(() => {
    if (!clock) return;
    const key = `${clock.date.year}-${clock.date.month}-${clock.date.day}`;
    if (!lastClockKeyRef.current) {
      lastClockKeyRef.current = key;
      return;
    }
    if (lastClockKeyRef.current === key) return;
    lastClockKeyRef.current = key;

    const params = loadGameParameters();
    const h = livestockState.herd;
    const sp = livestockState.activeSpecies || 'cattle';
    const animalCount =
      sp === 'cattle'
        ? (h.milkingGroupCows || 0) + (h.growingGroupCalves || 0) + (h.cattleForSale ?? 4)
        : sp === 'sheep'
        ? (h.adultSheepCount || 0) + (h.growingLambsCount || 0) + (h.sheepForSale ?? 4)
        : (h.horses && h.horses.length > 0
            ? h.horses.filter((x) => !x.isDeceased).length
            : (h.adultDraftHorses ?? 10) + (h.growingFoalsCount ?? 4) + (h.horsesForSale ?? 2));

    const perAnimalCap = params.manurePenCapacityKg || 1000;
    const cap = Math.max(perAnimalCap, animalCount * perAnimalCap);
    const manureHeapCap = params.manureBinBaseCapacityKg || 10000;
    const cur = livestockState.penManureKg ?? 0;
    const baseFeedPerHorse = params.horseDailyFeedKg || 10;
    const recoveringHorsesCount =
      sp === 'horses' && h.horses && h.horses.length > 0
        ? h.horses.filter((x) => !x.isDeceased && (x.vitalityPercent ?? 100) < 100).length
        : 0;
    const dailyFeedNeedKg =
      sp === 'horses'
        ? (animalCount + recoveringHorsesCount) * baseFeedPerHorse // Konie w rekonwalescencji jedzą 2x paszy aż do 100% zdrowia
        : sp === 'cattle'
        ? animalCount * 8
        : animalCount * 2;
    const dailyStrawNeedKg = sp === 'horses' ? animalCount * 15 : 0;
    const curSupplies = livestockState.supplies || { strawBeddingKg: 400, feedGrainKg: 350 };
    const hasEnoughFeed = (curSupplies.feedGrainKg || 0) >= dailyFeedNeedKg;
    const nextFeedGrainKg = Math.max(0, (curSupplies.feedGrainKg || 0) - dailyFeedNeedKg);
    const nextStrawBeddingKg = Math.max(0, (curSupplies.strawBeddingKg || 0) - dailyStrawNeedKg);

    // Witalność koni: bez paszy tracą zdrowie; gdy jest pasza, jedzą 2x i odzyskują ten sam % aż do 100%
    let nextHerd = livestockState.herd;
    if (sp === 'horses' && h.horses && h.horses.length > 0) {
      const ripMonths = Math.max(1, params.deceasedRemovalMonths || 3);
      const dailyVitLoss = params.horseDailyVitalityLossNoFeedPercent ?? 1;
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

    if (animalCount > 0) {
      const dailyGain = Math.max(2, Math.round(animalCount * 1.5));
      const rawNext = Math.round(cur + dailyGain);
      if (rawNext >= cap) {
        // Obornik, który nie mieści się na hałdę, przepada
        const nextHeapManure = Math.min(manureHeapCap, (livestockState.storage.manureKg || 0) + cap);
        onUpdateState({
          livestockState: {
            ...livestockState,
            herd: nextHerd,
            penManureKg: rawNext - cap,
            penManureCapacityKg: cap,
            supplies: { feedGrainKg: nextFeedGrainKg, strawBeddingKg: nextStrawBeddingKg },
            storage: {
              ...livestockState.storage,
              manureKg: nextHeapManure,
            },
          },
        });
      } else {
        onUpdateState({
          livestockState: {
            ...livestockState,
            herd: nextHerd,
            penManureKg: rawNext,
            penManureCapacityKg: cap,
            supplies: { feedGrainKg: nextFeedGrainKg, strawBeddingKg: nextStrawBeddingKg },
          },
        });
      }
    }
  }, [clock?.date.year, clock?.date.month, clock?.date.day]);

  // 2. Miesięczne dostawy paszy/ściółki oraz odliczanie regeneracji po porodzie
  const lastDeliveryMonthRef = useRef<string>('');
  useEffect(() => {
    if (!clock) return;
    const mKey = `${clock.date.year}-${clock.date.month}`;
    if (!lastDeliveryMonthRef.current) {
      lastDeliveryMonthRef.current = mKey;
      return;
    }
    if (lastDeliveryMonthRef.current === mKey) return;
    lastDeliveryMonthRef.current = mKey;

    const supplies = livestockState.supplies || { strawBeddingKg: 400, feedGrainKg: 350 };
    let nextFeed = supplies.feedGrainKg;
    let nextStraw = supplies.strawBeddingKg;
    let nextFeedOrder = livestockState.feedOrder;
    let nextStrawOrder = livestockState.strawOrder;
    let totalCost = 0;

    const fulfill = (order: typeof nextFeedOrder, kind: 'feed' | 'straw') => {
      if (!order) return order;
      const producerCap = buildingsState[order.supplierId]?.farmCapitalism;
      if (!producerCap) return order;
      const cropKey = producerCap.cropType || 'pszenica';
      const avail =
        kind === 'feed'
          ? (producerCap.grainStockKg?.[cropKey] ?? producerCap.wheatStockKg ?? 0)
          : (producerCap.strawStockKg ?? 0);
      const delivered = Math.min(order.monthlyQuantityKg, avail);
      const meta = getContractMeta(order.contractType);
      if (delivered > 0) {
        if (kind === 'feed') nextFeed += delivered;
        else nextStraw += delivered;
        const basePer100 = kind === 'feed' ? 10 : 6;
        totalCost += Number(((delivered / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2));
        onUpdateAnyBuildingState?.(order.supplierId, {
          farmCapitalism: {
            ...producerCap,
            ...(kind === 'feed'
              ? {
                  grainStockKg: {
                    ...producerCap.grainStockKg,
                    [cropKey]: Math.max(0, (producerCap.grainStockKg?.[cropKey] ?? 0) - delivered),
                  },
                  wheatStockKg: Math.max(0, (producerCap.wheatStockKg ?? 0) - delivered),
                }
              : { strawStockKg: Math.max(0, avail - delivered) }),
          },
        });
      }
      if (meta.durationMonths > 0) {
        const rem = order.monthsRemaining - 1;
        return rem > 0 ? { ...order, monthsRemaining: rem } : undefined;
      }
      return order;
    };

    const paramsForCap = loadGameParameters();
    const feedHeapCap = paramsForCap.grainSiloBaseCapacityKg || 10000;
    const strawHeapCap = paramsForCap.strawStackBaseCapacityKg || 20000;
    nextFeedOrder = fulfill(nextFeedOrder, 'feed');
    nextStrawOrder = fulfill(nextStrawOrder, 'straw');
    nextFeed = Math.min(feedHeapCap, nextFeed);
    nextStraw = Math.min(strawHeapCap, nextStraw);

    const nextHorseRecovery = Math.max(0, (livestockState.horseRecoveryMonthsRemaining ?? 0) - 1);
    const nextHorseWait = Math.max(0, (livestockState.horseInseminationWaitMonths ?? 0) - 1);
    const nextCattleRecovery = Math.max(0, (livestockState.cattleRecoveryMonthsRemaining ?? 0) - 1);
    const nextSheepRecovery = Math.max(0, (livestockState.sheepRecoveryMonthsRemaining ?? 0) - 1);

    // Niezależny miesięczny cykl rozrodu dla każdej klaczy z osobna
    let horsePatch: Partial<LivestockCapitalismState> = {};
    const horsesList =
      livestockState.herd.horses && livestockState.herd.horses.length > 0
        ? livestockState.herd.horses
        : createDefaultHorsesList();
    if (horsesList.length > 0) {
      const params = loadGameParameters();
      const recMonths = Math.max(1, params.horseRecoveryMonths || 3);
      const retryMonths = Math.max(1, params.horseInseminationRetryWaitMonths || 1);
      const maxPreg = Math.max(1, params.horseGestationMonths || 11);
      const maturityMonths = Math.max(12, (params.horseMaturityYears || 3) * 12);
      const insemId = livestockState.stageAssignments?.insemination;
      const insemWorker = (livestockState.crew || []).find((w) => w.id === insemId);
      const baseSuccessPercent = getInseminationSuccessPercent(insemWorker?.profession);

      const breedingList = horsesList.filter((h) => h.group === 'breeding' && !h.isDeceased);
      const malesCount = breedingList.filter(
        (h, i) => (h.sex ?? (i % 4 === 0 ? 'male' : 'female')) === 'male'
      ).length;
      const hasMale = malesCount > 0;
      const effectiveSuccessPercent = hasMale
        ? Math.min(100, baseSuccessPercent + Math.max(0, malesCount - 1) * 10)
        : 0;
      const hasVet = (livestockState.crew || []).some((w) => w.profession === 'vet');
      const foalMortalityPct = hasVet
        ? params.foalMonthlyMortalityVetPercent
        : params.foalMonthlyMortalityPercent;
      const ripRemovalMonths = Math.max(1, params.deceasedRemovalMonths || 3);

      const newFoals: HorseAnimal[] = [];
      let failedInsemCount = 0;
      let breedingIdx = 0;

      const updatedHorses = horsesList
        .map((h): HorseAnimal | null => {
          if (h.isDeceased) {
            const rem = (h.deceasedMonthsRemaining ?? ripRemovalMonths) - 1;
            return rem > 0 ? { ...h, deceasedMonthsRemaining: rem } : null;
          }
          if (h.group === 'growth') {
            if (Math.random() * 100 < foalMortalityPct) {
              return {
                ...h,
                isDeceased: true,
                deceasedMonthsRemaining: ripRemovalMonths,
              };
            }
            const nextAgeMonths = (h.ageMonths ?? (h.ageYears || 0) * 12) + 1;
            const nextAgeYears = Math.floor(nextAgeMonths / 12);
            if (nextAgeMonths >= maturityMonths) {
              return {
                ...h,
                ageMonths: nextAgeMonths,
                ageYears: nextAgeYears,
                group: h.postGrowthTarget,
                ...(h.postGrowthTarget === 'breeding'
                  ? { breedingStatus: 'waiting' as const, breedingWaitMonths: 0, pregnancyMonths: 0 }
                  : {}),
              };
            }
            return { ...h, ageMonths: nextAgeMonths, ageYears: nextAgeYears };
          }
        if (h.group !== 'breeding') return h;
        const idx = breedingIdx++;
        const sex = h.sex ?? (idx % 4 === 0 ? 'male' : 'female');
        if (sex !== 'female') return h;

        const status = h.breedingStatus ?? 'waiting';
        if (status === 'pregnant') {
          const nextPreg = (h.pregnancyMonths ?? 1) + 1;
          if (nextPreg > maxPreg) {
            newFoals.push({
              id: `foal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: `Źrebię ${horsesList.length + newFoals.length + 1}`,
              sex: Math.random() < 0.5 ? 'male' : 'female',
              ageYears: 0,
              ageMonths: 0,
              group: 'growth',
              postGrowthTarget: 'sale',
            });
            return {
              ...h,
              breedingStatus: 'waiting',
              breedingWaitMonths: recMonths,
              pregnancyMonths: 0,
            };
          }
          return { ...h, pregnancyMonths: nextPreg };
        }

        const curWait =
          h.breedingWaitMonths !== undefined
            ? Math.max(0, h.breedingWaitMonths - 1)
            : nextHorseRecovery;

        if (curWait > 0) {
          return {
            ...h,
            breedingStatus: status === 'failed_wait' ? 'failed_wait' : 'waiting',
            breedingWaitMonths: curWait,
          };
        }

        if (!hasMale) {
          return { ...h, breedingStatus: 'waiting', breedingWaitMonths: 0 };
        }

        // Niezależny rzut skuteczności inseminacji dla tej konkretnej klaczy (30%/50% +10% za każdego kolejnego ogiera)
        if (Math.random() * 100 < effectiveSuccessPercent) {
          return {
            ...h,
            breedingStatus: 'pregnant',
            breedingWaitMonths: 0,
            pregnancyMonths: 1,
          };
        }
        failedInsemCount += 1;
        return {
          ...h,
          breedingStatus: 'failed_wait',
          breedingWaitMonths: retryMonths,
          pregnancyMonths: 0,
        };
      });

      const finalHorses = (
        newFoals.length > 0 ? [...updatedHorses, ...newFoals] : updatedHorses
      ).filter((h): h is HorseAnimal => Boolean(h));
      horsePatch = {
        totalProceduresFailed: (livestockState.totalProceduresFailed || 0) + failedInsemCount,
        herd: {
          ...livestockState.herd,
          horses: finalHorses,
          adultDraftHorses: finalHorses.filter((h) => h.group === 'breeding' && !h.isDeceased).length,
          growingFoalsCount: finalHorses.filter((h) => h.group === 'growth' && !h.isDeceased).length,
          horsesForSale: finalHorses.filter((h) => h.group === 'sale' && !h.isDeceased).length,
          horsesFlockCount: finalHorses.filter((h) => !h.isDeceased).length,
        },
      };
    }

    const recoveryChanged =
      nextHorseRecovery !== (livestockState.horseRecoveryMonthsRemaining ?? 0) ||
      nextHorseWait !== (livestockState.horseInseminationWaitMonths ?? 0) ||
      nextCattleRecovery !== (livestockState.cattleRecoveryMonthsRemaining ?? 0) ||
      nextSheepRecovery !== (livestockState.sheepRecoveryMonthsRemaining ?? 0) ||
      Object.keys(horsePatch).length > 0;

    if (totalCost > 0 || nextFeedOrder !== livestockState.feedOrder || nextStrawOrder !== livestockState.strawOrder || recoveryChanged) {
      if (totalCost > 0) onSpendGold?.(totalCost);
      onUpdateState({
        livestockState: {
          ...livestockState,
          supplies: { feedGrainKg: nextFeed, strawBeddingKg: nextStraw },
          feedOrder: nextFeedOrder,
          strawOrder: nextStrawOrder,
          lastCycleCost: Number(((livestockState.lastCycleCost || 0) + totalCost).toFixed(2)),
          horseRecoveryMonthsRemaining: nextHorseRecovery,
          horseInseminationWaitMonths: nextHorseWait,
          cattleRecoveryMonthsRemaining: nextCattleRecovery,
          sheepRecoveryMonthsRemaining: nextSheepRecovery,
          ...horsePatch,
        },
      });
    }
  }, [clock?.date.year, clock?.date.month]);

  // 3. Roczne starzenie się koni
  const lastHorseYearRef = useRef<number | null>(null);
  useEffect(() => {
    if (!clock) return;
    if (lastHorseYearRef.current === null) {
      lastHorseYearRef.current = clock.date.year;
      return;
    }
    if (lastHorseYearRef.current === clock.date.year) return;
    lastHorseYearRef.current = clock.date.year;

    const curHorses = livestockState.herd.horses;
    if (!curHorses || curHorses.length === 0) return;

    const aged = curHorses
      .map((h) => {
        const nextAge = h.ageYears + 1;
        if (h.group === 'growth' && nextAge >= 3) {
          return { ...h, ageYears: nextAge, group: h.postGrowthTarget };
        }
        return { ...h, ageYears: nextAge };
      })
      .filter((h) => h.ageYears < 15);

    onUpdateState({
      livestockState: {
        ...livestockState,
        herd: {
          ...livestockState.herd,
          horses: aged,
          adultDraftHorses: aged.filter((h) => h.group === 'breeding').length,
          growingFoalsCount: aged.filter((h) => h.group === 'growth').length,
          horsesForSale: aged.filter((h) => h.group === 'sale').length,
          horsesFlockCount: aged.length,
        },
      },
    });
  }, [clock?.date.year]);
}
