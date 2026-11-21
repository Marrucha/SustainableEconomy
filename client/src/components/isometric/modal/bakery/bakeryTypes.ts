import type { BuildingState } from '../../types';
import type { ContractType } from '../industryContracts';

export type BakeryProductTarget = 'chleb_pszenny' | 'chleb_zytni' | 'wypieki_cukiernicze';

export type BakeryProfession =
  | 'manager'
  | 'baker'
  | 'baker_assistant'
  | 'warehouseman'
  | 'merchant';

export type BakeryCycleStage =
  | 'flour_intake'
  | 'sifting'
  | 'proofing'
  | 'kneading'
  | 'baking'
  | 'cooling_packing'
  | 'dispatch';

export interface BakeryCrewMember {
  id: string;
  name: string;
  profession: BakeryProfession;
  dailyWage: number; // £/dzień
}

export interface BakerySupplyOrder {
  supplierId: string;
  monthlyKg: number;
  contractType: ContractType;
  monthsRemaining: number;
  startTotalMonths: number;
}

export interface BakeryAnnualYieldEntry {
  year: number;
  productTarget: BakeryProductTarget;
  breadKg: number;
  rusksKg: number;
}

export interface BakeryMonthlyFinanceEntry {
  year: number;
  month: number;
  revenue: number;
  flourCost: number;
  payrollCost: number;
  energyCost: number;
}

export type BakeryIngredientId = 'salt' | 'yeast' | 'butter' | 'sugar';

export interface BakeryExtraSupplyOrder {
  ingredient: BakeryIngredientId;
  supplierId: string;
  monthlyKg: number;
  contractType: ContractType;
  monthsRemaining: number;
  startTotalMonths: number;
}

export interface BakeryCapitalismState {
  productTarget: BakeryProductTarget;
  crew: BakeryCrewMember[];
  workdayHours?: number;
  stageAssignments: Partial<Record<BakeryCycleStage, string[]>>;
  proofingEnabled: boolean;
  currentStage: BakeryCycleStage;
  cycleProgressPercent: number; // 0..100
  isBakingActive: boolean;

  // Magazyny (kg)
  flourStockKg: number;
  flourCapacityKg: number;
  saltStockKg?: number;
  saltCapacityKg?: number;
  yeastStockKg?: number;
  yeastCapacityKg?: number;
  butterStockKg?: number;
  butterCapacityKg?: number;
  sugarStockKg?: number;
  sugarCapacityKg?: number;
  breadStockKg: number;
  breadCapacityKg: number;
  rusksStockKg: number;
  rusksCapacityKg: number;

  // Jakość i ceny (£/kg)
  breadQualityPercent: number;
  breadPricePerKg: number;
  rusksPricePerKg: number;

  // Kontrakty na dostawę mąki i dodatków
  flourOrders: BakerySupplyOrder[];
  extraOrders?: BakeryExtraSupplyOrder[];
  interventionBuyEnabled?: boolean;

  // Statystyki i finanse
  totalRevenue: number;
  totalExpenses: number;
  yearlyBreadKg: number;
  yearlyRusksKg: number;
  lastTickDay?: number;
  lastTickMonth?: number;
  annualHistory: BakeryAnnualYieldEntry[];
  monthlyFinanceHistory: BakeryMonthlyFinanceEntry[];
}

export interface BakeryProfessionConfig {
  id: BakeryProfession;
  label: string;
  icon: string;
  defaultWage: number;
  minWage: number;
  maxWage: number;
  desc: string;
}

export const BAKERY_PROFESSIONS: Record<BakeryProfession, BakeryProfessionConfig> = {
  manager: {
    id: 'manager',
    label: 'Zarządca (Klasa M)',
    icon: '🎩',
    defaultWage: 6,
    minWage: 4,
    maxWage: 14,
    desc: 'Wymagany w zakładach ≥ 2×1 (opcjonalny w piekarni 1×1). Nadzoruje receptury, bilans i jakość (+15% wydajności, +8% jakości).',
  },
  baker: {
    id: 'baker',
    label: 'Mistrz Piekarski',
    icon: '👨‍🍳',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Specjalista wyrabiający ciasto i obsługujący opalany piec chlebowy.',
  },
  baker_assistant: {
    id: 'baker_assistant',
    label: 'Czeladnik Piekarski',
    icon: '🧰',
    defaultWage: 2,
    minWage: 1,
    maxWage: 6,
    desc: 'Przesiewa mąkę, dogląda garowania zakwasu oraz studzi i pakuje gotowe bochenki.',
  },
  warehouseman: {
    id: 'warehouseman',
    label: 'Magazynier / Ekspedient',
    icon: '📦',
    defaultWage: 3,
    minWage: 2,
    maxWage: 7,
    desc: 'Zarządza półkami pieczywa, sucharami oraz wydawaniem wypieków z lady sklepowej.',
  },
  merchant: {
    id: 'merchant',
    label: 'Kupiec',
    icon: '💼',
    defaultWage: 4,
    minWage: 2,
    maxWage: 10,
    desc: 'Realizuje zakup mąki z młynów parowych oraz obsługuje kontrakty handlowe.',
  },
};

