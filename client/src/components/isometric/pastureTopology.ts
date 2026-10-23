import type { PlacedBuilding } from './types';

/**
 * Sprawdza czy dany identyfikator budynku to pastwisko dowolnego typu.
 */
export function isPasture(typeId: string): boolean {
  return typeId === 'pasture_cattle' || typeId === 'pasture_sheep';
}

/**
 * Sprawdza czy dany budynek to wiejska ferma hodowlana zwierząt.
 */
export function isLivestockFarm(typeId: string): boolean {
  return typeId === 'livestock_farm';
}

/**
 * Sprawdza czy dany identyfikator budynku to pole pszenicy.
 */
export function isWheatField(typeId: string): boolean {
  return typeId === 'wheat_field';
}

/**
 * Sprawdza czy dany budynek to wielka farma zbożowa.
 */
export function isWheatFarm(typeId: string): boolean {
  return typeId === 'wheat_farm';
}

export interface GridRect {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
}

/**
 * Sprawdza czy dwa prostokąty na siatce stykają się co najmniej jedną krawędzią (bokiem).
 * Uwaga: styk wyłącznie w jednym narożniku (wierzchołku po skosie) NIE jest stykiem krawędzią.
 */
export function doRectanglesShareEdge(a: GridRect, b: GridRect): boolean {
  // Styk w pionie (wzdłuż osi X stykają się ściankami, nakładają się w osi Y na co najmniej 1 pole)
  const shareX =
    (a.x + a.sizeX === b.x || b.x + b.sizeX === a.x) &&
    Math.max(a.y, b.y) < Math.min(a.y + a.sizeY, b.y + b.sizeY);

  // Styk w poziomie (wzdłuż osi Y stykają się ściankami, nakładają się w osi X na co najmniej 1 pole)
  const shareY =
    (a.y + a.sizeY === b.y || b.y + b.sizeY === a.y) &&
    Math.max(a.x, b.x) < Math.min(a.x + a.sizeX, b.x + b.sizeX);

  return shareX || shareY;
}

/**
 * Reguła stawiania pastwiska:
 * Pastwisko musi stykać się co najmniej jedną krawędzią z Fermą Zwierzęcą lub z innym istniejącym pastwiskiem.
 */
export function canPlacePasture(
  coord: { x: number; y: number },
  sizeX: number,
  sizeY: number,
  placedBuildings: PlacedBuilding[]
): boolean {
  const newRect: GridRect = { x: coord.x, y: coord.y, sizeX, sizeY };

  return placedBuildings.some((b) => {
    if (isLivestockFarm(b.typeId) || isPasture(b.typeId)) {
      return doRectanglesShareEdge(newRect, b);
    }
    return false;
  });
}

/**
 * Reguła stawiania pola pszenicy:
 * Pole pszenicy musi stykać się co najmniej jedną krawędzią z Farmą Zbożową lub z innym istniejącym polem pszenicy.
 */
export function canPlaceWheatField(
  coord: { x: number; y: number },
  sizeX: number,
  sizeY: number,
  placedBuildings: PlacedBuilding[]
): boolean {
  const newRect: GridRect = { x: coord.x, y: coord.y, sizeX, sizeY };

  return placedBuildings.some((b) => {
    if (isWheatFarm(b.typeId) || isWheatField(b.typeId)) {
      return doRectanglesShareEdge(newRect, b);
    }
    return false;
  });
}

/**
 * Sprawdza czy dany budynek przylega przynajmniej jednym polem krawędzi (bok-bok) do kafelka drogi.
 */
export function isBuildingAdjacentToRoad(
  coord: { x: number; y: number },
  sizeX: number,
  sizeY: number,
  terrainTiles: Record<string, string>
): boolean {
  // 1. Górna krawędź (y - 1) oraz dolna krawędź (y + sizeY)
  for (let tx = coord.x; tx < coord.x + sizeX; tx++) {
    if (terrainTiles[`${tx},${coord.y - 1}`] === 'road') return true;
    if (terrainTiles[`${tx},${coord.y + sizeY}`] === 'road') return true;
  }

  // 2. Lewa krawędź (x - 1) oraz prawa krawędź (x + sizeX)
  for (let ty = coord.y; ty < coord.y + sizeY; ty++) {
    if (terrainTiles[`${coord.x - 1},${ty}`] === 'road') return true;
    if (terrainTiles[`${coord.x + sizeX},${ty}`] === 'road') return true;
  }

  // 3. Cztery narożniki stykowe działki (np. zakończenie drogi przy narożniku)
  if (terrainTiles[`${coord.x - 1},${coord.y - 1}`] === 'road') return true;
  if (terrainTiles[`${coord.x + sizeX},${coord.y - 1}`] === 'road') return true;
  if (terrainTiles[`${coord.x - 1},${coord.y + sizeY}`] === 'road') return true;
  if (terrainTiles[`${coord.x + sizeX},${coord.y + sizeY}`] === 'road') return true;

  return false;
}

