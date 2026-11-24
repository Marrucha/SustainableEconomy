import type { BuildingState, ShipInterventionLogEntry } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getContractMeta } from './modal/industryContracts';
import { loadGameParameters } from './admin/gameParameters';
import { resolveTradeShipStateId } from './modal/TradeShipInterventionLogsTab';
import type { LivestockCapitalismState } from './modal/livestock/livestockTypes';

type LivestockSupplyOrder = NonNullable<LivestockCapitalismState['feedOrder']>;

export function processMonthlyLivestockSupply(
  farmId: string,
  nextMap: Record<string, BuildingState>,
  clockDate: GameDate
): { totalCost: number; changed: boolean } {
  const bState = nextMap[farmId];
  const livestockState = bState?.livestockState;
  if (!livestockState) return { totalCost: 0, changed: false };

  const supplies = livestockState.supplies || { strawBeddingKg: 0, feedGrainKg: 0 };
  let nextFeed = supplies.feedGrainKg || 0;
  let nextStraw = supplies.strawBeddingKg || 0;
  let totalCost = 0;
  const pendingShipLogs: ShipInterventionLogEntry[] = [];

  const fulfill = (
    order: LivestockSupplyOrder,
    kind: 'feed' | 'straw'
  ): LivestockSupplyOrder | undefined => {
    const meta = getContractMeta(order.contractType);
    if (order.supplierId.startsWith('trade_ship')) {
      const delivered = order.monthlyQuantityKg;
      if (delivered > 0) {
        if (kind === 'feed') nextFeed += delivered;
        else nextStraw += delivered;
        const basePer100 = kind === 'feed' ? 11 : 6.6;
        totalCost += Number(
          ((delivered / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
        );
      }
      if (meta.durationMonths > 0) {
        const rem = order.monthsRemaining - 1;
        return rem > 0 ? { ...order, monthsRemaining: rem } : undefined;
      }
      return order;
    }

    const millHolder = nextMap[order.supplierId];
    const millState = millHolder?.millState;
    if (kind === 'feed' && millState) {
      const availBran = millState.branStockKg ?? 0;
      const delivered = Math.min(order.monthlyQuantityKg, availBran);
      if (delivered > 0) {
        nextFeed += delivered;
        const basePer100 = (millState.branPricePerKg ?? 0.45) * 100;
        const orderCost = Number(
          ((delivered / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
        );
        totalCost += orderCost;
        nextMap[order.supplierId] = {
          ...millHolder,
          millState: {
            ...millState,
            branStockKg: Math.max(0, availBran - delivered),
            totalRevenue: millState.totalRevenue + orderCost,
          },
        };
      }
      const shortfallBran = Math.max(0, order.monthlyQuantityKg - delivered);
      if (livestockState.interventionBuyEnabled && shortfallBran > 0) {
        nextFeed += shortfallBran;
        const intCost = Number(((shortfallBran / 100) * 11 * 1.1).toFixed(2));
        totalCost += intCost;
        pendingShipLogs.push({
          id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          year: clockDate.year,
          month: clockDate.month,
          buyerId: farmId,
          buyerLabel: 'Ferma Hodowlana',
          supplierId: order.supplierId,
          productLabel: 'Otręby / Pasza (interwencyjnie)',
          shortfallKg: shortfallBran,
          costGbp: intCost,
        });
      }
      if (meta.durationMonths > 0) {
        const rem = order.monthsRemaining - 1;
        return rem > 0 ? { ...order, monthsRemaining: rem } : undefined;
      }
      return order;
    }

    const producerHolder = nextMap[order.supplierId];
    const producerCap = producerHolder?.farmCapitalism;
    if (!producerCap) return order;

    const cropKey = producerCap.cropType || 'pszenica';
    const avail =
      kind === 'feed'
        ? (producerCap.grainStockKg?.[cropKey] ?? producerCap.wheatStockKg ?? 0)
        : (producerCap.strawStockKg ?? 0);
    const delivered = Math.min(order.monthlyQuantityKg, avail);
    if (delivered > 0) {
      if (kind === 'feed') nextFeed += delivered;
      else nextStraw += delivered;
      const basePer100 = kind === 'feed' ? 10 : 6;
      const orderCost = Number(
        ((delivered / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
      );
      totalCost += orderCost;
      nextMap[order.supplierId] = {
        ...producerHolder,
        farmCapitalism: {
          ...producerCap,
          ...(kind === 'feed'
            ? {
                grainStockKg: {
                  ...producerCap.grainStockKg,
                  [cropKey]: Math.max(0, (producerCap.grainStockKg?.[cropKey] ?? 0) - delivered),
                },
                wheatStockKg: Math.max(0, (producerCap.wheatStockKg ?? 0) - delivered),
              }
            : { strawStockKg: Math.max(0, avail - delivered) }),
          lastCycleRevenue: Number(((producerCap.lastCycleRevenue || 0) + orderCost).toFixed(2)),
        },
      };
    }

    const shortfallFarm = Math.max(0, order.monthlyQuantityKg - delivered);
    if (livestockState.interventionBuyEnabled && shortfallFarm > 0) {
      if (kind === 'feed') nextFeed += shortfallFarm;
      else nextStraw += shortfallFarm;
      const shipPer100 = kind === 'feed' ? 11 : 6.6;
      const intCost = Number(((shortfallFarm / 100) * shipPer100 * 1.1).toFixed(2));
      totalCost += intCost;
      pendingShipLogs.push({
        id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        year: clockDate.year,
        month: clockDate.month,
        buyerId: farmId,
        buyerLabel: 'Ferma Hodowlana',
        supplierId: order.supplierId,
        productLabel:
          kind === 'feed' ? 'Pasza / Ziarno (interwencyjnie)' : 'Ściółka / Słoma (interwencyjnie)',
        shortfallKg: shortfallFarm,
        costGbp: intCost,
      });
    }

    if (meta.durationMonths > 0) {
      const rem = order.monthsRemaining - 1;
      return rem > 0 ? { ...order, monthsRemaining: rem } : undefined;
    }
    return order;
  };

  const params = loadGameParameters();
  const feedHeapCap = params.grainSiloBaseCapacityKg || 10000;
  const strawHeapCap = params.strawStackBaseCapacityKg || 20000;
  const rawFeedOrders = livestockState.feedOrders ?? (livestockState.feedOrder ? [livestockState.feedOrder] : []);
  const rawStrawOrders = livestockState.strawOrders ?? (livestockState.strawOrder ? [livestockState.strawOrder] : []);

  const nextFeedOrders = rawFeedOrders
    .map((o) => fulfill(o, 'feed'))
    .filter((o): o is LivestockSupplyOrder => Boolean(o));
  const nextStrawOrders = rawStrawOrders
    .map((o) => fulfill(o, 'straw'))
    .filter((o): o is LivestockSupplyOrder => Boolean(o));

  nextFeed = Math.min(feedHeapCap, nextFeed);
  nextStraw = Math.min(strawHeapCap, nextStraw);

  if (livestockState.interventionBuyEnabled && livestockState.activeSpecies === 'horses') {
    const aliveHorses = (livestockState.herd.horses || []).filter((h) => !h.isDeceased).length;
    if (aliveHorses > 0) {
      const monthlyFeedNeed = Math.round(aliveHorses * (params.horseDailyFeedKg || 10) * 30);
      if (nextFeed < monthlyFeedNeed) {
        const extraFeed = Math.min(feedHeapCap - nextFeed, monthlyFeedNeed - nextFeed);
        if (extraFeed > 0) {
          nextFeed += extraFeed;
          const extraCost = Number(((extraFeed / 100) * 11 * 1.1).toFixed(2));
          totalCost += extraCost;
          pendingShipLogs.push({
            id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            year: clockDate.year,
            month: clockDate.month,
            buyerId: farmId,
            buyerLabel: 'Ferma Hodowlana',
            supplierId: 'trade_ship',
            productLabel: 'Pasza dla stada koni (interwencyjnie)',
            shortfallKg: extraFeed,
            costGbp: extraCost,
          });
        }
      }

      const monthlyStrawNeed = Math.round(aliveHorses * 15 * 30);
      if (nextStraw < monthlyStrawNeed) {
        const extraStraw = Math.min(strawHeapCap - nextStraw, monthlyStrawNeed - nextStraw);
        if (extraStraw > 0) {
          nextStraw += extraStraw;
          const extraCost = Number(((extraStraw / 100) * 6.6 * 1.1).toFixed(2));
          totalCost += extraCost;
          pendingShipLogs.push({
            id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            year: clockDate.year,
            month: clockDate.month,
            buyerId: farmId,
            buyerLabel: 'Ferma Hodowlana',
            supplierId: 'trade_ship',
            productLabel: 'Ściółka dla stada koni (interwencyjnie)',
            shortfallKg: extraStraw,
            costGbp: extraCost,
          });
        }
      }
    }
  }

  if (pendingShipLogs.length > 0) {
    const shipId = resolveTradeShipStateId(nextMap);
    const prevLogs = nextMap[shipId]?.shipInterventionLogs || [];
    nextMap[shipId] = {
      ...nextMap[shipId],
      shipInterventionLogs: [...pendingShipLogs, ...prevLogs].slice(0, 100),
    };
  }

  const changed =
    totalCost > 0 ||
    nextFeed !== supplies.feedGrainKg ||
    nextStraw !== supplies.strawBeddingKg ||
    nextFeedOrders.length !== rawFeedOrders.length ||
    nextStrawOrders.length !== rawStrawOrders.length;

  if (changed) {
    const patched: LivestockCapitalismState = {
      ...nextMap[farmId].livestockState!,
      supplies: { feedGrainKg: nextFeed, strawBeddingKg: nextStraw },
      feedOrder: nextFeedOrders[0],
      feedOrders: nextFeedOrders,
      strawOrder: nextStrawOrders[0],
      strawOrders: nextStrawOrders,
      lastCycleCost: Number(((livestockState.lastCycleCost || 0) + totalCost).toFixed(2)),
    };
    nextMap[farmId] = {
      ...nextMap[farmId],
      livestockState: patched,
    };
  }

  return { totalCost, changed };
}
