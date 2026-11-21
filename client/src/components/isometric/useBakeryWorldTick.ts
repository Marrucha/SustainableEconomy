import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getContractMeta } from './modal/industryContracts';
import { computeBakeryYieldSummary, getBakeryStageForProgress } from './modal/bakery/bakeryMath';
import {
  BAKERY_PRODUCTS_CONFIG,
  checkIsBakeryProductionReady,
  createDefaultBakeryState,
  getBakeryFlourOrders,
  type BakeryCapitalismState,
  type BakeryExtraSupplyOrder,
  type BakerySupplyOrder,
} from './modal/bakery/bakeryTypes';
import { MILL_PRODUCTS_CONFIG } from './modal/mill/millTypes';
import { appendShipInterventionLogToRecord } from './modal/TradeShipInterventionLogsTab';

interface UseBakeryWorldTickParams {
  clockDate: GameDate;
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

export function useBakeryWorldTick({
  clockDate,
  cityBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
}: UseBakeryWorldTickParams) {
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

    const bakeries = cityRef.current.filter((b) => b.typeId === 'bakery');
    if (bakeries.length === 0) return;

    const next = { ...stateRef.current };
    let changed = false;
    let totalGoldSpent = 0;

    for (const bakeryBuilding of bakeries) {
      const bState = next[bakeryBuilding.id] || {};
      let nextBakery: BakeryCapitalismState = bState.bakeryState
        ? { ...bState.bakeryState }
        : createDefaultBakeryState();
      let bakeryChanged = false;

      if (yearChanged && (nextBakery.yearlyBreadKg > 0 || nextBakery.yearlyRusksKg > 0)) {
        nextBakery = {
          ...nextBakery,
          annualHistory: [
            ...nextBakery.annualHistory,
            {
              year: year - 1,
              productTarget: nextBakery.productTarget,
              breadKg: nextBakery.yearlyBreadKg,
              rusksKg: nextBakery.yearlyRusksKg,
            },
          ],
          yearlyBreadKg: 0,
          yearlyRusksKg: 0,
        };
        bakeryChanged = true;
      }

      if (monthChanged) {
        const summary = computeBakeryYieldSummary(nextBakery, bState);
        const monthlyPayroll = summary.dailyPayrollCost * 30;
        const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
        let monthlyFlourCost = 0;

        const currentOrders = getBakeryFlourOrders(nextBakery);
        const updatedOrders: BakerySupplyOrder[] = [];

        for (const order of currentOrders) {
          if (!order || order.monthlyKg <= 0 || !order.supplierId) continue;

          if (order.supplierId.startsWith('trade_ship')) {
            const freeSpace = Math.max(0, nextBakery.flourCapacityKg - nextBakery.flourStockKg);
            const deliveredKg = Math.min(order.monthlyKg, freeSpace);
            if (deliveredKg > 0) {
              const meta = getContractMeta(order.contractType);
              const orderCost = Math.round(
                deliveredKg * 1.5 * 1.1 * (1 - meta.discountPercent / 100)
              );
              monthlyFlourCost += orderCost;
              totalGoldSpent += orderCost;
              nextBakery = {
                ...nextBakery,
                flourStockKg: nextBakery.flourStockKg + deliveredKg,
              };
            }
          } else {
          const supplierState = next[order.supplierId];
          const supplierMill = supplierState?.millState;
          const availableFlour = supplierMill?.flourStockKg ?? 0;
          const freeSpace = Math.max(0, nextBakery.flourCapacityKg - nextBakery.flourStockKg);
          const deliveredKg = Math.min(order.monthlyKg, availableFlour, freeSpace);

          if (deliveredKg > 0 && supplierMill) {
            const meta = getContractMeta(order.contractType);
            const millCfg =
              MILL_PRODUCTS_CONFIG[supplierMill.productTarget] ||
              MILL_PRODUCTS_CONFIG.maka_pszenna;
            const basePrice = supplierMill.flourPricePerKg || millCfg.defaultPricePerKg;
            const orderCost = Math.round(
              deliveredKg * basePrice * (1 - meta.discountPercent / 100)
            );
            monthlyFlourCost += orderCost;
            totalGoldSpent += orderCost;

            nextBakery = {
              ...nextBakery,
              flourStockKg: nextBakery.flourStockKg + deliveredKg,
            };

            next[order.supplierId] = {
              ...supplierState,
              millState: {
                ...supplierMill,
                flourStockKg: Math.max(0, availableFlour - deliveredKg),
                totalRevenue: supplierMill.totalRevenue + orderCost,
              },
            };
          }

          // Zakup interwencyjny ze statku (+10% do ceny statku) dla brakującej części w tym miesiącu
          const desiredKg = Math.min(order.monthlyKg, freeSpace);
          const shortfallKg = Math.max(0, desiredKg - deliveredKg);
          if (nextBakery.interventionBuyEnabled && shortfallKg > 0) {
            const shipPrice = 1.5 * 1.1; // cena statku
            const interventionCost = Math.round(shortfallKg * shipPrice * 1.1); // +10% do ceny statku
            monthlyFlourCost += interventionCost;
            totalGoldSpent += interventionCost;
            nextBakery = {
              ...nextBakery,
              flourStockKg: nextBakery.flourStockKg + shortfallKg,
            };
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: bakeryBuilding.id,
              buyerLabel: bakeryBuilding.name || 'Piekarnia Rzemieślnicza',
              supplierId: order.supplierId,
              productLabel: 'Mąka (interwencyjnie)',
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

        // Realizacja kontraktów na składniki pomocnicze (sól, drożdże, masło, cukier)
        const extraPrices: Record<string, number> = { salt: 0.8, yeast: 1.2, butter: 2.2, sugar: 2.4 };
        const updatedExtraOrders: BakeryExtraSupplyOrder[] = [];
        for (const eOrd of nextBakery.extraOrders || []) {
          const isShip = eOrd.supplierId.startsWith('trade_ship');
          const meta = getContractMeta(eOrd.contractType);
          const stockKey = `${eOrd.ingredient}StockKg` as keyof BakeryCapitalismState;
          const capKey = `${eOrd.ingredient}CapacityKg` as keyof BakeryCapitalismState;
          const curStock = Number(nextBakery[stockKey] ?? 0);
          const cap = Number(nextBakery[capKey] ?? 500);
          const delivered = Math.min(eOrd.monthlyKg, Math.max(0, cap - curStock));
          if (delivered > 0) {
            const unitPrice = (extraPrices[eOrd.ingredient] ?? 1) * (isShip ? 1.1 : 1.0);
            const cost = Math.round(delivered * unitPrice * (1 - meta.discountPercent / 100));
            monthlyFlourCost += cost;
            totalGoldSpent += cost;
            nextBakery = {
              ...nextBakery,
              [stockKey]: curStock + delivered,
            };
          }
          if (eOrd.contractType !== 'pay_as_you_go') {
            const rem = Math.max(0, eOrd.monthsRemaining - 1);
            if (rem > 0) updatedExtraOrders.push({ ...eOrd, monthsRemaining: rem });
          } else {
            updatedExtraOrders.push(eOrd);
          }
        }

        totalGoldSpent += monthlyPayroll + monthlyEnergy;
        const monthExpenses = monthlyPayroll + monthlyEnergy + monthlyFlourCost;

        nextBakery = {
          ...nextBakery,
          flourOrders: updatedOrders,
          extraOrders: updatedExtraOrders,
          totalExpenses: nextBakery.totalExpenses + monthExpenses,
          monthlyFinanceHistory: [
            ...nextBakery.monthlyFinanceHistory.slice(-11),
            {
              year,
              month,
              revenue: 0,
              flourCost: monthlyFlourCost,
              payrollCost: monthlyPayroll,
              energyCost: monthlyEnergy,
            },
          ],
        };
        bakeryChanged = true;
      }

      const isSunday = totalDays % 7 === 6;
      if (dayChanged && !isSunday) {
        const sizeTiles = bakeryBuilding.sizeX * bakeryBuilding.sizeY;
        const ready = checkIsBakeryProductionReady(nextBakery, bState, sizeTiles);
        if (ready.isReady && nextBakery.isBakingActive) {
          const summary = computeBakeryYieldSummary(nextBakery, bState);
          const productCfg = BAKERY_PRODUCTS_CONFIG[nextBakery.productTarget];
          const consumedFlour = Math.min(nextBakery.flourStockKg, summary.dailyFlourInputKg);

          if (consumedFlour > 0) {
            const producedBread = Math.round(
              (consumedFlour * productCfg.breadYieldRatio) / productCfg.unitWeightKg
            );
            const producedRusks = Math.round(consumedFlour * productCfg.rusksYieldRatio);
            const nextProgress = Number(((nextBakery.cycleProgressPercent + 100 / 7) % 100).toFixed(2));

            nextBakery = {
              ...nextBakery,
              flourStockKg: nextBakery.flourStockKg - consumedFlour,
              breadStockKg: Math.min(
                nextBakery.breadCapacityKg,
                nextBakery.breadStockKg + producedBread
              ),
              rusksStockKg: Math.min(
                nextBakery.rusksCapacityKg,
                nextBakery.rusksStockKg + producedRusks
              ),
              yearlyBreadKg: nextBakery.yearlyBreadKg + producedBread,
              yearlyRusksKg: nextBakery.yearlyRusksKg + producedRusks,
              breadQualityPercent: summary.qualityPercent,
              cycleProgressPercent: nextProgress,
              currentStage: getBakeryStageForProgress(nextProgress, nextBakery.proofingEnabled),
            };
            bakeryChanged = true;
          }
        }
      }

      if (bakeryChanged) {
        next[bakeryBuilding.id] = { ...bState, bakeryState: nextBakery };
        changed = true;
      }
    }

    if (changed) setBuildingsState(next);
    if (totalGoldSpent > 0) setGold((g) => Math.max(0, g - totalGoldSpent));
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
