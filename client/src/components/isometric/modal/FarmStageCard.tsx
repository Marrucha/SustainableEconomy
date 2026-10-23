import React, { useState } from 'react';
import type { FarmAgronomist, FarmCrewMember, FarmCycleStage, CropType } from './farmGridTypes';
import { getWorkerStageRoleTitle, CROPS_CONFIG } from './farmGridTypes';

export interface StageMeta {
  id: FarmCycleStage;
  num: number;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  requiredProfessionLabel: string;
  isOptional?: boolean;
}

interface FarmStageCardProps {
  stage: StageMeta;
  isCurrent: boolean;
  assignedWorker: FarmCrewMember | null;
  eligibleWorkers: FarmCrewMember[];
  isOptionalAndDisabled: boolean;
  isMissing: boolean;
  seedSource: 'market' | 'storage';
  wheatDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean;
  enableWeeding: boolean;
  agronomist: FarmAgronomist;
  cropType?: CropType;
  onChangeCropType?: (newCrop: CropType) => void;
  onAssignWorker: (stageId: FarmCycleStage, workerId: string) => void;
  onToggleFertilizing: (enabled: boolean) => void;
  onToggleWeeding: (enabled: boolean) => void;
  onToggleSeedSource: () => void;
  onToggleWheatDestination: () => void;
}

