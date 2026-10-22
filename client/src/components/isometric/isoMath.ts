import { TILE_WIDTH, TILE_HEIGHT, GRID_SIZE_X, GRID_SIZE_Y } from './catalog';

export interface GridCoord {
  x: number;
  y: number;
}

export interface ScreenCoord {
  x: number;
  y: number;
}

/**
 * Konwertuje współrzędne siatki (x, y) na współrzędne ekranu (wierzchołek górny rombu kafelka).
 */
export function tileToScreen(
  x: number,
  y: number,
  tileWidth: number = TILE_WIDTH,
  tileHeight: number = TILE_HEIGHT
): ScreenCoord {
  return {
    x: (x - y) * (tileWidth / 2),
    y: (x + y) * (tileHeight / 2),
  };
}

/**
 * Przelicza współrzędne kursora myszy na kafelki siatki izometrycznej.
 */
export function screenToTile(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement | null,
  zoom: number,
  pan: { x: number; y: number },
  tileWidth: number = TILE_WIDTH,
  tileHeight: number = TILE_HEIGHT,
  gridSizeX: number = GRID_SIZE_X,
  gridSizeY: number = GRID_SIZE_Y
): GridCoord | null {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();

  const mouseX = (clientX - rect.left - rect.width / 2) / zoom - pan.x;
  const mouseY = (clientY - rect.top) / zoom - 60 - pan.y;

  const u = mouseX / (tileWidth / 2);
  const v = mouseY / (tileHeight / 2);

  const tileX = Math.floor((u + v) / 2);
  const tileY = Math.floor((v - u) / 2);

  if (tileX >= 0 && tileX < gridSizeX && tileY >= 0 && tileY < gridSizeY) {
    return { x: tileX, y: tileY };
  }
  return null;
}
