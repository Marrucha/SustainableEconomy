import React from 'react';
import type { MapType } from './mapConfig';

interface MapSwitcherProps {
  currentMap: MapType;
  onChangeMap: (map: MapType) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ currentMap, onChangeMap }) => {
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-stone-900/95 border-2 border-amber-600/60 rounded-full p-1 backdrop-blur-md shadow-2xl select-none">
      <button
        onClick={() => onChangeMap('world')}
        className={`flex items-center gap-2 px-5 py-1.5 rounded-full font-serif font-bold text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
          currentMap === 'world'
            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg font-extrabold'
            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
        }`}
      >
        <span className="text-base">🌍</span>
        <span>WIDOK ŚWIATA</span>
      </button>

      <button
        onClick={() => onChangeMap('city')}
        className={`flex flex-col items-center justify-center px-5 py-1 rounded-full font-serif font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap leading-tight ${
          currentMap === 'city'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg font-extrabold'
            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
        }`}
      >
        <span className="flex items-center gap-1.5 text-xs">
          <span className="text-sm">🏙️</span>
          <span>WIDOK MIASTA</span>
        </span>
        <span className={`text-[9px] tracking-[0.2em] ${currentMap === 'city' ? 'text-stone-900' : 'text-amber-300/80'}`}>
          LONDYN
        </span>
      </button>

      <button
        onClick={() => onChangeMap('rural')}
        className={`flex items-center gap-2 px-5 py-1.5 rounded-full font-serif font-bold text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
          currentMap === 'rural'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 shadow-lg font-extrabold'
            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
        }`}
      >
        <span className="text-base">🌾</span>
        <span>WIDOK WIEJSKI</span>
      </button>
    </div>
  );
};
