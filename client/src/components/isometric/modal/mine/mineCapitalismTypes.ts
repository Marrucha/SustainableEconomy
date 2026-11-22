import type { BuildingState } from '../../types';
import { MINE_DEPOSITS, type MineDepositType } from './mineTypes';

export type MineProfession =
  | 'manager'
  | 'miner'
  | 'miner_assistant'
  | 'warehouseman'
  | 'merchant';

export type MineCycleStage =
  | 'shaft_prep'
  | 'drilling'
  | 'ventilation'
  | 'extraction'
  | 'hauling'
  | 'sorting'
  | 'dispatch';

export interface MineCrewMember {
  id: string;
  name: string;
  profession: MineProfession;
  dailyWage: number; // £/dzień
}

export interface MineAnnualYieldEntry {
  year: number;
  depositType: MineDepositType;
  oreTons: number;
}

export interface MineMonthlyFinanceEntry {
  year: number;
  month: number;
  revenue: number;
  payrollCost: number;
  energyCost: number;
}

export interface MineCapitalismState {
  crew: MineCrewMember[];
  workdayHours?: number;
  stageAssignments: Partial<Record<MineCycleStage, string[]>>;
  ventilationEnabled: boolean;
  currentStage: MineCycleStage;
  cycleProgressPercent: number; // 0..100
  isMiningActive: boolean;

  // Magazyn hałdy (t) i cena (£/t)
  capacityTons: number;
  oreQualityPercent: number;
  pricePerTon: number;

  // Statystyki i finanse
  firstManagerSurname?: string;
  totalRevenue: number;
  totalExpenses: number;
  yearlyOreTons: number;
  annualHistory: MineAnnualYieldEntry[];
  monthlyFinanceHistory: MineMonthlyFinanceEntry[];
}

export interface MineProfessionConfig {
  id: MineProfession;
  label: string;
  icon: string;
  defaultWage: number;
  minWage: number;
  maxWage: number;
  desc: string;
}

export const MINE_PROFESSIONS: Record<MineProfession, MineProfessionConfig> = {
  manager: {
    id: 'manager',
    label: 'Zarządca / Sztygar (Klasa M)',
    icon: '🎩',
    defaultWage: 7,
    minWage: 4,
    maxWage: 16,
    desc: 'Wymagany w kopalniach ≥ 2×1. Nadzoruje bezpieczeństwo szybów, wydobycie i bilans (+15% urobku, +8% jakości).',
  },
  miner: {
    id: 'miner',
    label: 'Górnik Przodkowy',
    icon: '⛏️',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Specjalista od wiercenia, odstrzału i urabiania złoża w głębokich przodkach.',
  },
  miner_assistant: {
    id: 'miner_assistant',
    label: 'Pomocnik Górniczy',
    icon: '🧰',
    defaultWage: 2,
    minWage: 1,
    maxWage: 6,
    desc: 'Wzmacnia obudowę szybu, obsługuje pompy odwadniające, wentylację oraz wyciąg szybowy.',
  },
  warehouseman: {
    id: 'warehouseman',
    label: 'Sortowacz / Magazynier',
    icon: '🪨',
    defaultWage: 3,
    minWage: 2,
    maxWage: 7,
    desc: 'Sortuje urobek na rusztach nadszybia i zarządza zwałowaniem na hałdzie.',
  },
  merchant: {
    id: 'merchant',
    label: 'Sprzedawca',
    icon: '💼',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Realizuje sprzedaż urobku z hałdy oraz obsługuje kontrakty z hutami i fabrykami.',
  },
};

export interface MineStageMeta {
  id: MineCycleStage;
  num: number;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  requiredProfessionLabel: string;
  allowedProfessions: MineProfession[];
  isOptional?: boolean;
}

