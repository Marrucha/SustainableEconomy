import type { BuildingState, PlacedBuilding, TileDef } from './types';
import {
  ELITE_PER_VILLA,
  getCityHousingPools,
  MANAGERS_PER_MIDDLE_TENEMENT,
  WORKERS_PER_TENEMENT,
} from './modal/residentialResidents';

export { WORKERS_PER_TENEMENT, MANAGERS_PER_MIDDLE_TENEMENT, ELITE_PER_VILLA };

export interface CityHousingStatus {
  workersAndTradeCount: number;
  managersCount: number;
  eliteCount: number;
  workersBlocksCount: number;
  middleBlocksCount: number;
  eliteVillasCount: number;
  workersCapacity: number;
  managersCapacity: number;
  missingWorkersBlocks: number;
  missingMiddleBlocks: number;
  missingEliteVillas: number;
}

export function computeCityHousingStatus(
  cityBuildings: PlacedBuilding[],
  buildingsState: Record<string, BuildingState>
): CityHousingStatus {
  const pools = getCityHousingPools(cityBuildings, buildingsState);
  const workersAndTradeCount = pools.workers.length;
  const managersCount = pools.middle.length;
  const eliteCount = pools.elite.length;

  const workersBlocksCount = cityBuildings.filter((b) => b.typeId === 'tenement_workers').length;
  const middleBlocksCount = cityBuildings.filter((b) => b.typeId === 'tenement_middle').length;
  const eliteVillasCount = cityBuildings.filter((b) => b.typeId === 'tenement_elite').length;

  const workersCapacity = workersBlocksCount * WORKERS_PER_TENEMENT;
  const managersCapacity = middleBlocksCount * MANAGERS_PER_MIDDLE_TENEMENT;
  const eliteCapacity = eliteVillasCount * ELITE_PER_VILLA;

  const missingWorkersBlocks =
    workersAndTradeCount > workersCapacity
      ? Math.ceil((workersAndTradeCount - workersCapacity) / WORKERS_PER_TENEMENT)
      : 0;
  const missingMiddleBlocks =
    managersCount > managersCapacity
      ? Math.ceil((managersCount - managersCapacity) / MANAGERS_PER_MIDDLE_TENEMENT)
      : 0;
  const missingEliteVillas =
    eliteCount > eliteCapacity
      ? Math.ceil((eliteCount - eliteCapacity) / ELITE_PER_VILLA)
      : 0;

  return {
    workersAndTradeCount,
    managersCount,
    eliteCount,
    workersBlocksCount,
    middleBlocksCount,
    eliteVillasCount,
    workersCapacity,
    managersCapacity,
    missingWorkersBlocks,
    missingMiddleBlocks,
    missingEliteVillas,
  };
}

function canPlaceBuildingAt(
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[]
): boolean {
  if (x < 3 || y < 0 || x + sizeX > gridSizeX || y + sizeY > gridSizeY) return false;

  for (let dx = 0; dx < sizeX; dx++) {
    for (let dy = 0; dy < sizeY; dy++) {
      const t = terrainTiles[`${x + dx},${y + dy}`];
      if (t !== 'grass') return false;
      const occupied = placedBuildings.some(
        (b) => x + dx >= b.x && x + dx < b.x + b.sizeX && y + dy >= b.y && y + dy < b.y + b.sizeY
      );
      if (occupied) return false;
    }
  }

  // Budynek miejski bazowo musi stykać się z drogą co najmniej jednym polem
  for (let dx = 0; dx < sizeX; dx++) {
    if (terrainTiles[`${x + dx},${y - 1}`] === 'road') return true;
    if (terrainTiles[`${x + dx},${y + sizeY}`] === 'road') return true;
  }
  for (let dy = 0; dy < sizeY; dy++) {
    if (terrainTiles[`${x - 1},${y + dy}`] === 'road') return true;
    if (terrainTiles[`${x + sizeX},${y + dy}`] === 'road') return true;
  }
  return false;
}

export function findSpotAdjacentToRoad(
  sizeX: number,
  sizeY: number,
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[]
): { x: number; y: number } | null {
  for (let y = 0; y < gridSizeY; y++) {
    for (let x = 3; x < gridSizeX; x++) {
      if (canPlaceBuildingAt(x, y, sizeX, sizeY, gridSizeX, gridSizeY, terrainTiles, placedBuildings)) {
        return { x, y };
      }
    }
  }
  return null;
}

