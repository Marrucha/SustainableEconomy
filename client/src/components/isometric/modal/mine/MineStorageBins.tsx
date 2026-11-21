import React from 'react';
import type { BuildingState } from '../../types';
import { getIncomingSalesContracts, type WorldSupplierBuilding } from '../industrySupplyConfig';
import { createDefaultMineCapitalismState, type MineCapitalismState } from './mineCapitalismTypes';
import { MINE_DEPOSITS } from './mineTypes';

interface MineStorageBinsProps {
  buildingId?: string;
  buildingState: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const MineStorageBins: React.FC<MineStorageBinsProps> = ({
  buildingId = '',
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
}) => {
  const salesContracts = buildingId
    ? getIncomingSalesContracts(buildingId, allWorldBuildings, buildingsState)
    : [];
  const depKey = buildingState.mineDepositType;
  const depositInfo = depKey ? MINE_DEPOSITS[depKey] : undefined;
  const mine: MineCapitalismState =
    buildingState.mineCapitalism || createDefaultMineCapitalismState(depKey);
  const stockTons = buildingState.mineStock ?? 0;

  if (!depositInfo) {
    return (
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
        Najpierw wybierz złoże w zakładce <strong className="text-amber-300">🏭 Produkcja</strong>.
      </div>
    );
  }

  const pct = Math.min(100, Math.round((stockTons / Math.max(1, mine.capacityTons)) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
      {/* LEWA KOLUMNA: STAN HAŁDY */}
      <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">
            {depositInfo.icon} {depositInfo.name}
          </span>
          <span className="text-[11px] font-mono text-stone-400">{pct}%</span>
        </div>
        <div className="text-base font-mono font-bold text-stone-100">
          <span className={stockTons <= 0 ? 'text-rose-400' : 'text-emerald-300'}>
            {stockTons.toLocaleString('pl-PL')}
          </span>{' '}
          <span className="text-xs text-stone-400">
            / {mine.capacityTons.toLocaleString('pl-PL')} t
          </span>
        </div>
        <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>Jakość urobku: {mine.oreQualityPercent}%</span>
          <span className="font-mono text-amber-300 font-bold">
            £{mine.pricePerTon.toFixed(0)}/t
          </span>
        </div>
      </div>

      {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY SPRZEDAŻY */}
      <div className="bg-stone-900/90 rounded-xl p-3 border border-emerald-500/30 space-y-1.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            🤝 Zawarte Kontrakty Sprzedaży
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Aktywne: <strong className="text-emerald-300">{salesContracts.length}</strong>
          </span>
        </div>
        {salesContracts.length === 0 ? (
          <p className="text-[11px] text-stone-400 italic">
            W modelu zamkniętego rynku sprzedaż następuje wyłącznie na podstawie kontraktów zawartych przez miejskie zakłady (Elektrociepłownia, Huta, Cegielnia, Piekarnia) lub stoiska na Targowisku.
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
  );
};
