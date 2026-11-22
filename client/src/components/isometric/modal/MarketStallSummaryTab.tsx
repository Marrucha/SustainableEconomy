import React from 'react';
import type { MarketStallSlot, BuildingState } from '../types';
import { ALL_MARKET_GOODS } from './marketplaceGoods';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';

export type MarketStallTab = 'summary' | 'process' | 'products' | 'trade' | 'finance';

interface MarketStallSummaryTabProps {
  stall: MarketStallSlot;
  isSupplyReady: boolean;
  isTraderReady: boolean;
  isDeliveryReady: boolean;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  monthlyRentCost: number;
  estMonthlyRevenue: number;
  estMonthlySupplyCost: number;
  estMonthlyNet: number;
  onNavigateTab: (tab: MarketStallTab) => void;
}

export const MarketStallSummaryTab: React.FC<MarketStallSummaryTabProps> = ({
  stall,
  isSupplyReady,
  isTraderReady,
  isDeliveryReady,
  allWorldBuildings,
  buildingsState,
  monthlyRentCost,
  estMonthlyRevenue,
  estMonthlySupplyCost,
  estMonthlyNet,
  onNavigateTab,
}) => {
  const supplySlots = stall.supplySlots || [];
  const securedSlots = supplySlots.filter((s) => Boolean(s.supplierBuildingId));
  const sellers = stall.sellers || [];

  const checklistItems: Array<{
    id: string;
    icon: string;
    label: string;
    passed: boolean;
    detail: string;
    targetTab: MarketStallTab;
    actionLabel: string;
  }> = [
    {
      id: 'supply',
      icon: '📦',
      label: 'Zaopatrzenie i wybór towaru',
      passed: isSupplyReady,
      detail: isSupplyReady
        ? 'Zaopatrzeniowiec przypisany do stoiska.'
        : 'Brak zaopatrzeniowca — przypisz pracownika w Procesie Sprzedaży.',
      targetTab: 'process',
      actionLabel: '→ Uzupełnij w Procesie Sprzedaży',
    },
    {
      id: 'trader',
      icon: '🗣️',
      label: 'Obsługa lady (Handlarz)',
      passed: isTraderReady,
      detail: isTraderReady
        ? `Aktywna obsada lady (${Math.max(sellers.length, (stall.stageCrew?.trader || []).length)} os.).`
        : 'Brak handlarza obsługującego klientów przy ladzie.',
      targetTab: 'process',
      actionLabel: '→ Przypisz w Procesie Sprzedaży',
    },
    {
      id: 'delivery',
      icon: '🚚',
      label: 'Transport i dostawa',
      passed: isDeliveryReady,
      detail: isDeliveryReady
        ? 'Dostawca obsługuje cały kram (wszystkie towary na stoisku).'
        : 'Brak woźnicy / dostawcy do przewozu towaru na targ.',
      targetTab: 'process',
      actionLabel: '→ Przypisz w Procesie Sprzedaży',
    },
    {
      id: 'contracts',
      icon: '🛒',
      label: 'Zakontraktowany asortyment',
      passed: securedSlots.length > 0,
      detail:
        securedSlots.length > 0
          ? `Zakontraktowano ${securedSlots.length}/4 pozycji towarowych.`
          : 'Brak aktywnych umów dostaw z fabryk, gospodarstw lub Statku Handlowego.',
      targetTab: 'trade',
      actionLabel: '→ Zakontraktuj w Zakup/Sprzedaż',
    },
  ];

  const failedCount = checklistItems.filter((i) => !i.passed).length;
  const allPassed = failedCount === 0;

  return (
    <div className="space-y-3 animate-fade-in">
      <div
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
          allPassed
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
              allPassed
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/20 border-rose-400 text-rose-300'
            }`}
          >
            {allPassed ? '✓' : '✕'}
          </span>
          <div>
            <h3 className="text-sm font-bold">
              {allPassed
                ? 'Stoisko gotowe do handlu (wszystkie warunki spełnione)'
                : `Sprzedaż wstrzymana lub niepełna (braki: ${failedCount})`}
            </h3>
            <p className="text-[11px] opacity-80">
              Stoisko generuje pełny obrót dopiero po spełnieniu wszystkich 4 warunków poniższej checklisty.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('process')}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
        >
          🏪 Przejdź do Procesu Sprzedaży
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border space-y-1.5 ${
              item.passed
                ? 'bg-stone-950/80 border-emerald-500/35'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-bold text-stone-100">{item.label}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.passed
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                }`}
              >
                {item.passed ? '✓ OK' : '✕ BRAK'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-300 leading-snug">{item.detail}</p>
            {!item.passed && (
              <button
                type="button"
                onClick={() => onNavigateTab(item.targetTab)}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              🛒 Zakontraktowane towary ({securedSlots.length}/4)
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('trade')}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
            >
              Zarządzaj →
            </button>
          </div>
          {securedSlots.length === 0 ? (
            <p className="text-[11px] text-stone-400 italic">
              Brak aktywnych dostaw towaru na stoisko.
            </p>
          ) : (
            <div className="space-y-1.5">
              {securedSlots.map((slot) => {
                const good = ALL_MARKET_GOODS.find((g) => g.id === slot.productId);
                const supplier = allWorldBuildings.find((b) => b.id === slot.supplierBuildingId);
                const seller = sellers.find((s) => s.productId === slot.productId);
                return (
                  <div
                    key={slot.slotIndex}
                    className="flex items-center justify-between gap-2 bg-stone-900/80 border border-stone-800 rounded-xl px-2.5 py-1.5 text-[11px]"
                  >
                    <div className="truncate">
                      <span className="font-bold text-stone-100">
                        {good?.icon || '📦'} {good?.label || slot.productId}
                      </span>
                      <span className="text-stone-400 ml-1.5">
                        • {supplier ? formatSupplierOrderLabel(supplier, buildingsState, allWorldBuildings) : 'Dostawca'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300 shrink-0">
                      £{(seller?.retailPrice ?? good?.defaultPrice ?? 1).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              📊 Szacowany bilans miesięczny
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('finance')}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
            >
              Finanse →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-2">
              <div className="text-[10px] text-stone-400">
                Przychód (suma: {Math.max(sellers.length, (stall.stageCrew?.trader || []).length)} prod.)
              </div>
              <div className="font-bold text-emerald-300">£{estMonthlyRevenue.toFixed(2)}</div>
            </div>
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-2">
              <div className="text-[10px] text-stone-400">Dostawy + Dzierżawa</div>
              <div className="font-bold text-rose-300">
                £{(estMonthlySupplyCost + monthlyRentCost).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-stone-900/80 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs font-mono">
            <span className="text-stone-300">Prognozowany wynik netto:</span>
            <span className={`font-bold ${estMonthlyNet >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              {estMonthlyNet >= 0 ? '+' : ''}£{estMonthlyNet.toFixed(2)} / msc
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
