import { ENGLISH_FIRST_NAMES, ENGLISH_LAST_NAMES } from './englishNames';
import type { UniversityHousingClass } from './universityTypes';

export type CathedralRole = 'bishop' | 'priest' | 'organist' | 'nun';

export interface CathedralCrewMember {
  id: string;
  name: string;
  role: CathedralRole;
  housingClass: UniversityHousingClass;
  hasWife: boolean;
  childrenCount: number;
  parentsCount: number;
  noFamily?: boolean;
}

export const CATHEDRAL_ROLE_LABELS: Record<CathedralRole, string> = {
  bishop: 'Biskup',
  priest: 'Ksiądz',
  organist: 'Organista',
  nun: 'Zakonnica',
};

const FEMALE_NAMES = [
  'Clara',
  'Eleanor',
  'Beatrice',
  'Alice',
  'Margaret',
  'Florence',
  'Charlotte',
  'Victoria',
  'Harriet',
  'Edith',
  'Mary',
  'Catherine',
];

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

export function createDefaultCathedralCrew(seedKey = 'cathedral_init'): CathedralCrewMember[] {
  const specs: Array<{
    role: CathedralRole;
    cls: UniversityHousingClass;
    count: number;
    femaleOnly?: boolean;
    noFamily?: boolean;
  }> = [
    { role: 'bishop', cls: 'elite', count: 1 },
    { role: 'priest', cls: 'middle', count: 3 },
    { role: 'organist', cls: 'workers', count: 1 },
    { role: 'nun', cls: 'workers', count: 5, femaleOnly: true, noFamily: true },
  ];

  const crew: CathedralCrewMember[] = [];
  let idx = 1;

  for (const spec of specs) {
    for (let i = 0; i < spec.count; i++) {
      const rand = seededRandom(seedKey, idx * 53 + 29);
      const firstPool = spec.femaleOnly ? FEMALE_NAMES : ENGLISH_FIRST_NAMES;
      const first = firstPool[Math.floor(rand() * firstPool.length) % firstPool.length];
      const last =
        ENGLISH_LAST_NAMES[Math.floor(rand() * ENGLISH_LAST_NAMES.length) % ENGLISH_LAST_NAMES.length];

      const hasWife = spec.noFamily ? false : !spec.femaleOnly && rand() < 0.6;
      const childrenCount = spec.noFamily ? 0 : Math.floor(rand() * 10) + 1;
      const pRoll = rand();
      const parentsCount = spec.noFamily ? 0 : pRoll < 0.5 ? 0 : pRoll < 0.75 ? 1 : 2;

      crew.push({
        id: `cath_${seedKey}_${spec.role}_${idx}`,
        name: `${first} ${last}`,
        role: spec.role,
        housingClass: spec.cls,
        hasWife,
        childrenCount,
        parentsCount,
        noFamily: spec.noFamily,
      });
      idx += 1;
    }
  }

  return crew;
}

export function formatCathedralFamilySummary(m: CathedralCrewMember): string {
  if (m.noFamily || (!m.hasWife && m.childrenCount === 0 && m.parentsCount === 0)) {
    return 'Brak rodziny';
  }
  const parts: string[] = [];
  if (m.hasWife) parts.push('żona');
  parts.push(`${m.childrenCount} ${m.childrenCount === 1 ? 'dziecko' : 'dzieci'}`);
  parts.push(`${m.parentsCount} ${m.parentsCount === 1 ? 'rodzic' : 'rodziców'}`);
  return parts.join(', ');
}
