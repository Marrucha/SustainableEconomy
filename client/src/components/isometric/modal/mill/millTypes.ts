import type { BuildingState } from '../../types';
import type { ContractType } from '../industryContracts';

export type MillProductTarget = 'maka_pszenna' | 'maka_zytnia' | 'kasza';

export type MillProfession = 'manager' | 'miller' | 'mill_assistant' | 'warehouseman' | 'merchant';

export type MillCycleStage =
  | 'grain_intake'
  | 'cleaning'
  | 'conditioning'
  | 'milling'
  | 'sifting'
  | 'packing_dispatch'
  | 'storage';

export interface MillCrewMember {
  id: string;
  name: string;
  profession: MillProfession;
  dailyWage: number; // £/dzień
}

export interface MillSupplyOrder {
  supplierId: string;
  monthlyKg: number;
  contractType: ContractType;
  monthsRemaining: number;
  startTotalMonths: number;
}

export interface MillAnnualYieldEntry {
  year: number;
  productTarget: MillProductTarget;
  flourKg: number;
  branKg: number;
}

export interface MillMonthlyFinanceEntry {
  year: number;
  month: number;
  revenue: number;
  grainCost: number;
  payrollCost: number;
  energyCost: number;
}

export interface MillCapitalismState {
  productTarget: MillProductTarget;
  crew: MillCrewMember[];
  workdayHours?: number;
  stageAssignments: Partial<Record<MillCycleStage, string[]>>;
  conditioningEnabled: boolean;
  currentStage: MillCycleStage;
  cycleProgressPercent: number; // 0..100
  isMillingActive: boolean;

  // Magazyny (kg)
  grainStockKg: number;
  grainCapacityKg: number;
  flourStockKg: number;
  flourCapacityKg: number;
  branStockKg: number;
  branCapacityKg: number;

  // Jakość i ceny (£/kg)
  flourQualityPercent: number;
  flourPricePerKg: number;
  branPricePerKg: number;

  // Kontrakty na dostawę ziarna z farm (wiele źródeł mieszanych w jednym koszu)
  grainOrder?: MillSupplyOrder;
  grainOrders?: MillSupplyOrder[];
  interventionBuyEnabled?: boolean;

  // Statystyki i finanse
  totalRevenue: number;
  totalExpenses: number;
  yearlyFlourKg: number;
  yearlyBranKg: number;
  lastTickDay?: number;
  lastTickMonth?: number;
  annualHistory: MillAnnualYieldEntry[];
  monthlyFinanceHistory: MillMonthlyFinanceEntry[];
}

export interface MillProfessionConfig {
  id: MillProfession;
  label: string;
  icon: string;
  defaultWage: number;
  minWage: number;
  maxWage: number;
  desc: string;
}

export const MILL_PROFESSIONS: Record<MillProfession, MillProfessionConfig> = {
  manager: {
    id: 'manager',
    label: 'Zarządca (Klasa M)',
    icon: '🎩',
    defaultWage: 6,
    minWage: 4,
    maxWage: 14,
    desc: 'Wymagany w każdej fabryce ≥ 2×1. Nadzoruje cały zakład, bilans i jakość przemiału (+15% wydajności, +8% jakości).',
  },
  miller: {
    id: 'miller',
    label: 'Młynarz',
    icon: '⚙️',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Specjalista obsługujący główny przemiał ziarna na walcach młyńskich.',
  },
  mill_assistant: {
    id: 'mill_assistant',
    label: 'Pomocnik Młynarza',
    icon: '🧰',
    defaultWage: 2,
    minWage: 1,
    maxWage: 6,
    desc: 'Wykonuje czyszczenie ziarna, kondycjonowanie, odsiew na pytlach oraz workowanie.',
  },
  warehouseman: {
    id: 'warehouseman',
    label: 'Magazynier',
    icon: '📦',
    defaultWage: 3,
    minWage: 2,
    maxWage: 7,
    desc: 'Odpowiada za składowanie worków z mąką i otrębami oraz wydawanie towaru z magazynu.',
  },
  merchant: {
    id: 'merchant',
    label: 'Kupiec',
    icon: '💼',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Realizuje zakup ziarna z farm zbożowych oraz obsługuje kontrakty handlowe.',
  },
};

