import React from 'react';
import { CATEGORIES } from './catalog';
import type { BuildingCatalogItem, BuildingCategory } from './types';

interface BuildToolbarProps {
  catalog: BuildingCatalogItem[];
  activeCategory: BuildingCategory | 'Wszystkie';
  selectedType: BuildingCatalogItem | null;
  gold: number;
  isBuildMode: boolean;
  onToggleBuildMode: () => void;
  onSelectCategory: (category: BuildingCategory | 'Wszystkie') => void;
  onSelectType: (item: BuildingCatalogItem | null) => void;
}

export const BuildToolbar: React.FC<BuildToolbarProps> = ({
  catalog,
  activeCategory,
  selectedType,
  gold,
  isBuildMode,
  onToggleBuildMode,
  onSelectCategory,
  onSelectType,
}) => {
  // Gdy tryb budowlany jest zwinięty: wyświetl tylko stylizowaną ikonkę dźwigu
  if (!isBuildMode) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={onToggleBuildMode}
          title="Włącz tryb budowlany"
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-stone-900/95 hover:bg-stone-800 border-2 border-amber-500/80 hover:border-amber-400 rounded-full shadow-2xl backdrop-blur-md text-amber-300 font-bold text-xs tracking-wide transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🏗️</span>
          <span>Tryb budowy</span>
        </button>
      </div>
    );
  }

  const filteredCatalog =
    activeCategory === 'Wszystkie'
      ? catalog
      : catalog.filter((item) => item.category === activeCategory);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 border border-amber-600/40 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-2.5 max-w-[95vw]">
      {/* NAGŁÓWEK Z IKONĄ DŹWIGU I PRZYCISKIEM ZWIJANIA */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏗️</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Tryb budowlany
          </span>
        </div>
        <button
          onClick={onToggleBuildMode}
          title="Zwiń do ikonki dźwigu"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-600/20 text-stone-400 hover:text-amber-300 border border-stone-700/80 text-[11px] font-semibold cursor-pointer transition-all"
        >
          <span>Zwiń menu</span>
          <span className="text-sm">✕</span>
        </button>
      </div>

      {/* ZAKŁADKI KATEGORII */}
      <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white'
            }`}
          >
            {cat === 'Wszystkie' ? '🌐 Wszystkie' : cat}
          </button>
        ))}
      </div>

      {/* LISTA BUDYNKÓW W KATEGORII */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {filteredCatalog.map((item) => {
          const isSelected = selectedType?.typeId === item.typeId;
          const canAfford = gold >= item.cost;
          return (
            <button
              key={item.typeId}
              onClick={() => {
                if (isSelected) onSelectType(null);
                else onSelectType(item);
              }}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer min-w-[155px] shrink-0 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-lg scale-105'
                  : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-700/60 text-stone-300'
              } ${!canAfford ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold truncate max-w-[95px]">
                  {item.category}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {item.defaultSizeX}x{item.defaultSizeY}
                </span>
              </div>
              <span className="font-bold text-xs mt-1 truncate max-w-[145px]">{item.name}</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400 mt-0.5">
                £ {item.cost.toLocaleString('en-US')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
