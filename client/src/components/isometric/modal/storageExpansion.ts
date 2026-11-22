export const STORAGE_UPGRADE_STEP_KG = 5000;
export const STORAGE_UPGRADE_COST_GBP = 150;

export const BASE_MILL_GRAIN_CAP_KG = 10000;
export const BASE_MILL_FLOUR_CAP_KG = 10000;
export const BASE_MILL_BRAN_CAP_KG = 5000;

export const BASE_BAKERY_BREAD_CAP_KG = 5000;
export const BASE_BAKERY_RUSKS_CAP_KG = 2000;

/**
 * Koszt przechowywania w dodatkowym magazynie: 1p (£0.01) za dzień za każde 10 kg ponad pojemność bazową.
 * Magazyn bazowy jest całkowicie darmowy.
 */
export function computeExtraStorageDailyCostGbp(
  currentStockKg: number,
  baseCapacityKg: number
): number {
  const extraKg = Math.max(0, currentStockKg - baseCapacityKg);
  if (extraKg <= 0) return 0;
  return Number(((extraKg / 10) * 0.01).toFixed(3));
}
