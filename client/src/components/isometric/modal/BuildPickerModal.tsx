import React, { useState } from 'react';
import { CATALOG } from '../catalog';
import type { BuildingCatalogItem, BuildingCategory } from '../types';

interface BuildPickerModalProps {
  coord: { x: number; y: number };
  gold: number;
  onSelectAndBuild: (item: BuildingCatalogItem, rotation: 0 | 90) => void;
  onClose: () => void;
}

export const BuildPickerModal: React.FC<BuildPickerModalProps> = ({
  coord,
  gold,
  onSelectAndBuild,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<BuildingCategory | 'Wszystkie'>('Wszystkie');
  const [rotation, setRotation] = useState<0 | 90>(0);

  const categories: (BuildingCategory | 'Wszystkie')[] = [
    'Wszystkie',
    'Budynki rolnicze',
    'Budynki przemysłowe',
    'Budynki mieszkalne',
    'Budynki usługowe',
    'Elementy rozrywkowe',
  ];

  const filteredItems = CATALOG.filter(
    (c) => activeCategory === 'Wszystkie' || c.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-stone-900/95 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-stone-200 font-sans flex flex-col max-h-[85vh]">
        {/* NAGŁÓWEK */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Menu Budowlane • Epoka 1880
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Wybrana działka: [{coord.x}, {coord.y}]
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-amber-100 mt-1">
              Wybierz obiekt do wybudowania
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRotation((r) => (r === 0 ? 90 : 0))}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>🔄 Obrót:</span>
              <span className="text-amber-400">{rotation === 0 ? 'Domyślny (0°)' : 'Obrócony (90°)'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ZAKŁADKI KATEGORII */}
        <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-stone-800/80 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'bg-stone-800/50 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SIATKA OBIEKTÓW BUDOWLANYCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 overflow-y-auto flex-1 pr-1">
          {filteredItems.map((item) => {
            const canAfford = gold >= item.cost;
            const sizeX = rotation === 0 ? item.defaultSizeX : item.defaultSizeY;
            const sizeY = rotation === 0 ? item.defaultSizeY : item.defaultSizeX;

            return (
              <div
                key={item.typeId}
                onClick={() => {
                  if (canAfford) {
                    onSelectAndBuild(item, rotation);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  canAfford
                    ? 'bg-stone-800/50 hover:bg-amber-950/20 border-stone-700/70 hover:border-amber-500/60 shadow-sm'
                    : 'bg-stone-900/40 border-stone-800/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-100">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-700/70 text-stone-300">
                      {sizeX}x{sizeY} kratek
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-sans">{item.category}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-sm font-mono font-bold block ${
                      canAfford ? 'text-amber-400' : 'text-red-400'
                    }`}
                  >
                    £ {item.cost.toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mt-1 px-2.5 py-1 rounded-lg ${
                      canAfford
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    {canAfford ? 'Wybuduj' : 'Brak złota'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* STOPKA */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Dostępne złoto:</span>
            <span className="text-amber-300 font-bold">£ {gold.toLocaleString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};
