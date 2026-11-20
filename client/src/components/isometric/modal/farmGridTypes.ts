// ============================================================================
// FARM CAPITALISM & 1880 AGROTECHNICAL PRODUCTION SYSTEM
// ============================================================================

export type WorkerProfession = 'farmer' | 'merchant' | 'all_rounder';

export const PROFESSION_LABELS: Record<WorkerProfession, { label: string; icon: string; desc: string }> = {
  farmer: {
    label: 'Rolnik Polowy',
    icon: '🌾',
    desc: 'Wciela się w role: Oracz, Siewca, Nawoziciel, Pielacz/Opryskiwacz, Żniwiarz na poszczególnych etapach cyklu',
  },
  merchant: {
    label: 'Kupiec / Sprzedawca',
    icon: '💰',
    desc: 'Wciela się w role: Kupiec nasion (zaopatrzenie) oraz Sprzedawca ziarna na rynku miejskim / obsługa silosu',
  },
  all_rounder: {
    label: 'Gospodarz Wszechstronny',
    icon: '⭐',
    desc: 'Samodzielny gospodarz potrafiący obsłużyć zarówno prace polowe, jak i handel na targu miejskim',
  },
};

export type FarmCycleStage =
  | 'seed_intake'       // 1. Nasiona (Kupiec / Magazyn)
  | 'plowing'           // 2. Orka (Rolnik jako Oracz)
  | 'sowing'            // 3. Zasiew (Rolnik jako Siewca)
  | 'fertilizing'       // 4. Nawożenie (Rolnik jako Nawoziciel - opcjonalne)
  | 'weeding'           // 5. Pielenie / Oprysk (Rolnik jako Pielacz/Opryskiwacz - opcjonalne)
  | 'growing'           // 6. Dojrzewanie (Nadzór Agronoma)
  | 'harvesting'        // 7. Żniwa (Rolnik jako Żniwiarz)
  | 'storing_selling';  // 8. Zbyt / Silos (Kupiec jako Sprzedawca)

export const GRAIN_SILO_BASE_CAPACITY_KG = 10000; // 10 ton bazowej pojemności spichlerza
export const GRAIN_SILO_MAX_LEVEL = 4; // Maksymalnie 40 ton (4 poziomy po 10 ton)
export const STRAW_STACK_BASE_CAPACITY_KG = 20000; // 20 ton bazowej pojemności stogu słomy

export function getGrainSiloCapacityKg(siloLevel = 1): number {
  const lvl = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, siloLevel));
  return lvl * GRAIN_SILO_BASE_CAPACITY_KG;
}

export function getStrawStackCapacityKg(strawLevel = 1): number {
  const lvl = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, strawLevel));
  return lvl * STRAW_STACK_BASE_CAPACITY_KG;
}

export function getManureBinCapacityKg(manureLevel = 1): number {
  const lvl = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, manureLevel));
  return lvl * GRAIN_SILO_BASE_CAPACITY_KG;
}

export function getGrainSiloDailyCostPence(siloLevel = 1): number {
  const lvl = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, siloLevel));
  return 1 + (lvl - 1) * 0.5;
}

export function getGrainSiloUpgradeCostGbp(currentLevel = 1): number {
  return 150 + Math.max(0, currentLevel - 1) * 100;
}

export interface FarmCrewMember {
  id: string;
  name: string;
  profession: WorkerProfession;
  wageDaily: number; // £ / dzień
  avatar: string;    // np. '👨‍🌾', '🧔', '🧑‍🌾'
  skillBonusPercent?: number; // 0..10% premii do plonów za doświadczenie rolnika
}

export interface FarmAgronomist {
  hired: boolean;
  name: string;
  title: string;
  wageDaily: number;          // £ / dzień (Klasa M)
  specialization: 'norfolk' | 'soil_chemistry' | 'botany';
  yieldBonusPercent: number;  // np. +25%
  lossReductionPercent: number; // np. 50%
}

export type CropType = 'pszenica' | 'zyto' | 'owies' | 'jeczmien';

export type FarmWeatherType = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy';

export interface CropInfo {
  id: CropType;
  name: string;
  icon: string;
  baseYield: number; // kg
  marketPricePerTon: number; // £ / tona
  desc: string;
}

