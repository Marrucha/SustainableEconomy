import React from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import type { UseGameClockReturn } from '../clock/useGameClock';
import { formatGameDate } from '../clock/gameClockTypes';
import { checkIsProductionReady, createDefaultFarmCapitalismState } from './farmGridTypes';
import { FRUITS_CONFIG } from './orchard/orchardTypes';
import { checkIsMillProductionReady, createDefaultMillState } from './mill/millTypes';
import { checkIsBakeryProductionReady, createDefaultBakeryState } from './bakery/bakeryTypes';
import { checkIsMineProductionReady, createDefaultMineCapitalismState } from './mine/mineCapitalismTypes';

interface BuildingModalHeaderProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  isFarm: boolean;
  isOrchard: boolean;
  isMill: boolean;
  isBakery?: boolean;
  isMine?: boolean;
  clock?: UseGameClockReturn;
  onClose: () => void;
}

export const BuildingModalHeader: React.FC<BuildingModalHeaderProps> = ({
  building,
  buildingState,
  isFarm,
  isOrchard,
  isMill,
  isBakery = false,
  isMine = false,
  clock,
  onClose,
}) => {
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

  const renderStatusBadge = () => {
    if (isFarm) {
      const rawCap = buildingState.farmCapitalism;
      const farmCap =
        rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
          ? rawCap
          : createDefaultFarmCapitalismState();
      const farmReady = checkIsProductionReady(farmCap).isReady;
      return (
        <span
          title={farmReady ? 'Przepływ aktywny' : 'Brak pełnej obsady'}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
            farmReady
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {farmReady ? '✓' : '✕'}
        </span>
      );
    }

    if (isMill) {
      const millState = buildingState.millState || createDefaultMillState();
      const millReady = checkIsMillProductionReady(
        millState,
        buildingState,
        building.sizeX * building.sizeY
      ).isReady;
      return (
        <span
          title={millReady ? 'Przemiał aktywny' : 'Brak obsady lub zasilania'}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
            millReady
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {millReady ? '✓' : '✕'}
        </span>
      );
    }

    if (isBakery) {
      const bakeryState = buildingState.bakeryState || createDefaultBakeryState();
      const bakeryReady = checkIsBakeryProductionReady(
        bakeryState,
        buildingState,
        building.sizeX * building.sizeY
      ).isReady;
      return (
        <span
          title={bakeryReady ? 'Wypiek aktywny' : 'Brak obsady, mąki lub zasilania'}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
            bakeryReady
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {bakeryReady ? '✓' : '✕'}
        </span>
      );
    }

    if (isMine) {
      const mineState =
        buildingState.mineCapitalism ||
        createDefaultMineCapitalismState(buildingState.mineDepositType);
      const mineReady = checkIsMineProductionReady(
        mineState,
        buildingState,
        building.sizeX * building.sizeY
      ).isReady;
      return (
        <span
          title={mineReady ? 'Wydobycie aktywne' : 'Brak obsady, zarządcy lub zasilania'}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
            mineReady
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {mineReady ? '✓' : '✕'}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2 flex-shrink-0">
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        <span className="text-xs tracking-wider uppercase font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shrink-0">
          Epoka 1 • {clock ? formatGameDate(clock.date) : '1880'}
        </span>
        <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-100 truncate">
          {fullTitle}
        </h2>
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
        {renderStatusBadge()}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
