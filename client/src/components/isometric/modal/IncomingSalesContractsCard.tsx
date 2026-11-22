import React from 'react';
import type { BuildingState } from '../types';
import { getIncomingSalesContracts, type WorldSupplierBuilding } from './industrySupplyConfig';

interface IncomingSalesContractsCardProps {
  buildingId?: string;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
}

export const IncomingSalesContractsCard: React.FC<IncomingSalesContractsCardProps> = ({
  buildingId,
  allWorldBuildings,
  buildingsState,
}) => {
  const salesContracts = buildingId
    ? getIncomingSalesContracts(buildingId, allWorldBuildings, buildingsState)
    : [];

  return (
    <div className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-500/30 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
          📜 Zawarte Kontrakty Sprzedaży
        </h4>
        <span className="text-[10px] font-mono text-stone-400">
          Aktywne: <strong className="text-emerald-300">{salesContracts.length}</strong>
        </span>
      </div>

      {salesContracts.length === 0 ? (
        <p className="text-[11px] text-stone-400 italic">
          Brak przychodzących kontraktów od odbiorców.
        </p>
      ) : (
        <div className="space-y-1.5">
          {salesContracts.map((sc) => (
            <div
              key={sc.id}
              className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]"
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
                <span className="font-mono font-bold text-yellow-300">{sc.monthlyQtyLabel}</span> •{' '}
                {sc.contractLabel}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
