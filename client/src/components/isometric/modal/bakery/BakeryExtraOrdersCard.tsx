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
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from '../industrySupplyConfig';
import { createDefaultMillState, MILL_PRODUCTS_CONFIG } from '../mill/millTypes';
import {
  BAKERY_PRODUCTS_CONFIG,
  getBakeryFlourOrders,
  type BakeryCapitalismState,
  type BakeryExtraSupplyOrder,
  type BakeryIngredientId,
} from './bakeryTypes';

type UnifiedIngredientId = 'flour' | BakeryIngredientId;

interface BakeryExtraOrdersCardProps {
  state: BakeryCapitalismState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdate: (updates: Partial<BakeryCapitalismState>) => void;
}

const EXTRA_META: Record<
  BakeryIngredientId,
  {
    label: string;
    icon: string;
    basePricePerKg: number;
    monthlyNeedKg: number;
    capKey: keyof BakeryCapitalismState;
    stockKey: keyof BakeryCapitalismState;
  }
> = {
  salt: { label: 'Sól Kamienna', icon: '🧂', basePricePerKg: 0.8, monthlyNeedKg: 60, capKey: 'saltCapacityKg', stockKey: 'saltStockKg' },
  yeast: { label: 'Drożdże Piekarskie', icon: '🧫', basePricePerKg: 1.2, monthlyNeedKg: 45, capKey: 'yeastCapacityKg', stockKey: 'yeastStockKg' },
  butter: { label: 'Masło Świeże', icon: '🧈', basePricePerKg: 2.2, monthlyNeedKg: 90, capKey: 'butterCapacityKg', stockKey: 'butterStockKg' },
  sugar: { label: 'Cukier', icon: '🍬', basePricePerKg: 2.4, monthlyNeedKg: 60, capKey: 'sugarCapacityKg', stockKey: 'sugarStockKg' },
};

