import type { BuildingCatalogItem, BuildingCategory } from './types';
import { RURAL_CATALOG } from './catalog/ruralCatalog';
import { INDUSTRY_CATALOG } from './catalog/industryCatalog';
import { URBAN_CATALOG } from './catalog/urbanCatalog';

// Exact Grid Geometry (True Dimetric 2:1 ratio)
export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;
export const GRID_SIZE_X = 27;
export const GRID_SIZE_Y = 24;

export const CATEGORIES: (BuildingCategory | 'Wszystkie')[] = [
  'Wszystkie',
  'Budynki rolnicze',
  'Budynki przemysłowe',
  'Budynki mieszkalne',
  'Budynki usługowe',
  'Elementy rozrywkowe',
];

export const CATALOG: BuildingCatalogItem[] = [
  ...RURAL_CATALOG,
  ...INDUSTRY_CATALOG,
  ...URBAN_CATALOG,
];
