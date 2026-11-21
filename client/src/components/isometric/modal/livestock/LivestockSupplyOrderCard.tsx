import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { CROPS_CONFIG } from '../farmGridTypes';
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
  activeOrders?: LivestockSupplyContract[];
  onSpendGold?: (amount: number) => void;
  onSaveOrder: (order: LivestockSupplyContract) => void;
  onCancelOrder: (supplierId?: string) => void;
}

export const LivestockSupplyOrderCard: React.FC<LivestockSupplyOrderCardProps> = ({
  kind,
  producers,
  buildingsState,
  activeOrder,
  activeOrders,
  onSpendGold,
  onSaveOrder,
  onCancelOrder,
}) => {
  const ordersList: LivestockSupplyContract[] = Array.isArray(activeOrders)
    ? activeOrders
    : activeOrder
    ? [activeOrder]
    : [];

  const [selectedProducerId, setSelectedProducerId] = useState<string>(
    ordersList[0]?.supplierId || producers[0]?.id || ''
  );
  const [qtyKg, setQtyKg] = useState<number>(ordersList[0]?.monthlyQuantityKg || 200);
  const [contractType, setContractType] = useState<ContractType>(
    ordersList[0]?.contractType || 'pay_as_you_go'
  );

  const validProducerId = producers.some((p) => p.id === selectedProducerId)
    ? selectedProducerId
    : (producers[0]?.id || '');

  const currentSupplierOrder = ordersList.find((o) => o.supplierId === validProducerId);

  const selectedProducer = producers.find((p) => p.id === validProducerId);
  const meta = getContractMeta(contractType);
  const basePricePer100Kg =
    selectedProducer?.typeId === 'trade_ship'
      ? kind === 'feed'
        ? 11
        : 6.6
      : kind === 'feed'
      ? selectedProducer?.typeId === 'mill'
        ? Number(((buildingsState[validProducerId]?.millState?.branPricePerKg ?? 0.45) * 100).toFixed(2))
        : 10
      : 6;
  const monthlyPrice = Number(
    ((qtyKg / 100) * basePricePer100Kg * (1 - meta.discountPercent / 100)).toFixed(2)
  );

  const activeMeta = currentSupplierOrder ? getContractMeta(currentSupplierOrder.contractType) : null;
  const isLockedTerm = Boolean(
    currentSupplierOrder &&
      activeMeta &&
      activeMeta.durationMonths > 0 &&
      currentSupplierOrder.monthsRemaining > 0
  );
  const breakPenalty = currentSupplierOrder
    ? computeSupplyContractPenalty(
        currentSupplierOrder.monthlyQuantityKg,
        basePricePer100Kg,
        currentSupplierOrder.contractType,
        currentSupplierOrder.monthsRemaining
      )
    : 0;

  const isReducingLocked = Boolean(
    isLockedTerm &&
      currentSupplierOrder &&
      (qtyKg < currentSupplierOrder.monthlyQuantityKg || contractType !== currentSupplierOrder.contractType)
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
            if (p.typeId === 'trade_ship') {
              return (
                <option key={p.id} value={p.id}>
                  🚢 Port Londyn • Statek Handlowy • {kind === 'feed' ? 'Pasza (Import 110%)' : 'Słoma (Import 110%)'}
                </option>
              );
            }
            if (p.typeId === 'mill') {
              const branAvail = buildingsState[p.id]?.millState?.branStockKg ?? 0;
              return (
                <option key={p.id} value={p.id}>
                  🥣 {formatSupplierOrderLabel(p, buildingsState, producers)} • Otręby Paszowe ({branAvail} kg)
                </option>
              );
            }
            const cap = buildingsState[p.id]?.farmCapitalism;
            const cropKey = cap?.cropType || 'pszenica';
            const productName =
              kind === 'straw' ? 'Słoma / Ściółka' : (CROPS_CONFIG[cropKey]?.name || 'Pszenica Złocista');
            const totalGrain = cap?.grainStockKg
              ? Object.values(cap.grainStockKg).reduce((s, v) => s + v, 0)
              : (cap?.wheatStockKg ?? 0);
            const avail = kind === 'feed' ? totalGrain : (cap?.strawStockKg ?? 0);
            return (
              <option key={p.id} value={p.id}>
                🌾 {formatSupplierOrderLabel(p, buildingsState, producers)} • {productName} ({avail} kg)
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
              isLockedTerm && !isReducingLocked && currentSupplierOrder
                ? currentSupplierOrder.monthsRemaining
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

      {ordersList.length > 0 && (
        <div className="space-y-1 pt-1.5 border-t border-stone-800/80">
          <div className="text-[10px] font-mono text-stone-400">
            Aktywne kontrakty ({ordersList.length}):
          </div>
          {ordersList.map((ord) => {
            const ordMeta = getContractMeta(ord.contractType);
            const supObj = producers.find((p) => p.id === ord.supplierId);
            const ordBasePer100 =
              kind === 'feed'
                ? supObj?.typeId === 'mill'
                  ? Number(((buildingsState[ord.supplierId]?.millState?.branPricePerKg ?? 0.45) * 100).toFixed(2))
                  : 10
                : 6;
            const ordLocked = ordMeta.durationMonths > 0 && ord.monthsRemaining > 0;
            const ordPenalty = computeSupplyContractPenalty(
              ord.monthlyQuantityKg,
              ordBasePer100,
              ord.contractType,
              ord.monthsRemaining
            );
            const isShip = ord.supplierId.startsWith('trade_ship');
            const owner = buildingsState[ord.supplierId]?.ownerName || supObj?.playerName;
            const isOurs = !isShip && (!owner || owner === 'Gracz');
            const farmCropKey = buildingsState[ord.supplierId]?.farmCapitalism?.cropType || 'pszenica';
            const productLabel =
              kind === 'straw'
                ? 'Słoma / Ściółka'
                : isShip
                ? 'Pasza (Import)'
                : supObj?.typeId === 'mill'
                ? 'Otręby Paszowe'
                : CROPS_CONFIG[farmCropKey]?.name || 'Pszenica Złocista';
            return (
              <div
                key={ord.supplierId}
                className="bg-emerald-950/50 border border-emerald-500/40 rounded-lg p-1.5 flex items-center justify-between gap-2"
              >
                <span className="text-[10px] font-mono text-emerald-200 truncate">
                  ✓ <span className="text-white font-bold">{productLabel}</span> •{' '}
                  <span
                    className={
                      isOurs
                        ? 'text-sky-300 font-bold'
                        : 'text-blue-200 bg-blue-950/80 px-1 py-0.5 rounded font-bold'
                    }
                  >
                    {isShip
                      ? '🚢 Statek Handlowy'
                      : supObj
                      ? formatSupplierOrderLabel(supObj, buildingsState, producers)
                      : 'Dostawca'}
                  </span>{' '}
                  •{' '}
                  <span className="font-bold text-yellow-300">
                    {ord.monthlyQuantityKg} kg/msc
                  </span>{' '}
                  • {ordMeta.label}
                  {ordMeta.durationMonths > 0
                    ? ` (${ord.monthsRemaining}/${ordMeta.durationMonths} msc, -${ordMeta.discountPercent}%)`
                    : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (ordLocked && ordPenalty > 0) {
                      onSpendGold?.(ordPenalty);
                    }
                    onCancelOrder(ord.supplierId);
                  }}
                  title={ordLocked ? `Zerwij kontrakt z karą (-£${ordPenalty})` : 'Usuń kontrakt'}
                  className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-800 border border-rose-500/40 text-[10px] text-rose-200 font-bold cursor-pointer shrink-0"
                >
                  ✕{ordLocked && ordPenalty > 0 ? ` -£${ordPenalty}` : ''}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
