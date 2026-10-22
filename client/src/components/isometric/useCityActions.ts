import React from 'react';
import type { PlacedBuilding, TileDef, BuildingCatalogItem } from './types';
import { GRID_SIZE_X, GRID_SIZE_Y } from './catalog';

interface UseCityActionsParams {
  placedBuildings: PlacedBuilding[];
  setPlacedBuildings: React.Dispatch<React.SetStateAction<PlacedBuilding[]>>;
  terrainTiles: Record<string, TileDef['type']>;
  setTerrainTiles: React.Dispatch<React.SetStateAction<Record<string, TileDef['type']>>>;
  roadOrientations: Record<string, 0 | 90>;
  setRoadOrientations: React.Dispatch<React.SetStateAction<Record<string, 0 | 90>>>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  setRoadTypes: React.Dispatch<React.SetStateAction<Record<string, 'curb' | 'seamless' | 'dirt'>>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

export function useCityActions(p: UseCityActionsParams) {
  const {
    placedBuildings,
    setPlacedBuildings,
    terrainTiles,
    setTerrainTiles,
    roadOrientations,
    setRoadOrientations,
    roadTypes,
    setRoadTypes,
    gold,
    setGold,
  } = p;

  const demolishBuilding = (buildingId: string) => {
    const b = placedBuildings.find((x) => x.id === buildingId);
    if (b) {
      setPlacedBuildings((prev) => prev.filter((x) => x.id !== buildingId));
      setGold((g) => g + Math.floor(b.cost * 0.5));
    }
  };

  const demolishRoad = (x: number, y: number) => {
    const key = `${x},${y}`;
    const subType = roadTypes[key] || 'curb';
    const refund = subType === 'dirt' ? 8 : 25;
    setTerrainTiles((prev) => ({ ...prev, [key]: 'grass' }));
    setRoadOrientations((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setRoadTypes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setGold((g) => g + refund);
  };

  const clearForest = (x: number, y: number) => {
    setTerrainTiles((prev) => ({ ...prev, [`${x},${y}`]: 'grass' }));
    setGold((g) => g + 15);
  };

  const changeRoadType = (x: number, y: number, newType: 'curb' | 'seamless' | 'dirt') => {
    setRoadTypes((prev) => ({ ...prev, [`${x},${y}`]: newType }));
  };

  const rotateRoad = (x: number, y: number) => {
    const curOri = roadOrientations[`${x},${y}`] || 0;
    const newOri = curOri === 0 ? 90 : 0;
    setRoadOrientations((prev) => ({ ...prev, [`${x},${y}`]: newOri }));
  };

  const changeTerrainType = (x: number, y: number, newType: TileDef['type'], costDelta: number) => {
    setTerrainTiles((prev) => ({ ...prev, [`${x},${y}`]: newType }));
    setGold((g) => g + costDelta);
  };

  const buildOnCoord = (item: BuildingCatalogItem, rot: 0 | 90, coord: { x: number; y: number }): boolean => {
    const curSizeX = rot === 0 ? item.defaultSizeX : item.defaultSizeY;
    const curSizeY = rot === 0 ? item.defaultSizeY : item.defaultSizeX;

    const isCollision = placedBuildings.some((b) =>
      coord.x < b.x + b.sizeX &&
      coord.x + curSizeX > b.x &&
      coord.y < b.y + b.sizeY &&
      coord.y + curSizeY > b.y
    );
    const isWaterOrOut =
      coord.x <= 1 ||
      coord.x + curSizeX > GRID_SIZE_X ||
      coord.y < 0 ||
      coord.y + curSizeY > GRID_SIZE_Y;

    if (item.typeId.startsWith('road')) {
      if (isWaterOrOut || isCollision || gold < item.cost) return false;
      setTerrainTiles((prev) => ({ ...prev, [`${coord.x},${coord.y}`]: 'road' }));
      setRoadOrientations((prev) => ({ ...prev, [`${coord.x},${coord.y}`]: rot }));
      setRoadTypes((prev) => ({ ...prev, [`${coord.x},${coord.y}`]: item.roadSubType || 'curb' }));
      setGold((g) => g - item.cost);
      return true;
    }

    let isOnRoad = false;
    for (let tx = coord.x; tx < coord.x + curSizeX; tx++) {
      for (let ty = coord.y; ty < coord.y + curSizeY; ty++) {
        if (terrainTiles[`${tx},${ty}`] === 'road') isOnRoad = true;
      }
    }

    if (!isCollision && !isWaterOrOut && !isOnRoad && gold >= item.cost) {
      setPlacedBuildings((prev) => [
        ...prev,
        {
          id: `${item.typeId}_${Date.now()}`,
          typeId: item.typeId,
          name: item.name,
          x: coord.x,
          y: coord.y,
          sizeX: curSizeX,
          sizeY: curSizeY,
          rotation: rot,
          cost: item.cost,
        },
      ]);
      setGold((g) => g - item.cost);
      return true;
    }
    return false;
  };

  return {
    demolishBuilding,
    demolishRoad,
    clearForest,
    changeRoadType,
    rotateRoad,
    changeTerrainType,
    buildOnCoord,
  };
}
