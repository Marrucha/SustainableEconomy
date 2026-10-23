// ============================================================================
// GAME CLOCK & 1880 CALENDAR SYSTEM
// ============================================================================
import type { FarmCycleStage } from '../modal/farmGridTypes';
import type { OrchardCycleStage } from '../modal/orchard/orchardTypes';

export interface GameDate {
  day: number;   // 1..30
  month: number; // 1..12
  year: number;  // np. 1880
}

export const MONTH_NAMES: string[] = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

// Harmonogram wegetacyjny: powiązanie miesięcy z 8 etapami produkcji zboża
export const AGRICULTURAL_SCHEDULE: {
  stage: FarmCycleStage;
  months: number[]; // które miesiące
  seasonName: string;
}[] = [
  { stage: 'seed_intake', months: [1, 2], seasonName: 'Zima • Zaopatrzenie w nasiona' },
  { stage: 'plowing', months: [3], seasonName: 'Wczesna Wiosna • Orka i bruzdowanie' },
  { stage: 'sowing', months: [4], seasonName: 'Wiosna • Zasiew ziarna' },
  { stage: 'fertilizing', months: [5], seasonName: 'Późna Wiosna • Nawożenie 1880' },
  { stage: 'weeding', months: [6], seasonName: 'Wczesne Lato • Pielenie i oprysk' },
  { stage: 'growing', months: [7], seasonName: 'Pełnia Lata • Wzrost i dojrzewanie' },
  { stage: 'harvesting', months: [8], seasonName: 'Późne Lato • Żniwa i omłot' },
  { stage: 'storing_selling', months: [9, 10, 11, 12], seasonName: 'Jesień/Zima • Zbyt i silos' },
];

export function getStageForMonth(month: number): FarmCycleStage {
  const match = AGRICULTURAL_SCHEDULE.find((s) => s.months.includes(month));
  return match ? match.stage : 'seed_intake';
}

// Harmonogram sadowniczy 1880: powiązanie miesięcy z 7 etapami sadu
export const ORCHARD_SCHEDULE: {
  stage: OrchardCycleStage;
  months: number[];
  seasonName: string;
}[] = [
  { stage: 'whitewash', months: [1, 2], seasonName: 'Zima • Bielenie pni wapnem' },
  { stage: 'pruning', months: [3, 4], seasonName: 'Wczesna Wiosna • Przycinanie drzewek' },
  { stage: 'blossoming', months: [5], seasonName: 'Wiosna • Kwitnienie i pszczoły' },
  { stage: 'weeding', months: [6], seasonName: 'Wczesne Lato • Pielęgnacja międzyrzędzi' },
  { stage: 'growing', months: [7, 8], seasonName: 'Pełnia Lata • Wzrost i dojrzewanie owoców' },
  { stage: 'harvesting', months: [9], seasonName: 'Wczesna Jesień • Zbiór owoców' },
  { stage: 'storing_selling', months: [10, 11, 12], seasonName: 'Jesień/Zima • Tłocznia cydru i rynek' },
];

export function getOrchardStageForMonth(month: number): OrchardCycleStage {
  const match = ORCHARD_SCHEDULE.find((s) => s.months.includes(month));
  return match ? match.stage : 'pruning';
}

export function formatGameDate(date: GameDate): string {
  const mName = MONTH_NAMES[date.month - 1] || 'Styczeń';
  return `${date.day} ${mName} ${date.year}`;
}
