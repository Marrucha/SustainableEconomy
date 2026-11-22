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
  const [showStaffModal, setShowStaffModal] = useState(false);

  const isMissing = !assignedWorker;
  const borderAndBg = isMissing
    ? 'border-solid border-2 border-rose-500 bg-rose-100 text-stone-900 shadow-sm'
    : 'border-solid border border-stone-400 bg-stone-200 text-stone-900 shadow-sm';

  const badgeCls =
    badgeVariant === 'sky'
      ? 'bg-sky-200 text-sky-950 border-sky-400'
      : badgeVariant === 'emerald'
      ? 'bg-emerald-200 text-emerald-950 border-emerald-500'
      : 'bg-amber-200 text-amber-950 border-amber-500';

  return (
    <>
      <div
        className={`relative h-full rounded-xl px-2.5 py-2 transition-all duration-200 flex flex-col justify-between gap-2 select-none ${
          isCurrent
            ? 'bg-gradient-to-br from-orange-300 via-amber-300 to-orange-400 border-2 border-red-600 ring-2 ring-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.65)] z-30 text-stone-950'
            : `${borderAndBg} z-10`
        }`}
      >
        {/* 1. GÓRNY PASEK: IKONA, NUMER, TYTUŁ, DYMEK ORAZ IKONA OBSADY PO PRAWEJ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-1 rounded-lg border border-stone-500/75 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0 leading-tight">
              <span className="text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm contrast-125 shrink-0">
                {icon}
              </span>
              <span className="font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]">
                {stepNum}. {title}
              </span>

              <div className="relative inline-block shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                >
                  ℹ
                </button>

                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-2xl bg-stone-950/95 border border-amber-500/70 shadow-2xl text-xs text-stone-200 z-50 pointer-events-none backdrop-blur-md leading-snug">
                    <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-xs">
                      <span>{icon}</span>
                      <span>{title}</span>
                    </div>
                    <p className="text-stone-300 text-[11px] mb-2 leading-snug">{tooltipDesc}</p>
                    <div className="pt-2 border-t border-stone-800 flex justify-between text-[10px] font-mono text-stone-400">
                      <span>Wymaga:</span>
                      <span className="text-amber-200 font-bold">{requiredProfessionLabel}</span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-500/70" />
                  </div>
                )}
              </div>
            </div>

            {/* STATUS + IKONKA OBSADY */}
            <div className="flex items-center gap-1 leading-tight shrink-0">
              {isCurrent && (
                <span className="text-[9px] font-mono font-extrabold text-stone-950 animate-pulse bg-amber-400 px-1.5 py-0.5 rounded-full shadow-md">
                  ⚡
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                title={
                  assignedWorker
                    ? `${assignedWorker.name} (${assignedWorker.profession === 'vet' ? 'Weterynarz' : 'Hodowca'}) — kliknij, aby zarządzać obsadą`
                    : 'Brak obsady — kliknij, aby przypisać lub zatrudnić pracownika'
                }
                className={`relative w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm border ${
                  assignedWorker
                    ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400 text-emerald-400'
                    : 'bg-rose-950/90 hover:bg-rose-900 border-rose-400 text-rose-300'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-950 text-white border border-white/80 text-[8px] font-mono font-bold flex items-center justify-center">
                  {assignedWorker ? 1 : 0}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 px-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${badgeCls}`}>
              {badgeText}
            </span>
            {assignedWorker && (
              <span className="text-[10px] font-mono font-bold text-emerald-900">
                £{assignedWorker.wageDaily.toFixed(1)}/d
              </span>
            )}
          </div>

          {statusLine && (
            <div className="bg-stone-300/80 border border-stone-400 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-stone-900">
              {statusLine}
            </div>
          )}
        </div>
      </div>

      {/* MODAL OBSADY ETAPU (SPÓJNY Z FARMĄ ZBOŻOWĄ) */}
      {showStaffModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3"
          onClick={() => setShowStaffModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#1c1917] border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl space-y-3 text-xs text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <span>{icon}</span>
                <span>Obsada: {stepNum}. {title}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-6 h-6 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {assignedWorker ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1 font-mono">
                <div className="flex items-center justify-between text-emerald-100 font-bold">
                  <span>{assignedWorker.avatar} {assignedWorker.name}</span>
                  <span className="text-amber-300">£{assignedWorker.wageDaily.toFixed(1)}/d</span>
                </div>
                <div className="text-[11px] text-emerald-300">{assignedWorker.title}</div>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-200 text-[11px] font-semibold text-center">
                ⚠️ Brak przypisanego pracownika
              </div>
            )}

            {eligibleWorkers.length > 0 && (
              <select
                value={assignedWorker?.id || ''}
                onChange={(e) => {
                  onAssign(e.target.value);
                  setShowStaffModal(false);
                }}
                className="w-full p-2 px-2.5 rounded-lg text-xs font-bold bg-stone-950 border border-stone-700 text-stone-100 cursor-pointer"
              >
                <option value="">{selectPlaceholder}</option>
                {[...eligibleWorkers].reverse().map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.avatar} {w.name} ({w.profession === 'vet' ? 'Weterynarz' : 'Hodowca'})
                  </option>
                ))}
              </select>
            )}

            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onHireAndAssign();
                  setShowStaffModal(false);
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 font-bold text-[11px] cursor-pointer transition-all"
              >
                {hireButtonLabel}
              </button>
              {secondaryHireButtonLabel && onSecondaryHireAndAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onSecondaryHireAndAssign();
                    setShowStaffModal(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/50 text-sky-200 font-bold text-[11px] cursor-pointer transition-all"
                >
                  {secondaryHireButtonLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
