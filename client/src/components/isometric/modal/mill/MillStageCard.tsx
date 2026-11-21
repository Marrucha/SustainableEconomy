import React, { useState } from 'react';
import {
  MILL_PRODUCTS_CONFIG,
  MILL_PROFESSIONS,
  type MillCapitalismState,
  type MillCrewMember,
  type MillCycleStage,
  type MillProductTarget,
  type MillProfession,
  type MillStageMeta,
} from './millTypes';

interface MillStageCardProps {
  stageMeta: MillStageMeta;
  state: MillCapitalismState;
  assignedWorkers: MillCrewMember[];
  eligibleWorkers: MillCrewMember[];
  isCurrent: boolean;
  onAssignWorker: (stage: MillCycleStage, workerId: string) => void;
  onUnassignWorker: (stage: MillCycleStage, workerId: string) => void;
  onHireForStage: (stage: MillCycleStage, profession: MillProfession) => void;
  onUpdateState: (updates: Partial<MillCapitalismState>) => void;
}

export const MillStageCard: React.FC<MillStageCardProps> = ({
  stageMeta,
  state,
  assignedWorkers,
  eligibleWorkers,
  isCurrent,
  onAssignWorker,
  onUnassignWorker,
  onHireForStage,
  onUpdateState,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const isOptional = Boolean(stageMeta.isOptional);
  const isOptionalEnabled = !isOptional || state.conditioningEnabled;
  const isAssigned = assignedWorkers.length > 0;

  let borderAndBg = '';
  const isOptionalMissingWorker = isOptional && isOptionalEnabled && !isAssigned;

  if (isOptional && !isOptionalEnabled) {
    borderAndBg =
      'border-dashed border-2 border-stone-400 bg-stone-300 text-stone-700 opacity-85';
  } else if (isOptional) {
    borderAndBg = isOptionalMissingWorker
      ? 'border-dashed border-2 border-amber-500 bg-amber-100 text-stone-900 shadow-sm'
      : 'border-dashed border-2 border-emerald-600 bg-stone-200 text-stone-900 shadow-sm';
  } else if (!isAssigned) {
    borderAndBg =
      'border-solid border-2 border-rose-500 bg-rose-100 text-stone-900 shadow-sm';
  } else {
    borderAndBg =
      'border-solid border border-stone-400 bg-stone-200 text-stone-900 shadow-sm';
  }

  const defaultHireProf: MillProfession = stageMeta.allowedProfessions[0] || 'miller';

  return (
    <>
    <div
      className={`relative h-full rounded-xl px-2 py-1 transition-all duration-200 flex flex-col gap-0.5 select-none ${
        isCurrent && isOptionalEnabled
          ? 'bg-gradient-to-br from-orange-300 via-amber-300 to-orange-400 border-2 border-red-600 ring-2 ring-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.65)] z-30 text-stone-950'
          : `${borderAndBg} z-10`
      }`}
    >
      {/* 1. GÓRNY PASEK: IKONA, NUMER, TYTUŁ, DYMEK ORAZ IKONA OBSADY PO PRAWEJ */}
      <div className="flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-0.5 rounded-lg border border-stone-500/75 shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0 leading-tight">
          <span className="text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm contrast-125 shrink-0">
            {stageMeta.icon}
          </span>
          <span className="font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]">
            {stageMeta.num}. {stageMeta.shortLabel}
          </span>

          {/* PRZYCISK DYMKU INFORMACYJNEGO BEZPOŚREDNIO OBOK TYTUŁU */}
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
            title="Opis etapu"
          >
            ℹ
          </button>
        </div>

        {/* STATUS ETAPU + IKONKA OBSADY W PRAWYM GÓRNYM ROGU */}
        <div className="flex items-center gap-1 leading-tight shrink-0">
          {isCurrent && isOptionalEnabled && (
            <span className="text-[9px] font-mono font-extrabold text-stone-950 animate-pulse bg-amber-400 px-1.5 py-0.5 rounded-full shadow-md" title="Etap aktualnie aktywny">
              ⚡
            </span>
          )}
          {stageMeta.id === 'conditioning' && (
            <input
              type="checkbox"
              title="Włącz/wyłącz nawilżanie ziarna"
              checked={state.conditioningEnabled}
              onChange={(e) => onUpdateState({ conditioningEnabled: e.target.checked })}
              className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
            />
          )}
          {isOptionalEnabled && (
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              title={
                assignedWorkers.length > 0
                  ? `${assignedWorkers.map((w) => w.name).join(', ')} — kliknij, aby zarządzać obsadą`
                  : 'Brak obsady — kliknij, aby przypisać lub zatrudnić pracownika'
              }
              className={`relative w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm border ${
                assignedWorkers.length === 0
                  ? isOptional
                    ? 'bg-amber-950/90 hover:bg-amber-900 border-amber-400 text-amber-300'
                    : 'bg-rose-950/90 hover:bg-rose-900 border-rose-400 text-rose-300'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400 text-emerald-400'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5z" />
              </svg>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-950 border border-white/80 text-white text-[8px] font-mono font-bold flex items-center justify-center leading-none shadow-sm">
                {assignedWorkers.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Dymek informacyjny */}
      {showInfo && (
        <div className="bg-stone-900 text-stone-100 rounded-lg p-2 text-[11px] border border-amber-500/40 shadow-md space-y-1">
          <p className="font-bold text-amber-300">{stageMeta.label}</p>
          <p className="text-stone-300 leading-snug">{stageMeta.desc}</p>
          <p className="text-[10px] text-emerald-300 font-semibold">
            Wymagana profesja: {stageMeta.requiredProfessionLabel}
          </p>
        </div>
      )}

      {/* 2. ŚRODKOWE WIERSZE PARAMETRÓW (STYL FARMSTAGECARD) */}
      {stageMeta.id === 'grain_intake' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Kosz ziarna:</span>
          <span
            className={`px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 font-bold text-[10px] font-mono ${
              state.grainStockKg <= 0 ? 'text-rose-700' : 'text-stone-900'
            }`}
          >
            {state.grainStockKg.toLocaleString('pl-PL')} kg
          </span>
        </div>
      )}

      {stageMeta.id === 'conditioning' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Nawilżanie parą:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
            {state.conditioningEnabled ? '+10% jakości' : 'Wyłączone'}
          </span>
        </div>
      )}

      {stageMeta.id === 'milling' && (
        <div className="my-0.5 flex items-center justify-between gap-1 text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Produkt:</span>
          <select
            value={state.productTarget}
            onChange={(e) => {
              const nextTarget = e.target.value as MillProductTarget;
              onUpdateState({
                productTarget: nextTarget,
                flourPricePerKg: MILL_PRODUCTS_CONFIG[nextTarget].defaultPricePerKg,
              });
            }}
            className="px-1.5 py-0.5 rounded-md bg-stone-300 hover:bg-stone-300/80 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono cursor-pointer"
          >
            {Object.values(MILL_PRODUCTS_CONFIG).map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {stageMeta.id === 'sifting' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Jakość przemiału:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
            {state.flourQualityPercent}%
          </span>
        </div>
      )}

      {stageMeta.id === 'packing_dispatch' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Workowanie:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
            Worki 50 kg
          </span>
        </div>
      )}

      {stageMeta.id === 'storage' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Mąka w magazynie:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
            {state.flourStockKg.toLocaleString('pl-PL')} kg
          </span>
        </div>
      )}

      {stageMeta.id === 'cleaning' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Wialnia i sita:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
            99% czystości
          </span>
        </div>
      )}

      {/* 3. INFORMACJA O WYŁĄCZONYM ETAPIE OPCJONALNYM (OBSADA ZAWSZE PRZEZ IKONKĘ W PRAWYM GÓRNYM ROGU) */}
      {!isOptionalEnabled && (
        <div className="mt-0.5 pt-1 border-t border-stone-300">
          <div className="w-full py-0.5 px-2 rounded-md bg-stone-300 border border-stone-400 text-stone-700 text-[10px] text-center font-medium">
            ⚪ Wyłączony
          </div>
        </div>
      )}
    </div>

      {/* Okno modalne obsady etapu (poza kontenerem z z-10, aby sąsiednie kafelki nie nakładały się na modal) */}
      {showStaffModal && (
        <div
          className="fixed inset-0 z-[90] bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowStaffModal(false)}
        >
          <div
            className="w-full max-w-md bg-stone-900 border border-amber-500/50 rounded-2xl p-4 text-stone-100 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stageMeta.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-200">{stageMeta.label}</h4>
                  <p className="text-[11px] text-stone-400">
                    Wymagana profesja: {stageMeta.requiredProfessionLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Przypisani pracownicy ({assignedWorkers.length})
              </p>
              {assignedWorkers.length === 0 ? (
                <p className="text-xs text-rose-400 italic">Brak przypisanego pracownika do tego etapu.</p>
              ) : (
                assignedWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between bg-stone-800/80 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-100">{w.name}</span>
                      <span className="ml-2 text-[10px] text-emerald-300">
                        {MILL_PROFESSIONS[w.profession].icon} {MILL_PROFESSIONS[w.profession].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-300">£{w.dailyWage}/d</span>
                      <button
                        type="button"
                        onClick={() => onUnassignWorker(stageMeta.id, w.id)}
                        className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] font-bold cursor-pointer"
                      >
                        Odepnij
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {eligibleWorkers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Wybierz z dostępnej kadry
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {eligibleWorkers.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onAssignWorker(stageMeta.id, w.id)}
                      className="w-full flex items-center justify-between bg-stone-950/80 hover:bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs cursor-pointer transition-colors"
                    >
                      <span>
                        <span className="font-bold text-stone-200">{w.name}</span>
                        <span className="ml-2 text-[10px] text-stone-400">
                          {MILL_PROFESSIONS[w.profession].icon} {MILL_PROFESSIONS[w.profession].label}
                        </span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+ Przypisz (£{w.dailyWage}/d)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onHireForStage(stageMeta.id, defaultHireProf);
                  setShowStaffModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
              >
                ➕ Zatrudnij ({MILL_PROFESSIONS[defaultHireProf].label} • £{MILL_PROFESSIONS[defaultHireProf].defaultWage}/d)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
