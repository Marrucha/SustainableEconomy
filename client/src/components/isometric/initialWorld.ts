import { CITY_GEOMETRY, RURAL_GEOMETRY } from './mapConfig';
import type { TileDef, PlacedBuilding } from './types';

// ==========================================
// 1. MAPA MIEJSKA (CITY) - Siatka 27x24 (+6 kratek w każdą stronę, morze 2 kratki)
// ==========================================
export function createInitialCityTerrain(): Record<string, TileDef['type']> {
  const initial: Record<string, TileDef['type']> = {};
  for (let x = 0; x < CITY_GEOMETRY.gridSizeX; x++) {
    for (let y = 0; y < CITY_GEOMETRY.gridSizeY; y++) {
      let type: TileDef['type'] = 'grass';
      const isMarketRingRoad =
        ((x === 11 || x === 15) && y >= 9 && y <= 13) ||
        ((y === 9 || y === 13) && x >= 11 && x <= 15);
      // 4 drogi promieniste z narożników placu + dodatkowa siatka dróg wg planu
      const isRadialRoad =
        (y === 9 && x >= 3 && x <= 10) ||
        (x === 15 && y >= 0 && y <= 8) ||
        (y === 13 && x >= 3 && x <= 26) ||
        (x === 11 && y >= 14 && y <= 23) ||
        (y === 5 && x >= 3 && x <= 26) ||
        (y === 18 && x >= 3 && x <= 26) ||
        (x === 7 && y >= 0 && y <= 23 && (y < 10 || y > 12)) ||
        (x === 11 && y >= 0 && y <= 5) ||
        (x === 19 && y >= 0 && y <= 23);

      if (x === 0 || x === 1) type = 'water';
      else if (x === 2) type = 'quay';
      else if (isMarketRingRoad || isRadialRoad) {
        type = 'road';
      } else {
        // Dzikie drzewa tylko przy skrajnej PD-wschodniej krawędzi mapy (głębokość 1 lub losowo 2 kratki)
        const isCoalPlot = x === 26 && y >= 22;
        const isSeEdgeDepth1 = x === 26 && !isCoalPlot;
        const isSeEdgeDepth2 = x === 25 && (x * 31 + y * 13) % 5 < 2;
        if (isSeEdgeDepth1 || isSeEdgeDepth2) {
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
    id: 'trade_ship_init',
    typeId: 'trade_ship',
    name: 'Statek Handlowy (Port Londyn)',
    x: 1,
    y: 0,
    sizeX: 2,
    sizeY: 5,
    rotation: 0,
    cost: 0,
  },
  {
    id: 'marketplace_init',
    typeId: 'marketplace',
    name: 'Targowisko Miejskie (8 Stoisk)',
    x: 12,
    y: 10,
    sizeX: 3,
    sizeY: 3,
    rotation: 0,
    cost: 6800,
  },
  {
    id: 'town_hall_init',
    typeId: 'town_hall',
    name: 'Wiktoriański Ratusz',
    x: 12,
    y: 6,
    sizeX: 3,
    sizeY: 3,
    rotation: 0,
    cost: 15000,
  },
  {
    id: 'tenement_elite_mayor_init',
    typeId: 'tenement_elite',
    name: 'Willa Elity (Burmistrz)',
    x: 17,
    y: 8,
    sizeX: 2,
    sizeY: 2,
    rotation: 0,
    cost: 5500,
  },
  {
    id: 'university_init',
    typeId: 'university',
    name: 'Wiktoriański Uniwersytet',
    x: 16,
    y: 10,
    sizeX: 3,
    sizeY: 3,
    rotation: 0,
    cost: 11000,
  },
  {
    id: 'theatre_init',
    typeId: 'city_theatre',
    name: 'Teatr Miejski',
    x: 16,
    y: 14,
    sizeX: 3,
    sizeY: 2,
    rotation: 0,
    cost: 4800,
  },
  {
    id: 'cathedral_init',
    typeId: 'cathedral',
    name: 'Katedra',
    x: 6,
    y: 10,
    sizeX: 5,
    sizeY: 3,
    rotation: 90,
    cost: 12000,
  },
  {
    id: 'park_init',
    typeId: 'oak',
    name: 'Park Miejski',
    x: 11,
    y: 8,
    sizeX: 1,
    sizeY: 1,
    rotation: 0,
    cost: 1500,
  },
  {
    id: 'police_init',
    typeId: 'police_station',
    name: 'Policja',
    x: 12,
    y: 14,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 1800,
  },
  {
    id: 'courthouse_init',
    typeId: 'courthouse',
    name: 'Sąd Miejski',
    x: 14,
    y: 16,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 2800,
  },
  {
    id: 'fire_station_init',
    typeId: 'fire_station',
    name: 'Straż Pożarna',
    x: 15,
    y: 14,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 2000,
  },
  {
    id: 'pumping_station_init',
    typeId: 'pumping_station',
    name: 'Stacja Pomp',
    x: 12,
    y: 16,
    sizeX: 2,
    sizeY: 2,
    rotation: 90,
    cost: 3200,
  },
  {
    id: 'hospital_init',
    typeId: 'city_hospital',
    name: 'Szpital Miejski',
    x: 15,
    y: 16,
    sizeX: 2,
    sizeY: 2,
    rotation: 90,
    cost: 5400,
  },
  {
    id: 'baths_init',
    typeId: 'public_baths',
    name: 'Łaźnia i Pralnia',
    x: 17,
    y: 16,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 1600,
  },
  {
    id: 'library_init',
    typeId: 'public_library',
    name: 'Biblioteka Publiczna',
    x: 18,
    y: 16,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 2200,
  },
  {
    id: 'railway_station_init',
    typeId: 'railway_station',
    name: 'Stacja Kolejowa',
    x: 12,
    y: 19,
    sizeX: 2,
    sizeY: 4,
    rotation: 0,
    cost: 9500,
  },
  {
    id: 'tenement_workers_init',
    typeId: 'tenement_workers',
    name: 'Kamienica Robotnicza (Klasa R)',
    x: 9,
    y: 23,
    sizeX: 2,
    sizeY: 1,
    rotation: 90,
    cost: 1200,
  },
  {
    id: 'tenement_middle_init',
    typeId: 'tenement_middle',
    name: 'Kamienica Mieszczańska (Klasa M)',
    x: 9,
    y: 20,
    sizeX: 2,
    sizeY: 1,
    rotation: 90,
    cost: 2600,
  },
  {
    id: 'trade_school_init',
    typeId: 'trade_school',
    name: 'Szkoła Branżowa i Techniczna',
    x: 13,
    y: 14,
    sizeX: 2,
    sizeY: 2,
    rotation: 0,
    cost: 4200,
  },
  {
    id: 'coal_init',
    typeId: 'coal_plant',
    name: 'Elektrociepłownia Węglowa',
    x: 26,
    y: 22,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 6200,
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

      // 4 arterie radialne od bram miasta w 4 strony świata (zgodnie z korektą pozycji)
      if (
        (y === 45 && x <= 43) || // NW (o 5 pól w górę: y=45)
        (y === 48 && x >= 56) || // SE (o 2 kratki w górę: y=48)
        (x === 45 && y <= 43) || // NE (skorygowana o 2 w dół: x=45)
        (x === 48 && y >= 56)    // SW (o 2 kratki w górę: x=48)
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

  // Automatyczne wycięcie lasu pod Wiktoriańskim Średnim Miastem (12x12) w centrum siatki 100x100
  for (let tx = 42; tx <= 57; tx++) {
    for (let ty = 42; ty <= 57; ty++) {
      initial[`${tx},${ty}`] = 'grass';
    }
  }

  // Doprowadzenie 4 dróg radialnych bezpośrednio do 4 bram miasta
  for (let x = 42; x <= 43; x++) initial[`${x},45`] = 'road'; // Brama NW (y=45)
  for (let x = 56; x <= 57; x++) initial[`${x},48`] = 'road'; // Brama SE (y=48)
  for (let y = 42; y <= 43; y++) initial[`45,${y}`] = 'road'; // Brama NE (x=45)
  for (let y = 56; y <= 57; y++) initial[`48,${y}`] = 'road'; // Brama SW (x=48)

  return initial;
}

export const INITIAL_RURAL_BUILDINGS: PlacedBuilding[] = [
  {
    id: 'rural_city_center',
    typeId: 'city_miniature',
    name: 'Wiktoriańskie Średnie Miasto',
    x: 44,
    y: 44,
    sizeX: 12, // 6 * 2
    sizeY: 12, // 6 * 2
    rotation: 0,
    cost: 12000,
  },
];

// Wsteczna kompatybilność aliasów
export const createInitialTerrain = createInitialCityTerrain;
export const INITIAL_BUILDINGS = INITIAL_CITY_BUILDINGS;
