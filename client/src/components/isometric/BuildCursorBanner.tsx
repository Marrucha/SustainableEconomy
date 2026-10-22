import React from 'react';
import type { BuildingCatalogItem } from './types';
import { getBuildingGridDimensions, type MapType } from './mapConfig';

interface BuildCursorBannerProps {
  selectedType: BuildingCatalogItem;
  buildRotation: 0 | 90;
  currentMap?: MapType;
  onRotate: () => void;
}

export const BuildCursorBanner: React.FC<BuildCursorBannerProps> = ({
  selectedType,
  buildRotation,
  currentMap = 'city',
  onRotate,
}) => {
  const { sizeX, sizeY } = getBuildingGridDimensions(
    selectedType,
    currentMap,
    buildRotation
  );

  return (
    <div className="absolute top-4 right-4 pointer-events-none bg-amber-950/90 border border-amber-500/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl text-amber-100 flex items-center gap-4 animate-fade-in z-30">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
            Tryb Budowania {selectedType.isSquare ? '(Kwadrat)' : `(Orientacja: ${buildRotation}°)`}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200 border border-amber-600/40">
            {currentMap === 'rural' ? '🌾 Wieś (2x siatka)' : '🏙️ Miasto'}
          </span>
        </div>
        <p className="font-bold text-sm mt-0.5">{selectedType.name}</p>
        <p className="text-xs text-amber-200">
          Wymiary na siatce: <span className="font-mono font-bold text-white">{sizeX}x{sizeY}</span> kratek • Koszt: £ {selectedType.cost.toLocaleString('en-US')}
        </p>
      </div>
      {!selectedType.isSquare && (
        <button
          onClick={onRotate}
          className="pointer-events-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Obróć [R]
        </button>
      )}
    </div>
  );
};
