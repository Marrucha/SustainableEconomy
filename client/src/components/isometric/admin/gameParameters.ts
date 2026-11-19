export interface GameParametersConfig {
  // Hodowla — Rozród i Inseminacja
  inseminationSuccessFarmerPercent: number;
  inseminationSuccessVetPercent: number;
  horseRecoveryMonths: number;
  cattleRecoveryMonths: number;
  sheepRecoveryMonths: number;
  horseInseminationRetryWaitMonths: number;

  // Hodowla — Ciąża, Wzrost i Żywienie
  horseDailyFeedKg: number;
  horseWorkCapacityHa: number;
  horseGestationMonths: number;
  cattleGestationMonths: number;
  sheepGestationMonths: number;
  horseMaturityYears: number;
  cattleMaturityMonths: number;
  sheepMaturityMonths: number;
  horseMaxAgeYears: number;
  cattleMaxAgeYears: number;
  sheepMaxAgeYears: number;

  // Domyślne pojemności magazynowe
  manurePenCapacityKg: number;
  grainSiloBaseCapacityKg: number;
  strawStackBaseCapacityKg: number;
  manureBinBaseCapacityKg: number;
}

export const DEFAULT_GAME_PARAMETERS: GameParametersConfig = {
  inseminationSuccessFarmerPercent: 30,
  inseminationSuccessVetPercent: 50,
  horseRecoveryMonths: 3,
  cattleRecoveryMonths: 3,
  sheepRecoveryMonths: 2,
  horseInseminationRetryWaitMonths: 1,

  horseDailyFeedKg: 10,
  horseWorkCapacityHa: 0.5,
  horseGestationMonths: 11,
  cattleGestationMonths: 9,
  sheepGestationMonths: 5,
  horseMaturityYears: 3,
  cattleMaturityMonths: 24,
  sheepMaturityMonths: 15,
  horseMaxAgeYears: 15,
  cattleMaxAgeYears: 12,
  sheepMaxAgeYears: 10,

  manurePenCapacityKg: 1000,
  grainSiloBaseCapacityKg: 10000,
  strawStackBaseCapacityKg: 20000,
  manureBinBaseCapacityKg: 10000,
};

const STORAGE_KEY = 'sustainable_economy_admin_params_v1';

export function loadGameParameters(): GameParametersConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GAME_PARAMETERS };
    const parsed = JSON.parse(raw) as Partial<GameParametersConfig>;
    return { ...DEFAULT_GAME_PARAMETERS, ...parsed };
  } catch {
    return { ...DEFAULT_GAME_PARAMETERS };
  }
}

export function saveGameParameters(params: GameParametersConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetGameParameters(): GameParametersConfig {
  const fresh = { ...DEFAULT_GAME_PARAMETERS };
  saveGameParameters(fresh);
  return fresh;
}
