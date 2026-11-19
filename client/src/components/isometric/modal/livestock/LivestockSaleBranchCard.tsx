import React from 'react';
import type { LivestockWorker } from './livestockTypes';
import { LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';

interface LivestockSaleBranchCardProps {
  title: string;
  isSelected: boolean;
  salePrice: number;
  crew: LivestockWorker[];
  onSelect: () => void;
  onChangePrice: (nextPrice: number) => void;
  onHireTrader: (newWorker: LivestockWorker) => void;
}

export const LivestockSaleBranchCard: React.FC<LivestockSaleBranchCardProps> = ({
  title,
  isSelected,
  salePrice,
  crew,
  onSelect,
  onChangePrice,
  onHireTrader,
}) => {
  const priceSetter =
    crew.find((w) => w.profession === 'trader') ||
    crew.find((w) => w.profession === 'breeder');

  const handleHire = () => {
    const cfg = LIVESTOCK_PROFESSIONS_CONFIG.trader;
    onHireTrader({
      id: `livestock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: generateRandomEnglishName(crew.map((w) => w.name)),
      profession: 'trader',
      wageDaily: cfg.defaultWage,
      avatar: cfg.icon,
      title: cfg.label,
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
        isSelected
          ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/30'
          : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💰</span>
          <span className="font-bold text-xs text-amber-200">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-amber-400 font-bold">£{salePrice} / szt.</span>
      </div>

      {priceSetter ? (
        <div
          className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] text-stone-300 font-mono truncate">
            {priceSetter.avatar} Cena ({priceSetter.profession === 'trader' ? 'Handlarz' : 'Hodowca'}):
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-amber-300">£</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={salePrice}
              onChange={(e) => onChangePrice(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 bg-stone-950 border border-amber-500/60 rounded-lg px-2 py-0.5 text-right text-xs font-mono font-bold text-amber-200"
            />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] text-rose-300">⚠️ Brak handlarza/hodowcy</span>
          <button
            type="button"
            onClick={handleHire}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 font-bold text-[10px] cursor-pointer"
          >
            ➕ Zatrudnij handlarza
          </button>
        </div>
      )}
    </div>
  );
};
