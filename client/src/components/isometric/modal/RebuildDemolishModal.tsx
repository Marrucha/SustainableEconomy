import React from 'react';
import type { PlacedBuilding, TerrainType } from '../types';
import { canDemolishBuildingWithPastureRules } from '../pastureTopology';

export type RebuildTarget =
  | { kind: 'building'; building: PlacedBuilding }
  | { kind: 'road'; x: number; y: number; roadType: 'curb' | 'seamless' | 'dirt'; orientation: 0 | 90 }
  | { kind: 'terrain'; x: number; y: number; terrainType: TerrainType };

interface RebuildDemolishModalProps {
  target: RebuildTarget;
  gold: number;
  placedBuildings?: PlacedBuilding[];
  onDemolishBuilding: (buildingId: string) => void;
  onDemolishRoad: (x: number, y: number) => void;
  onChangeRoadType: (x: number, y: number, newType: 'curb' | 'seamless' | 'dirt') => void;
  onRotateRoad: (x: number, y: number) => void;
  onRenovateBuilding: (building: PlacedBuilding) => void;
  onClearForest: (x: number, y: number) => void;
  onChangeTerrainType: (x: number, y: number, newType: TerrainType, cost: number) => void;
  onClose: () => void;
}

export const RebuildDemolishModal: React.FC<RebuildDemolishModalProps> = ({
  target,
  gold,
  placedBuildings = [],
  onDemolishBuilding,
  onDemolishRoad,
  onChangeRoadType,
  onRotateRoad,
  onRenovateBuilding,
  onClearForest,
  onChangeTerrainType,
  onClose,
}) => {
  const isBuilding = target.kind === 'building';
  const isRoad = target.kind === 'road';
  const isTerrain = target.kind === 'terrain';

  const demolishValidation = isBuilding
    ? canDemolishBuildingWithPastureRules(target.building, placedBuildings)
    : { allowed: true };

  const title = isBuilding
    ? target.building.name
    : isRoad
    ? 'Odcinek Drogi'
    : target.terrainType === 'grass'
    ? 'Niezabudowana Działka'
    : 'Drzewostan Leśny';

  const isTownHall = isBuilding && target.building.typeId === 'town_hall';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-stone-900/95 border border-red-500/40 rounded-3xl p-6 shadow-2xl text-stone-200 font-sans flex flex-col space-y-4">
        {/* NAGŁÓWEK */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Menu Inżynieryjne • PPM
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {isBuilding
                  ? `Działka: ${target.building.sizeX}x${target.building.sizeY}`
                  : `Działka: [${target.x}, ${target.y}]`}
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-stone-100 mt-1">
              Wyburzenie lub Przebudowa / Remont
            </h2>
            <p className="text-xs text-amber-300/80 font-mono mt-0.5">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. SEKCJA PRZEBUDOWY I REMONTU */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider">
            🛠️ Opcje Przebudowy i Remontu
          </label>

          {isBuilding && (
            <div className="space-y-2">
              <button
                onClick={() => onRenovateBuilding(target.building)}
                className="w-full p-3 rounded-2xl bg-stone-800/60 hover:bg-stone-700/60 border border-amber-500/40 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-amber-200">🔨 Remont Generalny i Modernizacja</p>
                  <p className="text-[11px] text-stone-400">
                    Otwórz pełny pulpit zarządzania, standardu i zasilania obiektu
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">Otwórz ›</span>
              </button>
            </div>
          )}

          {isRoad && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'curb', label: 'Bruk Miejski', sub: 'Z krawężnikiem' },
                  { id: 'seamless', label: 'Bruk Granitowy', sub: 'Bez krawężnika' },
                  { id: 'dirt', label: 'Droga Ziemna', sub: 'Trakt polny' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onChangeRoadType(target.x, target.y, r.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      target.roadType === r.id
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                        : 'bg-stone-800/50 border-stone-700/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <p className="text-xs">{r.label}</p>
                    <p className="text-[9px] text-stone-400 mt-0.5">{r.sub}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => onRotateRoad(target.x, target.y)}
                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-mono font-bold text-stone-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>🔄 Zmień kierunek traktu (Obrót 90°)</span>
              </button>
            </div>
          )}

          {isTerrain && (
            <div className="space-y-2">
              <p className="text-[11px] text-stone-400">Zmień szatę roślinną parceli:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'forest_oak', label: 'Dęby', icon: '🌳', cost: 20 },
                  { id: 'forest_pine', label: 'Sosny', icon: '🌲', cost: 20 },
                  { id: 'forest_grove', label: 'Zagajnik', icon: '🌿', cost: 15 },
                ].map((t) => (
                  <button
                    key={t.id}
                    disabled={target.terrainType === t.id || gold < t.cost}
                    onClick={() => onChangeTerrainType(target.x, target.y, t.id as any, -t.cost)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      target.terrainType === t.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-stone-800/50 border-stone-700/60 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <span className="text-base block">{t.icon}</span>
                    <span className="text-xs block mt-0.5">{t.label}</span>
                    <span className="text-[10px] text-amber-300 font-mono block">£ {t.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. SEKCJA WYBURZENIA / ROZBIÓRKI */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider">
            🗑️ Wyburzenie i Rozbiórka
          </label>

          {isBuilding && (
            <div>
              {isTownHall ? (
                <div className="p-3 bg-stone-800/40 rounded-xl border border-stone-800 text-stone-400 text-xs font-mono">
                  🏛️ Ratusz Miejski stanowi siedzibę Magistratu i jest obiektem nienaruszalnym.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onDemolishBuilding(target.building.id)}
                    disabled={!demolishValidation.allowed}
                    className={`w-full py-3 px-4 border text-xs font-bold rounded-2xl transition-all flex items-center justify-between ${
                      demolishValidation.allowed
                        ? 'bg-red-950/50 hover:bg-red-900 border-red-700/60 text-red-100 cursor-pointer'
                        : 'bg-stone-800/60 border-stone-700/50 text-stone-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🧨</span>
                      <span>Wyburz budynek (Rozbiórka murów)</span>
                    </span>
                    <span className="font-mono text-emerald-400">
                      +£ {Math.floor(target.building.cost * 0.5)} zwrotu
                    </span>
                  </button>
                  {!demolishValidation.allowed && (
                    <div className="p-2.5 bg-amber-950/50 border border-amber-600/50 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                      <span className="text-sm shrink-0">⚠️</span>
                      <span>{demolishValidation.reason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isRoad && (
            <button
              onClick={() => onDemolishRoad(target.x, target.y)}
              className="w-full py-3 px-4 bg-red-950/50 hover:bg-red-900 border border-red-700/60 text-red-100 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>⛏️</span>
                <span>Rozbierz nawierzchnię drogi (Powrót do trawy)</span>
              </span>
              <span className="font-mono text-emerald-400">
                +£ {target.roadType === 'dirt' ? 8 : 25} zwrotu
              </span>
            </button>
          )}

          {isTerrain && target.terrainType !== 'grass' && (
            <button
              onClick={() => onClearForest(target.x, target.y)}
              className="w-full py-3 px-4 bg-amber-950/40 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>🪓</span>
                <span>Wycinka drzew i karczowanie parceli</span>
              </span>
              <span className="font-mono text-emerald-400">+£ 15 za drewno</span>
            </button>
          )}
        </div>

        {/* STOPKA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