export interface BakeryProductConfig {
  id: BakeryProductTarget;
  label: string;
  icon: string;
  requiredFlourLabel: string;
  requiredFlourGenitive: string;
  ingredientsLabel: string;
  extraIngredientsLabel: string;
  unitWeightKg: number; // 1 szt. w kg (np. 1 chleb = 0.9 kg)
  breadYieldRatio: number; // kg wypieku z 1 kg mąki (woda/zakwas zwiększają masę)
  rusksYieldRatio: number; // kg bułki tartej z 1 kg mąki
  defaultPricePerKg: number; // £ / szt.
  desc: string;
}

export const BAKERY_PRODUCTS_CONFIG: Record<BakeryProductTarget, BakeryProductConfig> = {
  chleb_pszenny: {
    id: 'chleb_pszenny',
    label: 'Chleb Pszenny',
    icon: '🥖',
    requiredFlourLabel: 'Mąka Pszenna',
    requiredFlourGenitive: 'mąki pszennej',
    ingredientsLabel: 'Mąka pszenna, sól, drożdże',
    extraIngredientsLabel: 'Sól i drożdże',
    unitWeightKg: 0.9,
    breadYieldRatio: 1.35,
    rusksYieldRatio: 0.05,
    defaultPricePerKg: 1.5,
    desc: 'Chrupiące bochenki pszenne (0,9 kg/szt.) wypiekane w piecu chlebowym.',
  },
  chleb_zytni: {
    id: 'chleb_zytni',
    label: 'Chleb Żytni na Zakwasie',
    icon: '🍞',
    requiredFlourLabel: 'Mąka Żytnia',
    requiredFlourGenitive: 'mąki żytniej',
    ingredientsLabel: 'Mąka żytnia, sól, zakwas',
    extraIngredientsLabel: 'Sól i zakwas',
    unitWeightKg: 0.9,
    breadYieldRatio: 1.4,
    rusksYieldRatio: 0.04,
    defaultPricePerKg: 1.4,
    desc: 'Tradycyjny ciemny chleb żytni na naturalnym zakwasie (0,9 kg/szt., bez drożdży).',
  },
  wypieki_cukiernicze: {
    id: 'wypieki_cukiernicze',
    label: 'Rogaliki',
    icon: '🥐',
    requiredFlourLabel: 'Mąka Pszenna',
    requiredFlourGenitive: 'mąki pszennej',
    ingredientsLabel: 'Mąka pszenna, masło, cukier, drożdże',
    extraIngredientsLabel: 'Masło, cukier, drożdże',
    unitWeightKg: 0.1,
    breadYieldRatio: 1.15,
    rusksYieldRatio: 0.06,
    defaultPricePerKg: 0.3,
    desc: 'Delikatne rogaliki maślane (0,1 kg/szt.) o wysokiej marży.',
  },
};

export interface BakeryStageMeta {
  id: BakeryCycleStage;
  num: number;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  requiredProfessionLabel: string;
  allowedProfessions: BakeryProfession[];
  isOptional?: boolean;
}

export const BAKERY_STAGES_CONFIG: BakeryStageMeta[] = [
  {
    id: 'flour_intake',
    num: 1,
    label: 'Zakup Surowców',
    shortLabel: 'Zakup',
    icon: '🛒',
    desc: 'Zakup mąki z młynów parowych oraz dodatków odpowiednich dla receptury (sól, drożdże, zakwas, masło, cukier).',
    requiredProfessionLabel: 'Kupiec',
    allowedProfessions: ['merchant'],
  },
  {
    id: 'sifting',
    num: 2,
    label: 'Przesiewanie i Zakwas',
    shortLabel: 'Przesiew',
    icon: '🌬️',
    desc: 'Napowietrzanie mąki przez gęste sita i przygotowanie zaczynu drożdżowego lub zakwasu.',
    requiredProfessionLabel: 'Czeladnik Piekarski',
    allowedProfessions: ['baker_assistant'],
  },
  {
    id: 'proofing',
    num: 3,
    label: 'Długie Garowanie Ciasta',
    shortLabel: 'Garowanie',
    icon: '⏳',
    desc: 'Opcjonalne powolne wyrastanie w dzieżach (+10% jakości i aromatu pieczywa).',
    requiredProfessionLabel: 'Czeladnik Piekarski',
    allowedProfessions: ['baker_assistant'],
    isOptional: true,
  },
  {
    id: 'kneading',
    num: 4,
    label: 'Wyrabianie i Formowanie',
    shortLabel: 'Wyrabianie',
    icon: '🥣',
    desc: 'Ręczne lub mechaniczne miesienie ciasta i formowanie bochenków na łopaty.',
    requiredProfessionLabel: 'Mistrz Piekarski',
    allowedProfessions: ['baker'],
  },
  {
    id: 'baking',
    num: 5,
    label: 'Wypiek w Piecu Chlebowym',
    shortLabel: 'Wypiek',
    icon: '🔥',
    desc: 'Główny wypiek w ceglanym piecu opalanym węglem lub drewnem w temperaturze 240°C.',
    requiredProfessionLabel: 'Mistrz Piekarski',
    allowedProfessions: ['baker'],
  },
  {
    id: 'cooling_packing',
    num: 6,
    label: 'Studzenie i Kruszenie',
    shortLabel: 'Studzenie',
    icon: '🧺',
    desc: 'Studzenie gorących bochenków na drewnianych rusztach oraz odsiew czerstwego pieczywa na bułkę tartą.',
    requiredProfessionLabel: 'Czeladnik Piekarski',
    allowedProfessions: ['baker_assistant'],
  },
  {
    id: 'dispatch',
    num: 7,
    label: 'Półki i Lada Sklepowa',
    shortLabel: 'Magazyn',
    icon: '📦',
    desc: 'Układanie świeżego pieczywa na półkach oraz wydawanie partii odbiorcom.',
    requiredProfessionLabel: 'Magazynier / Ekspedient',
    allowedProfessions: ['warehouseman'],
  },
];

