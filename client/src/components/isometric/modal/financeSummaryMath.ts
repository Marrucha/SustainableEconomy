import type { BuildingState } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { ALL_MARKET_GOODS } from './marketplaceGoods';
import {
  computeCityDemographics,
  computeProductPurchasePrice,
  estimateProductMonthlyDemand,
  resolveRetailPrice,
} from './marketDemandMath';

export interface BuildingFinanceNumbers {
  revenue: number;
  cost: number;
  profit: number;
}

export function countAllBuildingStaff(st?: BuildingState): number {
  if (!st) return 0;
  const factoryStaff =
    (st.factoryWorkersCount ?? 0) +
    (st.factoryManagersCount ?? 0) +
    (st.factoryWarehousemenCount ?? 0) +
    (st.merchantHired ? 1 : 0) +
    (st.factorySellerHired ? 1 : 0);
  const marketStaff =
    (st.marketSuppliersCount ?? 0) +
    (st.marketStalls || []).reduce(
      (s, slot) =>
        s +
        (slot.sellers?.length ?? 0) +
        (slot.stageCrew?.supply?.length ?? 0) +
        (slot.stageCrew?.trader?.length ?? 0) +
        (slot.stageCrew?.delivery?.length ?? 0),
      0
    );
  const shopCrew =
    (st.groceryShopState?.stageCrew?.supply?.length ?? 0) +
    (st.groceryShopState?.stageCrew?.trader?.length ?? 0) +
    (st.groceryShopState?.stageCrew?.delivery?.length ?? 0);
  const ruralAndCraftCrew =
    (st.farmCapitalism?.crew?.length ?? 0) +
    (st.flaxState?.crew?.length ?? 0) +
    (st.hopState?.crew?.length ?? 0) +
    (st.orchardState?.crew?.length ?? 0) +
    (st.livestockState?.crew?.length ?? 0) +
    (st.millState?.crew?.length ?? 0) +
    (st.bakeryState?.crew?.length ?? 0) +
    (st.mineStaff?.surfaceWorkersCount ?? 0) +
    (st.mineStaff?.minersCount ?? 0);
  return factoryStaff + marketStaff + shopCrew + ruralAndCraftCrew;
}

export function computeBuildingFinanceNumbers(
  b: WorldSupplierBuilding,
  st: BuildingState | undefined,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): BuildingFinanceNumbers {
  if (!st) return { revenue: 0, cost: 0, profit: 0 };

  if (b.typeId === 'mill' && st.millState) {
    const rev = Math.round(st.millState.totalRevenue || 0);
    const cost = Math.round(st.millState.totalExpenses || 0);
    return { revenue: rev, cost, profit: rev - cost };
  }

  if (b.typeId === 'bakery' && st.bakeryState) {
    const rev = Math.round(st.bakeryState.totalRevenue || 0);
    const cost = Math.round(st.bakeryState.totalExpenses || 0);
    return { revenue: rev, cost, profit: rev - cost };
  }

  if (b.typeId === 'wheat_farm' && st.farmCapitalism) {
    const rev = Math.round(st.farmCapitalism.lastCycleRevenue || 0);
    const cost = Math.round(st.farmCapitalism.lastCycleCost || 0);
    return { revenue: rev, cost, profit: rev - cost };
  }

  if (b.typeId === 'livestock_farm' && st.livestockState) {
    const rev = Math.round(st.livestockState.lastCycleRevenue || 0);
    const cost = Math.round(st.livestockState.lastCycleCost || 0);
    return { revenue: rev, cost, profit: rev - cost };
  }

  if ((b.typeId.startsWith('mine_') || b.typeId === 'woodcutter') && st.mineCapitalism) {
    const rev = Math.round(st.mineCapitalism.totalRevenue || 0);
    const cost = Math.round(st.mineCapitalism.totalExpenses || 0);
    return { revenue: rev, cost, profit: rev - cost };
  }

  if (b.typeId === 'marketplace' && st.marketStalls) {
    const demographics = computeCityDemographics(allWorldBuildings, buildingsState);
    const playerStalls = st.marketStalls.filter((s) => s.tenantName === 'Gracz');
    let rev = 0;
    let cost = 0;
    for (const slot of playerStalls) {
      cost += (slot.annualRent || 0) / 12;
      const crew = [
        ...(slot.stageCrew?.supply || []),
        ...(slot.stageCrew?.trader || []),
        ...(slot.stageCrew?.delivery || []),
      ];
      cost += crew.reduce((s, m) => s + m.dailyWage, 0) * 30;
      for (const sel of slot.sellers || []) {
        const good = ALL_MARKET_GOODS.find((g) => g.id === sel.productId);
        const sup = (slot.supplySlots || []).find((sl) => sl.productId === sel.productId);
        const price = resolveRetailPrice(sel.retailPrice, good?.defaultPrice);
        const buy = computeProductPurchasePrice(
          sel.productId,
          good?.defaultPrice ?? price,
          sup?.supplierBuildingId,
          sup?.contractType,
          allWorldBuildings,
          buildingsState
        );
        const vol = estimateProductMonthlyDemand(sel.productId, demographics, price, good?.defaultPrice)
          .monthlyVolume;
        rev += price * vol;
        cost += buy * vol;
      }
    }
    const r = Math.round(rev);
    const c = Math.round(cost);
    return { revenue: r, cost: c, profit: r - c };
  }

  if (b.typeId === 'grocery_shop' && st.groceryShopState) {
    const demographics = computeCityDemographics(allWorldBuildings, buildingsState);
    const shop = st.groceryShopState;
    let rev = 0;
    let cost = 0;
    const crew = [
      ...(shop.stageCrew?.supply || []),
      ...(shop.stageCrew?.trader || []),
      ...(shop.stageCrew?.delivery || []),
    ];
    cost += crew.reduce((s, m) => s + m.dailyWage, 0) * 30;
    for (const sel of shop.sellers || []) {
      const good = ALL_MARKET_GOODS.find((g) => g.id === sel.productId);
      const sup = (shop.supplySlots || []).find((sl) => sl.productId === sel.productId);
      const price = resolveRetailPrice(sel.retailPrice, good?.defaultPrice);
      const buy = computeProductPurchasePrice(
        sel.productId,
        good?.defaultPrice ?? price,
        sup?.supplierBuildingId,
        sup?.contractType,
        allWorldBuildings,
        buildingsState
      );
      const vol = estimateProductMonthlyDemand(sel.productId, demographics, price, good?.defaultPrice)
        .monthlyVolume;
      rev += price * vol;
      cost += buy * vol;
    }
    const r = Math.round(rev);
    const c = Math.round(cost);
    return { revenue: r, cost: c, profit: r - c };
  }

  const staff = countAllBuildingStaff(st);
  const cost = Math.round(staff * (st.workerWage ?? 1.8) * 30);
  return { revenue: 0, cost, profit: -cost };
}
