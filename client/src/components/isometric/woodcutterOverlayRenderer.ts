import type { PlacedBuilding, BuildingState } from './types';

export function renderWoodcutterOverlay(
  ctx: CanvasRenderingContext2D,
  _bldg: PlacedBuilding,
  centerX: number,
  drawY: number,
  state?: BuildingState
) {
  const forestTiles = state?.woodcutterForestTiles ?? 32;
  const efficiency = state?.woodcutterEfficiency ?? Math.min(100, Math.round((forestTiles / 32) * 100));

  ctx.save();
  const badgeW = 160;
  const badgeH = 28;
  const badgeX = centerX - badgeW / 2;
  const badgeY = drawY - 36;

  // Cień i kapsułka
  ctx.shadowColor = 'rgba(34, 197, 94, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fillStyle = 'rgba(12, 26, 16, 0.92)';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(12, 26, 16, 0.92)';
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Tekst
  ctx.font = 'bold 10.5px monospace';
  ctx.fillStyle = '#86efac';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🪓 Zrąb: ${efficiency}% (${forestTiles}/32)`, centerX, badgeY + badgeH / 2);

  ctx.restore();
}
