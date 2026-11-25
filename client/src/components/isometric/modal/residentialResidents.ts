import type { BuildingState, PlacedBuilding } from '../types';
import { createDefaultUniversityState } from './universityTypes';
import { createDefaultTownHallCrew } from './townhall/townHallCrewTypes';
import { createDefaultTradeSchoolCrew } from './tradeSchoolTypes';
import { createDefaultCathedralCrew } from './cathedralTypes';

export const WORKERS_PER_TENEMENT = 20;
export const MANAGERS_PER_MIDDLE_TENEMENT = 10;
export const ELITE_PER_VILLA = 4;

export interface ResidentialTenant {
  id: string;
  fullName: string;
  roleLabel: string;
  workplaceName: string;
  familySummary: string;
  totalHouseholdPersons: number;
  hasSpouse: boolean;
  childrenCount: number;
  parentsCount: number;
}

export type HousingClass = 'elite' | 'middle' | 'workers';

const FALLBACK_FIRST_NAMES = [
  'Arthur', 'Thomas', 'Edward', 'Henry', 'Charles', 'William', 'George', 'Albert',
  'Walter', 'Frederick', 'Clara', 'Eleanor', 'Beatrice', 'Alice', 'Margaret', 'Florence',
];
const FALLBACK_LAST_NAMES = [
  'Smith', 'Brown', 'Taylor', 'Wilson', 'Evans', 'Walker', 'Wright', 'Robinson',
  'Thompson', 'White', 'Hughes', 'Edwards', 'Green', 'Hall', 'Wood', 'Harris',
];

function deterministicName(seedIndex: number): string {
  const f = FALLBACK_FIRST_NAMES[seedIndex % FALLBACK_FIRST_NAMES.length];
  const l =
    FALLBACK_LAST_NAMES[Math.floor(seedIndex / FALLBACK_FIRST_NAMES.length) % FALLBACK_LAST_NAMES.length];
  return `${f} ${l}`;
}

const ELITE_ROLES = new Set(['manager', 'agronomist', 'sztygar', 'rector', 'mayor', 'bishop']);
const MIDDLE_ROLES = new Set([
  'baker',
  'miller',
  'merchant',
  'miner',
  'breeder',
  'orchardist',
  'forester',
  'seller',
  'lecturer',
  'clerk',
  'principal',
  'priest',
]);

const ROLE_LABELS_PL: Record<string, string> = {
  manager: 'Zarządca',
  agronomist: 'Agronom',
  sztygar: 'Sztygar',
  rector: 'Rektor',
  mayor: 'Burmistrz',
  bishop: 'Biskup',
  priest: 'Ksiądz',
  organist: 'Organista',
  nun: 'Zakonnica',
  clerk: 'Urzędnik',
  principal: 'Dyrektor szkoły branżowej',
  teacher: 'Nauczyciel',
  caretaker_f: 'Woźna',
  night_watchman: 'Stróż nocny',
  lecturer: 'Wykładowca',
  cleaner: 'Sprzątaczka',
  janitor: 'Woźny',
  watchman: 'Stróż',
  gardener: 'Ogrodnik',
  helper: 'Pomocnik',
  baker: 'Mistrz Piekarski',
  miller: 'Młynarz',
  merchant: 'Kupiec',
  miner: 'Górnik',
  breeder: 'Hodowca',
  orchardist: 'Sadownik',
  forester: 'Leśnik',
  seller: 'Sprzedawca',
  baker_assistant: 'Czeladnik Piekarski',
  mill_assistant: 'Pomocnik Młynarza',
  miner_assistant: 'Pomocnik Górnika',
  warehouseman: 'Magazynier',
  worker: 'Robotnik',
};

const RURAL_BUILDING_TYPES = new Set([
  'wheat_farm',
  'wheat_field',
  'flax_farm',
  'hop_farm',
  'orchard',
  'livestock_farm',
  'woodcutter',
  'mine_shaft',
  'coal_mine',
]);

function isRuralBuilding(b: PlacedBuilding): boolean {
  return (b as { mapType?: string }).mapType === 'rural' || RURAL_BUILDING_TYPES.has(b.typeId);
}

function getHousingClass(prof: string): HousingClass {
  if (ELITE_ROLES.has(prof)) return 'elite';
  if (MIDDLE_ROLES.has(prof)) return 'middle';
  return 'workers';
}

