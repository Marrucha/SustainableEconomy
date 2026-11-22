import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import type { UseGameClockReturn } from '../clock/useGameClock';
import { formatGameDate } from '../clock/gameClockTypes';
import { FRUITS_CONFIG } from './orchard/orchardTypes';
import type { ProductionChecklistResult } from './productionChecklist';
import { ProductionChecklistModal } from './BusinessSummaryTab';

interface BuildingModalHeaderProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  isFarm?: boolean;
  isOrchard: boolean;
  isMill?: boolean;
  isBakery?: boolean;
  isMine?: boolean;
  checklist?: ProductionChecklistResult;
  onGoToSummary?: () => void;
  clock?: UseGameClockReturn;
  onClose: () => void;
}

export const BuildingModalHeader: React.FC<BuildingModalHeaderProps> = ({
  building,
  buildingState,
  isOrchard,
  checklist,
  onGoToSummary,
  clock,
  onClose,
}) => {
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const firstWheatFarmer =
    building.typeId === 'wheat_farm'
      ? (buildingState.farmCapitalism?.crew || []).find(
          (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
        )
      : undefined;
  const firstFarmerSurname = firstWheatFarmer
    ? firstWheatFarmer.name.trim().split(/\s+/).slice(-1)[0]
    : '';

  const displayName =
    building.typeId === 'livestock_farm' && building.name === 'Farma Bydła i Owiec'
      ? 'Farma Hodowlana'
      : building.typeId === 'wheat_farm' && building.name === 'Wielka Farma Zbożowa'
      ? firstFarmerSurname
        ? `Farma zbożowa ${firstFarmerSurname}`
        : 'Farma Zbożowa'
      : building.name;

  const fullTitle =
    isOrchard && buildingState.orchardState?.isFruitLocked && buildingState.orchardState?.fruitType
      ? `${displayName} • ${FRUITS_CONFIG[buildingState.orchardState.fruitType]?.name || ''}`
      : displayName;

  const hasActiveWorkingHorses = (buildingState.ownedHorses || []).some((h) => !h.isDeceased);
  const isLivestockNoFeed =
    building.typeId === 'livestock_farm' &&
    (buildingState.livestockState?.supplies?.feedGrainKg ?? 0) <= 0;
  const isWorkingHorseNoFeed =
    hasActiveWorkingHorses && (buildingState.horseFeedStockKg ?? 0) <= 0;
  const isNoFeed = isLivestockNoFeed || isWorkingHorseNoFeed;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2 flex-shrink-0">
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        <span className="text-xs tracking-wider uppercase font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shrink-0">
          Epoka 1 • {clock ? formatGameDate(clock.date) : '1880'}
        </span>
        <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-100 truncate">
          {fullTitle}
        </h2>
        {checklist &&
          (checklist.allPassed ? (
            <span
              title="Wszystkie warunki produkcji spełnione"
              className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0"
            >
              ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowChecklistModal(true)}
              title="Kliknij, aby zobaczyć niespełnione warunki produkcji"
              className="w-6 h-6 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500 text-rose-300 flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer transition-colors"
            >
              ✕
            </button>
          ))}
        {isNoFeed && (
          <span
            title="Brak paszy w magazynie — konie tracą zdrowie!"
            className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-200 text-[11px] font-bold flex items-center gap-1 shrink-0"
          >
            <span>🌾</span>
            <span>Brak paszy</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {clock && building.typeId !== 'trade_ship' && (
          <div className="flex items-center gap-1.5 font-mono mr-1">
            <button
              onClick={clock.togglePlay}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-xs font-bold cursor-pointer transition-colors"
            >
              {clock.isPlaying ? '⏸️' : '▶️'}
            </button>
            {[1, 2, 5].map((sp) => (
              <button
                key={sp}
                onClick={() => clock.setSpeed(sp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  clock.speed === sp
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white bg-stone-800/80 border border-stone-700'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
      {showChecklistModal && checklist && (
        <ProductionChecklistModal
          title={fullTitle}
          checklist={checklist}
          onClose={() => setShowChecklistModal(false)}
          onGoToSummary={() => {
            setShowChecklistModal(false);
            onGoToSummary?.();
          }}
        />
      )}
    </div>
  );
};
