import type { PlacedBuilding, BuildingCatalogItem } from './types';
import type { OrchardCapitalismState } from './modal/orchard/orchardTypes';
import {
  createDefaultOrchardState,
  checkIsOrchardReady,
  FRUITS_CONFIG,
} from './modal/orchard/orchardTypes';
import { calculateOrchardProgress } from './modal/orchard/orchardProgressMath';
import type { GameDate } from './clock/gameClockTypes';

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

export interface OrchardOverlayParams {
  ctx: CanvasRenderingContext2D;
  bldg: PlacedBuilding;
  catItem: BuildingCatalogItem;
  tileW: number;
  tileH: number;
  drawY: number;
  orchardState?: OrchardCapitalismState;
  clockDate?: GameDate;
  mouseWorldPos?: { x: number; y: number } | null;
}

/**
 * Rysuje elegancki pasek postępu cyklu wegetacji sadu owocowego bezpośrednio nad koronami drzew.
 * W stanie zwiniętym: pokazuje wyłącznie pasek cyklu sadowniczego + znacznik [ 📊 ].
 * Po najechaniu (hover): rozwija słupki rocznej produkcji owoców, cydru i drewna z przycinania.
 */
export function renderOrchardProgressOverlay(p: OrchardOverlayParams) {
  const { ctx, bldg, tileW, drawY, orchardState, clockDate } = p;

  const orchState = orchardState || createDefaultOrchardState();
  const readyCheck = checkIsOrchardReady(orchState);
  const isReady = readyCheck.isReady;

  const date: GameDate = clockDate || { day: 15, month: 4, year: 1880 };
  const isConfigured = Boolean(orchState.isFruitLocked && orchState.fruitType);
  const fruitKey = (orchState.fruitType || 'jablko');
  const fruit = FRUITS_CONFIG[fruitKey] || FRUITS_CONFIG.jablko;

  // Spójna matematyka wegetacji sadu (start w marcu, zbiory zależne od gatunku)
  const progress = calculateOrchardProgress(isConfigured ? orchState.fruitType : undefined, date);
  const progressPercent = isConfigured ? progress.progressPercent : 0;

  // Szacunki rocznej produkcji sadu (1 aktywne owoce)
  const pomBonus = orchState.pomologist?.hired ? 1 + orchState.pomologist.yieldBonusPercent / 100 : 1.0;
  const annualFruitKg = Math.round(fruit.baseYield * pomBonus * 1.15);

  // Środek geometryczny parceli 2x2 sadu
  const centerX = (2 * bldg.x + bldg.sizeX - 2 * bldg.y - bldg.sizeY) * (tileW / 4);

  // Wymiary i precyzyjna pozycja paska tuż nad koronami drzew sadu (anchorNormY = 707)
  const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
  const scale = currentPlotWidth / (p.catItem.baseWidth || 1011);
  const treeTopY = drawY + 230 * scale;

  const collapsedW = 246;
  const collapsedH = 46;
  const expandedW = 296;
  const expandedH = 74;

  // Wykrywanie hover myszy
  const mouse = p.mouseWorldPos;
  const testY = treeTopY - expandedH - 12;
  const isHovered = Boolean(
    mouse &&
      mouse.x >= centerX - expandedW / 2 - 8 &&
      mouse.x <= centerX + expandedW / 2 + 8 &&
      mouse.y >= testY - 8 &&
      mouse.y <= treeTopY + 8
  );

  const pillW = isHovered ? expandedW : collapsedW;
  const pillH = isHovered ? expandedH : collapsedH;
  const pillX = centerX - pillW / 2;
  const pillY = treeTopY - pillH - 12;

  ctx.save();

  // 1. Zewnętrzny cień / poświata
  ctx.shadowColor = isReady ? 'rgba(234, 179, 8, 0.45)' : 'rgba(244, 63, 94, 0.45)';
  ctx.shadowBlur = isHovered ? 14 : 9;
  ctx.shadowOffsetY = 2;

  // 2. Tło kapsuły
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fillStyle = 'rgba(18, 16, 14, 0.95)';
  ctx.fill();

  // 3. Obramowanie kapsuły
  ctx.strokeStyle = isReady ? '#eab308' : '#f43f5e';
  ctx.lineWidth = isHovered ? 1.8 : 1.3;
  ctx.stroke();

  // Reset cienia
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 4. Trójkątny wskaźnik ku koronom drzew
  ctx.beginPath();
  ctx.moveTo(centerX - 6, pillY + pillH);
  ctx.lineTo(centerX + 6, pillY + pillH);
  ctx.lineTo(centerX, pillY + pillH + 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(18, 16, 14, 0.95)';
  ctx.fill();
  ctx.strokeStyle = isReady ? '#eab308' : '#f43f5e';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // ==========================================================================
  // LEWA SEKCJA: PASEK CYKLU SADU
  // ==========================================================================
  const leftX = pillX + 12;
  const barsW = 188;

  // A. Nagłówek etapu
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#fef3c7';
  const stageText = !isConfigured
    ? '🍎 Sad: Wybierz profil w oknie'
    : `${fruit.icon} ${fruit.name.split(' ')[0]}: ${progress.phaseLabel}`;
  ctx.fillText(stageText, leftX, pillY + 8);

  // Procent postępu
  ctx.textAlign = 'right';
  if (!isConfigured) {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Wybór 🔒', leftX + barsW, pillY + 8);
  } else if (isReady) {
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`${progressPercent}%`, leftX + barsW, pillY + 8);
  } else {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('⛔ Brak załogi', leftX + barsW, pillY + 8);
  }

  // Tor postępu
  const trackY = pillY + 24;
  const trackH = 8;
  drawRoundRect(ctx, leftX, trackY, barsW, trackH, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const fillW = Math.max(0, Math.min(barsW, (barsW * progressPercent) / 100));
  if (fillW > 0) {
    drawRoundRect(ctx, leftX, trackY, fillW, trackH, 4);
    if (isReady && isConfigured) {
      const grad = ctx.createLinearGradient(leftX, 0, leftX + barsW, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#84cc16');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = isConfigured ? '#e11d48' : '#d97706';
    }
    ctx.fill();
  }

  // Dodatkowy wiersz statusu w stanie rozwiniętym
  if (isHovered) {
    ctx.textAlign = 'left';
    ctx.font = '9px system-ui, sans-serif';
    if (!isConfigured) {
      ctx.fillStyle = '#fde047';
      ctx.fillText('Kliknij sad, aby wybrać dożywotni profil działalności', leftX, pillY + 44);
    } else {
      ctx.fillStyle = isReady ? '#fde047' : '#fda4af';
      ctx.fillText(isReady ? `✓ ${progress.seasonDesc}` : '⛔ Wstrzymano: uzupełnij obsadę', leftX, pillY + 44);
    }
  }

  // ==========================================================================
  // PRAWA SEKCJA: ZNACZNIK LUB ROZWINIĘTE SŁUPKI PRODUKCJI ROCZNEJ
  // ==========================================================================
  if (!isHovered) {
    // ZNACZNIK ROZWIJAJĄCY
    const btnX = leftX + barsW + 10;
    const btnY = pillY + 8;
    const btnW = 26;
    const btnH = 28;

    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 6);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📊', btnX + btnW / 2, btnY + btnH / 2);
  } else {
    // PIONOWY SEPARATOR
    const sepX = leftX + barsW + 12;
    ctx.beginPath();
    ctx.moveTo(sepX, pillY + 10);
    ctx.lineTo(sepX, pillY + pillH - 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 1 SŁUPEK DLA 1 AKTYWNEGO OWOCU
    const pillarCenter = sepX + 38;

    // Ikona
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(fruit.icon, pillarCenter, pillY + 6);

    // Pionowy słupek wskaźnika
    const barW = 8;
    const barH = 22;
    const barX = pillarCenter - barW / 2;
    const barY = pillY + 23;

    drawRoundRect(ctx, barX, barY, barW, barH, 2.5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    const fillH = Math.max(5, Math.round(barH * 0.85));
    drawRoundRect(ctx, barX, barY + (barH - fillH), barW, fillH, 2.5);
    ctx.fillStyle = '#f87171';
    ctx.fill();

    // Wartość liczbowa (DUŻA: 12px)
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${annualFruitKg}`, pillarCenter, pillY + 49);

    // Jednostka (CZYTELNA: 9px)
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f87171';
    ctx.fillText('kg/r', pillarCenter, pillY + 61);
  }

  ctx.restore();
}
