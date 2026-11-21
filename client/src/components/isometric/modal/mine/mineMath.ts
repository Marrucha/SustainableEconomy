import type { BuildingState } from '../../types';
import { MINE_DEPOSITS, type MineDepositInfo } from './mineTypes';
import type { MineCapitalismState, MineCycleStage } from './mineCapitalismTypes';

export interface MineYieldSummary {
  monthlyOreTons: number;
  dailyOreTons: number;
  qualityPercent: number;
  dailyPayrollCost: number;
  dailyEnergyCost: number;
  energyModeLabel: string;
  efficiencyMultiplier: number;
}

export function computeMineYieldSummary(
  mine: MineCapitalismState,
  buildingState: BuildingState,
  depositInfo?: MineDepositInfo
): MineYieldSummary {
  const dep =
    depositInfo ||
    (buildingState.mineDepositType ? MINE_DEPOSITS[buildingState.mineDepositType] : undefined) ||
    MINE_DEPOSITS.coal;

  const hasManager = mine.crew.some((c) => c.profession === 'manager');
  const energySource = buildingState.businessEnergySource || 'wegiel';
  const energyScale = buildingState.businessEnergyScale || 'standard';

  let energySpeedMult = 1.0;
  let dailyEnergyCost = 3.0;
  let energyModeLabel = 'Maszyna parowa (Węgiel)';

  if (energySource === 'konie') {
    const horses = buildingState.ownedHorses?.length ?? 0;
    energySpeedMult = horses >= 2 ? 0.85 : horses === 1 ? 0.65 : 0;
    dailyEnergyCost = horses * 0.8;
    energyModeLabel = `Kierat konny (${horses} szt.)`;
  } else {
    if (energyScale === 'eco') {
      energySpeedMult = 0.85;
      dailyEnergyCost = 2.0;
    } else if (energyScale === 'turbo') {
      energySpeedMult = 1.25;
      dailyEnergyCost = 4.8;
    } else {
      energySpeedMult = 1.0;
      dailyEnergyCost = 3.0;
    }
  }

  const managerBonus = hasManager ? 1.15 : 1.0;
  const efficiencyMultiplier = Number((energySpeedMult * managerBonus).toFixed(2));
  const monthlyOreTons = Math.round(dep.baseYieldPerCycle * efficiencyMultiplier);
  const dailyOreTons = Number((monthlyOreTons / 30).toFixed(1));

  let quality = 78;
  if (hasManager) quality += 8;
  if (mine.ventilationEnabled) quality += 10;
  if (energySource === 'wegiel') quality += 2;
  const qualityPercent = Math.min(100, quality);

  const dailyPayrollCost = mine.crew.reduce((sum, m) => sum + m.dailyWage, 0);

  return {
    monthlyOreTons,
    dailyOreTons,
    qualityPercent,
    dailyPayrollCost,
    dailyEnergyCost,
    energyModeLabel,
    efficiencyMultiplier,
  };
}

export function getMineStageForProgress(
  progressPercent: number,
  ventilationEnabled: boolean
): MineCycleStage {
  if (progressPercent < 14) return 'shaft_prep';
  if (progressPercent < 28) return 'drilling';
  if (ventilationEnabled && progressPercent < 42) return 'ventilation';
  if (progressPercent < 62) return 'extraction';
  if (progressPercent < 76) return 'hauling';
  if (progressPercent < 90) return 'sorting';
  return 'dispatch';
}
