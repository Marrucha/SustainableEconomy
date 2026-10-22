import { TILE_WIDTH, TILE_HEIGHT, GRID_SIZE_X, GRID_SIZE_Y, CATALOG } from './catalog';
import type { TileDef } from './types';
import { tileToScreen } from './isoMath';
import { getBuildingGridDimensions, type MapType } from './mapConfig';
import type { PlacedBuilding, BuildingCatalogItem } from './types';

export interface RenderParams {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  dpr: number;
  zoom: number;
  pan: { x: number; y: number };
  assets: Record<string, HTMLImageElement>;
  terrainTiles: Record<string, TileDef['type']>;
  roadOrientations: Record<string, 0 | 90>;
  roadTypes: Record<string, 'curb' | 'seamless' | 'dirt'>;
  placedBuildings: PlacedBuilding[];
  selectedType: BuildingCatalogItem | null;
  buildRotation: 0 | 90;
  hoverTile: { x: number; y: number } | null;
  gold: number;
  inspectingBuilding: PlacedBuilding | null;
  inspectingRoad: { x: number; y: number } | null;
  mapType?: MapType;
  tileWidth?: number;
  tileHeight?: number;
  gridSizeX?: number;
  gridSizeY?: number;
}

export function renderIsometricScene(p: RenderParams) {
  const { ctx, canvasWidth, dpr, zoom, pan, assets } = p;
  const tileW = p.tileWidth || TILE_WIDTH;
  const tileH = p.tileHeight || TILE_HEIGHT;
  const gridX = p.gridSizeX || GRID_SIZE_X;
  const gridY = p.gridSizeY || GRID_SIZE_Y;
  const mapType = p.mapType || 'city';

  ctx.save();
  ctx.scale(dpr * zoom, dpr * zoom);
  ctx.translate(canvasWidth / (2 * dpr * zoom) + pan.x, 60 + pan.y);

  // 1. Tło planszy
  ctx.fillStyle = '#141416';
  ctx.fillRect(-3500, -2500, 7000, 5000);

  // 2. Rysowanie kafelków terenu
  const allTiles: TileDef[] = [];
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      allTiles.push({ x, y, type: p.terrainTiles[`${x},${y}`] || 'grass' });
    }
  }
  const sortedTiles = allTiles.sort((a, b) => a.x + a.y - (b.x + b.y));

  sortedTiles.forEach((tile) => {
    const { x: topX, y: topY } = tileToScreen(tile.x, tile.y, tileW, tileH);
    const screenX = topX - tileW / 2;
    const screenY = topY;

    let tileImgKey = 'tile_grass';
    if (tile.type === 'road') {
      const manualOri = p.roadOrientations[`${tile.x},${tile.y}`];
      const subType = p.roadTypes[`${tile.x},${tile.y}`] || 'curb';
      let dir = 'y';

      if (manualOri !== undefined) {
        dir = manualOri === 0 ? 'y' : 'x';
      } else {
        const hasRoadY =
          p.terrainTiles[`${tile.x},${tile.y - 1}`] === 'road' ||
          p.terrainTiles[`${tile.x},${tile.y + 1}`] === 'road';
        const hasRoadX =
          p.terrainTiles[`${tile.x - 1},${tile.y}`] === 'road' ||
          p.terrainTiles[`${tile.x + 1},${tile.y}`] === 'road';

        if (hasRoadY && !hasRoadX) dir = 'x';
        else if (hasRoadX && !hasRoadY) dir = 'y';
        else dir = tile.x === 2 && tile.y !== 2 ? 'x' : 'y';
      }

      if (subType === 'seamless') {
        tileImgKey = dir === 'x' ? 'tile_road_cobble_seamless_x' : 'tile_road_cobble_seamless_y';
      } else if (subType === 'dirt') {
        tileImgKey = dir === 'x' ? 'tile_road_dirt_x' : 'tile_road_dirt_y';
      } else {
        tileImgKey = dir === 'x' ? 'tile_road_x' : 'tile_road_y';
      }
    } else if (tile.type === 'water') {
      tileImgKey = 'tile_water';
    } else if (tile.type === 'quay') {
      tileImgKey = 'tile_quay';
    }

    // Rysowanie płaskiego podłoża (trawa, droga, nabrzeże, woda)
    const tileImg = assets[tileImgKey] || assets['tile_grass'];
    if (tileImg && tileImg.complete && tileImg.naturalWidth > 0) {
      ctx.drawImage(tileImg, screenX, screenY, tileW, tileH);
    }

    // Subtelna siatka
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX + tileW / 2, topY + tileH / 2);
    ctx.lineTo(topX, topY + tileH);
    ctx.lineTo(topX - tileW / 2, topY + tileH / 2);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.restore();
  });

  // 3. Rysowanie Obiektów Wznoszących się w Pionie (Budynki + Drzewa Leśne)
  // Topologiczne sortowanie głębokości: drzewa i obiekty leżące poniżej krawędzi ogrodzenia
  // są bezwzględnie rysowane PO budynku, dzięki czemu korony drzew naturalnie przykrywają płot.
  type ElevatedItem =
    | {
        kind: 'building';
        bldg: PlacedBuilding;
        x: number;
        y: number;
        sizeX: number;
        sizeY: number;
        depth: number;
      }
    | {
        kind: 'forest';
        tile: TileDef;
        x: number;
        y: number;
        sizeX: number;
        sizeY: number;
        depth: number;
      };

  const elevatedItems: ElevatedItem[] = [];

  p.placedBuildings.forEach((bldg) => {
    elevatedItems.push({
      kind: 'building',
      bldg,
      x: bldg.x,
      y: bldg.y,
      sizeX: bldg.sizeX,
      sizeY: bldg.sizeY,
      depth: bldg.x + bldg.sizeX + bldg.y + bldg.sizeY,
    });
  });

  allTiles.forEach((tile) => {
    if (
      tile.type === 'forest_oak' ||
      tile.type === 'forest_pine' ||
      tile.type === 'forest_grove'
    ) {
      // Zabezpieczenie: jeśli na tym kafelku stoi jakikolwiek budynek, las nie może się rysować
      const isUnderBuilding = p.placedBuildings.some(
        (b) =>
          tile.x >= b.x &&
          tile.x < b.x + b.sizeX &&
          tile.y >= b.y &&
          tile.y < b.y + b.sizeY
      );
      if (isUnderBuilding) return;

      elevatedItems.push({
        kind: 'forest',
        tile,
        x: tile.x,
        y: tile.y,
        sizeX: 1,
        sizeY: 1,
        depth: tile.x + 1 + tile.y + 1,
      });
    }
  });

  // Komparator głębokości dla rzutu izometrycznego 2.5D
  elevatedItems.sort((a, b) => {
    // Relacja: Drzewo vs Budynek
    // Jeżeli drzewo znajduje się poniżej/przed prawą lub lewą przednią krawędzią budynku,
    // to jest PRZED budynkiem i musi być narysowane PO nim (na wierzchu).
    if (a.kind === 'forest' && b.kind === 'building') {
      const inFrontOfRightEdge = a.x >= b.x + b.sizeX && a.y >= b.y;
      const inFrontOfLeftEdge = a.y >= b.y + b.sizeY && a.x >= b.x;
      if (inFrontOfRightEdge || inFrontOfLeftEdge) return 1;
      if (a.x < b.x + b.sizeX && a.y < b.y + b.sizeY) return -1;
      return a.depth - b.depth;
    }

    if (a.kind === 'building' && b.kind === 'forest') {
      const inFrontOfRightEdge = b.x >= a.x + a.sizeX && b.y >= a.y;
      const inFrontOfLeftEdge = b.y >= a.y + a.sizeY && b.x >= a.x;
      if (inFrontOfRightEdge || inFrontOfLeftEdge) return -1;
      if (b.x < a.x + a.sizeX && b.y < a.y + a.sizeY) return 1;
      return a.depth - b.depth;
    }

    // Budynek vs Budynek lub Drzewo vs Drzewo
    if (a.x >= b.x + b.sizeX && a.y + a.sizeY > b.y) return 1;
    if (a.y >= b.y + b.sizeY && a.x + a.sizeX > b.x) return 1;
    if (b.x >= a.x + a.sizeX && b.y + b.sizeY > a.y) return -1;
    if (b.y >= a.y + a.sizeY && b.x + b.sizeX > a.x) return -1;

    // Domyślne sortowanie rosnąco po głębokości rzutu
    return a.depth - b.depth;
  });

  elevatedItems.forEach((item) => {
    if (item.kind === 'building') {
      const bldg = item.bldg;
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;

      const rot = bldg.rotation || 0;
      const spriteKey = `${catItem.spriteBaseName}_${rot === 0 ? 'norm' : 'rot90'}`;
      const img = assets[spriteKey];

      if (img && img.complete && img.naturalWidth > 0) {
        const topX = (bldg.x - bldg.y) * (tileW / 2);
        const topY = (bldg.x + bldg.y) * (tileH / 2);
        const rightX = (bldg.x + bldg.sizeX - bldg.y) * (tileW / 2);
        const rightY = (bldg.x + bldg.sizeX + bldg.y) * (tileH / 2);
        const bottomX = (bldg.x + bldg.sizeX - (bldg.y + bldg.sizeY)) * (tileW / 2);
        const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
        const leftX = (bldg.x - (bldg.y + bldg.sizeY)) * (tileW / 2);
        const leftY = (bldg.x + (bldg.y + bldg.sizeY)) * (tileH / 2);

        const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
        const scale = currentPlotWidth / catItem.baseWidth;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;

        let anchorX = catItem.anchorNormX;
        const anchorY = catItem.anchorNormY;
        if (rot === 90 && !catItem.isSquare) {
          anchorX = img.naturalWidth - catItem.anchorNormX;
        }

        const drawX = bottomX - anchorX * scale;
        const drawY = bottomY - anchorY * scale;

        // Cień pod budynkiem (wyłączony dla obiektów rolniczych z pełnym podłożem)
        if (catItem.category !== 'Budynki rolnicze') {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.lineTo(rightX, rightY);
          ctx.lineTo(bottomX, bottomY);
          ctx.lineTo(leftX, leftY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fill();
          ctx.restore();
        }

        ctx.drawImage(img, drawX, drawY, w, h);
      }
    } else {
      // Rysowanie drzew leśnych
      const tile = item.tile;
      const { x: topX, y: topY } = tileToScreen(tile.x, tile.y, tileW, tileH);
      const forestImg = assets[`tile_${tile.type}`];

      if (forestImg && forestImg.complete && forestImg.naturalWidth > 0) {
        let baseWidth = 702;
        let anchorX = 428;
        let anchorY = 992;
        if (tile.type === 'forest_pine') {
          baseWidth = 509;
          anchorX = 277;
          anchorY = 956;
        } else if (tile.type === 'forest_grove') {
          baseWidth = 702;
          anchorX = 386;
          anchorY = 987;
        }

        const scale = tileW / baseWidth;
        const w = forestImg.naturalWidth * scale;
        const h = forestImg.naturalHeight * scale;
        const bottomX = topX;
        const bottomY = topY + tileH;
        const drawX = bottomX - anchorX * scale;
        const drawY = bottomY - anchorY * scale;

        ctx.drawImage(forestImg, drawX, drawY, w, h);
      }
    }
  });

  // 4. Podgląd stawiania (Ghost Preview)
  if (p.selectedType && p.hoverTile) {
    const curRotation = p.selectedType.isSquare ? 0 : p.buildRotation;
    const { sizeX: curSizeX, sizeY: curSizeY } = getBuildingGridDimensions(
      p.selectedType,
      mapType,
      curRotation
    );

    const topX = (p.hoverTile.x - p.hoverTile.y) * (tileW / 2);
    const topY = (p.hoverTile.x + p.hoverTile.y) * (tileH / 2);
    const rightX = (p.hoverTile.x + curSizeX - p.hoverTile.y) * (tileW / 2);
    const rightY = (p.hoverTile.x + curSizeX + p.hoverTile.y) * (tileH / 2);
    const bottomX = (p.hoverTile.x + curSizeX - (p.hoverTile.y + curSizeY)) * (tileW / 2);
    const bottomY = (p.hoverTile.x + curSizeX + (p.hoverTile.y + curSizeY)) * (tileH / 2);
    const leftX = (p.hoverTile.x - (p.hoverTile.y + curSizeY)) * (tileW / 2);
    const leftY = (p.hoverTile.x + (p.hoverTile.y + curSizeY)) * (tileH / 2);

    const isCollision = p.placedBuildings.some(
      (b) =>
        p.hoverTile!.x < b.x + b.sizeX &&
        p.hoverTile!.x + curSizeX > b.x &&
        p.hoverTile!.y < b.y + b.sizeY &&
        p.hoverTile!.y + curSizeY > b.y
    );

    const minXBoundary = mapType === 'rural' ? 2 : 1;
    const isWaterOrOut =
      p.hoverTile.x <= minXBoundary ||
      p.hoverTile.x + curSizeX > gridX ||
      p.hoverTile.y < 0 ||
      p.hoverTile.y + curSizeY > gridY;

    const isRoadMode = p.selectedType.typeId.startsWith('road');
    const isHoveringRoad = p.terrainTiles[`${p.hoverTile.x},${p.hoverTile.y}`] === 'road';

    let isOnRoad = false;
    for (let tx = p.hoverTile.x; tx < p.hoverTile.x + curSizeX; tx++) {
      for (let ty = p.hoverTile.y; ty < p.hoverTile.y + curSizeY; ty++) {
        if (p.terrainTiles[`${tx},${ty}`] === 'road') isOnRoad = true;
      }
    }

    let canBuild = false;
    if (isRoadMode) {
      canBuild = !isWaterOrOut && !isCollision && !isHoveringRoad && p.gold >= p.selectedType.cost;
    } else {
      canBuild = !isCollision && !isWaterOrOut && !isOnRoad && p.gold >= p.selectedType.cost;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(bottomX, bottomY);
    ctx.lineTo(leftX, leftY);
    ctx.closePath();

    ctx.fillStyle = canBuild ? 'rgba(74, 222, 128, 0.35)' : 'rgba(239, 68, 68, 0.4)';
    ctx.fill();
    ctx.strokeStyle = canBuild ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isRoadMode) {
      const subType = p.selectedType.roadSubType || 'curb';
      let baseKey = 'tile_road';
      if (subType === 'seamless') baseKey = 'tile_road_cobble_seamless';
      else if (subType === 'dirt') baseKey = 'tile_road_dirt';

      const roadImgKey = curRotation === 0 ? `${baseKey}_y` : `${baseKey}_x`;
      const rImg = assets[roadImgKey];
      if (rImg && rImg.complete && rImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(rImg, topX - tileW / 2, topY, tileW, tileH);
      }
    } else {
      const spriteKey = `${p.selectedType.spriteBaseName}_${curRotation === 0 ? 'norm' : 'rot90'}`;
      const img = assets[spriteKey];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.75;
        const currentPlotWidth = (curSizeX + curSizeY) * (tileW / 2);
        const scale = currentPlotWidth / p.selectedType.baseWidth;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;

        let anchorX = p.selectedType.anchorNormX;
        const anchorY = p.selectedType.anchorNormY;
        if (curRotation === 90 && !p.selectedType.isSquare) {
          anchorX = img.naturalWidth - p.selectedType.anchorNormX;
        }

        const drawX = bottomX - anchorX * scale;
        const drawY = bottomY - anchorY * scale;

        ctx.drawImage(img, drawX, drawY, w, h);
      }
    }
    ctx.restore();
  }

  // 5. Wyróżnienie inspekcji (Droga)
  if (p.inspectingRoad) {
    const { x: topX, y: topY } = tileToScreen(p.inspectingRoad.x, p.inspectingRoad.y, tileW, tileH);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX + tileW / 2, topY + tileH / 2);
    ctx.lineTo(topX, topY + tileH);
    ctx.lineTo(topX - tileW / 2, topY + tileH / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  // 6. Wyróżnienie inspekcji (Budynek)
  if (p.inspectingBuilding) {
    const b = p.inspectingBuilding;
    const topX = (b.x - b.y) * (tileW / 2);
    const topY = (b.x + b.y) * (tileH / 2);
    const rightX = (b.x + b.sizeX - b.y) * (tileW / 2);
    const rightY = (b.x + b.sizeX + b.y) * (tileH / 2);
    const bottomX = (b.x + b.sizeX - (b.y + b.sizeY)) * (tileW / 2);
    const bottomY = (b.x + b.sizeX + (b.y + b.sizeY)) * (tileH / 2);
    const leftX = (b.x - (b.y + b.sizeY)) * (tileW / 2);
    const leftY = (b.x + (b.y + b.sizeY)) * (tileH / 2);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(bottomX, bottomY);
    ctx.lineTo(leftX, leftY);
    ctx.closePath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