export const BakeryExtraOrdersCard: React.FC<BakeryExtraOrdersCardProps> = ({
  state,
  allWorldBuildings,
  buildingsState,
  clock,
  onSpendGold,
  onUpdate,
}) => {
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[state.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;
  const flourDemandKg = (loadGameParameters().bakeryBaseDailyFlourKg ?? 120) * 30;

  const [ingredient, setIngredient] = useState<UnifiedIngredientId>('flour');
  const [monthlyKg, setMonthlyKg] = useState<number>(800);
  const [contractType, setContractType] = useState<ContractType>('pay_as_you_go');
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const getSuppliers = (ing: UnifiedIngredientId): WorldSupplierBuilding[] => {
    const locals = allWorldBuildings.filter((b) => {
      if (ing === 'flour') return b.typeId === 'mill';
      if (ing === 'salt') return b.typeId.startsWith('mine_') && buildingsState[b.id]?.mineDepositType === 'rock_salt';
      if (ing === 'yeast') return b.typeId === 'brewery';
      if (ing === 'butter') return b.typeId === 'dairy';
      return b.typeId === 'sugar_refinery';
    });
    return [shipSupplier, ...locals];
  };

  const suppliers = getSuppliers(ingredient);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(shipSupplier.id);
  const validSupplierId = suppliers.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;

  const flourOrders = getBakeryFlourOrders(state);
  const extraOrders: BakeryExtraSupplyOrder[] = Array.isArray(state.extraOrders)
    ? state.extraOrders
    : [];

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const getMillFlourInfo = (millId: string) => {
    const ms = buildingsState[millId]?.millState || createDefaultMillState();
    const cfg = MILL_PRODUCTS_CONFIG[ms.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;
    return {
      productLabel: cfg.label,
      availKg: ms.flourStockKg ?? 0,
      pricePer100Kg: Math.round((ms.flourPricePerKg || cfg.defaultPricePerKg) * 100),
    };
  };

  const handleSave = () => {
    const meta = getContractMeta(contractType);
    const totalMonths = clock ? clock.date.year * 12 + clock.date.month : 1880 * 12 + 4;

    if (ingredient === 'flour') {
      const nextOrder = {
        supplierId: validSupplierId,
        monthlyKg: Math.max(100, monthlyKg),
        contractType,
        monthsRemaining: meta.durationMonths,
        startTotalMonths: totalMonths,
      };
      onUpdate({
        flourOrders: [...flourOrders.filter((o) => o.supplierId !== validSupplierId), nextOrder],
      });
      notify(`✓ Zapisano kontrakt: ${productCfg.requiredFlourLabel} (${monthlyKg} kg/msc).`);
      return;
    }

    const nextExtra: BakeryExtraSupplyOrder = {
      ingredient,
      supplierId: validSupplierId,
      monthlyKg: Math.max(10, monthlyKg),
      contractType,
      monthsRemaining: meta.durationMonths,
      startTotalMonths: totalMonths,
    };
    onUpdate({
      extraOrders: [
        ...extraOrders.filter(
          (o) => !(o.ingredient === ingredient && o.supplierId === validSupplierId)
        ),
        nextExtra,
      ],
    });
    notify(`✓ Zapisano kontrakt: ${EXTRA_META[ingredient].label} (${monthlyKg} kg/msc).`);
  };

  const handleRemoveFlour = (supplierId: string) => {
    const target = flourOrders.find((o) => o.supplierId === supplierId);
    if (!target) return;
    const { pricePer100Kg } = getMillFlourInfo(supplierId);
    const penalty = computeSupplyContractPenalty(
      target.monthlyKg,
      pricePer100Kg,
      target.contractType,
      target.monthsRemaining
    );
    if (penalty > 0 && onSpendGold) onSpendGold(penalty);
    onUpdate({
      flourOrders: flourOrders.filter((o) => o.supplierId !== supplierId),
      totalExpenses: state.totalExpenses + penalty,
    });
    notify(penalty > 0 ? `⚠️ Zerwano kontrakt — kara £${penalty}.` : '✕ Usunięto kontrakt.');
  };

  const handleRemoveExtra = (ing: BakeryIngredientId, supplierId: string) => {
    const target = extraOrders.find((o) => o.ingredient === ing && o.supplierId === supplierId);
    if (!target) return;
    const pricePer100 = Math.round(EXTRA_META[ing].basePricePerKg * 100);
    const penalty = computeSupplyContractPenalty(
      target.monthlyKg,
      pricePer100,
      target.contractType,
      target.monthsRemaining
    );
    if (penalty > 0 && onSpendGold) onSpendGold(penalty);
    onUpdate({
      extraOrders: extraOrders.filter(
        (o) => !(o.ingredient === ing && o.supplierId === supplierId)
      ),
      totalExpenses: state.totalExpenses + penalty,
    });
    notify(penalty > 0 ? `⚠️ Zerwano kontrakt — kara £${penalty}.` : '✕ Usunięto kontrakt.');
  };

  const totalActiveCount = flourOrders.length + extraOrders.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
      {/* LEWA KOLUMNA: NA GÓRZE WYMOGI (SUROWCE), NA DOLE FORMATKA ZAMÓWIENIA */}
      <div className="space-y-2">
        {/* Stany magazynów surowców z zapotrzebowaniem miesięcznym */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="col-span-2 bg-stone-900/90 rounded-xl p-2 border border-stone-800 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-white">
                🌾 {productCfg.requiredFlourLabel}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold shrink-0">
                {flourDemandKg.toLocaleString('pl-PL')} kg/msc
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-stone-100">
              <span className={state.flourStockKg <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
                {state.flourStockKg.toLocaleString('pl-PL')}
              </span>{' '}
              <span className="text-[10px] text-stone-400">
                / {state.flourCapacityKg.toLocaleString('pl-PL')} kg
              </span>
            </div>
            <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${Math.min(100, Math.round((state.flourStockKg / state.flourCapacityKg) * 100))}%` }}
              />
            </div>
          </div>

          {(Object.keys(EXTRA_META) as BakeryIngredientId[]).map((ingId) => {
            const meta = EXTRA_META[ingId];
            const stock = Number(state[meta.stockKey] ?? 0);
            const cap = Number(state[meta.capKey] ?? 500);
            const pct = Math.min(100, Math.round((stock / Math.max(1, cap)) * 100));
            return (
              <div
                key={ingId}
                className="bg-stone-900/90 rounded-xl p-2 border border-stone-800 space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-white truncate">
                    {meta.icon} {meta.label}
                  </span>
                  <span className="px-1 py-0.5 rounded bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold shrink-0">
                    {meta.monthlyNeedKg} kg/msc
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-stone-100">
                  <span className={stock <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
                    {stock.toLocaleString('pl-PL')}
                  </span>{' '}
                  <span className="text-[9px] text-stone-400">/ {cap} kg</span>
                </div>
                <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                  <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Formatka zamówienia na dole */}
        <div className="bg-stone-900/90 rounded-xl p-2.5 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              🛒 Nowy Kontrakt Zakupu
            </h4>
            {feedback && <span className="text-[10px] text-emerald-300 font-semibold">{feedback}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                Surowiec
              </label>
              <select
                value={ingredient}
                onChange={(e) => {
                  const nextIng = e.target.value as UnifiedIngredientId;
                  setIngredient(nextIng);
                  setMonthlyKg(nextIng === 'flour' ? flourDemandKg : EXTRA_META[nextIng].monthlyNeedKg);
                }}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100 cursor-pointer"
              >
                <option value="flour">🌾 {productCfg.requiredFlourLabel}</option>
                {(Object.keys(EXTRA_META) as BakeryIngredientId[]).map((id) => (
                  <option key={id} value={id}>
                    {EXTRA_META[id].icon} {EXTRA_META[id].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                Dostawca
              </label>
              <select
                value={validSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100 cursor-pointer"
              >
                {suppliers.map((s) => {
                  if (s.typeId === 'trade_ship') {
                    return (
                      <option key={s.id} value={s.id}>
                        🚢 Port Londyn • Statek Handlowy (Import 110%)
                      </option>
                    );
                  }
                  if (s.typeId === 'mill') {
                    const info = getMillFlourInfo(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        ⚙️ {formatSupplierOrderLabel(s, buildingsState, suppliers)} • {info.productLabel} ({info.availKg} kg)
                      </option>
                    );
                  }
                  return (
                    <option key={s.id} value={s.id}>
                      {formatSupplierOrderLabel(s, buildingsState, suppliers)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                Ilość miesięczna
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMonthlyKg((v) => Math.max(10, v - (ingredient === 'flour' ? 100 : 10)))}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 cursor-pointer"
                >
                  -{ingredient === 'flour' ? 100 : 10}
                </button>
                <span className="flex-1 text-center font-mono text-[11px] font-bold text-amber-200 bg-stone-950 border border-stone-800 rounded-lg py-1">
                  {monthlyKg.toLocaleString('pl-PL')} kg/msc
                </span>
                <button
                  type="button"
                  onClick={() => setMonthlyKg((v) => v + (ingredient === 'flour' ? 100 : 10))}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 cursor-pointer"
                >
                  +{ingredient === 'flour' ? 100 : 10}
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

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
          >
            + Dodaj kontrakt zakupu
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
            Aktywne: <strong className="text-emerald-300">{totalActiveCount}</strong>
          </span>
        </div>
        <label className="flex items-center gap-2 bg-stone-950/70 border border-amber-500/30 rounded-lg px-2 py-1 text-[10px] text-amber-200 cursor-pointer">
          <input type="checkbox" checked={!!state.interventionBuyEnabled} onChange={(e) => onUpdate({ interventionBuyEnabled: e.target.checked })} className="accent-amber-500 cursor-pointer" />
          <span className="font-semibold">🛟 Zakup interwencyjny ze statku (+10% do ceny statku)</span>
          <span title="Gdy dostawca nie zrealizuje kontraktu w pełni lub w części w danym miesiącu, brakująca ilość zostanie dokupiona na Statku Handlowym po cenie statku + 10%." className="text-stone-400 hover:text-amber-300 cursor-help ml-auto">ℹ</span>
        </label>
        {totalActiveCount === 0 ? (
          <p className="text-[11px] text-stone-400 italic">
            Brak zawartych kontraktów zakupu. Użyj formularza po lewej, aby dodać dostawcę.
          </p>
        ) : (
          <div className="space-y-1">
            {flourOrders.map((ord) => {
              const ordMeta = getContractMeta(ord.contractType);
              const millObj = allWorldBuildings.find((m) => m.id === ord.supplierId);
              const isShip = ord.supplierId.startsWith('trade_ship');
              const owner = buildingsState[ord.supplierId]?.ownerName || millObj?.playerName;
              const isOurs = !isShip && (!owner || owner === 'Gracz');
              const info = getMillFlourInfo(ord.supplierId);
              const penalty = computeSupplyContractPenalty(
                ord.monthlyKg,
                info.pricePer100Kg,
                ord.contractType,
                ord.monthsRemaining
              );
              return (
                <div
                  key={`flour-${ord.supplierId}`}
                  className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[11px]"
                >
                  <div className="text-emerald-200 font-semibold">
                    ✓ 🌾 <span className="text-white">{productCfg.requiredFlourLabel}</span> •{' '}
                    <span
                      className={
                        isOurs
                          ? 'text-sky-300 font-bold'
                          : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                      }
                    >
                      {isShip
                        ? '🚢 Statek Handlowy'
                        : millObj
                        ? formatSupplierOrderLabel(millObj, buildingsState)
                        : 'Młyn Parowy'}
                    </span>{' '}
                    •{' '}
                    <span className="font-mono font-bold text-yellow-300">
                      {ord.monthlyKg.toLocaleString('pl-PL')} kg/msc
                    </span>{' '}
                    • {ordMeta.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFlour(ord.supplierId)}
                    className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
                  >
                    ✕{penalty > 0 ? ` (£${penalty})` : ''}
                  </button>
                </div>
              );
            })}

            {extraOrders.map((ord) => {
              const ingMeta = EXTRA_META[ord.ingredient];
              const ordMeta = getContractMeta(ord.contractType);
              const supObj = allWorldBuildings.find((b) => b.id === ord.supplierId);
              const isShip = ord.supplierId.startsWith('trade_ship');
              const owner = buildingsState[ord.supplierId]?.ownerName || supObj?.playerName;
              const isOurs = !isShip && (!owner || owner === 'Gracz');
              return (
                <div
                  key={`${ord.ingredient}-${ord.supplierId}`}
                  className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[11px]"
                >
                  <div className="text-emerald-200 font-semibold">
                    ✓ {ingMeta.icon} <span className="text-white">{ingMeta.label}</span> •{' '}
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
                        ? formatSupplierOrderLabel(supObj, buildingsState)
                        : 'Lokalny dostawca'}
                    </span>{' '}
                    •{' '}
                    <span className="font-mono font-bold text-yellow-300">
                      {ord.monthlyKg} kg/msc
                    </span>{' '}
                    • {ordMeta.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(ord.ingredient, ord.supplierId)}
                    className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
