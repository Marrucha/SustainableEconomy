import { loadGameParameters } from '../admin/gameParameters';
import type { HorseAnimal } from './livestock/livestockTypes';

export const WORKING_HORSE_MAX_AGE_YEARS = 15;

export function getHorseVitalityPercent(horse: HorseAnimal): number {
  if (horse.isDeceased) return 0;
  const raw = typeof horse.vitalityPercent === 'number' ? horse.vitalityPercent : 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getSingleHorseCapacityHa(horse: HorseAnimal, perHorseHa?: number): number {
  const cap = perHorseHa ?? (loadGameParameters().horseWorkCapacityHa || 5);
  if (horse.isDeceased) return 0;
  return Number(((cap * getHorseVitalityPercent(horse)) / 100).toFixed(2));
}

export function getHorseEffectiveCapacityHa(horses: HorseAnimal[], perHorseHa?: number): number {
  const cap = perHorseHa ?? (loadGameParameters().horseWorkCapacityHa || 5);
  const total = horses.reduce((sum, h) => sum + (h.isDeceased ? 0 : (cap * getHorseVitalityPercent(h)) / 100), 0);
  return Number(total.toFixed(2));
}

export interface WorkingHorsesMonthTickResult {
  nextHorses: HorseAnimal[];
  remainingFeedKg: number;
  changed: boolean;
}

export function tickWorkingHorsesMonth(
  horses: HorseAnimal[],
  availableFeedKg: number,
  dailyFeedPerHorseKg: number,
  isNewYear: boolean
): WorkingHorsesMonthTickResult {
  if (horses.length === 0) {
    return { nextHorses: horses, remainingFeedKg: availableFeedKg, changed: false };
  }

  const activeCount = horses.filter((h) => !h.isDeceased).length;
  const monthlyNeedKg = Math.round(activeCount * dailyFeedPerHorseKg * 30);
  // Pasza jest zużywana codziennie z magazynu; tutaj oceniamy, czy na starcie/koniec miesiąca jest pokrycie
  const feedRatio =
    activeCount === 0 || monthlyNeedKg <= 0
      ? 1
      : availableFeedKg >= monthlyNeedKg * 0.5
      ? 1
      : availableFeedKg > 0
      ? availableFeedKg / (monthlyNeedKg * 0.5)
      : 0;

  let changed = false;
  const nextHorses: HorseAnimal[] = [];

  for (const h of horses) {
    if (h.isDeceased) {
      const rem = (h.deceasedMonthsRemaining ?? 1) - 1;
      changed = true;
      if (rem > 0) {
        nextHorses.push({ ...h, deceasedMonthsRemaining: rem });
      }
      continue;
    }

    const curVitality = getHorseVitalityPercent(h);
    let nextVitality = curVitality;
    if (feedRatio >= 1) {
      nextVitality = Math.min(100, curVitality + 15);
    } else {
      const loss = Math.max(1, Number((8.4 * (1 - feedRatio)).toFixed(1)));
      nextVitality = Math.max(0, Number((curVitality - loss).toFixed(1)));
    }

    const nextAge = isNewYear ? h.ageYears + 1 : h.ageYears;
    const died = nextVitality <= 0 || nextAge >= WORKING_HORSE_MAX_AGE_YEARS;

    if (nextVitality !== curVitality || nextAge !== h.ageYears || died) {
      changed = true;
    }

    if (died) {
      nextHorses.push({
        ...h,
        ageYears: nextAge,
        vitalityPercent: nextVitality,
        isDeceased: true,
        deceasedMonthsRemaining: 1,
      });
    } else {
      nextHorses.push({
        ...h,
        ageYears: nextAge,
        vitalityPercent: nextVitality,
      });
    }
  }

  return { nextHorses, remainingFeedKg: availableFeedKg, changed };
}
