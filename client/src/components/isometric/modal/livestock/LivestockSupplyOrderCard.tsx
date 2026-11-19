import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from '../industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from '../industryContracts';
import type { LivestockSupplyContract } from './livestockTypes';

interface LivestockSupplyOrderCardProps {
  kind: 'feed' | 'straw';
  producers: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  activeOrder?: LivestockSupplyContract;
  onSpendGold?: (amount: number) => void;
  onSaveOrder: (order: LivestockSupplyContract) => void;
  onCancelOrder: () => void;
}

export const LivestockSupplyOrderCard: React.FC<LivestockSupplyOrderCardProps> = ({
  kind,
  producers,
  buildingsState,
  activeOrder,
  onSpendGold,
  onSaveOrder,
  onCancelOrder,
}) => {
  const [selectedProducerId, setSelectedProducerId] = useState<string>(
    activeOrder?.supplierId || producers[0]?.id || ''
  );
  const [qtyKg, setQtyKg] = useState<number>(activeOrder?.monthlyQuantityKg || 200);
  const [contractType, setContractType] = useState<ContractType>(
    activeOrder?.contractType || 'pay_as_you_go'
  );

  const validProducerId = producers.some((p) => p.id === selectedProducerId)
    ? selectedProducerId
    : (producers[0]?.id || '');

  const meta = getContractMeta(contractType);
  const basePricePer100Kg = kind === 'feed' ? 10 : 6;
  const monthlyPrice = Number(
    ((qtyKg / 100) * basePricePer100Kg * (1 - meta.discountPercent / 100)).toFixed(2)
  );

  const activeMeta = activeOrder ? getContractMeta(activeOrder.contractType) : null;
  const isLockedTerm = Boolean(
    activeOrder && activeMeta && activeMeta.durationMonths > 0 && activeOrder.monthsRemaining > 0
  );
  const breakPenalty = activeOrder
    ? computeSupplyContractPenalty(
        activeOrder.monthlyQuantityKg,
        basePricePer100Kg,
        activeOrder.contractType,
        activeOrder.monthsRemaining
      )
    : 0;

  const isReducingLocked = Boolean(
    isLockedTerm &&
      activeOrder &&
      (qtyKg < activeOrder.monthlyQuantityKg ||
        contractType !== activeOrder.contractType ||
        validProducerId !== activeOrder.supplierId)
  );

  if (producers.length === 0) {
    return (
      <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-[11px] text-center">
        ⚠️ Brak Farmy Zbożowej na mapie — wybuduj ją, aby zamawiać {kind === 'feed' ? 'paszę' : 'ściółkę'}.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-stone-800/80 text-[11px]">
      <div>
        <label className="text-[10px] text-stone-400 font-mono block mb-1">
          Producent (dostawa 1× w miesiącu):
        </label>
        <select
          value={validProducerId}
          onChange={(e) => setSelectedProducerId(e.target.value)}
          className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-200 cursor-pointer"
        >
          {producers.map((p) => {
            const cap = buildingsState[p.id]?.farmCapitalism;
            const totalGrain = cap?.grainStockKg
              ? Object.values(cap.grainStockKg).reduce((s, v) => s + v, 0)
              : (cap?.wheatStockKg ?? 0);
            const avail = kind === 'feed' ? totalGrain : (cap?.strawStockKg ?? 0);
            return (
              <option key={p.id} value={p.id}>
                🌾 {formatSupplierOrderLabel(p)} (stan: {avail} kg)
              </option>
            );
          })}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQtyKg((q) => Math.max(100, q - 100))}
              className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-mono font-bold cursor-pointer"
              title="Odejmij 100 kg"
            >
              -100
            </button>
            <span className="px-2 py-1 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 font-mono font-bold min-w-[82px] text-center">
              {qtyKg.toLocaleString('pl-PL')} kg/msc
            </span>
            <button
              type="button"
              onClick={() => setQtyKg((q) => q + 100)}
              className="px-2 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-600/50 text-emerald-200 font-mono font-bold cursor-pointer"
              title="Dodaj 100 kg"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => setQtyKg((q) => q + 1000)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 font-mono font-bold cursor-pointer"
              title="Dodaj 1 tonę (1000 kg)"
            >
              ++1t
            </button>
          </div>
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

      {activeOrder && activeMeta && (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-lg p-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-emerald-200">
            ✓ {activeOrder.monthlyQuantityKg} kg/msc • {activeMeta.label}
            {activeMeta.durationMonths > 0
              ? ` (${activeOrder.monthsRemaining}/${activeMeta.durationMonths} msc, -${activeMeta.discountPercent}%)`
              : ' (od kolejnego msc)'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (isLockedTerm && breakPenalty > 0) {
                onSpendGold?.(breakPenalty);
              }
              onCancelOrder();
            }}
            className="text-[10px] text-rose-300 hover:text-rose-200 underline cursor-pointer shrink-0"
          >
            {isLockedTerm ? `Zerwij (-£${breakPenalty})` : 'Anuluj'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (isReducingLocked && breakPenalty > 0) {
            onSpendGold?.(breakPenalty);
          }
          onSaveOrder({
            supplierId: validProducerId,
            monthlyQuantityKg: qtyKg,
            contractType,
            monthsRemaining:
              isLockedTerm && !isReducingLocked && activeOrder
                ? activeOrder.monthsRemaining
                : meta.durationMonths,
          });
        }}
        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
          isReducingLocked
            ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border-rose-500/50'
            : 'bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border-amber-500/50'
        }`}
      >
        {isReducingLocked
          ? `⚠️ Zmień z karą (-£${breakPenalty} • od kolejnego msc)`
          : meta.durationMonths > 0
          ? `📜 Podpisz ${meta.label} (-${meta.discountPercent}% • £${monthlyPrice}/msc)`
          : `📦 Ustaw PAYG (£${monthlyPrice}/msc • od kolejnego msc)`}
      </button>
    </div>
  );
};