function deterministicHousehold(
  seedId: string,
  hasWife?: boolean,
  childrenCount?: number,
  parentsCount?: number
): {
  familySummary: string;
  totalHouseholdPersons: number;
  hasSpouse: boolean;
  childrenCount: number;
  parentsCount: number;
} {
  let w = hasWife;
  let c = childrenCount;
  let p = parentsCount;
  if (w === undefined || c === undefined || p === undefined) {
    let h = 2166136261;
    for (let i = 0; i < seedId.length; i++) {
      h ^= seedId.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const nextRand = () => {
      h += 0x6d2b79f5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    if (w === undefined) w = nextRand() < 0.6;
    if (c === undefined) c = Math.floor(nextRand() * 10) + 1;
    if (p === undefined) {
      const r = nextRand();
      p = r < 0.5 ? 0 : r < 0.75 ? 1 : 2;
    }
  }
  const parts: string[] = [];
  if (!w && c === 0 && p === 0) {
    parts.push('Brak rodziny');
  } else {
    if (w) parts.push('żona/mąż');
    parts.push(`${c} ${c === 1 ? 'dziecko' : 'dzieci'}`);
    parts.push(`${p} ${p === 1 ? 'rodzic' : 'rodziców'}`);
  }
  return {
    familySummary: parts.join(', '),
    totalHouseholdPersons: 1 + (w ? 1 : 0) + c + p,
    hasSpouse: Boolean(w),
    childrenCount: c,
    parentsCount: p,
  };
}

export function getCityHousingPools(
  allWorldBuildings: PlacedBuilding[],
  buildingsState: Record<string, BuildingState>
): Record<HousingClass, ResidentialTenant[]> {
  const pools: Record<HousingClass, ResidentialTenant[]> = {
    elite: [],
    middle: [],
    workers: [],
  };
  const seenIds = new Set<string>();

  const pushPerson = (
    id: string,
    fullName: string,
    prof: string,
    workplaceName: string,
    cls: HousingClass,
    hasWife?: boolean,
    childrenCount?: number,
    parentsCount?: number
  ) => {
    if (!fullName || seenIds.has(id)) return;
    seenIds.add(id);
    const household = deterministicHousehold(id, hasWife, childrenCount, parentsCount);
    const baseRoleLabel = ROLE_LABELS_PL[prof] || prof;
    const roleLabel =
      prof === 'manager' ? `Zarządca (${workplaceName})` : baseRoleLabel;
    pools[cls].push({
      id,
      fullName,
      roleLabel,
      workplaceName,
      familySummary: household.familySummary,
      totalHouseholdPersons: household.totalHouseholdPersons,
      hasSpouse: household.hasSpouse,
      childrenCount: household.childrenCount,
      parentsCount: household.parentsCount,
    });
  };

  // 1. Pracownicy i zarządcy zatrudnieni imiennie (tylko budynki miejskie)
  for (const b of allWorldBuildings) {
    if (isRuralBuilding(b)) continue;
    const st = buildingsState[b.id];
    const wp = b.name || b.typeId;
    const univCrew =
      b.typeId === 'university'
        ? st?.universityState?.crew && st.universityState.crew.length > 0
          ? st.universityState.crew
          : createDefaultUniversityState(b.id).crew
        : undefined;
    const townHallCrew =
      b.typeId === 'town_hall' ? createDefaultTownHallCrew(b.id) : undefined;
    const tradeSchoolCrew =
      b.typeId === 'trade_school' ? createDefaultTradeSchoolCrew(b.id) : undefined;
    const cathedralCrew =
      b.typeId === 'cathedral' ? createDefaultCathedralCrew(b.id) : undefined;
    if (!st && !univCrew && !townHallCrew && !tradeSchoolCrew && !cathedralCrew) continue;

    const crewSources: Array<{
      list?: Array<{
        id: string;
        name: string;
        profession?: string;
        role?: string;
        hasWife?: boolean;
        childrenCount?: number;
        parentsCount?: number;
      }>;
    }> = [
      { list: st?.millState?.crew },
      { list: st?.bakeryState?.crew },
      { list: st?.mineCapitalism?.crew },
      { list: st?.farmCapitalism?.crew },
      { list: st?.flaxState?.crew },
      { list: st?.hopState?.crew },
      { list: st?.livestockState?.crew },
      { list: st?.orchardState?.crew },
      { list: st?.factoryRoster },
      { list: univCrew },
      { list: townHallCrew },
      { list: tradeSchoolCrew },
      { list: cathedralCrew },
    ];

    for (const src of crewSources) {
      if (!Array.isArray(src.list)) continue;
      for (const m of src.list) {
        const prof = m.profession || m.role || 'worker';
        pushPerson(
          m.id,
          m.name,
          prof,
          wp,
          getHousingClass(prof),
          m.hasWife,
          m.childrenCount,
          m.parentsCount
        );
      }
    }
  }

  // 2. Obsada liczbowa bez imiennego rostera (tylko budynki miejskie)
  for (const b of allWorldBuildings) {
    if (isRuralBuilding(b)) continue;
    const st = buildingsState[b.id];
    if (!st) continue;
    const wp = b.name || b.typeId;

    const marketSellers = (st.marketStalls || []).reduce(
      (sum, slot) => sum + (slot.sellers?.length ?? 0),
      0
    );
    const anonymousWorkers =
      (st.factoryWorkersCount ?? 0) +
      (st.warehousemanRoleMode === 'worker' ? 0 : st.factoryWarehousemenCount ?? 0) +
      (st.merchantHired && st.merchantRoleMode !== 'worker' ? 1 : 0) +
      (st.factorySellerHired && st.sellerRoleMode !== 'worker' ? 1 : 0) +
      (st.marketSuppliersCount ?? 0) +
      marketSellers;
    const namedWorkersInBuilding = (st.factoryRoster || []).filter(
      (r) => getHousingClass(r.role) === 'workers'
    ).length;
    for (let i = namedWorkersInBuilding; i < anonymousWorkers; i++) {
      pushPerson(
        `anon_w_${b.id}_${i}`,
        deterministicName(pools.workers.length + i),
        'Robotnik / Pomocnik',
        wp,
        'workers'
      );
    }

    const anonymousManagers = st.factoryManagersCount ?? 0;
    const namedManagersInBuilding = (st.factoryRoster || []).filter(
      (r) => getHousingClass(r.role) === 'elite'
    ).length;
    for (let i = namedManagersInBuilding; i < anonymousManagers; i++) {
      pushPerson(
        `anon_m_${b.id}_${i}`,
        deterministicName(pools.elite.length + i + 7),
        'manager',
        wp,
        'elite'
      );
    }
  }

  return pools;
}

export function computeStableHousingAssignments(
  cityBuildings: PlacedBuilding[],
  buildingsState: Record<string, BuildingState>
): { assignments: Record<string, string[]>; changed: boolean } {
  const pools = getCityHousingPools(cityBuildings, buildingsState);
  const assignments: Record<string, string[]> = {};
  let changed = false;

  const classes: Array<{ cls: HousingClass; typeId: string; capacity: number }> = [
    { cls: 'elite', typeId: 'tenement_elite', capacity: ELITE_PER_VILLA },
    { cls: 'middle', typeId: 'tenement_middle', capacity: MANAGERS_PER_MIDDLE_TENEMENT },
    { cls: 'workers', typeId: 'tenement_workers', capacity: WORKERS_PER_TENEMENT },
  ];

  for (const { cls, typeId, capacity } of classes) {
    const pool = pools[cls];
    const validIds = new Set(pool.map((p) => p.id));
    const buildings = cityBuildings.filter((b) => b.typeId === typeId);
    const alreadyAssigned = new Set<string>();

    // 1. Zachowujemy istniejących lokatorów na swoich miejscach (nie przenosimy ich)
    for (const b of buildings) {
      const prev = buildingsState[b.id]?.assignedResidentIds || [];
      const kept: string[] = [];
      for (const id of prev) {
        if (validIds.has(id) && !alreadyAssigned.has(id) && kept.length < capacity) {
          kept.push(id);
          alreadyAssigned.add(id);
        }
      }
      assignments[b.id] = kept;
      if (
        kept.length !== prev.length ||
        kept.some((id, idx) => prev[idx] !== id)
      ) {
        changed = true;
      }
    }

    // 2. Nowych mieszkańców dodajemy do pierwszego wolnego miejsca
    for (const person of pool) {
      if (alreadyAssigned.has(person.id)) continue;
      const target = buildings.find((b) => assignments[b.id].length < capacity);
      if (!target) break;
      assignments[target.id].push(person.id);
      alreadyAssigned.add(person.id);
      changed = true;
    }
  }

  return { assignments, changed };
}

export function getTenantsForBuilding(
  targetBuilding: PlacedBuilding,
  allWorldBuildings: PlacedBuilding[],
  buildingsState: Record<string, BuildingState>
): { tenants: ResidentialTenant[]; capacity: number; totalPersons: number; classLabel: string } {
  const pools = getCityHousingPools(allWorldBuildings, buildingsState);

  const buildingClass: HousingClass =
    targetBuilding.typeId === 'tenement_elite'
      ? 'elite'
      : targetBuilding.typeId === 'tenement_middle'
      ? 'middle'
      : 'workers';

  const capacity =
    buildingClass === 'elite'
      ? ELITE_PER_VILLA
      : buildingClass === 'middle'
      ? MANAGERS_PER_MIDDLE_TENEMENT
      : WORKERS_PER_TENEMENT;

  const byId = new Map(pools[buildingClass].map((p) => [p.id, p]));
  const storedIds = buildingsState[targetBuilding.id]?.assignedResidentIds;
  let tenants: ResidentialTenant[];
  if (Array.isArray(storedIds) && storedIds.length > 0) {
    tenants = storedIds
      .map((id) => byId.get(id))
      .filter((p): p is ResidentialTenant => Boolean(p));
  } else {
    const cityOnly = allWorldBuildings.filter((b) => !isRuralBuilding(b));
    const { assignments } = computeStableHousingAssignments(cityOnly, buildingsState);
    const ids = assignments[targetBuilding.id] || [];
    tenants = ids
      .map((id) => byId.get(id))
      .filter((p): p is ResidentialTenant => Boolean(p));
  }
  const totalPersons = tenants.reduce((sum, t) => sum + t.totalHouseholdPersons, 0);

  const classLabel =
    buildingClass === 'elite'
      ? 'Klasa E (Elita — Zarządcy)'
      : buildingClass === 'middle'
      ? 'Klasa M (Mieszczaństwo — Mistrzowie i Kupcy)'
      : 'Klasa R (Robotnicy — Pomocnicy, Magazynierzy, Czeladnicy)';

  return { tenants, capacity, totalPersons, classLabel };
}
