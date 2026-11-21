import { useEffect, useState } from 'react';
import { loadPersistedState, savePersistedState } from './gamePersistence';
import type { TileDef, PlacedBuilding } from './types';
import type { MapType, MapGeometry } from './mapConfig';
import { CITY_GEOMETRY, RURAL_GEOMETRY } from './mapConfig';
import {
  createInitialCityTerrain,
  INITIAL_CITY_BUILDINGS,
  createInitialRuralTerrain,
  INITIAL_RURAL_BUILDINGS,
} from './initialWorld';
import {
  ensureCitySpaceFor3x3,
  placeCityBuildingWithAutoExpand,
  type CityExpandSide,
} from './cityAutoGrowth';

export interface WorldMapData {
  gridSizeX: number;
  gridSizeY: number;
  terrainTiles: Record<string, TileDef['type']>;
  roadOrientations: Record<string, 0 | 90>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  placedBuildings: PlacedBuilding[];
  nextExpandSide?: CityExpandSide;
}

export function useWorldMaps() {
  const [currentMap, setCurrentMap] = useState<MapType>('city');
  const [cityPlayersCount, setCityPlayersCount] = useState<number>(() =>
    loadPersistedState('cityPlayersCount', 1)
  );

  // Stan mapy miejskiej (dynamiczny rozmiar siatki, powiększa się z 3 stron przy braku miejsca 3x3)
  const [cityData, setCityData] = useState<WorldMapData>(() => {
    const loaded = loadPersistedState<WorldMapData>('cityData', {
      gridSizeX: CITY_GEOMETRY.gridSizeX,
      gridSizeY: CITY_GEOMETRY.gridSizeY,
      terrainTiles: createInitialCityTerrain(),
      roadOrientations: {},
      roadTypes: {},
      placedBuildings: INITIAL_CITY_BUILDINGS,
    });
    const hasShip = loaded.placedBuildings.some((b) => b.typeId === 'trade_ship');
    if (hasShip) return loaded;
    const ship = INITIAL_CITY_BUILDINGS.find((b) => b.typeId === 'trade_ship');
    return ship
      ? { ...loaded, placedBuildings: [ship, ...loaded.placedBuildings] }
      : loaded;
  });

  // Stan mapy wiejskiej (z usunięciem przestarzałej mniejszej plantacji kauczuku 4x4 z dawnych zapisów)
  const [ruralData, setRuralData] = useState<WorldMapData>(() => {
    const loaded = loadPersistedState<WorldMapData>('ruralData', {
      gridSizeX: RURAL_GEOMETRY.gridSizeX,
      gridSizeY: RURAL_GEOMETRY.gridSizeY,
      terrainTiles: createInitialRuralTerrain(),
      roadOrientations: {},
      roadTypes: {},
      placedBuildings: INITIAL_RURAL_BUILDINGS,
    });
    return {
      ...loaded,
      placedBuildings: loaded.placedBuildings.filter(
        (b) => !(b.typeId === 'rubber_plantation' && (b.sizeX < 6 || b.sizeY < 6))
      ),
    };
  });

  useEffect(() => {
    savePersistedState('cityPlayersCount', cityPlayersCount);
  }, [cityPlayersCount]);

  useEffect(() => {
    savePersistedState('cityData', cityData);
  }, [cityData]);

  useEffect(() => {
    savePersistedState('ruralData', ruralData);
  }, [ruralData]);

  const baseGeo = currentMap === 'rural' ? RURAL_GEOMETRY : CITY_GEOMETRY;
  const activeData: WorldMapData = currentMap === 'rural' ? ruralData : cityData;
  const activeGeometry: MapGeometry = {
    tileWidth: baseGeo.tileWidth,
    tileHeight: baseGeo.tileHeight,
    gridSizeX: activeData.gridSizeX,
    gridSizeY: activeData.gridSizeY,
  };

  const setActiveData = (updater: (prev: WorldMapData) => WorldMapData) => {
    if (currentMap === 'rural') {
      setRuralData(updater);
    } else {
      setCityData((prev) => {
        const next = updater(prev);
        const ensured = ensureCitySpaceFor3x3(
          next.gridSizeX,
          next.gridSizeY,
          next.terrainTiles,
          next.placedBuildings,
          next.nextExpandSide || 'bottom',
          next.roadOrientations,
          next.roadTypes
        );
        return {
          ...next,
          gridSizeX: ensured.gridSizeX,
          gridSizeY: ensured.gridSizeY,
          terrainTiles: ensured.terrainTiles,
          placedBuildings: ensured.placedBuildings,
          roadOrientations: ensured.roadOrientations,
          roadTypes: ensured.roadTypes,
          nextExpandSide: ensured.nextExpandSide,
        };
      });
    }
  };

  const setTerrainTiles = (
    updater: React.SetStateAction<Record<string, TileDef['type']>>
  ) => {
    setActiveData((prev) => ({
      ...prev,
      terrainTiles: typeof updater === 'function' ? updater(prev.terrainTiles) : updater,
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
      roadTypes: typeof updater === 'function' ? updater(prev.roadTypes) : updater,
    }));
  };

  const setPlacedBuildings = (updater: React.SetStateAction<PlacedBuilding[]>) => {
    setActiveData((prev) => ({
      ...prev,
      placedBuildings:
        typeof updater === 'function' ? updater(prev.placedBuildings) : updater,
    }));
  };

  const autoPlaceCityBuildings = (
    specs: Array<{ typeId: string; name: string; sizeX: number; sizeY: number; cost: number }>
  ) => {
    if (specs.length === 0) return;
    setCityData((prev) => {
      let gx = prev.gridSizeX;
      let gy = prev.gridSizeY;
      let tiles = prev.terrainTiles;
      let buildings = prev.placedBuildings;
      let nextSide: CityExpandSide = prev.nextExpandSide || 'bottom';

      for (const spec of specs) {
        const res = placeCityBuildingWithAutoExpand(gx, gy, tiles, buildings, spec, nextSide);
        gx = res.gridSizeX;
        gy = res.gridSizeY;
        tiles = res.terrainTiles;
        buildings = res.placedBuildings;
        nextSide = res.nextExpandSide;
      }

      const ensured = ensureCitySpaceFor3x3(
        gx,
        gy,
        tiles,
        buildings,
        nextSide,
        prev.roadOrientations,
        prev.roadTypes
      );
      return {
        ...prev,
        gridSizeX: ensured.gridSizeX,
        gridSizeY: ensured.gridSizeY,
        terrainTiles: ensured.terrainTiles,
        placedBuildings: ensured.placedBuildings,
        roadOrientations: ensured.roadOrientations,
        roadTypes: ensured.roadTypes,
        nextExpandSide: ensured.nextExpandSide,
      };
    });
  };

  const addNewCityPlayer = () => {
    const nextPlayerNum = cityPlayersCount + 1;
    setCityPlayersCount(nextPlayerNum);
    autoPlaceCityBuildings([
      {
        typeId: 'tenement_elite',
        name: `Willa Elity (Gracz #${nextPlayerNum})`,
        sizeX: 2,
        sizeY: 2,
        cost: 5500,
      },
    ]);
  };

  const allWorldBuildings: Array<PlacedBuilding & { mapType: MapType }> = [
    ...cityData.placedBuildings.map((b) => ({ ...b, mapType: 'city' as MapType })),
    ...ruralData.placedBuildings.map((b) => ({ ...b, mapType: 'rural' as MapType })),
  ];

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
    cityBuildings: cityData.placedBuildings,
    allWorldBuildings,
    autoPlaceCityBuildings,
    cityPlayersCount,
    addNewCityPlayer,
  };
}
