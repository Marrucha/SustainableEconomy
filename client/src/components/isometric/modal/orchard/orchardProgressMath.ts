import type { GameDate } from '../../clock/gameClockTypes';
import type { FruitType } from './orchardTypes';

export interface OrchardVegetationConfig {
  startMonth: number;       // Zawsze 3 (Marzec - ruszanie soków i cięcie drzewek)
  startDay: number;         // 1
  harvestMonth: number;     // Wiśnie: 7 (Lipiec), Śliwki: 9, Gruszki: 9, Jabłka: 10 (Październik)
  harvestMonthName: string;
}

export const ORCHARD_FRUIT_VEGETATION: Record<FruitType, OrchardVegetationConfig> = {
  wisnia: {
    startMonth: 3,
    startDay: 1,
    harvestMonth: 7, // Lipiec
    harvestMonthName: 'Lipiec',
  },
  sliwka: {
    startMonth: 3,
    startDay: 1,
    harvestMonth: 9, // Wrzesień
    harvestMonthName: 'Wrzesień',
  },
  gruszka: {
    startMonth: 3,
    startDay: 1,
    harvestMonth: 9, // Wrzesień
    harvestMonthName: 'Wrzesień',
  },
  jablko: {
    startMonth: 3,
    startDay: 1,
    harvestMonth: 10, // Październik
    harvestMonthName: 'Październik',
  },
};

export interface OrchardProgressResult {
  progressPercent: number;        // 0..100
  phase: 'dormancy' | 'vegetation' | 'harvest' | 'post_harvest';
  phaseLabel: string;
  phaseIcon: string;
  seasonDesc: string;
  daysToHarvest: number;
  totalSeasonDays: number;
  currentSeasonDay: number;
}

/**
 * Jednolite źródło prawdy dla paska postępu wegetacji sadu.
 * Używane identycznie w widoku wiejskim (overlay na mapie) oraz w menu sadu (modal).
 * Start: 1 Marca (miesiąc 3).
 * Koniec: miesiąc zbiorów zależny od gatunku (Wiśnie - Lipiec, Jabłka - Październik).
 */
export function calculateOrchardProgress(
  fruitType: FruitType | undefined,
  date: GameDate
): OrchardProgressResult {
  const fruitKey: FruitType = fruitType && ORCHARD_FRUIT_VEGETATION[fruitType] ? fruitType : 'jablko';
  const cfg = ORCHARD_FRUIT_VEGETATION[fruitKey];

  const currentDayInYear = (date.month - 1) * 30 + date.day;
  const startDayInYear = (cfg.startMonth - 1) * 30 + cfg.startDay; // Dzień 61 (1 marca)
  const harvestEndDayInYear = cfg.harvestMonth * 30;               // Np. dzień 210 dla wiśni, dzień 300 dla jabłek
  const totalSeasonDays = harvestEndDayInYear - startDayInYear + 1;

  // 1. Przed 1 marca (Styczeń, Luty) - Spoczynek zimowy
  if (currentDayInYear < startDayInYear) {
    const daysUntilStart = startDayInYear - currentDayInYear;
    return {
      progressPercent: 0,
      phase: 'dormancy',
      phaseLabel: 'Spoczynek zimowy',
      phaseIcon: '❄️',
      seasonDesc: `Start wegetacji za ${daysUntilStart} dni (1 Marca)`,
      daysToHarvest: totalSeasonDays + daysUntilStart,
      totalSeasonDays,
      currentSeasonDay: 0,
    };
  }

  // 2. Po zakończeniu zbiorów (od kolejnego miesiąca do końca grudnia)
  if (currentDayInYear > harvestEndDayInYear) {
    return {
      progressPercent: 100,
      phase: 'post_harvest',
      phaseLabel: 'Po zbiorach (Zapas w spichlerzu)',
      phaseIcon: '📦',
      seasonDesc: `Zbiory zakończone • Następny cykl 1 Marca`,
      daysToHarvest: 0,
      totalSeasonDays,
      currentSeasonDay: totalSeasonDays,
    };
  }

  // 3. W trakcie wegetacji (od 1 marca do końca miesiąca zbioru)
  const currentSeasonDay = currentDayInYear - startDayInYear + 1;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentSeasonDay / totalSeasonDays) * 100)));
  const daysToHarvest = Math.max(0, harvestEndDayInYear - currentDayInYear);

  // Etykieta etapu fenologicznego
  let phaseLabel = 'Dojrzewanie owoców';
  let phaseIcon = '☀️';

  if (date.month === 3 || date.month === 4) {
    phaseLabel = 'Przycinanie i ruszanie soków';
    phaseIcon = '✂️';
  } else if (date.month === 5) {
    phaseLabel = 'Kwitnienie i oblot pszczół';
    phaseIcon = '🌸';
  } else if (date.month === 6) {
    phaseLabel = 'Pielęgnacja międzyrzędzi i zawiązki';
    phaseIcon = '🌿';
  } else if (date.month === cfg.harvestMonth) {
    phaseLabel = `Zbiór owoców (${cfg.harvestMonthName})`;
    phaseIcon = '🧺';
  } else if (date.month > 6 && date.month < cfg.harvestMonth) {
    phaseLabel = 'Nalewanie soków i wybarwianie';
    phaseIcon = '☀️';
  }

  const isHarvestMonth = date.month === cfg.harvestMonth;

  return {
    progressPercent,
    phase: isHarvestMonth ? 'harvest' : 'vegetation',
    phaseLabel,
    phaseIcon,
    seasonDesc: daysToHarvest === 0
      ? `Zbiory owoców (${cfg.harvestMonthName})`
      : `Zbiory za ${daysToHarvest} dni (${cfg.harvestMonthName})`,
    daysToHarvest,
    totalSeasonDays,
    currentSeasonDay,
  };
}
