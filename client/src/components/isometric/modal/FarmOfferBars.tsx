import React from 'react';

interface FarmOfferBarsProps {
  qualityPercent: number;
  brandLevel: number;
  priceValue: number;
  priceLabel: string;
  maxPriceForScale: number;
}

/**
 * Trzy pionowe słupki (skala 0..100) prezentujące parametry oferty: Jakość, Markę i Cenę.
 */
export const FarmOfferBars: React.FC<FarmOfferBarsProps> = ({
  qualityPercent,
  brandLevel,
  priceValue,
  priceLabel,
  maxPriceForScale,
}) => {
  const cols = [
    {
      label: 'Jakość',
      short: 'Jak.',
      valueLabel: `${Math.round(qualityPercent)}%`,
      pct: Math.min(100, Math.max(0, qualityPercent)),
      barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400',
      textClass: 'text-emerald-300',
    },
    {
      label: 'Marka',
      short: 'Mar.',
      valueLabel: `${Math.round(brandLevel)}`,
      pct: Math.min(100, Math.max(0, brandLevel)),
      barClass: 'bg-gradient-to-t from-sky-600 to-sky-400',
      textClass: 'text-sky-300',
    },
    {
      label: 'Cena',
      short: 'Cena',
      valueLabel: priceLabel,
      pct: Math.min(100, Math.max(0, Math.round((priceValue / maxPriceForScale) * 100))),
      barClass: 'bg-gradient-to-t from-amber-600 to-amber-400',
      textClass: 'text-amber-300',
    },
  ];

  return (
    <div className="w-28 h-32 shrink-0 self-center bg-stone-900/80 border border-stone-800 rounded-xl p-2 flex items-stretch justify-around gap-1">
      {cols.map((col) => (
        <div
          key={col.label}
          title={`${col.label}: ${col.valueLabel}`}
          className="flex flex-col items-center justify-between flex-1"
        >
          <span className={`text-[9px] font-mono font-bold ${col.textClass}`}>{col.valueLabel}</span>
          <div className="w-2.5 flex-1 my-1 bg-stone-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
            <div
              className={`w-full rounded-full transition-all duration-500 ${col.barClass}`}
              style={{ height: `${col.pct}%` }}
            />
          </div>
          <span className="text-[8px] font-mono text-stone-400 uppercase">{col.short}</span>
        </div>
      ))}
    </div>
  );
};
