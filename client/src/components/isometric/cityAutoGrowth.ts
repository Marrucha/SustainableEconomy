import type { BuildingState, PlacedBuilding, TileDef } from './types';

export const WORKERS_PER_TENEMENT = 20;
export const MANAGERS_PER_MIDDLE_TENEMENT = 5;

export interface CityHousingStatus {
  workersAndTradeCount: number;
  managersCount: number;
  workersBlocksCount: number;
  middleBlocksCount: number;
  eliteVillasCount: number;
  workersCapacity: number;
  managersCapacity: number;
  missingWorkersBlocks: number;
  missingMiddleBlocks: number;
}

export function computeCityHousingStatus(
  cityBuildings: PlacedBuilding[],
  buildingsState: Record<string, BuildingState>
): CityHousingStatus {
  let workersAndTradeCount = 0;
  let managersCount = 0;

  for (const st of Object.values(buildingsState)) {
    const workers = st.factoryWorkersCount ?? 0;
    const warehousemen =
      st.warehousemanRoleMode === 'worker' ? 0 : st.factoryWarehousemenCount ?? 0;
    const merchant =
      st.merchantHired && st.merchantRoleMode !== 'worker' ? 1 : 0;
    const seller =
      st.factorySellerHired && st.sellerRoleMode !== 'worker' ? 1 : 0;
    const marketSuppliers = st.marketSuppliersCount ?? 0;
    const marketSellers = (st.marketStalls || []).reduce(
      (sum, slot) => sum + (slot.sellers?.length ?? 0),
      0
    );

    workersAndTradeCount +=
      workers + warehousemen + merchant + seller + marketSuppliers + marketSellers;
    managersCount += st.factoryManagersCount ?? 0;
  }

  const workersBlocksCount = cityBuildings.filter((b) => b.typeId === 'tenement_workers').length;
  const middleBlocksCount = cityBuildings.filter((b) => b.typeId === 'tenement_middle').length;
  const eliteVillasCount = cityBuildings.filter((b) => b.typeId === 'tenement_elite').length;

  const workersCapacity = workersBlocksCount * WORKERS_PER_TENEMENT;
  const managersCapacity = middleBlocksCount * MANAGERS_PER_MIDDLE_TENEMENT;

  const missingWorkersBlocks =
    workersAndTradeCount > workersCapacity
      ? Math.ceil((workersAndTradeCount - workersCapacity) / WORKERS_PER_TENEMENT)
      : 0;
  const missingMiddleBlocks =
    managersCount > managersCapacity
      ? Math.ceil((managersCount - managersCapacity) / MANAGERS_PER_MIDDLE_TENEMENT)
      : 0;

  return {
    workersAndTradeCount,
    managersCount,
    workersBlocksCount,
    middleBlocksCount,
    eliteVillasCount,
    workersCapacity,
    managersCapacity,
    missingWorkersBlocks,
    missingMiddleBlocks,
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

export function expandCityTerrainStrip(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  roadRowY: number;
} {
  let prevRowHasRoad = false;
  for (let x = 3; x < gridSizeX; x++) {
    if (terrainTiles[`${x},${gridSizeY - 1}`] === 'road') {
      prevRowHasRoad = true;
      break;
    }
  }

  // Jeśli poprzedni wiersz nie ma drogi, dodajemy 1 wiersz drogi + 3 wiersze trawy (łącznie +4),
  // aby zawsze zmieścił się co najmniej budynek 3x3 bez tworzenia dwupasmówki.
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
    roadRowY: prevRowHasRoad ? gridSizeY - 1 : gridSizeY,
  };
}

export function ensureCitySpaceFor3x3(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[]
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
} {
  let gx = gridSizeX;
  let gy = gridSizeY;
  let tiles = terrainTiles;

  if (!hasFree3x3BuildSpace(gx, gy, tiles, placedBuildings)) {
    const expanded = expandCityTerrainStrip(gx, gy, tiles);
    gx = expanded.gridSizeX;
    gy = expanded.gridSizeY;
    tiles = expanded.terrainTiles;
  }

  return { gridSizeX: gx, gridSizeY: gy, terrainTiles: tiles };
}

export function placeCityBuildingWithAutoExpand(
  gridSizeX: number,
  gridSizeY: number,
  terrainTiles: Record<string, TileDef['type']>,
  placedBuildings: PlacedBuilding[],
  spec: { typeId: string; name: string; sizeX: number; sizeY: number; cost: number }
): {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  placedBuildings: PlacedBuilding[];
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
    };
  }

  // Brak miejsca przy drodze -> automatyczne powiększenie terenu z drogą
  const expanded = expandCityTerrainStrip(gridSizeX, gridSizeY, terrainTiles);
  const placeY = expanded.roadRowY + 1;
  const newBldg: PlacedBuilding = {
    id: `${spec.typeId}_auto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    typeId: spec.typeId,
    name: spec.name,
    x: 3,
    y: placeY,
    sizeX: spec.sizeX,
    sizeY: spec.sizeY,
    rotation: 0,
    cost: spec.cost,
  };

  return {
    gridSizeX: expanded.gridSizeX,
    gridSizeY: expanded.gridSizeY,
    terrainTiles: expanded.terrainTiles,
    placedBuildings: [...placedBuildings, newBldg],
  };
}
