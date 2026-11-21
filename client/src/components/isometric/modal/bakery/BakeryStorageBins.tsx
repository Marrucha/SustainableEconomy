import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import {
  getIncomingSalesContracts,
  type WorldSupplierBuilding,
} from '../industrySupplyConfig';
import { BAKERY_PRODUCTS_CONFIG, type BakeryCapitalismState } from './bakeryTypes';
import { BakeryExtraOrdersCard } from './BakeryExtraOrdersCard';

interface BakeryStorageBinsProps {
  buildingId?: string;
  state: BakeryCapitalismState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdate: (updates: Partial<BakeryCapitalismState>) => void;
}

const InfoTooltip: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <span className="relative group inline-flex items-center">
    <span className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold inline-flex items-center justify-center cursor-help border border-stone-600">
      ℹ
    </span>
    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-2.5 rounded-xl bg-stone-950 border border-amber-500/60 shadow-2xl text-[11px] text-stone-200 z-50 leading-snug font-normal">
      <strong className="block text-amber-300 mb-0.5">{title}</strong>
      <span className="text-stone-300">{body}</span>
    </span>
  </span>
);

export const BakeryStorageBins: React.FC<BakeryStorageBinsProps> = ({
  buildingId = '',
  state,
  allWorldBuildings,
  buildingsState,
  clock,
  onSpendGold,
  onUpdate,
}) => {
  const [subTab, setSubTab] = useState<'buy' | 'sell'>('buy');
  const salesContracts = buildingId
    ? getIncomingSalesContracts(buildingId, allWorldBuildings, buildingsState)
    : [];
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[state.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;

  const breadPct = Math.min(100, Math.round((state.breadStockKg / state.breadCapacityKg) * 100));
  const rusksPct = Math.min(100, Math.round((state.rusksStockKg / state.rusksCapacityKg) * 100));

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

      {subTab === 'buy' ? (
        <BakeryExtraOrdersCard
          state={state}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          clock={clock}
          onSpendGold={onSpendGold}
          onUpdate={onUpdate}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {/* LEWA KOLUMNA: MAGAZYNY WYROBÓW GOTOWYCH */}
          <div className="space-y-2">
            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                  {productCfg.icon} {productCfg.label}
                  <InfoTooltip
                    title="Półki Pieczywa"
                    body="Gotowe wypieki przeznaczone do realizacji kontraktów sprzedaży."
                  />
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {breadPct}% • Jakość {state.breadQualityPercent}% •{' '}
                  <strong className="text-amber-300">£{state.breadPricePerKg.toFixed(2)}/szt.</strong>
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-stone-100">
                <span className={state.breadStockKg <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
                  {state.breadStockKg.toLocaleString('pl-PL')}
                </span>{' '}
                <span className="text-[10px] text-stone-400">
                  / {state.breadCapacityKg.toLocaleString('pl-PL')} szt.
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-emerald-400" style={{ width: `${breadPct}%` }} />
              </div>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                  🥣 Bułka Tarta
                  <InfoTooltip
                    title="Bułka Tarta"
                    body="Produkt uboczny wypieku wydawany wyłącznie na podstawie kontraktów."
                  />
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {rusksPct}% •{' '}
                  <strong className="text-amber-300">£{state.rusksPricePerKg.toFixed(2)}/kg</strong>
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-stone-100">
                <span className={state.rusksStockKg <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
                  {state.rusksStockKg.toLocaleString('pl-PL')}
                </span>{' '}
                <span className="text-[10px] text-stone-400">
                  / {state.rusksCapacityKg.toLocaleString('pl-PL')} kg
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-orange-400" style={{ width: `${rusksPct}%` }} />
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY SPRZEDAŻY */}
          <div className="bg-stone-900/90 rounded-xl p-3 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                🤝 Zawarte Kontrakty Sprzedaży
                <InfoTooltip
                  title="Kontrakty Odbiorców"
                  body="W modelu zamkniętego rynku sprzedaż następuje wyłącznie na podstawie kontraktów zawartych przez odbiorców (np. stoiska na Targowisku)."
                />
              </h4>
              <span className="text-[10px] font-mono text-stone-400">
                Aktywne: <strong className="text-emerald-300">{salesContracts.length}</strong>
              </span>
            </div>
            {salesContracts.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">
                Brak aktywnych kontraktów sprzedaży. Odbiorcy kontraktują wypieki ze swoich kart.
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
        </div>
      )}
    </div>
  );
};
