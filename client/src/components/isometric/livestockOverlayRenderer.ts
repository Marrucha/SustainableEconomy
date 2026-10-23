import type { PlacedBuilding, BuildingCatalogItem } from './types';
import type { LivestockCapitalismState } from './modal/livestock/livestockTypes';
import { createDefaultLivestockState } from './modal/livestock/livestockTypes';
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

export interface LivestockOverlayParams {
  ctx: CanvasRenderingContext2D;
  bldg: PlacedBuilding;
  catItem: BuildingCatalogItem;
  tileW: number;
  tileH: number;
  drawY: number;
  livestockState?: LivestockCapitalismState;
  clockDate?: GameDate;
  mouseWorldPos?: { x: number; y: number } | null;
}

/**
 * Rysuje elegancki panel HUD nad dachem Fermy Zwierzęcej na widoku wiejskim:
 * - Zielony pasek postępu rozrodu (ciąża 9 msc bydło / 5 msc owce)
 * - Żółty pasek postępu wzrostu (odchów 2 lata bydło / 15 msc jagnię)
 * - Słupki wskaźnikowe podaży dziennej (mleko, obornik) i rocznej (wełna, mięso, skóry)
 */
export function renderLivestockProgressOverlay(p: LivestockOverlayParams) {
  const { ctx, bldg, tileW, drawY, livestockState } = p;

  const state = livestockState || createDefaultLivestockState();
  const herd = state.herd;
  const isSheep = state.activeSpecies === 'sheep';
  const isHorses = state.activeSpecies === 'horses';

  // Obliczenia postępu rozrodu i wzrostu synchronizowane z kalendarzem miesięcy gry 1880
  const reproMax = isSheep ? 5 : isHorses ? 11 : 9;
  const growthMax = isSheep ? 15 : isHorses ? 36 : 24;

  const totalMonths = p.clockDate
    ? (p.clockDate.year - 1880) * 12 + p.clockDate.month
    : 4;

  const reproPassed = (totalMonths % reproMax) || reproMax;
  const reproPercent = Math.min(100, Math.max(0, Math.round((reproPassed / reproMax) * 100)));

  const growthPassed = (totalMonths % growthMax) || growthMax;
  const growthPercent = Math.min(100, Math.max(0, Math.round((growthPassed / growthMax) * 100)));

  // Szacunki podaży dziennej i rocznej (Bydło: mleko i obornik; Owce: wełna)
  const dailyMilk = Math.round(herd.milkingGroupCows * 14); // l/dzień
  const dailyManure = Math.round(herd.milkingGroupCows * 24); // kg/dzień (tylko bydło mleczne w oborze)
  const annualWool = Math.round((herd.adultSheepCount || 16) * 18); // kg/rok (2 strzyżenia)

  // Środek geometryczny i kalenica dachu (w sprite livestock_farm_norm.png y=220 to szczyt dachu)
  const centerX = (2 * bldg.x + bldg.sizeX - 2 * bldg.y - bldg.sizeY) * (tileW / 4);
  const currentPlotWidth = (bldg.sizeX + bldg.sizeY) * (tileW / 2);
  const scale = currentPlotWidth / (p.catItem.baseWidth || 1095);
  const roofTopY = drawY + 220 * scale;

  const pillH = 74;
  const pillW = isSheep ? 312 : 356;
  const pillX = centerX - pillW / 2;
  const pillY = roofTopY - pillH - 12;

  ctx.save();

  // 1. Zewnętrzny cień / poświata
  ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;

  // 2. Tło kapsuły
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 12);
  ctx.fillStyle = 'rgba(17, 15, 13, 0.96)';
  ctx.fill();

  // 3. Obramowanie kapsuły
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Reset cienia
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 4. Trójkątny wskaźnik ku dachowi obory
  ctx.beginPath();
  ctx.moveTo(centerX - 7, pillY + pillH);
  ctx.lineTo(centerX + 7, pillY + pillH);
  ctx.lineTo(centerX, pillY + pillH + 7);
  ctx.closePath();
  ctx.fillStyle = 'rgba(17, 15, 13, 0.96)';
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // ==========================================================================
  // WYRAZISTY MEDALION GATUNKU (KROWA 🐄 / OWCA 🐑 / KOŃ 🐎)
  // ==========================================================================
  const speciesIcon = isSheep ? '🐑' : isHorses ? '🐎' : '🐄';
  const speciesLabel = isSheep ? 'OWCA' : isHorses ? 'KOŃ' : 'KROWA';
  const badgeX = pillX + 10;
  const badgeY = pillY + 12;
  const badgeW = 34;
  const badgeH = 50;

  // Tło medalionu z poświatą
  drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fillStyle = isSheep
    ? 'rgba(236, 72, 153, 0.22)'
    : isHorses
    ? 'rgba(245, 158, 11, 0.22)'
    : 'rgba(14, 165, 233, 0.22)';
  ctx.fill();
  ctx.strokeStyle = isSheep ? '#f472b6' : isHorses ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Jasne okrągłe tło pod samą ikonę (dla maksymalnego kontrastu na czarnym szkle)
  ctx.beginPath();
  ctx.arc(badgeX + badgeW / 2, badgeY + 18, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fill();

  // Emoji zwierzęcia
  ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(speciesIcon, badgeX + badgeW / 2, badgeY + 18);

  // Podpis tekstowy pod ikoną (KROWA / OWCA / KOŃ)
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = isSheep ? '#f472b6' : isHorses ? '#f59e0b' : '#38bdf8';
  ctx.fillText(speciesLabel, badgeX + badgeW / 2, badgeY + 41);

  // ==========================================================================
  // LEWA SEKCJA: 2 PASKI POSTĘPU (ZIELONY - ROZRÓD, ŻÓŁTY - WZROST)
  // ==========================================================================
  const leftX = badgeX + badgeW + 8;
  const barsW = 152;

  // A. Pasek Rozrodu - ZIELONY
  const reproY = pillY + 8;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7'; // emerald-300
  const reproLabel = `🟢 Rozród: ${reproPassed}/${reproMax}m (${reproPercent}%)`;
  ctx.fillText(reproLabel, leftX, reproY);

  const reproTrackY = reproY + 16;
  const reproTrackH = 8;
  drawRoundRect(ctx, leftX, reproTrackY, barsW, reproTrackH, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const reproFillW = Math.max(0, Math.min(barsW, (barsW * reproPercent) / 100));
  if (reproFillW > 0) {
    drawRoundRect(ctx, leftX, reproTrackY, reproFillW, reproTrackH, 4);
    const gradRepro = ctx.createLinearGradient(leftX, 0, leftX + barsW, 0);
    gradRepro.addColorStop(0, '#34d399');
    gradRepro.addColorStop(1, '#059669');
    ctx.fillStyle = gradRepro;
    ctx.fill();
  }

  // B. Pasek Wzrostu - ŻÓŁTY
  const growthY = pillY + 39;
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#fde047'; // yellow-300
  const growthLabel = `🟡 Wzrost: ${growthPassed}/${growthMax}m (${growthPercent}%)`;
  ctx.fillText(growthLabel, leftX, growthY);

  const growthTrackY = growthY + 16;
  const growthTrackH = 8;
  drawRoundRect(ctx, leftX, growthTrackY, barsW, growthTrackH, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const growthFillW = Math.max(0, Math.min(barsW, (barsW * growthPercent) / 100));
  if (growthFillW > 0) {
    drawRoundRect(ctx, leftX, growthTrackY, growthFillW, growthTrackH, 4);
    const gradGrowth = ctx.createLinearGradient(leftX, 0, leftX + barsW, 0);
    gradGrowth.addColorStop(0, '#fde047');
    gradGrowth.addColorStop(1, '#ca8a04');
    ctx.fillStyle = gradGrowth;
    ctx.fill();
  }

  // ==========================================================================
  // PIONOWY SEPARATOR
  // ==========================================================================
  const sepX = leftX + barsW + 10;
  ctx.beginPath();
  ctx.moveTo(sepX, pillY + 10);
  ctx.lineTo(sepX, pillY + pillH - 10);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // ==========================================================================
  // PRAWA SEKCJA: SŁUPKI PRODUKCJI BIEŻĄCEJ
  // ==========================================================================
  const pillarsData = isSheep
    ? [{ icon: '🧶', val: `${annualWool}`, unit: 'kg/r', fill: 0.8, col: '#f472b6' }]
    : isHorses
    ? [
        { icon: '🐎', val: `${herd.adultDraftHorses || 10}`, unit: 'szt.', fill: 0.85, col: '#f59e0b' },
        { icon: '💩', val: `${Math.round((herd.adultDraftHorses || 10) * 18)}`, unit: 'kg/d', fill: 0.7, col: '#fbbf24' },
      ]
    : [
        { icon: '🥛', val: `${dailyMilk}`, unit: 'l/d', fill: 0.75, col: '#38bdf8' },
        { icon: '💩', val: `${dailyManure}`, unit: 'kg/d', fill: 0.7, col: '#fbbf24' },
      ];

  const slotW = 40;
  const pillarsStartX = sepX + 8;

  pillarsData.forEach((pItem, idx) => {
    const pCenter = pillarsStartX + idx * slotW + slotW / 2;

    // Ikona produktu
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(pItem.icon, pCenter, pillY + 6);

    // Pionowy słupek wskaźnika
    const barW = 7;
    const barH = 22;
    const barX = pCenter - barW / 2;
    const barY = pillY + 23;

    drawRoundRect(ctx, barX, barY, barW, barH, 2.5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    const fillH = Math.max(5, Math.round(barH * pItem.fill));
    drawRoundRect(ctx, barX, barY + (barH - fillH), barW, fillH, 2.5);
    ctx.fillStyle = pItem.col;
    ctx.fill();

    // Wartość liczbowa (DUŻA: 12px)
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(pItem.val, pCenter, pillY + 49);

    // Jednostka (CZYTELNA: 9px)
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = pItem.col;
    ctx.fillText(pItem.unit, pCenter, pillY + 61);
  });

  ctx.restore();
}
