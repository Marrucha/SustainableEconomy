import { TILE_WIDTH, TILE_HEIGHT, GRID_SIZE_X, GRID_SIZE_Y, CATALOG } from './catalog';
import type { TileDef } from './types';
import { tileToScreen } from './isoMath';
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
}

export function renderIsometricScene(p: RenderParams) {
  const { ctx, canvasWidth, dpr, zoom, pan, assets } = p;

  ctx.save();
  ctx.scale(dpr * zoom, dpr * zoom);
  ctx.translate(canvasWidth / (2 * dpr * zoom) + pan.x, 60 + pan.y);

  // 1. Tło planszy
  ctx.fillStyle = '#141416';
  ctx.fillRect(-3500, -2500, 7000, 5000);

  // 2. Rysowanie kafelków terenu
  const allTiles: TileDef[] = [];
  for (let x = 0; x < GRID_SIZE_X; x++) {
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      allTiles.push({ x, y, type: p.terrainTiles[`${x},${y}`] || 'grass' });
    }
  }
  const sortedTiles = allTiles.sort((a, b) => a.x + a.y - (b.x + b.y));

  sortedTiles.forEach((tile) => {
    const { x: topX, y: topY } = tileToScreen(tile.x, tile.y);
    const screenX = topX - TILE_WIDTH / 2;
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

    const isForest =
      tile.type === 'forest_oak' ||
      tile.type === 'forest_pine' ||
      tile.type === 'forest_grove';

    if (isForest) {
      // Podłoże pod lasem (zielona trawa)
      const grassImg = assets['tile_grass'];
      if (grassImg && grassImg.complete && grassImg.naturalWidth > 0) {
        ctx.drawImage(grassImg, screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
      }

      // Korony i pnie drzew zakotwiczone w dolnym wierzchołku diamentu
      const forestImg = assets[`tile_${tile.type}`];
      if (forestImg && forestImg.complete && forestImg.naturalWidth > 0) {
        let baseWidth = 974;
        let anchorX = 486;
        let anchorY = 912;
        if (tile.type === 'forest_pine') {
          baseWidth = 726;
          anchorX = 358;
          anchorY = 907;
        } else if (tile.type === 'forest_grove') {
          baseWidth = 902;
          anchorX = 450;
          anchorY = 879;
        }

        const scale = TILE_WIDTH / baseWidth;
        const w = forestImg.naturalWidth * scale;
        const h = forestImg.naturalHeight * scale;
        const bottomX = topX;
        const bottomY = topY + TILE_HEIGHT;
        const drawX = bottomX - anchorX * scale;
        const drawY = bottomY - anchorY * scale;

        ctx.drawImage(forestImg, drawX, drawY, w, h);
      }
    } else {
      const tileImg = assets[tileImgKey];
      if (tileImg && tileImg.complete && tileImg.naturalWidth > 0) {
        ctx.drawImage(tileImg, screenX, screenY, TILE_WIDTH, TILE_HEIGHT);
      }
    }

    // Subtelna siatka
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX + TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
    ctx.lineTo(topX, topY + TILE_HEIGHT);
    ctx.lineTo(topX - TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.restore();
  });

  // 3. Rysowanie Budynków (Painter's algorithm - sortowanie po głębokości)
  const sortedBuildings = [...p.placedBuildings].sort(
    (a, b) => a.x + a.sizeX + a.y + a.sizeY - (b.x + b.sizeX + b.y + b.sizeY)
  );

  sortedBuildings.forEach((bldg) => {
    const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
    if (!catItem) return;

    const rot = bldg.rotation || 0;
    const spriteKey = `${catItem.spriteBaseName}_${rot === 0 ? 'norm' : 'rot90'}`;
    const img = assets[spriteKey];

    if (img && img.complete && img.naturalWidth > 0) {
      const topX = (bldg.x - bldg.y) * (TILE_WIDTH / 2);
      const topY = (bldg.x + bldg.y) * (TILE_HEIGHT / 2);
      const rightX = (bldg.x + bldg.sizeX - bldg.y) * (TILE_WIDTH / 2);
      const rightY = (bldg.x + bldg.sizeX + bldg.y) * (TILE_HEIGHT / 2);
      const bottomX = (bldg.x + bldg.sizeX - (bldg.y + bldg.sizeY)) * (TILE_WIDTH / 2);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (TILE_HEIGHT / 2);
      const leftX = (bldg.x - (bldg.y + bldg.sizeY)) * (TILE_WIDTH / 2);
      const leftY = (bldg.x + (bldg.y + bldg.sizeY)) * (TILE_HEIGHT / 2);

      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (TILE_WIDTH / 2);
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

      // Cień pod budynkiem
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

      ctx.drawImage(img, drawX, drawY, w, h);
    }
  });

  // 4. Podgląd stawiania (Ghost Preview)
  if (p.selectedType && p.hoverTile) {
    const curRotation = p.selectedType.isSquare ? 0 : p.buildRotation;
    const curSizeX = curRotation === 0 ? p.selectedType.defaultSizeX : p.selectedType.defaultSizeY;
    const curSizeY = curRotation === 0 ? p.selectedType.defaultSizeY : p.selectedType.defaultSizeX;

    const topX = (p.hoverTile.x - p.hoverTile.y) * (TILE_WIDTH / 2);
    const topY = (p.hoverTile.x + p.hoverTile.y) * (TILE_HEIGHT / 2);
    const rightX = (p.hoverTile.x + curSizeX - p.hoverTile.y) * (TILE_WIDTH / 2);
    const rightY = (p.hoverTile.x + curSizeX + p.hoverTile.y) * (TILE_HEIGHT / 2);
    const bottomX = (p.hoverTile.x + curSizeX - (p.hoverTile.y + curSizeY)) * (TILE_WIDTH / 2);
    const bottomY = (p.hoverTile.x + curSizeX + (p.hoverTile.y + curSizeY)) * (TILE_HEIGHT / 2);
    const leftX = (p.hoverTile.x - (p.hoverTile.y + curSizeY)) * (TILE_WIDTH / 2);
    const leftY = (p.hoverTile.x + (p.hoverTile.y + curSizeY)) * (TILE_HEIGHT / 2);

    const isCollision = p.placedBuildings.some(
      (b) =>
        p.hoverTile!.x < b.x + b.sizeX &&
        p.hoverTile!.x + curSizeX > b.x &&
        p.hoverTile!.y < b.y + b.sizeY &&
        p.hoverTile!.y + curSizeY > b.y
    );

    const isWaterOrOut =
      p.hoverTile.x <= 1 ||
      p.hoverTile.x + curSizeX > GRID_SIZE_X ||
      p.hoverTile.y < 0 ||
      p.hoverTile.y + curSizeY > GRID_SIZE_Y;

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
        ctx.drawImage(rImg, topX - TILE_WIDTH / 2, topY, TILE_WIDTH, TILE_HEIGHT);
      }
    } else {
      const spriteKey = `${p.selectedType.spriteBaseName}_${curRotation === 0 ? 'norm' : 'rot90'}`;
      const img = assets[spriteKey];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.75;
        const currentPlotWidth = (curSizeX + curSizeY) * (TILE_WIDTH / 2);
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
    const { x: topX, y: topY } = tileToScreen(p.inspectingRoad.x, p.inspectingRoad.y);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX + TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
    ctx.lineTo(topX, topY + TILE_HEIGHT);
    ctx.lineTo(topX - TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
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
    const topX = (b.x - b.y) * (TILE_WIDTH / 2);
    const topY = (b.x + b.y) * (TILE_HEIGHT / 2);
    const rightX = (b.x + b.sizeX - b.y) * (TILE_WIDTH / 2);
    const rightY = (b.x + b.sizeX + b.y) * (TILE_HEIGHT / 2);
    const bottomX = (b.x + b.sizeX - (b.y + b.sizeY)) * (TILE_WIDTH / 2);
    const bottomY = (b.x + b.sizeX + (b.y + b.sizeY)) * (TILE_HEIGHT / 2);
    const leftX = (b.x - (b.y + b.sizeY)) * (TILE_WIDTH / 2);
    const leftY = (b.x + (b.y + b.sizeY)) * (TILE_HEIGHT / 2);

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
