import { getBuildingGridDimensions, type MapType } from './mapConfig';
import type { PlacedBuilding, BuildingCatalogItem, TileDef } from './types';
import {
  isPasture,
  canPlacePasture,
  isWheatField,
  canPlaceWheatField,
  isFlaxField,
  canPlaceFlaxField,
  isHopField,
  canPlaceHopField,
  isBuildingAdjacentToRoad,
} from './pastureTopology';

export interface GhostPreviewParams {
  ctx: CanvasRenderingContext2D;
  selectedType: BuildingCatalogItem;
  hoverTile: { x: number; y: number };
  buildRotation: 0 | 90;
  mapType: MapType;
  tileW: number;
  tileH: number;
  gridX: number;
  gridY: number;
  placedBuildings: PlacedBuilding[];
  terrainTiles: Record<string, TileDef['type']>;
  gold: number;
  assets: Record<string, HTMLImageElement>;
}

export function renderGhostPreview(p: GhostPreviewParams) {
  const { ctx, selectedType, hoverTile, buildRotation, mapType, tileW, tileH, gridX, gridY, placedBuildings, terrainTiles, gold, assets } = p;

  const curRotation = selectedType.isSquare ? 0 : buildRotation;
  const { sizeX: curSizeX, sizeY: curSizeY } = getBuildingGridDimensions(
    selectedType,
    mapType,
    curRotation
  );

  const topX = (hoverTile.x - hoverTile.y) * (tileW / 2);
  const topY = (hoverTile.x + hoverTile.y) * (tileH / 2);
  const rightX = (hoverTile.x + curSizeX - hoverTile.y) * (tileW / 2);
  const rightY = (hoverTile.x + curSizeX + hoverTile.y) * (tileH / 2);
  const bottomX = (hoverTile.x + curSizeX - (hoverTile.y + curSizeY)) * (tileW / 2);
  const bottomY = (hoverTile.x + curSizeX + (hoverTile.y + curSizeY)) * (tileH / 2);
  const leftX = (hoverTile.x - (hoverTile.y + curSizeY)) * (tileW / 2);
  const leftY = (hoverTile.x + (hoverTile.y + curSizeY)) * (tileH / 2);

  const isCollision = placedBuildings.some(
    (b) =>
      hoverTile.x < b.x + b.sizeX &&
      hoverTile.x + curSizeX > b.x &&
      hoverTile.y < b.y + b.sizeY &&
      hoverTile.y + curSizeY > b.y
  );

  const minXBoundary = mapType === 'rural' ? 2 : 1;
  const isWaterOrOut =
    hoverTile.x <= minXBoundary ||
    hoverTile.x + curSizeX > gridX ||
    hoverTile.y < 0 ||
    hoverTile.y + curSizeY > gridY;

  const isRoadMode = selectedType.typeId.startsWith('road');
  const isHoveringRoad = terrainTiles[`${hoverTile.x},${hoverTile.y}`] === 'road';

  let isOnRoad = false;
  for (let tx = hoverTile.x; tx < hoverTile.x + curSizeX; tx++) {
    for (let ty = hoverTile.y; ty < hoverTile.y + curSizeY; ty++) {
      if (terrainTiles[`${tx},${ty}`] === 'road') isOnRoad = true;
    }
  }

  let woodcutterForestCount = 0;
  if (selectedType.typeId === 'woodcutter') {
    for (let tx = hoverTile.x; tx < hoverTile.x + curSizeX; tx++) {
      for (let ty = hoverTile.y; ty < hoverTile.y + curSizeY; ty++) {
        if (terrainTiles[`${tx},${ty}`]?.startsWith('forest')) {
          woodcutterForestCount++;
        }
      }
    }
  }

  let canBuild = false;
  if (isRoadMode) {
    canBuild = !isWaterOrOut && !isCollision && !isHoveringRoad && gold >= selectedType.cost;
  } else {
    const pastureValid =
      !isPasture(selectedType.typeId) ||
      canPlacePasture(hoverTile, curSizeX, curSizeY, placedBuildings);
    const wheatFieldValid =
      !isWheatField(selectedType.typeId) ||
      canPlaceWheatField(hoverTile, curSizeX, curSizeY, placedBuildings);
    const flaxFieldValid =
      !isFlaxField(selectedType.typeId) ||
      canPlaceFlaxField(hoverTile, curSizeX, curSizeY, placedBuildings);
    const hopFieldValid =
      !isHopField(selectedType.typeId) ||
      canPlaceHopField(hoverTile, curSizeX, curSizeY, placedBuildings);
    const isAgriculturalModule =
      isPasture(selectedType.typeId) ||
      isWheatField(selectedType.typeId) ||
      isFlaxField(selectedType.typeId) ||
      isHopField(selectedType.typeId);
    const isRoadExempt =
      isAgriculturalModule ||
      selectedType.typeId === 'city_miniature';
    const roadValid =
      isRoadExempt ||
      isBuildingAdjacentToRoad(hoverTile, curSizeX, curSizeY, terrainTiles);

    // Walidacja Wyrębu Drewna: można postawić WYŁĄCZNIE na lesie (min. 1 pole leśne pod parcelą)
    const woodcutterValid = selectedType.typeId !== 'woodcutter' || woodcutterForestCount > 0;

    canBuild =
      !isCollision &&
      !isWaterOrOut &&
      !isOnRoad &&
      pastureValid &&
      wheatFieldValid &&
      flaxFieldValid &&
      hopFieldValid &&
      roadValid &&
      woodcutterValid &&
      gold >= selectedType.cost;
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
    const subType = selectedType.roadSubType || 'curb';
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
    const spriteKey = `${selectedType.spriteBaseName}_${curRotation === 0 ? 'norm' : 'rot90'}`;
    const img = assets[spriteKey];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.globalAlpha = 0.75;
      const currentPlotWidth = (curSizeX + curSizeY) * (tileW / 2);
      const scale = currentPlotWidth / selectedType.baseWidth;
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      let anchorX = selectedType.anchorNormX;
      const anchorY = selectedType.anchorNormY;
      if (curRotation === 90 && !selectedType.isSquare) {
        anchorX = img.naturalWidth - selectedType.anchorNormX;
      }

      const drawX = bottomX - anchorX * scale;
      const drawY = bottomY - anchorY * scale;

      ctx.drawImage(img, drawX, drawY, w, h);
    }
  }

  // Wskaźnik wydajności dla Wyrębu Drewna (8x4 = 32 pola wiejskie)
  if (selectedType.typeId === 'woodcutter') {
    ctx.globalAlpha = 1.0;
    const maxRuralTiles = 32;
    const eff = Math.min(100, Math.round((woodcutterForestCount / maxRuralTiles) * 100));
    const hasRoad = isBuildingAdjacentToRoad(hoverTile, curSizeX, curSizeY, terrainTiles);

    let label = `🌲 Las: ${woodcutterForestCount}/${maxRuralTiles} pól • Wydajność: ${eff}%`;
    let isOk = canBuild;
    if (woodcutterForestCount === 0) {
      label = '⚠️ Wymagany las! Nie można postawić na trawie';
      isOk = false;
    } else if (!hasRoad) {
      label = '⚠️ Wymagany styk z drogą (traktem)!';
      isOk = false;
    }

    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    const textW = ctx.measureText(label).width;
    const badgeW = textW + 24;
    const badgeH = 28;
    const badgeX = bottomX - badgeW / 2;
    const badgeY = topY - 32;

    ctx.save();
    ctx.fillStyle = isOk ? 'rgba(12, 38, 18, 0.92)' : 'rgba(60, 10, 10, 0.92)';
    ctx.strokeStyle = isOk ? '#4ade80' : '#f87171';
    ctx.lineWidth = 1.5;

    // Zaokrąglony prostokąt badge'a
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
    }

    ctx.fillStyle = isOk ? '#bbf7d0' : '#fca5a5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bottomX, badgeY + badgeH / 2);
    ctx.restore();
  }

  ctx.restore();
}
