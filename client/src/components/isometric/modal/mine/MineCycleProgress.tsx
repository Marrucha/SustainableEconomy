import React from 'react';
import { MINE_WORKFLOW_STEPS, type MineDepositInfo } from './mineTypes';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { MONTH_NAMES } from '../../clock/gameClockTypes';

interface MineCycleProgressProps {
  depositInfo: MineDepositInfo;
  stageNum: number;
  destination: 'sell_market' | 'store_silo';
  clock?: UseGameClockReturn;
  onSetDestination: (dest: 'sell_market' | 'store_silo') => void;
  onAdvanceStage: () => void;
}

export const MineCycleProgress: React.FC<MineCycleProgressProps> = ({
  depositInfo,
  destination,
  clock,
  onSetDestination,
  onAdvanceStage,
}) => {
  const currentMonth = clock?.date ? MONTH_NAMES[clock.date.month - 1] || 'Kwiecień' : 'Kwiecień';
  const currentYear = clock?.date ? clock.date.year : 1880;
  const currentDay = clock?.date ? clock.date.day : 15;
  const monthPercent = Math.min(100, Math.round((currentDay / 30) * 100));

  return (
    <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-4 shadow-inner">
      {/* NAGŁÓWEK CYKLU */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-800/80 pb-2.5 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{depositInfo.icon}</span>
          <div>
            <h4 className="text-sm font-bold text-stone-200">
              Miesięczny Cykl Wydobywczy: <span className="text-amber-300">{depositInfo.name}</span>
            </h4>
            <p className="text-[11px] text-stone-400">
              Kalendarz kopalni: <span className="text-amber-300 font-mono capitalize">{currentMonth} {currentYear}</span> • Dzień <strong className="text-amber-200 font-mono">{currentDay} / 30</strong>
            </p>
          </div>
        </div>

        {/* PRZEŁĄCZNIK SPRZEDAŻ / HAŁDA */}
        <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 self-end sm:self-auto">
          <button
            onClick={() => onSetDestination('sell_market')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              destination === 'sell_market'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🪙</span>
            <span>Giełda</span>
          </button>
          <button
            onClick={() => onSetDestination('store_silo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              destination === 'store_silo'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>📦</span>
            <span>Hałda / Silos</span>
          </button>
        </div>
      </div>

      {/* 4 ETAPY CYKLU Z PRECYZYJNIE PRZYPISANYMI ROLAMI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {MINE_WORKFLOW_STEPS.map((w) => {
          const isCurrent = currentDay >= (w.stepIndex - 1) * 7 + 1 && currentDay <= (w.stepIndex === 4 ? 30 : w.stepIndex * 7);
          const isDone = currentDay > (w.stepIndex === 4 ? 30 : w.stepIndex * 7);
          return (
            <div
              key={w.stepIndex}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                  : isDone
                  ? 'bg-stone-900/50 border-emerald-700/50 text-emerald-300'
                  : 'bg-stone-900/20 border-stone-800 text-stone-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-stone-400">{w.daysRange}</span>
                  <span className="text-xs">{isDone ? '✓' : isCurrent ? '⏳' : '○'}</span>
                </div>
                <p className="text-xs font-bold leading-tight text-stone-200">{w.name}</p>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{w.desc}</p>
              </div>

              {/* PLAKIETKA PRZYPISANEJ ROLI / ZWIERZĘCIA */}
              <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center gap-1.5">
                <span className="text-base">{w.assignedIcon}</span>
                <span className="text-[10px] font-bold font-mono text-amber-300 truncate">
                  {w.assignedRole}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PASEK WYDOBYCIA ZAPEŁNIAJĄCY SIĘ RAZ NA MIESIĄC */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="w-full sm:flex-1">
          <div className="flex justify-between text-xs text-stone-300 mb-1.5 font-mono">
            <span>Postęp miesięcznego wydobycia ({currentMonth}):</span>
            <span className="text-amber-300 font-bold">{currentDay} / 30 dni ({monthPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-300 transition-all duration-300"
              style={{ width: `${monthPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
            <span>Urobek miesięczny: +{depositInfo.baseYieldPerCycle} t</span>
            <span>Wartość: £ {depositInfo.baseYieldPerCycle * depositInfo.basePricePerTon} / miesiąc</span>
          </div>
        </div>

        <button
          onClick={onAdvanceStage}
          className="w-full sm:w-auto px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span>⏩</span>
          <span>Wydobądź partię (+{depositInfo.baseYieldPerCycle}t)</span>
        </button>
      </div>
    </div>
  );
};
