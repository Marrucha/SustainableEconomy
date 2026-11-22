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
import { ALL_MARKET_GOODS, getAvailableMarketOffers } from './marketplaceGoods';
import { getContractMeta } from './industryContracts';
import { MarketStallTradeTab } from './MarketStallTradeTab';
import { MarketStallSummaryTab, type MarketStallTab } from './MarketStallSummaryTab';
import { MarketStallFinanceTab } from './MarketStallFinanceTab';
import {
  computeCityDemographics,
  computeProductMarketScores,
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

interface MarketStallModalProps {
  stall: MarketStallSlot;
  stallName: string;
  suppliersCount: number;
  playerStallsCount: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onUpdateSuppliersCount: (count: number) => void;
  onUpdateStallSupply: (slotIndex: number, supplySlots: MarketStallSupplySlot[]) => void;
  onUpdateStallSellers: (slotIndex: number, sellers: MarketStallSeller[]) => void;
  onUpdateStallStageCrew: (
    slotIndex: number,
    stageKey: StallStageKey,
    members: MarketStallCrewMember[],
    nextSellers?: MarketStallSeller[]
  ) => void;
  onClose: () => void;
}

type StallTab = MarketStallTab;

export const MarketStallModal: React.FC<MarketStallModalProps> = ({
  stall,
  stallName,
  suppliersCount,
  playerStallsCount,
  allWorldBuildings,
  buildingsState,
  onUpdateSuppliersCount,
  onUpdateStallSupply,
  onUpdateStallSellers,
  onUpdateStallStageCrew,
  onClose,
}) => {
  const [tab, setTab] = useState<StallTab>('summary');
  const [infoStageKey, setInfoStageKey] = useState<StallStageKey | null>(null);
  const [staffModalKey, setStaffModalKey] = useState<StallStageKey | null>(null);

  const supplySlots = stall.supplySlots || [];
  const sellers = stall.sellers || [];
  const securedGoods = Array.from(
    new Map(
      supplySlots
        .map((s) => ALL_MARKET_GOODS.find((g) => g.id === s.productId))
        .filter((g): g is NonNullable<typeof g> => Boolean(g))
        .map((g) => [g.id, g])
    ).values()
  );
  const securedSlots = supplySlots.filter((s) => Boolean(s.supplierBuildingId));
  const stageCrew = stall.stageCrew || {};
  const supplyCrew = stageCrew.supply || [];
  const traderCrew = stageCrew.trader || [];
  const deliveryCrew = stageCrew.delivery || [];

  const isSupplyReady = supplyCrew.length > 0 || suppliersCount > 0;
  const isTraderReady = traderCrew.length > 0 || sellers.length > 0;
  const isDeliveryReady = deliveryCrew.length > 0 || securedSlots.length > 0;
  const isReady = isSupplyReady && isTraderReady && isDeliveryReady;

  const selectedProductId = supplySlots[0]?.productId || ALL_MARKET_GOODS[0]?.id || 'chleb_pszenny';
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
    sizeY: 2,
    rotation: 0,
    cost: 0,
    mapType: 'city',
  };
  const selectedSupplierId = supplySlots[0]?.supplierBuildingId || shipSupplier.id;
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
  const selectedCombinedKey = combinedStageOptions.some(
    (opt) => opt.key === `${selectedSupplierId}::${selectedProductId}`
  )
    ? `${selectedSupplierId}::${selectedProductId}`
    : combinedStageOptions[0]?.key || `${shipSupplier.id}::chleb_pszenny`;

  const handleSelectCombinedProductAndSupplier = (slotArrayIndex: number, combinedKey: string) => {
    const [supplierBuildingId, productId] = combinedKey.split('::');
    if (supplySlots.length === 0) {
      onUpdateStallSupply(stall.slotIndex, [
        { slotIndex: 1, productId, supplierBuildingId },
      ]);
      return;
    }
    const next = supplySlots.map((s, idx) =>
      idx === slotArrayIndex ? { ...s, productId, supplierBuildingId } : s
    );
    onUpdateStallSupply(stall.slotIndex, next);
  };

  const handleAddSupplySlot = () => {
    if (supplySlots.length >= 4) return;
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
    };
    onUpdateStallSupply(stall.slotIndex, [...supplySlots, nextSlot]);
  };

  const handleRemoveSupplySlot = (slotArrayIndex: number) => {
    const next = supplySlots
      .filter((_, idx) => idx !== slotArrayIndex)
      .map((s, idx) => ({ ...s, slotIndex: idx + 1 }));
    onUpdateStallSupply(stall.slotIndex, next);
  };

  const demographics = computeCityDemographics(allWorldBuildings, buildingsState);
  const monthlyRentCost = Number(((stall.annualRent || 400) / 12).toFixed(2));
  const estFinancialTotals = (
    traderCrew.length > 0
      ? traderCrew.map((w, idx) => {
          const prodId =
            w.assignedProductId &&
            securedGoods.some((g) => g.id === w.assignedProductId)
              ? w.assignedProductId
              : securedGoods[idx]?.id || securedGoods[0]?.id || '';
          if (!prodId) return { rev: 0, cost: 0 };
          const good = ALL_MARKET_GOODS.find((g) => g.id === prodId);
          const matchingSeller =
            sellers.find((s) => s.traderId === w.id) ||
            sellers.find((s) => s.productId === prodId);
          const matchingSupply = supplySlots.find((s) => s.productId === prodId);
          const price = resolveRetailPrice(matchingSeller?.retailPrice, good?.defaultPrice);
          const buyPrice = computeProductPurchasePrice(
            prodId,
            good?.defaultPrice ?? price,
            matchingSupply?.supplierBuildingId,
            matchingSupply?.contractType,
            allWorldBuildings,
            buildingsState
          );
          const vol = estimateProductMonthlyDemand(
            prodId,
            demographics,
            price,
            good?.defaultPrice
          ).monthlyVolume;
          return { rev: price * vol, cost: buyPrice * vol };
        })
      : sellers.map((s) => {
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
  ).reduce(
    (acc, item) => ({ rev: acc.rev + item.rev, cost: acc.cost + item.cost }),
    { rev: 0, cost: 0 }
  );
  const estMonthlyRevenue = Number(estFinancialTotals.rev.toFixed(2));
  const estMonthlySupplyCost = Number(estFinancialTotals.cost.toFixed(2));
  const estMonthlyNet = Number(
    (estMonthlyRevenue - estMonthlySupplyCost - monthlyRentCost).toFixed(2)
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
      infoText:
        'Zaopatrzeniowiec wybiera produkt i kontraktuje jego dostawy od producentów lub ze Statku Handlowego.',
    },
    {
      key: 'trader',
      num: 2,
      title: 'Handlarz',
      icon: '🗣️',
      ok: isTraderReady,
      workerIcon: '👤',
      workers: traderCrew,
      emptyLabel: 'Brak handlarza na stoisku',
      infoText:
        'Handlarz / Ekspedient obsługuje klientów przy ladzie i realizuje sprzedaż detaliczną.',
    },
    {
      key: 'delivery',
      num: 3,
      title: 'Dostawa',
      icon: '🚚',
      ok: isDeliveryReady,
      workerIcon: '🐎',
      workers: deliveryCrew,
      emptyLabel: 'Brak woźnicy / dostawcy',
      infoText:
        'Woźnica / Dostawca domyślnie obsługuje cały kram — dowozi wszystkie zakontraktowane towary z magazynów producenta na stoisko targowe.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[3vh] bg-black/75 backdrop-blur-sm p-3 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[92vh] bg-stone-900/95 border border-amber-500/50 rounded-3xl p-4 shadow-2xl text-stone-200 font-sans flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nagłówek jak w karcie budynku */}
        <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-stone-950 rounded-2xl border border-amber-500/40">
              🏪
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-300">{stallName}</h3>
              <p className="text-xs text-stone-400 font-mono">
                Najemca: <strong className="text-sky-300">{stall.tenantName}</strong> • Dzierżawa:{' '}
                {stall.rentedUntilDateLabel
                  ? `do ${stall.rentedUntilDateLabel}`
                  : `${stall.rentedUntilYear} r.`}{' '}
                (£{stall.annualRent}/rok)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('summary')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                isReady && securedSlots.length > 0
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
              }`}
            >
              {isReady && securedSlots.length > 0 ? '✓ Handel aktywny' : '⚠️ Braki w stoisku'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-bold text-stone-200 cursor-pointer"
            >
              ✕ Zamknij
            </button>
          </div>
        </div>

        {/* 5 Zakładek jak w karcie budynku */}
        <div className="bg-stone-950/80 p-0.5 rounded-xl border border-stone-800 shadow-inner flex gap-1">
          {[
            { id: 'summary' as StallTab, icon: '📋', label: 'Podsumowanie' },
            { id: 'process' as StallTab, icon: '🏭', label: 'Proces Sprzedaży' },
            { id: 'products' as StallTab, icon: '📦', label: 'Produkty' },
            { id: 'trade' as StallTab, icon: '🛒', label: 'Zakup/Sprzedaż' },
            { id: 'finance' as StallTab, icon: '📊', label: 'Finanse — Zestawienie' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === t.id
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="overflow-y-auto pr-1 space-y-4">
          {tab === 'summary' && (
            <MarketStallSummaryTab
              stall={stall}
              isSupplyReady={isSupplyReady}
              isTraderReady={isTraderReady}
              isDeliveryReady={isDeliveryReady}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              monthlyRentCost={monthlyRentCost}
              estMonthlyRevenue={estMonthlyRevenue}
              estMonthlySupplyCost={estMonthlySupplyCost}
              estMonthlyNet={estMonthlyNet}
              onNavigateTab={setTab}
            />
          )}
          {tab === 'process' && (
            <div className="space-y-3">
              {/* Pasek stanu procesu sprzedaży */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    🏪 Proces Sprzedaży Detalicznej — Stoisko #{stall.slotIndex}
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
                  {securedSlots.length}/4 towarów • {sellers.length}/4 handlarzy
                </span>
              </div>

              {/* Kroki 1. Zaopatrzenie ──► 2. Handlarz ──► 3. Dostawa */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr] items-stretch gap-1.5">
                {stages.map((st, idx) => (
                  <React.Fragment key={st.num}>
                    <div
                      className={`relative h-full rounded-xl px-2.5 py-2 transition-all duration-200 flex flex-col gap-2 select-none shadow-sm ${
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
                            onClick={() =>
                              setInfoStageKey((prev) => (prev === st.key ? null : st.key))
                            }
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
                        {/* Wybór do 4 produktów i dostawców na stoisko */}
                        {st.key === 'supply' && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <label className="text-[10px] font-bold text-stone-700">
                                Produkty na stoisko ({Math.max(1, supplySlots.length)}/4):
                              </label>
                              {supplySlots.length < 4 && (
                                <button
                                  type="button"
                                  onClick={handleAddSupplySlot}
                                  className="px-1.5 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[9px] font-bold cursor-pointer"
                                >
                                  + Dodaj ({supplySlots.length}/4)
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
                                    onChange={(e) =>
                                      handleSelectCombinedProductAndSupplier(sIdx, e.target.value)
                                    }
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
                                      title="Usuń produkt ze stoiska"
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

                        {/* Przypisanie 1 produktu do każdego zatrudnionego handlarza */}
                        {st.key === 'trader' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-stone-700 block">
                              Produkty przypisane handlarzom (1 handlarz = 1 produkt):
                            </label>
                            {securedGoods.length === 0 ? (
                              <div className="px-2 py-1 rounded-lg bg-stone-300 border border-stone-500 text-stone-700 text-[10px] font-semibold">
                                Najpierw wybierz produkt w Zaopatrzeniu
                              </div>
                            ) : traderCrew.length === 0 ? (
                              <div className="px-2 py-1 rounded-lg bg-stone-300 border border-stone-500 text-stone-700 text-[10px] font-semibold">
                                Zatrudnij handlarza (ikona 👤), aby przypisać mu produkt
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {traderCrew.map((w, wIdx) => {
                                  const fallbackGood =
                                    securedGoods[wIdx] || securedGoods[0];
                                  const currentProdId =
                                    w.assignedProductId &&
                                    securedGoods.some((g) => g.id === w.assignedProductId)
                                      ? w.assignedProductId
                                      : fallbackGood?.id || '';
                                  return (
                                    <div key={w.id} className="flex items-center gap-1">
                                      <span
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-300 border border-stone-500/70 text-stone-900 text-[10px] font-bold shrink-0 max-w-[110px] truncate"
                                        title={w.name}
                                      >
                                        <span>👤</span>
                                        <span className="truncate">{w.name}</span>
                                      </span>
                                      <select
                                        value={currentProdId}
                                        onChange={(e) => {
                                          const nextProductId = e.target.value;
                                          const nextCrew = traderCrew.map((m) =>
                                            m.id === w.id
                                              ? { ...m, assignedProductId: nextProductId }
                                              : m
                                          );
                                          const g = ALL_MARKET_GOODS.find(
                                            (item) => item.id === nextProductId
                                          );
                                          const existingIdx = sellers.findIndex(
                                            (s) => s.traderId === w.id
                                          );
                                          const nextSellers =
                                            existingIdx >= 0
                                              ? sellers.map((s, sIdx) =>
                                                  sIdx === existingIdx
                                                    ? {
                                                        ...s,
                                                        productId: nextProductId,
                                                        retailPrice: g?.defaultPrice ?? s.retailPrice,
                                                      }
                                                    : s
                                                )
                                              : sellers.length < 4
                                              ? [
                                                  ...sellers,
                                                  {
                                                    sellerIndex: sellers.length + 1,
                                                    productId: nextProductId,
                                                    retailPrice: g?.defaultPrice ?? 1.7,
                                                    traderId: w.id,
                                                    traderName: w.name,
                                                  },
                                                ]
                                              : sellers;
                                          onUpdateStallStageCrew(
                                            stall.slotIndex,
                                            'trader',
                                            nextCrew,
                                            nextSellers
                                          );
                                        }}
                                        className="flex-1 min-w-0 bg-white border border-stone-500 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-stone-900 cursor-pointer"
                                      >
                                        {securedGoods.map((g) => (
                                          <option key={g.id} value={g.id}>
                                            {g.icon} {g.label} (£{g.defaultPrice.toFixed(2)})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {st.key === 'delivery' && (
                          <div className="px-2 py-1 rounded-lg bg-stone-300/80 border border-stone-400 text-stone-800 text-[10px] font-semibold">
                            Zakres: cały kram ({Math.max(1, securedGoods.length)}/4 produktów)
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
                          onClick={() => setTab('trade')}
                          className="w-full py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          ⚙️ Konfiguruj kontrakty w Zakup/Sprzedaż
                        </button>
                      </div>
                    </div>

                    {idx < stages.length - 1 && (
                      <div className="hidden md:flex items-center justify-center">
                        <FarmPipelineArrow
                          direction="right"
                          status={st.ok ? 'ready' : 'blocked'}
                          isActivePulse={st.ok}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {tab === 'products' && (() => {
            const displayOffers =
              traderCrew.length > 0
                ? traderCrew
                    .map((w, idx) => {
                      const prodId =
                        w.assignedProductId &&
                        securedGoods.some((g) => g.id === w.assignedProductId)
                          ? w.assignedProductId
                          : securedGoods[idx]?.id || securedGoods[0]?.id || '';
                      if (!prodId) return null;
                      const good = ALL_MARKET_GOODS.find((g) => g.id === prodId);
                      const matchingSeller =
                        sellers.find((s) => s.traderId === w.id) ||
                        sellers.find((s) => s.productId === prodId);
                      const matchingSupply = supplySlots.find((s) => s.productId === prodId);
                      const retailPrice = resolveRetailPrice(
                        matchingSeller?.retailPrice,
                        good?.defaultPrice
                      );
                      const matchedOffer = availableOffers.find(
                        (o) =>
                          o.good.id === prodId &&
                          o.building.id === matchingSupply?.supplierBuildingId
                      );
                      const rawBuyPrice = matchingSupply?.supplierBuildingId?.startsWith('trade_ship')
                        ? Number(((good?.defaultPrice ?? retailPrice) * 1.1).toFixed(2))
                        : matchedOffer?.price ?? Number((retailPrice * 0.62).toFixed(2));
                      const discountPct = matchingSupply?.contractType
                        ? getContractMeta(matchingSupply.contractType).discountPercent
                        : 0;
                      const purchasePrice = Number(
                        (rawBuyPrice * (1 - discountPct / 100)).toFixed(2)
                      );
                      const scores = computeProductMarketScores(
                        prodId,
                        retailPrice,
                        good?.defaultPrice ?? 1,
                        matchingSupply?.supplierBuildingId,
                        buildingsState,
                        allWorldBuildings
                      );
                      return {
                        key: w.id,
                        traderId: w.id,
                        traderName: w.name,
                        productId: prodId,
                        good,
                        sellerLabel: `Handlarz #${idx + 1}: ${w.name}`,
                        retailPrice,
                        purchasePrice,
                        scores,
                      };
                    })
                    .filter((item): item is NonNullable<typeof item> => Boolean(item))
                : sellers.map((sel) => {
                    const good = ALL_MARKET_GOODS.find((g) => g.id === sel.productId);
                    const matchingSupply = supplySlots.find((s) => s.productId === sel.productId);
                    const retailPrice = resolveRetailPrice(sel.retailPrice, good?.defaultPrice);
                    const matchedOffer = availableOffers.find(
                      (o) =>
                        o.good.id === sel.productId &&
                        o.building.id === matchingSupply?.supplierBuildingId
                    );
                    const rawBuyPrice = matchingSupply?.supplierBuildingId?.startsWith('trade_ship')
                      ? Number(((good?.defaultPrice ?? retailPrice) * 1.1).toFixed(2))
                      : matchedOffer?.price ?? Number((retailPrice * 0.62).toFixed(2));
                    const discountPct = matchingSupply?.contractType
                      ? getContractMeta(matchingSupply.contractType).discountPercent
                      : 0;
                    const purchasePrice = Number(
                      (rawBuyPrice * (1 - discountPct / 100)).toFixed(2)
                    );
                    return {
                      key: String(sel.sellerIndex),
                      traderId: sel.traderId,
                      traderName: sel.traderName,
                      productId: sel.productId,
                      good,
                      sellerLabel: sel.traderName
                        ? `Handlarz #${sel.sellerIndex}: ${sel.traderName}`
                        : `Sprzedawca #${sel.sellerIndex}`,
                      retailPrice,
                      purchasePrice,
                      scores: computeProductMarketScores(
                        sel.productId,
                        retailPrice,
                        good?.defaultPrice ?? 1,
                        matchingSupply?.supplierBuildingId,
                        buildingsState,
                        allWorldBuildings
                      ),
                    };
                  });

            const handleChangeOfferPrice = (
              item: (typeof displayOffers)[number],
              nextPrice: number
            ) => {
              const safePrice = Number.isFinite(nextPrice) && nextPrice > 0 ? nextPrice : 0.1;
              const existingIdx = sellers.findIndex(
                (s) =>
                  (item.traderId && s.traderId === item.traderId) ||
                  s.productId === item.productId
              );
              if (existingIdx >= 0) {
                onUpdateStallSellers(
                  stall.slotIndex,
                  sellers.map((s, idx) =>
                    idx === existingIdx ? { ...s, retailPrice: safePrice } : s
                  )
                );
              } else {
                onUpdateStallSellers(stall.slotIndex, [
                  ...sellers,
                  {
                    sellerIndex: sellers.length + 1,
                    productId: item.productId,
                    retailPrice: safePrice,
                    ...(item.traderId ? { traderId: item.traderId } : {}),
                    ...(item.traderName ? { traderName: item.traderName } : {}),
                  },
                ]);
              }
            };

            return (
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  📦 Oferta Produktów na Stoisku #{stall.slotIndex} ({displayOffers.length}/4)
                </h4>
                {displayOffers.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    Brak wystawionych produktów. Wybierz towary w Zaopatrzeniu i zatrudnij handlarzy.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayOffers.map((item) => (
                      <div
                        key={item.key}
                        className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {item.good?.icon || '📦'} {item.good?.label || item.productId}
                            </p>
                            <p className="text-[10px] text-stone-400 font-mono truncate">
                              {item.sellerLabel}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/60 shadow-sm flex items-center gap-1">
                              <span className="text-[9px] uppercase font-bold text-emerald-200">
                                Cena £
                              </span>
                              <input
                                type="number"
                                min={0.1}
                                step={item.retailPrice >= 20 ? 1 : 0.1}
                                value={item.retailPrice}
                                onChange={(e) =>
                                  handleChangeOfferPrice(item, Number(e.target.value))
                                }
                                className="w-16 bg-stone-950/90 border border-emerald-500/50 rounded px-1.5 py-0.5 text-right font-mono text-xs font-extrabold text-emerald-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div className="text-[10px] font-mono text-rose-300 font-semibold">
                              Zakup: £{item.purchasePrice.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Lewa strona: 3 pionowe paski (Jakość, Marka, Cena) | Prawa strona: 3 overalle w pionie */}
                        <div className="grid grid-cols-[1fr_1fr] gap-3 items-stretch pt-1">
                          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2 flex items-end justify-around gap-2">
                            {[
                              {
                                label: 'Jakość',
                                icon: '⭐',
                                val: item.scores.qualityScore,
                                barClass: 'bg-emerald-400',
                                textClass: 'text-emerald-300',
                              },
                              {
                                label: 'Marka',
                                icon: '🏷️',
                                val: item.scores.brandScore,
                                barClass: 'bg-sky-400',
                                textClass: 'text-sky-300',
                              },
                              {
                                label: 'Cena',
                                icon: '💷',
                                val: item.scores.priceScore,
                                barClass: item.scores.priceScore < 0 ? 'bg-rose-500' : 'bg-amber-400',
                                textClass: item.scores.priceScore < 0 ? 'text-rose-400' : 'text-amber-300',
                              },
                            ].map((metric) => (
                              <div
                                key={metric.label}
                                className="flex flex-col items-center gap-1 flex-1"
                              >
                                <span className={`font-mono text-[10px] font-bold ${metric.textClass}`}>
                                  {metric.val}%
                                </span>
                                <div className="relative w-8 h-24 bg-stone-900 rounded-lg overflow-hidden border border-stone-700/80 flex items-end">
                                  <div
                                    className={`w-full ${metric.barClass} transition-all`}
                                    style={{ height: `${Math.min(100, Math.abs(metric.val))}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-stone-300 font-semibold whitespace-nowrap">
                                  {metric.icon} {metric.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col justify-between gap-1.5 font-mono">
                            <div
                              title="Robotnicy: 80% Cena + 10% Marka + 10% Jakość"
                              className="bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                            >
                              <span className="text-[10px] text-stone-300 font-sans font-semibold">
                                🔨 Robotnicy
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  item.scores.workersOverall < 0 ? 'text-rose-400' : 'text-stone-100'
                                }`}
                              >
                                {item.scores.workersOverall}%
                              </span>
                            </div>
                            <div
                              title="Mieszczanie: 60% Cena + 20% Marka + 20% Jakość"
                              className="bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                            >
                              <span className="text-[10px] text-sky-200 font-sans font-semibold">
                                💼 Mieszczanie
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  item.scores.middleOverall < 0 ? 'text-rose-400' : 'text-sky-300'
                                }`}
                              >
                                {item.scores.middleOverall}%
                              </span>
                            </div>
                            <div
                              title="Elita: 30% Cena + 35% Marka + 35% Jakość"
                              className="bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                            >
                              <span className="text-[10px] text-amber-200 font-sans font-semibold">
                                👑 Elita
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  item.scores.eliteOverall < 0 ? 'text-rose-400' : 'text-amber-300'
                                }`}
                              >
                                {item.scores.eliteOverall}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {tab === 'trade' && (
            <MarketStallTradeTab
              stall={stall}
              suppliersCount={suppliersCount}
              playerStallsCount={playerStallsCount}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onUpdateSuppliersCount={onUpdateSuppliersCount}
              onUpdateStallSupply={onUpdateStallSupply}
              onUpdateStallSellers={onUpdateStallSellers}
            />
          )}

          {tab === 'finance' && (
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
        </div>
      </div>

      {staffModalKey && (
        <MarketStallStaffModal
          stageKey={staffModalKey}
          assigned={stageCrew[staffModalKey] || []}
          onAssignNew={(member) => {
            const assignedProd =
              staffModalKey === 'trader'
                ? (
                    securedGoods.find(
                      (g) => !traderCrew.some((t) => t.assignedProductId === g.id)
                    ) || securedGoods[0]
                  )?.id
                : undefined;
            const enrichedMember =
              staffModalKey === 'trader' && assignedProd
                ? { ...member, assignedProductId: assignedProd }
                : member;
            const next = [...(stageCrew[staffModalKey] || []), enrichedMember];
            const nextSellers =
              staffModalKey === 'trader' &&
              assignedProd &&
              sellers.length < 4 &&
              !sellers.some((s) => s.productId === assignedProd)
                ? [
                    ...sellers,
                    {
                      sellerIndex: sellers.length + 1,
                      productId: assignedProd,
                      retailPrice:
                        ALL_MARKET_GOODS.find((item) => item.id === assignedProd)?.defaultPrice ??
                        1.7,
                      traderId: enrichedMember.id,
                      traderName: enrichedMember.name,
                    },
                  ]
                : undefined;
            onUpdateStallStageCrew(stall.slotIndex, staffModalKey, next, nextSellers);
            if (staffModalKey === 'supply' && suppliersCount === 0) {
              onUpdateSuppliersCount(1);
            }
          }}
          onUnassign={(memberId) => {
            const next = (stageCrew[staffModalKey] || []).filter((m) => m.id !== memberId);
            const nextSellers =
              staffModalKey === 'trader'
                ? sellers
                    .filter((s) => s.traderId !== memberId)
                    .map((s, idx) => ({ ...s, sellerIndex: idx + 1 }))
                : undefined;
            onUpdateStallStageCrew(stall.slotIndex, staffModalKey, next, nextSellers);
          }}
          onClose={() => setStaffModalKey(null)}
        />
      )}
    </div>
  );
};
