import { useEffect } from 'react';
import type { BuildingState, PlacedBuilding } from './types';
import { computeCityHousingStatus } from './cityAutoGrowth';

interface UseCityHousingGrowthParams {
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  autoPlaceCityBuildings: (
    specs: Array<{ typeId: string; name: string; sizeX: number; sizeY: number; cost: number }>
  ) => void;
}

export function useCityHousingGrowth({
  cityBuildings,
  buildingsState,
  autoPlaceCityBuildings,
}: UseCityHousingGrowthParams) {
  useEffect(() => {
    const status = computeCityHousingStatus(cityBuildings, buildingsState);
    const toBuild: Array<{
      typeId: string;
      name: string;
      sizeX: number;
      sizeY: number;
      cost: number;
    }> = [];

    for (let i = 0; i < status.missingWorkersBlocks; i++) {
      toBuild.push({
        typeId: 'tenement_workers',
        name: 'Kamienica Robotnicza (Klasa R)',
        sizeX: 1,
        sizeY: 2,
        cost: 1200,
      });
    }

    for (let i = 0; i < status.missingMiddleBlocks; i++) {
      toBuild.push({
        typeId: 'tenement_middle',
        name: 'Kamienica Mieszczańska (Klasa M)',
        sizeX: 1,
        sizeY: 2,
        cost: 2600,
      });
    }

    if (toBuild.length > 0) {
      autoPlaceCityBuildings(toBuild);
    }
  }, [cityBuildings, buildingsState]);
}
