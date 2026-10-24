import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { calculateWoodcutterProgress } from './modal/woodcutter/woodcutterProgressMath';
import { DEFAULT_WOODCUTTER_CREW, type WoodcutterCrewStaff } from './modal/woodcutter/woodcutterTypes';

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export function renderWoodcutterOverlay(
  ctx: CanvasRenderingContext2D,
  _bldg: PlacedBuilding,
  centerX: number,
  drawY: number,
  state?: BuildingState,
  clockDate?: GameDate,
  mouseWorldPos?: { x: number; y: number } | null
) {
  const date: GameDate = clockDate || { day: 15, month: 11, year: 1880 };
  const forestTiles = state?.woodcutterForestTiles ?? 32;
  const efficiency = state?.woodcutterEfficiency ?? Math.min(100, Math.round((forestTiles / 32) * 100));
  const crew: WoodcutterCrewStaff = (state as any)?.woodcutterCrew || DEFAULT_WOODCUTTER_CREW;

  const prog = calculateWoodcutterProgress(date, crew);
  const isReady = prog.isStageReady;

  const collapsedW = 246;
  const collapsedH = 46;
  const expandedW = 296;
  const expandedH = 74;

  const testY = drawY - expandedH - 14;
  const isHovered = Boolean(
    mouseWorldPos &&
      mouseWorldPos.x >= centerX - expandedW / 2 - 8 &&
      mouseWorldPos.x <= centerX + expandedW / 2 + 8 &&
      mouseWorldPos.y >= testY - 8 &&
      mouseWorldPos.y <= drawY + 8
  );

  const pillW = isHovered ? expandedW : collapsedW;
  const pillH = isHovered ? expandedH : collapsedH;
  const pillX = centerX - pillW / 2;
  const pillY = drawY - pillH - 12;

  ctx.save();

  // 1. Zewnętrzny cień / poświata
  ctx.shadowColor = isReady ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
  ctx.shadowBlur = isHovered ? 14 : 9;
  ctx.shadowOffsetY = 2;

  // 2. Tło kapsuły
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fillStyle = 'rgba(12, 22, 14, 0.95)';
  ctx.fill();

  // 3. Obramowanie kapsuły
  ctx.strokeStyle = isReady ? '#22c55e' : '#f87171';
  ctx.lineWidth = isHovered ? 1.8 : 1.3;
  ctx.stroke();

  // Reset cienia
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 4. Trójkątny wskaźnik ku dachowi chaty drwali
  ctx.beginPath();
  ctx.moveTo(centerX - 6, pillY + pillH);
  ctx.lineTo(centerX + 6, pillY + pillH);
  ctx.lineTo(centerX, pillY + pillH + 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(12, 22, 14, 0.95)';
  ctx.fill();
  ctx.strokeStyle = isReady ? '#22c55e' : '#f87171';
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // ==========================================================================
  // TREŚĆ PASKA POSTĘPU WYRĘBU
  // ==========================================================================
  const leftX = pillX + 12;
  const barsW = 188;

  // A. Nagłówek etapu
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#dcfce7';
  const stageText = `${prog.stageInfo.icon} Krok ${prog.stageInfo.stepNumber}: ${prog.stageInfo.label}`;
  ctx.fillText(stageText, leftX, pillY + 8);

  // B. Procent postępu rocznego
  ctx.textAlign = 'right';
  if (isReady) {
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`${prog.progressPercent}%`, leftX + barsW, pillY + 8);
  } else {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('⛔ Brak', leftX + barsW, pillY + 8);
  }

  // C. Tor postępu
  const trackY = pillY + 24;
  const trackH = 8;
  drawRoundRect(ctx, leftX, trackY, barsW, trackH, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const fillW = Math.max(0, Math.min(barsW, (barsW * prog.progressPercent) / 100));
  if (fillW > 0) {
    drawRoundRect(ctx, leftX, trackY, fillW, trackH, 4);
    if (isReady) {
      const grad = ctx.createLinearGradient(leftX, 0, leftX + barsW, 0);
      grad.addColorStop(0, '#059669');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#84cc16');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#e11d48';
    }
    ctx.fill();
  }

  // D. Dodatkowy wiersz w stanie hover
  if (isHovered) {
    ctx.textAlign = 'left';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = isReady ? '#bbf7d0' : '#fda4af';
    ctx.fillText(
      isReady
        ? `✓ ${prog.stageInfo.requiredRole} • Baza: ${forestTiles}/32 pól (${efficiency}%)`
        : `⛔ Brak: ${prog.missingRole}`,
      leftX,
      pillY + 44
    );
  }

  // ==========================================================================
  // PRAWA SEKCJA: ZNACZNIK 📊 LUB MINI-SŁUPEK DREWNA
  // ==========================================================================
  if (!isHovered) {
    const btnX = leftX + barsW + 10;
    const btnY = pillY + 8;
    const btnW = 26;
    const btnH = 28;

    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 6);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪵', btnX + btnW / 2, btnY + btnH / 2);
  } else {
    const sepX = leftX + barsW + 12;
    ctx.beginPath();
    ctx.moveTo(sepX, pillY + 10);
    ctx.lineTo(sepX, pillY + pillH - 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const pillarCenter = sepX + 38;
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('🪵', pillarCenter, pillY + 6);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${state?.woodcutterStock ?? 0}`, pillarCenter, pillY + 28);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('t dłużycy', pillarCenter, pillY + 45);
  }

  ctx.restore();
}
