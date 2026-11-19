import React, { useState } from 'react';
import type { LivestockWorker } from './livestockTypes';

interface LivestockStageCardProps {
  stepNum: number;
  icon: string;
  title: string;
  tooltipDesc: string;
  requiredProfessionLabel: string;
  badgeText: string;
  badgeVariant?: 'amber' | 'sky' | 'emerald';
  statusLine?: string;
  isCurrent: boolean;
  assignedWorker: LivestockWorker | null;
  eligibleWorkers: LivestockWorker[];
  selectPlaceholder: string;
  hireButtonLabel: string;
  secondaryHireButtonLabel?: string;
  onAssign: (workerId: string) => void;
  onHireAndAssign: () => void;
  onSecondaryHireAndAssign?: () => void;
}

export const LivestockStageCard: React.FC<LivestockStageCardProps> = ({
  stepNum,
  icon,
  title,
  tooltipDesc,
  requiredProfessionLabel,
  badgeText,
  badgeVariant = 'amber',
  statusLine,
  isCurrent,
  assignedWorker,
  eligibleWorkers,
  selectPlaceholder,
  hireButtonLabel,
  secondaryHireButtonLabel,
  onAssign,
  onHireAndAssign,
  onSecondaryHireAndAssign,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isMissing = !assignedWorker;
  const borderAndBg = isMissing
    ? 'border-solid border-2 border-rose-500 bg-rose-950/40 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    : 'border-solid border border-emerald-500/70 bg-stone-900/90 text-stone-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]';

  const badgeCls =
    badgeVariant === 'sky'
      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
      : badgeVariant === 'emerald'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  return (
    <div
      className={`relative h-full min-h-[240px] rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between select-none ${
        isCurrent
          ? 'bg-gradient-to-br from-amber-500/25 via-amber-950/60 to-stone-900 border-2 border-amber-300 ring-4 ring-amber-400/55 shadow-[0_0_24px_rgba(251,191,36,0.55)] scale-[1.02] z-30 text-amber-50'
          : `${borderAndBg} ${!isMissing ? 'opacity-85' : ''} z-10`
      }`}
    >
      {/* 1. GÓRNY PASEK: IKONA, NUMER, TYTUŁ I DYMEK ℹ */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg p-1 rounded-lg bg-stone-950/80 border border-stone-800 shrink-0">
              {icon}
            </span>
            <span className="font-bold text-xs text-amber-100 tracking-wide truncate">
              {stepNum}. {title}
            </span>

            <div className="relative inline-block shrink-0">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors"
              >
                ℹ
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 rounded-2xl bg-stone-950/95 border border-amber-500/70 shadow-2xl text-xs text-stone-200 z-50 pointer-events-none backdrop-blur-md">
                  <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5 text-xs">
                    <span>{icon}</span>
                    <span>{title}</span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed mb-2">{tooltipDesc}</p>
                  <div className="pt-2 border-t border-stone-800 flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Wymaga:</span>
                    <span className="text-amber-200 font-bold">{requiredProfessionLabel}</span>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-500/70" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isCurrent && (
              <span className="text-[10px] font-mono font-extrabold text-stone-950 animate-pulse bg-amber-400 px-2 py-0.5 rounded-full shadow-md">
                ⚡ AKTYWNY
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${badgeCls}`}>
              {badgeText}
            </span>
          </div>
        </div>

        {statusLine && (
          <div className="bg-stone-950/80 border border-stone-800 px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-stone-300">
            {statusLine}
          </div>
        )}
      </div>

      {/* 2. OBSADA PRACOWNIKA + AUTOMATYCZNE ZATRUDNIANIE */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
        {eligibleWorkers.length === 0 ? (
          <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-200 text-[11px] font-semibold text-center">
            ⚠️ Brak pracownika — zatrudnij poniżej
          </div>
        ) : (
          <select
            value={assignedWorker?.id || ''}
            onChange={(e) => onAssign(e.target.value)}
            className={`w-full p-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isMissing
                ? 'bg-rose-950 border border-rose-500 text-rose-200'
                : 'bg-stone-950 border border-emerald-500/60 text-emerald-200'
            }`}
          >
            <option value="">{selectPlaceholder}</option>
            {[...eligibleWorkers].reverse().map((w) => (
              <option key={w.id} value={w.id}>
                {w.avatar} {w.name} ({w.profession === 'vet' ? 'Weterynarz' : 'Hodowca'})
              </option>
            ))}
          </select>
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onHireAndAssign}
            className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 font-bold text-[11px] cursor-pointer transition-all"
          >
            {hireButtonLabel}
          </button>
          {secondaryHireButtonLabel && onSecondaryHireAndAssign && (
            <button
              type="button"
              onClick={onSecondaryHireAndAssign}
              className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/50 text-sky-200 font-bold text-[11px] cursor-pointer transition-all"
            >
              {secondaryHireButtonLabel}
            </button>
          )}
        </div>

        {assignedWorker && (
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-800/80 font-mono">
            <span className="truncate max-w-[140px] text-emerald-300 font-semibold">
              {assignedWorker.title}
            </span>
            <span className="font-bold text-amber-300">£{assignedWorker.wageDaily.toFixed(1)}/d</span>
          </div>
        )}
      </div>
    </div>
  );
};
