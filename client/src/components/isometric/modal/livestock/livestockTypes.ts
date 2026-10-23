// ============================================================================
// LIVESTOCK FARM (HODOWLA BYDŁA I OWIEC) - ARCHITEKTURA I TYPY 1880 R.
// ============================================================================

export type LivestockProfession =
  | 'vet'        // Weterynarz (Klasa M - niska szansa porażki 1-10%)
  | 'breeder'    // Hodowca (inseminacja 10-30% porażki, ciąża 9 msc, poród, wzrost 2 lata, ubój)
  | 'handler'    // Obsługa (dojenie krów, zbiórka i produkcja nawozu)
  | 'trader'     // Handlarz / Kupiec (sprzedaż żywca, mleka, mięsa, skór, nawozu i wełny)
  | 'agronomist';// Agronom Królewski (Klasa M - doradztwo żywieniowe, pastwiskowe i higiena)

export interface LivestockWorker {
  id: string;
  name: string;
  profession: LivestockProfession;
  wageDaily: number; // £ / dzień
  avatar: string;
  title?: string;
}

export const LIVESTOCK_PROFESSIONS_CONFIG: Record<
  LivestockProfession,
  { label: string; icon: string; desc: string; defaultWage: number }
> = {
  vet: {
    label: 'Lekarz Weterynarii (Klasa M)',
    icon: '🩺',
    desc: 'Wykształcony chirurg zwierzęcy. Szansa porażki przy inseminacji i porodzie to zaledwie 1-10%.',
    defaultWage: 4.8,
  },
  breeder: {
    label: 'Doświadczony Hodowca Bydła',
    icon: '🤠',
    desc: 'Opiekun stada: nadzoruje 9 msc ciąży, wzrost cielaka przez 2 lata, dokonuje uboju (inseminacja i poród z ryzykiem 10-30%).',
    defaultWage: 2.6,
  },
  handler: {
    label: 'Obsługa Fermy i Dojarz',
    icon: '🥛',
    desc: 'Codzienna praca fizyczna: dojenie krów w laktacji oraz produkcja i składowanie obornika.',
    defaultWage: 1.8,
  },
  trader: {
    label: 'Kupiec / Handlarz Bydła',
    icon: '💰',
    desc: 'Zajmuje się handlem żywcem oraz ekspedycją mięsa, mleka, skór, wełny i obornika na targ miejski.',
    defaultWage: 2.5,
  },
  agronomist: {
    label: 'Agronom Zwierzęcy (Klasa M)',
    icon: '🎩',
    desc: 'Naukowe bilansowanie pasz, higiena obory i zarządzanie kwaterami pastwiskowymi (+25% do wydajności).',
    defaultWage: 5.2,
  },
};

// Etapy cyklu hodowlanego krów
export type LivestockStage =
  | 'insemination'       // 1. Inseminacja (Weterynarz lub Hodowca)
  | 'gestation_9m'       // 2. Wzrost płodu 9 miesięcy (Hodowca + dojenie mleka do 6 msc)
  | 'birth'              // 3. Poród (Weterynarz lub Hodowca)
  | 'calf_growth_2y'     // 4. Wzrost cielaka 2 lata (Hodowca)
  | 'branch_decision'    // 5. Wybór ścieżki: Sprzedaż żywca / Ubój / Stado Mleczne
  | 'branch_sale'        // 6A. Sprzedaż dorosłego bydła na rynku (Handlarz)
  | 'branch_slaughter'   // 6B. Ubój na mięso i skórę (Hodowca)
  | 'branch_milking';    // 6C. Dojenie + Nawóz + Reinseminacja (Obsługa & Wet/Hodowca)

export type LivestockChoiceBranch = 'sale' | 'slaughter' | 'milking';

// Magazyn 6 Miejsc – Towary z fermy zwierzęcej
export interface LivestockStorageBinsData {
  beefKg: number;       // 1. Mięso krowie (kg)
  muttonKg: number;     // 2. Mięso owiec (kg)
  leatherPcs: number;   // 3. Skóra (bydło i owce) (szt.)
  milkLiters: number;   // 4. Mleko (litry)
  woolKg: number;       // 5. Wełna owcza (kg)
  manureKg: number;     // 6. Nawóz (obornik bydło i owce) (kg)
}

// Konfiguracja cen i opisów 6 produktów magazynowych
export interface LivestockProductInfo {
  id: keyof LivestockStorageBinsData;
  name: string;
  icon: string;
  unit: string;
  pricePerBatch: number; // £ za partię
  batchSize: number;     // wielkość partii do sprzedaży
  desc: string;
}