export type CityExpandSide = 'bottom' | 'right' | 'top';

const EXPAND_SIDE_ORDER: CityExpandSide[] = ['bottom', 'right', 'top'];

export function getNextExpandSide(side: CityExpandSide): CityExpandSide {
  const idx = EXPAND_SIDE_ORDER.indexOf(side);
  return EXPAND_SIDE_ORDER[(idx + 1) % EXPAND_SIDE_ORDER.length];
}

export function hasFree3x3BuildSpace(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[]
): boolean {
  return (
    findSpotAdjacentToRoad(3, 3, gridSizeX, gridSizeY, terrainTiles, placedBuildings) !== null
  );
}

export function expandCityTerrainSide(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[],
  side: CityExpandSide,
  roadOrientations: Record<string, 0 | 90> = {},
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'> = {}
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  placedBuildings: PlacedBuilding[];
  roadOrientations: Record<string, 0 | 90>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  spawnHint: { x: number; y: number };
} {
  if (side === 'right') {
    let prevColHasRoad = false;
    for (let y = 0; y < gridSizeY; y++) {
      if (terrainTiles[`${gridSizeX - 1},${y}`] === 'road') {
        prevColHasRoad = true;
        break;
      }
    }
    const colsToAdd = prevColHasRoad ? 3 : 4;
    const newGridSizeX = gridSizeX + colsToAdd;
    const nextTerrain = { ...terrainTiles };

    for (let x = gridSizeX; x < newGridSizeX; x++) {
      for (let y = 0; y < gridSizeY; y++) {
        nextTerrain[`${x},${y}`] = !prevColHasRoad && x === gridSizeX ? 'road' : 'grass';
      }
    }

    return {
      gridSizeX: newGridSizeX,
      gridSizeY,
      terrainTiles: nextTerrain,
      placedBuildings,
      roadOrientations,
      roadTypes,
      spawnHint: { x: prevColHasRoad ? gridSizeX : gridSizeX + 1, y: 0 },
    };
  }

  if (side === 'top') {
    let firstRowHasRoad = false;
    for (let x = 3; x < gridSizeX; x++) {
      if (terrainTiles[`${x},0`] === 'road') {
        firstRowHasRoad = true;
        break;
      }
    }
    const rowsToAdd = firstRowHasRoad ? 3 : 4;
    const newGridSizeY = gridSizeY + rowsToAdd;
    const nextTerrain: Record<string, TileDef['type']> = {};
    const nextOrientations: Record<string, 0 | 90> = {};
    const nextRoadTypes: Record<string, 'curb' | 'seamless' | 'dirt'> = {};

    // Przesunięcie istniejącego terenu i dróg o rowsToAdd w dół
    for (const [key, val] of Object.entries(terrainTiles)) {
      const [kx, ky] = key.split(',').map(Number);
      nextTerrain[`${kx},${ky + rowsToAdd}`] = val;
    }
    for (const [key, val] of Object.entries(roadOrientations)) {
      const [kx, ky] = key.split(',').map(Number);
      nextOrientations[`${kx},${ky + rowsToAdd}`] = val;
    }
    for (const [key, val] of Object.entries(roadTypes)) {
      const [kx, ky] = key.split(',').map(Number);
      nextRoadTypes[`${kx},${ky + rowsToAdd}`] = val;
    }

    // Nowe wiersze na górze (0 .. rowsToAdd - 1)
    for (let y = 0; y < rowsToAdd; y++) {
      for (let x = 0; x < gridSizeX; x++) {
        if (x === 0) nextTerrain[`${x},${y}`] = 'water';
        else if (x === 1) nextTerrain[`${x},${y}`] = 'quay';
        else if (x === 2 || (!firstRowHasRoad && y === rowsToAdd - 1)) nextTerrain[`${x},${y}`] = 'road';
        else nextTerrain[`${x},${y}`] = 'grass';
      }
    }

    const shiftedBuildings = placedBuildings.map((b) => ({ ...b, y: b.y + rowsToAdd }));
    return {
      gridSizeX,
      gridSizeY: newGridSizeY,
      terrainTiles: nextTerrain,
      placedBuildings: shiftedBuildings,
      roadOrientations: nextOrientations,
      roadTypes: nextRoadTypes,
      spawnHint: { x: 3, y: 0 },
    };
  }

  // Domyślnie: 'bottom'
  let prevRowHasRoad = false;
  for (let x = 3; x < gridSizeX; x++) {
    if (terrainTiles[`${x},${gridSizeY - 1}`] === 'road') {
      prevRowHasRoad = true;
      break;
    }
  }
  const rowsToAdd = prevRowHasRoad ? 3 : 4;
  const newGridSizeY = gridSizeY + rowsToAdd;
  const nextTerrain = { ...terrainTiles };

  for (let y = gridSizeY; y < newGridSizeY; y++) {
    for (let x = 0; x < gridSizeX; x++) {
      if (x === 0) nextTerrain[`${x},${y}`] = 'water';
      else if (x === 1) nextTerrain[`${x},${y}`] = 'quay';
      else if (x === 2 || (!prevRowHasRoad && y === gridSizeY)) nextTerrain[`${x},${y}`] = 'road';
      else nextTerrain[`${x},${y}`] = 'grass';
    }
  }

  return {
    gridSizeX,
    gridSizeY: newGridSizeY,
    terrainTiles: nextTerrain,
    placedBuildings,
    roadOrientations,
    roadTypes,
    spawnHint: { x: 3, y: prevRowHasRoad ? gridSizeY : gridSizeY + 1 },
  };
}