export interface MillProductConfig {
  id: MillProductTarget;
  label: string;
  icon: string;
  requiredGrainLabel: string;
  requiredGrainGenitive: string;
  flourYieldRatio: number; // np. 0.78 kg mąki z 1 kg ziarna
  branYieldRatio: number;  // np. 0.20 kg otrąb z 1 kg ziarna
  defaultPricePerKg: number;
  desc: string;
}

export const MILL_PRODUCTS_CONFIG: Record<MillProductTarget, MillProductConfig> = {
  maka_pszenna: {
    id: 'maka_pszenna',
    label: 'Mąka Pszenna',
    icon: '🥖',
    requiredGrainLabel: 'Pszenica Złocista',
    requiredGrainGenitive: 'pszenicy złocistej',
    flourYieldRatio: 0.78,
    branYieldRatio: 0.20,
    defaultPricePerKg: 1.5,
    desc: 'Biała mąka piekarnicza wysokiego wymiału do piekarni i cukierni.',
  },
  maka_zytnia: {
    id: 'maka_zytnia',
    label: 'Mąka Żytnia',
    icon: '🍞',
    requiredGrainLabel: 'Żyto Ozime',
    requiredGrainGenitive: 'żyta ozimego',
    flourYieldRatio: 0.82,
    branYieldRatio: 0.16,
    defaultPricePerKg: 1.35,
    desc: 'Mąka chlebowa ciemna na zakwas i tradycyjny chleb wiejski.',
  },
  kasza: {
    id: 'kasza',
    label: 'Kasza i Płatki',
    icon: '🥣',
    requiredGrainLabel: 'Jęczmień Browarny',
    requiredGrainGenitive: 'jęczmienia browarnego',
    flourYieldRatio: 0.72,
    branYieldRatio: 0.24,
    defaultPricePerKg: 1.4,
    desc: 'Gruboziarnista kasza i płatki śniadaniowe o długiej trwałości.',
  },
};

export interface MillStageMeta {
  id: MillCycleStage;
  num: number;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  requiredProfessionLabel: string;
  allowedProfessions: MillProfession[];
  isOptional?: boolean;
}

export const MILL_STAGES_CONFIG: MillStageMeta[] = [
  {
    id: 'grain_intake',
    num: 1,
    label: 'Zakup Ziarna',
    shortLabel: 'Zakup',
    icon: '🛒',
    desc: 'Zakup oraz ważenie ziarna ze spichlerzy farm zbożowych do kosza zasypowego młyna.',
    requiredProfessionLabel: 'Kupiec',
    allowedProfessions: ['merchant'],
  },
  {
    id: 'cleaning',
    num: 2,
    label: 'Czyszczenie i Wialnia',
    shortLabel: 'Czyszczenie',
    icon: '🌬️',
    desc: 'Oddzielanie plew, pyłu i drobnych kamyków na sitach wialni przed przemiałem.',
    requiredProfessionLabel: 'Pomocnik Młynarza',
    allowedProfessions: ['mill_assistant'],
  },
  {
    id: 'conditioning',
    num: 3,
    label: 'Kondycjonowanie Ziarna',
    shortLabel: 'Kondycjonowanie',
    icon: '💧',
    desc: 'Opcjonalne kondycjonowanie parą/wodą zmiękcza okrywę owocową (+10% jakości mąki).',
    requiredProfessionLabel: 'Pomocnik Młynarza',
    allowedProfessions: ['mill_assistant'],
    isOptional: true,
  },
  {
    id: 'milling',
    num: 4,
    label: 'Przemiał na Walcach',
    shortLabel: 'Przemiał',
    icon: '⚙️',
    desc: 'Główny przemiał ziarna na żeliwnych walcach napędzanych kotłem parowym lub kieratem.',
    requiredProfessionLabel: 'Młynarz',
    allowedProfessions: ['miller'],
  },
  {
    id: 'sifting',
    num: 5,
    label: 'Odsiew na Pytlach',
    shortLabel: 'Odsiew',
    icon: '🧺',
    desc: 'Przesiewanie śruty przez jedwabne pytle — rozdział na mąkę gatunkową i otręby.',
    requiredProfessionLabel: 'Pomocnik Młynarza',
    allowedProfessions: ['mill_assistant'],
  },
  {
    id: 'packing_dispatch',
    num: 6,
    label: 'Workowanie Mąki i Otrąb',
    shortLabel: 'Workowanie',
    icon: '🛍️',
    desc: 'Pakowanie mąki oraz otrąb w worki 50 kg przed przekazaniem do magazynu.',
    requiredProfessionLabel: 'Pomocnik Młynarza',
    allowedProfessions: ['mill_assistant'],
  },
  {
    id: 'storage',
    num: 7,
    label: 'Magazynowanie i Wydawanie',
    shortLabel: 'Magazynowanie',
    icon: '📦',
    desc: 'Składowanie worków w suchym magazynie młyna oraz wydawanie towaru odbiorcom.',
    requiredProfessionLabel: 'Magazynier',
    allowedProfessions: ['warehouseman'],
  },
];

