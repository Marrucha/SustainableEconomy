import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { computeMineYieldSummary } from './mineMath';
import {
  createDefaultMineCapitalismState,
  type MineCapitalismState,
} from './mineCapitalismTypes';
import { MINE_DEPOSITS } from './mineTypes';

interface MineFinanceTabProps {
  buildingState: BuildingState;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const MineFinanceTab: React.FC<MineFinanceTabProps> = ({
  buildingState,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'summary' | 'pricing' | 'annual'>('summary');
  const depKey = buildingState.mineDepositType;
  const depositInfo = depKey ? MINE_DEPOSITS[depKey] : undefined;
  const mine: MineCapitalismState =
    buildingState.mineCapitalism || createDefaultMineCapitalismState(depKey);

  if (!depositInfo) {
    return (
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
        Najpierw wybierz złoże w zakładce <strong className="text-amber-300">🏭 Produkcja</strong>.
      </div>
    );
  }

  const summary = computeMineYieldSummary(mine, buildingState, depositInfo);
  const updateMine = (updates: Partial<MineCapitalismState>) => {
    onUpdateState({ mineCapitalism: { ...mine, ...updates } });
  };

  const monthlyPayroll = summary.dailyPayrollCost * 30;
  const monthlyEnergy = Math.round(summary.dailyEnergyCost * 30);
  const netBalance = mine.totalRevenue - mine.totalExpenses;

  const annualEntries = [
    ...mine.annualHistory.map((h) => ({ ...h, isForecast: false })),
    {
      year: (mine.annualHistory[mine.annualHistory.length - 1]?.year ?? 1879) + 1,
      depositType: depositInfo.id,
      oreTons: mine.yearlyOreTons > 0 ? mine.yearlyOreTons : summary.monthlyOreTons * 12,
      isForecast: true,
    },
  ];
  const maxTons = Math.max(200, ...annualEntries.map((e) => e.oreTons));

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        {[
          { id: 'summary', label: '📊 Zestawienie' },
          { id: 'pricing', label: '🏷️ Cennik' },
          { id: 'annual', label: '📈 Wydobycie roczne' },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
            <p className="text-[10px] uppercase font-bold text-stone-400">Przychody całkowite</p>
            <p className="text-lg font-mono font-bold text-emerald-400">
              £{mine.totalRevenue.toLocaleString('pl-PL')}
            </p>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
            <p className="text-[10px] uppercase font-bold text-stone-400">Koszty całkowite</p>
            <p className="text-lg font-mono font-bold text-rose-400">
              £{mine.totalExpenses.toLocaleString('pl-PL')}
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
      )}

      {subTab === 'pricing' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">
              {depositInfo.icon} {depositInfo.name}
            </span>
            <span className="font-mono text-sm font-bold text-emerald-300">
              £{mine.pricePerTon.toFixed(0)} / t
            </span>
          </div>
          <input
            type="range"
            min={Math.max(2, Math.round(depositInfo.basePricePerTon * 0.5))}
            max={Math.round(depositInfo.basePricePerTon * 2)}
            step={1}
            value={mine.pricePerTon}
            onChange={(e) => updateMine({ pricePerTon: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[11px] text-stone-400">
            Cena bazowa rynkowa: £{depositInfo.basePricePerTon}/t
          </p>
        </div>
      )}

      {subTab === 'annual' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              📈 Wydobycie Roczne i Prognoza
            </h4>
            <span className="text-[11px] text-stone-400 font-mono">
              Prognoza roczna: {(summary.monthlyOreTons * 12).toLocaleString('pl-PL')} t
            </span>
          </div>

          <div className="space-y-2">
            {annualEntries.map((e) => {
              const pct = Math.min(100, Math.round((e.oreTons / maxTons) * 100));
              return (
                <div key={`${e.year}-${e.isForecast ? 'f' : 'h'}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-200">
                      {e.year} {e.isForecast ? '(Prognoza)' : ''}
                    </span>
                    <span className="font-mono text-emerald-300">
                      {e.oreTons.toLocaleString('pl-PL')} t
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
