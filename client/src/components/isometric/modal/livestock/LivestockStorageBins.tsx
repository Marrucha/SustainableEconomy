import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { WorldSupplierBuilding } from '../industrySupplyConfig';
import type { LivestockCapitalismState } from './livestockTypes';
import { LIVESTOCK_PRODUCTS } from './livestockTypes';
import { LivestockSupplyOrderCard } from './LivestockSupplyOrderCard';
import { loadGameParameters } from '../../admin/gameParameters';

interface LivestockStorageBinsProps {
  state: LivestockCapitalismState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

  const params = loadGameParameters();
  const feedCapKg = params.grainSiloBaseCapacityKg || 10000;
  const strawCapKg = params.strawStackBaseCapacityKg || 20000;
  const manureCapKg = params.manureBinBaseCapacityKg || 10000;
  const MAX_BIN_CAPACITY = feedCapKg;

export const LivestockStorageBins: React.FC<LivestockStorageBinsProps> = ({
  state,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateState,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const storage = state.storage;
  const species = state.activeSpecies || 'cattle';
  const isCattle = species === 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';
  const supplies = state.supplies || { strawBeddingKg: 400, feedGrainKg: 350 };
  const wheatProducers = allWorldBuildings.filter((b) => b.typeId === 'wheat_farm');

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const salesWorker = (state.crew || []).find(
    (w) => w.profession === 'trader' || w.profession === 'breeder'
  );

  const handleSellStorageItem = (key: 'manureKg' | 'milkLiters' | 'woolKg') => {
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

  const productKey: 'milkLiters' | 'woolKg' | null = isCattle
    ? 'milkLiters'
    : isSheep
    ? 'woolKg'
    : null;

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

      {/* MAGAZYNY FERMY: PASZA, ŚCIÓŁKA, HAŁDA OBORNIKA + PRODUKTY (TYLKO BYDŁO/OWCE) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isHorses ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3.5`}>
        {/* 1. MAGAZYN PASZY */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌽</span>
              <div>
                <h4 className="text-xs font-bold text-amber-100">Magazyn Paszy</h4>
                <span className="text-[10px] text-stone-400 font-mono">Pasza dla zwierząt (kg)</span>
              </div>
            </div>
            {renderFillBar(supplies.feedGrainKg, feedCapKg, 'bg-amber-500')}
          </div>
          <LivestockSupplyOrderCard
            kind="feed"
            producers={wheatProducers}
            buildingsState={buildingsState}
            activeOrder={state.feedOrder}
            onSpendGold={onSpendGold}
            onSaveOrder={(order) => {
              onUpdateState({ feedOrder: order });
              notify(`🌽 Zapisano dostawy paszy (${order.monthlyQuantityKg} kg/msc) od kolejnego miesiąca.`);
            }}
            onCancelOrder={() => {
              onUpdateState({ feedOrder: undefined });
              notify('Anulowano dostawy paszy.');
            }}
          />
        </div>

        {/* 2. MAGAZYN ŚCIÓŁKI */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌾</span>
              <div>
                <h4 className="text-xs font-bold text-amber-100">Magazyn Ściółki</h4>
                <span className="text-[10px] text-stone-400 font-mono">Słoma do zagrody (kg)</span>
              </div>
            </div>
            {renderFillBar(supplies.strawBeddingKg, strawCapKg, 'bg-yellow-500')}
          </div>
          <LivestockSupplyOrderCard
            kind="straw"
            producers={wheatProducers}
            buildingsState={buildingsState}
            activeOrder={state.strawOrder}
            onSpendGold={onSpendGold}
            onSaveOrder={(order) => {
              onUpdateState({ strawOrder: order });
              notify(`🌾 Zapisano dostawy ściółki (${order.monthlyQuantityKg} kg/msc) od kolejnego miesiąca.`);
            }}
            onCancelOrder={() => {
              onUpdateState({ strawOrder: undefined });
              notify('Anulowano dostawy ściółki.');
            }}
          />
        </div>

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
      </div>
    </div>
  );
};
