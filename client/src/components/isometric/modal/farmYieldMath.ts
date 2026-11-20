import {
  CROPS_CONFIG,
  canWorkerHandleStage,
  getStageAssignedWorkerIds,
  type FarmCapitalismState,
  type FarmCycleStage,
  type FarmWeatherType,
} from './farmGridTypes';
import { loadGameParameters } from '../admin/gameParameters';

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
  ownedHorsesCount?: number
): FarmYieldSummary {
  const extraFields = Math.max(0, attachedFieldsCount);
  const baseHa = loadGameParameters().farmBaseHectares || 10;
  const totalHectares = Number((baseHa + extraFields * 0.5).toFixed(2));
  const selectedCrop = CROPS_CONFIG[state.cropType || 'pszenica'];

  const seedRequiredKg = Math.round(300 * totalHectares);
  const baseYieldKg = Math.round((selectedCrop?.baseYield ?? 3000) * totalHectares);

  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};

  const fertIds = getStageAssignedWorkerIds(assignments, 'fertilizing');
  const hasFertWorker = fertIds.some((id) =>
    crew.some((w) => w.id === id && canWorkerHandleStage(w, 'fertilizing'))
  );
  const weedIds = getStageAssignedWorkerIds(assignments, 'weeding');
  const hasWeedWorker = weedIds.some((id) =>
    crew.some((w) => w.id === id && canWorkerHandleStage(w, 'weeding'))
  );

  // Premia agronoma: maksymalnie +20%
  const agronomistBonusPct = state.agronomist?.hired
    ? Math.min(20, Math.max(0, state.agronomist.yieldBonusPercent || 0))
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
  const irrigationBonusPct = irrigationActive ? 10 : 0;
  const growthWeatherPct = getGrowthWeatherPercent(state.growingWeather, irrigationActive);
  const harvestWeatherPct = getHarvestWeatherPercent(state.harvestWeather);
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

  // Formalnie 1 rolnik polowy obsługuje do 2 ha, a 1 koń pociągowy obrabia domyślnie 0.5 ha (na 1 ha potrzeba 2 koni)
  const fieldFarmersCount = crew.filter(
    (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
  ).length;
  const farmerCapacityHa = fieldFarmersCount * 2;
  const horseCapPerHorse = loadGameParameters().horseWorkCapacityHa || 0.5;
  const horsesCount = typeof ownedHorsesCount === 'number' ? ownedHorsesCount : 2;
  const horseCapacityHa = Number((horsesCount * horseCapPerHorse).toFixed(2));
  const requiredHorsesCount = Math.ceil(totalHectares / horseCapPerHorse);
  const effectiveCapacityHa = Math.min(farmerCapacityHa, horseCapacityHa);
  const coverageRatio =
    fieldFarmersCount === 0 || horsesCount === 0
      ? 0
      : totalHectares <= effectiveCapacityHa
      ? 1
      : effectiveCapacityHa / totalHectares;
  const acreageYieldFactor =
    coverageRatio >= 1 ? 1 : Math.max(0.5, 0.7 + 0.3 * coverageRatio);
  const acreageEfficiencyPct = Math.round(acreageYieldFactor * 100);
  const harvestQualityPercent =
    coverageRatio >= 1 ? 100 : Math.round(Math.max(40, 100 * (0.4 + 0.6 * coverageRatio)));

  const totalYieldKg = Math.round(baseYieldKg * netMultiplier * acreageYieldFactor * combinedWeatherFactor);

  return {
    totalHectares,
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
