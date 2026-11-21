import type React from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { useMineMonthlyTick } from './useMineMonthlyTick';
import { useWoodcutterMonthlyTick } from './useWoodcutterMonthlyTick';
import { useFarmAnnualTick } from './useFarmAnnualTick';
import { useMillWorldTick } from './useMillWorldTick';
import { useBakeryWorldTick } from './useBakeryWorldTick';
import { useCoalContractsWorldTick } from './useCoalContractsWorldTick';
import { useCityHousingGrowth } from './useCityHousingGrowth';

interface UseWorldSimulationTicksParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  autoPlaceCityBuildings: (specs: { typeId: string; name: string; sizeX: number; sizeY: number; cost: number }[]) => void;
}

/**
 * Zbiorczy hook uruchamiający miesięczne i roczne cykle symulacji świata (kopalnie, wyrąb, farmy zbożowe, rozwój miasta).
 */
export function useWorldSimulationTicks({
  clockDate,
  placedBuildings,
  cityBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
  autoPlaceCityBuildings,
}: UseWorldSimulationTicksParams) {
  useMineMonthlyTick({ clockDate, placedBuildings, buildingsState, setBuildingsState, setGold });
  useWoodcutterMonthlyTick({ clockDate, placedBuildings, buildingsState, setBuildingsState });
  useFarmAnnualTick({ clockDate, placedBuildings, buildingsState, setBuildingsState, setGold });
  useMillWorldTick({ clockDate, cityBuildings, buildingsState, setBuildingsState, setGold });
  useBakeryWorldTick({ clockDate, cityBuildings, buildingsState, setBuildingsState, setGold });
  useCoalContractsWorldTick({
    clockDate,
    allBuildings: [...placedBuildings, ...cityBuildings],
    buildingsState,
    setBuildingsState,
    setGold,
  });
  useCityHousingGrowth({ cityBuildings, buildingsState, setBuildingsState, autoPlaceCityBuildings });
}