export const MILL_GRAIN_BASE_CAPACITY_KG = 10000;
export const MILL_FLOUR_BASE_CAPACITY_KG = 10000;
export const MILL_BRAN_BASE_CAPACITY_KG = 5000;

export function createDefaultMillState(): MillCapitalismState {
  return {
    productTarget: 'maka_pszenna',
    crew: [],
    stageAssignments: {},
    conditioningEnabled: true,
    currentStage: 'grain_intake',
    cycleProgressPercent: 0,
    isMillingActive: true,
    grainStockKg: 0,
    grainCapacityKg: MILL_GRAIN_BASE_CAPACITY_KG,
    flourStockKg: 0,
    flourCapacityKg: MILL_FLOUR_BASE_CAPACITY_KG,
    branStockKg: 0,
    branCapacityKg: MILL_BRAN_BASE_CAPACITY_KG,
    flourQualityPercent: 85,
    flourPricePerKg: 1.5,
    branPricePerKg: 0.45,
    totalRevenue: 0,
    totalExpenses: 0,
    yearlyFlourKg: 0,
    yearlyBranKg: 0,
    annualHistory: [],
    monthlyFinanceHistory: [],
  };
}

export function getMillGrainOrders(state: MillCapitalismState): MillSupplyOrder[] {
  if (Array.isArray(state.grainOrders)) return state.grainOrders;
  return state.grainOrder ? [state.grainOrder] : [];
}

export function getMillStageWorkerIds(
  state: MillCapitalismState,
  stage: MillCycleStage
): string[] {
  const assigned = state.stageAssignments?.[stage] || [];
  return assigned.filter((id) => state.crew.some((c) => c.id === id));
}

export function isMillWorkerAssignedAnywhere(
  state: MillCapitalismState,
  workerId: string
): boolean {
  return MILL_STAGES_CONFIG.some((s) =>
    (state.stageAssignments?.[s.id] || []).includes(workerId)
  );
}

export function canMillWorkerHandleStage(
  profession: MillProfession,
  stage: MillCycleStage
): boolean {
  const meta = MILL_STAGES_CONFIG.find((s) => s.id === stage);
  return meta ? meta.allowedProfessions.includes(profession) : false;
}

export function checkIsMillProductionReady(
  state: MillCapitalismState,
  buildingState: BuildingState,
  sizeTiles = 2
): { isReady: boolean; missingReasons: string[] } {
  const missingReasons: string[] = [];

  if (sizeTiles >= 2 && !state.crew.some((c) => c.profession === 'manager')) {
    missingReasons.push('Brak Zarządcy (wymagany dla fabryki ≥ 2×1)');
  }

  for (const stage of MILL_STAGES_CONFIG) {
    if (stage.isOptional) {
      if (stage.id === 'conditioning' && !state.conditioningEnabled) continue;
    }
    const workers = getMillStageWorkerIds(state, stage.id);
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

  if (state.grainStockKg <= 0) {
    missingReasons.push('Brak ziarna w koszu zasypowym');
  }

  return {
    isReady: missingReasons.length === 0,
    missingReasons,
  };
}
