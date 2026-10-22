import { GRID_SIZE_X, GRID_SIZE_Y } from './catalog';
import type { TileDef, PlacedBuilding } from './types';

export function createInitialTerrain(): Record<string, TileDef['type']> {
  const initial: Record<string, TileDef['type']> = {};
  for (let x = 0; x < GRID_SIZE_X; x++) {
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      let type: TileDef['type'] = 'grass';
      if (x === 0) type = 'water';
      else if (x === 1) type = 'quay';
      else if (x === 2 || (x > 2 && y === 2)) type = 'road';
      else {
        // Naturalne strefy leśne na obrzeżach mapy (dąb, sosna, zagajnik)
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

export const INITIAL_BUILDINGS: PlacedBuilding[] = [
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
