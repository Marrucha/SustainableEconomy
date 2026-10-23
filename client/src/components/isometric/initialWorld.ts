import { CITY_GEOMETRY, RURAL_GEOMETRY } from './mapConfig';
import type { TileDef, PlacedBuilding } from './types';

// ==========================================
// 1. MAPA MIEJSKA (CITY) - Siatka 14x12, kafle 128x64
// ==========================================
export function createInitialCityTerrain(): Record<string, TileDef['type']> {
  const initial: Record<string, TileDef['type']> = {};
  for (let x = 0; x < CITY_GEOMETRY.gridSizeX; x++) {
    for (let y = 0; y < CITY_GEOMETRY.gridSizeY; y++) {
      let type: TileDef['type'] = 'grass';
      if (x === 0) type = 'water';
      else if (x === 1) type = 'quay';
      else if (x === 2 || (x > 2 && y === 2) || (x >= 2 && x <= 11 && y === 3)) type = 'road';
      else {
        // Naturalne strefy leśne na obrzeżach miasta
        const isNorthEastForest = x >= 12 && y <= 6 && (x + y) % 5 !== 0;
        const isEastForest = x >= 14 && y >= 7 && (x * 2 + y) % 7 !== 0;
        const isSouthForest = x >= 4 && x <= 10 && y >= 11 && (x + y) % 4 !== 0;
        if (isNorthEastForest || isEastForest || isSouthForest) {
          const hash = (x * 37 + y * 17) % 3;
          type = hash === 0 ? 'forest_oak' : hash === 1 ? 'forest_pine' : 'forest_grove';
        }
      }
      initial[`${x},${y}`] = type;
    }
  }
  return initial;
}

export const INITIAL_CITY_BUILDINGS: PlacedBuilding[] = [
  {
    id: 'town_hall_init',
    typeId: 'town_hall',
    name: 'Wiktoriański Ratusz',
    x: 8,
    y: 4,
    sizeX: 3,
    sizeY: 3,
    rotation: 0,
    cost: 15000,
  },
  {
    id: 'mill_init',
    typeId: 'mill',
    name: 'Młyn Parowy',
    x: 4,
    y: 0,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 3500,
  },
  {
    id: 'coal_init',
    typeId: 'coal_plant',
    name: 'Elektrociepłownia Węglowa',
    x: 6,
    y: 0,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 6200,
  },
  {
    id: 'tenements_init',
    typeId: 'tenement_middle',
    name: 'Kamienica Mieszczańska',
    x: 4,
    y: 4,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 2600,
  },
  {
    id: 'workers_init',
    typeId: 'tenement_workers',
    name: 'Kamienica Robotnicza',
    x: 6,
    y: 4,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 1200,
  },
];

// ==========================================
// 2. MAPA WIEJSKA (RURAL) - Siatka 100x100, pola 2x mniejsze (64x32)
// ==========================================
export function createInitialRuralTerrain(): Record<string, TileDef['type']> {
  const initial: Record<string, TileDef['type']> = {};
  for (let x = 0; x < RURAL_GEOMETRY.gridSizeX; x++) {
    for (let y = 0; y < RURAL_GEOMETRY.gridSizeY; y++) {
      let type: TileDef['type'] = 'grass';

      // Rzeka wiejska na skraju mapy (2-krotna szerokość)
      if (x <= 1) type = 'water';
      else if (x === 2) type = 'quay';
      // Główny wiejski trakt polny biegnący przez wieś z dojazdami do farm i sadu
      else if (
        x === 4 ||
        (x >= 4 && (y === 12 || y === 35 || y === 60 || y === 85)) ||
        (y === 6 && x >= 4 && x <= 6) ||
        (y === 6 && x >= 12 && x <= 14)
      ) {
        type = 'road';
      } else {
        // Gęste pasy lasu na dalekich obrzeżach wsi oraz malownicze zagajniki w terenie
        const isBorderWoods = (y <= 3 || x >= 94 || y >= 94) && (x * 3 + y * 2) % 5 !== 0;
        const isWildGrove =
          x > 20 &&
          x < 90 &&
          y > 20 &&
          y < 90 &&
          ((x % 19 === 0 && y % 15 <= 3) || (y % 23 === 0 && x % 17 <= 3));

        if (isBorderWoods || isWildGrove) {
          const hash = (x * 43 + y * 19) % 3;
          type = hash === 0 ? 'forest_pine' : hash === 1 ? 'forest_oak' : 'forest_grove';
        }
      }
      initial[`${x},${y}`] = type;
    }
  }

  // Automatyczne wycięcie lasu pod początkowymi parcelami wiejskimi (Farma 6x8, Sad 4x4, Farma Hodowlana)
  for (let tx = 5; tx <= 13; tx++) {
    for (let ty = 1; ty <= 11; ty++) {
      initial[`${tx},${ty}`] = 'grass';
    }
  }
  for (let tx = 13; tx <= 19; tx++) {
    for (let ty = 3; ty <= 9; ty++) {
      initial[`${tx},${ty}`] = 'grass';
    }
  }
  for (let tx = 5; tx <= 13; tx++) {
    for (let ty = 12; ty <= 21; ty++) {
      initial[`${tx},${ty}`] = 'grass';
    }
  }

  return initial;
}

export const INITIAL_RURAL_BUILDINGS: PlacedBuilding[] = [
  {
    id: 'rural_farm_init',
    typeId: 'wheat_farm',
    name: 'Wielka Farma Zbożowa',
    x: 6,
    y: 2,
    sizeX: 6, // 3 * 2
    sizeY: 8, // 4 * 2
    rotation: 0,
    cost: 2800,
  },
  {
    id: 'rural_orchard_init',
    typeId: 'orchard',
    name: 'Sad Owocowy',
    x: 14,
    y: 4,
    sizeX: 4, // 2 * 2
    sizeY: 4, // 2 * 2
    rotation: 0,
    cost: 1800,
  },
  {
    id: 'rural_livestock_init',
    typeId: 'livestock_farm',
    name: 'Farma Bydła i Owiec',
    x: 6,
    y: 13,
    sizeX: 6, // 3 * 2
    sizeY: 8, // 4 * 2
    rotation: 0,
    cost: 2400,
  },
];

// Wsteczna kompatybilność aliasów
export const createInitialTerrain = createInitialCityTerrain;
export const INITIAL_BUILDINGS = INITIAL_CITY_BUILDINGS;
