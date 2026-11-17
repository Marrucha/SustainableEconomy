import type { BuildingState } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';

export type ContractType = 'pay_as_you_go' | 'contract_3y' | 'contract_5y' | 'contract_10y';

export interface ContractOptionMeta {
  id: ContractType;
  label: string;
  durationMonths: number;
  discountPercent: number;
  badge: string;
}

export const CONTRACT_OPTIONS: ContractOptionMeta[] = [
  { id: 'pay_as_you_go', label: 'PAY AS YOU GO', durationMonths: 0, discountPercent: 0, badge: 'Cena rynkowa (0%)' },
  { id: 'contract_3y', label: 'Kontrakt 3-letni', durationMonths: 36, discountPercent: 10, badge: '-10% zniżki' },
  { id: 'contract_5y', label: 'Kontrakt 5-letni', durationMonths: 60, discountPercent: 15, badge: '-15% zniżki' },
  { id: 'contract_10y', label: 'Kontrakt 10-letni', durationMonths: 120, discountPercent: 20, badge: '-20% zniżki' },
];

export const BASE_UNIT_MARKET_PRICE = 1.2; // £ / 1 jednostka produktu (bazowa cena rynkowa)
export const BASE_MONTHLY_UNITS_PER_WORKER = 1000;

export function getContractMeta(type?: ContractType): ContractOptionMeta {
  return CONTRACT_OPTIONS.find((c) => c.id === type) || CONTRACT_OPTIONS[0];
}

export function computeContractRemainingMonths(
  state: BuildingState,
  currentTotalMonths: number
): number {
  const meta = getContractMeta(state.merchantContractType);
  if (meta.durationMonths === 0 || !state.merchantContractStartTotalMonths) return 0;
  const elapsed = Math.max(0, currentTotalMonths - state.merchantContractStartTotalMonths);
  return Math.max(0, meta.durationMonths - elapsed);
}

/**
 * Zerwanie kontraktu kosztuje 20% jego wartości pozostałej do końca trwania kontraktu.
 */
export function computeContractBreakPenalty(
  state: BuildingState,
  supplierUnitPrice: number,
  currentTotalMonths: number
): number {
  const remainingMonths = computeContractRemainingMonths(state, currentTotalMonths);
  if (remainingMonths <= 0) return 0;
  const meta = getContractMeta(state.merchantContractType);
  const unitsPerMonth = state.merchantContractUnitsPerMonth ?? 1000;
  const discountedUnitPrice = supplierUnitPrice * (1 - meta.discountPercent / 100);
  const remainingValue = remainingMonths * unitsPerMonth * discountedUnitPrice;
  return Math.round(remainingValue * 0.2);
}

export function computeMonthlyProductionUnits(
  workersCount: number,
  totalProductionPercent: number,
  state: BuildingState
): number {
  if (workersCount <= 0) return 0;
  const expBonus = (state.workerExperienceYears ?? 0) * 1; // +1% za 1 rok pracy
  const schoolBonus = (state.workerSchoolCoursesCompleted ?? 0) * 10; // +10% za ukończony roczny kurs
  const skillMultiplier = 1 + (expBonus + schoolBonus) / 100;
  return Math.round(
    (totalProductionPercent / 100) * BASE_MONTHLY_UNITS_PER_WORKER * skillMultiplier
  );
}

export function computeContractedDemandForSupplier(
  supplierId: string,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): { totalContractedUnits: number; buyersCount: number } {
  let totalContractedUnits = 0;
  let buyersCount = 0;

  for (const b of allWorldBuildings) {
    const st = buildingsState[b.id];
    if (st?.merchantHired && st.merchantSupplierId === supplierId) {
      totalContractedUnits += st.merchantContractUnitsPerMonth ?? 1000;
      buyersCount += 1;
    }
  }
  return { totalContractedUnits, buyersCount };
}