export const CROPS_CONFIG: Record<CropType, CropInfo> = {
  pszenica: {
    id: 'pszenica',
    name: 'Pszenica Złocista',
    icon: '🌾',
    baseYield: 3000,
    marketPricePerTon: 110,
    desc: 'Najbardziej poszukiwane ziarno na białą mąkę chlebową w miastach 1880 r. (ok. 3 t/ha przy 300 kg siewu).',
  },
  zyto: {
    id: 'zyto',
    name: 'Żyto Ozime',
    icon: '🌿',
    baseYield: 3600,
    marketPricePerTon: 95,
    desc: 'Odporne na chłody i ubogie gleby, doskonałe na chleb razowy.',
  },
  owies: {
    id: 'owies',
    name: 'Owies Koński',
    icon: '🌱',
    baseYield: 3800,
    marketPricePerTon: 85,
    desc: 'Kluczowe ziarno paszowe dla miejskich koni roboczych i dorożek.',
  },
  jeczmien: {
    id: 'jeczmien',
    name: 'Jęczmień Browarny',
    icon: '🌾',
    baseYield: 3500,
    marketPricePerTon: 130,
    desc: 'Cenne ziarno słodowe dla miejskich browarów i gorzelni.',
  },
};

export type FertilizingLevel = 0 | 50 | 100;

export interface FarmCapitalismState {
  crew: FarmCrewMember[];
  agronomist: FarmAgronomist;
  cropType: CropType;

  // Przypisanie pracowników do poszczególnych etapów w wężu (wielu pracowników na etap)
  stageAssignments: Partial<Record<FarmCycleStage, string | string[]>>;

  // Opcje agrotechniczne 1880
  seedSource: 'market' | 'storage';
  wheatDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean; // Opcjonalne nawożenie obornikiem
  fertilizingLevel?: FertilizingLevel; // 0%, 50% (+20% plonu) lub 100% (+30% plonu)
  enableWeeding: boolean;      // Opcjonalne ręczne pielenie motyką
  growingWeather?: FarmWeatherType;
  harvestWeather?: FarmWeatherType;
  enableIrrigation?: boolean;  // Opcjonalne nawadnianie pól (+10% plonu)

  // Stany magazynowe w podziale na graficzne komory (przegródki)
  siloLevel?: number;                    // Poziom rozbudowy spichlerza (1..4 => 10..40 ton)
  strawLevel?: number;                   // Poziom rozbudowy stogu słomy (1..4 => 20..80 ton)
  manureLevel?: number;                  // Poziom rozbudowy zasieku obornika (1..4 => 10..40 ton)
  grainQualityPercent?: number;          // Jakość składowanego ziarna (0..100%, spadek 1% miesięcznie)
  grainBrandLevel?: number;              // Marka ziarna (na start 0)
  grainSalePricePerTon?: number;         // Cena wystawienia ziarna do sprzedaży (£/t)
  manureQualityPercent?: number;         // Jakość obornika (0..100%)
  manureBrandLevel?: number;             // Marka obornika (na start 0)
  manurePricePer100Kg?: number;          // Cena obornika (£ / 100 kg)
  strawQualityPercent?: number;          // Jakość słomy (0..100%)
  strawBrandLevel?: number;              // Marka słomy (na start 0)
  strawPricePerTon?: number;             // Cena słomy (£/t)
  grainStockKg: Record<CropType, number>; // Pszenica, Żyto, Owies, Jęczmień
  manureStockKg: number;                 // Nawóz: Obornik z fermy zwierzęcej (kg)
  seedsStockKg: number;                  // Zapas nasion na siew (kg)
  strawStockKg: number;                  // Magazyn słomy ze żniw (ściółka dla ferm zwierzęcych - kg)

  // Pola wstecznej kompatybilności
  fertilizerStockKg: number;
  wheatStockKg: number;

  // Postęp cyklu wegetacyjnego
  currentStage: FarmCycleStage;
  stageProgress: number; // 0..100%
  totalCyclesCompleted: number;
  lastHarvestYear?: number;
  manureShortageWarning?: string;
  manureOrder?: FarmManureContract;

  // Finanse i statystyki ostatniego cyklu
  lastCycleRevenue: number;
  lastCycleCost: number;
  lastCycleYieldKg: number;
}

import type { ContractType } from './industryContracts';

export interface FarmManureContract {
  supplierId: string;
  monthlyQuantityKg: number;
  contractType: ContractType;
  monthsRemaining: number;
}
export function canWorkerHandleStage(worker: FarmCrewMember, stage: FarmCycleStage): boolean {
  if (stage === 'growing') return true;

  // Handel i zaopatrzenie
  if (stage === 'seed_intake' || stage === 'storing_selling') {
    return worker.profession === 'merchant' || worker.profession === 'all_rounder';
  }

  // Wszelkie prace rolne w polu
  if (['plowing', 'sowing', 'fertilizing', 'weeding', 'harvesting'].includes(stage)) {
    return worker.profession === 'farmer' || worker.profession === 'all_rounder';
  }

  return false;
}

