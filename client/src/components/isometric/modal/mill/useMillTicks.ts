import { useEffect, useRef } from 'react';
import type { BuildingState } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { getContractMeta } from '../industryContracts';
import type { WorldSupplierBuilding } from '../industrySupplyConfig';
import { computeMillYieldSummary, getMillStageForProgress } from './millMath';
import {
  checkIsMillProductionReady,
  getMillGrainOrders,
  MILL_PRODUCTS_CONFIG,
  type MillCapitalismState,
  type MillSupplyOrder,
} from './millTypes';

interface UseMillTicksProps {
  millState: MillCapitalismState;
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
}

export function useMillTicks({
  millState,
  buildingState,
  buildingsState,
  clock,
  onSpendGold,
  onUpdateState,
  onUpdateAnyBuildingState,
}: UseMillTicksProps) {
  const prevTotalDaysRef = useRef<number | null>(null);
  const prevTotalMonthsRef = useRef<number | null>(null);
  const prevYearRef = useRef<number | null>(null);

  useEffect(() => {
    if (!clock) return;
    const { year, month, day } = clock.date;
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

    let nextMill: MillCapitalismState = { ...millState };
    let changed = false;

    // 1. Roczne podsumowanie przemiału
    if (yearChanged && (nextMill.yearlyFlourKg > 0 || nextMill.yearlyBranKg > 0)) {
      nextMill = {
        ...nextMill,
        annualHistory: [
          ...nextMill.annualHistory,
          {
            year: year - 1,
            productTarget: nextMill.productTarget,
            flourKg: nextMill.yearlyFlourKg,
            branKg: nextMill.yearlyBranKg,
          },
        ],
        yearlyFlourKg: 0,
        yearlyBranKg: 0,
      };
      changed = true;
    }

    // 2. Miesięczna realizacja kontraktu na dostawę ziarna z farmy + płace/energia
    if (monthChanged) {
      const summary = computeMillYieldSummary(nextMill, buildingState);
      const monthlyPayroll = summary.dailyPayrollCost * 30;
      const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
      let monthlyGrainCost = 0;

      const currentOrders = getMillGrainOrders(nextMill);
      const updatedOrders: MillSupplyOrder[] = [];

      for (const order of currentOrders) {
        if (!order || order.monthlyKg <= 0 || !order.supplierId) continue;

        const supplierState = buildingsState[order.supplierId];
        const supplierFarm = supplierState?.farmCapitalism;
        const cropKey = supplierFarm?.cropType || 'pszenica';
        const availableGrain = supplierFarm?.grainStockKg?.[cropKey] ?? 0;
        const freeSpace = Math.max(0, nextMill.grainCapacityKg - nextMill.grainStockKg);
        const deliveredKg = Math.min(order.monthlyKg, availableGrain, freeSpace);

        if (deliveredKg > 0 && supplierFarm) {
          const meta = getContractMeta(order.contractType);
          const basePricePerKg = 0.35; // £0.35 / kg ziarna
          const orderCost = Math.round(deliveredKg * basePricePerKg * (1 - meta.discountPercent / 100));
          monthlyGrainCost += orderCost;

          nextMill = {
            ...nextMill,
            grainStockKg: nextMill.grainStockKg + deliveredKg,
          };

          if (onUpdateAnyBuildingState) {
            onUpdateAnyBuildingState(order.supplierId, {
              farmCapitalism: {
                ...supplierFarm,
                grainStockKg: {
                  ...supplierFarm.grainStockKg,
                  [cropKey]: Math.max(0, availableGrain - deliveredKg),
                },
              },
            });
          }

          if (onSpendGold && orderCost > 0) {
            onSpendGold(orderCost);
          }
        }

        if (order.contractType !== 'pay_as_you_go') {
          const rem = Math.max(0, order.monthsRemaining - 1);
          if (rem > 0) {
            updatedOrders.push({ ...order, monthsRemaining: rem });
          }
        } else {
          updatedOrders.push(order);
        }
      }

      nextMill = {
        ...nextMill,
        grainOrders: updatedOrders,
        grainOrder: updatedOrders[0],
      };

      const monthExpenses = monthlyPayroll + monthlyEnergy + monthlyGrainCost;
      if (onSpendGold && monthlyPayroll + monthlyEnergy > 0) {
        onSpendGold(monthlyPayroll + monthlyEnergy);
      }

      nextMill = {
        ...nextMill,
        totalExpenses: nextMill.totalExpenses + monthExpenses,
        monthlyFinanceHistory: [
          ...nextMill.monthlyFinanceHistory.slice(-11),
          {
            year,
            month,
            revenue: 0,
            grainCost: monthlyGrainCost,
            payrollCost: monthlyPayroll,
            energyCost: monthlyEnergy,
          },
        ],
      };
      changed = true;
    }

    // 3. Dzienny tick przemiału
    if (dayChanged) {
      const ready = checkIsMillProductionReady(nextMill, buildingState);
      if (ready.isReady && nextMill.isMillingActive) {
        const summary = computeMillYieldSummary(nextMill, buildingState);
        const productCfg = MILL_PRODUCTS_CONFIG[nextMill.productTarget];
        const consumedGrain = Math.min(nextMill.grainStockKg, summary.dailyGrainInputKg);

        if (consumedGrain > 0) {
          const producedFlour = Math.round(consumedGrain * productCfg.flourYieldRatio);
          const producedBran = Math.round(consumedGrain * productCfg.branYieldRatio);

          const nextFlour = Math.min(nextMill.flourCapacityKg, nextMill.flourStockKg + producedFlour);
          const nextBran = Math.min(nextMill.branCapacityKg, nextMill.branStockKg + producedBran);
          const nextProgress = (nextMill.cycleProgressPercent + 10) % 100;

          nextMill = {
            ...nextMill,
            grainStockKg: nextMill.grainStockKg - consumedGrain,
            flourStockKg: nextFlour,
            branStockKg: nextBran,
            yearlyFlourKg: nextMill.yearlyFlourKg + producedFlour,
            yearlyBranKg: nextMill.yearlyBranKg + producedBran,
            flourQualityPercent: summary.qualityPercent,
            cycleProgressPercent: nextProgress,
            currentStage: getMillStageForProgress(nextProgress, nextMill.conditioningEnabled),
          };
          changed = true;
        }
      }
    }

    if (changed) {
      onUpdateState({ millState: nextMill });
    }
  }, [clock?.date.year, clock?.date.month, clock?.date.day]);
}
