import React, { useState } from 'react';
import {
  BAKERY_PRODUCTS_CONFIG,
  BAKERY_PROFESSIONS,
  type BakeryCapitalismState,
  type BakeryCrewMember,
  type BakeryCycleStage,
  type BakeryProfession,
  type BakeryStageMeta,
} from './bakeryTypes';

interface BakeryStageCardProps {
  stageMeta: BakeryStageMeta;
  state: BakeryCapitalismState;
  assignedWorkers: BakeryCrewMember[];
  eligibleWorkers: BakeryCrewMember[];
  isCurrent: boolean;
  onAssignWorker: (stage: BakeryCycleStage, workerId: string) => void;
  onUnassignWorker: (stage: BakeryCycleStage, workerId: string) => void;
  onHireForStage: (stage: BakeryCycleStage, profession: BakeryProfession) => void;
  onUpdateState: (updates: Partial<BakeryCapitalismState>) => void;
}

export const BakeryStageCard: React.FC<BakeryStageCardProps> = ({
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
  const isOptionalEnabled = !isOptional || state.proofingEnabled;
  const isAssigned = assignedWorkers.length > 0;
  const isOptionalMissingWorker = isOptional && isOptionalEnabled && !isAssigned;

  let borderAndBg = '';
  if (isOptional && !isOptionalEnabled) {
    borderAndBg =
      'border-dashed border-2 border-stone-400 bg-stone-300 text-stone-700 opacity-85';
  } else if (isOptional) {
    borderAndBg = isOptionalMissingWorker
      ? 'border-dashed border-2 border-amber-500 bg-amber-100 text-stone-900 shadow-sm'
      : 'border-dashed border-2 border-emerald-600 bg-stone-200 text-stone-900 shadow-sm';
  } else if (!isAssigned) {
    borderAndBg = 'border-solid border-2 border-rose-500 bg-rose-100 text-stone-900 shadow-sm';
  } else {
    borderAndBg = 'border-solid border border-stone-400 bg-stone-200 text-stone-900 shadow-sm';
  }

  const defaultHireProf: BakeryProfession = stageMeta.allowedProfessions[0] || 'baker';
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[state.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;

  return (
    <>
      <div
        className={`relative h-full rounded-xl px-2 py-1 transition-all duration-200 flex flex-col gap-0.5 select-none ${
          isCurrent && isOptionalEnabled
            ? 'bg-gradient-to-br from-orange-300 via-amber-300 to-orange-400 border-2 border-red-600 ring-2 ring-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.65)] z-30 text-stone-950'
            : `${borderAndBg} z-10`
        }`}
      >
        {/* Górny pasek kafelka */}
        <div className="flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-0.5 rounded-lg border border-stone-500/75 shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0 leading-tight">
            <span className="text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm contrast-125 shrink-0">
              {stageMeta.icon}
            </span>
            <span className="font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]">
              {stageMeta.num}. {stageMeta.shortLabel}
            </span>

            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
              title="Opis etapu"
            >
              ℹ
            </button>
          </div>

          <div className="flex items-center gap-1 leading-tight shrink-0">
            {isCurrent && isOptionalEnabled && (
              <span
                className="text-[9px] font-mono font-extrabold text-stone-950 animate-pulse bg-amber-400 px-1.5 py-0.5 rounded-full shadow-md"
                title="Etap aktualnie aktywny"
              >
                ⚡
              </span>
            )}
            {stageMeta.id === 'proofing' && (
              <input
                type="checkbox"
                title="Włącz/wyłącz długie garowanie zakwasu"
                checked={state.proofingEnabled}
                onChange={(e) => onUpdateState({ proofingEnabled: e.target.checked })}
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
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-950 border border-white/80 text-white text-[8px] font-mono font-bold flex items-center justify-center">
                  {assignedWorkers.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {showInfo && (
          <div className="my-1 p-2 rounded-lg bg-stone-800 border border-amber-500/40 text-[10px] text-stone-200 leading-snug">
            <p>{stageMeta.desc}</p>
            <p className="mt-1 text-amber-300 font-semibold">
              Wymagany zawód: {stageMeta.requiredProfessionLabel}
            </p>
          </div>
        )}

        {/* Środkowy obszar kafelka */}
        {stageMeta.id === 'flour_intake' && (
          <div className="space-y-1 my-0.5">
            <div className="flex items-center justify-between text-[11px] leading-tight">
              <span className="text-stone-700">{productCfg.requiredFlourLabel}:</span>
              <span
                className={`px-2 py-0.5 rounded-md border font-bold text-[10px] font-mono ${
                  state.flourStockKg > 0
                    ? 'bg-stone-300 border-stone-400 text-stone-900'
                    : 'bg-rose-200 border-rose-400 text-rose-900'
                }`}
              >
                {state.flourStockKg.toLocaleString('pl-PL')} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] leading-tight">
              <span className="text-stone-700">Dodatki:</span>
              <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px]">
                {productCfg.extraIngredientsLabel}
              </span>
            </div>
          </div>
        )}

        {stageMeta.id === 'sifting' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Przesiew sitowy:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              Drobne sito
            </span>
          </div>
        )}

        {stageMeta.id === 'proofing' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Premia jakości:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              {state.proofingEnabled ? '+10% aromat' : 'Pominięto'}
            </span>
          </div>
        )}

        {stageMeta.id === 'kneading' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Dzieża:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              ×{productCfg.breadYieldRatio.toFixed(2)} masy
            </span>
          </div>
        )}

        {stageMeta.id === 'baking' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Temperatura:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              240°C (Cegła)
            </span>
          </div>
        )}

        {stageMeta.id === 'cooling_packing' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Bułka tarta:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              +{Math.round(productCfg.rusksYieldRatio * 100)}%
            </span>
          </div>
        )}

        {stageMeta.id === 'dispatch' && (
          <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
            <span className="text-stone-700">Stan półek:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
              {state.breadStockKg.toLocaleString('pl-PL')} szt.
            </span>
          </div>
        )}

        {!isOptionalEnabled && (
          <div className="mt-0.5 pt-1 border-t border-stone-300">
            <div className="bg-stone-300 border border-stone-400 text-stone-700 rounded-md py-0.5 text-[10px] font-bold text-center">
              ⚪ Wyłączony
            </div>
          </div>
        )}
      </div>

      {/* Modal obsady etapu renderowany jako rodzeństwo poza kafelkiem (z-[90]) */}
      {showStaffModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowStaffModal(false)}
        >
          <div
            className="w-full max-w-md bg-stone-900 border border-amber-500/50 rounded-2xl p-4 shadow-2xl space-y-3 text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stageMeta.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    {stageMeta.num}. {stageMeta.label}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Wymagany: {stageMeta.requiredProfessionLabel} (1 osoba = 1 krok lejka)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-stone-400">
                Przypisani do tego kroku ({assignedWorkers.length}):
              </p>
              {assignedWorkers.length === 0 ? (
                <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">
                  Brak przypisanego pracownika.
                </p>
              ) : (
                assignedWorkers.map((w) => {
                  const prof = BAKERY_PROFESSIONS[w.profession];
                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">
                          {prof.icon} {w.name}
                        </span>
                        <span className="ml-2 text-[11px] text-emerald-300">
                          {prof.label} • £{w.dailyWage}/d
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnassignWorker(stageMeta.id, w.id)}
                        className="px-2 py-0.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-200 text-[10px] font-bold cursor-pointer"
                      >
                        Odepnij
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {eligibleWorkers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-stone-400">
                  Dostępni w kadrze ({eligibleWorkers.length}):
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {eligibleWorkers.map((w) => {
                    const prof = BAKERY_PROFESSIONS[w.profession];
                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs"
                      >
                        <span>
                          {prof.icon} <strong>{w.name}</strong> ({prof.label}, £{w.dailyWage}/d)
                        </span>
                        <button
                          type="button"
                          onClick={() => onAssignWorker(stageMeta.id, w.id)}
                          className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-[10px] font-bold cursor-pointer"
                        >
                          Przypisz
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => onHireForStage(stageMeta.id, defaultHireProf)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
              >
                ➕ Zatrudnij i przypisz ({BAKERY_PROFESSIONS[defaultHireProf].label} • £
                {BAKERY_PROFESSIONS[defaultHireProf].defaultWage}/d)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
