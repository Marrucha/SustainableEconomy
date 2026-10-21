import React from 'react';
import type { TerrainType } from '../types';

interface TerrainModalProps {
  tileCoord: { x: number; y: number };
  currentType: TerrainType;
  gold: number;
  onSetTerrain: (type: TerrainType, goldDelta: number) => void;
  onClose: () => void;
}

export const TerrainModal: React.FC<TerrainModalProps> = ({
  tileCoord,
  currentType,
  gold,
  onSetTerrain,
  onClose,
}) => {
  const isForest =
    currentType === 'forest_oak' ||
    currentType === 'forest_pine' ||
    currentType === 'forest_grove';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-stone-900/95 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-stone-200 font-sans flex flex-col space-y-4">
        {/* NAGŁÓWEK */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gospodarka Terenem • Parcela
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Współrzędne: [{tileCoord.x}, {tileCoord.y}]
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-emerald-100 mt-1">
              {isForest ? 'Obszar Leśny' : 'Trawnik / Wolna Parcela'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* STATUS OBECNY */}
        <div className="p-3 bg-stone-800/40 rounded-xl border border-stone-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {currentType === 'forest_oak'
                ? '🌳'
                : currentType === 'forest_pine'
                ? '🌲'
                : currentType === 'forest_grove'
                ? '🌿'
                : '🌱'}
            </span>
            <div>
              <p className="text-xs font-bold text-stone-100">
                {currentType === 'forest_oak'
                  ? 'Gęsta Dąbrowa Wiktoriańska'
                  : currentType === 'forest_pine'
                  ? 'Bór Iglasty (Sosny 3-4 piętra)'
                  : currentType === 'forest_grove'
                  ? 'Zagajnik Brzozowo-Dębowy'
                  : 'Niezabudowana Łąka / Trawnik'}
              </p>
              <p className="text-[11px] text-stone-400">
                {isForest
                  ? 'Poprawia mikroklimat i pochłania sadzę'
                  : 'Gotowa pod zabudowę lub zalesienie'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            AKTYWNE
          </span>
        </div>

        {/* WYBÓR ZALESIENIA */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Zmień zagospodarowanie działki:
          </label>

          {/* 1. LAS DĘBOWY */}
          <button
            disabled={currentType === 'forest_oak' || gold < 20}
            onClick={() => onSetTerrain('forest_oak', -20)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              currentType === 'forest_oak'
                ? 'bg-emerald-950/40 border-emerald-500 opacity-60 cursor-default'
                : 'bg-stone-800/60 border-stone-700/70 hover:bg-stone-700/60 text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌳</span>
              <div>
                <p className="text-xs font-bold text-stone-100">Las Dębowy (Dąbrowa)</p>
                <p className="text-[11px] text-stone-400">Rozłożyste korony starych dębów</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">£ 20</span>
          </button>

          {/* 2. BÓR IGLASTY */}
          <button
            disabled={currentType === 'forest_pine' || gold < 20}
            onClick={() => onSetTerrain('forest_pine', -20)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              currentType === 'forest_pine'
                ? 'bg-emerald-950/40 border-emerald-500 opacity-60 cursor-default'
                : 'bg-stone-800/60 border-stone-700/70 hover:bg-stone-700/60 text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌲</span>
              <div>
                <p className="text-xs font-bold text-stone-100">Bór Sosnowy (Wysokie Sosny)</p>
                <p className="text-[11px] text-stone-400">Wysokość koron sięga 3-4 piętra kamienicy</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">£ 20</span>
          </button>

          {/* 3. ZAGAJNIK */}
          <button
            disabled={currentType === 'forest_grove' || gold < 15}
            onClick={() => onSetTerrain('forest_grove', -15)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              currentType === 'forest_grove'
                ? 'bg-emerald-950/40 border-emerald-500 opacity-60 cursor-default'
                : 'bg-stone-800/60 border-stone-700/70 hover:bg-stone-700/60 text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌿</span>
              <div>
                <p className="text-xs font-bold text-stone-100">Zagajnik Mieszany (Brzozy i Dęby)</p>
                <p className="text-[11px] text-stone-400">Młode drzewa, bogate runo leśne i paprocie</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">£ 15</span>
          </button>
        </div>

        {/* DOLNA AKCJA: WYCINKA LASU / PRZYWRÓCENIE TRAWNIKA */}
        {isForest && (
          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={() => onSetTerrain('grass', 15)}
              className="w-full py-2.5 px-4 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 text-amber-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🪓</span>
              <span>Wycinka Lasu (Sprzedaż Drewna: +£ 15) i powrót do Trawnika</span>
            </button>
          </div>
        )}

        {/* STOPKA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
