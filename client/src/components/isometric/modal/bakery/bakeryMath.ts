import type { BuildingState } from '../../types';
import { loadGameParameters } from '../../admin/gameParameters';
import {
  BAKERY_PRODUCTS_CONFIG,
  type BakeryCapitalismState,
  type BakeryCycleStage,
} from './bakeryTypes';

export interface BakeryYieldSummary {
  dailyFlourInputKg: number;
  dailyBreadOutputKg: number;
  dailyRusksOutputKg: number;
  monthlyBreadForecastKg: number;
  monthlyRusksForecastKg: number;
  qualityPercent: number;
  dailyPayrollCost: number;
  dailyEnergyCost: number;
  energyModeLabel: string;
  efficiencyMultiplier: number;
}

export function computeBakeryYieldSummary(
  bakery: BakeryCapitalismState,
  buildingState: BuildingState
): BakeryYieldSummary {
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[bakery.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;

  const hasManager = bakery.crew.some((c) => c.profession === 'manager');

  const energySource = buildingState.businessEnergySource || 'wegiel';
  const energyScale = buildingState.businessEnergyScale || 'standard';

  let energySpeedMult = 1.0;
  let dailyEnergyCost = 1.8;
  let energyModeLabel =
    energySource === 'wegiel_drzewny'
      ? 'Piec na węgiel drzewny'
      : 'Piec opalany węglem';

  if (energySource === 'wegiel_drzewny') {
    if (energyScale === 'eco') {
      energySpeedMult = 0.85;
      dailyEnergyCost = 1.0;
    } else if (energyScale === 'turbo') {
      energySpeedMult = 1.15;
      dailyEnergyCost = 2.2;
    } else {
      energySpeedMult = 0.95;
      dailyEnergyCost = 1.4;
    }
  } else {
    if (energyScale === 'eco') {
      energySpeedMult = 0.85;
      dailyEnergyCost = 1.2;
    } else if (energyScale === 'turbo') {
      energySpeedMult = 1.25;
      dailyEnergyCost = 3.0;
    } else {
      energySpeedMult = 1.0;
      dailyEnergyCost = 1.8;
    }
  }

  const managerBonus = hasManager ? 1.15 : 1.0;
  const efficiencyMultiplier = Number((energySpeedMult * managerBonus).toFixed(2));

  const baseDailyFlourKg = loadGameParameters().bakeryBaseDailyFlourKg ?? 120;
  const dailyFlourInputKg = Math.round(baseDailyFlourKg * efficiencyMultiplier);

  const dailyBreadOutputKg = Math.round(
    (dailyFlourInputKg * productCfg.breadYieldRatio) / productCfg.unitWeightKg
  );
  const dailyRusksOutputKg = Math.round(dailyFlourInputKg * productCfg.rusksYieldRatio);

  let quality = 78;
  if (hasManager) quality += 8;
  if (bakery.proofingEnabled) quality += 10;
  if (energySource === 'wegiel_drzewny') quality += 4;
  else if (energySource === 'wegiel') quality += 2;
  const qualityPercent = Math.min(100, quality);

  const dailyPayrollCost = bakery.crew.reduce((sum, m) => sum + m.dailyWage, 0);

  return {
    dailyFlourInputKg,
    dailyBreadOutputKg,
    dailyRusksOutputKg,
    monthlyBreadForecastKg: dailyBreadOutputKg * 30,
    monthlyRusksForecastKg: dailyRusksOutputKg * 30,
    qualityPercent,
    dailyPayrollCost,
    dailyEnergyCost,
    energyModeLabel,
    efficiencyMultiplier,
  };
}

export function getBakeryStageForProgress(
  progressPercent: number,
  proofingEnabled: boolean
): BakeryCycleStage {
  if (progressPercent < 14) return 'flour_intake';
  if (progressPercent < 28) return 'sifting';
  if (proofingEnabled && progressPercent < 42) return 'proofing';
  if (progressPercent < 60) return 'kneading';
  if (progressPercent < 78) return 'baking';
  if (progressPercent < 90) return 'cooling_packing';
  return 'dispatch';
}