export const LIVESTOCK_PRODUCTS: Record<keyof LivestockStorageBinsData, LivestockProductInfo> = {
  beefKg: {
    id: 'beefKg',
    name: 'Mięso krowie (Wołowina)',
    icon: '🥩',
    unit: 'kg',
    pricePerBatch: 28,
    batchSize: 50,
    desc: 'Najwyższej jakości brytyjska wołowina rasy Hereford dostarczana do miejskich rzeźników.',
  },
  muttonKg: {
    id: 'muttonKg',
    name: 'Mięso owiec (Baranina)',
    icon: '🍖',
    unit: 'kg',
    pricePerBatch: 22,
    batchSize: 50,
    desc: 'Tradycyjne mięso baranie i jagnięce z pastwisk wrzosowiskowych.',
  },
  leatherPcs: {
    id: 'leatherPcs',
    name: 'Skóry garbarskie (Bydło i Owce)',
    icon: '📜',
    unit: 'szt.',
    pricePerBatch: 35,
    batchSize: 10,
    desc: 'Wyprawione skóry surowe dla miejskich szewców, rymarzy i zakładów tapicerskich.',
  },
  milkLiters: {
    id: 'milkLiters',
    name: 'Świeże mleko krowie',
    icon: '🥛',
    unit: 'l',
    pricePerBatch: 18,
    batchSize: 100,
    desc: 'Mleko prosto z udoju do miejskich mleczarni, na śmietanę, masło i sery.',
  },
  woolKg: {
    id: 'woolKg',
    name: 'Wełna owcza surowa',
    icon: '🧶',
    unit: 'kg',
    pricePerBatch: 26,
    batchSize: 50,
    desc: 'Gęste runo owiec strzyżonych wiosną, kluczowy surowiec dla manufaktur tkackich.',
  },
  manureKg: {
    id: 'manureKg',
    name: 'Nawóz organiczny (Obornik)',
    icon: '💩',
    unit: 'kg',
    pricePerBatch: 12,
    batchSize: 100,
    desc: 'Cenny obornik bydlęcy kupowany przez farmy zbożowe jako nawóz polowy (generowany wyłącznie przez stado mleczne).',
  },
};

// Struktura Stada (Podział na grupy wiekowe i użytkowe)
export interface LivestockHerdData {
  milkingGroupCows: number;  // Grupa do dojenia (dorosłe krowy w cyklu mlecznym)
  growingGroupCalves: number;// Grupa do wzrostu (cielęta i jałówki dorastające 2 lata)
  sheepFlockCount: number;   // Stado owiec łączne
  adultSheepCount: number;   // Dorosłe maciorki dające wełnę 2x w roku
  growingLambsCount: number; // Rosnące jagnięta (okres odchowu 15 miesięcy)
  // Konie robocze i kopalniane (Shire, Clydesdale, kuce dołowe Pit Ponies)
  horsesFlockCount?: number;  // Łączne stado koni
  adultDraftHorses?: number;  // Dorosłe konie pociągowe / kopalniane
  growingFoalsCount?: number; // Dorastające źrebaki (odchów 36 miesięcy / 3 lata)
}

export type LivestockSpecies = 'cattle' | 'sheep' | 'horses';

// Zapas ściółki i paszy niezbędny do hodowli zwierząt (ze słomy i zboża)
export interface LivestockSuppliesData {
  strawBeddingKg: number; // Ściółka ze słomy (kg) z fermy zbożowej
  feedGrainKg: number;    // Pasza zbożowa (kg) z fermy zbożowej
}

// Główny stan fermy hodowlanej
export interface LivestockCapitalismState {
  crew: LivestockWorker[];
  stageAssignments: Partial<Record<LivestockStage, string>>;
  currentStage: LivestockStage;
  stageProgress: number; // 0..100%
  selectedBranch: LivestockChoiceBranch;
  activeSpecies: LivestockSpecies; // Aktywny widok cyklu: krowy, owce lub konie

  // Zaopatrzenie fermy (słoma i pasza)
  supplies: LivestockSuppliesData;

  // Czas biologiczny bydła
  pregnancyMonthsPassed: number; // 0..9 miesięcy
  calfAgeMonths: number;         // 0..24 miesiące (2 lata)
  lactationMonthsPassed: number; // 0..6 miesięcy (pozyskiwanie mleka w trakcie ciąży)

  // Czas biologiczny owiec (ciąża 5 msc, wzrost jagnięcia 15 msc, wełna 2x w roku)
  sheepStage: LivestockStage;
  sheepProgress: number;
  sheepPregnancyMonths: number;  // 0..5 miesięcy
  lambAgeMonths: number;         // 0..15 miesięcy
  sheepShearingMonths: number;   // cykl wełny (strzyżenie co 6 msc - 2x w roku)
  selectedSheepBranch: LivestockChoiceBranch;

  // Czas biologiczny koni (ciąża klaczy 11 msc, dorastanie źrebaka 36 msc, odchów do kopalni)
  horseStage?: LivestockStage;
  horseProgress?: number;
  horsePregnancyMonths?: number;  // 0..11 miesięcy
  foalAgeMonths?: number;         // 0..36 miesięcy (3 lata)
  selectedHorseBranch?: LivestockChoiceBranch;

  // Stado i Magazyn
  herd: LivestockHerdData;
  storage: LivestockStorageBinsData;

