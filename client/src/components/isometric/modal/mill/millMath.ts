import type { BuildingState } from '../../types';
import { loadGameParameters } from '../../admin/gameParameters';
import {
  MILL_PRODUCTS_CONFIG,
  type MillCapitalismState,
  type MillCycleStage,
} from './millTypes';

export interface MillYieldSummary {
  dailyGrainInputKg: number;
  dailyFlourOutputKg: number;
  dailyBranOutputKg: number;
  monthlyFlourForecastKg: number;
  monthlyBranForecastKg: number;
  qualityPercent: number;
  dailyPayrollCost: number;
  dailyEnergyCost: number;
  energyModeLabel: string;
  efficiencyMultiplier: number;
}

export function computeMillYieldSummary(
  mill: MillCapitalismState,
  buildingState: BuildingState
): MillYieldSummary {
  const productCfg = MILL_PRODUCTS_CONFIG[mill.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;

  const hasManager = mill.crew.some((c) => c.profession === 'manager');

  const energySource = buildingState.businessEnergySource || 'wegiel';
  const energyScale = buildingState.businessEnergyScale || 'standard';

  let energySpeedMult = 1.0;
  let dailyEnergyCost = 2.5;
  let energyModeLabel = 'Kocioł parowy (Węgiel)';

  if (energySource === 'konie') {
    const horses = buildingState.ownedHorses?.length ?? 0;
    energySpeedMult = horses >= 2 ? 0.85 : horses === 1 ? 0.65 : 0;
    dailyEnergyCost = horses * 0.8;
    energyModeLabel = `Kierat konny (${horses} szt.)`;
  } else {
    if (energyScale === 'eco') {
      energySpeedMult = 0.85;
      dailyEnergyCost = 1.8;
    } else if (energyScale === 'turbo') {
      energySpeedMult = 1.25;
      dailyEnergyCost = 4.2;
    } else {
      energySpeedMult = 1.0;
      dailyEnergyCost = 2.5;
    }
  }

  const managerBonus = hasManager ? 1.15 : 1.0;
  const efficiencyMultiplier = Number((energySpeedMult * managerBonus).toFixed(2));

  // Baza: 200 kg ziarna dziennie (pobierana z gameParameters.ts)
  const baseDailyGrainKg = loadGameParameters().millBaseDailyGrainKg ?? 200;
  const dailyGrainInputKg = Math.round(baseDailyGrainKg * efficiencyMultiplier);

  const dailyFlourOutputKg = Math.round(dailyGrainInputKg * productCfg.flourYieldRatio);
  const dailyBranOutputKg = Math.round(dailyGrainInputKg * productCfg.branYieldRatio);

  let quality = 78;
  if (hasManager) quality += 8;
  if (mill.conditioningEnabled) quality += 10;
  if (energySource === 'wegiel') quality += 2;
  const qualityPercent = Math.min(100, quality);

  const dailyPayrollCost = mill.crew.reduce((sum, m) => sum + m.dailyWage, 0);

  return {
    dailyGrainInputKg,
    dailyFlourOutputKg,
    dailyBranOutputKg,
    monthlyFlourForecastKg: dailyFlourOutputKg * 30,
    monthlyBranForecastKg: dailyBranOutputKg * 30,
    qualityPercent,
    dailyPayrollCost,
    dailyEnergyCost,
    energyModeLabel,
    efficiencyMultiplier,
  };
}

export function getMillStageForProgress(progressPercent: number, conditioningEnabled: boolean): MillCycleStage {
  if (progressPercent < 14) return 'grain_intake';
  if (progressPercent < 28) return 'cleaning';
  if (conditioningEnabled && progressPercent < 42) return 'conditioning';
  if (progressPercent < 62) return 'milling';
  if (progressPercent < 76) return 'sifting';
  if (progressPercent < 90) return 'packing_dispatch';
  return 'storage';
}
