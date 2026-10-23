// ============================================================================
// WOODCUTTER CAPITALISM & 1880 VICTORIAN TIMBER PRODUCTION SYSTEM
// ============================================================================

export type WoodcutterCycleStage = 'inventory' | 'logging' | 'hauling' | 'drying';

export interface WoodcutterStageInfo {
  id: WoodcutterCycleStage;
  stepNumber: number;
  label: string;
  icon: string;
  durationMonths: number;
  months: number[];
  monthsLabel: string;
  desc: string;
  requiredRole: string;
  requiredRoleIcon: string;
  secondaryRequirement?: string;
  secondaryRequirementIcon?: string;
}

export const WOODCUTTER_STAGES: Record<WoodcutterCycleStage, WoodcutterStageInfo> = {
  inventory: {
    id: 'inventory',
    stepNumber: 1,
    label: 'Inwentaryzacja Drzewostanu',
    icon: '📋',
    durationMonths: 1,
    months: [11], // Listopad
    monthsLabel: 'Listopad (1 miesiąc)',
    desc: 'Pomiar miąższości drzewostanu, wyznaczanie granic zrębu i cechowanie pni do zimowej ścinki.',
    requiredRole: 'Leśnik',
    requiredRoleIcon: '🌲',
  },
  logging: {
    id: 'logging',
    stepNumber: 2,
    label: 'Wyręb i Ścinka Drzew',
    icon: '🪓',
    durationMonths: 2,
    months: [12, 1], // Grudzień i Styczeń
    monthsLabel: 'Grudzień – Styczeń (2 miesiące)',
    desc: 'Tradycyjna zimowa ścinka dorodnych pni dębowych i sosnowych piłami dwuręcznymi i siekierami w okresie bezsokowym.',
    requiredRole: 'Drwal',
    requiredRoleIcon: '🪓',
  },
  hauling: {
    id: 'hauling',
    stepNumber: 3,
    label: 'Zwózka i Zrywka Kłonicowa',
    icon: '🐎',
    durationMonths: 1,
    months: [2], // Luty
    monthsLabel: 'Luty (1 miesiąc)',
    desc: 'Zrywka dłużycy potężnymi wozami kłonicowymi ze zrębu leśnego na utwardzoną składnicę przy drodze.',
    requiredRole: 'Woźnica',
    requiredRoleIcon: '👨‍🌾',
    secondaryRequirement: 'Konie pociągowe (Niezbędne)',
    secondaryRequirementIcon: '🐎',
  },
  drying: {
    id: 'drying',
    stepNumber: 4,
    label: 'Suszenie i Sezonowanie Drewna',
    icon: '🪵',
    durationMonths: 8,
    months: [3, 4, 5, 6, 7, 8, 9, 10], // Marzec - Październik (8 miesięcy)
    monthsLabel: 'Marzec – Październik (8 miesięcy)',
    desc: 'Naturalne sezonowanie okrąglaków w przewiewnych sztaplach pod zadaszeniem. Po 8 miesiącach drewno osiąga wilgotność roboczą i nadaje się do obróbki.',
    requiredRole: 'Ochroniarz składu',
    requiredRoleIcon: '🛡️',
  },
};

export const WOODCUTTER_FLOW: WoodcutterCycleStage[] = ['inventory', 'logging', 'hauling', 'drying'];

export function getWoodcutterStageForMonth(month: number): WoodcutterCycleStage {
  if (month === 11) return 'inventory';
  if (month === 12 || month === 1) return 'logging';
  if (month === 2) return 'hauling';
  return 'drying'; // 3..10
}

export interface WoodcutterCrewStaff {
  foresterHired: boolean;   // Leśnik (Krok 1)
  lumberjackCount: number;  // Drwale (Krok 2, min. 1)
  teamsterHired: boolean;   // Woźnica (Krok 3)
  horsesCount: number;      // Konie pociągowe (Krok 3, min. 2)
  guardHired: boolean;      // Ochroniarz (Krok 4)
}

export const DEFAULT_WOODCUTTER_CREW: WoodcutterCrewStaff = {
  foresterHired: true,
  lumberjackCount: 2,
  teamsterHired: true,
  horsesCount: 2,
  guardHired: true,
};

export function checkIsWoodcutterStageReady(
  stage: WoodcutterCycleStage,
  crew: WoodcutterCrewStaff
): { isReady: boolean; missing: string[] } {
  const missing: string[] = [];

  if (stage === 'inventory') {
    if (!crew.foresterHired) missing.push('Leśnik do inwentaryzacji');
  } else if (stage === 'logging') {
    if (crew.lumberjackCount <= 0) missing.push('Drwale do wyrębu');
  } else if (stage === 'hauling') {
    if (!crew.teamsterHired) missing.push('Woźnica do zwózki');
    if (crew.horsesCount <= 0) missing.push('Konie pociągowe do zwózki');
  } else if (stage === 'drying') {
    if (!crew.guardHired) missing.push('Ochroniarz do dozoru suszarni');
  }

  return {
    isReady: missing.length === 0,
    missing,
  };
}
