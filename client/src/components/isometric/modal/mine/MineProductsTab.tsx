import React from 'react';
import type { BuildingState } from '../../types';
import { createDefaultMineCapitalismState } from './mineCapitalismTypes';
import { MINE_DEPOSITS } from './mineTypes';

interface MineProductsTabProps {
  buildingState: BuildingState;
}

export const MineProductsTab: React.FC<MineProductsTabProps> = ({ buildingState }) => {
  const depKey = buildingState.mineDepositType;
  const depositInfo = depKey ? MINE_DEPOSITS[depKey] : undefined;
  const mine = buildingState.mineCapitalism || createDefaultMineCapitalismState(depKey);
  const stockTons = buildingState.mineStock ?? 0;

  if (!depositInfo) {
    return (
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
        Najpierw wybierz dożywotnie złoże w zakładce <strong className="text-amber-300">🏭 Produkcja</strong>.
      </div>
    );
  }

  const pct = Math.min(100, Math.round((stockTons / Math.max(1, mine.capacityTons)) * 100));
  const isEmpty = stockTons <= 0;

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
          <span>📦</span> Surowiec Wydobywany na Hałdzie
        </h3>
        <span className="text-[11px] font-mono text-stone-400">
          Kategoria: {depositInfo.category}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-950/90 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Surowiec</th>
              <th className="py-2 px-3">Kategoria</th>
              <th className="py-2 px-3">Stan na hałdzie</th>
              <th className="py-2 px-3">Pojemność</th>
              <th className="py-2 px-3">Jakość / Śr.</th>
              <th className="py-2 px-3 text-right">Cena jedn.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80 bg-stone-900/60">
            <tr className="hover:bg-stone-800/40">
              <td className="py-2.5 px-3 font-bold text-stone-100">
                <span className="mr-1.5">{depositInfo.icon}</span>
                {depositInfo.name}
              </td>
              <td className="py-2.5 px-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Wydobycie
                </span>
              </td>
              <td className="py-2.5 px-3 font-mono font-bold">
                <span className={isEmpty ? 'text-rose-400' : 'text-emerald-300'}>
                  {stockTons.toLocaleString('pl-PL')} t
                </span>
              </td>
              <td className="py-2.5 px-3 min-w-[140px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                  <span>{pct}%</span>
                  <span>{mine.capacityTons.toLocaleString('pl-PL')} t</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className={`h-full ${isEmpty ? 'bg-rose-500/50' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </td>
              <td className="py-2.5 px-3 font-mono text-stone-200">
                {mine.oreQualityPercent}%{' '}
                <span className="text-stone-500">/ {mine.oreQualityPercent}%</span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                £{mine.pricePerTon.toFixed(0)} / t
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