export const FarmStageCard: React.FC<FarmStageCardProps> = ({
  stage,
  isCurrent,
  assignedWorker,
  eligibleWorkers,
  isOptionalAndDisabled,
  isMissing,
  seedSource,
  wheatDestination,
  enableFertilizing,
  enableWeeding,
  agronomist,
  cropType = 'pszenica',
  onChangeCropType,
  onAssignWorker,
  onToggleFertilizing,
  onToggleWeeding,
  onToggleSeedSource,
  onToggleWheatDestination,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Styl ramki i tła:
  // 1. Opcjonalna (Nawożenie, Pielenie) -> ZAWSZE przerywana linia.
  //    - Jeśli wyłączona checkboxem -> szara przerywana (wyłączona)
  //    - Jeśli włączona, ale brak obsady -> ŻÓŁTA przerywana (wymaga rolnika, ale nie blokuje!)
  //    - Jeśli włączona i obsadzona -> ZIELONA przerywana (+bonus)
  // 2. Wymagana bazowa (Nasiona, Orka, Zasiew, Żniwa, Zbyt) -> ciągła linia.
  //    - Jeśli brak obsady -> CZERWONA ciągła (blokuje!)
  //    - Jeśli obsadzona -> ZIELONA ciągła
  let borderAndBg = '';
  const isOptionalMissingWorker = stage.isOptional && !isOptionalAndDisabled && !assignedWorker;

  if (isOptionalAndDisabled) {
    borderAndBg =
      'border-dashed border-2 border-stone-700 bg-stone-900/60 text-stone-400 opacity-70';
  } else if (stage.isOptional) {
    borderAndBg = isOptionalMissingWorker
      ? 'border-dashed border-2 border-amber-400 bg-amber-950/40 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
      : 'border-dashed border-2 border-emerald-400 bg-stone-900/90 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  } else if (isMissing) {
    borderAndBg =
      'border-solid border-2 border-rose-500 bg-rose-950/40 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
  } else {
    borderAndBg =
      'border-solid border border-emerald-500/70 bg-stone-900/90 text-stone-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
  }

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between select-none ${borderAndBg} ${
        isCurrent ? 'ring-2 ring-amber-400 shadow-xl scale-[1.02] z-20' : 'z-10'
      }`}
    >
      {/* 1. GÓRNY PASEK: IKONA, NUMER, TYTUŁ I DYMEK (ODSTĘP 150% WYSOKOŚCI CZCIONKI) */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 leading-[2.5]">
            <span className="text-xl p-1 rounded-lg bg-stone-950/80 border border-stone-800">
              {stage.icon}
            </span>
            <span className="font-bold text-xs text-amber-100 tracking-wide leading-[2.5]">
              {stage.num}. {stage.shortLabel}
            </span>

            {/* PRZYCISK DYMKU INFORMACYJNEGO */}
            <div className="relative inline-block ml-1">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] flex items-center justify-center cursor-pointer transition-colors shadow-sm"
              >
                ℹ
              </button>

              {/* DYMEK (TOOLTIP) */}
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3.5 rounded-2xl bg-stone-950/95 border border-amber-500/70 shadow-2xl text-xs text-stone-200 z-50 pointer-events-none backdrop-blur-md animate-fade-in leading-[2.5]">
                  <div className="font-bold text-amber-300 mb-2 flex items-center gap-1.5 text-xs leading-[2.5]">
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                  </div>
                  <p className="text-stone-300 text-[11px] mb-2.5 leading-[2.5]">{stage.desc}</p>
                  <div className="pt-2.5 border-t border-stone-800 flex justify-between text-[10px] font-mono text-stone-400 leading-[2.5]">
                    <span>Wymaga:</span>
                    <span className="text-amber-200 font-bold">{stage.requiredProfessionLabel}</span>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-500/70" />
                </div>
              )}
            </div>
          </div>

          {/* STATUS ETAPU */}
          <div className="flex items-center gap-1 leading-[2.5]">
            {isCurrent && (
              <span className="text-[9px] font-mono font-bold text-amber-300 animate-pulse bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                ▶ W TOKU
              </span>
            )}
            {stage.isOptional && (
              <span
                className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  isOptionalAndDisabled
                    ? 'bg-stone-800 text-stone-400 border border-stone-700'
                    : isOptionalMissingWorker
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                }`}
              >
                {isOptionalAndDisabled
                  ? 'Wyłączony'
                  : isOptionalMissingWorker
                  ? '🟡 Wybierz rolnika'
                  : '🟢 Aktywny (+Bonus)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SZYBKIE PRZEŁĄCZNIKI (ODSTĘP 150% WYSOKOŚCI CZCIONKI) */}
      {stage.id === 'seed_intake' && (
        <div className="my-4 flex items-center justify-between text-xs leading-[2.5]">
          <span className="text-stone-400 text-[11px] leading-[2.5]">Źródło nasion:</span>
          <button
            onClick={onToggleSeedSource}
            className="px-3 py-1 rounded-md bg-stone-950 border border-stone-700 text-amber-300 font-bold text-[11px] cursor-pointer hover:bg-stone-800 transition-colors"
          >
            {seedSource === 'market' ? 'Rynek (£22)' : 'Spichlerz (0£)'}
          </button>
        </div>
      )}

      {stage.id === 'sowing' && (
        <div className="my-4 space-y-1.5 text-xs leading-[2.5]">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 text-[11px] leading-[2.5]">Wybór zboża:</span>
            <span className="text-amber-300 font-bold text-[11px] font-mono leading-[2.5]">
              {CROPS_CONFIG[cropType]?.name || 'Pszenica'}
            </span>
          </div>
          <select
            value={cropType}
            onChange={(e) => onChangeCropType && onChangeCropType(e.target.value as CropType)}
            className="w-full bg-stone-950 border border-amber-500/60 rounded-lg p-1.5 px-2 text-amber-200 font-bold text-xs cursor-pointer leading-[2.5]"
          >
            {Object.values(CROPS_CONFIG).map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name} (£{c.marketPricePerTon}/t)
              </option>
            ))}
          </select>
          <span className="text-[10px] text-rose-400 font-mono block mt-1 leading-[2.5]">
            ⚠️ Zmiana zboża kasuje obecny zapas ziarna w spichlerzu!
          </span>
        </div>
      )}

      {stage.id === 'fertilizing' && (
        <label className="my-4 flex items-center justify-between text-xs leading-[2.5] cursor-pointer">
          <span className={enableFertilizing ? 'text-amber-200 font-bold text-[11px] leading-[2.5]' : 'text-stone-400 text-[11px] leading-[2.5]'}>
            Nawożenie (+250kg):
          </span>
          <input
            type="checkbox"
            checked={enableFertilizing}
            onChange={(e) => onToggleFertilizing(e.target.checked)}
            className="accent-amber-500 w-4 h-4 cursor-pointer ml-2"
          />
        </label>
      )}

      {stage.id === 'weeding' && (
        <label className="my-4 flex items-center justify-between text-xs leading-[2.5] cursor-pointer">
          <span className={enableWeeding ? 'text-emerald-200 font-bold text-[11px] leading-[2.5]' : 'text-stone-400 text-[11px] leading-[2.5]'}>
            Pielenie/Oprysk (+180kg):
          </span>
          <input
            type="checkbox"
            checked={enableWeeding}
            onChange={(e) => onToggleWeeding(e.target.checked)}
            className="accent-emerald-500 w-4 h-4 cursor-pointer ml-2"
          />
        </label>
      )}

      {stage.id === 'storing_selling' && (
        <div className="my-4 flex items-center justify-between text-xs leading-[2.5]">
          <span className="text-stone-400 text-[11px] leading-[2.5]">Zbycie:</span>
          <button
            onClick={onToggleWheatDestination}
            className="px-3 py-1 rounded-md bg-stone-950 border border-stone-700 text-emerald-300 font-bold text-[11px] cursor-pointer hover:bg-stone-800 transition-colors"
          >
            {wheatDestination === 'sell_market' ? 'Rynek (£)' : 'Silos'}
          </button>
        </div>
      )}

      {/* 3. OBSADA PRACOWNIKA (ODSTĘP 150% WYSOKOŚCI CZCIONKI) */}
      <div className="mt-4 pt-3.5 border-t border-stone-800/80">
        {stage.id === 'growing' ? (
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/50 text-[11px] leading-[2.5] text-sky-200 flex items-center justify-between">
            <span>🎩 Nadzór:</span>
            <strong className="truncate max-w-[130px] font-semibold">{agronomist.hired ? agronomist.name : 'Brak'}</strong>
          </div>
        ) : isOptionalAndDisabled ? (
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 text-[11px] leading-[2.5] text-center font-medium">
            ⚪ Wyłączony w tym cyklu (odznaczony)
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={assignedWorker?.id || ''}
              onChange={(e) => onAssignWorker(stage.id, e.target.value)}
              className={`w-full p-2 px-2.5 rounded-lg text-xs leading-[2.5] font-bold transition-all cursor-pointer ${
                isMissing
                  ? 'bg-rose-950 border border-rose-500 text-rose-200'
                  : stage.isOptional && !assignedWorker
                  ? 'bg-stone-950 border border-amber-500/60 text-amber-300'
                  : 'bg-stone-950 border border-emerald-500/60 text-emerald-200'
              }`}
            >
              <option value="">
                {stage.isOptional ? '🟡 [Wybierz rolnika do etapu]' : '⚠️ [Wybierz pracownika]'}
              </option>
              {eligibleWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.avatar} {w.name} ({w.profession === 'farmer' ? 'Rolnik' : 'Kupiec'})
                </option>
              ))}
            </select>

            {assignedWorker ? (
              <div className="flex items-center justify-between text-[11px] leading-[2.5] mt-3.5 pt-3 border-t border-stone-800/80 font-mono">
                <span className="truncate max-w-[130px] text-emerald-300 font-semibold">
                  {getWorkerStageRoleTitle(stage.id)}
                </span>
                <span className="font-bold text-amber-300">£{assignedWorker.wageDaily.toFixed(1)}/d</span>
              </div>
            ) : stage.isOptional ? (
              <div className="text-[10px] leading-[2.5] mt-2.5 text-amber-300/80 font-mono text-center">
                Wybierz rolnika, aby uzyskać bonus do plonów
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
