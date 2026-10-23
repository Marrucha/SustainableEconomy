import type { PlacedBuilding, BuildingState } from './types';
import { MINE_DEPOSITS } from './modal/mine/mineTypes';
import { drawOreNugget } from './modal/mine/oreNuggetRenderer';
import type { GameDate } from './clock/gameClockTypes';

export function renderMineOverlay(
  ctx: CanvasRenderingContext2D,
  _building: PlacedBuilding,
  screenX: number,
  screenY: number,
  buildingState?: BuildingState,
  clockDate?: GameDate
) {
  const depositType = buildingState?.mineDepositType;
  const isConfigured = Boolean(depositType && MINE_DEPOSITS[depositType]);

  ctx.save();

  // Pozycja ponad nadszybiem kopalni (obniżona tuż nad budynek kopalni)
  const hudX = screenX;
  const hudY = screenY - 28;

  if (!isConfigured) {
    // 1. PLAKIETKA: OCZEKIWANIE NA WYBÓR PROFILU
    const badgeWidth = 170;
    const badgeHeight = 36;
    const badgeX = hudX - badgeWidth / 2;
    const badgeY = hudY - badgeHeight - 10;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = 'rgba(28, 25, 23, 0.95)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    ctx.font = '16px "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛏️', badgeX + 8, badgeY + badgeHeight / 2);

    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.fillText('Kopalnia (1880)', badgeX + 32, badgeY + 12);

    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.fillText('Kliknij, aby wybrać rudę', badgeX + 32, badgeY + 26);

    ctx.restore();
    return;
  }

  // 2. KOPALNIA SKONFIGUROWANA: WYŚWIETL BRYŁKĘ, ZŁOŻE I MIESIĘCZNY PASEK WYDOBYCIA
  const depositInfo = MINE_DEPOSITS[depositType!];
  const stock = buildingState?.mineStock ?? 0;
  const maxStock = 600;

  // Cykl produkcji jest miesięczny (30 dni w miesiącu)
  const currentDay = clockDate?.day ?? 1;
  const monthProgress = Math.min(1, Math.max(0.03, currentDay / 30));

  const badgeWidth = 160;
  const badgeHeight = 38;
  const badgeX = hudX - badgeWidth / 2;
  const badgeY = hudY - badgeHeight - 20;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = 'rgba(28, 25, 23, 0.94)';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // 1. Trójwymiarowa, fasetkowana bryłka wydobywanego surowca (mineral nugget)
  drawOreNugget(ctx, depositType!, badgeX + 20, badgeY + badgeHeight / 2, 12);

  // 2. Nazwa surowca
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#fef3c7';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const cleanName = depositInfo.name.split(' (')[0];
  ctx.fillText(cleanName.slice(0, 15), badgeX + 38, badgeY + 15);

  // 3. Ilość na hałdzie kopalnianej
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Hałda: ${stock}t / ${maxStock}t`, badgeX + 38, badgeY + 29);

  // ==========================================================================
  // PASEK WYDOBYCIA ZAPEŁNIAJĄCY SIĘ RAZ NA MIESIĄC (1..30 DNI)
  // ==========================================================================
  const currentMonthYield = Math.round((currentDay / 30) * depositInfo.baseYieldPerCycle);

  const barWidth = 130;
  const barHeight = 14;
  const barX = hudX - barWidth / 2;
  const barY = hudY - 12;

  // Tło paska
  ctx.fillStyle = 'rgba(12, 10, 9, 0.92)';
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 5);
  ctx.fill();
  ctx.stroke();

  // Wypełnienie paska postępu miesiąca
  const fillW = Math.max(4, Math.round((barWidth - 2) * monthProgress));
  const grad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
  grad.addColorStop(0, '#d97706');
  grad.addColorStop(0.6, '#f59e0b');
  grad.addColorStop(1, '#fde68a');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(barX + 1, barY + 1, fillW, barHeight - 2, 4);
  ctx.fill();

  // Na pasku kopalni tylko aktualne wydobycie w miesiącu (żadnych innych napisów)
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText(`${currentMonthYield} t`, barX + barWidth / 2, barY + barHeight / 2 + 0.5);

  ctx.restore();
}
