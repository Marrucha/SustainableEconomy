// ============================================================================
// ORCHARD CAPITALISM & 1880 VICTORIAN FRUIT PRODUCTION SYSTEM
// ============================================================================

export type OrchardWorkerProfession = 'orchardist' | 'merchant' | 'all_rounder';

export const ORCHARD_PROFESSION_LABELS: Record<
  OrchardWorkerProfession,
  { label: string; icon: string; desc: string }
> = {
  orchardist: {
    label: 'Sadownik Drzewiasty',
    icon: '🌳',
    desc: 'Wciela się w role: Bielarz pni, Przycinacz koron, Pielęgnator zawiązków, Zbieracz owoców z drabiną',
  },
  merchant: {
    label: 'Kupiec Owocowy / Tłoczarz',
    icon: '💰',
    desc: 'Wciela się w role: Obsługa tłoczni cydru i sprzedawca świeżych owoców w skrzynkach na targu miejskim',
  },
  all_rounder: {
    label: 'Ogrodnik Wszechstronny',
    icon: '⭐',
    desc: 'Samodzielny ogrodnik sadowniczy łączący cięcie drzewek z handlem owocami',
  },
};

export type OrchardCycleStage =
  | 'whitewash'        // 1. Bielenie pni wapnem (Ochrona mrozowa i przed owadami)
  | 'pruning'          // 2. Przycinanie drzewek (Cięcie formujące i sanitarne - zamiast zasiewu)
  | 'blossoming'       // 3. Kwitnienie i zapylanie (Pszczoły w sadzie)
  | 'weeding'          // 4. Koszenie międzyrzędzi i prześwietlanie zawiązków
  | 'growing'          // 5. Dojrzewanie owoców (Nadzór Pomologa)
  | 'harvesting'       // 6. Zbiór owoców (Zrywanie z drabin do koszy)
  | 'storing_selling'; // 7. Tłocznia cydru, sortowanie i zbyt na rynku miejskim

export const ORCHARD_STAGE_LABELS: Record<
  OrchardCycleStage,
  { label: string; icon: string; season: string; desc: string }
> = {
  whitewash: {
    label: 'Bielenie pni',
    icon: '🪣',
    season: 'Przedwiośnie (Luty)',
    desc: 'Wapnowanie pni drzew owocowych chroniące korę przed pękaniem mrozowym i szkodnikami.',
  },
  pruning: {
    label: 'Przycinanie drzewek',
    icon: '✂️',
    season: 'Wczesna Wiosna (Marzec)',
    desc: 'Cięcie prześwietlające koron, usuwanie starych wilków i formowanie gałęzi (zamiast zasiewu).',
  },
  blossoming: {
    label: 'Kwitnienie i zapylanie',
    icon: '🌸',
    season: 'Wiosna (Maj)',
    desc: 'Bujne kwitnienie sadu, praca pszczół miodnych oraz nadzór nad oblotem zapylaczy.',
  },
  weeding: {
    label: 'Pielęgnacja międzyrzędzi',
    icon: '🌿',
    season: 'Wczesne Lato (Czerwiec)',
    desc: 'Koszenie bujnej trawy sadowniczej i ręczne prześwietlanie nadmiaru zielonych zawiązków owocowych.',
  },
  growing: {
    label: 'Dojrzewanie owoców',
    icon: '☀️',
    season: 'Pełnia Lata (Lipiec)',
    desc: 'Nalewanie się soków i wybarwianie rumieńca na owocach pod czujnym okiem Pomologa.',
  },
  harvesting: {
    label: 'Zbiór owoców',
    icon: '🧺',
    season: 'Późne Lato / Jesień (Wrzesień)',
    desc: 'Ręczne zrywanie dojrzałych owoców z drewnianych drabin do wiklinowych koszy i skrzyń.',
  },
  storing_selling: {
    label: 'Tłocznia i Rynek',
    icon: '🧃',
    season: 'Jesień / Zima (Październik-Grudzień)',
    desc: 'Tłoczenie tradycyjnego cydru/soku, skrzynkowanie deserowych owoców i zbyt na rynku miejskim.',
  },
};

export interface OrchardCrewMember {
  id: string;
  name: string;
  profession: OrchardWorkerProfession;
  wageDaily: number; // £ / dzień
  avatar: string;
}

export interface PomologistSpecialist {
  hired: boolean;
  name: string;
  title: string;
  wageDaily: number; // £ / dzień (Klasa M)
  specialization: 'pruning_master' | 'cider_craft' | 'pest_control';
  yieldBonusPercent: number; // np. +25%
}

export type FruitType = 'jablko' | 'gruszka' | 'sliwka' | 'wisnia';

export interface FruitInfo {
  id: FruitType;
  name: string;
  icon: string;
  baseYield: number; // kg owoców rocznie
  marketPricePerTon: number; // £ / tona owoców deserowych
  ciderYieldLitersPer100Kg: number; // l soku/cydru z 100 kg
  desc: string;
}