export interface DemolishValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Pomocniczy algorytm BFS weryfikacji spójności grafu satelitów (pastwisk / pól) względem ich ferm macierzystych.
 */
function validateSatelliteDemolish(
  building: PlacedBuilding,
  placedBuildings: PlacedBuilding[],
  isHub: (typeId: string) => boolean,
  isSatellite: (typeId: string) => boolean,
  hubName: string,
  satelliteName: string
): DemolishValidationResult {
  // 1. Walidacja wyburzenia Farmy Głównej (Hub)
  if (isHub(building.typeId)) {
    const hasAdjacentSatellite = placedBuildings.some(
      (b) => isSatellite(b.typeId) && doRectanglesShareEdge(building, b)
    );
    if (hasAdjacentSatellite) {
      return {
        allowed: false,
        reason: `Nie można wyburzyć ${hubName}: do farmy przylegają ${satelliteName}. Najpierw usuń przylegające ${satelliteName}!`,
      };
    }
    return { allowed: true };
  }

  // 2. Walidacja wyburzenia Obiektu Satelitarnego (np. pastwisko / pole)
  if (isSatellite(building.typeId)) {
    const remainingBuildings = placedBuildings.filter((b) => b.id !== building.id);
    const remainingSatellites = remainingBuildings.filter((b) => isSatellite(b.typeId));

    // Jeśli na mapie nie ma już żadnych innych satelitów tego typu, usunięcie jest bezpieczne
    if (remainingSatellites.length === 0) {
      return { allowed: true };
    }

    const hubs = remainingBuildings.filter((b) => isHub(b.typeId));
    if (hubs.length === 0) {
      return {
        allowed: false,
        reason: `Nie można wyburzyć obiektu: na mapie brak ${hubName} zasilającej pozostałe ${satelliteName}!`,
      };
    }

    // BFS po grafie sąsiedztwa wychodzącym od ferm
    const visitedIds = new Set<string>();
    const queue: PlacedBuilding[] = [];

    for (const sat of remainingSatellites) {
      if (hubs.some((h) => doRectanglesShareEdge(sat, h))) {
        visitedIds.add(sat.id);
        queue.push(sat);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const nextSat of remainingSatellites) {
        if (!visitedIds.has(nextSat.id) && doRectanglesShareEdge(current, nextSat)) {
          visitedIds.add(nextSat.id);
          queue.push(nextSat);
        }
      }
    }

    const disconnectedCount = remainingSatellites.filter((s) => !visitedIds.has(s.id)).length;
    if (disconnectedCount > 0) {
      return {
        allowed: false,
        reason: `Nie można wyburzyć obiektu: jego usunięcie odetnie ${
          disconnectedCount === 1 ? `inne ${satelliteName}` : `${disconnectedCount} inne ${satelliteName}`
        } od ${hubName}!`,
      };
    }

    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Reguły wyburzania dla obiektów wiejskich (Pastwiska <-> Ferma Zwierzęca oraz Pola Pszenicy <-> Farma Zbożowa).
 */
export function canDemolishBuildingWithPastureRules(
  building: PlacedBuilding,
  placedBuildings: PlacedBuilding[]
): DemolishValidationResult {
  // Miasto i Ratusz to obiekty stałe, nienaruszalne
  if (building.typeId === 'city_miniature' || building.typeId === 'town_hall') {
    return {
      allowed: false,
      reason: 'Ośrodek metropolitalny jest stałym elementem obszaru geograficznego i nie może zostać wyburzony.',
    };
  }

  // Walidacja ekosystemu Fermy Zwierzęcej i Pastwisk
  if (isLivestockFarm(building.typeId) || isPasture(building.typeId)) {
    return validateSatelliteDemolish(
      building,
      placedBuildings,
      isLivestockFarm,
      isPasture,
      'Fermy Zwierzęcej',
      'pastwiska'
    );
  }

  // Walidacja ekosystemu Farmy Zbożowej i Pól Pszenicy
  if (isWheatFarm(building.typeId) || isWheatField(building.typeId)) {
    return validateSatelliteDemolish(
      building,
      placedBuildings,
      isWheatFarm,
      isWheatField,
      'Farmy Zbożowej',
      'pola pszenicy'
    );
  }

  // Wszelkie inne budynki nie podlegają tym regułom
  return { allowed: true };
}
