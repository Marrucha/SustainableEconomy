import React, { useState } from 'react';
import {
  GRAIN_SILO_MAX_LEVEL,
  getManureBinCapacityKg,
  getGrainSiloUpgradeCostGbp,
  type FarmCapitalismState,
} from './farmGridTypes';
import type { BuildingState } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from './industryContracts';
import { FarmOfferBars } from './FarmOfferBars';
import { computeFarmYieldSummary } from './farmYieldMath';

interface FarmManureBinCardProps {
  state: FarmCapitalismState;
  attachedFieldsCount?: number;
  manureStock: number;
  livestockFarms: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  activeLivestockId: string;
  selectedFarmManureKg: number;
  onSelectLivestock: (id: string) => void;
  onBuyManure: () => void;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (patch: Partial<FarmCapitalismState>) => void;
  showFeedback: (msg: string) => void;
}

/**
 * Kafelek zasieku obornika naturalnego z wyborem fermy dostawcy i 3 pionowymi słupkami oferty.
 */
export const FarmManureBinCard: React.FC<FarmManureBinCardProps> = ({
  state,
  attachedFieldsCount = 0,
  manureStock,
  livestockFarms,
  buildingsState,
  activeLivestockId,
  selectedFarmManureKg: _selectedFarmManureKg,
  onSelectLivestock,
  onBuyManure: _onBuyManure,
  onSpendGold,
  onUpdateState,
  showFeedback,
}) => {
  const manureLevel = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, state.manureLevel ?? 1));
  const manureCapKg = getManureBinCapacityKg(manureLevel);
  const manureUpgradeCost = getGrainSiloUpgradeCostGbp(manureLevel);
  const manureQuality = Math.min(100, Math.max(0, state.manureQualityPercent ?? 100));
  const manureBrand = state.manureBrandLevel ?? 0;
  const manurePrice = state.manurePricePer100Kg ?? 12;
  const yieldSummary = computeFarmYieldSummary(state, attachedFieldsCount);
  const yearlyManureNeedKg = yieldSummary.manureRequiredKg;
  const monthlyManureNeedKg = yearlyManureNeedKg > 0 ? Math.ceil(yearlyManureNeedKg / 12) : 0;

  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  const [orderQtyKg, setOrderQtyKg] = useState<number>(state.manureOrder?.monthlyQuantityKg || 200);
  const [contractType, setContractType] = useState<ContractType>(
    state.manureOrder?.contractType || 'pay_as_you_go'
  );
  const meta = getContractMeta(contractType);
  const monthlyContractCost = Number(
    ((orderQtyKg / 100) * manurePrice * (1 - meta.discountPercent / 100)).toFixed(2)
  );
  const activeOrder = state.manureOrder;
  const activeMeta = activeOrder ? getContractMeta(activeOrder.contractType) : null;
  const isLockedTerm = Boolean(
    activeOrder && activeMeta && activeMeta.durationMonths > 0 && activeOrder.monthsRemaining > 0
  );
  const breakPenalty = activeOrder
    ? computeSupplyContractPenalty(
        activeOrder.monthlyQuantityKg,
        manurePrice,
        activeOrder.contractType,
        activeOrder.monthsRemaining
      )
    : 0;
  const isReducingLocked = Boolean(
    isLockedTerm &&
      activeOrder &&
      (orderQtyKg < activeOrder.monthlyQuantityKg ||
        contractType !== activeOrder.contractType ||
        activeLivestockId !== activeOrder.supplierId)
  );

  return (
    <div className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/20 border border-amber-800/50 rounded-2xl p-4 flex flex-col justify-between shadow-md">
      <div
        title={`Roczne zapotrzebowanie na nawożenie: ${yearlyManureNeedKg.toLocaleString('pl-PL')} kg/rok`}
        className="absolute top-2.5 right-2.5 bg-stone-950 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg"
      >
        {monthlyManureNeedKg > 0
          ? `${monthlyManureNeedKg.toLocaleString('pl-PL')} kg/msc (${yearlyManureNeedKg.toLocaleString('pl-PL')} kg/rok)`
          : '0 kg/msc (Nawożenie 0%)'}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
            🐂
          </span>
          <div>
            <h4 className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
              <span>Obornik Naturalny</span>
              <span
                title="Produkt naturalny sprowadzany z fermy hodowlanej bydła i owiec. Wzbogaca glebę przed zasiewem."
                className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] inline-flex items-center justify-center cursor-help"
              >
                ?
              </span>
            </h4>
            <span className="text-[10px] text-amber-400/80 block font-mono">
              Przegródka Nawozowa #2
            </span>
          </div>
        </div>

        <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3 my-3 flex gap-3 items-stretch min-h-[144px]">
          <div className="flex-1 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-stone-400 font-mono text-[11px]">Zapas (Poz. {manureLevel}/{GRAIN_SILO_MAX_LEVEL}):</span>
                <span className="font-bold font-mono text-amber-300">
                  {manureStock} kg <span className="text-stone-500 font-normal">/ {manureCapKg / 1000} t</span>
                </span>
              </div>
              <div className="w-full bg-stone-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((manureStock / manureCapKg) * 100))}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono bg-stone-900/70 border border-stone-800 rounded-lg p-2">
              <span>Ferma zwierzęca</span>
              {manureLevel < GRAIN_SILO_MAX_LEVEL ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onSpendGold) onSpendGold(manureUpgradeCost);
                    onUpdateState({ manureLevel: manureLevel + 1 });
                    showFeedback(`🐂 Rozbudowano zasiek obornika do ${(manureLevel + 1) * 10} t za £${manureUpgradeCost}!`);
                  }}
                  className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  ⬆️ +10 t (£{manureUpgradeCost})
                </button>
              ) : (
                <span className="text-emerald-400">Max 40 t</span>
              )}
            </div>
          </div>
          <FarmOfferBars
            qualityPercent={manureQuality}
            brandLevel={manureBrand}
            priceValue={manurePrice}
            priceLabel={`£${manurePrice}`}
            maxPriceForScale={30}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-stone-800/60 space-y-2">
        {livestockFarms.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setIsOrderOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-950/55 hover:bg-amber-900/65 border border-amber-500/50 text-amber-200 font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              <span>🛒 Zamów obornik / Nowy kontrakt</span>
              <span className="text-xs text-stone-300">{isOrderOpen ? '▲' : '▼'}</span>
            </button>
            {isOrderOpen && (
            <>
            <select
              value={activeLivestockId}
              onChange={(e) => onSelectLivestock(e.target.value)}
              className="w-full bg-stone-950 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-100 font-semibold cursor-pointer"
            >
              {livestockFarms.map((farm) => {
                const avail = buildingsState[farm.id]?.livestockState?.storage?.manureKg ?? 0;
                return (
                  <option key={farm.id} value={farm.id}>
                    🐮 {formatSupplierOrderLabel(farm)} (Dostępne: {avail} kg)
                  </option>
                );
              })}
            </select>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOrderQtyKg((v) => Math.max(100, v - 1000))}
                  className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-200 cursor-pointer"
                >
                  --1t
                </button>
                <button
                  type="button"
                  onClick={() => setOrderQtyKg((v) => Math.max(100, v - 100))}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
                >
                  -100
                </button>
                <span className="flex-1 text-center font-mono text-[11px] font-bold text-yellow-300">
                  {orderQtyKg.toLocaleString('pl-PL')} kg/msc
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQtyKg((v) => v + 100)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => setOrderQtyKg((v) => v + 1000)}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
                >
                  ++1t
                </button>
              </div>

              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full bg-stone-950 border border-amber-500/50 rounded-lg px-2 py-1 text-[11px] text-amber-200 font-semibold cursor-pointer"
              >
                {CONTRACT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.badge})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isReducingLocked && breakPenalty > 0 && onSpendGold) {
                  onSpendGold(breakPenalty);
                }
                onUpdateState({
                  manureOrder: {
                    supplierId: activeLivestockId,
                    monthlyQuantityKg: orderQtyKg,
                    contractType,
                    monthsRemaining:
                      isLockedTerm && !isReducingLocked && activeOrder
                        ? activeOrder.monthsRemaining
                        : meta.durationMonths,
                  },
                });
                showFeedback(
                  isReducingLocked
                    ? `Zmieniono kontrakt z karą £${breakPenalty} (nowe warunki od kolejnego miesiąca).`
                    : `📜 Zapisano dostawy obornika (${orderQtyKg} kg/msc, ${meta.label}) od kolejnego miesiąca.`
                );
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isReducingLocked
                  ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border-rose-500/50'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-500/50'
              }`}
            >
              {isReducingLocked
                ? `⚠️ Zmień z karą (-£${breakPenalty} • od kolejnego msc)`
                : meta.durationMonths > 0
                ? `📜 Zakontraktuj (${meta.label} • £${monthlyContractCost}/msc)`
                : `📦 Ustaw PAYG (£${monthlyContractCost}/msc • od kolejnego msc)`}
            </button>
            </>
            )}
          </>
        ) : (
          <div className="w-full py-2 px-3 rounded-xl text-[11px] font-medium bg-stone-900/60 text-stone-400 border border-stone-800 text-center">
            Brak fermy zwierzęcej na mapie — wybuduj ją lub kupuj od innego gracza.
          </div>
        )}
      </div>
    </div>
  );
};
