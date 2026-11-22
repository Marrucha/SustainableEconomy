import { useEffect } from 'react';
import type React from 'react';
import type { BuildingState, PlacedBuilding } from './types';
import {
  computeCityHousingStatus,
  MANAGERS_PER_MIDDLE_TENEMENT,
  WORKERS_PER_TENEMENT,
} from './cityAutoGrowth';
import { computeStableHousingAssignments } from './modal/residentialResidents';

interface UseCityHousingGrowthParams {
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState?: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  autoPlaceCityBuildings: (
    specs: Array<{
      typeId: string;
      name: string;
      sizeX: number;
      sizeY: number;
      cost: number;
      maxTotalOfType?: number;
    }>
  ) => void;
  removeCityBuildingsByIds?: (ids: string[]) => void;
}

export function useCityHousingGrowth({
  cityBuildings,
  buildingsState,
  setBuildingsState,
  autoPlaceCityBuildings,
  removeCityBuildingsByIds,
}: UseCityHousingGrowthParams) {
  useEffect(() => {
    const status = computeCityHousingStatus(cityBuildings, buildingsState);
    const { assignments, changed } = computeStableHousingAssignments(
      cityBuildings,
      buildingsState
    );

    if (removeCityBuildingsByIds) {
      const excessIds: string[] = [];
      const checkExcess = (typeId: string, demand: number, perBuilding: number) => {
        const ofType = cityBuildings.filter((b) => b.typeId === typeId);
        let remainingCount = ofType.length;
        for (let i = ofType.length - 1; i >= 0; i--) {
          const b = ofType[i];
          if (!b.id.includes('_auto_')) continue;
          const resCount = (assignments[b.id] ?? []).length;
          if (resCount === 0 && (remainingCount - 1) * perBuilding >= demand) {
            excessIds.push(b.id);
            remainingCount--;
          }
        }
      };
      checkExcess('tenement_workers', status.workersAndTradeCount, WORKERS_PER_TENEMENT);
      checkExcess('tenement_middle', status.managersCount, MANAGERS_PER_MIDDLE_TENEMENT);
      if (excessIds.length > 0) {
        removeCityBuildingsByIds(excessIds);
        return;
      }
    }

    const toBuild: Array<{
      typeId: string;
      name: string;
      sizeX: number;
      sizeY: number;
      cost: number;
      maxTotalOfType?: number;
    }> = [];

    const neededWorkersTotal = status.workersBlocksCount + status.missingWorkersBlocks;
    for (let i = 0; i < status.missingWorkersBlocks; i++) {
      toBuild.push({
        typeId: 'tenement_workers',
        name: 'Kamienica Robotnicza (Klasa R)',
        sizeX: 1,
        sizeY: 2,
        cost: 1200,
        maxTotalOfType: neededWorkersTotal,
      });
    }

    const neededMiddleTotal = status.middleBlocksCount + status.missingMiddleBlocks;
    for (let i = 0; i < status.missingMiddleBlocks; i++) {
      toBuild.push({
        typeId: 'tenement_middle',
        name: 'Kamienica Mieszczańska (Klasa M)',
        sizeX: 1,
        sizeY: 2,
        cost: 2600,
        maxTotalOfType: neededMiddleTotal,
      });
    }

    const neededEliteTotal = status.eliteVillasCount + status.missingEliteVillas;
    for (let i = 0; i < status.missingEliteVillas; i++) {
      toBuild.push({
        typeId: 'tenement_elite',
        name: 'Willa Elity (Klasa E)',
        sizeX: 2,
        sizeY: 2,
        cost: 5500,
        maxTotalOfType: neededEliteTotal,
      });
    }

    if (toBuild.length > 0) {
      autoPlaceCityBuildings(toBuild);
    }

    if (setBuildingsState) {
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
