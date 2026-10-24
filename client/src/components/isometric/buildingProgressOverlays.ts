import { CATALOG } from './catalog';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { renderFarmProgressOverlay } from './farmOverlayRenderer';
import { renderLivestockProgressOverlay } from './livestockOverlayRenderer';
import { renderOrchardProgressOverlay } from './orchardOverlayRenderer';
import { renderMineOverlay } from './mineOverlayRenderer';
import { renderWoodcutterOverlay } from './woodcutterOverlayRenderer';
import { renderFlaxProgressOverlay } from './flaxOverlayRenderer';
import { renderHopProgressOverlay } from './hopOverlayRenderer';

export interface ProgressOverlaysParams {
  ctx: CanvasRenderingContext2D;
  placedBuildings: PlacedBuilding[];
  tileW: number;
  tileH: number;
  buildingsState?: Record<string, BuildingState>;
  clockDate?: GameDate;
  mouseWorldPos?: { x: number; y: number } | null;
}

export function renderBuildingProgressOverlays(p: ProgressOverlaysParams) {
  const { ctx, placedBuildings, tileW, tileH, buildingsState, clockDate, mouseWorldPos } = p;

  placedBuildings.forEach((bldg) => {
    // 1. Farma Zbożowa
    if (bldg.typeId === 'wheat_farm') {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / catItem.baseWidth;
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - catItem.anchorNormY * scale;

      renderFarmProgressOverlay({
        ctx,
        bldg,
        catItem,
        tileW,
        tileH,
        drawY,
        farmState: buildingsState?.[bldg.id]?.farmCapitalism,
        clockDate,
        mouseWorldPos,
      });
    }

    // 2. Plantacja Lnu
    if (bldg.typeId === 'flax_farm') {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1000);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - (catItem.anchorNormY || 750) * scale;

      renderFlaxProgressOverlay({
        ctx,
        bldg,
        catItem,
        tileW,
        tileH,
        drawY,
        flaxState: buildingsState?.[bldg.id]?.flaxState,
        clockDate,
        mouseWorldPos,
      });
    }

    // 2b. Farma Chmielu
    if (bldg.typeId === 'hop_farm') {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1000);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - (catItem.anchorNormY || 750) * scale;

      renderHopProgressOverlay({
        ctx,
        bldg,
        catItem,
        tileW,
        tileH,
        drawY,
        hopState: buildingsState?.[bldg.id]?.hopState,
        clockDate,
        mouseWorldPos,
      });
    }

    // 3. Ferma Zwierzęca
    if (bldg.typeId === 'livestock_farm') {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1095);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - catItem.anchorNormY * scale;

      renderLivestockProgressOverlay({
        ctx,
        bldg,
        catItem,
        tileW,
        tileH,
        drawY,
        livestockState: buildingsState?.[bldg.id]?.livestockState,
        clockDate,
        mouseWorldPos,
      });
    }

    // 4. Sad Owocowy
    if (bldg.typeId.startsWith('orchard')) {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1011);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - catItem.anchorNormY * scale;

      renderOrchardProgressOverlay({
        ctx,
        bldg,
        catItem,
        tileW,
        tileH,
        drawY,
        orchardState: buildingsState?.[bldg.id]?.orchardState,
        clockDate,
        mouseWorldPos,
      });
    }

    // 5. Kopalnia
    if (bldg.typeId.startsWith('mine_')) {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1007);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - (catItem.anchorNormY || 909) * scale;
      const centerX = (bldg.x + bldg.sizeX / 2 - (bldg.y + bldg.sizeY / 2)) * (tileW / 2);

      renderMineOverlay(ctx, bldg, centerX, drawY + 80, buildingsState?.[bldg.id], clockDate);
    }

    // 6. Wyręb Drewna
    if (bldg.typeId === 'woodcutter') {
      const catItem = CATALOG.find((c) => c.typeId === bldg.typeId);
      if (!catItem) return;
      const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
      const scale = currentPlotWidth / (catItem.baseWidth || 1290);
      const bottomY = (bldg.x + bldg.sizeX + (bldg.y + bldg.sizeY)) * (tileH / 2);
      const drawY = bottomY - (catItem.anchorNormY || 671) * scale;
      const centerX = (bldg.x + bldg.sizeX / 2 - (bldg.y + bldg.sizeY / 2)) * (tileW / 2);

      renderWoodcutterOverlay(ctx, bldg, centerX, drawY + 40, buildingsState?.[bldg.id], clockDate, mouseWorldPos);
    }
  });
}
