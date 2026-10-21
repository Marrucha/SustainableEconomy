import React from 'react';
import type { BuildingCatalogItem } from './types';

interface BuildCursorBannerProps {
  selectedType: BuildingCatalogItem;
  buildRotation: 0 | 90;
  onRotate: () => void;
}

export const BuildCursorBanner: React.FC<BuildCursorBannerProps> = ({
  selectedType,
  buildRotation,
  onRotate,
}) => {
  return (
    <div className="absolute top-4 right-4 pointer-events-none bg-amber-950/90 border border-amber-500/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl text-amber-100 flex items-center gap-4 animate-fade-in z-30">
      <div>
        <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
          Tryb Budowania {selectedType.isSquare ? '(Kwadrat 1:1)' : `(Orientacja: ${buildRotation}°)`}
        </span>
        <p className="font-bold text-sm">{selectedType.name}</p>
        <p className="text-xs text-amber-200">
          Wymiary:{' '}
          {selectedType.isSquare
            ? `${selectedType.defaultSizeX}x${selectedType.defaultSizeY}`
            : buildRotation === 0
            ? `${selectedType.defaultSizeX}x${selectedType.defaultSizeY}`
            : `${selectedType.defaultSizeY}x${selectedType.defaultSizeX}`}{' '}
          kratek • Koszt: £ {selectedType.cost.toLocaleString('en-US')}
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
