import type { BuildingCatalogItem } from './types';

export type MapType = 'city' | 'rural';

export interface MapGeometry {
  tileWidth: number;
  tileHeight: number;
  gridSizeX: number;
  gridSizeY: number;
}

export const CITY_GEOMETRY: MapGeometry = {
  tileWidth: 128,
  tileHeight: 64,
  gridSizeX: 14,
  gridSizeY: 12,
};

// Na wsi pola są 2x mniejsze (64x32), więc siatka ma rozmiar 100x100 pól
export const RURAL_GEOMETRY: MapGeometry = {
  tileWidth: 64,
  tileHeight: 32,
  gridSizeX: 100,
  gridSizeY: 100,
};

// Budynki dozwolone wyłącznie w widoku wiejskim (wieś / rolnictwo / surowce)
export const RURAL_ALLOWED_BUILDINGS = new Set([
  'wheat_farm',
  'wheat_field',
  'orchard',
  'livestock_farm',
  'pasture_cattle',
  'pasture_sheep',
  'city_miniature',
  'coal_mine',
  'sawmill',
  'road_dirt',
]);

// Budynki dozwolone w widoku miejskim (miasto / kamienice / przemysł / usługi miejskie)
export const CITY_ALLOWED_BUILDINGS = new Set([
  'mill',
  'coal_plant',
  'bakery',
  'blacksmith',
  'tenement_workers',
  'tenement_middle',
  'tenement_elite',
  'town_hall',
  'oak',
  'road_curb',
  'road_seamless',
]);

/**
 * Zwraca wymiary budynku na siatce w zależności od aktywnej mapy.
 * W widoku wiejskim pola są 2x mniejsze, więc budynki wiejskie formalnie zajmują 2x więcej kratek:
 * np. Farma 3x4 -> 6x8, Sad 2x2 -> 4x4.
 */
export function getBuildingGridDimensions(
  item: BuildingCatalogItem,
  mapType: MapType,
  rotation: 0 | 90 = 0
): { sizeX: number; sizeY: number } {
  // Drogi zawsze zajmują dokładnie 1 kratkę siatki (1x1) – na wsi zajmują 1 małą kratkę!
  if (item.typeId.startsWith('road') || item.roadSubType !== undefined) {
    return {
      sizeX: 1,
      sizeY: 1,
    };
  }

  const baseSizeX = rotation === 0 ? item.defaultSizeX : item.defaultSizeY;
  const baseSizeY = rotation === 0 ? item.defaultSizeY : item.defaultSizeX;

  if (mapType === 'rural') {
    // Na wsi duże parcele rolnicze (farma 3x4 -> 6x8, sad 2x2 -> 4x4) zajmują 2x więcej małych pól
    return {
      sizeX: baseSizeX * 2,
      sizeY: baseSizeY * 2,
    };
  }

  return {
    sizeX: baseSizeX,
    sizeY: baseSizeY,
  };
}

export function isBuildingAllowedOnMap(typeId: string, mapType: MapType): boolean {
  if (mapType === 'rural') {
    return RURAL_ALLOWED_BUILDINGS.has(typeId);
  }
  return CITY_ALLOWED_BUILDINGS.has(typeId);
}
