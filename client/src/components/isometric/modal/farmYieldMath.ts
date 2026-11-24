import {
  CROPS_CONFIG,
  canWorkerHandleStage,
  getHiredAgronomistsCount,
  getRequiredAgronomistsCount,
  getStageAssignedWorkerIds,
  type FarmCapitalismState,
  type FarmCycleStage,
  type FarmWeatherType,
} from './farmGridTypes';
import { loadGameParameters } from '../admin/gameParameters';
import type { HorseAnimal } from './livestock/livestockTypes';
import { getHorseEffectiveCapacityHa } from './horseEnergyMath';

export function getGrowthWeatherPercent(weather?: FarmWeatherType, hasIrrigation = false): number {
  if (!weather) return 100;
  if (weather === 'rainy') return 100;
  if (weather === 'cloudy' || weather === 'partly_cloudy') return 90;
  if (weather === 'sunny') return hasIrrigation ? 100 : 80;
  return 80; // stormy
}

export function getHarvestWeatherPercent(weather?: FarmWeatherType): number {
  if (!weather) return 100;
  if (weather === 'sunny') return 100;
  if (weather === 'partly_cloudy') return 90;
  if (weather === 'cloudy') return 80;
  return 70; // rainy / stormy
}

export interface FarmYieldSummary {
  totalHectares: number;
  cultivatedHectares: number;
  fieldFarmersCount: number;
  farmerCapacityHa: number;
  ownedHorsesCount: number;
  horseCapacityHa: number;
  requiredHorsesCount: number;
  acreageEfficiencyPct: number;
  harvestQualityPercent: number;
  growthWeatherPct: number;
  harvestWeatherPct: number;
  combinedWeatherPct: number;
  seedRequiredKg: number;
  seedsAvailableKg: number;
  seedCoverageRatio: number;
  seedCoveragePercent: number;
  manureRequiredKg: number;
  manureUsedKg: number;
  hasEnoughManure: boolean;
  baseYieldKg: number;
  agronomistBonusPct: number;
  farmerBonusPct: number;
  fertilizerBonusPct: number;
  weedingBonusPct: number;
  irrigationBonusPct: number;
  droughtPenaltyPct: number;
  totalBonusPct: number;
  totalYieldKg: number;
  hasFertWorker: boolean;
  hasWeedWorker: boolean;
}

const FIELD_SKILL_STAGES: FarmCycleStage[] = ['plowing', 'sowing', 'harvesting'];

/**
 * Oblicza zapotrzebowanie na ziarno siewne oraz plon końcowy farmy zbożowej:
 * - Baza (1 ha): 300 kg siewu -> 3000 kg (3 t) plonu podstawowego
 * - Każde dodatkowe przyległe pole: +150 kg siewu -> +2000 kg (+2 t) plonu
 * - Mnożniki: Agronom (do +20%), Doświadczony rolnik (do +10%), Nawożenie naturalne (50%: +20%, 100%: +30%), Pielenie (+5%)
 */
