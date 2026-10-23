import { useEffect, useRef } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { MINE_DEPOSITS } from './modal/mine/mineTypes';

interface UseMineMonthlyTickParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Obsługuje miesięczny cykl produkcyjny kopalni:
 * Gdy zegar gry 1880 przechodzi do 1. dnia nowego miesiąca, każda skonfigurowana kopalnia
 * kończy swój 30-dniowy cykl wydobywczy, dostarczając partię urobku do hałdy lub sprzedając na giełdzie.
 */
export function useMineMonthlyTick({
  clockDate,
  placedBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
}: UseMineMonthlyTickParams) {
  const lastMinedMonthKeyRef = useRef<string>('');

  useEffect(() => {
    const currentMonthKey = `${clockDate.year}-${clockDate.month}`;

    // Zapełnienie paska miesięcznego następuje w 30. dniu miesiąca (100% cyklu)
    // W tym momencie urobek natychmiast powiększa zapas na hałdzie kopalnianej
    if (clockDate.day >= 30 && lastMinedMonthKeyRef.current !== currentMonthKey) {
      lastMinedMonthKeyRef.current = currentMonthKey;

      const mineBuildings = placedBuildings.filter((b) => b.typeId.startsWith('mine_'));
      if (mineBuildings.length === 0) return;

      let totalGoldEarned = 0;
      const stateUpdates: Record<string, Partial<BuildingState>> = {};

      mineBuildings.forEach((bldg) => {
        const bState = buildingsState[bldg.id];
        const depKey = bState?.mineDepositType;
        if (!depKey || !MINE_DEPOSITS[depKey]) return;

        const depInfo = MINE_DEPOSITS[depKey];
        const yieldTons = depInfo.baseYieldPerCycle;
        const dest = bState?.mineDestination || 'store_silo';

        if (dest === 'sell_market') {
          totalGoldEarned += yieldTons * depInfo.basePricePerTon;
        } else {
          const currentStock = bState?.mineStock || 0;
          const newStock = Math.min(600, currentStock + yieldTons);
          stateUpdates[bldg.id] = { mineStock: newStock };
        }
      });

      if (totalGoldEarned > 0) {
        setGold((prev) => prev + totalGoldEarned);
      }

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
  }, [clockDate.day, clockDate.month, clockDate.year, placedBuildings, buildingsState, setBuildingsState, setGold]);
}