export const FRUITS_CONFIG: Record<FruitType, FruitInfo> = {
  jablko: {
    id: 'jablko',
    name: 'Jabłka Wiktoriańskie (Bramley & Cox)',
    icon: '🍎',
    baseYield: 850,
    marketPricePerTon: 125,
    ciderYieldLitersPer100Kg: 65,
    desc: 'Klasyczne angielskie jabłka deserowe i cydrowe o wybornym aromacie i słodyczy.',
  },
  gruszka: {
    id: 'gruszka',
    name: 'Grusze Williamsa i Konferencja',
    icon: '🍐',
    baseYield: 750,
    marketPricePerTon: 145,
    ciderYieldLitersPer100Kg: 60,
    desc: 'Soczyste, szlachetne gruszki deserowe, idealne na miejski rynek i tradycyjny napój Perry.',
  },
  sliwka: {
    id: 'sliwka',
    name: 'Śliwy Węgierki i Damson',
    icon: '🫐',
    baseYield: 680,
    marketPricePerTon: 160,
    ciderYieldLitersPer100Kg: 45,
    desc: 'Miodowo-słodkie śliwy doskonałe do spożycia na surowo, na powidła i słodkie nalewki.',
  },
  wisnia: {
    id: 'wisnia',
    name: 'Wiśnie Szklanki i Czereśnie',
    icon: '🍒',
    baseYield: 580,
    marketPricePerTon: 195,
    ciderYieldLitersPer100Kg: 50,
    desc: 'Wykwintne owoce sadownicze na konfitury i soki dla zamożnego mieszczaństwa.',
  },
};

export interface OrchardCapitalismState {
  crew: OrchardCrewMember[];
  pomologist: PomologistSpecialist;
  fruitType?: FruitType; // Zasada: sad może w danym czasie uprawiać tylko 1 gatunek owocu
  isFruitLocked?: boolean; // Po jednorazowym wyborze profilu zmiana jest dożywotnio niemożliwa

  stageAssignments: Partial<Record<OrchardCycleStage, string>>;
  fruitDestination: 'sell_market' | 'press_cider' | 'store_crates';
  enableTreeTrimmingBonus: boolean; // Precyzyjne ręczne cięcie wilków

  // Stany magazynowe w sadzie
  fruitStockKg: Record<FruitType, number>;
  ciderStockL: number;       // Zapas cydru / soku jabłkowego z prasy
  prunedWoodKg: number;      // Drewno gałęziowe z przycinania drzewek (opał / zrębki)

  currentStage: OrchardCycleStage;
  stageProgress: number; // 0..100%
  totalCyclesCompleted: number;

  lastCycleYieldKg: number;
  lastCycleRevenue: number;
  lastCycleCost: number;
}

export function createDefaultOrchardState(initialFruit?: FruitType, isLocked: boolean = false): OrchardCapitalismState {
  return {
    crew: [
      { id: 'orch_1', name: 'George Miller', profession: 'orchardist', wageDaily: 1.8, avatar: '👨‍🌾' },
      { id: 'orch_2', name: 'Arthur Bennett', profession: 'merchant', wageDaily: 2.2, avatar: '💰' },
    ],
    pomologist: {
      hired: true,
      name: 'Dr. Thomas Rivers',
      title: 'Królewski Pomolog i Szkółkarz (1880 r.)',
      wageDaily: 3.5,
      specialization: 'pruning_master',
      yieldBonusPercent: 25,
    },
    fruitType: initialFruit,
    isFruitLocked: isLocked,
    stageAssignments: {
      whitewash: 'orch_1',
      pruning: 'orch_1',
      blossoming: 'orch_1',
      weeding: 'orch_1',
      growing: 'orch_1',
      harvesting: 'orch_1',
      storing_selling: 'orch_2',
    },
    fruitDestination: 'sell_market',
    enableTreeTrimmingBonus: true,
    fruitStockKg: {
      jablko: 620,
      gruszka: 0,
      sliwka: 0,
      wisnia: 0,
    },
    ciderStockL: 280,
    prunedWoodKg: 190,
    currentStage: 'pruning',
    stageProgress: 25,
    totalCyclesCompleted: 2,
    lastCycleYieldKg: 850,
    lastCycleRevenue: 106,
    lastCycleCost: 32,
  };
}

export function checkIsOrchardReady(state: OrchardCapitalismState): {
  isReady: boolean;
  missingRoles: string[];
} {
  const missing: string[] = [];
  const requiredStages: OrchardCycleStage[] = ['pruning', 'harvesting', 'storing_selling'];

  for (const st of requiredStages) {
    const workerId = state.stageAssignments[st];
    const worker = state.crew.find((w) => w.id === workerId);
    if (!worker) {
      missing.push(ORCHARD_STAGE_LABELS[st].label);
    }
  }

  return {
    isReady: missing.length === 0,
    missingRoles: missing,
  };
}
