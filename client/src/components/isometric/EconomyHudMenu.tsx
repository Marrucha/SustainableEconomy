import React, { useState } from 'react';
import type { BuildingState } from './types';
import type { WorldSupplierBuilding } from './modal/industrySupplyConfig';
import { FinanceModal } from './modal/FinanceModal';

interface EconomyHudMenuProps {
  gold: number;
  isBuildMode: boolean;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onToggleBuildMode: () => void;
  onNavigateToBuilding?: (building: WorldSupplierBuilding) => void;
  buildTreeSlot?: React.ReactNode;
}

export const EconomyHudMenu: React.FC<EconomyHudMenuProps> = ({
  gold,
  isBuildMode,
  allWorldBuildings,
  buildingsState,
  onToggleBuildMode,
  onNavigateToBuilding,
  buildTreeSlot,
}) => {
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-start gap-1.5 select-none">
        <button
          type="button"
          onClick={onToggleBuildMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 backdrop-blur-md shadow-xl font-bold text-xs tracking-wide transition-all cursor-pointer w-36 ${
            isBuildMode
              ? 'bg-amber-500 text-stone-950 border-amber-300'
              : 'bg-stone-900/95 hover:bg-stone-800 text-amber-300 border-amber-600/60'
          }`}
        >
          <span className="text-base">🏗️</span>
          <span>Budowa</span>
        </button>

        {buildTreeSlot && (
          <div className="ml-3 pl-2.5 border-l-2 border-amber-500/50">
            {buildTreeSlot}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsFinanceOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/95 hover:bg-stone-800 border-2 border-emerald-600/60 hover:border-emerald-400 text-emerald-300 backdrop-blur-md shadow-xl font-bold text-xs tracking-wide transition-all cursor-pointer w-36"
        >
          <span className="text-base">💰</span>
          <span>Finanse</span>
        </button>
      </div>

      {isFinanceOpen && (
        <FinanceModal
          gold={gold}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onClose={() => setIsFinanceOpen(false)}
          onNavigateToBuilding={onNavigateToBuilding}
        />
      )}
    </>
  );
};
