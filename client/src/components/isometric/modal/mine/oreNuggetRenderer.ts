import type { MineDepositType } from './mineTypes';

export interface OreFacetColor {
  topLight: string;
  midLight: string;
  shadow: string;
  edgeHighlight: string;
  glow: string;
}

export const ORE_PALETTES: Record<MineDepositType, OreFacetColor> = {
  coal: {
    topLight: '#44403c',
    midLight: '#292524',
    shadow: '#0c0a09',
    edgeHighlight: '#78716c',
    glow: 'rgba(28, 25, 23, 0.6)',
  },
  gold_ore: {
    topLight: '#fde047',
    midLight: '#eab308',
    shadow: '#854d0e',
    edgeHighlight: '#fef9c3',
    glow: 'rgba(234, 179, 8, 0.7)',
  },
  iron_ore: {
    topLight: '#ef4444',
    midLight: '#b91c1c',
    shadow: '#450a0a',
    edgeHighlight: '#fca5a5',
    glow: 'rgba(185, 28, 28, 0.6)',
  },
  copper_ore: {
    topLight: '#fb923c',
    midLight: '#c2410c',
    shadow: '#065f46', // z zieloną patyną miedzi
    edgeHighlight: '#34d399',
    glow: 'rgba(194, 65, 12, 0.6)',
  },
  limestone: {
    topLight: '#f5f5f4',
    midLight: '#d6d3d1',
    shadow: '#78716c',
    edgeHighlight: '#ffffff',
    glow: 'rgba(214, 211, 209, 0.5)',
  },
  clay: {
    topLight: '#f59e0b',
    midLight: '#b45309',
    shadow: '#78350f',
    edgeHighlight: '#fcd34d',
    glow: 'rgba(180, 83, 9, 0.6)',
  },
  quartz_sand: {
    topLight: '#ffffff',
    midLight: '#fef08a',
    shadow: '#ca8a04',
    edgeHighlight: '#ffffff',
    glow: 'rgba(254, 240, 138, 0.7)',
  },
  rock_salt: {
    topLight: '#ffffff',
    midLight: '#bae6fd',
    shadow: '#0284c7',
    edgeHighlight: '#f0f9ff',
    glow: 'rgba(186, 230, 253, 0.7)',
  },
};

/**
 * Rysuje trójwymiarową, fasetkowaną bryłkę surowca (mineral ore chunk) z cieniowaniem.
 */
export function drawOreNugget(
  ctx: CanvasRenderingContext2D,
  depositType: MineDepositType,
  cx: number,
  cy: number,
  radius: number = 14
) {
  const p = ORE_PALETTES[depositType] || ORE_PALETTES.coal;

  ctx.save();

  // Subtelna poświata minerału
  ctx.shadowColor = p.glow;
  ctx.shadowBlur = radius * 0.8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Główny kontur bryłki (fasetki)
  const r = radius;

  // 1. Dolna fasetka w cieniu (prawa/dolna)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.9, cy + r * 0.2);
  ctx.lineTo(cx + r * 0.4, cy + r * 0.9);
  ctx.lineTo(cx - r * 0.3, cy + r * 0.8);
  ctx.closePath();
  ctx.fillStyle = p.shadow;
  ctx.fill();

  // 2. Lewa dolna fasetka
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - r * 0.3, cy + r * 0.8);
  ctx.lineTo(cx - r * 0.9, cy + r * 0.3);
  ctx.lineTo(cx - r * 0.7, cy - r * 0.4);
  ctx.closePath();
  ctx.fillStyle = p.midLight;
  ctx.fill();

  // 3. Górna oświetlona fasetka (lewa góra - źródło światła)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - r * 0.7, cy - r * 0.4);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.9);
  ctx.lineTo(cx + r * 0.6, cy - r * 0.7);
  ctx.closePath();
  ctx.fillStyle = p.topLight;
  ctx.fill();

  // 4. Prawa górna fasetka
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.6, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.9, cy + r * 0.2);
  ctx.closePath();
  ctx.fillStyle = p.midLight;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 5. Ostre krawędzie kryształu i refleksy
  ctx.strokeStyle = p.edgeHighlight;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Krawędź grzbietu
  ctx.moveTo(cx - r * 0.2, cy - r * 0.9);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + r * 0.9, cy + r * 0.2);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - r * 0.3, cy + r * 0.8);
  ctx.stroke();

  // Obrys zewnętrzny
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy - r * 0.9);
  ctx.lineTo(cx + r * 0.6, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.9, cy + r * 0.2);
  ctx.lineTo(cx + r * 0.4, cy + r * 0.9);
  ctx.lineTo(cx - r * 0.3, cy + r * 0.8);
  ctx.lineTo(cx - r * 0.9, cy + r * 0.3);
  ctx.lineTo(cx - r * 0.7, cy - r * 0.4);
  ctx.closePath();
  ctx.stroke();

  // Błysk światła na szczycie (refleks bieli)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.45, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
