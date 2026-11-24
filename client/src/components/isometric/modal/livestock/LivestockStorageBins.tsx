import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { WorldSupplierBuilding } from '../industrySupplyConfig';
import type { LivestockCapitalismState } from './livestockTypes';
import { LIVESTOCK_PRODUCTS } from './livestockTypes';
import { LivestockSupplyOrderCard } from './LivestockSupplyOrderCard';
import { LivestockAnimalPurchaseCard } from './LivestockAnimalPurchaseCard';
import { IncomingSalesContractsCard } from '../IncomingSalesContractsCard';
import { loadGameParameters } from '../../admin/gameParameters';
import { computeSupplyContractPenalty, getContractMeta } from '../industryContracts';
import { formatSupplierOrderLabel } from '../industrySupplyConfig';

interface LivestockStorageBinsProps {
  buildingId?: string;
  state: LivestockCapitalismState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

  const params = loadGameParameters();
  const feedCapKg = params.grainSiloBaseCapacityKg || 10000;
  const strawCapKg = params.strawStackBaseCapacityKg || 20000;
  const manureCapKg = params.manureBinBaseCapacityKg || 100000;
  const MAX_BIN_CAPACITY = feedCapKg;

export const LivestockStorageBins: React.FC<LivestockStorageBinsProps> = ({
  buildingId,
  state,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'buy' | 'sell'>('buy');

  const storage = state.storage;
  const species = state.activeSpecies || 'cattle';
  const isCattle = species === 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';
  const isPoultry = species === 'poultry';
  const supplies = state.supplies || { strawBeddingKg: 400, feedGrainKg: 350 };
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
  const wheatProducers = [
    shipSupplier,
    ...allWorldBuildings.filter((b) => b.typeId === 'wheat_farm'),
  ];
  const feedProducers = [
    shipSupplier,
    ...allWorldBuildings.filter((b) => b.typeId === 'wheat_farm' || b.typeId === 'mill'),
  ];

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const salesWorker = (state.crew || []).find(
    (w) => w.profession === 'trader' || w.profession === 'breeder'
  );

  const handleSellStorageItem = (
    key: 'manureKg' | 'milkLiters' | 'woolKg' | 'poultryMeatKg' | 'feathersKg' | 'eggsCount'
  ) => {
    if (!salesWorker) {
      notify('⚠️ Zatrudnij Handlarza lub Hodowcę, aby sprzedawać z magazynu/hałdy!');
      return;
    }
    const prod = LIVESTOCK_PRODUCTS[key];
    const curVal = storage[key] || 0;
    if (curVal < prod.batchSize) {
      notify(`⚠️ Za mało towaru (min. ${prod.batchSize} ${prod.unit}).`);
      return;
    }
    onUpdateState({
      storage: { ...storage, [key]: curVal - prod.batchSize },
      lastCycleRevenue: (state.lastCycleRevenue || 0) + prod.pricePerBatch,
    });
    notify(`💰 ${salesWorker.name} sprzedał ${prod.batchSize} ${prod.unit} (${prod.name}) za £${prod.pricePerBatch}!`);
  };

  const productKey: 'milkLiters' | 'woolKg' | 'eggsCount' | null = isCattle
    ? 'milkLiters'
    : isSheep
    ? 'woolKg'
    : isPoultry
    ? 'eggsCount'
    : null;

  const h = state.herd;
  const animalCount = isCattle
    ? (h.milkingGroupCows || 0) + (h.growingGroupCalves || 0) + (h.cattleForSale ?? 4)
    : isSheep
    ? (h.adultSheepCount || 0) + (h.growingLambsCount || 0) + (h.sheepForSale ?? 4)
    : isHorses
    ? h.horses && h.horses.length > 0
      ? h.horses.filter((x) => !x.isDeceased).length
      : (h.adultDraftHorses ?? 10) + (h.growingFoalsCount ?? 4) + (h.horsesForSale ?? 2)
    : (h.adultHensCount ?? 20) + (h.growingChicksCount ?? 10);

  const recoveringHorsesCount =
    isHorses && h.horses && h.horses.length > 0
      ? h.horses.filter((x) => !x.isDeceased && (x.vitalityPercent ?? 100) < 100).length
      : 0;
  const dailyFeedNeedKg = isHorses
    ? (animalCount + recoveringHorsesCount) * (params.horseDailyFeedKg || 10)
    : isCattle
    ? animalCount * 8
    : animalCount * 2;
  const monthlyFeedNeedKg = dailyFeedNeedKg * 30;
  const monthlyStrawNeedKg = isHorses ? animalCount * 15 * 30 : 0;

  const renderFillBar = (val: number, max: number, barClass: string) => {
    const pct = Math.min(100, Math.round((val / max) * 100));
    return (
      <div className="space-y-1">
        <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div className={`${barClass} h-full rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-stone-400">
          <span>{val} / {max}</span>
          <span>{pct}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium">
          {feedback}
        </div>
      )}

      {/* 2 PODZAKŁADKI JAK W MŁYNIE PAROWYM: ZAKUPY / SPRZEDAŻ */}
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

      {subTab === 'buy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* LEWA KOLUMNA: MAGAZYN PASZY I ŚCIÓŁKI + FORMATKI */}
          <div className="space-y-3.5">
        {/* 1. MAGAZYN PASZY */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌽</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Magazyn Paszy</h4>
                  <span className="text-[10px] text-stone-400 font-mono">Pasza dla zwierząt (kg)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                {monthlyFeedNeedKg.toLocaleString('pl-PL')} kg/msc
              </span>
            </div>
            {renderFillBar(supplies.feedGrainKg, feedCapKg, 'bg-amber-500')}
          </div>
          <LivestockSupplyOrderCard
            kind="feed"
            producers={feedProducers}
            buildingsState={buildingsState}
            activeOrder={state.feedOrder}
            activeOrders={state.feedOrders}
            onSpendGold={onSpendGold}
            onSaveOrder={(order) => {
              const current = state.feedOrders ?? (state.feedOrder ? [state.feedOrder] : []);
              const next = [...current.filter((o) => o.supplierId !== order.supplierId), order];
              onUpdateState({ feedOrders: next, feedOrder: next[0] });
              notify(`🌽 Zapisano dostawę paszy (${order.monthlyQuantityKg} kg/msc) od kolejnego miesiąca.`);
            }}
            onCancelOrder={(supplierId) => {
              const current = state.feedOrders ?? (state.feedOrder ? [state.feedOrder] : []);
              const next = supplierId ? current.filter((o) => o.supplierId !== supplierId) : [];
              onUpdateState({ feedOrders: next, feedOrder: next[0] });
              notify('✕ Usunięto kontrakt na dostawę paszy.');
            }}
          />
        </div>

        {/* 2. MAGAZYN ŚCIÓŁKI */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌾</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Magazyn Ściółki</h4>
                  <span className="text-[10px] text-stone-400 font-mono">Słoma do zagrody (kg)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-stone-950 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                {monthlyStrawNeedKg.toLocaleString('pl-PL')} kg/msc
              </span>
            </div>
            {renderFillBar(supplies.strawBeddingKg, strawCapKg, 'bg-yellow-500')}
          </div>
          <LivestockSupplyOrderCard
            kind="straw"
            producers={wheatProducers}
            buildingsState={buildingsState}
            activeOrder={state.strawOrder}
            activeOrders={state.strawOrders}
            onSpendGold={onSpendGold}
            onSaveOrder={(order) => {
              const current = state.strawOrders ?? (state.strawOrder ? [state.strawOrder] : []);
              const next = [...current.filter((o) => o.supplierId !== order.supplierId), order];
              onUpdateState({ strawOrders: next, strawOrder: next[0] });
              notify(`🌾 Zapisano dostawę ściółki (${order.monthlyQuantityKg} kg/msc) od kolejnego miesiąca.`);
            }}
            onCancelOrder={(supplierId) => {
              const current = state.strawOrders ?? (state.strawOrder ? [state.strawOrder] : []);
              const next = supplierId ? current.filter((o) => o.supplierId !== supplierId) : [];
              onUpdateState({ strawOrders: next, strawOrder: next[0] });
              notify('✕ Usunięto kontrakt na dostawę ściółki.');
            }}
          />
        </div>

        {/* 3. JEDNORAZOWY ZAKUP ZWIERZĄT Z INNEJ FERMY LUB ZE STATKU */}
        <LivestockAnimalPurchaseCard
          currentBuildingId={buildingId}
          state={state}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateAnyBuildingState={onUpdateAnyBuildingState}
          onUpdateState={onUpdateState}
          notify={notify}
        />
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY ZAKUPU */}
          {(() => {
            const feedOrders = state.feedOrders ?? (state.feedOrder ? [state.feedOrder] : []);
            const strawOrders = state.strawOrders ?? (state.strawOrder ? [state.strawOrder] : []);
            const allBuyOrders = [
              ...feedOrders.map((o) => ({ ...o, kind: 'feed' as const })),
              ...strawOrders.map((o) => ({ ...o, kind: 'straw' as const })),
            ];
            return (
              <div className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    📜 Zawarte Kontrakty Zakupu
                  </h4>
                  <span className="text-[10px] font-mono text-stone-400">
                    Aktywne: <strong className="text-emerald-300">{allBuyOrders.length}</strong>
                  </span>
                </div>
                <label className="flex items-center gap-2 bg-stone-950/70 border border-amber-500/30 rounded-lg px-2 py-1 text-[10px] text-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!state.interventionBuyEnabled}
                    onChange={(e) => onUpdateState({ interventionBuyEnabled: e.target.checked })}
                    className="accent-amber-500 cursor-pointer"
                  />
                  <span className="font-semibold">🛟 Zakup interwencyjny ze statku (+10% do ceny statku)</span>
                  <span
                    title="Gdy dostawca paszy lub ściółki nie zrealizuje kontraktu w pełni lub w części w danym miesiącu, brakująca ilość zostanie dokupiona na Statku Handlowym po cenie statku + 10%."
                    className="text-stone-400 hover:text-amber-300 cursor-help ml-auto"
                  >
                    ℹ
                  </span>
                </label>
                {allBuyOrders.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic">Brak aktywnych kontraktów zakupu.</p>
                ) : (
                  <div className="space-y-1.5">
                    {allBuyOrders.map((ord) => {
                      const ordMeta = getContractMeta(ord.contractType);
                      const isShip = ord.supplierId.startsWith('trade_ship');
                      const supObj = allWorldBuildings.find((b) => b.id === ord.supplierId);
                      const owner = buildingsState[ord.supplierId]?.ownerName || supObj?.playerName;
                      const isOurs = !isShip && (!owner || owner === 'Gracz');
                      const penalty = computeSupplyContractPenalty(
                        ord.monthlyQuantityKg,
                        ord.kind === 'feed' ? 10 : 6,
                        ord.contractType,
                        ord.monthsRemaining
                      );
                      return (
                        <div
                          key={`${ord.kind}_${ord.supplierId}`}
                          className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]"
                        >
                          <div className="text-emerald-200 font-semibold">
                            ✓ <span className="text-white font-bold">{ord.kind === 'feed' ? 'Pasza' : 'Ściółka (Słoma)'}</span> •{' '}
                            <span className={isOurs ? 'text-sky-300 font-bold' : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'}>
                              {isShip
                                ? '🚢 Statek Handlowy'
                                : supObj
                                ? formatSupplierOrderLabel(supObj, buildingsState, allWorldBuildings)
                                : 'Dostawca'}
                            </span>{' '}
                            •{' '}
                            <span className="font-mono font-bold text-yellow-300">
                              {ord.monthlyQuantityKg.toLocaleString('pl-PL')} kg/msc
                            </span>{' '}
                            • {ordMeta.label}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (penalty > 0 && onSpendGold) onSpendGold(penalty);
                              if (ord.kind === 'feed') {
                                const next = feedOrders.filter((o) => o.supplierId !== ord.supplierId);
                                onUpdateState({ feedOrders: next, feedOrder: next[0] });
                              } else {
                                const next = strawOrders.filter((o) => o.supplierId !== ord.supplierId);
                                onUpdateState({ strawOrders: next, strawOrder: next[0] });
                              }
                              notify('✕ Usunięto kontrakt.');
                            }}
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
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* LEWA KOLUMNA: MAGAZYNY WYROBÓW (OBORNIK + PRODUKTY) */}
          <div className="space-y-3.5">
        {/* 3. HAŁDA OBORNIKA */}
        <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">💩</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-100">Hałda Obornika</h4>
                <span className="text-[10px] text-stone-400 font-mono">Zebrany z zagrody (kg)</span>
              </div>
            </div>
            {renderFillBar(storage.manureKg || 0, manureCapKg, 'bg-emerald-500')}
          </div>
          <div className="pt-2 border-t border-stone-800 text-[10px] font-mono text-stone-400">
            Gotowy do zakontraktowania przez odbiorcę (tylko stan)
          </div>
        </div>

        {/* 4. MAGAZYN PRODUKTÓW (MLEKO DLA KRÓW / WEŁNA DLA OWIEC — BRAK DLA KONI) */}
        {productKey && (() => {
          const prod = LIVESTOCK_PRODUCTS[productKey];
          const stock = storage[productKey] || 0;
          const canSell = stock >= prod.batchSize;
          return (
            <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">{prod.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-sky-100">Magazyn Produktów</h4>
                    <span className="text-[10px] text-stone-400 font-mono">{prod.name}</span>
                  </div>
                </div>
                {renderFillBar(stock, MAX_BIN_CAPACITY, 'bg-sky-500')}
              </div>
              <button
                type="button"
                onClick={() => handleSellStorageItem(productKey)}
                disabled={!canSell}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-sky-950/70 hover:bg-sky-900/80 text-sky-200 border border-sky-600/50 transition-all cursor-pointer disabled:opacity-40"
              >
                💰 Sprzedaj {prod.batchSize} {prod.unit} (£{prod.pricePerBatch})
              </button>
            </div>
          );
        })()}

        {isPoultry && (['poultryMeatKg', 'feathersKg'] as const).map((k) => {
          const prod = LIVESTOCK_PRODUCTS[k];
          const stock = storage[k] || 0;
          const canSell = Boolean(salesWorker) && stock >= prod.batchSize;
          return (
            <div key={k} className="bg-stone-900/90 border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">{prod.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-rose-100">{prod.name}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">Ubój drobiu ({prod.unit})</span>
                  </div>
                </div>
                {renderFillBar(stock, MAX_BIN_CAPACITY, 'bg-rose-500')}
              </div>
              <button
                type="button"
                onClick={() => handleSellStorageItem(k)}
                disabled={!canSell}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-600/50 transition-all cursor-pointer disabled:opacity-40"
              >
                💰 Sprzedaj {prod.batchSize} {prod.unit} (£{prod.pricePerBatch})
              </button>
            </div>
          );
        })}
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY SPRZEDAŻY */}
          <IncomingSalesContractsCard
            buildingId={buildingId}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
          />
        </div>
      )}
    </div>
  );
};
