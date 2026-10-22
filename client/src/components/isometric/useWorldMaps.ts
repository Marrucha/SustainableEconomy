import { useState } from 'react';
import type { TileDef, PlacedBuilding } from './types';
import type {
  MapType,
  MapGeometry,
} from './mapConfig';
import {
  CITY_GEOMETRY,
  RURAL_GEOMETRY,
} from './mapConfig';
import {
  createInitialCityTerrain,
  INITIAL_CITY_BUILDINGS,
  createInitialRuralTerrain,
  INITIAL_RURAL_BUILDINGS,
} from './initialWorld';

export interface WorldMapData {
  terrainTiles: Record<string, TileDef['type']>;
  roadOrientations: Record<string, 0 | 90>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  placedBuildings: PlacedBuilding[];
}

export function useWorldMaps() {
  const [currentMap, setCurrentMap] = useState<MapType>('city');

  // Stan mapy miejskiej
  const [cityData, setCityData] = useState<WorldMapData>({
    terrainTiles: createInitialCityTerrain(),
    roadOrientations: {},
    roadTypes: {},
    placedBuildings: INITIAL_CITY_BUILDINGS,
  });

  // Stan mapy wiejskiej (pola 2x mniejsze, siatka 28x24)
  const [ruralData, setRuralData] = useState<WorldMapData>({
    terrainTiles: createInitialRuralTerrain(),
    roadOrientations: {},
    roadTypes: {},
    placedBuildings: INITIAL_RURAL_BUILDINGS,
  });

  // Geometria aktywnej mapy
  const activeGeometry: MapGeometry = currentMap === 'rural' ? RURAL_GEOMETRY : CITY_GEOMETRY;
  const activeData: WorldMapData = currentMap === 'rural' ? ruralData : cityData;

  const setActiveData = (updater: (prev: WorldMapData) => WorldMapData) => {
    if (currentMap === 'rural') {
      setRuralData(updater);
    } else {
      setCityData(updater);
    }
  };

  // Metody aktualizacji dla aktywnej mapy
  const setTerrainTiles = (
    updater: React.SetStateAction<Record<string, TileDef['type']>>
  ) => {
    setActiveData((prev) => ({
      ...prev,
      terrainTiles:
        typeof updater === 'function' ? updater(prev.terrainTiles) : updater,
    }));
  };

  const setRoadOrientations = (
    updater: React.SetStateAction<Record<string, 0 | 90>>
  ) => {
    setActiveData((prev) => ({
      ...prev,
      roadOrientations:
        typeof updater === 'function' ? updater(prev.roadOrientations) : updater,
    }));
  };

  const setRoadTypes = (
    updater: React.SetStateAction<Record<string, 'curb' | 'seamless' | 'dirt'>>
  ) => {
    setActiveData((prev) => ({
      ...prev,
      roadTypes:
        typeof updater === 'function' ? updater(prev.roadTypes) : updater,
    }));
  };

  const setPlacedBuildings = (
    updater: React.SetStateAction<PlacedBuilding[]>
  ) => {
    setActiveData((prev) => ({
      ...prev,
      placedBuildings:
        typeof updater === 'function' ? updater(prev.placedBuildings) : updater,
    }));
  };

  return {
    currentMap,
    setCurrentMap,
    activeGeometry,
    terrainTiles: activeData.terrainTiles,
    setTerrainTiles,
    roadOrientations: activeData.roadOrientations,
    setRoadOrientations,
    roadTypes: activeData.roadTypes,
    setRoadTypes,
    placedBuildings: activeData.placedBuildings,
    setPlacedBuildings,
  };
}
