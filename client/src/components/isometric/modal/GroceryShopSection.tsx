import React, { useState } from 'react';
import type {
  BuildingState,
  MarketStallCrewMember,
  MarketStallSeller,
  MarketStallSlot,
  MarketStallSupplySlot,
} from '../types';
import {
  formatSupplierOrderLabel,
  type WorldSupplierBuilding,
} from './industrySupplyConfig';
import type { BusinessTabType } from './BuildingModalTabs';
import { ALL_MARKET_GOODS, getAvailableMarketOffers } from './marketplaceGoods';
import { MarketStallTradeTab } from './MarketStallTradeTab';
import { MarketStallSummaryTab, type MarketStallTab } from './MarketStallSummaryTab';
import { MarketStallFinanceTab } from './MarketStallFinanceTab';
import { MarketProductsOfferGrid } from './MarketProductsOfferGrid';
import {
  computeBuildingLocationScore,
  computeCityDemographics,
  computeProductPurchasePrice,
  estimateProductMonthlyDemand,
  resolveRetailPrice,
} from './marketDemandMath';
import { FarmPipelineArrow } from './FarmPipelineArrow';
import {
  MarketStallStaffModal,
  STALL_STAGE_META,
  type StallStageKey,
} from './MarketStallStaffModal';

interface GroceryShopSectionProps {
  building?: WorldSupplierBuilding;
  buildingState: BuildingState;
  businessTab: BusinessTabType;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onNavigateTab: (tab: BusinessTabType) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const DEFAULT_GROCERY_SHOP_STATE: MarketStallSlot = {
  slotIndex: 1,
  tenantName: 'Gracz',
  annualRent: 0,
  sellers: [],
  supplySlots: [],
  stageCrew: {},
};

const BUSINESS_TO_STALL_TAB: Partial<Record<BusinessTabType, MarketStallTab>> = {
  summary: 'summary',
  production: 'process',
  products: 'products',
  trade: 'trade',
  finance: 'finance',
};

const STALL_TO_BUSINESS_TAB: Record<MarketStallTab, BusinessTabType> = {
  summary: 'summary',
  process: 'production',
  products: 'products',
  trade: 'trade',
  finance: 'finance',
};

const MAX_SHOP_PRODUCTS = 6;
const MAX_PRODUCTS_PER_TRADER = 3;

export const GroceryShopSection: React.FC<GroceryShopSectionProps> = ({
  building,
  buildingState,
  businessTab,
  allWorldBuildings,
  buildingsState,
  onNavigateTab,
  onUpdateState,
}) => {
  const [staffModalKey, setStaffModalKey] = useState<StallStageKey | null>(null);
  const [infoStageKey, setInfoStageKey] = useState<StallStageKey | null>(null);

  const shop: MarketStallSlot = buildingState.groceryShopState || DEFAULT_GROCERY_SHOP_STATE;
  const supplySlots = shop.supplySlots || [];
  const sellers = shop.sellers || [];
  const stageCrew = shop.stageCrew || {};
  const supplyCrew = stageCrew.supply || [];
  const traderCrew = stageCrew.trader || [];
  const deliveryCrew = stageCrew.delivery || [];

  const securedSlots = supplySlots.filter((s) => Boolean(s.supplierBuildingId));
  const securedGoods = Array.from(
    new Map(
      supplySlots
        .map((s) => ALL_MARKET_GOODS.find((g) => g.id === s.productId))
        .filter((g): g is NonNullable<typeof g> => Boolean(g))
        .map((g) => [g.id, g])
    ).values()
  );

  // Dostawca i Zaopatrzeniowiec obsługują cały sklep; 1 Handlarz obsługuje do 3 produktów (max 6 produktów w sklepie)
  const isSupplyReady = supplyCrew.length > 0;
  const isDeliveryReady = deliveryCrew.length > 0;
  const isTraderReady = traderCrew.length > 0 && sellers.length <= traderCrew.length * MAX_PRODUCTS_PER_TRADER;
  const isReady = isSupplyReady && isTraderReady && isDeliveryReady;

  const availableOffers = getAvailableMarketOffers(allWorldBuildings, buildingsState);
  const shipSupplier: WorldSupplierBuilding = allWorldBuildings.find(
    (b) => b.typeId === 'trade_ship'
  ) || {
    id: 'trade_ship_init',
    typeId: 'trade_ship',
    name: 'Statek Handlowy (Port Londyn)',
    x: 0,
    y: 0,
    sizeX: 1,
    sizeY: 1,
    rotation: 0,
    cost: 0,
    mapType: 'city',
  };

  const combinedStageOptions = [
    ...availableOffers.map((o) => ({
      key: `${o.building.id}::${o.good.id}`,
      productId: o.good.id,
      supplierId: o.building.id,
      label: `${o.good.icon} ${o.good.label} • ${formatSupplierOrderLabel(o.building, buildingsState, allWorldBuildings)}`,
    })),
    ...ALL_MARKET_GOODS.map((g) => ({
      key: `${shipSupplier.id}::${g.id}`,
      productId: g.id,
      supplierId: shipSupplier.id,
      label: `🚢 Statek Handlowy • ${g.icon} ${g.label} (£${(g.defaultPrice * 1.1).toFixed(2)})`,
    })),
  ];

  const selectedProductId = supplySlots[0]?.productId || ALL_MARKET_GOODS[0]?.id || 'chleb_pszenny';
  const selectedSupplierId = supplySlots[0]?.supplierBuildingId || shipSupplier.id;
  const selectedCombinedKey = combinedStageOptions.some(
    (opt) => opt.key === `${selectedSupplierId}::${selectedProductId}`
  )
    ? `${selectedSupplierId}::${selectedProductId}`
    : combinedStageOptions[0]?.key || `${shipSupplier.id}::chleb_pszenny`;

  const updateShop = (patch: Partial<MarketStallSlot>) => {
    onUpdateState({
      groceryShopState: {
        ...shop,
        ...patch,
      },
    });
  };

  const syncSellersWithSupplySlots = (
    currentSellers: MarketStallSeller[],
    nextSlots: MarketStallSupplySlot[]
  ): MarketStallSeller[] => {
    const allowedIds = new Set(nextSlots.map((s) => s.productId));
    return currentSellers
      .filter((s) => allowedIds.has(s.productId))
      .map((s, idx) => ({ ...s, sellerIndex: idx + 1 }));
  };

  const handleSelectCombinedProductAndSupplier = (slotArrayIndex: number, combinedKey: string) => {
    const [supplierBuildingId, productId] = combinedKey.split('::');
    if (supplySlots.length === 0) {
      const nextSlots = [{ slotIndex: 1, productId, supplierBuildingId }];
      updateShop({ supplySlots: nextSlots, sellers: syncSellersWithSupplySlots(sellers, nextSlots) });
      return;
    }
    const next = supplySlots.map((s, idx) =>
      idx === slotArrayIndex ? { ...s, productId, supplierBuildingId } : s
    );
    updateShop({ supplySlots: next, sellers: syncSellersWithSupplySlots(sellers, next) });
  };

  const handleAddSupplySlot = () => {
    if (supplySlots.length >= MAX_SHOP_PRODUCTS) return;
    const usedProductIds = new Set(supplySlots.map((s) => s.productId));
    const fallbackOpt =
      combinedStageOptions.find((opt) => !usedProductIds.has(opt.productId)) ||
      combinedStageOptions[0];
    if (!fallbackOpt) return;
    const [supplierBuildingId, productId] = fallbackOpt.key.split('::');
    const nextSlot: MarketStallSupplySlot = {
      slotIndex: supplySlots.length + 1,
      productId,
      supplierBuildingId,
      monthlyKg: 300,
      contractType: 'pay_as_you_go',
      monthsRemaining: 0,
    };
    updateShop({ supplySlots: [...supplySlots, nextSlot] });
  };

  const handleRemoveSupplySlot = (slotArrayIndex: number) => {
    const next = supplySlots
      .filter((_, idx) => idx !== slotArrayIndex)
      .map((s, idx) => ({ ...s, slotIndex: idx + 1 }));
    updateShop({ supplySlots: next, sellers: syncSellersWithSupplySlots(sellers, next) });
  };

  const handleAssignNewCrew = (stageKey: StallStageKey, member: MarketStallCrewMember) => {
    const currentList = stageCrew[stageKey] || [];
    updateShop({
      stageCrew: {
        ...stageCrew,
        [stageKey]: [...currentList, member],
      },
    });
  };

  const handleUnassignCrew = (stageKey: StallStageKey, memberId: string) => {
    const currentList = stageCrew[stageKey] || [];
    const nextList = currentList.filter((m) => m.id !== memberId);
    const nextSellers =
      stageKey === 'trader'
        ? sellers.map((s) =>
            s.traderId === memberId ? { ...s, traderId: undefined, traderName: undefined } : s
          )
        : sellers;
    updateShop({
      stageCrew: {
        ...stageCrew,
        [stageKey]: nextList,
      },
      sellers: nextSellers,
    });
  };

  const handleAssignTraderToGood = (productId: string, traderId: string) => {
    const trader = traderCrew.find((t) => t.id === traderId);
    const good = ALL_MARKET_GOODS.find((g) => g.id === productId);
    const activeSellers =
      supplySlots.length > 0 ? syncSellersWithSupplySlots(sellers, supplySlots) : sellers;
    const existingIdx = activeSellers.findIndex((s) => s.productId === productId);
    if (
      traderId &&
      activeSellers.filter((s) => s.productId !== productId && s.traderId === traderId).length >=
        MAX_PRODUCTS_PER_TRADER
    ) {
      return;
    }
    const nextSellers =
      existingIdx >= 0
        ? activeSellers.map((s, i) =>
            i === existingIdx ? { ...s, traderId: trader?.id, traderName: trader?.name } : s
          )
        : activeSellers.length < MAX_SHOP_PRODUCTS
        ? [
            ...activeSellers,
            {
              sellerIndex: activeSellers.length + 1,
              productId,
              retailPrice: good?.defaultPrice ?? 1.7,
              traderId: trader?.id,
              traderName: trader?.name,
            },
          ]
        : activeSellers;
    updateShop({ sellers: nextSellers });
  };

  const demographics = computeCityDemographics(allWorldBuildings, buildingsState);
  const monthlyRentCost = 0;
  const estFinancialTotals = sellers
    .map((s) => {
      const good = ALL_MARKET_GOODS.find((g) => g.id === s.productId);
      const matchingSupply = supplySlots.find((sl) => sl.productId === s.productId);
      const price = resolveRetailPrice(s.retailPrice, good?.defaultPrice);
      const buyPrice = computeProductPurchasePrice(
        s.productId,
        good?.defaultPrice ?? price,
        matchingSupply?.supplierBuildingId,
        matchingSupply?.contractType,
        allWorldBuildings,
        buildingsState
      );
      const vol = estimateProductMonthlyDemand(
        s.productId,
        demographics,
        price,
        good?.defaultPrice
      ).monthlyVolume;
      return { rev: price * vol, cost: buyPrice * vol };
    })
    .reduce(
      (acc, item) => ({ rev: acc.rev + item.rev, cost: acc.cost + item.cost }),
      { rev: 0, cost: 0 }
    );
  const estMonthlyRevenue = Number(estFinancialTotals.rev.toFixed(2));
  const estMonthlySupplyCost = Number(estFinancialTotals.cost.toFixed(2));
  const dailyPayroll = [...supplyCrew, ...traderCrew, ...deliveryCrew].reduce(
    (s, m) => s + m.dailyWage,
    0
  );
  const estMonthlyNet = Number(
    (estMonthlyRevenue - estMonthlySupplyCost - dailyPayroll * 30).toFixed(2)
  );

  const stages: Array<{
    key: StallStageKey;
    num: number;
    title: string;
    icon: string;
    ok: boolean;
    workerIcon: string;
    workers: MarketStallCrewMember[];
    emptyLabel: string;
    infoText: string;
  }> = [
    {
      key: 'supply',
      num: 1,
      title: 'Zaopatrzenie',
      icon: '📦',
      ok: isSupplyReady,
      workerIcon: '🧑‍💼',
      workers: supplyCrew,
      emptyLabel: 'Brak zaopatrzeniowca',
      infoText: '1 zaopatrzeniowiec obsługuje cały sklep i kontraktuje do 6 produktów.',
    },
    {
      key: 'trader',
      num: 2,
      title: 'Handlarz',
      icon: '🗣️',
      ok: isTraderReady,
      workerIcon: '👤',
      workers: traderCrew,
      emptyLabel: 'Brak handlarza na sali',
      infoText: '1 handlarz może sprzedawać do 3 produktów (max 6 produktów w sklepie).',
    },
    {
      key: 'delivery',
      num: 3,
      title: 'Dostawa',
      icon: '🚚',
      ok: isDeliveryReady,
      workerIcon: '🐎',
      workers: deliveryCrew,
      emptyLabel: 'Brak dostawcy',
      infoText: '1 dostawca obsługuje transport wszystkich towarów do całego sklepu.',
    },
  ];

  const stallTab = BUSINESS_TO_STALL_TAB[businessTab] || 'summary';

  return (
    <div className="space-y-3">
      {stallTab === 'summary' && (
        <MarketStallSummaryTab
          stall={shop}
          isSupplyReady={isSupplyReady}
          isTraderReady={isTraderReady}
          isDeliveryReady={isDeliveryReady}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          monthlyRentCost={monthlyRentCost}
          estMonthlyRevenue={estMonthlyRevenue}
          estMonthlySupplyCost={estMonthlySupplyCost}
          estMonthlyNet={estMonthlyNet}
          onNavigateTab={(t) => onNavigateTab(STALL_TO_BUSINESS_TAB[t])}
        />
      )}

      {stallTab === 'process' && (
        <div className="space-y-3">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                🏪 Proces Sprzedaży Detalicznej — Sklep Spożywczy
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                  isReady
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                }`}
              >
                {isReady ? '⚡ Sprzedaż aktywna' : '⚠️ Przypisz obsadę do 3 kroków'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300">
              {securedSlots.length}/{MAX_SHOP_PRODUCTS} towarów • {sellers.length}/{MAX_SHOP_PRODUCTS} półek (handlarze: {traderCrew.length} × 3)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] items-stretch gap-1.5">
            {stages.map((st, idx) => (
              <React.Fragment key={st.num}>
                <div
                  className={`relative h-full min-w-0 rounded-xl px-2.5 py-2 transition-all duration-200 flex flex-col gap-2 select-none shadow-sm ${
                    st.ok
                      ? 'border border-stone-400 bg-stone-200 text-stone-900'
                      : 'border-2 border-rose-500 bg-rose-100 text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-0.5 rounded-lg border border-stone-500/75">
                    <div className="flex items-center gap-1.5 min-w-0 leading-tight">
                      <span className="text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm shrink-0">
                        {st.icon}
                      </span>
                      <span className="font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]">
                        {st.num}. {st.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInfoStageKey((prev) => (prev === st.key ? null : st.key))}
                        className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
                        title="Opis etapu"
                      >
                        ℹ
                      </button>
                    </div>

                    <div className="flex items-center gap-1 leading-tight shrink-0">
                      <button
                        type="button"
                        onClick={() => setStaffModalKey(st.key)}
                        title={
                          st.workers.length > 0
                            ? `${st.workers.map((w) => w.name).join(', ')} — kliknij, aby zarządzać obsadą`
                            : 'Brak obsady — kliknij, aby zatrudnić lub przypisać pracownika'
                        }
                        className={`relative w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm border ${
                          st.workers.length === 0
                            ? 'bg-rose-950/90 hover:bg-rose-900 border-rose-400 text-rose-300'
                            : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400 text-emerald-400'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-950 border border-white/80 text-white text-[8px] font-mono font-bold flex items-center justify-center">
                          {st.workers.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {infoStageKey === st.key && (
                    <div className="p-2 rounded-lg bg-stone-800 border border-amber-500/40 text-[10px] text-stone-200 leading-snug">
                      <p>{st.infoText}</p>
                      <p className="mt-1 text-amber-300 font-semibold">
                        Wymagany zawód: {STALL_STAGE_META[st.key].professionLabel}
                      </p>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between gap-2 px-0.5 text-[11px]">
                    {st.key === 'supply' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <label className="text-[10px] font-bold text-stone-700">
                            Produkty w sklepie ({Math.max(1, supplySlots.length)}/{MAX_SHOP_PRODUCTS}):
                          </label>
                          {supplySlots.length < MAX_SHOP_PRODUCTS && (
                            <button
                              type="button"
                              onClick={handleAddSupplySlot}
                              className="px-1.5 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[9px] font-bold cursor-pointer"
                            >
                              + Dodaj ({supplySlots.length}/{MAX_SHOP_PRODUCTS})
                            </button>
                          )}
                        </div>
                        {(supplySlots.length > 0
                          ? supplySlots
                          : [{ slotIndex: 1, productId: selectedProductId, supplierBuildingId: selectedSupplierId }]
                        ).map((slot, sIdx) => {
                          const slotKey = `${slot.supplierBuildingId || shipSupplier.id}::${slot.productId}`;
                          const effectiveKey = combinedStageOptions.some((o) => o.key === slotKey)
                            ? slotKey
                            : selectedCombinedKey;
                          return (
                            <div key={sIdx} className="flex items-center gap-1">
                              <span className="text-[9px] font-mono font-bold text-stone-600 shrink-0">
                                #{sIdx + 1}
                              </span>
                              <select
                                value={effectiveKey}
                                onChange={(e) => handleSelectCombinedProductAndSupplier(sIdx, e.target.value)}
                                className="flex-1 min-w-0 bg-white border border-stone-500 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-stone-900 cursor-pointer"
                              >
                                {combinedStageOptions.map((opt) => (
                                  <option key={opt.key} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {supplySlots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSupplySlot(sIdx)}
                                  title="Usuń produkt ze sklepu"
                                  className="px-1.5 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[9px] font-bold cursor-pointer shrink-0"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {st.key === 'trader' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-700 block">
                          Produkty przypisane handlarzom (1 handlarz = do 3 produktów):
                        </label>
                        {securedGoods.length === 0 ? (
                          <div className="px-2 py-1 rounded-lg bg-stone-300 border border-stone-500 text-stone-700 text-[10px] font-semibold">
                            Najpierw wybierz produkt w Zaopatrzeniu
                          </div>
                        ) : traderCrew.length === 0 ? (
                          <div className="px-2 py-1 rounded-lg bg-stone-300 border border-stone-500 text-stone-700 text-[10px] font-semibold">
                            Zatrudnij handlarza (ikona 👤), aby przypisać produkty
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {securedGoods.map((good) => {
                              const matchedSeller = sellers.find((s) => s.productId === good.id);
                              const securedIds = new Set(securedGoods.map((g) => g.id));
                              const traderCounts = new Map<string, number>();
                              sellers.forEach((s) => {
                                if (s.traderId && securedIds.has(s.productId)) {
                                  traderCounts.set(s.traderId, (traderCounts.get(s.traderId) || 0) + 1);
                                }
                              });
                              return (
                                <div key={good.id} className="flex items-center gap-1">
                                  <select
                                    value={matchedSeller?.traderId || ''}
                                    onChange={(e) => handleAssignTraderToGood(good.id, e.target.value)}
                                    className="w-[118px] bg-stone-300 border border-stone-500/70 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-stone-900 cursor-pointer shrink-0"
                                  >
                                    <option value="">-- Handlarz --</option>
                                    {traderCrew.map((t) => {
                                      const count = traderCounts.get(t.id) || 0;
                                      const isCurrent = matchedSeller?.traderId === t.id;
                                      return (
                                        <option
                                          key={t.id}
                                          value={t.id}
                                          disabled={!isCurrent && count >= MAX_PRODUCTS_PER_TRADER}
                                        >
                                          👤 {t.name} ({count}/3)
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <span className="flex-1 min-w-0 truncate bg-white border border-stone-500 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-stone-900">
                                    {good.icon} {good.label} (£{(matchedSeller?.retailPrice ?? good.defaultPrice).toFixed(2)})
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {st.key === 'delivery' && (
                      <div className="px-2 py-1 rounded-lg bg-stone-300/80 border border-stone-400 text-stone-800 text-[10px] font-semibold">
                        Zakres: cały sklep ({Math.max(1, securedGoods.length)}/{MAX_SHOP_PRODUCTS} produktów)
                      </div>
                    )}

                    {st.workers.length === 0 ? (
                      <div className="px-2 py-1.5 rounded-lg bg-rose-200/70 border border-rose-400 text-rose-900 text-[10px] font-bold">
                        ⚠️ {st.emptyLabel}
                      </div>
                    ) : st.key !== 'trader' ? (
                      <div className="flex flex-wrap gap-1">
                        {st.workers.map((w) => (
                          <span
                            key={w.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-300 border border-stone-500/70 text-stone-900 text-[10px] font-bold shadow-xs"
                          >
                            <span>{st.workerIcon}</span>
                            <span className="truncate max-w-[160px]">{w.name}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onNavigateTab('trade')}
                      className="w-full py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      ⚙️ Konfiguruj kontrakty w Zakup/Sprzedaż
                    </button>
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <div className="hidden md:flex items-center justify-center">
                    <FarmPipelineArrow direction="right" status={st.ok ? 'ready' : 'blocked'} isActivePulse={st.ok} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {stallTab === 'products' && (
        <MarketProductsOfferGrid
          title="Oferta Produktów w Sklepie Spożywczym"
          maxProducts={MAX_SHOP_PRODUCTS}
          locationScore={computeBuildingLocationScore(building, allWorldBuildings)}
          sellers={sellers}
          supplySlots={supplySlots}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onChangeSellers={(nextSellers) => updateShop({ sellers: nextSellers })}
        />
      )}

      {stallTab === 'trade' && (
        <MarketStallTradeTab
          stall={shop}
          suppliersCount={supplyCrew.length}
          playerStallsCount={1}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          maxProducts={MAX_SHOP_PRODUCTS}
          maxProductsPerTrader={MAX_PRODUCTS_PER_TRADER}
          isShopMode={true}
          onUpdateSuppliersCount={() => {}}
          onUpdateStallSupply={(_, nextSupplySlots) => updateShop({ supplySlots: nextSupplySlots })}
          onUpdateStallSellers={(_, nextSellers) => updateShop({ sellers: nextSellers })}
        />
      )}

      {stallTab === 'finance' && (
        <MarketStallFinanceTab
          traderCrew={traderCrew}
          sellers={sellers}
          supplySlots={supplySlots}
          securedGoods={securedGoods}
          monthlyRentCost={monthlyRentCost}
          demographics={demographics}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
        />
      )}

      {staffModalKey && (
        <MarketStallStaffModal
          stageKey={staffModalKey}
          assigned={stageCrew[staffModalKey] || []}
          onAssignNew={(m) => handleAssignNewCrew(staffModalKey, m)}
          onUnassign={(id) => handleUnassignCrew(staffModalKey, id)}
          onClose={() => setStaffModalKey(null)}
        />
      )}
    </div>
  );
};
