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

export interface FarmCrewMember {
  id: string;
  name: string;
  profession: WorkerProfession;
  wageDaily: number; // £ / dzień
  avatar: string;    // np. '👨‍🌾', '🧔', '🧑‍🌾'
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
    baseYield: 650,
    marketPricePerTon: 110,
    desc: 'Najbardziej poszukiwane ziarno na białą mąkę chlebową w miastach 1880 r.',
  },
  zyto: {
    id: 'zyto',
    name: 'Żyto Ozime',
    icon: '🌿',
    baseYield: 750,
    marketPricePerTon: 95,
    desc: 'Odporne na chłody i ubogie gleby, doskonałe na chleb razowy.',
  },
  owies: {
    id: 'owies',
    name: 'Owies Koński',
    icon: '🌱',
    baseYield: 800,
    marketPricePerTon: 85,
    desc: 'Kluczowe ziarno paszowe dla miejskich koni roboczych i dorożek.',
  },
  jeczmien: {
    id: 'jeczmien',
    name: 'Jęczmień Browarny',
    icon: '🌾',
    baseYield: 600,
    marketPricePerTon: 130,
    desc: 'Cenne ziarno słodowe dla miejskich browarów i gorzelni.',
  },
};

export interface FarmCapitalismState {
  crew: FarmCrewMember[];
  agronomist: FarmAgronomist;
  cropType: CropType;

  // Przypisanie pracowników do poszczególnych etapów w wężu
  stageAssignments: Partial<Record<FarmCycleStage, string>>;

  // Opcje agrotechniczne 1880
  seedSource: 'market' | 'storage';
  wheatDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean; // Opcjonalne nawożenie obornikiem
  enableWeeding: boolean;      // Opcjonalne ręczne pielenie motyką

  // Stany magazynowe w podziale na graficzne komory (przegródki)
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

  // Finanse i statystyki ostatniego cyklu
  lastCycleRevenue: number;
  lastCycleCost: number;
  lastCycleYieldKg: number;
}

// Sprawdzenie, czy pracownik o danym zawodzie może realizować dany krok
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
export function checkIsProductionReady(state: FarmCapitalismState): {
  isReady: boolean;
  missingStages: { stage: FarmCycleStage; label: string; requiredRole: string }[];
} {
  const missing: { stage: FarmCycleStage; label: string; requiredRole: string }[] = [];

  const check = (stage: FarmCycleStage, label: string, requiredRole: string) => {
    const workerId = state.stageAssignments[stage];
    const worker = workerId ? state.crew.find((w) => w.id === workerId) : null;
    if (!worker || !canWorkerHandleStage(worker, stage)) {
      missing.push({ stage, label, requiredRole });
    }
  };

  // 1. Obowiązkowe etapy bazowe cyklu produkcji zboża:
  check('seed_intake', '1. Nasiona', 'Kupiec / Sprzedawca');
  check('plowing', '2. Orka', 'Rolnik');
  check('sowing', '3. Zasiew', 'Rolnik');
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
    hired: true,
    name: 'Dr. Alistair Vance',
    title: 'Agronom Królewskiego Towarzystwa Rolniczego',
    wageDaily: 5.5,
    specialization: 'norfolk',
    yieldBonusPercent: 25,
    lossReductionPercent: 50,
  };
}

export function createDefaultFarmCapitalismState(): FarmCapitalismState {
  const defaultCrew = createDefaultCrew();
  return {
    crew: defaultCrew,
    agronomist: createDefaultAgronomist(),
    cropType: 'pszenica',
    stageAssignments: {
      seed_intake: 'crew_merchant_1',   // Thomas Finch jako Kupiec
      plowing: 'crew_farmer_1',         // Edward Croft jako Oracz
      sowing: 'crew_farmer_1',          // Edward Croft jako Siewca
      fertilizing: 'crew_farmer_1',     // Edward Croft jako Nawoziciel
      weeding: 'crew_farmer_1',         // Edward Croft jako Pielarz / Opryskiwacz
      harvesting: 'crew_farmer_1',      // Edward Croft jako Żniwiarz
      storing_selling: 'crew_merchant_1', // Thomas Finch jako Sprzedawca
    },
    seedSource: 'market',
    wheatDestination: 'sell_market',
    enableFertilizing: true,
    enableWeeding: true,
    grainStockKg: {
      pszenica: 450,
      zyto: 120,
      owies: 80,
      jeczmien: 0,
    },
    manureStockKg: 250,
    strawStockKg: 600,
    seedsStockKg: 200,
    fertilizerStockKg: 250,
    wheatStockKg: 450,
    currentStage: 'seed_intake',
    stageProgress: 30,
    totalCyclesCompleted: 2,
    lastCycleRevenue: 135,
    lastCycleCost: 68,
    lastCycleYieldKg: 1120,
  };
}
