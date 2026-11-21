import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { getContractMeta } from '../industryContracts';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from '../industrySupplyConfig';
import { computeMillYieldSummary } from './millMath';
import {
  createDefaultMillState,
  MILL_PRODUCTS_CONFIG,
  type MillCapitalismState,
} from './millTypes';

interface MillFinanceTabProps {
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const MillFinanceTab: React.FC<MillFinanceTabProps> = ({
  buildingState,
  allWorldBuildings,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'summary' | 'pricing' | 'annual'>('summary');
  const mill: MillCapitalismState = buildingState.millState || createDefaultMillState();
  const summary = computeMillYieldSummary(mill, buildingState);
  const productCfg = MILL_PRODUCTS_CONFIG[mill.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;

  const updateMill = (updates: Partial<MillCapitalismState>) => {
    onUpdateState({ millState: { ...mill, ...updates } });
  };

  const supplier = mill.grainOrder
    ? allWorldBuildings.find((b) => b.id === mill.grainOrder?.supplierId)
    : undefined;
  const orderMeta = mill.grainOrder ? getContractMeta(mill.grainOrder.contractType) : null;

  const monthlyPayroll = summary.dailyPayrollCost * 30;
  const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
  const netBalance = mill.totalRevenue - mill.totalExpenses;

  const annualEntries = [
    ...mill.annualHistory.map((h) => ({ ...h, isForecast: false })),
    {
      year: (mill.annualHistory[mill.annualHistory.length - 1]?.year ?? 1879) + 1,
      productTarget: mill.productTarget,
      flourKg: mill.yearlyFlourKg > 0 ? mill.yearlyFlourKg : summary.monthlyFlourForecastKg * 12,
      branKg: mill.yearlyBranKg > 0 ? mill.yearlyBranKg : summary.monthlyBranForecastKg * 12,
      isForecast: true,
    },
  ];
  const maxFlour = Math.max(1000, ...annualEntries.map((e) => e.flourKg));

  return (
    <div className="space-y-3">
      {/* Podzakładki finansowe */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'summary', label: '📊 Zestawienie' },
          { id: 'pricing', label: '🏷️ Cennik' },
          { id: 'annual', label: '📈 Przemiał roczny' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id as 'summary' | 'pricing' | 'annual')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              subTab === t.id
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'summary' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
              <p className="text-[10px] uppercase font-bold text-stone-400">Przychody całkowite</p>
              <p className="text-lg font-mono font-bold text-emerald-400">
                £{mill.totalRevenue.toLocaleString('pl-PL')}
              </p>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
              <p className="text-[10px] uppercase font-bold text-stone-400">Koszty całkowite</p>
              <p className="text-lg font-mono font-bold text-rose-400">
                £{mill.totalExpenses.toLocaleString('pl-PL')}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Płace: £{monthlyPayroll}/msc • Energia: £{monthlyEnergy}/msc
              </p>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
              <p className="text-[10px] uppercase font-bold text-stone-400">Bilans netto</p>
              <p
                className={`text-lg font-mono font-bold ${
                  netBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {netBalance >= 0 ? '+' : ''}£{netBalance.toLocaleString('pl-PL')}
              </p>
            </div>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              📜 Aktywne Kontrakty Dostawców
            </h4>
            {mill.grainOrder && orderMeta ? (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs">
                <div>
                  <span className="font-bold text-stone-100">
                    {mill.grainOrder.supplierId.startsWith('trade_ship')
                      ? '🚢 Port Londyn • Statek Handlowy'
                      : `🌾 ${supplier ? formatSupplierOrderLabel(supplier) : 'Farma Zbożowa'}`}
                  </span>
                  <span className="ml-2 text-stone-400">
                    ({mill.grainOrder.monthlyKg.toLocaleString('pl-PL')} kg/msc)
                  </span>
                </div>
                <span className="font-mono text-emerald-300 font-bold">
                  {orderMeta.label} • -{orderMeta.discountPercent}%
                </span>
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Brak aktywnego kontraktu na dostawę ziarna. Skonfiguruj go w zakładce Magazyn.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === 'pricing' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            🏷️ Cennik Sprzedaży Produktów Młyna
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-bold text-stone-200">
                {productCfg.icon} {productCfg.label} (£ / kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.2"
                max="10"
                value={mill.flourPricePerKg}
                onChange={(e) =>
                  updateMill({ flourPricePerKg: Math.max(0.2, Number(e.target.value) || 0.2) })
                }
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-amber-300"
              />
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-bold text-stone-200">
                🥣 Otręby Paszowe (£ / kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="5"
                value={mill.branPricePerKg}
                onChange={(e) =>
                  updateMill({ branPricePerKg: Math.max(0.1, Number(e.target.value) || 0.1) })
                }
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-amber-300"
              />
            </div>
          </div>
        </div>
      )}

      {subTab === 'annual' && (
        <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              📈 Przemiał Roczny Młyna Parowego
            </h4>
            <span className="text-xs font-mono text-stone-300">
              Prognoza roczna:{' '}
              <strong className="text-emerald-300">
                {(summary.monthlyFlourForecastKg * 12).toLocaleString('pl-PL')} kg
              </strong>
            </span>
          </div>

          <div className="flex items-end gap-3 h-40 pt-4 px-2 bg-stone-950/70 rounded-xl border border-stone-800">
            {annualEntries.map((entry) => {
              const hPct = Math.max(12, Math.round((entry.flourKg / maxFlour) * 100));
              return (
                <div key={`${entry.year}-${entry.isForecast}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono text-stone-300">
                    {(entry.flourKg / 1000).toFixed(1)}t
                  </span>
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                      entry.isForecast
                        ? 'bg-amber-500/60 border border-dashed border-amber-300'
                        : 'bg-emerald-500'
                    }`}
                    style={{ height: `${hPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-stone-400 pb-1">
                    {entry.year} {entry.isForecast ? '(prog.)' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