export function computeFarmYieldSummary(
  state: FarmCapitalismState,
  attachedFieldsCount = 0,
  isDrought = false,
  ownedHorsesCount?: number,
  ownedHorses?: HorseAnimal[]
): FarmYieldSummary {
  const extraFields = Math.max(0, attachedFieldsCount);
  const params = loadGameParameters();
  const baseHa = params.farmBaseHectares || 10;
  const totalHectares = Number((baseHa + extraFields * 5).toFixed(2));
  const selectedCrop = CROPS_CONFIG[state.cropType || 'pszenica'];

  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};

  // 1 rolnik polowy obsługuje bazowo 5 ha, a 1 koń roboczy 5 ha (proporcjonalnie do kondycji)
  const fieldFarmersCount = crew.filter(
    (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
  ).length;
  const farmerCapPerWorker = params.farmerWorkCapacityHa || 5;
  const farmerCapacityHa = fieldFarmersCount * farmerCapPerWorker;
  const horseCapPerHorse = params.horseWorkCapacityHa || 5;
  const activeOwnedHorses = ownedHorses ? ownedHorses.filter((h) => !h.isDeceased) : undefined;
  const horsesCount = activeOwnedHorses
    ? activeOwnedHorses.length
    : typeof ownedHorsesCount === 'number'
    ? ownedHorsesCount
    : 2;
  const horseCapacityHa = activeOwnedHorses
    ? getHorseEffectiveCapacityHa(activeOwnedHorses, horseCapPerHorse)
    : Number((horsesCount * horseCapPerHorse).toFixed(2));
  const requiredHorsesCount = Math.ceil(totalHectares / horseCapPerHorse);
  const effectiveCapacityHa = Math.min(farmerCapacityHa, horseCapacityHa);
  const cultivatedHectares = Number(Math.min(totalHectares, Math.max(0, effectiveCapacityHa)).toFixed(2));
  const coverageRatio =
    fieldFarmersCount === 0 || horsesCount === 0 || effectiveCapacityHa <= 0
      ? 0
      : totalHectares <= effectiveCapacityHa
      ? 1
      : effectiveCapacityHa / totalHectares;
  const acreageYieldFactor = coverageRatio >= 1 ? 1 : coverageRatio;
  const acreageEfficiencyPct = Math.round(acreageYieldFactor * 100);
  const harvestQualityPercent =
    coverageRatio >= 1 ? 100 : Math.round(Math.max(40, 100 * (0.4 + 0.6 * coverageRatio)));

  const seedRequiredKg = Math.round(300 * cultivatedHectares);
  const baseYieldKg = Math.round((selectedCrop?.baseYield ?? 3000) * totalHectares);

  const fertIds = getStageAssignedWorkerIds(assignments, 'fertilizing');
  const hasFertWorker = fertIds.some((id) =>
    crew.some((w) => w.id === id && canWorkerHandleStage(w, 'fertilizing'))
  );
  const weedIds = getStageAssignedWorkerIds(assignments, 'weeding');
  const hasWeedWorker = weedIds.some((id) =>
    crew.some((w) => w.id === id && canWorkerHandleStage(w, 'weeding'))
  );

  // Premia agronoma: maksymalnie +20%
  const hiredAgronomists = getHiredAgronomistsCount(state.agronomist);
  const requiredAgronomists = getRequiredAgronomistsCount(fieldFarmersCount);
  const agronomistCoverage = hiredAgronomists > 0 ? Math.min(1, hiredAgronomists / requiredAgronomists) : 0;
  const agronomistBonusPct =
    hiredAgronomists > 0
      ? Math.round(
          Math.min(20, Math.max(0, state.agronomist.yieldBonusPercent || 0)) * agronomistCoverage
        )
      : 0;

  // Premia doświadczonego rolnika: maksymalnie +10%
  let farmerBonusPct = 0;
  for (const stage of FIELD_SKILL_STAGES) {
    const workerIds = getStageAssignedWorkerIds(assignments, stage);
    for (const workerId of workerIds) {
      const worker = crew.find((w) => w.id === workerId && canWorkerHandleStage(w, stage));
      if (worker && typeof worker.skillBonusPercent === 'number') {
        farmerBonusPct = Math.max(farmerBonusPct, Math.min(10, Math.max(0, worker.skillBonusPercent)));
      }
    }
  }

  // Premia za nawożenie naturalne (obornik 1880): wymaga zapasu obornika w magazynie!
  // 50% -> 5 000 kg/ha (+20% plonu), 100% -> 10 000 kg/ha (+30% plonu)
  const effectiveFertLevel = !state.enableFertilizing ? 0 : (state.fertilizingLevel ?? 100);
  const perHa100 = loadGameParameters().manurePerHa100Kg || 10000;
  const manurePerHa100 = Math.round(perHa100 * totalHectares);
  const manurePerHa50 = Math.round(perHa100 * 0.5 * totalHectares);
  const manureRequiredKg =
    effectiveFertLevel === 100 ? manurePerHa100 : effectiveFertLevel === 50 ? manurePerHa50 : 0;
  const availableManure = state.manureStockKg ?? state.fertilizerStockKg ?? 0;
  const hasEnoughManure = manureRequiredKg === 0 || availableManure >= manureRequiredKg;

  let fertilizerBonusPct = 0;
  let manureUsedKg = 0;
  if (hasFertWorker && effectiveFertLevel === 100 && availableManure >= manurePerHa100) {
    fertilizerBonusPct = 30;
    manureUsedKg = manurePerHa100;
  } else if (hasFertWorker && effectiveFertLevel >= 50 && availableManure >= manurePerHa50) {
    fertilizerBonusPct = 20;
    manureUsedKg = manurePerHa50;
  }
  const weedingBonusPct = state.enableWeeding && hasWeedWorker ? 5 : 0;
  const irrigationActive = Boolean(state.enableIrrigation);
  const isWetWeather = state.growingWeather === 'rainy' || state.growingWeather === 'stormy';
  const irrigationBonusPct = irrigationActive && !isWetWeather ? 10 : 0;
  const stageAllowsGrowthWeather =
    state.currentStage === 'growing' ||
    state.currentStage === 'harvesting' ||
    state.currentStage === 'storing_selling';
  const stageAllowsHarvestWeather =
    state.currentStage === 'harvesting' || state.currentStage === 'storing_selling';
  const growthWeatherPct = stageAllowsGrowthWeather
    ? getGrowthWeatherPercent(state.growingWeather, irrigationActive)
    : 100;
  const harvestWeatherPct = stageAllowsHarvestWeather
    ? getHarvestWeatherPercent(state.harvestWeather)
    : 100;
  const combinedWeatherFactor = (growthWeatherPct / 100) * (harvestWeatherPct / 100);
  const combinedWeatherPct = Math.round(combinedWeatherFactor * 100);
  const droughtPenaltyPct = isDrought && !irrigationActive ? 30 : 0;

  const totalBonusPct =
    agronomistBonusPct +
    farmerBonusPct +
    fertilizerBonusPct +
    weedingBonusPct +
    irrigationBonusPct;

  const netMultiplier = Math.max(0.1, 1 + (totalBonusPct - droughtPenaltyPct) / 100);

  const activeCrop = state.cropType || 'pszenica';
  const siloGrainKg =
    state.grainStockKg?.[activeCrop] ??
    (activeCrop === 'pszenica' ? state.wheatStockKg ?? 0 : 0);
  const seedsAvailableKg =
    state.sowingCompletedForCurrentCycle && (state.lastSowingSeedsUsedKg ?? 0) > 0
      ? (state.lastSowingSeedsUsedKg ?? 0)
      : siloGrainKg > 0
      ? siloGrainKg
      : (state.seedsStockKg ?? 0);
  const seedCoverageRatio =
    seedRequiredKg > 0 ? Math.min(1, Math.max(0, seedsAvailableKg / seedRequiredKg)) : 1;
  const seedCoveragePercent = Math.round(seedCoverageRatio * 100);

  const totalYieldKg = Math.round(
    baseYieldKg * netMultiplier * acreageYieldFactor * combinedWeatherFactor * seedCoverageRatio
  );

  return {
    totalHectares,
    cultivatedHectares,
    fieldFarmersCount,
    farmerCapacityHa,
    ownedHorsesCount: horsesCount,
    horseCapacityHa,
    requiredHorsesCount,
    acreageEfficiencyPct,
    harvestQualityPercent,
    growthWeatherPct,
    harvestWeatherPct,
    combinedWeatherPct,
    seedRequiredKg,
    seedsAvailableKg,
    seedCoverageRatio,
    seedCoveragePercent,
    manureRequiredKg,
    manureUsedKg,
    hasEnoughManure,
    baseYieldKg,
    agronomistBonusPct,
    farmerBonusPct,
    fertilizerBonusPct,
    weedingBonusPct,
    irrigationBonusPct,
    droughtPenaltyPct,
    totalBonusPct,
    totalYieldKg,
    hasFertWorker,
    hasWeedWorker,
  };
}
