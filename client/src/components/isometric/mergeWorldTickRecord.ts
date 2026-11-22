import type { BuildingState } from './types';

/**
 * Scala zmiany wyliczone w jednym hooku symulacji z najnowszym stanem `prev`,
 * kopiując wyłącznie klucze, które faktycznie uległy zmianie względem `base`.
 */
export function mergeWorldTickRecord(
  prev: Record<string, BuildingState>,
  base: Record<string, BuildingState>,
  next: Record<string, BuildingState>
): Record<string, BuildingState> {
  let result: Record<string, BuildingState> | null = null;
  for (const id of Object.keys(next)) {
    const baseB = base[id];
    const nextB = next[id];
    if (baseB === nextB) continue;
    const prevB = prev[id] || {};
    const mergedB: Record<string, unknown> = { ...prevB };
    let bChanged = false;
    for (const key of Object.keys(nextB) as Array<keyof BuildingState>) {
      if (nextB[key] !== baseB?.[key]) {
        if (key === 'shipInterventionLogs' && Array.isArray(nextB.shipInterventionLogs)) {
          const baseLen = Array.isArray(baseB?.shipInterventionLogs)
            ? baseB.shipInterventionLogs.length
            : 0;
          const added = nextB.shipInterventionLogs.slice(baseLen);
          const prevLogs = Array.isArray(prevB.shipInterventionLogs)
            ? prevB.shipInterventionLogs
            : [];
          mergedB[key] = [...prevLogs, ...added].slice(-200);
        } else {
          mergedB[key] = nextB[key];
        }
        bChanged = true;
      }
    }
    if (bChanged) {
      if (!result) result = { ...prev };
      result[id] = mergedB as BuildingState;
    }
  }
  return result || prev;
}
