import React, { useState } from 'react';
import type { BuildingState } from '../../types';
import { loadGameParameters } from '../../admin/gameParameters';
import { BakeryProductsTab } from './BakeryProductsTab';
import { BakeryRecipesTab } from './BakeryRecipesTab';
import {
  BAKERY_PRODUCTS_CONFIG,
  createDefaultBakeryState,
  type BakeryProductTarget,
} from './bakeryTypes';

interface BakeryProductsSectionProps {
  buildingState: BuildingState;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const BakeryProductsSection: React.FC<BakeryProductsSectionProps> = ({
  buildingState,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'recipes'>('inventory');
  const bakeryState = buildingState.bakeryState || createDefaultBakeryState();

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSubTab('inventory')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'inventory'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          📦 Stany magazynowe
        </button>
        <button
          type="button"
          onClick={() => setSubTab('recipes')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'recipes'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          📜 Przepisy
        </button>
      </div>
      {subTab === 'inventory' ? (
        <BakeryProductsTab buildingState={buildingState} />
      ) : (
        <BakeryRecipesTab
          state={bakeryState}
          baseDailyFlourKg={loadGameParameters().bakeryBaseDailyFlourKg ?? 120}
          onSelectRecipe={(target: BakeryProductTarget) => {
            onUpdateState({
              bakeryState: {
                ...bakeryState,
                productTarget: target,
                breadPricePerKg: BAKERY_PRODUCTS_CONFIG[target].defaultPricePerKg,
              },
            });
          }}
        />
      )}
    </div>
  );
};
