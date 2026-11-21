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
import { MarketStallTradeTab } from './MarketStallTradeTab';
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
    members: MarketStallCrewMember[]
  ) => void;
  onClose: () => void;
}

type StallTab = 'process' | 'products' | 'trade' | 'finance';

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
  const [tab, setTab] = useState<StallTab>('process');
  const [infoStageKey, setInfoStageKey] = useState<StallStageKey | null>(null);
  const [staffModalKey, setStaffModalKey] = useState<StallStageKey | null>(null);
  const [traderProductId, setTraderProductId] = useState<string>('');

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
  const effectiveTraderProductId = securedGoods.some((g) => g.id === traderProductId)
    ? traderProductId
    : securedGoods[0]?.id || '';
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

  const handleSelectCombinedProductAndSupplier = (combinedKey: string) => {
    const [supplierBuildingId, productId] = combinedKey.split('::');
    if (supplySlots.length === 0) {
      onUpdateStallSupply(stall.slotIndex, [
        { slotIndex: 1, productId, supplierBuildingId },
      ]);
    } else {
      const next = supplySlots.map((s, idx) =>
        idx === 0 ? { ...s, productId, supplierBuildingId } : s
      );
      onUpdateStallSupply(stall.slotIndex, next);
    }
  };

  const monthlyRentCost = Number(((stall.annualRent || 400) / 12).toFixed(2));
  const estMonthlyRevenue = Number(
    sellers.reduce((sum, s) => sum + (s.retailPrice || 1) * 180, 0).toFixed(2)
  );
  const estMonthlySupplyCost = Number((estMonthlyRevenue * 0.62).toFixed(2));
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
        'Woźnica / Dostawca dowozi zakontraktowany towar z magazynów producenta na stoisko targowe.',
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
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-bold text-stone-200 cursor-pointer"
          >
            ✕ Zamknij
          </button>
        </div>

        {/* 4 Zakładki jak w karcie Piekarni */}
        <div className="bg-stone-950/80 p-0.5 rounded-xl border border-stone-800 shadow-inner flex gap-1">
          {[
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
                        {/* Wybór produktu i dostawcy w jednym okienku (jak w piekarni) */}
                        {st.key === 'supply' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-700 block">
                              Produkt i dostawca na stoisko:
                            </label>
                            <select
                              value={selectedCombinedKey}
                              onChange={(e) =>
                                handleSelectCombinedProductAndSupplier(e.target.value)
                              }
                              className="w-full bg-white border border-stone-500 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-900 cursor-pointer"
                            >
                              {combinedStageOptions.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Pasek wyboru produktu na kafelku 2. Handlarz */}
                        {st.key === 'trader' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-700 block">
                              Produkt do sprzedaży (z kontraktu):
                            </label>
                            {securedGoods.length === 0 ? (
                              <div className="px-2 py-1 rounded-lg bg-stone-300 border border-stone-500 text-stone-700 text-[10px] font-semibold">
                                Najpierw wybierz produkt w Zaopatrzeniu
                              </div>
                            ) : (
                              <select
                                value={effectiveTraderProductId}
                                onChange={(e) => setTraderProductId(e.target.value)}
                                className="w-full bg-white border border-stone-500 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-900 cursor-pointer"
                              >
                                {securedGoods.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.icon} {g.label} (£{g.defaultPrice.toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {st.workers.length === 0 ? (
                          <div className="px-2 py-1.5 rounded-lg bg-rose-200/70 border border-rose-400 text-rose-900 text-[10px] font-bold">
                            ⚠️ {st.emptyLabel}
                          </div>
                        ) : (
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
                        )}

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

          {tab === 'products' && (
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                📦 Oferta Produktów na Stoisku #{stall.slotIndex}
              </h4>
              {sellers.length === 0 ? (
                <p className="text-xs text-stone-400 italic">
                  Brak wystawionych produktów. Zakontraktuj towary i przypisz sprzedawców w zakładce Zakup/Sprzedaż.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sellers.map((sel) => {
                    const good = ALL_MARKET_GOODS.find((g) => g.id === sel.productId);
                    return (
                      <div
                        key={sel.sellerIndex}
                        className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">
                            {good?.icon || '📦'} {good?.label || sel.productId}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            Sprzedawca #{sel.sellerIndex}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-emerald-300">
                          £{(sel.retailPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-stone-950/85 border border-emerald-500/30 rounded-xl p-3">
                <p className="text-[10px] text-stone-400 uppercase">Szac. przychód / msc</p>
                <p className="text-lg font-mono font-bold text-emerald-300 mt-1">
                  +£{estMonthlyRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-stone-950/85 border border-rose-500/30 rounded-xl p-3">
                <p className="text-[10px] text-stone-400 uppercase">Szac. zakup towaru / msc</p>
                <p className="text-lg font-mono font-bold text-rose-300 mt-1">
                  -£{estMonthlySupplyCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-stone-950/85 border border-rose-500/30 rounded-xl p-3">
                <p className="text-[10px] text-stone-400 uppercase">Dzierżawa stoiska / msc</p>
                <p className="text-lg font-mono font-bold text-rose-300 mt-1">
                  -£{monthlyRentCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-stone-950/85 border border-amber-500/40 rounded-xl p-3">
                <p className="text-[10px] text-stone-400 uppercase">Wynik netto / msc</p>
                <p
                  className={`text-lg font-mono font-bold mt-1 ${
                    estMonthlyNet >= 0 ? 'text-amber-300' : 'text-rose-400'
                  }`}
                >
                  {estMonthlyNet >= 0 ? '+' : ''}£{estMonthlyNet.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {staffModalKey && (
        <MarketStallStaffModal
          stageKey={staffModalKey}
          assigned={stageCrew[staffModalKey] || []}
          onAssignNew={(member) => {
            const next = [...(stageCrew[staffModalKey] || []), member];
            onUpdateStallStageCrew(stall.slotIndex, staffModalKey, next);
            if (staffModalKey === 'supply' && suppliersCount === 0) {
              onUpdateSuppliersCount(1);
            }
            if (
              staffModalKey === 'trader' &&
              effectiveTraderProductId &&
              sellers.length < 4 &&
              !sellers.some((s) => s.productId === effectiveTraderProductId)
            ) {
              const g = ALL_MARKET_GOODS.find((item) => item.id === effectiveTraderProductId);
              onUpdateStallSellers(stall.slotIndex, [
                ...sellers,
                {
                  sellerIndex: sellers.length + 1,
                  productId: effectiveTraderProductId,
                  retailPrice: g?.defaultPrice ?? 1.7,
                  traderId: member.id,
                  traderName: member.name,
                },
              ]);
            }
          }}
          onUnassign={(memberId) => {
            const next = (stageCrew[staffModalKey] || []).filter((m) => m.id !== memberId);
            onUpdateStallStageCrew(stall.slotIndex, staffModalKey, next);
          }}
          onClose={() => setStaffModalKey(null)}
        />
      )}
    </div>
  );
};
