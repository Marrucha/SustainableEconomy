import { useEffect } from 'react';
import type React from 'react';
import type { BuildingState, PlacedBuilding } from './types';
import { computeCityHousingStatus } from './cityAutoGrowth';
import { computeStableHousingAssignments } from './modal/residentialResidents';

interface UseCityHousingGrowthParams {
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState?: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  autoPlaceCityBuildings: (
    specs: Array<{ typeId: string; name: string; sizeX: number; sizeY: number; cost: number }>
  ) => void;
}

export function useCityHousingGrowth({
  cityBuildings,
  buildingsState,
  setBuildingsState,
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

    for (let i = 0; i < status.missingEliteVillas; i++) {
      toBuild.push({
        typeId: 'tenement_elite',
        name: 'Willa Elity (Klasa E)',
        sizeX: 2,
        sizeY: 2,
        cost: 5500,
      });
    }

    if (toBuild.length > 0) {
      autoPlaceCityBuildings(toBuild);
    }

    if (setBuildingsState) {
      const { assignments, changed } = computeStableHousingAssignments(
        cityBuildings,
        buildingsState
      );
      if (changed) {
        setBuildingsState((prev) => {
          const next = { ...prev };
          for (const [bId, ids] of Object.entries(assignments)) {
            next[bId] = {
              ...(next[bId] || {}),
              assignedResidentIds: ids,
            };
          }
          return next;
        });
      }
    }
  }, [cityBuildings, buildingsState]);
}
