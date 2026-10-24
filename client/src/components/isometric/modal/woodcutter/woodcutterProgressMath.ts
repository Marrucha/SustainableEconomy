import type { GameDate } from '../../clock/gameClockTypes';
import {
  type WoodcutterCycleStage,
  type WoodcutterStageInfo,
  type WoodcutterCrewStaff,
  WOODCUTTER_STAGES,
  getWoodcutterStageForMonth,
  checkIsWoodcutterStageReady,
  DEFAULT_WOODCUTTER_CREW,
} from './woodcutterTypes';

export interface WoodcutterProgressResult {
  progressPercent: number;          // 0..100%
  currentStage: WoodcutterCycleStage;
  stageInfo: WoodcutterStageInfo;
  isStageReady: boolean;
  missingRole?: string;
  dayInCycle: number;               // 1..360 (start 1 Listopada)
  daysLeftInCycle: number;
  stageProgressPercent: number;     // 0..100% w ramach danego etapu
}

/**
 * Oblicza postęp rocznego cyklu Wyrębu Drewna:
 * Start: 1 Listopada (Miesiąc 11).
 * Krok 1: Inwentaryzacja (1 msc - Listopad) -> Leśnik
 * Krok 2: Wyręb (2 msc - Grudzień, Styczeń) -> Drwale
 * Krok 3: Zwózka (1 msc - Luty) -> Woźnica + Konie
 * Krok 4: Suszenie (8 msc - Marzec do Października) -> Ochroniarz
 * Koniec: 30 Października (Drewno gotowe do obróbki)
 */
export function calculateWoodcutterProgress(
  date: GameDate,
  crew: WoodcutterCrewStaff = DEFAULT_WOODCUTTER_CREW
): WoodcutterProgressResult {
  const month = date.month;
  const day = date.day;

  // Dzień cyklu w skali roku (1..360), gdzie dzień 1 to 1 Listopada
  let dayInCycle: number;
  if (month >= 11) {
    dayInCycle = (month - 11) * 30 + day; // 1..60
  } else {
    dayInCycle = 60 + (month - 1) * 30 + day; // 61..360
  }

  const progressPercent = Math.min(100, Math.max(1, Math.round((dayInCycle / 360) * 100)));
  const daysLeftInCycle = Math.max(0, 360 - dayInCycle);

  const currentStage = getWoodcutterStageForMonth(month);
  const stageInfo = WOODCUTTER_STAGES[currentStage];
  const readyCheck = checkIsWoodcutterStageReady(currentStage, crew);

  // Postęp w ramach danego etapu
  let stageStartDay = 1;
  let stageTotalDays = 30;

  if (currentStage === 'inventory') {
    stageStartDay = 1;
    stageTotalDays = 30;
  } else if (currentStage === 'logging') {
    stageStartDay = 31;
    stageTotalDays = 60;
  } else if (currentStage === 'hauling') {
    stageStartDay = 91;
    stageTotalDays = 30;
  } else if (currentStage === 'drying') {
    stageStartDay = 121;
    stageTotalDays = 240;
  }

  const stageElapsed = Math.max(0, dayInCycle - stageStartDay + 1);
  const stageProgressPercent = Math.min(100, Math.round((stageElapsed / stageTotalDays) * 100));

  return {
    progressPercent,
    currentStage,
    stageInfo,
    isStageReady: readyCheck.isReady,
    missingRole: readyCheck.missing[0],
    dayInCycle,
    daysLeftInCycle,
    stageProgressPercent,
  };
}