export const MINE_STAGES_CONFIG: MineStageMeta[] = [
  {
    id: 'shaft_prep',
    num: 1,
    label: 'Obudowa i Zjazd Szybem',
    shortLabel: 'Obudowa',
    icon: '🪜',
    desc: 'Zabezpieczenie stempli drewnianych w szybie i przygotowanie klatek zjazdowych.',
    requiredProfessionLabel: 'Pomocnik Górniczy',
    allowedProfessions: ['miner_assistant'],
  },
  {
    id: 'drilling',
    num: 2,
    label: 'Wiercenie i Odstrzał',
    shortLabel: 'Wiercenie',
    icon: '🧨',
    desc: 'Wiercenie otworów strzałowych w caliźnie i kontrolowany odstrzał prochem czarnym.',
    requiredProfessionLabel: 'Górnik Przodkowy',
    allowedProfessions: ['miner'],
  },
  {
    id: 'ventilation',
    num: 3,
    label: 'Wietrzenie i Odwadnianie',
    shortLabel: 'Wentylacja',
    icon: '💨',
    desc: 'Opcjonalne pompowanie wód gruntowych i tłoczenie świeżego powietrza (+10% jakości urobku).',
    requiredProfessionLabel: 'Pomocnik Górniczy',
    allowedProfessions: ['miner_assistant'],
    isOptional: true,
  },
  {
    id: 'extraction',
    num: 4,
    label: 'Urabianie Złoża',
    shortLabel: 'Urabianie',
    icon: '⛏️',
    desc: 'Główne wydobycie urobku kilofami i załadunek do wózków kopalnianych.',
    requiredProfessionLabel: 'Górnik Przodkowy',
    allowedProfessions: ['miner'],
  },
  {
    id: 'hauling',
    num: 5,
    label: 'Wyciąg Szybowy',
    shortLabel: 'Wyciąg',
    icon: '⛓️',
    desc: 'Transport wózków torowiskiem do podszybia i wyciąg linowy na powierzchnię.',
    requiredProfessionLabel: 'Pomocnik Górniczy',
    allowedProfessions: ['miner_assistant'],
  },
  {
    id: 'sorting',
    num: 6,
    label: 'Sortowanie na Nadszybiu',
    shortLabel: 'Sortowanie',
    icon: '🪨',
    desc: 'Oddzielanie skały płonnej na rusztach i kruszenie urobku do wymiaru handlowego.',
    requiredProfessionLabel: 'Sortowacz / Magazynier',
    allowedProfessions: ['warehouseman'],
  },
  {
    id: 'dispatch',
    num: 7,
    label: 'Hałda i Sprzedaż',
    shortLabel: 'Sprzedaż',
    icon: '📦',
    desc: 'Składowanie na hałdzie kopalnianej oraz sprzedaż i wydawanie partii wozom i kolejom.',
    requiredProfessionLabel: 'Sprzedawca',
    allowedProfessions: ['merchant'],
  },
];

export const MINE_BASE_CAPACITY_TONS = 6000;

export function createDefaultMineCapitalismState(
  depositType?: MineDepositType
): MineCapitalismState {
  const dep = depositType ? MINE_DEPOSITS[depositType] : undefined;
  return {
    crew: [],
    stageAssignments: {},
    ventilationEnabled: true,
    currentStage: 'shaft_prep',
    cycleProgressPercent: 0,
    isMiningActive: true,
    capacityTons: MINE_BASE_CAPACITY_TONS,
    oreQualityPercent: 0,
    pricePerTon: dep?.basePricePerTon ?? 12,
    totalRevenue: 0,
    totalExpenses: 0,
    yearlyOreTons: 0,
    annualHistory: [],
    monthlyFinanceHistory: [],
  };
}

export function getMineStageWorkerIds(
  state: MineCapitalismState,
  stage: MineCycleStage
): string[] {
  const assigned = state.stageAssignments?.[stage] || [];
  return assigned.filter((id) => state.crew.some((c) => c.id === id));
}

export function isMineWorkerAssignedAnywhere(
  state: MineCapitalismState,
  workerId: string
): boolean {
  return MINE_STAGES_CONFIG.some((s) =>
    (state.stageAssignments?.[s.id] || []).includes(workerId)
  );
}

export function canMineWorkerHandleStage(
  profession: MineProfession,
  stage: MineCycleStage
): boolean {
  const meta = MINE_STAGES_CONFIG.find((s) => s.id === stage);
  return meta ? meta.allowedProfessions.includes(profession) : false;
}

export function checkIsMineProductionReady(
  state: MineCapitalismState,
  buildingState: BuildingState,
  _sizeTiles = 2
): { isReady: boolean; missingReasons: string[] } {
  const missingReasons: string[] = [];

  if (!buildingState.mineDepositType || !MINE_DEPOSITS[buildingState.mineDepositType]) {
    missingReasons.push('Nie wybrano złoża kopalni');
  }

  if (!state.crew.some((c) => c.profession === 'manager')) {
    missingReasons.push('Brak Zarządcy / Sztygara (Klasa M)');
  }

  for (const stage of MINE_STAGES_CONFIG) {
    if (stage.isOptional && stage.id === 'ventilation' && !state.ventilationEnabled) {
      continue;
    }
    const workers = getMineStageWorkerIds(state, stage.id);
    if (workers.length === 0) {
      missingReasons.push(`Brak obsady: ${stage.shortLabel}`);
    }
  }

  const energySource = buildingState.businessEnergySource;
  if (!energySource) {
    missingReasons.push('Brak wybranego źródła energii w zakładce ⚡ Energia');
  } else if (energySource === 'konie' && (buildingState.ownedHorses?.length ?? 0) < 1) {
    missingReasons.push('Brak koni roboczych w zakładce ⚡ Energia');
  } else if (
    energySource === 'konie' &&
    (buildingState.horseFeedStockKg ?? 0) <= 0 &&
    !buildingState.horseFeedOrder
  ) {
    missingReasons.push('Brak rezerwy paszy lub kontraktu na paszę dla koni w zakładce ⚡ Energia');
  } else if (energySource === 'wegiel' && (buildingState.coalStockTons ?? 0) <= 0) {
    missingReasons.push('Brak węgla w zakładce ⚡ Energia');
  }

  return {
    isReady: missingReasons.length === 0,
    missingReasons,
  };
}
