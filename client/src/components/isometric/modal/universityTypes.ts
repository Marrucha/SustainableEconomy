import { ENGLISH_FIRST_NAMES, ENGLISH_LAST_NAMES } from './englishNames';

export type UniversityRole =
  | 'rector'
  | 'lecturer'
  | 'cleaner'
  | 'janitor'
  | 'watchman'
  | 'gardener';

export type UniversityHousingClass = 'elite' | 'middle' | 'workers';

export type ProfessorQualification =
  | 'agronom'
  | 'zarzadzanie'
  | 'weterynaria'
  | 'technolog'
  | 'odkrywca';

export const PROFESSOR_QUALIFICATION_LABELS: Record<ProfessorQualification, string> = {
  agronom: 'Agronom',
  zarzadzanie: 'Zarządzanie',
  weterynaria: 'Weterynaria',
  technolog: 'Technolog',
  odkrywca: 'Odkrywca',
};

export interface UniversityCrewMember {
  id: string;
  name: string;
  role: UniversityRole;
  qualification?: ProfessorQualification;
  housingClass: UniversityHousingClass;
  hasWife: boolean;
  childrenCount: number; // 1..10
  parentsCount: number; // 0 (50%), 1 (25%), 2 (25%)
}

export interface UniversityState {
  crew: UniversityCrewMember[];
}

export const UNIVERSITY_ROLE_LABELS: Record<UniversityRole, string> = {
  rector: 'Rektor',
  lecturer: 'Wykładowca',
  cleaner: 'Sprzątaczka',
  janitor: 'Woźny',
  watchman: 'Stróż',
  gardener: 'Ogrodnik',
};

function seededRandom(seedStr: string, index: number): () => number {
  let h = 2166136261 ^ index;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createMember(
  id: string,
  role: UniversityRole,
  housingClass: UniversityHousingClass,
  seedKey: string,
  index: number,
  femaleOnly = false,
  qualification?: ProfessorQualification
): UniversityCrewMember {
  const rand = seededRandom(seedKey, index * 31 + 7);
  const femaleNames = ['Clara', 'Eleanor', 'Beatrice', 'Alice', 'Margaret', 'Florence', 'Charlotte', 'Victoria', 'Harriet', 'Edith'];
  const firstPool = femaleOnly ? femaleNames : ENGLISH_FIRST_NAMES;
  const first = firstPool[Math.floor(rand() * firstPool.length) % firstPool.length];
  const last = ENGLISH_LAST_NAMES[Math.floor(rand() * ENGLISH_LAST_NAMES.length) % ENGLISH_LAST_NAMES.length];

  const hasWife = !femaleOnly && rand() < 0.6;
  const childrenCount = Math.floor(rand() * 10) + 1; // 1..10
  const pRoll = rand();
  const parentsCount = pRoll < 0.5 ? 0 : pRoll < 0.75 ? 1 : 2; // 0: 50%, 1: 25%, 2: 25%

  return {
    id,
    name: `${first} ${last}`,
    role,
    ...(qualification ? { qualification } : {}),
    housingClass,
    hasWife,
    childrenCount,
    parentsCount,
  };
}

export function createDefaultUniversityState(seedKey = 'university_init'): UniversityState {
  const specs: Array<{
    role: UniversityRole;
    cls: UniversityHousingClass;
    femaleOnly?: boolean;
    qualification?: ProfessorQualification;
  }> = [
    { role: 'rector', cls: 'elite' },
    { role: 'lecturer', cls: 'middle', qualification: 'agronom' },
    { role: 'lecturer', cls: 'middle', qualification: 'zarzadzanie' },
    { role: 'lecturer', cls: 'middle', qualification: 'weterynaria' },
    { role: 'lecturer', cls: 'middle', qualification: 'technolog' },
    { role: 'lecturer', cls: 'middle', qualification: 'odkrywca' },
    { role: 'cleaner', cls: 'workers', femaleOnly: true },
    { role: 'cleaner', cls: 'workers', femaleOnly: true },
    { role: 'janitor', cls: 'workers' },
    { role: 'watchman', cls: 'workers' },
    { role: 'gardener', cls: 'workers' },
  ];

  const crew = specs.map((s, idx) =>
    createMember(
      `univ_${seedKey}_${s.role}_${idx}`,
      s.role,
      s.cls,
      seedKey,
      idx + 1,
      s.femaleOnly,
      s.qualification
    )
  );
  return { crew };
}

export function formatUniversityFamilySummary(m: UniversityCrewMember): string {
  const parts: string[] = [];
  if (m.hasWife) parts.push('żona');
  parts.push(`${m.childrenCount} ${m.childrenCount === 1 ? 'dziecko' : 'dzieci'}`);
  parts.push(
    `${m.parentsCount} ${m.parentsCount === 1 ? 'rodzic' : 'rodziców'}`
  );
  return parts.join(', ');
}
