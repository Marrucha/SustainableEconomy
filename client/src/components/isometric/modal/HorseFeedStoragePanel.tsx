import React, { useState } from 'react';
import type { BuildingState, HorseFeedSupplyOrder } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import { getContractMeta, type ContractType } from './industryContracts';
import { loadGameParameters } from '../admin/gameParameters';

interface HorseFeedStoragePanelProps {
  buildingId?: string;
  ownedHorsesCount: number;
  horseFeedStockKg: number;
  horseStrawStockKg?: number;
  horseFeedOrder?: HorseFeedSupplyOrder;
  horseStrawOrder?: HorseFeedSupplyOrder;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const HORSE_STORAGE_CAP_KG = 10000;
const HORSE_DAILY_STRAW_KG = 15;

export const HorseFeedStoragePanel: React.FC<HorseFeedStoragePanelProps> = ({
  buildingId,
  ownedHorsesCount,
  horseFeedStockKg,
  horseStrawStockKg = 0,
  horseFeedOrder,
  horseStrawOrder,
  allWorldBuildings,
  buildingsState,
  onUpdateState,
}) => {
  const params = loadGameParameters();
  const dailyFeedPerHorse = params.horseDailyFeedKg || 10;
  const dailyFeedNeedKg = Number((ownedHorsesCount * dailyFeedPerHorse).toFixed(1));
  const monthlyFeedNeedKg = Math.max(300, Math.round(dailyFeedNeedKg * 30));
  const dailyStrawNeedKg = ownedHorsesCount * HORSE_DAILY_STRAW_KG;
  const monthlyStrawNeedKg = Math.max(450, Math.round(dailyStrawNeedKg * 30));

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

  const localFarms = allWorldBuildings.filter(
    (b) => b.typeId === 'wheat_farm' && b.id !== buildingId
  );
  const suppliers = [shipSupplier, ...localFarms];

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    horseFeedOrder?.supplierId || horseStrawOrder?.supplierId || shipSupplier.id
  );
  const [contractType, setContractType] = useState<ContractType>(
    horseFeedOrder?.contractType || 'pay_as_you_go'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSupplierId = suppliers.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;
  const isShip = activeSupplierId.startsWith('trade_ship');
  const meta = getContractMeta(contractType);

  const feedPricePer100 = isShip ? 11 : 10;
  const strawPricePer100 = isShip ? 6.6 : 6;
  const estMonthlyCost = Number(
    (
      ((monthlyFeedNeedKg / 100) * feedPricePer100 +
        (monthlyStrawNeedKg / 100) * strawPricePer100) *
      (1 - meta.discountPercent / 100)
    ).toFixed(2)
  );

  const feedPct = Math.min(100, Math.round((horseFeedStockKg / HORSE_STORAGE_CAP_KG) * 100));
  const strawPct = Math.min(100, Math.round((horseStrawStockKg / HORSE_STORAGE_CAP_KG) * 100));

  const currentFarmCap = buildingId ? buildingsState[buildingId]?.farmCapitalism : undefined;
  const currentCropKey = currentFarmCap?.cropType || 'pszenica';
  const ownSiloAvailKg = currentFarmCap
    ? (currentFarmCap.grainStockKg?.[currentCropKey] ?? currentFarmCap.wheatStockKg ?? 0)
    : 0;
  const ownStrawAvailKg = currentFarmCap?.strawStockKg ?? 0;

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOrderMaintenance = () => {
    onUpdateState({
      horseFeedInterventionBuyEnabled: true,
      horseFeedOrder: {
        supplierId: activeSupplierId,
        monthlyKg: monthlyFeedNeedKg,
        contractType,
        monthsRemaining: meta.durationMonths,
      },
      horseStrawOrder: {
        supplierId: activeSupplierId,
        monthlyKg: monthlyStrawNeedKg,
        contractType,
        monthsRemaining: meta.durationMonths,
      },
    });
    const srcLabel = isShip
      ? 'Statek Handlowy'
      : formatSupplierOrderLabel(
          suppliers.find((s) => s.id === activeSupplierId) || shipSupplier,
          buildingsState,
          allWorldBuildings
        );
    notify(
      `🐎 Zamówiono utrzymanie (${monthlyFeedNeedKg} kg paszy + ${monthlyStrawNeedKg} kg ściółki/msc • ${srcLabel}).`
    );
  };

  const handleReserveFromOwnFarm = () => {
    if (!currentFarmCap) return;
    const feedTransfer = Math.min(
      monthlyFeedNeedKg,
      ownSiloAvailKg,
      Math.max(0, HORSE_STORAGE_CAP_KG - horseFeedStockKg)
    );
    const strawTransfer = Math.min(
      monthlyStrawNeedKg,
      ownStrawAvailKg,
      Math.max(0, HORSE_STORAGE_CAP_KG - horseStrawStockKg)
    );
    if (feedTransfer <= 0 && strawTransfer <= 0) {
      notify('⚠️ Brak zapasu ziarna/słomy we własnych magazynach.');
      return;
    }
    const nextCropStock = Math.max(0, ownSiloAvailKg - feedTransfer);
    onUpdateState({
      horseFeedStockKg: horseFeedStockKg + feedTransfer,
      horseStrawStockKg: horseStrawStockKg + strawTransfer,
      farmCapitalism: {
        ...currentFarmCap,
        grainStockKg: {
          ...currentFarmCap.grainStockKg,
          [currentCropKey]: nextCropStock,
        },
        wheatStockKg: nextCropStock,
        strawStockKg: Math.max(0, ownStrawAvailKg - strawTransfer),
      },
    });
    notify(`🔒 Odłożono z własnej farmy: ${feedTransfer} kg paszy i ${strawTransfer} kg ściółki.`);
  };

  const isMaintenanceActive = Boolean(horseFeedOrder || horseStrawOrder);

  return (
    <div className="bg-stone-950/90 border border-amber-500/35 rounded-xl p-3 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-amber-200 flex items-center gap-1.5">
            <span>🐎</span> Utrzymanie Koni Energetycznych (Pasza i Ściółka)
          </h4>
          <p className="text-[11px] text-stone-400">
            Zapotrzebowanie ({ownedHorsesCount} szt.):{' '}
            <strong className="text-amber-300">{monthlyFeedNeedKg} kg paszy/msc</strong> •{' '}
            <strong className="text-yellow-300">{monthlyStrawNeedKg} kg ściółki/msc</strong>{' '}
            <span className="text-stone-500">(bez produkcji obornika)</span>
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
          🛡️ Zakup interwencyjny ze statku: Włączony na stałe (+10%)
        </span>
      </div>

      {/* Paski zapasów paszy i ściółki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="bg-stone-900/70 border border-stone-800 rounded-lg p-2 space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-amber-200 font-bold">🌾 Pasza</span>
            <span className={horseFeedStockKg <= 0 && ownedHorsesCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
              {horseFeedStockKg.toLocaleString('pl-PL')} / {HORSE_STORAGE_CAP_KG.toLocaleString('pl-PL')} kg
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${feedPct}%` }} />
          </div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-lg p-2 space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-yellow-200 font-bold">🟨 Ściółka</span>
            <span className={horseStrawStockKg <= 0 && ownedHorsesCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
              {horseStrawStockKg.toLocaleString('pl-PL')} / {HORSE_STORAGE_CAP_KG.toLocaleString('pl-PL')} kg
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 transition-all" style={{ width: `${strawPct}%` }} />
          </div>
        </div>
      </div>

      {/* Prosty wybór źródła + jeden przycisk Zamów utrzymanie */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-900/80 border border-stone-800 rounded-lg p-2">
        <select
          value={activeSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          className="flex-1 min-w-[180px] bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-200 text-[11px] cursor-pointer"
        >
          <option value={shipSupplier.id}>
            🚢 Statek Handlowy (pasza £11 + ściółka £6.60 / 100 kg)
          </option>
          {localFarms.map((f) => (
            <option key={f.id} value={f.id}>
              🌾 Ferma: {formatSupplierOrderLabel(f, buildingsState, allWorldBuildings)} (pasza £10 + ściółka £6 / 100 kg)
            </option>
          ))}
        </select>

        <select
          value={contractType}
          onChange={(e) => setContractType(e.target.value as ContractType)}
          className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-200 text-[11px] cursor-pointer"
        >
          <option value="pay_as_you_go">Bez kontraktu (PAYG)</option>
          <option value="contract_3y">Kontrakt 3-letni (-10%)</option>
          <option value="contract_5y">Kontrakt 5-letni (-15%)</option>
          <option value="contract_10y">Kontrakt 10-letni (-20%)</option>
        </select>

        <button
          type="button"
          onClick={handleOrderMaintenance}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
        >
          🐎 Zamów utrzymanie dla koni energetycznych (~£{estMonthlyCost}/msc)
        </button>

        {isWheatFarm && (
          <button
            type="button"
            onClick={handleReserveFromOwnFarm}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 text-[11px] font-bold cursor-pointer"
          >
            🔒 Odłóż z własnej farmy
          </button>
        )}
      </div>

      {isMaintenanceActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/30 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-[11px]">
          <span className="text-emerald-200">
            ✓ Aktywne utrzymanie:{' '}
            <strong>{horseFeedOrder?.monthlyKg ?? monthlyFeedNeedKg} kg paszy</strong> +{' '}
            <strong>{horseStrawOrder?.monthlyKg ?? monthlyStrawNeedKg} kg ściółki/msc</strong> •{' '}
            {(horseFeedOrder?.supplierId || horseStrawOrder?.supplierId || '').startsWith('trade_ship')
              ? '🚢 Statek Handlowy'
              : '🌾 Farma Zbożowa'}
          </span>
          <button
            type="button"
            onClick={() => {
              onUpdateState({ horseFeedOrder: undefined, horseStrawOrder: undefined });
              notify('Anulowano stałe zamówienie utrzymania koni.');
            }}
            className="text-rose-300 hover:text-rose-200 font-bold cursor-pointer"
          >
            ✕ Anuluj
          </button>
        </div>
      )}

      {feedback && <p className="text-[11px] font-mono text-emerald-300">{feedback}</p>}
    </div>
  );
};
