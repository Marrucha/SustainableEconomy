import type { FarmCrewMember, FarmAgronomist } from '../farmGridTypes';

export type FlaxCycleStage =
  | 'seed_intake'         // 1. Nasiona / Siemię (Kupiec / Magazyn)
  | 'plowing'             // 2. Orka i kultywacja (Rolnik jako Oracz)
  | 'sowing'              // 3. Zasiew lnu (Rolnik jako Siewca)
  | 'fertilizing'         // 4. Nawożenie (Rolnik jako Nawoziciel - opcjonalne)
  | 'weeding'             // 5. Pielenie łanu (Rolnik jako Pielacz - opcjonalne)
  | 'growing'             // 6. Kwitnienie na błękitno i dojrzewanie (Nadzór Mistrza Lniarstwa)
  | 'harvesting'          // 7. Rwanie lnu z korzeniami (Rolnik jako Rwacz/Żniwiarz)
  | 'processing_selling'; // 8. Roszenie, międlenie, czesanie i zbyt (Kupiec / Przetwórca)

export type FlaxVariety = 'wloknisty' | 'oleisty';

export interface FlaxVarietyInfo {
  id: FlaxVariety;
  name: string;
  icon: string;
  baseFiberYield: number;   // kg włókna
  baseLinseedYield: number; // kg siemienia lnianego
  pricePerTonFiber: number; // £ / tona włókna
  pricePerTonLinseed: number; // £ / tona siemienia
  desc: string;
}

export const FLAX_VARIETIES: Record<FlaxVariety, FlaxVarietyInfo> = {
  wloknisty: {
    id: 'wloknisty',
    name: 'Len Długowłóknisty (Wiktoriański Błękit)',
    icon: '🧵',
    baseFiberYield: 480,
    baseLinseedYield: 220,
    pricePerTonFiber: 180,
    pricePerTonLinseed: 110,
    desc: 'Wysokie, smukłe rośliny dające najdelikatniejsze długie włókna czesane na luksusowe tkaniny i batyst.',
  },
  oleisty: {
    id: 'oleisty',
    name: 'Len Oleisty (Bursztynowe Ziarno)',
    icon: '🌰',
    baseFiberYield: 240,
    baseLinseedYield: 560,
    pricePerTonFiber: 120,
    pricePerTonLinseed: 135,
    desc: 'Rozkrzewione odmiany obficie zawiązujące torebki nasienne. Surowiec na olej lniany, pokost i paszę.',
  },
};

export interface FlaxCapitalismState {
  crew: FarmCrewMember[];
  agronomist: FarmAgronomist;
  variety: FlaxVariety;

  // Przypisanie pracowników do poszczególnych etapów
  stageAssignments: Partial<Record<FlaxCycleStage, string>>;

  // Opcje agrotechniczne 1880
  seedSource: 'market' | 'storage';
  productDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean; // Opcjonalne nawożenie
  enableWeeding: boolean;     // Opcjonalne ręczne pielenie (usuwa chwasty z włókien)

  // Stany magazynowe lniarskie
  fiberStockKg: number;    // Długie włókno lniane (kg)
  linseedStockKg: number;  // Siemię lniane (kg)
  towStockKg: number;      // Pakuły, krótkie włókno i paździerze (kg)
  manureStockKg: number;   // Zapas nawozu (kg)

  // Postęp cyklu produkcyjnego
  currentStage: FlaxCycleStage;
  stageProgress: number; // 0..100%
  totalCyclesCompleted: number;

  // Finanse i statystyki ostatniego cyklu
  lastCycleRevenue: number;
  lastCycleCost: number;
  lastCycleFiberKg: number;
  lastCycleLinseedKg: number;
}

