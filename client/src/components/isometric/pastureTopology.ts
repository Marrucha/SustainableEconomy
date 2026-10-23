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

export interface DemolishValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Reguły wyburzania dla Fermy Zwierzęcej i Pastwisk:
 * 1. Nie można usunąć farmy, dopóki styka się z choć jednym pastwiskiem.
 * 2. Nie można usunąć pastwiska, jeżeli po jego usunięciu jakiekolwiek pastwisko
 *    na mapie straci połączenie (ścieżkę grafu sąsiedztwa krawędziowego) z Farmą.
 */
export function canDemolishBuildingWithPastureRules(
  building: PlacedBuilding,
  placedBuildings: PlacedBuilding[]
): DemolishValidationResult {
  // 1. Walidacja wyburzenia Fermy Zwierzęcej
  if (isLivestockFarm(building.typeId)) {
    const hasAdjacentPasture = placedBuildings.some(
      (b) => isPasture(b.typeId) && doRectanglesShareEdge(building, b)
    );
    if (hasAdjacentPasture) {
      return {
        allowed: false,
        reason:
          'Nie można wyburzyć Fermy Zwierzęcej: do farmy przylegają pastwiska. Najpierw usuń pastwiska!',
      };
    }
    return { allowed: true };
  }

  // 2. Walidacja wyburzenia Pastwiska
  if (isPasture(building.typeId)) {
    const remainingBuildings = placedBuildings.filter((b) => b.id !== building.id);
    const remainingPastures = remainingBuildings.filter((b) => isPasture(b.typeId));

    // Jeśli na mapie nie ma już żadnych innych pastwisk, usunięcie jest bezpieczne
    if (remainingPastures.length === 0) {
      return { allowed: true };
    }

    const farms = remainingBuildings.filter((b) => isLivestockFarm(b.typeId));
    if (farms.length === 0) {
      return {
        allowed: false,
        reason:
          'Nie można wyburzyć pastwiska: na mapie brak Fermy Zwierzęcej zasilającej pozostałe pastwiska!',
      };
    }

    // BFS (przeszukiwanie wszerz) po grafie sąsiedztwa pastwisk wychodzącym od ferm
    const visitedPastureIds = new Set<string>();
    const queue: PlacedBuilding[] = [];

    // Dodajemy pastwiska bezpośrednio stykające się z którąkolwiek fermą
    for (const pasture of remainingPastures) {
      if (farms.some((f) => doRectanglesShareEdge(pasture, f))) {
        visitedPastureIds.add(pasture.id);
        queue.push(pasture);
      }
    }

    // Eksplorujemy spójną sieć pastwisk
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const nextPasture of remainingPastures) {
        if (!visitedPastureIds.has(nextPasture.id) && doRectanglesShareEdge(current, nextPasture)) {
          visitedPastureIds.add(nextPasture.id);
          queue.push(nextPasture);
        }
      }
    }

    // Czy któreś pastwisko zostało odcięte od fermy?
    const disconnectedCount = remainingPastures.filter((p) => !visitedPastureIds.has(p.id)).length;
    if (disconnectedCount > 0) {
      return {
        allowed: false,
        reason: `Nie można wyburzyć pastwiska: jego usunięcie odetnie ${
          disconnectedCount === 1 ? 'inne pastwisko' : `${disconnectedCount} inne pastwiska`
        } od Fermy Zwierzęcej!`,
      };
    }

    return { allowed: true };
  }

  // Wszelkie inne budynki nie podlegają regułom pastwisk
  return { allowed: true };
}
