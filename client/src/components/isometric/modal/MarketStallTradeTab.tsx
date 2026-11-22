import React, { useState } from 'react';
import type {
  BuildingState,
  MarketStallSeller,
  MarketStallSlot,
  MarketStallSupplySlot,
} from '../types';
import {
  formatSupplierOrderLabel,
  type WorldSupplierBuilding,
} from './industrySupplyConfig';
import { ALL_MARKET_GOODS, getAvailableMarketOffers } from './marketplaceGoods';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from './industryContracts';
import { getTransportCompanies, resolveRouteForSupplier } from './transportLogistics';

interface MarketStallTradeTabProps {
  stall: MarketStallSlot;
  suppliersCount: number;
  playerStallsCount: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onUpdateSuppliersCount: (count: number) => void;
  onUpdateStallSupply: (slotIndex: number, supplySlots: MarketStallSupplySlot[]) => void;
  onUpdateStallSellers: (slotIndex: number, sellers: MarketStallSeller[]) => void;
}

export const MarketStallTradeTab: React.FC<MarketStallTradeTabProps> = ({
  stall,
  suppliersCount,
  playerStallsCount,
  allWorldBuildings,
  buildingsState,
  onUpdateStallSupply,
  onUpdateStallSellers,
}) => {
  const [subTab, setSubTab] = useState<'buy' | 'sell'>('buy');
  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    ALL_MARKET_GOODS[0]?.id || 'chleb'
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('trade_ship_init');
  const [monthlyKg, setMonthlyKg] = useState<number>(300);
  const [contractType, setContractType] = useState<ContractType>('pay_as_you_go');
  const [transportCompanyId, setTransportCompanyId] = useState<string>('');
  const [interventionBuy, setInterventionBuy] = useState<boolean>(false);

  const supplySlots = stall.supplySlots || [];
  const sellers = stall.sellers || [];
  const traderCrew = stall.stageCrew?.trader || [];
  const isStallSupplied = suppliersCount > 0 && suppliersCount * 4 >= playerStallsCount;
  const transportCompanies = getTransportCompanies(allWorldBuildings);
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

  const productOffers = availableOffers.filter((o) => o.good.id === selectedProductId);
  const suppliersList = [shipSupplier, ...productOffers.map((o) => o.building)];
  const activeSupplierId = suppliersList.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;

  const selectedGood =
    ALL_MARKET_GOODS.find((g) => g.id === selectedProductId) || ALL_MARKET_GOODS[0];
  const meta = getContractMeta(contractType);

  const handleAddBuyContract = () => {
    if (supplySlots.length >= 4) return;
    const nextSlot: MarketStallSupplySlot = {
      slotIndex: supplySlots.length + 1,
      productId: selectedProductId,
      supplierBuildingId: activeSupplierId,
      transportMode: 'horses',
      transportCompanyId: transportCompanyId || undefined,
      monthlyKg,
      contractType,
      monthsRemaining: meta.durationMonths,
    };
    onUpdateStallSupply(stall.slotIndex, [...supplySlots, nextSlot]);
  };

  const handleRemoveBuyContract = (slotIdx: number) => {
    const remaining = supplySlots
      .filter((s) => s.slotIndex !== slotIdx)
      .map((s, i) => ({ ...s, slotIndex: i + 1 }));
    onUpdateStallSupply(stall.slotIndex, remaining);
  };

  const securedGoods = supplySlots
    .filter((s) => Boolean(s.supplierBuildingId))
    .map((s) => ALL_MARKET_GOODS.find((g) => g.id === s.productId))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const uniqueSecuredGoods = Array.from(
    new Map(securedGoods.map((g) => [g.id, g])).values()
  );

  const [sellProductId, setSellProductId] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<number>(2.0);
  const [sellTraderId, setSellTraderId] = useState<string>('');
  const usedTraderIds = new Set(
    sellers.map((s) => s.traderId).filter((id): id is string => Boolean(id))
  );
  const freeTraders = traderCrew.filter((t) => !usedTraderIds.has(t.id));
  const effectiveSellProductId = uniqueSecuredGoods.some((g) => g.id === sellProductId)
    ? sellProductId
    : uniqueSecuredGoods[0]?.id || '';
  const effectiveSellTraderId = freeTraders.some((t) => t.id === sellTraderId)
    ? sellTraderId
    : freeTraders[0]?.id || '';

  const handleAddSeller = () => {
    if (sellers.length >= 4 || !effectiveSellProductId) return;
    const chosenTrader = freeTraders.find((t) => t.id === effectiveSellTraderId);
    const nextSeller: MarketStallSeller = {
      sellerIndex: sellers.length + 1,
      productId: effectiveSellProductId,
      retailPrice: sellPrice,
      ...(chosenTrader ? { traderId: chosenTrader.id, traderName: chosenTrader.name } : {}),
    };
    onUpdateStallSellers(stall.slotIndex, [...sellers, nextSeller]);
  };

  const handleAssignTraderToSeller = (sellerIndex: number, traderId: string) => {
    if (
      traderId &&
      sellers.some((s) => s.sellerIndex !== sellerIndex && s.traderId === traderId)
    ) {
      return;
    }
    const chosen = traderCrew.find((t) => t.id === traderId);
    const updated = sellers.map((s) =>
      s.sellerIndex === sellerIndex
        ? { ...s, traderId: chosen?.id, traderName: chosen?.name }
        : s
    );
    onUpdateStallSellers(stall.slotIndex, updated);
  };

  const handleRemoveSeller = (sellerIdx: number) => {
    const filtered = sellers
      .filter((s) => s.sellerIndex !== sellerIdx)
      .map((s, i) => ({ ...s, sellerIndex: i + 1 }));
    onUpdateStallSellers(stall.slotIndex, filtered);
  };

  return (
    <div className="space-y-3">
      {/* Podział na 2 podzakładki: Zakupy / Sprzedaż */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSubTab('buy')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'buy'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🛒 Zakupy (Surowce i Towary)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('sell')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'sell'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🤝 Sprzedaż (Detal na Stoisku)
        </button>
      </div>

      {subTab === 'buy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* LEWA KOLUMNA: Wymogi, stany i formatka zamówienia */}
          <div className="space-y-3">
            <div className="bg-stone-900/90 rounded-2xl p-3 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧺</span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Zaopatrzenie Stoiska #{stall.slotIndex}</span>
                    <span
                      title="Stoisko mieści maksymalnie 4 równoległe kontrakty dostaw towarów."
                      className="w-4 h-4 rounded-full bg-stone-800 text-stone-300 text-[10px] inline-flex items-center justify-center cursor-help"
                    >
                      ℹ
                    </span>
                  </h4>
                  <span className="text-[10px] font-mono text-stone-400">
                    Zaopatrzeniowiec: {isStallSupplied ? 'Aktywny' : 'Brak'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                {supplySlots.length} / 4 sloty
              </span>
            </div>

            <div className="bg-stone-900/90 rounded-2xl p-3 border border-amber-500/30 space-y-2.5">
              <button
                type="button"
                onClick={() => setIsOrderOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-amber-950/55 hover:bg-amber-900/65 border border-amber-500/50 text-left text-[11px] font-bold uppercase tracking-wider text-amber-200 cursor-pointer transition-colors"
              >
                <span>🛒 Nowy Kontrakt Zakupu</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-stone-950 border border-stone-700 text-stone-300">
                  {isOrderOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOrderOpen && (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">Towar</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-white font-bold cursor-pointer"
                  >
                    {ALL_MARKET_GOODS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">Dostawca</label>
                  <select
                    value={activeSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
                  >
                    {suppliersList.map((s) =>
                      s.typeId === 'trade_ship' ? (
                        <option key={s.id} value={s.id}>
                          🚢 Statek Handlowy (£{(selectedGood.defaultPrice * 1.1).toFixed(2)})
                        </option>
                      ) : (
                        <option key={s.id} value={s.id}>
                          {formatSupplierOrderLabel(s, buildingsState, allWorldBuildings)}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Przyciski szybkiej zmiany ilości: -100, +100, ++1t */}
              <div className="flex items-center justify-between gap-2 bg-stone-950/80 border border-stone-800 rounded-xl p-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMonthlyKg((v) => Math.max(100, v - 1000))}
                    className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-xs font-mono font-bold text-rose-200 cursor-pointer"
                  >
                    --1t
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthlyKg((v) => Math.max(100, v - 100))}
                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono font-bold text-stone-200 cursor-pointer"
                  >
                    -100
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-yellow-300">
                    {monthlyKg.toLocaleString('pl-PL')} kg/msc
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonthlyKg((v) => v + 100)}
                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono font-bold text-stone-200 cursor-pointer"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthlyKg((v) => v + 1000)}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 cursor-pointer"
                  >
                    ++1t
                  </button>
                </div>

                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="bg-stone-900 border border-amber-500/40 rounded-lg px-2 py-1 text-[11px] text-amber-200 font-semibold cursor-pointer"
                >
                  {CONTRACT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.discountPercent > 0 ? `-${opt.discountPercent}%` : '0%'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Transport</label>
                <select
                  value={transportCompanyId}
                  onChange={(e) => setTransportCompanyId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
                >
                  <option value="">🐎 Własny transport / Dostawa bazowa</option>
                  {transportCompanies.map((tc) => {
                    const sup = allWorldBuildings.find((b) => b.id === activeSupplierId);
                    const route = sup ? resolveRouteForSupplier(sup) : 'local';
                    return (
                      <option key={tc.id} value={tc.id}>
                        🚚 {tc.name} ({route})
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                disabled={supplySlots.length >= 4}
                onClick={handleAddBuyContract}
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 text-xs font-bold cursor-pointer"
              >
                + Dodaj kontrakt zakupu ({supplySlots.length}/4)
              </button>
              </>
              )}
            </div>
          </div>

          {/* PRAWA KOLUMNA: Zawarte Kontrakty Zakupu */}
          <div className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                📜 Zawarte Kontrakty Zakupu
              </h4>
              <span className="text-[10px] font-mono text-stone-400">
                Aktywne: <strong className="text-emerald-300">{supplySlots.length}</strong>
              </span>
            </div>

            <label className="flex items-center gap-2 bg-stone-950/70 border border-amber-500/30 rounded-lg px-2 py-1 text-[10px] text-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={interventionBuy}
                onChange={(e) => setInterventionBuy(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
              <span className="font-semibold">
                🛟 Zakup interwencyjny ze statku (+10% do ceny statku)
              </span>
              <span
                title="Gdy dostawca nie zrealizuje kontraktu w pełni lub w części, brakująca ilość zostanie dokupiona na Statku Handlowym po cenie statku + 10%."
                className="text-stone-400 hover:text-amber-300 cursor-help ml-auto"
              >
                ℹ
              </span>
            </label>

            {supplySlots.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">
                Brak zawartych kontraktów zakupu. Użyj formularza po lewej, aby dodać dostawcę.
              </p>
            ) : (
              <div className="space-y-1.5">
                {supplySlots.map((ord) => {
                  const good = ALL_MARKET_GOODS.find((g) => g.id === ord.productId);
                  const supId = ord.supplierBuildingId || 'trade_ship_init';
                  const isShip = supId.startsWith('trade_ship');
                  const supObj = allWorldBuildings.find((b) => b.id === supId);
                  const owner = buildingsState[supId]?.ownerName || supObj?.playerName;
                  const isOurs = !isShip && (!owner || owner === 'Gracz');
                  const ordMeta = getContractMeta(ord.contractType || 'pay_as_you_go');
                  const qty = ord.monthlyKg ?? 300;
                  const penalty = computeSupplyContractPenalty(
                    qty,
                    (good?.defaultPrice || 1.5) * 100,
                    ord.contractType || 'pay_as_you_go',
                    ord.monthsRemaining ?? 0
                  );
                  return (
                    <div
                      key={ord.slotIndex}
                      className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="text-emerald-200 font-semibold">
                        ✓ <span className="text-white font-bold">{good?.label || ord.productId}</span>{' '}
                        •{' '}
                        <span
                          className={
                            isOurs
                              ? 'text-sky-300 font-bold'
                              : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                          }
                        >
                          {isShip
                            ? '🚢 Statek Handlowy'
                            : supObj
                            ? formatSupplierOrderLabel(supObj, buildingsState, allWorldBuildings)
                            : 'Producent'}
                        </span>{' '}
                        •{' '}
                        <span className="font-mono font-bold text-yellow-300">
                          {qty.toLocaleString('pl-PL')} kg/msc
                        </span>{' '}
                        • {ordMeta.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBuyContract(ord.slotIndex)}
                        className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
                      >
                        ✕{penalty > 0 ? ` (£${penalty})` : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* LEWA KOLUMNA: Dodanie oferty sprzedaży detalicznej */}
          <div className="bg-stone-900/90 rounded-2xl p-3 border border-amber-500/30 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              🤝 Wystaw Produkt na Stoisku ({sellers.length}/4)
            </h4>
            {uniqueSecuredGoods.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                Najpierw zakontraktuj towary w podzakładce Zakupy.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={effectiveSellProductId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setSellProductId(nextId);
                      const matched = ALL_MARKET_GOODS.find((g) => g.id === nextId);
                      if (matched) setSellPrice(matched.defaultPrice);
                    }}
                    className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-white font-bold cursor-pointer"
                  >
                    {uniqueSecuredGoods.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] font-mono text-emerald-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">
                    Sprzedawca przypisany do produktu
                  </label>
                  <select
                    value={effectiveSellTraderId}
                    onChange={(e) => setSellTraderId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-sky-200 font-semibold cursor-pointer"
                  >
                    {freeTraders.length === 0 ? (
                      <option value="">
                        {traderCrew.length === 0
                          ? '-- Brak zatrudnionych handlarzy (zatrudnij w Proces Sprzedaży) --'
                          : '-- Wszyscy handlarze są już przypisani do innych dóbr --'}
                      </option>
                    ) : (
                      freeTraders.map((t) => (
                        <option key={t.id} value={t.id}>
                          👤 {t.name} (£{t.dailyWage}/d)
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={sellers.length >= 4}
                  onClick={handleAddSeller}
                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                >
                  + Wystaw na ladę ({sellers.length}/4)
                </button>
              </>
            )}
          </div>

          {/* PRAWA KOLUMNA: Aktywne pozycje sprzedaży */}
          <div className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-500/30 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              📜 Aktywna Sprzedaż Detaliczna
            </h4>
            {sellers.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">Brak wystawionych produktów.</p>
            ) : (
              <div className="space-y-1.5">
                {sellers.map((sel) => {
                  const g = ALL_MARKET_GOODS.find((item) => item.id === sel.productId);
                  return (
                    <div
                      key={sel.sellerIndex}
                      className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]"
                    >
                      <div>
                        <span className="text-white font-bold">{g?.label || sel.productId}</span> •{' '}
                        <span className="font-mono font-bold text-yellow-300">
                          £{(sel.retailPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={sel.traderId || ''}
                          onChange={(e) =>
                            handleAssignTraderToSeller(sel.sellerIndex, e.target.value)
                          }
                          className="bg-stone-950 border border-sky-500/40 rounded-lg px-2 py-0.5 text-[10px] text-sky-200 font-semibold cursor-pointer"
                        >
                          <option value="">-- Wybierz sprzedawcę --</option>
                          {traderCrew
                            .filter((t) => t.id === sel.traderId || !usedTraderIds.has(t.id))
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                👤 {t.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSeller(sel.sellerIndex)}
                          className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