export const FLAX_STAGE_LABELS: Record<FlaxCycleStage, { label: string; icon: string; role: string }> = {
  seed_intake: { label: '1. Nasiona / Siemię', icon: '🛒', role: 'Kupiec (Zaopatrzenie)' },
  plowing: { label: '2. Orka i Bronowanie', icon: '🚜', role: 'Rolnik jako Oracz' },
  sowing: { label: '3. Zasiew Gęsty', icon: '🌱', role: 'Rolnik jako Siewca' },
  fertilizing: { label: '4. Nawożenie Potasowe', icon: '🧪', role: 'Rolnik jako Nawoziciel' },
  weeding: { label: '5. Pielenie Łanu', icon: '🌿', role: 'Rolnik jako Pielarz' },
  growing: { label: '6. Kwitnienie Błękitne', icon: '🌸', role: 'Nadzór Mistrza Lniarstwa' },
  harvesting: { label: '7. Rwanie z Korzeniami', icon: '🚜', role: 'Rolnik jako Rwacz Lnu' },
  processing_selling: { label: '8. Roszenie i Czesanie', icon: '💰', role: 'Sprzedawca / Przetwórca' },
};

export function canFlaxWorkerHandleStage(worker: FarmCrewMember, stage: FlaxCycleStage): boolean {
  if (stage === 'growing') return true;

  if (stage === 'seed_intake' || stage === 'processing_selling') {
    return worker.profession === 'merchant' || worker.profession === 'all_rounder';
  }

  if (['plowing', 'sowing', 'fertilizing', 'weeding', 'harvesting'].includes(stage)) {
    return worker.profession === 'farmer' || worker.profession === 'all_rounder';
  }

  return false;
}

export function checkIsFlaxProductionReady(state: FlaxCapitalismState): {
  isReady: boolean;
  missingStages: { stage: FlaxCycleStage; label: string; requiredRole: string }[];
} {
  const missing: { stage: FlaxCycleStage; label: string; requiredRole: string }[] = [];

  const check = (stage: FlaxCycleStage, label: string, requiredRole: string) => {
    const workerId = state.stageAssignments[stage];
    const worker = workerId ? state.crew.find((w) => w.id === workerId) : null;
    if (!worker || !canFlaxWorkerHandleStage(worker, stage)) {
      missing.push({ stage, label, requiredRole });
    }
  };

  // Obowiązkowe etapy bazowe:
  check('seed_intake', '1. Nasiona', 'Kupiec / Sprzedawca');
  check('plowing', '2. Orka', 'Rolnik');
  check('sowing', '3. Zasiew', 'Rolnik');
  check('harvesting', '7. Rwanie lnu', 'Rolnik');
  check('processing_selling', '8. Roszenie i Zbyt', 'Kupiec / Sprzedawca');

  return {
    isReady: missing.length === 0,
    missingStages: missing,
  };
}

export function createDefaultFlaxState(): FlaxCapitalismState {
  return {
    crew: [
      {
        id: 'flax_merchant_1',
        name: 'Arthur Weaver',
        profession: 'merchant',
        wageDaily: 2.6,
        avatar: '🎩',
      },
      {
        id: 'flax_farmer_1',
        name: 'Silas Vance',
        profession: 'farmer',
        wageDaily: 2.3,
        avatar: '👨‍🌾',
      },
    ],
    agronomist: {
      hired: true,
      name: 'Mistrz Alistair Bloom',
      title: 'Technolog Lniarstwa z Leeds',
      wageDaily: 5.0,
      specialization: 'botany',
      yieldBonusPercent: 25,
      lossReductionPercent: 45,
    },
    variety: 'wloknisty',
    stageAssignments: {
      seed_intake: 'flax_merchant_1',
      plowing: 'flax_farmer_1',
      sowing: 'flax_farmer_1',
      fertilizing: 'flax_farmer_1',
      weeding: 'flax_farmer_1',
      harvesting: 'flax_farmer_1',
      processing_selling: 'flax_merchant_1',
    },
    seedSource: 'market',
    productDestination: 'sell_market',
    enableFertilizing: true,
    enableWeeding: true,
    fiberStockKg: 380,
    linseedStockKg: 160,
    towStockKg: 220,
    manureStockKg: 180,
    currentStage: 'seed_intake',
    stageProgress: 25,
    totalCyclesCompleted: 1,
    lastCycleRevenue: 142,
    lastCycleCost: 65,
    lastCycleFiberKg: 520,
    lastCycleLinseedKg: 240,
  };
}
