import React, { useState } from 'react';
import { isBuildingAllowedOnMap, type MapType } from './mapConfig';
import type { BuildingCatalogItem, BuildingCategory } from './types';

interface BuildToolbarProps {
  catalog: BuildingCatalogItem[];
  activeCategory: BuildingCategory | 'Wszystkie';
  selectedType: BuildingCatalogItem | null;
  gold: number;
  currentMap: MapType;
  isBuildMode: boolean;
  isDemolishMode: boolean;
  onToggleBuildMode: () => void;
  onToggleDemolishMode: () => void;
  onSelectCategory: (category: BuildingCategory | 'Wszystkie') => void;
  onSelectType: (item: BuildingCatalogItem | null) => void;
}

const PUBLIC_TYPE_IDS = new Set([
  'town_hall',
  'trade_school',
  'university',
  'oak',
  'road_curb',
  'road_seamless',
  'road_dirt',
]);

const CRAFT_TYPE_IDS = new Set([
  'bakery',
  'blacksmith',
  'shoemaker',
  'butcher',
  'jeweler',
  'watchmaker',
  'meat_shop',
  'grocery_shop',
  'clothing_shop',
  'building_depot',
  'transport_company',
  'tenement_workers',
  'tenement_middle',
  'tenement_elite',
]);

export const BuildToolbar: React.FC<BuildToolbarProps> = ({
  catalog,
  selectedType,
  gold,
  currentMap,
  isBuildMode,
  isDemolishMode,
  onToggleBuildMode: _onToggleBuildMode,
  onToggleDemolishMode,
  onSelectType,
}) => {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({
    private: true,
    industrial: true,
    craft: true,
    public: false,
  });

  const toggleBranch = (key: string) =>
    setOpenBranches((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!isBuildMode) {
    return null;
  }

  const allowed = catalog.filter((item) => isBuildingAllowedOnMap(item.typeId, currentMap));
  const publicItems = allowed.filter((item) => PUBLIC_TYPE_IDS.has(item.typeId));
  const privateItems = allowed.filter((item) => !PUBLIC_TYPE_IDS.has(item.typeId));
  const craftItems = privateItems.filter((item) => CRAFT_TYPE_IDS.has(item.typeId));
  const industrialItems = privateItems.filter((item) => !CRAFT_TYPE_IDS.has(item.typeId));

  const renderItemRow = (item: BuildingCatalogItem) => {
    const isSelected = selectedType?.typeId === item.typeId;
    const canAfford = gold >= item.cost;
    return (
      <button
        key={item.typeId}
        type="button"
        onClick={() => onSelectType(isSelected ? null : item)}
        style={{ padding: '5px 10px' }}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
          isSelected
            ? 'bg-amber-500/25 border-amber-400 text-amber-100 font-bold'
            : 'bg-stone-950/60 border-stone-800 hover:bg-stone-800/80 text-stone-200'
        } ${!canAfford ? 'opacity-50' : ''}`}
      >
        <span className="truncate">{item.name}</span>
        <span className="font-mono text-[11px] font-bold text-amber-300 flex-shrink-0">
          £{item.cost.toLocaleString()}
        </span>
      </button>
    );
  };

  return (
    <aside className="w-72 max-h-[68vh] bg-stone-900/95 border border-amber-600/40 rounded-2xl p-2.5 backdrop-blur-md shadow-2xl flex flex-col gap-2">
      {/* Nagłówek bocznego menu */}
      <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2">
        <span className="text-base">🏗️</span>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Budowa ({currentMap === 'rural' ? 'Wieś' : 'Miasto'})
        </span>
      </div>

      {/* Przycisk burzenia */}
      <button
        type="button"
        onClick={onToggleDemolishMode}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
          isDemolishMode
            ? 'bg-rose-900/90 border-rose-400 text-rose-100 animate-pulse'
            : 'bg-stone-800 hover:bg-rose-950/40 border-rose-800/60 text-rose-300'
        }`}
      >
        <span>🔨</span>
        <span>{isDemolishMode ? 'Burzenie: WŁĄCZONE' : 'Burzenie'}</span>
      </button>

      {/* Drzewko kategorii */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
        {/* GAŁĄŹ 1: BUDYNKI PRYWATNE */}
        <div className="rounded-xl bg-stone-950/50 border border-stone-800 p-2 space-y-1.5">
          <button
            type="button"
            onClick={() => toggleBranch('private')}
            className="w-full flex items-center justify-between font-bold text-amber-200 cursor-pointer"
          >
            <span>🏢 Budynki Prywatne ({privateItems.length})</span>
            <span className="text-[10px] text-stone-400">{openBranches.private ? '▼' : '▶'}</span>
          </button>

          {openBranches.private && (
            <div
              style={{ marginLeft: 12, paddingLeft: 12, marginTop: 6 }}
              className="space-y-2 border-l-2 border-stone-600/80"
            >
              {/* Podgałąź: Zakłady przemysłowe */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleBranch('industrial')}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-amber-300/90 cursor-pointer"
                >
                  <span>
                    🏭 {currentMap === 'rural' ? 'Rolnictwo i Kopalnie' : 'Zakłady Przemysłowe'} (
                    {industrialItems.length})
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {openBranches.industrial ? '▼' : '▶'}
                  </span>
                </button>
                {openBranches.industrial && (
                  <div
                    style={{ marginLeft: 12, paddingLeft: 12, marginTop: 4 }}
                    className="space-y-1 border-l border-stone-600/70"
                  >
                    {industrialItems.map(renderItemRow)}
                  </div>
                )}
              </div>

              {/* Podgałąź: Rzemiosło */}
              {craftItems.length > 0 && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleBranch('craft')}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-emerald-300/90 cursor-pointer"
                  >
                    <span>🛠️ Rzemiosło i Handel ({craftItems.length})</span>
                    <span className="text-[10px] text-stone-500">
                      {openBranches.craft ? '▼' : '▶'}
                    </span>
                  </button>
                  {openBranches.craft && (
                    <div
                      style={{ marginLeft: 12, paddingLeft: 12, marginTop: 4 }}
                      className="space-y-1 border-l border-stone-600/70"
                    >
                      {craftItems.map(renderItemRow)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* GAŁĄŹ 2: BUDYNKI PUBLICZNE */}
        <div className="rounded-xl bg-stone-950/50 border border-stone-800 p-2 space-y-1.5">
          <button
            type="button"
            onClick={() => toggleBranch('public')}
            className="w-full flex items-center justify-between font-bold text-sky-200 cursor-pointer"
          >
            <span>🏛️ Budynki Publiczne ({publicItems.length})</span>
            <span className="text-[10px] text-stone-400">{openBranches.public ? '▼' : '▶'}</span>
          </button>

          {openBranches.public && (
            <div
              style={{ marginLeft: 12, paddingLeft: 12, marginTop: 6 }}
              className="space-y-1 border-l-2 border-stone-600/80"
            >
              {publicItems.map(renderItemRow)}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
