import React, { useState } from 'react';
import type { BuildingState, HorseFeedSupplyOrder } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from './industryContracts';
import { loadGameParameters } from '../admin/gameParameters';

interface HorseFeedStoragePanelProps {
  buildingId?: string;
  ownedHorsesCount: number;
  horseFeedStockKg: number;
  horseFeedOrder?: HorseFeedSupplyOrder;
  horseFeedInterventionBuyEnabled?: boolean;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const HORSE_FEED_CAP_KG = 10000;

export const HorseFeedStoragePanel: React.FC<HorseFeedStoragePanelProps> = ({
  buildingId,
  ownedHorsesCount,
  horseFeedStockKg,
  horseFeedOrder,
  horseFeedInterventionBuyEnabled,
  allWorldBuildings,
  buildingsState,
  onSpendGold,
  onUpdateState,
}) => {
  const params = loadGameParameters();
  const dailyNeedKg = Number((ownedHorsesCount * (params.horseDailyFeedKg || 10)).toFixed(1));
  const monthlyNeedKg = Math.round(dailyNeedKg * 30);

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
    (b) => (b.typeId === 'wheat_farm' || b.typeId === 'mill') && b.id !== buildingId
  );
  const suppliers = [shipSupplier, ...localProducers];

  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    horseFeedOrder?.supplierId || shipSupplier.id
  );
  const [reserveKg, setReserveKg] = useState<number>(Math.max(100, monthlyNeedKg || 300));
  const [monthlyKg, setMonthlyKg] = useState<number>(
    horseFeedOrder?.monthlyKg || Math.max(300, monthlyNeedKg)
  );
  const [contractType, setContractType] = useState<ContractType>(
    horseFeedOrder?.contractType || 'pay_as_you_go'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSupplierId = suppliers.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;

  const currentFarmCap = buildingId ? buildingsState[buildingId]?.farmCapitalism : undefined;
  const currentCropKey = currentFarmCap?.cropType || 'pszenica';
  const ownSiloAvailKg = currentFarmCap
    ? (currentFarmCap.grainStockKg?.[currentCropKey] ?? currentFarmCap.wheatStockKg ?? 0)
    : 0;
  const meta = getContractMeta(contractType);
  const isShip = activeSupplierId.startsWith('trade_ship');
  const unitPricePer100 = isShip ? 11 : 10;
  const monthlyCost = Number(
    ((monthlyKg / 100) * unitPricePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
  );
  const pct = Math.min(100, Math.round((horseFeedStockKg / HORSE_FEED_CAP_KG) * 100));

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTransferReserve = () => {
    if (!currentFarmCap) return;
    const freeSpace = Math.max(0, HORSE_FEED_CAP_KG - horseFeedStockKg);
    const transferKg = Math.min(reserveKg, ownSiloAvailKg, freeSpace);
    if (transferKg <= 0) {
      notify('⚠️ Brak wystarczającego zapasu w spichlerzu lub miejsca w magazynie paszy.');
      return;
    }
    const nextCropStock = Math.max(0, ownSiloAvailKg - transferKg);
    onUpdateState({
      horseFeedStockKg: horseFeedStockKg + transferKg,
      farmCapitalism: {
        ...currentFarmCap,
        grainStockKg: {
          ...currentFarmCap.grainStockKg,
          [currentCropKey]: nextCropStock,
        },
        wheatStockKg: nextCropStock,
      },
    });
    notify(`🔒 Założono rezerwę ${transferKg} kg paszy z własnego spichlerza (bez kontraktu).`);
  };

  const handleSaveContract = () => {
    onUpdateState({
      horseFeedOrder: {
        supplierId: activeSupplierId,
        monthlyKg: Math.max(100, monthlyKg),
        contractType,
        monthsRemaining: meta.durationMonths,
      },
    });
    notify(`📜 Zapisano kontrakt na paszę dla koni (${monthlyKg} kg/msc, ${meta.label}).`);
  };

  const handleQuickBuy = () => {
    const qty = Math.min(Math.max(100, monthlyNeedKg || 300), HORSE_FEED_CAP_KG - horseFeedStockKg);
    if (qty <= 0) return;
    const cost = Number(((qty / 100) * 11).toFixed(2));
    onSpendGold?.(cost);
    onUpdateState({ horseFeedStockKg: horseFeedStockKg + qty });
    notify(`🌾 Zakupiono ${qty} kg paszy dla koni za £${cost.toFixed(2)}.`);
  };

  const activeMeta = horseFeedOrder ? getContractMeta(horseFeedOrder.contractType) : null;
  const activeSup = horseFeedOrder
    ? suppliers.find((s) => s.id === horseFeedOrder.supplierId)
    : undefined;
  const activeIsShip = Boolean(horseFeedOrder?.supplierId.startsWith('trade_ship'));
  const activeOwner = horseFeedOrder
    ? buildingsState[horseFeedOrder.supplierId]?.ownerName || activeSup?.playerName
    : undefined;
  const activeIsOurs = !activeIsShip && (!activeOwner || activeOwner === 'Gracz');
  const activePenalty =
    horseFeedOrder && activeMeta && activeMeta.durationMonths > 0
      ? computeSupplyContractPenalty(
          horseFeedOrder.monthlyKg,
          10,
          horseFeedOrder.contractType,
          horseFeedOrder.monthsRemaining
        )
      : 0;

  return (
    <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
          🌾 Magazyn i Kontrakt Paszy dla Koni Roboczych
        </span>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-amber-200">
            Zapotrzebowanie:{' '}
            <strong className="text-yellow-300">{monthlyNeedKg.toLocaleString('pl-PL')} kg/msc</strong>
          </span>
          <span className={horseFeedStockKg > 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
            {horseFeedStockKg.toLocaleString('pl-PL')} / {HORSE_FEED_CAP_KG.toLocaleString('pl-PL')} kg ({pct}%)
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {ownedHorsesCount > 0 && horseFeedStockKg <= 0 && !horseFeedOrder && (
        <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] px-3 py-1.5 rounded-xl font-semibold flex flex-wrap items-center justify-between gap-2">
          <span>⚠️ Posiadasz konie robocze — wymagana jest rezerwa paszy lub aktywny kontrakt na paszę!</span>
          <button
            type="button"
            onClick={handleQuickBuy}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] cursor-pointer"
          >
            🛒 Dokup teraz {Math.max(100, monthlyNeedKg || 300)} kg
          </button>
        </div>
      )}

      {feedback && (
        <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl">
          {feedback}
        </div>
      )}

      {isWheatFarm && (
        <div className="bg-stone-900/80 border border-sky-500/40 rounded-xl p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-sky-300 uppercase tracking-wider">
              🔒 Rezerwa paszy z własnego spichlerza (bez kontraktu)
            </span>
            <span className="font-mono text-stone-300">
              W spichlerzu: <strong className="text-amber-300">{ownSiloAvailKg.toLocaleString('pl-PL')} kg</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setReserveKg((v) => Math.max(100, v - 1000))}
              className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-200 cursor-pointer"
            >
              --1t
            </button>
            <button
              type="button"
              onClick={() => setReserveKg((v) => Math.max(100, v - 100))}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
            >
              -100
            </button>
            <span className="flex-1 text-center font-mono text-[11px] font-bold text-sky-300">
              {reserveKg.toLocaleString('pl-PL')} kg
            </span>
            <button
              type="button"
              onClick={() => setReserveKg((v) => v + 100)}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => setReserveKg((v) => v + 1000)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
            >
              ++1t
            </button>
            <button
              type="button"
              onClick={handleTransferReserve}
              className="py-1 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold cursor-pointer"
            >
              🔒 Odłóż do rezerwy ({Math.min(reserveKg, ownSiloAvailKg)} kg)
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <div className="space-y-2 bg-stone-900/80 border border-stone-800 rounded-xl p-2.5">
          <button
            type="button"
            onClick={() => setIsOrderOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-amber-950/55 hover:bg-amber-900/65 border border-amber-500/50 text-left text-[11px] font-bold uppercase tracking-wider text-amber-200 cursor-pointer transition-colors"
          >
            <span>🛒 Zamów paszę / Nowy kontrakt</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-stone-950 border border-stone-700 text-stone-300">
              {isOrderOpen ? '▲' : '▼'}
            </span>
          </button>
          {isOrderOpen && (
          <>
          <select
            value={activeSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
          >
            {suppliers.map((s) =>
              s.typeId === 'trade_ship' ? (
                <option key={s.id} value={s.id}>
                  🚢 Statek Handlowy (£11/100kg)
                </option>
              ) : (
                <option key={s.id} value={s.id}>
                  {formatSupplierOrderLabel(s, buildingsState, allWorldBuildings)}
                </option>
              )
            )}
          </select>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setMonthlyKg((v) => Math.max(100, v - 1000))}
              className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-200 cursor-pointer"
            >
              --1t
            </button>
            <button
              type="button"
              onClick={() => setMonthlyKg((v) => Math.max(100, v - 100))}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
            >
              -100
            </button>
            <span className="flex-1 text-center font-mono text-[11px] font-bold text-yellow-300">
              {monthlyKg.toLocaleString('pl-PL')} kg/msc
            </span>
            <button
              type="button"
              onClick={() => setMonthlyKg((v) => v + 100)}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-stone-200 cursor-pointer"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => setMonthlyKg((v) => v + 1000)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
            >
              ++1t
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              className="bg-stone-950 border border-amber-500/40 rounded-lg px-2 py-1 text-[11px] text-amber-200 font-semibold cursor-pointer"
            >
              {CONTRACT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.discountPercent > 0 ? `-${opt.discountPercent}%` : '0%'})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveContract}
              className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold cursor-pointer"
            >
              📜 Zapisz (£{monthlyCost}/msc)
            </button>
          </div>

          <label className="flex items-center gap-2 bg-stone-950/70 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[10px] text-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={!!horseFeedInterventionBuyEnabled}
              onChange={(e) => onUpdateState({ horseFeedInterventionBuyEnabled: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
            <span className="font-semibold">🛟 Zakup interwencyjny ze statku (+10% do ceny statku)</span>
            <span
              title="Gdy dostawca nie dostarczy pełnej ilości paszy lub w magazynie brakuje paszy dla posiadanych koni, brakująca część zostanie dokupiona ze Statku Handlowego po cenie statku + 10% (£12.10/100kg)."
              className="text-stone-400 hover:text-amber-300 cursor-help ml-auto"
            >
              ℹ
            </span>
          </label>
          </>
          )}
        </div>

        <div className="bg-stone-900/80 border border-emerald-500/30 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              📜 Kontrakt na Paszę dla Koni
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              Aktywne: <strong className="text-emerald-300">{horseFeedOrder ? 1 : 0}</strong>
            </span>
          </div>
          {!horseFeedOrder || !activeMeta ? (
            <p className="text-[11px] text-stone-400 italic">Brak zawartego kontraktu na paszę dla koni.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]">
              <div className="text-emerald-200 font-semibold">
                ✓ <span className="text-white font-bold">Pasza dla koni</span> •{' '}
                <span
                  className={
                    activeIsOurs
                      ? 'text-sky-300 font-bold'
                      : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                  }
                >
                  {activeIsShip
                    ? '🚢 Statek Handlowy'
                    : activeSup
                    ? formatSupplierOrderLabel(activeSup, buildingsState, allWorldBuildings)
                    : 'Dostawca'}
                </span>{' '}
                •{' '}
                <span className="font-mono font-bold text-yellow-300">
                  {horseFeedOrder.monthlyKg.toLocaleString('pl-PL')} kg/msc
                </span>{' '}
                • {activeMeta.label}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activePenalty > 0) onSpendGold?.(activePenalty);
                  onUpdateState({ horseFeedOrder: undefined });
                  notify('✕ Usunięto kontrakt na paszę dla koni.');
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
              >
                ✕{activePenalty > 0 ? ` (£${activePenalty})` : ''}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
