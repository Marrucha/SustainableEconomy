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
    crew: [
      {
        id: 'hop_merchant_1',
        name: 'Edward Thrale',
        profession: 'merchant',
        wageDaily: 2.8,
        avatar: '🎩',
      },
      {
        id: 'hop_farmer_1',
        name: 'Giles Goodenough',
        profession: 'farmer',
        wageDaily: 2.4,
        avatar: '👨‍🌾',
      },
    ],
    agronomist: {
      hired: true,
      name: 'Mistrz Barnaby Hopwood',
      title: 'Chmielarz z Hrabstwa Kent',
      wageDaily: 5.2,
      specialization: 'botany',
      yieldBonusPercent: 28,
      lossReductionPercent: 42,
    },
    variety: 'golding',
    stageAssignments: {
      rhizome_intake: 'hop_merchant_1',
      plowing_stringing: 'hop_farmer_1',
      training: 'hop_farmer_1',
      fertilizing: 'hop_farmer_1',
      stripping: 'hop_farmer_1',
      harvesting: 'hop_farmer_1',
      drying_selling: 'hop_merchant_1',
    },
    rhizomeSource: 'market',
    productDestination: 'sell_market',
    enableFertilizing: true,
    enableStripping: true,
    driedConesStockKg: 460,
    freshConesStockKg: 120,
    spentHopsStockKg: 280,
    fertilizerStockKg: 210,
    currentStage: 'rhizome_intake',
    stageProgress: 30,
    totalCyclesCompleted: 1,
    lastCycleRevenue: 156,
    lastCycleCost: 68,
    lastCycleConesKg: 490,
  };
}
