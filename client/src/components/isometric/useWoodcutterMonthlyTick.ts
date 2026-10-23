import { useEffect, useRef } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';

interface UseWoodcutterMonthlyTickParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
}

export function useWoodcutterMonthlyTick({
  clockDate,
  placedBuildings,
  buildingsState,
  setBuildingsState,
}: UseWoodcutterMonthlyTickParams) {
  const lastMonthRef = useRef<string>('');

  useEffect(() => {
    const currentMonthKey = `${clockDate.year}-${clockDate.month}`;

    // Roczny cykl zrębu: z końcem października (30 października) kończy się 8 miesięcy suszenia
    // Po tym okresie partia sezonowanego drewna nadaje się do obróbki i zasila składnicę
    if (clockDate.month === 10 && clockDate.day >= 30 && lastMonthRef.current !== currentMonthKey) {
      lastMonthRef.current = currentMonthKey;

      const woodcutterBuildings = placedBuildings.filter((b) => b.typeId === 'woodcutter');
      if (woodcutterBuildings.length === 0) return;

      const stateUpdates: Record<string, Partial<BuildingState>> = {};

      woodcutterBuildings.forEach((bldg) => {
        const bState = buildingsState[bldg.id];
        const eff = bState?.woodcutterEfficiency ?? 100;
        const annualYieldTons = Math.max(10, Math.round((120 * eff) / 100));
        const currentStock = bState?.woodcutterStock ?? 0;
        const newStock = Math.min(500, currentStock + annualYieldTons);

        stateUpdates[bldg.id] = { woodcutterStock: newStock };
      });

      if (Object.keys(stateUpdates).length > 0) {
        setBuildingsState((prev) => {
          const next = { ...prev };
          Object.entries(stateUpdates).forEach(([id, patch]) => {
            next[id] = { ...(next[id] || {}), ...patch };
          });
          return next;
        });
      }
    }
  }, [clockDate.day, clockDate.month, clockDate.year, placedBuildings, buildingsState, setBuildingsState]);
}