export function ensureCitySpaceFor3x3(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[],
  nextExpandSide: CityExpandSide = 'bottom',
  roadOrientations: Record<string, 0 | 90> = {},
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'> = {}
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  placedBuildings: PlacedBuilding[];
  roadOrientations: Record<string, 0 | 90>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  nextExpandSide: CityExpandSide;
} {
  if (hasFree3x3BuildSpace(gridSizeX, gridSizeY, terrainTiles, placedBuildings)) {
    return {
      gridSizeX,
      gridSizeY,
      terrainTiles,
      placedBuildings,
      roadOrientations,
      roadTypes,
      nextExpandSide,
    };
  }

  const expanded = expandCityTerrainSide(
    gridSizeX,
    gridSizeY,
    terrainTiles,
    placedBuildings,
    nextExpandSide,
    roadOrientations,
    roadTypes
  );

  return {
    gridSizeX: expanded.gridSizeX,
    gridSizeY: expanded.gridSizeY,
    terrainTiles: expanded.terrainTiles,
    placedBuildings: expanded.placedBuildings,
    roadOrientations: expanded.roadOrientations,
    roadTypes: expanded.roadTypes,
    nextExpandSide: getNextExpandSide(nextExpandSide),
  };
}

export function placeCityBuildingWithAutoExpand(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[],
  spec: { typeId: string; name: string; sizeX: number; sizeY: number; cost: number },
  nextExpandSide: CityExpandSide = 'bottom'
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  placedBuildings: PlacedBuilding[];
  nextExpandSide: CityExpandSide;
} {
  const existingSpot = findSpotAdjacentToRoad(
    spec.sizeX,
    spec.sizeY,
    gridSizeX,
    gridSizeY,
    terrainTiles,
    placedBuildings
  );

  if (existingSpot) {
    const newBldg: PlacedBuilding = {
      id: `${spec.typeId}_auto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      typeId: spec.typeId,
      name: spec.name,
      x: existingSpot.x,
      y: existingSpot.y,
      sizeX: spec.sizeX,
      sizeY: spec.sizeY,
      rotation: 0,
      cost: spec.cost,
    };
    return {
      gridSizeX,
      gridSizeY,
      terrainTiles,
      placedBuildings: [...placedBuildings, newBldg],
      nextExpandSide,
    };
  }

  const expanded = expandCityTerrainSide(
    gridSizeX,
    gridSizeY,
    terrainTiles,
    placedBuildings,
    nextExpandSide
  );
  const newBldg: PlacedBuilding = {
    id: `${spec.typeId}_auto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    typeId: spec.typeId,
    name: spec.name,
    x: expanded.spawnHint.x,
    y: expanded.spawnHint.y,
    sizeX: spec.sizeX,
    sizeY: spec.sizeY,
    rotation: 0,
    cost: spec.cost,
  };

  return {
    gridSizeX: expanded.gridSizeX,
    gridSizeY: expanded.gridSizeY,
    terrainTiles: expanded.terrainTiles,
    placedBuildings: [...expanded.placedBuildings, newBldg],
    nextExpandSide: getNextExpandSide(nextExpandSide),
  };
}