export const BAKERY_FLOUR_BASE_CAPACITY_KG = 5000;
export const BAKERY_BREAD_BASE_CAPACITY_KG = 4000;
export const BAKERY_RUSKS_BASE_CAPACITY_KG = 2000;

export function createDefaultBakeryState(): BakeryCapitalismState {
  return {
    productTarget: 'chleb_pszenny',
    crew: [],
    stageAssignments: {},
    proofingEnabled: true,
    currentStage: 'flour_intake',
    cycleProgressPercent: 0,
    isBakingActive: true,
    flourStockKg: 0,
    flourCapacityKg: BAKERY_FLOUR_BASE_CAPACITY_KG,
    saltStockKg: 0,
    saltCapacityKg: 500,
    yeastStockKg: 0,
    yeastCapacityKg: 300,
    butterStockKg: 0,
    butterCapacityKg: 500,
    sugarStockKg: 0,
    sugarCapacityKg: 500,
    breadStockKg: 0,
    breadCapacityKg: BAKERY_BREAD_BASE_CAPACITY_KG,
    rusksStockKg: 0,
    rusksCapacityKg: BAKERY_RUSKS_BASE_CAPACITY_KG,
    breadQualityPercent: 85,
    breadPricePerKg: 1.7,
    rusksPricePerKg: 0.65,
    flourOrders: [],
    extraOrders: [],
    totalRevenue: 0,
    totalExpenses: 0,
    yearlyBreadKg: 0,
    yearlyRusksKg: 0,
    annualHistory: [],
    monthlyFinanceHistory: [],
  };
}

export function getBakeryFlourOrders(state: BakeryCapitalismState): BakerySupplyOrder[] {
  return Array.isArray(state.flourOrders) ? state.flourOrders : [];
}

export function getBakeryStageWorkerIds(
  state: BakeryCapitalismState,
  stage: BakeryCycleStage
): string[] {
  const assigned = state.stageAssignments?.[stage] || [];
  return assigned.filter((id) => state.crew.some((c) => c.id === id));
}

export function isBakeryWorkerAssignedAnywhere(
  state: BakeryCapitalismState,
  workerId: string
): boolean {
  return BAKERY_STAGES_CONFIG.some((s) =>
    (state.stageAssignments?.[s.id] || []).includes(workerId)
  );
}

export function canBakeryWorkerHandleStage(
  profession: BakeryProfession,
  stage: BakeryCycleStage
): boolean {
  const meta = BAKERY_STAGES_CONFIG.find((s) => s.id === stage);
  return meta ? meta.allowedProfessions.includes(profession) : false;
}

export function checkIsBakeryProductionReady(
  state: BakeryCapitalismState,
  buildingState: BuildingState,
  sizeTiles = 1
): { isReady: boolean; missingReasons: string[] } {
  const missingReasons: string[] = [];

  if (sizeTiles >= 2 && !state.crew.some((c) => c.profession === 'manager')) {
    missingReasons.push('Brak Zarządcy (wymagany dla fabryki ≥ 2×1)');
  }

  for (const stage of BAKERY_STAGES_CONFIG) {
    if (stage.isOptional) {
      if (stage.id === 'proofing' && !state.proofingEnabled) continue;
    }
    const workers = getBakeryStageWorkerIds(state, stage.id);
    if (workers.length === 0) {
      missingReasons.push(`Brak obsady: ${stage.shortLabel}`);
    }
  }

  if (!buildingState.businessEnergySource) {
    missingReasons.push('Brak wybranego źródła energii w zakładce ⚡ Energia');
  } else if (
    buildingState.businessEnergySource === 'wegiel' &&
    (buildingState.coalStockTons ?? 0) <= 0
  ) {
    missingReasons.push('Brak węgla w zakładce ⚡ Energia');
  } else if (
    buildingState.businessEnergySource === 'wegiel_drzewny' &&
    (buildingState.charcoalStockTons ?? 0) <= 0
  ) {
    missingReasons.push('Brak węgla drzewnego w zakładce ⚡ Energia');
  }

  if (state.flourStockKg <= 0) {
    missingReasons.push('Brak mąki w zasobniku');
  }

  return {
    isReady: missingReasons.length === 0,
    missingReasons,
  };
}