// Zwraca rolę, w którą wciela się rolnik / handlowiec na danym etapie
export function getWorkerStageRoleTitle(stage: FarmCycleStage): string {
  switch (stage) {
    case 'seed_intake':
      return 'Kupiec (Zakup nasion)';
    case 'plowing':
      return 'Rolnik jako Oracz';
    case 'sowing':
      return 'Rolnik jako Siewca';
    case 'fertilizing':
      return 'Rolnik jako Nawoziciel';
    case 'weeding':
      return 'Rolnik jako Pielarz / Opryskiwacz';
    case 'growing':
      return 'Nadzór Agronomiczny';
    case 'harvesting':
      return 'Rolnik jako Żniwiarz';
    case 'storing_selling':
      return 'Sprzedawca Ziarna';
    default:
      return 'Pracownik';
  }
}

// Sprawdzenie gotowości produkcji (czerwona vs zielona linia)
// UWAGA: Etapy opcjonalne (Nawożenie, Pielenie/Oprysk) NIGDY nie blokują produkcji!
export function getStageAssignedWorkerIds(
  stageAssignments: Partial<Record<FarmCycleStage, string | string[]>> | undefined,
  stage: FarmCycleStage
): string[] {
  const val = stageAssignments?.[stage];
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export function checkIsProductionReady(
  state: FarmCapitalismState,
  ownedHorsesCount?: number
): {
  isReady: boolean;
  missingStages: { stage: FarmCycleStage; label: string; requiredRole: string }[];
} {
  const missing: { stage: FarmCycleStage; label: string; requiredRole: string }[] = [];

  if (typeof ownedHorsesCount === 'number' && ownedHorsesCount < 1) {
    missing.push({
      stage: 'plowing',
      label: 'Energia (min. 1 koń pociągowy)',
      requiredRole: 'Zakup konia w zakładce Energia',
    });
  }

  const check = (stage: FarmCycleStage, label: string, requiredRole: string) => {
    const workerIds = getStageAssignedWorkerIds(state.stageAssignments, stage);
    const hasValidWorker = workerIds.some((id) => {
      const worker = state.crew.find((w) => w.id === id);
      return Boolean(worker && canWorkerHandleStage(worker, stage));
    });
    if (!hasValidWorker) {
      missing.push({ stage, label, requiredRole });
    }
  };

  // 1. Obowiązkowe etapy bazowe cyklu produkcji zboża:
  check('seed_intake', '1. Nasiona', 'Kupiec / Sprzedawca');
  check('plowing', '3. Orka', 'Rolnik');
  check('sowing', '4. Zasiew', 'Rolnik');
  // 4. Nawożenie i 5. Pielenie/Oprysk są agrotechnicznymi opcjami bonusowymi — nie blokują cyklu!
  check('harvesting', '7. Żniwa', 'Rolnik');
  check('storing_selling', '8. Zbyt/Silos', 'Kupiec / Sprzedawca');

  return {
    isReady: missing.length === 0,
    missingStages: missing,
  };
}

// Domyślny startowy skład załogi: 1 Kupiec/Sprzedawca, 1 Rolnik Polowy (wcielający się we wszystkie role polowe)
export function createDefaultCrew(): FarmCrewMember[] {
  return [
    {
      id: 'crew_merchant_1',
      name: 'Thomas Finch',
      profession: 'merchant',
      wageDaily: 2.5,
      avatar: '🎩',
    },
    {
      id: 'crew_farmer_1',
      name: 'Edward Croft',
      profession: 'farmer',
      wageDaily: 2.2,
      avatar: '👨‍🌾',
    },
  ];
}

export function createDefaultAgronomist(): FarmAgronomist {
  return {
    hired: false,
    name: 'Dr. Alistair Vance',
    title: 'Agronom Królewskiego Towarzystwa Rolniczego',
    wageDaily: 5.5,
    specialization: 'norfolk',
    yieldBonusPercent: 20,
    lossReductionPercent: 50,
  };
}

export function createDefaultFarmCapitalismState(): FarmCapitalismState {
  return {
    crew: [],
    agronomist: createDefaultAgronomist(),
    cropType: 'pszenica',
    stageAssignments: {},
    seedSource: 'market',
    wheatDestination: 'store_silo',
    enableFertilizing: true,
    fertilizingLevel: 100,
    enableWeeding: true,
    enableIrrigation: false,
    grainStockKg: {
      pszenica: 3000,
      zyto: 0,
      owies: 0,
      jeczmien: 0,
    },
    manureStockKg: 250,
    strawStockKg: 600,
    seedsStockKg: 200,
    fertilizerStockKg: 250,
    wheatStockKg: 3000,
    currentStage: 'seed_intake',
    stageProgress: 30,
    totalCyclesCompleted: 2,
    lastCycleRevenue: 135,
    lastCycleCost: 68,
    lastCycleYieldKg: 1120,
  };
}
