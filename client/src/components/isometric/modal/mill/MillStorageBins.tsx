import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { loadGameParameters } from '../../admin/gameParameters';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from '../industryContracts';
import {
  formatSupplierOrderLabel,
  getIncomingSalesContracts,
  type WorldSupplierBuilding,
} from '../industrySupplyConfig';
import { CROPS_CONFIG } from '../farmGridTypes';
import { getMillGrainOrders, MILL_PRODUCTS_CONFIG, type MillCapitalismState } from './millTypes';

interface MillStorageBinsProps {
  buildingId?: string;
  state: MillCapitalismState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdate: (updates: Partial<MillCapitalismState>) => void;
}

export const MillStorageBins: React.FC<MillStorageBinsProps> = ({
  buildingId = '',
  state,
  allWorldBuildings,
  buildingsState,
  clock,
  onSpendGold,
  onUpdate,
}) => {
  const [subTab, setSubTab] = useState<'buy' | 'sell'>('buy');

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
  const wheatFarms = [
    shipSupplier,
    ...allWorldBuildings.filter((b) => b.typeId === 'wheat_farm'),
  ];
  const activeOrders = getMillGrainOrders(state);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    activeOrders[0]?.supplierId || wheatFarms[0]?.id || ''
  );
  const [monthlyKg, setMonthlyKg] = useState<number>(activeOrders[0]?.monthlyKg || 1000);
  const [contractType, setContractType] = useState<ContractType>(
    activeOrders[0]?.contractType || 'pay_as_you_go'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const productCfg = MILL_PRODUCTS_CONFIG[state.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;
  const existingForSelected = activeOrders.find((o) => o.supplierId === selectedSupplierId);
  const isSelectedLocked =
    Boolean(existingForSelected) &&
    existingForSelected!.contractType !== 'pay_as_you_go' &&
    existingForSelected!.monthsRemaining > 0;

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveOrder = () => {
    if (!selectedSupplierId) {
      notify('⚠️ Wybierz dostawcę ziarna.');
      return;
    }
    if (isSelectedLocked && monthlyKg < existingForSelected!.monthlyKg) {
      notify('🔒 W trakcie trwania kontraktu terminowego nie można zmniejszyć zamówienia.');
      return;
    }
    const meta = getContractMeta(contractType);
    const totalMonths = clock ? clock.date.year * 12 + clock.date.month : 1880 * 12 + 4;
    const nextOrder = {
      supplierId: selectedSupplierId,
      monthlyKg: Math.max(100, monthlyKg),
      contractType,
      monthsRemaining: meta.durationMonths,
      startTotalMonths: totalMonths,
    };
    const nextOrders = [
      ...activeOrders.filter((o) => o.supplierId !== selectedSupplierId),
      nextOrder,
    ];
    onUpdate({ grainOrders: nextOrders, grainOrder: nextOrders[0] });
    notify(`✓ Zapisano kontrakt ziarna: ${monthlyKg.toLocaleString('pl-PL')} kg/msc (${meta.label}).`);
  };

  const handleRemoveOrder = (supplierId: string) => {
    const target = activeOrders.find((o) => o.supplierId === supplierId);
    if (!target) return;
    const penalty = computeSupplyContractPenalty(
      target.monthlyKg,
      35,
      target.contractType,
      target.monthsRemaining
    );
    if (penalty > 0 && onSpendGold) onSpendGold(penalty);
    const nextOrders = activeOrders.filter((o) => o.supplierId !== supplierId);
    onUpdate({
      grainOrders: nextOrders,
      grainOrder: nextOrders[0],
      totalExpenses: state.totalExpenses + penalty,
    });
    notify(penalty > 0 ? `⚠️ Zerwano kontrakt — kara £${penalty}.` : '✕ Usunięto kontrakt.');
  };

  const grainPct = Math.min(100, Math.round((state.grainStockKg / state.grainCapacityKg) * 100));
  const flourPct = Math.min(100, Math.round((state.flourStockKg / state.flourCapacityKg) * 100));
  const branPct = Math.min(100, Math.round((state.branStockKg / state.branCapacityKg) * 100));
  const grainDemandKg = (loadGameParameters().millBaseDailyGrainKg ?? 200) * 30;

  return (
    <div className="space-y-2.5">
      {/* 2 podzakładki: Zakupy / Sprzedaż */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSubTab('buy')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'buy'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🛒 Zakupy (Surowce)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('sell')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'sell'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🤝 Sprzedaż (Wyroby)
        </button>
      </div>

      {feedback && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-amber-100 font-semibold">
          {feedback}
        </div>
      )}

      {subTab === 'buy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {/* LEWA KOLUMNA: WYMOGI + FORMATKA ZAMÓWIENIA */}
          <div className="space-y-2">
            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>🌾</span> {productCfg.requiredGrainLabel}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold shrink-0">
                  {grainDemandKg.toLocaleString('pl-PL')} kg/msc
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-stone-100">
                <span className={state.grainStockKg <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
                  {state.grainStockKg.toLocaleString('pl-PL')}
                </span>{' '}
                <span className="text-[10px] text-stone-400">
                  / {state.grainCapacityKg.toLocaleString('pl-PL')} kg ({grainPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-amber-400" style={{ width: `${grainPct}%` }} />
              </div>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-amber-500/30 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                🛒 Nowy Kontrakt Ziarna
              </h4>
              <div className="space-y-1.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                    Dostawca
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100 cursor-pointer"
                  >
                    {wheatFarms.map((farm) => {
                      if (farm.typeId === 'trade_ship') {
                        return (
                          <option key={farm.id} value={farm.id}>
                            🚢 Port Londyn • Statek Handlowy • Zboże (Import 110%)
                          </option>
                        );
                      }
                      const farmState = buildingsState[farm.id]?.farmCapitalism;
                      const cropKey = farmState?.cropType || 'pszenica';
                      const cropName = CROPS_CONFIG[cropKey]?.name || 'Pszenica Złocista';
                      const grainMap = farmState?.grainStockKg;
                      const avail = grainMap ? Object.values(grainMap).reduce((s, v) => s + v, 0) : 0;
                      return (
                        <option key={farm.id} value={farm.id}>
                          🌾 {formatSupplierOrderLabel(farm, buildingsState, wheatFarms)} • {cropName} ({avail.toLocaleString('pl-PL')} kg)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                      Ilość miesięczna
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setMonthlyKg((v) => Math.max(100, v - 100))}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 cursor-pointer"
                      >
                        -100
                      </button>
                      <span className="flex-1 text-center font-mono text-[11px] font-bold text-amber-200 bg-stone-950 border border-stone-800 rounded-lg py-1">
                        {monthlyKg.toLocaleString('pl-PL')} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => setMonthlyKg((v) => v + 100)}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 cursor-pointer"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => setMonthlyKg((v) => v + 1000)}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-amber-300 cursor-pointer"
                      >
                        ++1t
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                      Kontrakt terminowy
                    </label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value as ContractType)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100 cursor-pointer"
                    >
                      {CONTRACT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.discountPercent > 0 ? `-${opt.discountPercent}%` : '0%'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveOrder}
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
              >
                {existingForSelected ? 'Aktualizuj kontrakt' : '+ Dodaj kontrakt zakupu'}
              </button>
            </div>
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY ZAKUPU */}
          <div className="bg-stone-900/90 rounded-xl p-2.5 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                📜 Zawarte Kontrakty Zakupu
              </h4>
              <span className="text-[10px] font-mono text-stone-400">
                Aktywne: <strong className="text-emerald-300">{activeOrders.length}</strong>
              </span>
            </div>

            <label className="flex items-center gap-2 bg-stone-950/70 border border-amber-500/30 rounded-lg px-2 py-1 text-[10px] text-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={!!state.interventionBuyEnabled}
                onChange={(e) => onUpdate({ interventionBuyEnabled: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
              <span className="font-semibold">🛟 Zakup interwencyjny ze statku (+10% do ceny statku)</span>
              <span
                title="Gdy dostawca nie zrealizuje kontraktu w pełni lub w części w danym miesiącu, brakująca ilość zostanie dokupiona na Statku Handlowym po cenie statku + 10%."
                className="text-stone-400 hover:text-amber-300 cursor-help ml-auto"
              >
                ℹ
              </span>
            </label>

            {activeOrders.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">Brak aktywnych kontraktów zakupu.</p>
            ) : (
              <div className="space-y-1">
                {activeOrders.map((ord) => {
                  const ordMeta = getContractMeta(ord.contractType);
                  const farmObj = wheatFarms.find((f) => f.id === ord.supplierId);
                  const isShip = ord.supplierId.startsWith('trade_ship');
                  const owner = buildingsState[ord.supplierId]?.ownerName || farmObj?.playerName;
                  const isOurs = !isShip && (!owner || owner === 'Gracz');
                  const penalty = computeSupplyContractPenalty(
                    ord.monthlyKg,
                    35,
                    ord.contractType,
                    ord.monthsRemaining
                  );
                  const farmCropKey = buildingsState[ord.supplierId]?.farmCapitalism?.cropType || 'pszenica';
                  const cropName = isShip ? 'Zboże (Import)' : CROPS_CONFIG[farmCropKey]?.name || 'Pszenica Złocista';
                  return (
                    <div
                      key={ord.supplierId}
                      className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[11px]"
                    >
                      <div className="text-emerald-200 font-semibold">
                        ✓ <span className="text-white font-bold">{cropName}</span> •{' '}
                        <span
                          className={
                            isOurs
                              ? 'text-sky-300 font-bold'
                              : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                          }
                        >
                          {isShip
                            ? '🚢 Statek Handlowy'
                            : farmObj
                            ? formatSupplierOrderLabel(farmObj, buildingsState, wheatFarms)
                            : 'Farma Zbożowa'}
                        </span>{' '}
                        •{' '}
                        <span className="font-mono font-bold text-yellow-300">
                          {ord.monthlyKg.toLocaleString('pl-PL')} kg/msc
                        </span>{' '}
                        • {ordMeta.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOrder(ord.supplierId)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {/* LEWA KOLUMNA: MAGAZYNY WYROBÓW */}
          <div className="space-y-2">
            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white">
                  {productCfg.icon} {productCfg.label}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {flourPct}% • Jakość {state.flourQualityPercent}% •{' '}
                  <strong className="text-amber-300">£{state.flourPricePerKg.toFixed(2)}/kg</strong>
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-stone-100">
                {state.flourStockKg.toLocaleString('pl-PL')} / {state.flourCapacityKg.toLocaleString('pl-PL')} kg
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-emerald-400" style={{ width: `${flourPct}%` }} />
              </div>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white">🥣 Otręby Paszowe</span>
                <span className="text-[10px] font-mono text-stone-400">
                  {branPct}% •{' '}
                  <strong className="text-amber-300">£{state.branPricePerKg.toFixed(2)}/kg</strong>
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-stone-100">
                {state.branStockKg.toLocaleString('pl-PL')} / {state.branCapacityKg.toLocaleString('pl-PL')} kg
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-orange-400" style={{ width: `${branPct}%` }} />
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY SPRZEDAŻY */}
          {(() => {
            const salesContracts = buildingId
              ? getIncomingSalesContracts(buildingId, allWorldBuildings, buildingsState)
              : [];
            return (
              <div className="bg-stone-900/90 rounded-xl p-2.5 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    🤝 Zawarte Kontrakty Sprzedaży
                  </h4>
                  <span className="text-[10px] font-mono text-stone-400">
                    Aktywne: <strong className="text-emerald-300">{salesContracts.length}</strong>
                  </span>
                </div>
                {salesContracts.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic">
                    Brak aktywnych kontraktów sprzedaży. Odbiorcy (piekarnie, fermy) kontraktują produkty ze swoich kart.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {salesContracts.map((sc) => (
                      <div
                        key={sc.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[11px]"
                      >
                        <div className="text-emerald-200 font-semibold">
                          ✓ <span className="text-white font-bold">{sc.productLabel}</span> →{' '}
                          <span
                            className={
                              sc.isOurBuyer
                                ? 'text-sky-300 font-bold'
                                : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                            }
                          >
                            {sc.buyerLabel}
                          </span>{' '}
                          •{' '}
                          <span className="font-mono font-bold text-yellow-300">
                            {sc.monthlyQtyLabel}
                          </span>{' '}
                          • {sc.contractLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
