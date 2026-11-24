import type { FarmCrewMember, FarmAgronomist } from '../farmGridTypes';

export type HopCycleStage =
  | 'rhizome_intake'     // 1. Sztobry / Sadzonki (Kupiec / Magazyn)
  | 'plowing_stringing'  // 2. Orka, stawianie tyczek i olinowanie (Tyczkarz)
  | 'training'           // 3. Naprowadzanie pędów chmielu (Pielarz)
  | 'fertilizing'        // 4. Nawożenie potasowe (Nawoziciel - opcjonalne)
  | 'stripping'          // 5. Olistywanie dolne i pielenie (Pielarz - opcjonalne)
  | 'growing'            // 6. Dojrzewanie szyszek (Nadzór Mistrza Chmielarstwa)
  | 'harvesting'         // 7. Zbiór szyszek do koszy (Zbieracz)
  | 'drying_selling';    // 8. Suszenie w Oast House, prasowanie i zbyt do browarów

export type HopVariety = 'golding' | 'fuggle';

export interface HopVarietyInfo {
  id: HopVariety;
  name: string;
  icon: string;
  baseConeYield: number; // kg suchych szyszek
  pricePerTonCones: number; // £ / tona
  desc: string;
}

export const HOP_VARIETIES: Record<HopVariety, HopVarietyInfo> = {
  golding: {
    id: 'golding',
    name: 'East Kent Golding (Szlachetny Aromat)',
    icon: '🍺',
    baseConeYield: 440,
    pricePerTonCones: 270,
    desc: 'Złoty standard wiktoriańskiego piwowarstwa z Kent. Delikatny kwiatowo-korzenny bukiet na wykwintne Pale Ale.',
  },
  fuggle: {
    id: 'fuggle',
    name: 'Fuggle (Goryczkowo-Odporny)',
    icon: '🌿',
    baseConeYield: 620,
    pricePerTonCones: 195,
    desc: 'Odporny krzew obficie rodzący mięsiste szyszki. Głęboki, żywiczny aromat do tradycyjnego Portera i Stoutu.',
  },
};

export interface HopCapitalismState {
  workdayHours?: number;
  crew: FarmCrewMember[];
  agronomist: FarmAgronomist;
  variety: HopVariety;

  // Przypisanie pracowników do poszczególnych etapów
  stageAssignments: Partial<Record<HopCycleStage, string>>;

  // Opcje agrotechniczne 1880
  rhizomeSource: 'market' | 'storage';
  productDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean; // Opcjonalne nawożenie
  enableStripping: boolean;   // Opcjonalne dolne olistywanie (przewietrzanie pnączy)

  // Stany magazynowe chmielarskie
  driedConesStockKg: number; // Wysuszone szyszki z Oast House (kg)
  freshConesStockKg: number; // Świeże zielone szyszki (kg)
  spentHopsStockKg: number;  // Odpady chmielowe i łodygi (kg)
  fertilizerStockKg: number; // Nawóz potasowo-organiczny (kg)

  // Postęp cyklu produkcyjnego
  currentStage: HopCycleStage;
  stageProgress: number; // 0..100%
  totalCyclesCompleted: number;

  // Finanse i statystyki ostatniego cyklu
  lastCycleRevenue: number;
  lastCycleCost: number;
  lastCycleConesKg: number;
}

export const HOP_STAGE_LABELS: Record<HopCycleStage, { label: string; icon: string; role: string }> = {
  rhizome_intake: { label: '1. Sztobry i Pędy', icon: '🛒', role: 'Kupiec (Zaopatrzenie)' },
  plowing_stringing: { label: '2. Tyczkowanie i Orka', icon: '🪵', role: 'Rolnik jako Tyczkarz' },
  training: { label: '3. Prowadzenie Pędów', icon: '🌱', role: 'Rolnik jako Pielarz' },
  fertilizing: { label: '4. Nawożenie Potasem', icon: '🧪', role: 'Rolnik jako Nawoziciel' },
  stripping: { label: '5. Olistywanie Dolne', icon: '🌿', role: 'Rolnik jako Pielarz' },
  growing: { label: '6. Dojrzewanie Szyszek', icon: '🍃', role: 'Nadzór Chmielarza' },
  harvesting: { label: '7. Zbiór do Koszy', icon: '🧺', role: 'Rolnik jako Zbieracz' },
  drying_selling: { label: '8. Suszenie Oast i Zbyt', icon: '💰', role: 'Sprzedawca / Chmielarz' },
};

export function canHopWorkerHandleStage(worker: FarmCrewMember, stage: HopCycleStage): boolean {
  if (stage === 'growing') return true;

  if (stage === 'rhizome_intake' || stage === 'drying_selling') {
    return worker.profession === 'merchant' || worker.profession === 'all_rounder';
  }

  if (['plowing_stringing', 'training', 'fertilizing', 'stripping', 'harvesting'].includes(stage)) {
    return worker.profession === 'farmer' || worker.profession === 'all_rounder';
  }

  return false;
}

export function checkIsHopProductionReady(state: HopCapitalismState): {
  isReady: boolean;
  missingStages: { stage: HopCycleStage; label: string; requiredRole: string }[];
} {
  const missing: { stage: HopCycleStage; label: string; requiredRole: string }[] = [];

  const check = (stage: HopCycleStage, label: string, requiredRole: string) => {
    const workerId = state.stageAssignments[stage];
    const worker = workerId ? state.crew.find((w) => w.id === workerId) : null;
    if (!worker || !canHopWorkerHandleStage(worker, stage)) {
      missing.push({ stage, label, requiredRole });
    }
  };

  // Obowiązkowe etapy bazowe:
  check('rhizome_intake', '1. Sztobry', 'Kupiec / Sprzedawca');
  check('plowing_stringing', '2. Tyczkowanie', 'Rolnik');
  check('training', '3. Prowadzenie pędów', 'Rolnik');
  check('harvesting', '7. Zbiór szyszek', 'Rolnik');
  check('drying_selling', '8. Suszenie Oast i Zbyt', 'Kupiec / Sprzedawca');

  return {
    isReady: missing.length === 0,
    missingStages: missing,
  };
}

export function createDefaultHopState(): HopCapitalismState {
  return {
    crew: [],
    agronomist: {
      hired: false,
      name: 'Mistrz Barnaby Hopwood',
      title: 'Chmielarz z Hrabstwa Kent',
      wageDaily: 5.2,
      specialization: 'botany',
      yieldBonusPercent: 28,
      lossReductionPercent: 42,
    },
    variety: 'golding',
    stageAssignments: {},
    rhizomeSource: 'market',
    productDestination: 'sell_market',
    enableFertilizing: true,
    enableStripping: true,
    driedConesStockKg: 0,
    freshConesStockKg: 0,
    spentHopsStockKg: 0,
    fertilizerStockKg: 0,
    currentStage: 'rhizome_intake',
    stageProgress: 0,
    totalCyclesCompleted: 0,
    lastCycleRevenue: 0,
    lastCycleCost: 0,
    lastCycleConesKg: 0,
  };
}
