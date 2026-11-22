import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { MINE_DEPOSITS } from './modal/mine/mineTypes';
import {
  checkIsMineProductionReady,
  createDefaultMineCapitalismState,
  type MineCapitalismState,
} from './modal/mine/mineCapitalismTypes';
import { computeMineYieldSummary, getMineStageForProgress } from './modal/mine/mineMath';
import { mergeWorldTickRecord } from './mergeWorldTickRecord';
import { computeProductionChecklist } from './modal/productionChecklist';

interface UseMineMonthlyTickParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Obsługuje dzienny, miesięczny i roczny cykl produkcyjny kopalni.
 * Bez w pełni obsadzonego obligatoryjnego cyklu produkcyjnego, zarządcy i energii kopalnia nie ruszy.
 */
export function useMineMonthlyTick({
  clockDate,
  placedBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
}: UseMineMonthlyTickParams) {
  const prevTotalDaysRef = useRef<number | null>(null);
  const prevTotalMonthsRef = useRef<number | null>(null);
  const prevYearRef = useRef<number | null>(null);
  const placedRef = useRef(placedBuildings);
  placedRef.current = placedBuildings;
  const stateRef = useRef(buildingsState);
  stateRef.current = buildingsState;

  useEffect(() => {
    const { year, month, day } = clockDate;
    const totalDays = year * 365 + month * 30 + day;
    const totalMonths = year * 12 + month;

    if (prevTotalDaysRef.current === null) {
      prevTotalDaysRef.current = totalDays;
      prevTotalMonthsRef.current = totalMonths;
      prevYearRef.current = year;
      return;
    }

    const dayChanged = totalDays !== prevTotalDaysRef.current;
    const monthChanged = totalMonths !== prevTotalMonthsRef.current;
    const yearChanged = year !== prevYearRef.current;
    if (!dayChanged && !monthChanged && !yearChanged) return;

    prevTotalDaysRef.current = totalDays;
    prevTotalMonthsRef.current = totalMonths;
    prevYearRef.current = year;

    const mineBuildings = placedRef.current.filter((b) => b.typeId.startsWith('mine_'));
    if (mineBuildings.length === 0) return;

    const next = { ...stateRef.current };
    let changed = false;
    let totalGoldSpent = 0;

    for (const bldg of mineBuildings) {
      const bState = next[bldg.id] || {};
      const depKey = bState.mineDepositType;
      if (!depKey || !MINE_DEPOSITS[depKey]) continue;

      const depInfo = MINE_DEPOSITS[depKey];
      let nextMine: MineCapitalismState = bState.mineCapitalism
        ? { ...bState.mineCapitalism }
        : createDefaultMineCapitalismState(depKey);
      let nextStock = bState.mineStock ?? 0;
      let mineChanged = false;

      if (yearChanged && nextMine.yearlyOreTons > 0) {
        nextMine = {
          ...nextMine,
          annualHistory: [
            ...nextMine.annualHistory,
            {
              year: year - 1,
              depositType: depKey,
              oreTons: nextMine.yearlyOreTons,
            },
          ],
          yearlyOreTons: 0,
        };
        mineChanged = true;
      }

      const sizeTiles = bldg.sizeX * bldg.sizeY;
      const ready = checkIsMineProductionReady(nextMine, bState, sizeTiles);
      const checklist = computeProductionChecklist(bldg, { ...bState, mineCapitalism: nextMine, mineStock: nextStock });
      const summary = computeMineYieldSummary(nextMine, bState, depInfo);

      const isSunday = totalDays % 7 === 6;
      if (dayChanged && !isSunday && ready.isReady && checklist.allPassed && nextMine.isMiningActive) {
        const nextProgress = Number(((nextMine.cycleProgressPercent + 100 / 30) % 100).toFixed(1));
        const producedDaily = Number((summary.monthlyOreTons / 30).toFixed(1));
        nextStock = Math.min(nextMine.capacityTons, Number((nextStock + producedDaily).toFixed(1)));
        nextMine = {
          ...nextMine,
          yearlyOreTons: Math.round(nextMine.yearlyOreTons + producedDaily),
          oreQualityPercent: summary.qualityPercent,
          cycleProgressPercent: nextProgress,
          currentStage: getMineStageForProgress(nextProgress, nextMine.ventilationEnabled),
        };
        mineChanged = true;
      }

      if (monthChanged) {
        const monthlyPayroll = summary.dailyPayrollCost * 30;
        const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
        const monthExpenses = monthlyPayroll + monthlyEnergy;
        if (monthExpenses > 0) {
          totalGoldSpent += monthExpenses;
          nextMine = {
            ...nextMine,
            totalExpenses: nextMine.totalExpenses + monthExpenses,
            monthlyFinanceHistory: [
              ...nextMine.monthlyFinanceHistory.slice(-11),
              {
                year,
                month,
                revenue: 0,
                payrollCost: monthlyPayroll,
                energyCost: monthlyEnergy,
              },
            ],
          };
          mineChanged = true;
        }
      }

      if (mineChanged) {
        next[bldg.id] = {
          ...bState,
          mineStock: nextStock,
          mineCapitalism: nextMine,
        };
        changed = true;
      }
    }

    if (changed) {
      const base = stateRef.current;
      setBuildingsState((prev) => mergeWorldTickRecord(prev, base, next));
    }
    if (totalGoldSpent > 0) setGold((g) => Math.max(0, g - totalGoldSpent));
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
