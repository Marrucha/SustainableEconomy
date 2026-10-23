import type { PlacedBuilding, BuildingCatalogItem } from './types';
import type { FarmCapitalismState, FarmCycleStage } from './modal/farmGridTypes';
import {
  createDefaultFarmCapitalismState,
  checkIsProductionReady,
  CROPS_CONFIG,
} from './modal/farmGridTypes';
import type { GameDate } from './clock/gameClockTypes';
import { getStageForMonth } from './clock/gameClockTypes';

const STAGE_LABELS: Record<FarmCycleStage, { label: string; icon: string }> = {
  seed_intake: { label: 'Nasiona', icon: '🛒' },
  plowing: { label: 'Orka', icon: '🚜' },
  sowing: { label: 'Zasiew', icon: '🌱' },
  fertilizing: { label: 'Nawożenie', icon: '🧪' },
  weeding: { label: 'Pielenie', icon: '🌿' },
  growing: { label: 'Wzrost', icon: '🌾' },
  harvesting: { label: 'Żniwa', icon: '🚜' },
  storing_selling: { label: 'Silos/Zbyt', icon: '💰' },
};

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

export interface FarmOverlayParams {
  ctx: CanvasRenderingContext2D;
  bldg: PlacedBuilding;
  catItem: BuildingCatalogItem;
  tileW: number;
  tileH: number;
  drawY: number;
  farmState?: FarmCapitalismState;
  clockDate?: GameDate;
  mouseWorldPos?: { x: number; y: number } | null;
}

/**
 * Rysuje elegancki pasek postępu cyklu produkcji zboża bezpośrednio nad dachem Farmy w widoku wiejskim.
 * W stanie zwiniętym: pokazuje wyłącznie pasek cyklu zbożowego + znacznik [ 📊 ].
 * Po najechaniu (hover): rozwija słupki rocznej produkcji wybranego zboża, słomy (ściółki) i nawozu.
 */
export function renderFarmProgressOverlay(p: FarmOverlayParams) {
  const { ctx, bldg, tileW, drawY, farmState, clockDate } = p;

  const farmCap = farmState || createDefaultFarmCapitalismState();
  const readyCheck = checkIsProductionReady(farmCap);
  const isReady = readyCheck.isReady;

  const date: GameDate = clockDate || { day: 15, month: 4, year: 1880 };
  const currentDayInYear = (date.month - 1) * 30 + date.day;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentDayInYear / 360) * 100)));

  const currentStage = getStageForMonth(date.month);
  const stageInfo = STAGE_LABELS[currentStage] || { label: 'Produkcja', icon: '🌾' };

  // Wybrany 1 gatunek zboża na fermie zbożowej (Pszenica, Żyto, Owies, Jęczmień)
  const crop = CROPS_CONFIG[farmCap.cropType || 'pszenica'] || CROPS_CONFIG.pszenica;

  // Obliczenia podaży rocznej dla fermy zbożowej (tylko 1 aktywne zboże)
  const yieldMultiplier = (farmCap.agronomist?.hired ? 1.25 : 1.0) * (farmCap.enableFertilizing ? 1.2 : 1.0);
  const annualGrainKg = Math.round(crop.baseYield * 2 * yieldMultiplier);

  // Środek geometryczny działki w rzucie izometrycznym
  const centerX = (2 * bldg.x + bldg.sizeX - 2 * bldg.y - bldg.sizeY) * (tileW / 4);

  // Wymiary i precyzyjna pozycja paska tuż nad dachem budynku
  const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
  const scale = currentPlotWidth / (p.catItem.baseWidth || 1075);
  const roofTopY = drawY + 243 * scale;

  const collapsedW = 246;
  const collapsedH = 46;
  const expandedW = 296;
  const expandedH = 74;

  // Wykrywanie hover myszy
  const mouse = p.mouseWorldPos;
  const testY = roofTopY - expandedH - 12;
  const isHovered = Boolean(
    mouse &&
      mouse.x >= centerX - expandedW / 2 - 8 &&
      mouse.x <= centerX + expandedW / 2 + 8 &&
      mouse.y >= testY - 8 &&
      mouse.y <= roofTopY + 8
  );

  const pillW = isHovered ? expandedW : collapsedW;
  const pillH = isHovered ? expandedH : collapsedH;
  const pillX = centerX - pillW / 2;
  const pillY = roofTopY - pillH - 12;

  ctx.save();

  // 1. Zewnętrzny cień / poświata
  ctx.shadowColor = isReady ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)';
  ctx.shadowBlur = isHovered ? 14 : 9;
  ctx.shadowOffsetY = 2;

  // 2. Tło kapsuły (wiktoriańskie ciemne szkło łupkowe)
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fillStyle = 'rgba(18, 16, 14, 0.95)';
  ctx.fill();

  // 3. Obramowanie kapsuły
  ctx.strokeStyle = isReady ? '#10b981' : '#f43f5e';
  ctx.lineWidth = isHovered ? 1.8 : 1.3;
  ctx.stroke();

  // Reset cienia dla wnętrza
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 4. Trójkątny wskaźnik skierowany w dół ku dachowi farmy
  ctx.beginPath();
  ctx.moveTo(centerX - 6, pillY + pillH);
  ctx.lineTo(centerX + 6, pillY + pillH);
  ctx.lineTo(centerX, pillY + pillH + 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(18, 16, 14, 0.95)';
  ctx.fill();
  ctx.strokeStyle = isReady ? '#10b981' : '#f43f5e';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // ==========================================================================
  // LEWA SEKCJA: PASEK CYKLU ZBOŻOWEGO
  // ==========================================================================
  const leftX = pillX + 12;
  const barsW = 188;

  // A. Nagłówek etapu
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#fef3c7';
  const stageText = `${crop.icon} ${crop.name.split(' ')[0]}: ${stageInfo.label}`;
  ctx.fillText(stageText, leftX, pillY + 8);

  // Procent postępu
  ctx.textAlign = 'right';
  if (isReady) {
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${progressPercent}%`, leftX + barsW, pillY + 8);
  } else {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('⛔ Brak', leftX + barsW, pillY + 8);
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
    if (isReady) {
      const grad = ctx.createLinearGradient(leftX, 0, leftX + barsW, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#e11d48';
    }
    ctx.fill();
  }

  // Wiersz dodatkowy w stanie rozwiniętym
  if (isHovered) {
    ctx.textAlign = 'left';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = isReady ? '#6ee7b7' : '#fda4af';
    ctx.fillText(isReady ? '✓ Załoga obsadzona' : '⛔ Wstrzymano: uzupełnij obsadę', leftX, pillY + 44);
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
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
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

    // 1 SŁUPEK DLA 1 AKTYWNEGO ZBOŻA
    const pillarCenter = sepX + 38;

    // Ikona aktywnego zboża
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(crop.icon, pillarCenter, pillY + 6);

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
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Wartość liczbowa (DUŻA: 12px)
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${annualGrainKg}`, pillarCenter, pillY + 49);

    // Jednostka (CZYTELNA: 9px)
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('kg/r', pillarCenter, pillY + 61);
  }

  ctx.restore();
}
