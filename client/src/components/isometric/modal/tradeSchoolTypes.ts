import { ENGLISH_FIRST_NAMES, ENGLISH_LAST_NAMES } from './englishNames';
import type { UniversityHousingClass } from './universityTypes';

export type TradeSchoolRole = 'principal' | 'teacher' | 'caretaker_f' | 'night_watchman';

export interface TradeSchoolCrewMember {
  id: string;
  name: string;
  role: TradeSchoolRole;
  housingClass: UniversityHousingClass;
  hasWife: boolean;
  childrenCount: number;
  parentsCount: number;
}

export const TRADE_SCHOOL_ROLE_LABELS: Record<TradeSchoolRole, string> = {
  principal: 'Dyrektor szkoły branżowej',
  teacher: 'Nauczyciel',
  caretaker_f: 'Woźna',
  night_watchman: 'Stróż nocny',
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

export function createDefaultTradeSchoolCrew(
  seedKey = 'trade_school_init'
): TradeSchoolCrewMember[] {
  const specs: Array<{
    role: TradeSchoolRole;
    cls: UniversityHousingClass;
    count: number;
    femaleOnly?: boolean;
  }> = [
    { role: 'principal', cls: 'middle', count: 1 },
    { role: 'teacher', cls: 'workers', count: 5 },
    { role: 'caretaker_f', cls: 'workers', count: 1, femaleOnly: true },
    { role: 'night_watchman', cls: 'workers', count: 1 },
  ];

  const femaleNames = [
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
  ];
  const crew: TradeSchoolCrewMember[] = [];
  let idx = 1;

  for (const spec of specs) {
    for (let i = 0; i < spec.count; i++) {
      const rand = seededRandom(seedKey, idx * 41 + 19);
      const firstPool = spec.femaleOnly ? femaleNames : ENGLISH_FIRST_NAMES;
      const first = firstPool[Math.floor(rand() * firstPool.length) % firstPool.length];
      const last =
        ENGLISH_LAST_NAMES[Math.floor(rand() * ENGLISH_LAST_NAMES.length) % ENGLISH_LAST_NAMES.length];
      const hasWife = !spec.femaleOnly && rand() < 0.6;
      const childrenCount = Math.floor(rand() * 10) + 1;
      const pRoll = rand();
      const parentsCount = pRoll < 0.5 ? 0 : pRoll < 0.75 ? 1 : 2;

      crew.push({
        id: `ts_${seedKey}_${spec.role}_${idx}`,
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

export function formatTradeSchoolFamilySummary(m: TradeSchoolCrewMember): string {
  const parts: string[] = [];
  if (m.hasWife) parts.push('żona');
  parts.push(`${m.childrenCount} ${m.childrenCount === 1 ? 'dziecko' : 'dzieci'}`);
  parts.push(`${m.parentsCount} ${m.parentsCount === 1 ? 'rodzic' : 'rodziców'}`);
  return parts.join(', ');
}
