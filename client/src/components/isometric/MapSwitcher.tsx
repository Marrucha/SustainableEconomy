import React from 'react';
import type { MapType } from './mapConfig';

interface MapSwitcherProps {
  currentMap: MapType;
  onChangeMap: (map: MapType) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ currentMap, onChangeMap }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-stone-900/95 border-2 border-amber-600/60 rounded-full p-1 backdrop-blur-md shadow-2xl">
      <button
        onClick={() => onChangeMap('city')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full font-serif font-bold text-xs tracking-wider transition-all cursor-pointer ${
          currentMap === 'city'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg font-extrabold scale-105'
            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
        }`}
      >
        <span className="text-base">🏙️</span>
        <span>WIDOK MIASTA</span>
      </button>

      <button
        onClick={() => onChangeMap('rural')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full font-serif font-bold text-xs tracking-wider transition-all cursor-pointer ${
          currentMap === 'rural'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 shadow-lg font-extrabold scale-105'
            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
        }`}
      >
        <span className="text-base">🌾</span>
        <span>WIDOK WIEJSKI</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950/40 text-emerald-200">
          2x siatka
        </span>
      </button>
    </div>
  );
};
