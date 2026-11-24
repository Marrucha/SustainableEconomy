import React, { useState } from 'react';
import type { BuildingState, HorseFeedSupplyOrder } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from './industryContracts';

interface HorseStrawStoragePanelProps {
  buildingId?: string;
  ownedHorsesCount: number;
  horseStrawStockKg: number;
  horseStrawOrder?: HorseFeedSupplyOrder;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const HORSE_STRAW_CAP_KG = 10000;
const HORSE_DAILY_STRAW_KG = 15;

export const HorseStrawStoragePanel: React.FC<HorseStrawStoragePanelProps> = ({
  buildingId,
  ownedHorsesCount,
  horseStrawStockKg,
  horseStrawOrder,
  allWorldBuildings,
  buildingsState,
  onSpendGold,
  onUpdateState,
}) => {
  const dailyNeedKg = ownedHorsesCount * HORSE_DAILY_STRAW_KG;
  const monthlyNeedKg = dailyNeedKg * 30;

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

  const currentBuilding = buildingId
    ? allWorldBuildings.find((b) => b.id === buildingId)
    : undefined;
  const isWheatFarm = currentBuilding?.typeId === 'wheat_farm';

  const localProducers = allWorldBuildings.filter(
    (b) => b.typeId === 'wheat_farm' && b.id !== buildingId
  );
  const suppliers = [shipSupplier, ...localProducers];

  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    horseStrawOrder?.supplierId || shipSupplier.id
  );
  const [reserveKg, setReserveKg] = useState<number>(Math.max(100, monthlyNeedKg || 450));
  const [monthlyKg, setMonthlyKg] = useState<number>(
    horseStrawOrder?.monthlyKg || Math.max(450, monthlyNeedKg)
  );
  const [contractType, setContractType] = useState<ContractType>(
    horseStrawOrder?.contractType || 'pay_as_you_go'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSupplierId = suppliers.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;

  const currentFarmCap = buildingId ? buildingsState[buildingId]?.farmCapitalism : undefined;
  const ownStrawAvailKg = currentFarmCap?.strawStockKg ?? 0;
  const meta = getContractMeta(contractType);
  const isShip = activeSupplierId.startsWith('trade_ship');
  const unitPricePer100 = isShip ? 6.6 : 6;
  const monthlyCost = Number(
    ((monthlyKg / 100) * unitPricePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
  );
  const pct = Math.min(100, Math.round((horseStrawStockKg / HORSE_STRAW_CAP_KG) * 100));

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTransferReserve = () => {
    if (!currentFarmCap) return;
    const freeSpace = Math.max(0, HORSE_STRAW_CAP_KG - horseStrawStockKg);
    const transferKg = Math.min(reserveKg, ownStrawAvailKg, freeSpace);
    if (transferKg <= 0) {
      notify('⚠️ Brak wystarczającego zapasu słomy lub miejsca w magazynie ściółki.');
      return;
    }
    onUpdateState({
      horseStrawStockKg: horseStrawStockKg + transferKg,
      farmCapitalism: {
        ...currentFarmCap,
        strawStockKg: Math.max(0, ownStrawAvailKg - transferKg),
      },
    });
    notify(`🔒 Odłożono ${transferKg} kg ściółki z własnego stogu (bez kontraktu).`);
  };

  const handleSaveContract = () => {
    onUpdateState({
      horseStrawOrder: {
        supplierId: activeSupplierId,
        monthlyKg: Math.max(100, monthlyKg),
        contractType,
        monthsRemaining: meta.durationMonths,
      },
    });
    notify(`📜 Zapisano kontrakt na ściółkę dla koni (${monthlyKg} kg/msc, ${meta.label}).`);
  };

  const handleQuickBuy = () => {
    const qty = Math.min(Math.max(100, monthlyNeedKg || 450), HORSE_STRAW_CAP_KG - horseStrawStockKg);
    if (qty <= 0) return;
    const cost = Number(((qty / 100) * 6.6).toFixed(2));
    onSpendGold?.(cost);
    onUpdateState({ horseStrawStockKg: horseStrawStockKg + qty });
    notify(`🟨 Zakupiono ${qty} kg ściółki dla koni za £${cost.toFixed(2)}.`);
  };

  const activeMeta = horseStrawOrder ? getContractMeta(horseStrawOrder.contractType) : null;

  return (
    <div className="bg-stone-950/90 border border-yellow-600/35 rounded-xl p-3 space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-yellow-200 flex items-center gap-1.5">
            <span>🟨</span> Magazyn Ściółki dla Koni Roboczych
          </h4>
          <p className="text-[11px] text-stone-400">
            Zapotrzebowanie: <strong className="text-yellow-300">{dailyNeedKg} kg/dzień</strong> (~
            {monthlyNeedKg} kg/msc • {HORSE_DAILY_STRAW_KG} kg/koń) · zużywana bez produkcji obornika
          </p>
        </div>
        <div className="text-right font-mono">
          <span
            className={`font-bold ${
              horseStrawStockKg <= 0 && ownedHorsesCount > 0 ? 'text-rose-400' : 'text-emerald-300'
            }`}
          >
            {horseStrawStockKg.toLocaleString('pl-PL')} / {HORSE_STRAW_CAP_KG.toLocaleString('pl-PL')} kg
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
        <div
          className={`h-full transition-all ${
            horseStrawStockKg <= 0 && ownedHorsesCount > 0 ? 'bg-rose-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isWheatFarm && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/35 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-[11px]">
          <div className="text-emerald-200">
            <span className="font-bold">🔒 Rezerwa ściółki z własnego stogu (bez kontraktu)</span>
            <span className="text-stone-400 ml-2 font-mono">W stogu: {ownStrawAvailKg} kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={50}
              max={10000}
              step={50}
              value={reserveKg}
              onChange={(e) => setReserveKg(Math.max(50, Number(e.target.value) || 50))}
              className="w-20 bg-stone-950 border border-stone-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-yellow-200"
            />
            <button
              type="button"
              onClick={handleTransferReserve}
              disabled={ownStrawAvailKg <= 0 || horseStrawStockKg >= HORSE_STRAW_CAP_KG}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 border border-emerald-500/60 text-emerald-200 text-[11px] font-bold cursor-pointer"
            >
              🔒 Odłóż do rezerwy ({Math.min(reserveKg, ownStrawAvailKg)} kg)
            </button>
          </div>
        </div>
      )}

      {horseStrawOrder && activeMeta && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/30 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-[11px]">
          <span className="text-emerald-200">
            ✓ Kontrakt: <strong>{horseStrawOrder.monthlyKg} kg/msc</strong> • {activeMeta.label}
            {activeMeta.durationMonths > 0 ? ` (${horseStrawOrder.monthsRemaining} msc)` : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              const penalty = computeSupplyContractPenalty(
                horseStrawOrder.monthlyKg,
                6,
                horseStrawOrder.contractType,
                horseStrawOrder.monthsRemaining
              );
              if (penalty > 0) onSpendGold?.(penalty);
              onUpdateState({ horseStrawOrder: undefined });
              notify('Zerwano kontrakt na ściółkę dla koni.');
            }}
            className="text-rose-300 hover:text-rose-200 font-bold cursor-pointer"
          >
            ✕ Zerwij
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleQuickBuy}
          disabled={horseStrawStockKg >= HORSE_STRAW_CAP_KG}
          className="px-2.5 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/35 disabled:opacity-40 border border-yellow-500/50 text-yellow-200 text-[11px] font-bold cursor-pointer"
        >
          🟨 Kup doraźnie ze statku
        </button>
        <button
          type="button"
          onClick={() => setIsOrderOpen((v) => !v)}
          className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/50 text-sky-200 text-[11px] font-bold cursor-pointer"
        >
          {isOrderOpen ? '▲ Ukryj kontrakt' : '📜 Ustaw stały kontrakt na ściółkę'}
        </button>
      </div>

      {isOrderOpen && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 space-y-2 text-[11px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={activeSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-stone-950 border border-stone-700 rounded px-2 py-1 text-stone-200 cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id.startsWith('trade_ship')
                    ? '🚢 Statek Handlowy (£6.60 / 100 kg)'
                    : `🌾 ${formatSupplierOrderLabel(s, buildingsState, allWorldBuildings)} (£6 / 100 kg)`}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={100}
              max={5000}
              step={50}
              value={monthlyKg}
              onChange={(e) => setMonthlyKg(Math.max(100, Number(e.target.value) || 100))}
              className="bg-stone-950 border border-stone-700 rounded px-2 py-1 text-yellow-200 font-mono"
            />
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              className="bg-stone-950 border border-stone-700 rounded px-2 py-1 text-stone-200 cursor-pointer"
            >
              {CONTRACT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-mono">Koszt miesięczny: £{monthlyCost.toFixed(2)}</span>
            <button
              type="button"
              onClick={handleSaveContract}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold cursor-pointer"
            >
              ✓ Zapisz kontrakt
            </button>
          </div>
        </div>
      )}

      {feedback && <p className="text-[11px] font-mono text-emerald-300">{feedback}</p>}
    </div>
  );
};
