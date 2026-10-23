import React, { useEffect, useRef } from 'react';
import type { MineDepositType } from './mineTypes';
import { drawOreNugget } from './oreNuggetRenderer';

interface OreNuggetIconProps {
  depositType: MineDepositType;
  size?: number;
  className?: string;
}

export const OreNuggetIcon: React.FC<OreNuggetIconProps> = ({
  depositType,
  size = 28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    drawOreNugget(ctx, depositType, size / 2, size / 2, (size / 2) * 0.82);
  }, [depositType, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
