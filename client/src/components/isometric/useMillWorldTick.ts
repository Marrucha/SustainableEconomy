import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getContractMeta } from './modal/industryContracts';
import { computeMillYieldSummary, getMillStageForProgress } from './modal/mill/millMath';
import {
  checkIsMillProductionReady,
  createDefaultMillState,
  getMillGrainOrders,
  MILL_PRODUCTS_CONFIG,
  type MillCapitalismState,
  type MillSupplyOrder,
} from './modal/mill/millTypes';
import { appendShipInterventionLogToRecord } from './modal/TradeShipInterventionLogsTab';

interface UseMillWorldTickParams {
  clockDate: GameDate;
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

export function useMillWorldTick({
  clockDate,
  cityBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
}: UseMillWorldTickParams) {
  const prevTotalDaysRef = useRef<number | null>(null);
  const prevTotalMonthsRef = useRef<number | null>(null);
  const prevYearRef = useRef<number | null>(null);
  const cityRef = useRef(cityBuildings);
  cityRef.current = cityBuildings;
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

    const mills = cityRef.current.filter((b) => b.typeId === 'mill');
    if (mills.length === 0) return;

    const next = { ...stateRef.current };
    let changed = false;
    let totalGoldSpent = 0;

    for (const millBuilding of mills) {
      const bState = next[millBuilding.id] || {};
      let nextMill: MillCapitalismState = bState.millState
        ? { ...bState.millState }
        : createDefaultMillState();
      let millChanged = false;

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
        millChanged = true;
      }

      if (monthChanged) {
        const summary = computeMillYieldSummary(nextMill, bState);
        const monthlyPayroll = summary.dailyPayrollCost * 30;
        const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
        let monthlyGrainCost = 0;

        const currentOrders = getMillGrainOrders(nextMill);
        const updatedOrders: MillSupplyOrder[] = [];

        for (const order of currentOrders) {
          if (!order || order.monthlyKg <= 0 || !order.supplierId) continue;

          if (order.supplierId.startsWith('trade_ship')) {
            const freeSpace = Math.max(0, nextMill.grainCapacityKg - nextMill.grainStockKg);
            const deliveredKg = Math.min(order.monthlyKg, freeSpace);
            if (deliveredKg > 0) {
              const meta = getContractMeta(order.contractType);
              const orderCost = Math.round(
                deliveredKg * 0.35 * 1.1 * (1 - meta.discountPercent / 100)
              );
              monthlyGrainCost += orderCost;
              totalGoldSpent += orderCost;
              nextMill = {
                ...nextMill,
                grainStockKg: nextMill.grainStockKg + deliveredKg,
              };
            }
          } else {
          const supplierState = next[order.supplierId];
          const supplierFarm = supplierState?.farmCapitalism;
          const cropKey = supplierFarm?.cropType || 'pszenica';
          const availableGrain =
            supplierFarm?.grainStockKg?.[cropKey] ?? supplierFarm?.wheatStockKg ?? 0;
          const freeSpace = Math.max(0, nextMill.grainCapacityKg - nextMill.grainStockKg);
          const deliveredKg = Math.min(order.monthlyKg, availableGrain, freeSpace);

          if (deliveredKg > 0 && supplierFarm) {
            const meta = getContractMeta(order.contractType);
            const orderCost = Math.round(
              deliveredKg * 0.35 * (1 - meta.discountPercent / 100)
            );
            monthlyGrainCost += orderCost;
            totalGoldSpent += orderCost;

            nextMill = {
              ...nextMill,
              grainStockKg: nextMill.grainStockKg + deliveredKg,
            };

            const nextCropStock = Math.max(0, availableGrain - deliveredKg);
            next[order.supplierId] = {
              ...supplierState,
              farmCapitalism: {
                ...supplierFarm,
                grainStockKg: {
                  ...supplierFarm.grainStockKg,
                  [cropKey]: nextCropStock,
                },
                wheatStockKg: nextCropStock,
              },
            };
          }

          // Zakup interwencyjny ze statku (+10% do ceny statku) dla brakującej części w tym miesiącu
          const desiredKg = Math.min(order.monthlyKg, freeSpace);
          const shortfallKg = Math.max(0, desiredKg - deliveredKg);
          if (nextMill.interventionBuyEnabled && shortfallKg > 0) {
            const shipPrice = 0.35 * 1.1;
            const interventionCost = Math.round(shortfallKg * shipPrice * 1.1);
            monthlyGrainCost += interventionCost;
            totalGoldSpent += interventionCost;
            nextMill = {
              ...nextMill,
              grainStockKg: nextMill.grainStockKg + shortfallKg,
            };
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: millBuilding.id,
              buyerLabel: millBuilding.name || 'Młyn Parowy',
              supplierId: order.supplierId,
              productLabel: 'Ziarno (interwencyjnie)',
              shortfallKg,
              costGbp: interventionCost,
            });
            changed = true;
          }
          }

          if (order.contractType !== 'pay_as_you_go') {
            const rem = Math.max(0, order.monthsRemaining - 1);
            if (rem > 0) updatedOrders.push({ ...order, monthsRemaining: rem });
          } else {
            updatedOrders.push(order);
          }
        }

        totalGoldSpent += monthlyPayroll + monthlyEnergy;
        const monthExpenses = monthlyPayroll + monthlyEnergy + monthlyGrainCost;

        nextMill = {
          ...nextMill,
          grainOrders: updatedOrders,
          grainOrder: updatedOrders[0],
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
        millChanged = true;
      }

      const isSunday = totalDays % 7 === 6;
      if (dayChanged && !isSunday) {
        const sizeTiles = millBuilding.sizeX * millBuilding.sizeY;
        const ready = checkIsMillProductionReady(nextMill, bState, sizeTiles);
        if (ready.isReady && nextMill.isMillingActive) {
          const summary = computeMillYieldSummary(nextMill, bState);
          const productCfg = MILL_PRODUCTS_CONFIG[nextMill.productTarget];
          const consumedGrain = Math.min(nextMill.grainStockKg, summary.dailyGrainInputKg);

          if (consumedGrain > 0) {
            const producedFlour = Math.round(consumedGrain * productCfg.flourYieldRatio);
            const producedBran = Math.round(consumedGrain * productCfg.branYieldRatio);
            const nextProgress = (nextMill.cycleProgressPercent + 10) % 100;

            nextMill = {
              ...nextMill,
              grainStockKg: nextMill.grainStockKg - consumedGrain,
              flourStockKg: Math.min(nextMill.flourCapacityKg, nextMill.flourStockKg + producedFlour),
              branStockKg: Math.min(nextMill.branCapacityKg, nextMill.branStockKg + producedBran),
              yearlyFlourKg: nextMill.yearlyFlourKg + producedFlour,
              yearlyBranKg: nextMill.yearlyBranKg + producedBran,
              flourQualityPercent: summary.qualityPercent,
              cycleProgressPercent: nextProgress,
              currentStage: getMillStageForProgress(nextProgress, nextMill.conditioningEnabled),
            };
            millChanged = true;
          }
        }
      }

      if (millChanged) {
        next[millBuilding.id] = { ...bState, millState: nextMill };
        changed = true;
      }
    }

    if (changed) setBuildingsState(next);
    if (totalGoldSpent > 0) setGold((g) => Math.max(0, g - totalGoldSpent));
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
