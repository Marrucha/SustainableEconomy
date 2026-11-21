import { useEffect, useRef } from 'react';
import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getContractMeta } from './modal/industryContracts';
import { SCALE_CONFIG } from './modal/energyConfig';
import { MINE_DEPOSITS } from './modal/mine/mineTypes';
import { appendShipInterventionLogToRecord } from './modal/TradeShipInterventionLogsTab';

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
  buildingsState,
  setBuildingsState,
  setGold,
}: UseCoalContractsWorldTickParams) {
  const prevTotalMonthsRef = useRef<number | null>(null);
  const buildingsRef = useRef(allBuildings);
  buildingsRef.current = allBuildings;
  const stateRef = useRef(buildingsState);
  stateRef.current = buildingsState;

  useEffect(() => {
    const totalMonths = clockDate.year * 12 + clockDate.month;
    if (prevTotalMonthsRef.current === null) {
      prevTotalMonthsRef.current = totalMonths;
      return;
    }
    if (totalMonths === prevTotalMonthsRef.current) return;
    prevTotalMonthsRef.current = totalMonths;

    const next = { ...stateRef.current };
    let changed = false;
    let totalGoldSpent = 0;

    for (const b of buildingsRef.current) {
      const bState = next[b.id];
      if (!bState) continue;
      let nextStock = bState.coalStockTons ?? 0;
      let nextOrder = bState.coalOrder;
      let nextCharcoalStock = bState.charcoalStockTons ?? 0;
      let nextCharcoalOrder = bState.charcoalOrder;
      let bChanged = false;

      if (nextOrder && nextOrder.monthlyTons > 0) {
        const meta = getContractMeta(nextOrder.contractType);
        const shipPricePerTon = MINE_DEPOSITS.coal.basePricePerTon * 1.1;

        if (nextOrder.supplierId.startsWith('trade_ship')) {
          const cost = Number(
            (nextOrder.monthlyTons * shipPricePerTon * (1 - meta.discountPercent / 100)).toFixed(2)
          );
          nextStock = Number((nextStock + nextOrder.monthlyTons).toFixed(2));
          totalGoldSpent += cost;
          bChanged = true;
        } else {
          const supplierState = next[nextOrder.supplierId];
          const avail = supplierState?.mineStock ?? 0;
          const delivered = Math.min(nextOrder.monthlyTons, avail);
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

          const shortfall = Number(Math.max(0, nextOrder.monthlyTons - delivered).toFixed(2));
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
        const cost = Number(
          (
            nextCharcoalOrder.monthlyTons *
            shipCharcoalPrice *
            (1 - meta.discountPercent / 100)
          ).toFixed(2)
        );
        nextCharcoalStock = Number((nextCharcoalStock + nextCharcoalOrder.monthlyTons).toFixed(2));
        totalGoldSpent += cost;
        if (meta.durationMonths > 0) {
          const rem = nextCharcoalOrder.monthsRemaining - 1;
          nextCharcoalOrder = rem > 0 ? { ...nextCharcoalOrder, monthsRemaining: rem } : undefined;
        }
        bChanged = true;
      }

      if (bState.businessEnergySource === 'wegiel' && nextStock > 0) {
        const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
        const monthlyBurn = Number((2.4 * scaleMult).toFixed(2));
        nextStock = Number(Math.max(0, nextStock - monthlyBurn).toFixed(2));
        bChanged = true;
      }
      if (bState.businessEnergySource === 'wegiel_drzewny' && nextCharcoalStock > 0) {
        const scaleMult = SCALE_CONFIG[bState.businessEnergyScale || 'standard'].multiplier;
        const monthlyBurn = Number((1.8 * scaleMult).toFixed(2));
        nextCharcoalStock = Number(Math.max(0, nextCharcoalStock - monthlyBurn).toFixed(2));
        bChanged = true;
      }

      if (bChanged) {
        next[b.id] = {
          ...bState,
          coalStockTons: nextStock,
          coalOrder: nextOrder,
          charcoalStockTons: nextCharcoalStock,
          charcoalOrder: nextCharcoalOrder,
        };
        changed = true;
      }
    }

    if (changed) setBuildingsState(next);
    if (totalGoldSpent > 0) setGold((g) => Math.max(0, Number((g - totalGoldSpent).toFixed(2))));
  }, [clockDate.year, clockDate.month]);
}
