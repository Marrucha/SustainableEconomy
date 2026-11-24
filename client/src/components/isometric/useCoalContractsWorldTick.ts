import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getContractMeta } from './modal/industryContracts';
import { SCALE_CONFIG } from './modal/energyConfig';
import { MINE_DEPOSITS } from './modal/mine/mineTypes';
import { appendShipInterventionLogToRecord } from './modal/TradeShipInterventionLogsTab';
import { loadGameParameters } from './admin/gameParameters';
import { tickWorkingHorsesMonth } from './modal/horseEnergyMath';
import { getManureBinCapacityKg } from './modal/farmGridTypes';
import { computeProductionChecklist } from './modal/productionChecklist';

function isCoalOrCharcoalProductionRunning(b: PlacedBuilding, bState: BuildingState): boolean {
  if (b.typeId === 'mill' && !bState.millState?.isMillingActive) return false;
  if (b.typeId === 'bakery' && !bState.bakeryState?.isBakingActive) return false;
  if (b.typeId.startsWith('mine_') && !bState.mineCapitalism?.isMiningActive) return false;
  return computeProductionChecklist(b, bState).allPassed;
}

interface UseCoalContractsWorldTickParams {
  clockDate: GameDate;
  allBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

export function useCoalContractsWorldTick({
  clockDate,
  allBuildings,
  setBuildingsState,
  setGold,
}: UseCoalContractsWorldTickParams) {
  const prevTotalMonthsRef = useRef<number | null>(null);
  const prevTotalDaysRef = useRef<number | null>(null);
  const buildingsRef = useRef(allBuildings);
  buildingsRef.current = allBuildings;

  useEffect(() => {
    const totalMonths = clockDate.year * 12 + clockDate.month;
    const totalDays = clockDate.year * 360 + (clockDate.month - 1) * 30 + clockDate.day;
    if (prevTotalMonthsRef.current === null || prevTotalDaysRef.current === null) {
      prevTotalMonthsRef.current = totalMonths;
      prevTotalDaysRef.current = totalDays;
      return;
    }
    const isNewMonth = totalMonths !== prevTotalMonthsRef.current;
    const isNewDay = totalDays !== prevTotalDaysRef.current;
    if (!isNewMonth && !isNewDay) return;
    prevTotalMonthsRef.current = totalMonths;
    prevTotalDaysRef.current = totalDays;

    setBuildingsState((prev) => {
      const next = { ...prev };
      let changed = false;
      let totalGoldSpent = 0;

    if (isNewDay) {
      const dailyFeedKg = loadGameParameters().horseDailyFeedKg || 10;
      for (const b of buildingsRef.current) {
        const bState = next[b.id];
        if (!bState) continue;
        let dayChanged = false;
        let nextHorseFeed = bState.horseFeedStockKg ?? 0;
        let nextHorseStraw = bState.horseStrawStockKg ?? 0;
        let nextCoal = bState.coalStockTons ?? 0;
        let nextCharcoal = bState.charcoalStockTons ?? 0;

        if (bState.ownedHorses && bState.ownedHorses.length > 0) {
          const activeCount = bState.ownedHorses.filter((h) => !h.isDeceased).length;
          if (activeCount > 0 && nextHorseFeed > 0) {
            const updatedFeed = Math.max(0, Number((nextHorseFeed - activeCount * dailyFeedKg).toFixed(2)));
            if (updatedFeed !== nextHorseFeed) {
              nextHorseFeed = updatedFeed;
              dayChanged = true;
            }
          }
          if (activeCount > 0 && nextHorseStraw > 0) {
            // Konie energetyczne zużywają 15 kg ściółki/dzień na sztukę (bez produkcji obornika)
            const updatedStraw = Math.max(0, Number((nextHorseStraw - activeCount * 15).toFixed(2)));
            if (updatedStraw !== nextHorseStraw) {
              nextHorseStraw = updatedStraw;
              dayChanged = true;
            }
          }
        }

        const isFuelProductionRunning =
          (bState.businessEnergySource === 'wegiel' || bState.businessEnergySource === 'wegiel_drzewny') &&
          isCoalOrCharcoalProductionRunning(b, bState);

        if (bState.businessEnergySource === 'wegiel' && nextCoal > 0 && isFuelProductionRunning) {
          const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
          const dailyBurn = (2.4 * scaleMult) / 30;
          const updatedCoal = Number(Math.max(0, nextCoal - dailyBurn).toFixed(3));
          if (updatedCoal !== nextCoal) {
            nextCoal = updatedCoal;
            dayChanged = true;
          }
        }

        if (bState.businessEnergySource === 'wegiel_drzewny' && nextCharcoal > 0 && isFuelProductionRunning) {
          const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
          const dailyBurn = (1.8 * scaleMult) / 30;
          const updatedCharcoal = Number(Math.max(0, nextCharcoal - dailyBurn).toFixed(3));
          if (updatedCharcoal !== nextCharcoal) {
            nextCharcoal = updatedCharcoal;
            dayChanged = true;
          }
        }

        if (dayChanged) {
          next[b.id] = {
            ...bState,
            horseFeedStockKg: nextHorseFeed,
            horseStrawStockKg: nextHorseStraw,
            coalStockTons: nextCoal,
            charcoalStockTons: nextCharcoal,
          };
          changed = true;
        }
      }
    }

    if (isNewMonth) {
      for (const b of buildingsRef.current) {
      const bState = next[b.id];
      if (!bState) continue;
      let nextStock = bState.coalStockTons ?? 0;
      let nextOrder = bState.coalOrder;
      let nextCharcoalStock = bState.charcoalStockTons ?? 0;
      let nextCharcoalOrder = bState.charcoalOrder;
      let nextHorseFeedStock = bState.horseFeedStockKg ?? 0;
      let nextHorseFeedOrder = bState.horseFeedOrder;
      let nextHorseStrawStock = bState.horseStrawStockKg ?? 0;
      let nextHorseStrawOrder = bState.horseStrawOrder;
      let bChanged = false;

      if (nextOrder && nextOrder.monthlyTons > 0) {
        const meta = getContractMeta(nextOrder.contractType);
        const shipPricePerTon = MINE_DEPOSITS.coal.basePricePerTon * 1.1;
        const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
        const coalCapTons = Math.max(10, Math.ceil(2.4 * scaleMult * 4));
        const freeCoalSpace = Number(Math.max(0, coalCapTons - nextStock).toFixed(2));

        if (nextOrder.supplierId.startsWith('trade_ship')) {
          const delivered = Number(Math.min(nextOrder.monthlyTons, freeCoalSpace).toFixed(2));
          if (delivered > 0) {
            const cost = Number(
              (delivered * shipPricePerTon * (1 - meta.discountPercent / 100)).toFixed(2)
            );
            nextStock = Number((nextStock + delivered).toFixed(2));
            totalGoldSpent += cost;
            bChanged = true;
          }
        } else {
          const supplierState = next[nextOrder.supplierId];
          const avail = supplierState?.mineStock ?? 0;
          const delivered = Number(Math.min(nextOrder.monthlyTons, avail, freeCoalSpace).toFixed(2));
          const unitPrice =
            supplierState?.mineCapitalism?.pricePerTon ?? MINE_DEPOSITS.coal.basePricePerTon;

          if (delivered > 0 && supplierState) {
            const cost = Number(
              (delivered * unitPrice * (1 - meta.discountPercent / 100)).toFixed(2)
            );
            nextStock = Number((nextStock + delivered).toFixed(2));
            totalGoldSpent += cost;
            next[nextOrder.supplierId] = {
              ...supplierState,
              mineStock: Number(Math.max(0, avail - delivered).toFixed(2)),
              ...(supplierState.mineCapitalism
                ? {
                    mineCapitalism: {
                      ...supplierState.mineCapitalism,
                      totalRevenue: Number(
                        (supplierState.mineCapitalism.totalRevenue + cost).toFixed(2)
                      ),
                    },
                  }
                : {}),
            };
            bChanged = true;
          }

          const desiredTons = Number(Math.min(nextOrder.monthlyTons, freeCoalSpace).toFixed(2));
          const shortfall = Number(Math.max(0, desiredTons - delivered).toFixed(2));
          if (bState.coalInterventionBuyEnabled && shortfall > 0) {
            const intCost = Number((shortfall * shipPricePerTon * 1.1).toFixed(2));
            nextStock = Number((nextStock + shortfall).toFixed(2));
            totalGoldSpent += intCost;
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: b.id,
              buyerLabel: b.name || b.typeId,
              supplierId: nextOrder.supplierId,
              productLabel: 'Węgiel kamienny (interwencyjnie)',
              shortfallKg: Math.round(shortfall * 1000),
              costGbp: intCost,
            });
            bChanged = true;
          }
        }

        if (meta.durationMonths > 0) {
          const rem = nextOrder.monthsRemaining - 1;
          nextOrder = rem > 0 ? { ...nextOrder, monthsRemaining: rem } : undefined;
          bChanged = true;
        }
      }

      if (nextCharcoalOrder && nextCharcoalOrder.monthlyTons > 0) {
        const meta = getContractMeta(nextCharcoalOrder.contractType);
        const shipCharcoalPrice = 6.0 * 1.1;
        const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
        const charcoalCapTons = Math.max(10, Math.ceil(1.8 * scaleMult * 4));
        const freeCharcoalSpace = Number(Math.max(0, charcoalCapTons - nextCharcoalStock).toFixed(2));
        const delivered = Number(Math.min(nextCharcoalOrder.monthlyTons, freeCharcoalSpace).toFixed(2));
        if (delivered > 0) {
          const cost = Number(
            (delivered * shipCharcoalPrice * (1 - meta.discountPercent / 100)).toFixed(2)
          );
          nextCharcoalStock = Number((nextCharcoalStock + delivered).toFixed(2));
          totalGoldSpent += cost;
          bChanged = true;
        }
        if (meta.durationMonths > 0) {
          const rem = nextCharcoalOrder.monthsRemaining - 1;
          nextCharcoalOrder = rem > 0 ? { ...nextCharcoalOrder, monthsRemaining: rem } : undefined;
          bChanged = true;
        }
      }

      if (bState.businessEnergySource === 'wegiel' && bState.coalInterventionBuyEnabled && (!nextOrder || nextOrder.monthlyTons <= 0)) {
        const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
        const monthlyNeed = Number((2.4 * scaleMult).toFixed(2));
        if (nextStock < monthlyNeed) {
          const shortfall = Number((monthlyNeed - nextStock).toFixed(2));
          const shipPricePerTon = MINE_DEPOSITS.coal.basePricePerTon * 1.1;
          const intCost = Number((shortfall * shipPricePerTon * 1.1).toFixed(2));
          nextStock = Number((nextStock + shortfall).toFixed(2));
          totalGoldSpent += intCost;
          appendShipInterventionLogToRecord(next, {
            year: clockDate.year,
            month: clockDate.month,
            buyerId: b.id,
            buyerLabel: b.name || b.typeId,
            supplierId: 'trade_ship',
            productLabel: 'Węgiel kamienny (interwencyjnie)',
            shortfallKg: Math.round(shortfall * 1000),
            costGbp: intCost,
          });
          bChanged = true;
        }
      }

      if (nextHorseFeedOrder && nextHorseFeedOrder.monthlyKg > 0) {
        const meta = getContractMeta(nextHorseFeedOrder.contractType);
        const freeSpace = Math.max(0, 10000 - nextHorseFeedStock);
        if (nextHorseFeedOrder.supplierId.startsWith('trade_ship')) {
          const delivered = Math.min(nextHorseFeedOrder.monthlyKg, freeSpace);
          if (delivered > 0) {
            const cost = Number(
              ((delivered / 100) * 11 * (1 - meta.discountPercent / 100)).toFixed(2)
            );
            nextHorseFeedStock += delivered;
            totalGoldSpent += cost;
            bChanged = true;
          }
        } else {
          const supState = next[nextHorseFeedOrder.supplierId];
          const millSt = supState?.millState;
          const farmCap = supState?.farmCapitalism;
          let deliveredKg = 0;
          if (millSt) {
            const avail = millSt.branStockKg ?? 0;
            const delivered = Math.min(nextHorseFeedOrder.monthlyKg, avail, freeSpace);
            deliveredKg = delivered;
            if (delivered > 0) {
              const cost = Number(
                ((delivered / 100) * ((millSt.branPricePerKg ?? 0.45) * 100) * (1 - meta.discountPercent / 100)).toFixed(2)
              );
              nextHorseFeedStock += delivered;
              totalGoldSpent += cost;
              next[nextHorseFeedOrder.supplierId] = {
                ...supState,
                millState: {
                  ...millSt,
                  branStockKg: Math.max(0, avail - delivered),
                  totalRevenue: millSt.totalRevenue + cost,
                },
              };
              bChanged = true;
            }
          } else if (farmCap) {
            const cropKey = farmCap.cropType || 'pszenica';
            const avail = farmCap.grainStockKg?.[cropKey] ?? farmCap.wheatStockKg ?? 0;
            const delivered = Math.min(nextHorseFeedOrder.monthlyKg, avail, freeSpace);
            deliveredKg = delivered;
            if (delivered > 0) {
              const cost = Number(
                ((delivered / 100) * 10 * (1 - meta.discountPercent / 100)).toFixed(2)
              );
              nextHorseFeedStock += delivered;
              totalGoldSpent += cost;
              next[nextHorseFeedOrder.supplierId] = {
                ...supState,
                farmCapitalism: {
                  ...farmCap,
                  grainStockKg: {
                    ...farmCap.grainStockKg,
                    [cropKey]: Math.max(0, (farmCap.grainStockKg?.[cropKey] ?? 0) - delivered),
                  },
                  wheatStockKg: Math.max(0, (farmCap.wheatStockKg ?? 0) - delivered),
                  lastCycleRevenue: Number(((farmCap.lastCycleRevenue || 0) + cost).toFixed(2)),
                },
              };
              bChanged = true;
            }
          }

          const shortfallKg = Math.max(0, Math.min(nextHorseFeedOrder.monthlyKg, freeSpace) - deliveredKg);
          if (bState.horseFeedInterventionBuyEnabled !== false && shortfallKg > 0) {
            const intCost = Number(((shortfallKg / 100) * 11 * 1.1).toFixed(2));
            nextHorseFeedStock += shortfallKg;
            totalGoldSpent += intCost;
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: b.id,
              buyerLabel: b.name || b.typeId,
              supplierId: nextHorseFeedOrder.supplierId,
              productLabel: 'Pasza dla koni (interwencyjnie)',
              shortfallKg,
              costGbp: intCost,
            });
            bChanged = true;
          }
        }
        if (meta.durationMonths > 0) {
          const rem = nextHorseFeedOrder.monthsRemaining - 1;
          nextHorseFeedOrder = rem > 0 ? { ...nextHorseFeedOrder, monthsRemaining: rem } : undefined;
          bChanged = true;
        }
      }

      if (nextHorseStrawOrder && nextHorseStrawOrder.monthlyKg > 0) {
        const meta = getContractMeta(nextHorseStrawOrder.contractType);
        const freeSpace = Math.max(0, 10000 - nextHorseStrawStock);
        if (nextHorseStrawOrder.supplierId.startsWith('trade_ship')) {
          const delivered = Math.min(nextHorseStrawOrder.monthlyKg, freeSpace);
          if (delivered > 0) {
            const cost = Number(
              ((delivered / 100) * 6.6 * (1 - meta.discountPercent / 100)).toFixed(2)
            );
            nextHorseStrawStock += delivered;
            totalGoldSpent += cost;
            bChanged = true;
          }
        } else {
          const supState = next[nextHorseStrawOrder.supplierId];
          const farmCap = supState?.farmCapitalism;
          let deliveredKg = 0;
          if (farmCap) {
            const avail = farmCap.strawStockKg ?? 0;
            const delivered = Math.min(nextHorseStrawOrder.monthlyKg, avail, freeSpace);
            deliveredKg = delivered;
            if (delivered > 0) {
              const cost = Number(
                ((delivered / 100) * 6 * (1 - meta.discountPercent / 100)).toFixed(2)
              );
              nextHorseStrawStock += delivered;
              totalGoldSpent += cost;
              next[nextHorseStrawOrder.supplierId] = {
                ...supState,
                farmCapitalism: {
                  ...farmCap,
                  strawStockKg: Math.max(0, avail - delivered),
                  lastCycleRevenue: Number(((farmCap.lastCycleRevenue || 0) + cost).toFixed(2)),
                },
              };
              bChanged = true;
            }
          }
          const shortfallKg = Math.max(0, nextHorseStrawOrder.monthlyKg - deliveredKg);
          if (bState.horseFeedInterventionBuyEnabled !== false && shortfallKg > 0 && freeSpace - deliveredKg > 0) {
            const intQty = Math.min(shortfallKg, freeSpace - deliveredKg);
            const intCost = Number(((intQty / 100) * 6.6 * 1.1).toFixed(2));
            nextHorseStrawStock += intQty;
            totalGoldSpent += intCost;
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: b.id,
              buyerLabel: b.name || b.typeId,
              supplierId: nextHorseStrawOrder.supplierId,
              productLabel: 'Ściółka dla koni (interwencyjnie)',
              shortfallKg: intQty,
              costGbp: intCost,
            });
            bChanged = true;
          }
        }
        if (meta.durationMonths > 0) {
          const rem = nextHorseStrawOrder.monthsRemaining - 1;
          nextHorseStrawOrder = rem > 0 ? { ...nextHorseStrawOrder, monthsRemaining: rem } : undefined;
          bChanged = true;
        }
      }

      let nextOwnedHorses = bState.ownedHorses;
      if (nextOwnedHorses && nextOwnedHorses.length > 0) {
        const dailyFeedKg = loadGameParameters().horseDailyFeedKg || 10;
        const activeHorsesCount = nextOwnedHorses.filter((h) => !h.isDeceased).length;
        const monthlyHorseNeedKg = Math.round(activeHorsesCount * dailyFeedKg * 30);
        if (bState.horseFeedInterventionBuyEnabled !== false && activeHorsesCount > 0 && nextHorseFeedStock < monthlyHorseNeedKg) {
          const shortfallKg = Math.min(10000 - nextHorseFeedStock, monthlyHorseNeedKg - nextHorseFeedStock);
          if (shortfallKg > 0) {
            const intCost = Number(((shortfallKg / 100) * 11 * 1.1).toFixed(2));
            nextHorseFeedStock += shortfallKg;
            totalGoldSpent += intCost;
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: b.id,
              buyerLabel: b.name || b.typeId,
              supplierId: 'trade_ship',
              productLabel: 'Pasza dla koni (interwencyjnie)',
              shortfallKg,
              costGbp: intCost,
            });
            bChanged = true;
          }
        }
        const monthlyStrawNeedKg = activeHorsesCount * 15 * 30;
        if (bState.horseFeedInterventionBuyEnabled !== false && activeHorsesCount > 0 && nextHorseStrawStock < monthlyStrawNeedKg) {
          const shortfallKg = Math.min(10000 - nextHorseStrawStock, monthlyStrawNeedKg - nextHorseStrawStock);
          if (shortfallKg > 0) {
            const intCost = Number(((shortfallKg / 100) * 6.6 * 1.1).toFixed(2));
            nextHorseStrawStock += shortfallKg;
            totalGoldSpent += intCost;
            appendShipInterventionLogToRecord(next, {
              year: clockDate.year,
              month: clockDate.month,
              buyerId: b.id,
              buyerLabel: b.name || b.typeId,
              supplierId: 'trade_ship',
              productLabel: 'Ściółka dla koni (interwencyjnie)',
              shortfallKg,
              costGbp: intCost,
            });
            bChanged = true;
          }
        }
        const tickRes = tickWorkingHorsesMonth(
          nextOwnedHorses,
          nextHorseFeedStock,
          dailyFeedKg,
          clockDate.month === 1
        );
        if (tickRes.changed) {
          nextOwnedHorses = tickRes.nextHorses;
          nextHorseFeedStock = tickRes.remainingFeedKg;
          bChanged = true;
        }
      }

      let nextFarmCap = bState.farmCapitalism;
      if (b.typeId === 'wheat_farm' && nextFarmCap?.manureOrder) {
        const order = nextFarmCap.manureOrder;
        const meta = getContractMeta(order.contractType);
        const supState = next[order.supplierId]?.livestockState;
        let delivered = 0;
        let cost = 0;
        if (supState) {
          const capKg = getManureBinCapacityKg(nextFarmCap.manureLevel ?? 1);
          const spaceLeft = Math.max(0, capKg - (nextFarmCap.manureStockKg || 0));
          const avail = supState.storage?.manureKg ?? 0;
          delivered = Math.min(order.monthlyQuantityKg, avail, spaceLeft);
          const pricePer100 = nextFarmCap.manurePricePer100Kg ?? 12;
          cost =
            delivered > 0
              ? Number(((delivered / 100) * pricePer100 * (1 - meta.discountPercent / 100)).toFixed(2))
              : 0;
          if (delivered > 0) {
            totalGoldSpent += cost;
            next[order.supplierId] = {
              ...next[order.supplierId],
              livestockState: {
                ...supState,
                storage: {
                  ...supState.storage,
                  manureKg: Math.max(0, avail - delivered),
                },
                lastCycleRevenue: Number(((supState.lastCycleRevenue || 0) + cost).toFixed(2)),
              },
            };
          }
        }
        const nextOrder =
          meta.durationMonths > 0
            ? order.monthsRemaining - 1 > 0
              ? { ...order, monthsRemaining: order.monthsRemaining - 1 }
              : undefined
            : order;
        nextFarmCap = {
          ...nextFarmCap,
          manureStockKg: (nextFarmCap.manureStockKg || 0) + delivered,
          manureOrder: nextOrder,
          lastCycleCost: Number(((nextFarmCap.lastCycleCost || 0) + cost).toFixed(2)),
        };
        bChanged = true;
      }

      if (bChanged) {
        next[b.id] = {
          ...bState,
          coalStockTons: nextStock,
          coalOrder: nextOrder,
          charcoalStockTons: nextCharcoalStock,
          charcoalOrder: nextCharcoalOrder,
          horseFeedStockKg: nextHorseFeedStock,
          horseFeedOrder: nextHorseFeedOrder,
          horseStrawStockKg: nextHorseStrawStock,
          horseStrawOrder: nextHorseStrawOrder,
          ownedHorses: nextOwnedHorses,
          ...(nextFarmCap ? { farmCapitalism: nextFarmCap } : {}),
        };
        changed = true;
      }
      }
    }

      if (totalGoldSpent > 0) {
        const spent = Number(totalGoldSpent.toFixed(2));
        queueMicrotask(() => setGold((g) => Math.max(0, Number((g - spent).toFixed(2)))));
      }

      return changed ? next : prev;
    });
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