  // Statystyki rozrodu i ekonomii
  totalCalvesBorn: number;
  totalLambsBorn: number;
  totalProceduresFailed: number;
  lastProcedureRiskPercent: number;
  lastCycleRevenue: number;
  lastCycleCost: number;
}

// Sprawdzenie, czy pracownik może podjąć dany etap
export function canWorkerHandleLivestockStage(
  worker: LivestockWorker,
  stage: LivestockStage
): boolean {
  if (worker.profession === 'vet') {
    return ['insemination', 'birth', 'branch_milking'].includes(stage);
  }
  if (worker.profession === 'breeder') {
    return [
      'insemination',
      'gestation_9m',
      'birth',
      'calf_growth_2y',
      'branch_slaughter',
      'branch_milking',
    ].includes(stage);
  }
  if (worker.profession === 'handler') {
    return ['branch_milking'].includes(stage);
  }
  if (worker.profession === 'trader') {
    return ['branch_sale'].includes(stage);
  }
  if (worker.profession === 'agronomist') {
    return true; // Nadzór ogólny
  }
  return false;
}

// Obliczenie ryzyka niepowodzenia procedury
export function calculateFailureRisk(workerProfession?: LivestockProfession): {
  min: number;
  max: number;
  avg: number;
  label: string;
} {
  if (workerProfession === 'vet') {
    return { min: 1, max: 10, avg: 5, label: 'Lekarz Weterynarii: zaledwie 1-10% ryzyka porażki' };
  }
  return { min: 10, max: 30, avg: 20, label: 'Hodowca: 10-30% ryzyka porażki (brak wiedzy klinicznej)' };
}

// Domyślna załoga fermy zwierzęcej
export function createDefaultLivestockCrew(): LivestockWorker[] {
  return [
    {
      id: 'vet_1',
      name: 'Dr. Archibald Sterling',
      profession: 'vet',
      wageDaily: 4.8,
      avatar: '🩺',
      title: 'Absolwent Królewskiego Kolegium Weterynarii w Edynburgu',
    },
    {
      id: 'agronomist_1',
      name: 'Arthur Pendelton',
      profession: 'agronomist',
      wageDaily: 5.2,
      avatar: '🎩',
      title: 'Doradca Żywienia i Płodności Bydła (Klasa M)',
    },
    {
      id: 'breeder_1',
      name: 'George MacIntyre',
      profession: 'breeder',
      wageDaily: 2.6,
      avatar: '🤠',
      title: 'Starszy Hodowca Bydła Szkockiego',
    },
    {
      id: 'handler_1',
      name: 'Sean O’Connor',
      profession: 'handler',
      wageDaily: 1.8,
      avatar: '🥛',
      title: 'Obsługa Fermy i Dojarz',
    },
    {
      id: 'trader_1',
      name: 'Benjamin Clarke',
      profession: 'trader',
      wageDaily: 2.5,
      avatar: '💰',
      title: 'Kupiec Targowy Żywca i Surowców',
    },
  ];
}

// Tworzenie stanu początkowego fermy zwierzęcej
export function createDefaultLivestockState(): LivestockCapitalismState {
  const crew = createDefaultLivestockCrew();
  return {
    crew,
    stageAssignments: {
      insemination: 'vet_1',
      gestation_9m: 'breeder_1',
      birth: 'vet_1',
      calf_growth_2y: 'breeder_1',
      branch_decision: 'breeder_1',
      branch_sale: 'trader_1',
      branch_slaughter: 'breeder_1',
      branch_milking: 'handler_1',
    },
    currentStage: 'insemination',
    stageProgress: 25,
    selectedBranch: 'milking',
    activeSpecies: 'cattle',
    pregnancyMonthsPassed: 0,
    calfAgeMonths: 0,
    lactationMonthsPassed: 0,
    sheepStage: 'insemination',
    sheepProgress: 20,
    sheepPregnancyMonths: 0,
    lambAgeMonths: 0,
    sheepShearingMonths: 0,
    selectedSheepBranch: 'milking',
    horseStage: 'insemination',
    horseProgress: 20,
    horsePregnancyMonths: 0,
    foalAgeMonths: 0,
    selectedHorseBranch: 'sale',
    supplies: {
      strawBeddingKg: 400,
      feedGrainKg: 350,
    },
    herd: {
      milkingGroupCows: 12,
      growingGroupCalves: 8,
      sheepFlockCount: 22,
      adultSheepCount: 16,
      growingLambsCount: 6,
      horsesFlockCount: 14,
      adultDraftHorses: 10,
      growingFoalsCount: 4,
    },
    storage: {
      beefKg: 250,
      muttonKg: 150,
      leatherPcs: 30,
      milkLiters: 480,
      woolKg: 200,
      manureKg: 400,
    },
    totalCalvesBorn: 14,
    totalLambsBorn: 18,
    totalProceduresFailed: 1,
    lastProcedureRiskPercent: 5,
    lastCycleRevenue: 98,
    lastCycleCost: 46,
  };
}
