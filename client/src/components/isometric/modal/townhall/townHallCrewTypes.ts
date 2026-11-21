import { ENGLISH_FIRST_NAMES, ENGLISH_LAST_NAMES } from '../englishNames';
import type { UniversityHousingClass } from '../universityTypes';

export type TownHallRole = 'mayor' | 'clerk' | 'cleaner' | 'janitor' | 'helper';

export interface TownHallCrewMember {
  id: string;
  name: string;
  role: TownHallRole;
  housingClass: UniversityHousingClass;
  hasWife: boolean;
  childrenCount: number;
  parentsCount: number;
}

export const TOWN_HALL_ROLE_LABELS: Record<TownHallRole, string> = {
  mayor: 'Burmistrz',
  clerk: 'Urzędnik',
  cleaner: 'Sprzątaczka',
  janitor: 'Woźny',
  helper: 'Pomocnik',
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

export function createDefaultTownHallCrew(seedKey = 'town_hall_init'): TownHallCrewMember[] {
  const specs: Array<{ role: TownHallRole; cls: UniversityHousingClass; count: number; femaleOnly?: boolean }> = [
    { role: 'mayor', cls: 'elite', count: 1 },
    { role: 'clerk', cls: 'middle', count: 10 },
    { role: 'cleaner', cls: 'workers', count: 10, femaleOnly: true },
    { role: 'janitor', cls: 'workers', count: 5 },
    { role: 'helper', cls: 'workers', count: 2 },
  ];

  const femaleNames = ['Clara', 'Eleanor', 'Beatrice', 'Alice', 'Margaret', 'Florence', 'Charlotte', 'Victoria', 'Harriet', 'Edith'];
  const crew: TownHallCrewMember[] = [];
  let idx = 1;

  for (const spec of specs) {
    for (let i = 0; i < spec.count; i++) {
      const rand = seededRandom(seedKey, idx * 37 + 13);
      const firstPool = spec.femaleOnly ? femaleNames : ENGLISH_FIRST_NAMES;
      const first = firstPool[Math.floor(rand() * firstPool.length) % firstPool.length];
      const last = ENGLISH_LAST_NAMES[Math.floor(rand() * ENGLISH_LAST_NAMES.length) % ENGLISH_LAST_NAMES.length];
      const hasWife = !spec.femaleOnly && rand() < 0.6;
      const childrenCount = Math.floor(rand() * 10) + 1;
      const pRoll = rand();
      const parentsCount = pRoll < 0.5 ? 0 : pRoll < 0.75 ? 1 : 2;

      crew.push({
        id: `th_${seedKey}_${spec.role}_${idx}`,
        name: `${first} ${last}`,
        role: spec.role,
        housingClass: spec.cls,
        hasWife,
        childrenCount,
        parentsCount,
      });
      idx += 1;
    }
  }

  return crew;
}

export function formatTownHallFamilySummary(m: TownHallCrewMember): string {
  const parts: string[] = [];
  if (m.hasWife) parts.push('żona');
  parts.push(`${m.childrenCount} ${m.childrenCount === 1 ? 'dziecko' : 'dzieci'}`);
  parts.push(`${m.parentsCount} ${m.parentsCount === 1 ? 'rodzic' : 'rodziców'}`);
  return parts.join(', ');
}
