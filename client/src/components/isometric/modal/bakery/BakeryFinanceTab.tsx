import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { getContractMeta } from '../industryContracts';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from '../industrySupplyConfig';
import { computeBakeryYieldSummary } from './bakeryMath';
import {
  BAKERY_PRODUCTS_CONFIG,
  createDefaultBakeryState,
  getBakeryFlourOrders,
  type BakeryCapitalismState,
} from './bakeryTypes';

interface BakeryFinanceTabProps {
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const BakeryFinanceTab: React.FC<BakeryFinanceTabProps> = ({
  buildingState,
  allWorldBuildings,
  buildingsState = {},
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'summary' | 'pricing' | 'annual'>('summary');
  const bakery: BakeryCapitalismState = buildingState.bakeryState || createDefaultBakeryState();
  const summary = computeBakeryYieldSummary(bakery, buildingState);
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[bakery.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;

  const updateBakery = (updates: Partial<BakeryCapitalismState>) => {
    onUpdateState({ bakeryState: { ...bakery, ...updates } });
  };

  const mills = allWorldBuildings.filter((b) => b.typeId === 'mill');
  const activeOrders = getBakeryFlourOrders(bakery);
  const monthlyPayroll = summary.dailyPayrollCost * 30;
  const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
  const netBalance = bakery.totalRevenue - bakery.totalExpenses;

  const annualEntries = [
    ...bakery.annualHistory.map((h) => ({ ...h, isForecast: false })),
    {
      year: (bakery.annualHistory[bakery.annualHistory.length - 1]?.year ?? 1879) + 1,
      productTarget: bakery.productTarget,
      breadKg:
        bakery.yearlyBreadKg > 0 ? bakery.yearlyBreadKg : summary.monthlyBreadForecastKg * 12,
      rusksKg:
        bakery.yearlyRusksKg > 0 ? bakery.yearlyRusksKg : summary.monthlyRusksForecastKg * 12,
      isForecast: true,
    },
  ];
  const maxBread = Math.max(1000, ...annualEntries.map((e) => e.breadKg));

  return (
    <div className="space-y-3">
      {/* Podzakładki finansowe */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'summary', label: '📊 Zestawienie' },
          { id: 'pricing', label: '🏷️ Cennik' },
          { id: 'annual', label: '📈 Wypiek roczny' },
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
                £{bakery.totalRevenue.toLocaleString('pl-PL')}
              </p>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
              <p className="text-[10px] uppercase font-bold text-stone-400">Koszty całkowite</p>
              <p className="text-lg font-mono font-bold text-rose-400">
                £{bakery.totalExpenses.toLocaleString('pl-PL')}
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
              📜 Aktywne Kontrakty Dostawców Mąki ({activeOrders.length})
            </h4>
            {activeOrders.length === 0 ? (
              <p className="text-xs text-stone-400">
                Brak aktywnych kontraktów dostawy mąki. Przejdź do zakładki{' '}
                <strong className="text-amber-200">🛒 Zakup/Sprzedaż</strong>, aby zakontraktować
                mąkę z młyna parowego.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeOrders.map((ord) => {
                  const supplier = mills.find((b) => b.id === ord.supplierId);
                  const orderMeta = getContractMeta(ord.contractType);
                  return (
                    <div
                      key={ord.supplierId}
                      className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-100">
                          {ord.supplierId.startsWith('trade_ship')
                            ? '🚢 Port Londyn • Statek Handlowy'
                            : `⚙️ ${supplier ? formatSupplierOrderLabel(supplier, buildingsState, mills) : 'Młyn Parowy'}`}
                        </span>
                        <span className="ml-2 text-stone-400">
                          ({ord.monthlyKg.toLocaleString('pl-PL')} kg/msc)
                        </span>
                      </div>
                      <span className="font-mono text-emerald-300 font-bold">
                        {orderMeta.label}{' '}
                        {orderMeta.durationMonths > 0
                          ? `• ${ord.monthsRemaining} msc`
                          : '• bezterminowy'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-200">
                {productCfg.icon} {productCfg.label}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                £{bakery.breadPricePerKg.toFixed(2)} / szt.
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.5}
              step={0.05}
              value={bakery.breadPricePerKg}
              onChange={(e) => updateBakery({ breadPricePerKg: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-stone-400">
              Cena bazowa: £{productCfg.defaultPricePerKg.toFixed(2)}/szt.
            </p>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-200">🥣 Bułka Tarta</span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                £{bakery.rusksPricePerKg.toFixed(2)} / kg
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.8}
              step={0.05}
              value={bakery.rusksPricePerKg}
              onChange={(e) => updateBakery({ rusksPricePerKg: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-stone-400">Cena rynkowa: £0.65/kg</p>
          </div>
        </div>
      )}

      {subTab === 'annual' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              📈 Wypiek Roczny i Prognoza
            </h4>
            <span className="text-[11px] text-stone-400 font-mono">
              Prognoza roczna: {(summary.monthlyBreadForecastKg * 12).toLocaleString('pl-PL')} szt.
            </span>
          </div>

          <div className="space-y-2">
            {annualEntries.map((e) => {
              const pct = Math.min(100, Math.round((e.breadKg / maxBread) * 100));
              return (
                <div key={`${e.year}-${e.isForecast ? 'f' : 'h'}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-200">
                      {e.year} {e.isForecast ? '(Prognoza)' : ''}
                    </span>
                    <span className="font-mono text-emerald-300">
                      {e.breadKg.toLocaleString('pl-PL')} szt. •{' '}
                      <span className="text-amber-300">
                        {e.rusksKg.toLocaleString('pl-PL')} kg bułki tartej
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className={`h-full ${
                        e.isForecast ? 'bg-amber-500/70' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
