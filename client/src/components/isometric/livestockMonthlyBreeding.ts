import { loadGameParameters } from './admin/gameParameters';
import {
  getInseminationSuccessPercent,
  type HorseAnimal,
  type LivestockCapitalismState,
} from './modal/livestock/livestockTypes';

/**
 * Miesięczny cykl rozrodu, ciąży, regeneracji i odchowu źrebiąt/kurcząt dla jednej fermy zwierzęcej.
 */
export function processMonthlyLivestockBreeding(
  livestockState: LivestockCapitalismState
): LivestockCapitalismState | null {
  const hasAnyCrew = (livestockState.crew || []).length > 0;
  const nextHorseRecovery = hasAnyCrew
    ? Math.max(0, (livestockState.horseRecoveryMonthsRemaining ?? 0) - 1)
    : (livestockState.horseRecoveryMonthsRemaining ?? 0);
  const nextHorseWait = hasAnyCrew
    ? Math.max(0, (livestockState.horseInseminationWaitMonths ?? 0) - 1)
    : (livestockState.horseInseminationWaitMonths ?? 0);
  const nextCattleRecovery = hasAnyCrew
    ? Math.max(0, (livestockState.cattleRecoveryMonthsRemaining ?? 0) - 1)
    : (livestockState.cattleRecoveryMonthsRemaining ?? 0);
  const nextSheepRecovery = hasAnyCrew
    ? Math.max(0, (livestockState.sheepRecoveryMonthsRemaining ?? 0) - 1)
    : (livestockState.sheepRecoveryMonthsRemaining ?? 0);
  const nextPoultryRecovery = hasAnyCrew
    ? Math.max(0, (livestockState.poultryRecoveryMonthsRemaining ?? 0) - 1)
    : (livestockState.poultryRecoveryMonthsRemaining ?? 0);
  const poultryTargetMaturity =
    (livestockState.selectedPoultryBranch || 'milking') === 'milking' ? 12 : 6;
  const nextPoultryChickAge =
    hasAnyCrew &&
    livestockState.activeSpecies === 'poultry' &&
    livestockState.poultryStage === 'calf_growth_2y'
      ? Math.min(poultryTargetMaturity, (livestockState.poultryChickAgeMonths ?? 0) + 1)
      : (livestockState.poultryChickAgeMonths ?? 0);

  let horsePatch: Partial<LivestockCapitalismState> = {};
  const horsesList = livestockState.herd.horses || [];
  if (hasAnyCrew && horsesList.length > 0) {
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
    const cycleMortalityPct = hasVet
      ? params.foalMonthlyMortalityVetPercent
      : params.foalMonthlyMortalityPercent;
    const foalMortalityPct =
      (1 - Math.pow(1 - Math.min(99, Math.max(0, cycleMortalityPct)) / 100, 1 / maturityMonths)) *
      100;
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

        if (!hasMale || !insemWorker) {
          return { ...h, breedingStatus: 'waiting', breedingWaitMonths: 0 };
        }

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
          failedInseminationCount: (h.failedInseminationCount ?? 0) + 1,
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
    nextPoultryRecovery !== (livestockState.poultryRecoveryMonthsRemaining ?? 0) ||
    nextPoultryChickAge !== (livestockState.poultryChickAgeMonths ?? 0) ||
    Object.keys(horsePatch).length > 0;

  if (!recoveryChanged) return null;

  return {
    ...livestockState,
    horseRecoveryMonthsRemaining: nextHorseRecovery,
    horseInseminationWaitMonths: nextHorseWait,
    cattleRecoveryMonthsRemaining: nextCattleRecovery,
    sheepRecoveryMonthsRemaining: nextSheepRecovery,
    poultryRecoveryMonthsRemaining: nextPoultryRecovery,
    poultryChickAgeMonths: nextPoultryChickAge,
    ...horsePatch,
  };
}

/**
 * Roczne starzenie się koni (usunięcie po ukończeniu 15 lat).
 */
export function processYearlyHorseAging(
  livestockState: LivestockCapitalismState
): LivestockCapitalismState | null {
  const curHorses = livestockState.herd.horses;
  if (!curHorses || curHorses.length === 0) return null;

  const maxAge = Math.max(5, loadGameParameters().horseMaxAgeYears || 15);
  const aged = curHorses
    .map((h) => {
      // Źrebięta w grupie 'growth' starzeją się miesięcznie (ageMonths -> maturityMonths) w processMonthlyLivestockBreeding
      if (h.group === 'growth') return h;
      return { ...h, ageYears: h.ageYears + 1 };
    })
    .filter((h) => h.ageYears < maxAge);

  return {
    ...livestockState,
    herd: {
      ...livestockState.herd,
      horses: aged,
      adultDraftHorses: aged.filter((h) => h.group === 'breeding' && !h.isDeceased).length,
      growingFoalsCount: aged.filter((h) => h.group === 'growth' && !h.isDeceased).length,
      horsesForSale: aged.filter((h) => h.group === 'sale' && !h.isDeceased).length,
      horsesFlockCount: aged.filter((h) => !h.isDeceased).length,
    },
  };
}
