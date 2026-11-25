import type { PlacedBuilding, BuildingCatalogItem, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { CURRENT_PLAYER_NAME } from './modal/industrySupplyConfig';

interface MarketplaceOverlayParams {
  ctx: CanvasRenderingContext2D;
  bldg: PlacedBuilding;
  catItem: BuildingCatalogItem;
  tileW: number;
  drawY: number;
  buildingState?: BuildingState;
  clockDate?: GameDate;
}

// Pozycje 8 straganów na spricie marketplace_norm.png (relatywnie do środka działki i wysokości sprita)
const STALL_SPRITE_ANCHORS: Record<number, { dxFactor: number; spriteY: number }> = {
  1: { dxFactor: -0.25, spriteY: 615 }, // PN-Zach (Zielone, 1/3 od PD-Zach)
  2: { dxFactor: -0.12, spriteY: 560 }, // PN-Zach (Bordowe)
  3: { dxFactor: 0.12, spriteY: 560 },  // PN-Wsch (Granatowe)
  4: { dxFactor: 0.25, spriteY: 615 },  // PN-Wsch (Złote)
  5: { dxFactor: -0.25, spriteY: 735 }, // PD-Zach (Bordowe)
  6: { dxFactor: -0.12, spriteY: 790 }, // PD-Zach (Zielone)
  7: { dxFactor: 0.12, spriteY: 790 },  // PD-Wsch (Złote)
  8: { dxFactor: 0.25, spriteY: 735 },  // PD-Wsch (Granatowe)
};

/**
 * Rysuje etykiety nad wszystkimi 8 straganami na Targowisku Miejskim:
 * - nad wolnymi: „Wolny”
 * - nad straganem gracza / obcych firm: nazwa firmy oraz liczba dni do kolejnego przetargu.
 */
export function renderMarketplaceOverlay({
  ctx,
  bldg,
  catItem,
  tileW,
  drawY,
  buildingState,
  clockDate,
}: MarketplaceOverlayParams) {
  const stalls = buildingState?.marketStalls || [];
  const year = clockDate?.year ?? 1880;
  const month = clockDate?.month ?? 1;
  const day = clockDate?.day ?? 1;
  const currentTotalDays = year * 360 + (month - 1) * 30 + day;

  const baseCenterX = (2 * bldg.x + bldg.sizeX - 2 * bldg.y - bldg.sizeY) * (tileW / 4);
  const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
  const scale = currentPlotWidth / (catItem.baseWidth || 1000);
  const playerCompanyName = buildingState?.ownerName || bldg.playerName || CURRENT_PLAYER_NAME;

  for (let slotIdx = 1; slotIdx <= 8; slotIdx += 1) {
    const stall = stalls.find((s) => s.slotIndex === slotIdx);
    const isRentedNow = Boolean(
      stall?.tenantName &&
        (stall.rentedUntilTotalDays !== undefined
          ? stall.rentedUntilTotalDays > currentTotalDays
          : (stall.rentedUntilYear ?? 0) >= year)
    );

    const anchor = STALL_SPRITE_ANCHORS[slotIdx] || { dxFactor: 0, spriteY: 600 };
    const edgeOffsetX = slotIdx === 3 || slotIdx === 4 || slotIdx === 5 || slotIdx === 6 ? 5 : 0;
    const centerX = baseCenterX + anchor.dxFactor * currentPlotWidth - 5 + edgeOffsetX;
    const anchorY = drawY + anchor.spriteY * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    if (!isRentedNow || !stall?.tenantName) {
      const boxW = 58;
      const boxH = 22;
      const boxX = centerX - boxW / 2;
      const boxY = anchorY - boxH - 30;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, boxW, boxH, 7);
      } else {
        ctx.rect(boxX, boxY, boxW, boxH);
      }
      ctx.fillStyle = 'rgba(17, 24, 39, 0.88)';
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(163, 163, 163, 0.75)';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 5, boxY + boxH);
      ctx.lineTo(centerX + 5, boxY + boxH);
      ctx.lineTo(centerX, boxY + boxH + 6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(163, 163, 163, 0.75)';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#d6d3d1';
      ctx.fillText('Wolny', centerX, boxY + boxH / 2);

      ctx.restore();
      continue;
    }

    const isPlayerStall = stall.tenantName === 'Gracz';
    const untilDays =
      stall.rentedUntilTotalDays !== undefined
        ? stall.rentedUntilTotalDays
        : ((stall.rentedUntilYear ?? year) + 1) * 360;
    const daysLeft = Math.max(0, untilDays - currentTotalDays);

    const companyLabel = isPlayerStall ? playerCompanyName : stall.tenantName;
    const countdownLabel =
      daysLeft === 0 ? '⏳ Dziś!' : daysLeft === 1 ? '⏳ 1 dzień' : `⏳ ${daysLeft} dni`;

    ctx.font = 'bold 10px sans-serif';
    const measuredW = Math.ceil(ctx.measureText(companyLabel).width);
    const boxW = Math.max(92, Math.min(138, measuredW + 18));
    const boxH = 36;
    const boxX = centerX - boxW / 2;
    const boxY = anchorY - boxH - 30;

    const borderColor = isPlayerStall
      ? daysLeft <= 30
        ? 'rgba(245, 158, 11, 0.9)'
        : 'rgba(16, 185, 129, 0.85)'
      : 'rgba(56, 189, 248, 0.8)';

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(boxX, boxY, boxW, boxH, 9);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 6, boxY + boxH);
    ctx.lineTo(centerX + 6, boxY + boxH);
    ctx.lineTo(centerX, boxY + boxH + 7);
    ctx.closePath();
    ctx.fillStyle = borderColor;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = isPlayerStall ? '#fde68a' : '#bae6fd';
    ctx.fillText(companyLabel, centerX, boxY + 11, boxW - 10);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = isPlayerStall ? (daysLeft <= 30 ? '#fbbf24' : '#6ee7b7') : '#e0f2fe';
    ctx.fillText(countdownLabel, centerX, boxY + 26);

    ctx.restore();
  }
}
