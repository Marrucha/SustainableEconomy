import React, { useState } from 'react';
import type { FarmAgronomist, FarmCrewMember, FarmCycleStage, CropType, FertilizingLevel, FarmWeatherType } from './farmGridTypes';
import { getWorkerStageRoleTitle, CROPS_CONFIG } from './farmGridTypes';
import { getGrowthWeatherPercent, getHarvestWeatherPercent } from './farmYieldMath';

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
  assignedWorkers?: FarmCrewMember[];
  eligibleWorkers: FarmCrewMember[];
  isOptionalAndDisabled: boolean;
  isMissing: boolean;
  seedSource: 'market' | 'storage';
  wheatDestination: 'sell_market' | 'store_silo';
  enableFertilizing: boolean;
  fertilizingLevel?: FertilizingLevel;
  manureStockKg?: number;
  manureRequiredKg?: number;
  enableWeeding: boolean;
  enableIrrigation?: boolean;
  agronomist: FarmAgronomist;
  cropType?: CropType;
  currentFarmStage?: FarmCycleStage;
  growingWeather?: FarmWeatherType;
  harvestWeather?: FarmWeatherType;
  grainSalePricePerTon?: number;
  onChangeGrainSalePrice?: (pricePerTon: number) => void;
  onChangeCropType?: (newCrop: CropType) => void;
  onAssignWorker: (stageId: FarmCycleStage, workerId: string) => void;
  onRemoveWorker?: (stageId: FarmCycleStage, workerId: string) => void;
  onHireNewForStage?: (stageId: FarmCycleStage) => void;
  onHireAgronomist?: () => void;
  onToggleFertilizing: (enabled: boolean) => void;
  onChangeFertilizingLevel?: (level: FertilizingLevel) => void;
  onToggleWeeding: (enabled: boolean) => void;
  onToggleIrrigation?: (enabled: boolean) => void;
  onToggleSeedSource: () => void;
  onToggleWheatDestination: () => void;
}

export const FarmStageCard: React.FC<FarmStageCardProps> = ({
  stage,
  isCurrent,
  assignedWorker,
  assignedWorkers = assignedWorker ? [assignedWorker] : [],
  eligibleWorkers,
  isOptionalAndDisabled,
  isMissing,
  seedSource,
  wheatDestination: _wheatDestination,
  enableFertilizing,
  fertilizingLevel,
  manureStockKg = 0,
  manureRequiredKg = 0,
  enableWeeding,
  enableIrrigation = false,
  agronomist,
  cropType = 'pszenica',
  currentFarmStage,
  growingWeather,
  harvestWeather,
  grainSalePricePerTon,
  onChangeGrainSalePrice,
  onChangeCropType,
  onAssignWorker,
  onRemoveWorker,
  onHireNewForStage,
  onHireAgronomist,
  onToggleFertilizing,
  onChangeFertilizingLevel,
  onToggleWeeding,
  onToggleIrrigation,
  onToggleSeedSource,
  onToggleWheatDestination: _onToggleWheatDestination,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

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
      'border-dashed border-2 border-stone-400 bg-stone-300 text-stone-700 opacity-85';
  } else if (stage.isOptional) {
    borderAndBg = isOptionalMissingWorker
      ? 'border-dashed border-2 border-amber-500 bg-amber-100 text-stone-900 shadow-sm'
      : 'border-dashed border-2 border-emerald-600 bg-stone-200 text-stone-900 shadow-sm';
  } else if (isMissing) {
    borderAndBg =
      'border-solid border-2 border-rose-500 bg-rose-100 text-stone-900 shadow-sm';
  } else {
    borderAndBg =
      'border-solid border border-stone-400 bg-stone-200 text-stone-900 shadow-sm';
  }

  return (
    <>
    <div
      className={`relative h-full rounded-xl px-2 py-1 transition-all duration-200 flex flex-col gap-0.5 select-none ${
        isCurrent
          ? 'bg-gradient-to-br from-orange-300 via-amber-300 to-orange-400 border-2 border-red-600 ring-2 ring-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.65)] z-30 text-stone-950'
          : `${borderAndBg} z-10`
      }`}
    >
      {/* 1. GÓRNY PASEK: IKONA, NUMER, TYTUŁ, DYMEK ORAZ IKONA OBSADY PO PRAWEJ */}
      <div className="flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-0.5 rounded-lg border border-stone-500/75 shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0 leading-tight">
          <span className="text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm contrast-125 shrink-0">
            {stage.icon}
          </span>
          <span className="font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]">
            {stage.num}. {stage.shortLabel}
          </span>

          {/* PRZYCISK DYMKU INFORMACYJNEGO */}
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

              {/* DYMEK (TOOLTIP) */}
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-2xl bg-stone-950/95 border border-amber-500/70 shadow-2xl text-xs text-stone-200 z-50 pointer-events-none backdrop-blur-md animate-fade-in leading-snug">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-xs">
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                  </div>
                  <p className="text-stone-300 text-[11px] mb-2 leading-snug">{stage.desc}</p>
                  <div className="pt-2 border-t border-stone-800 flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Wymaga:</span>
                    <span className="text-amber-200 font-bold">{stage.requiredProfessionLabel}</span>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-500/70" />
                </div>
              )}
            </div>
          </div>

          {/* STATUS ETAPU + IKONKA OBSADY W PRAWYM GÓRNYM ROGU */}
          <div className="flex items-center gap-1 leading-tight shrink-0">
            {isCurrent && (
              <span className="text-[9px] font-mono font-extrabold text-stone-950 animate-pulse bg-amber-400 px-1.5 py-0.5 rounded-full shadow-md">
                ⚡
              </span>
            )}
            {stage.id === 'fertilizing' && (
              <input
                type="checkbox"
                title="Włącz/wyłącz nawożenie"
                checked={enableFertilizing}
                onChange={(e) =>
                  onChangeFertilizingLevel
                    ? onChangeFertilizingLevel(e.target.checked ? (fertilizingLevel && fertilizingLevel > 0 ? fertilizingLevel : 100) : 0)
                    : onToggleFertilizing(e.target.checked)
                }
                className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
            )}
            {((stage.id === 'growing' && agronomist.hired) || (stage.id !== 'growing' && !isOptionalAndDisabled && assignedWorkers.length > 0)) && (
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                title={
                  stage.id === 'growing'
                    ? `${agronomist.name} — kliknij, aby zobaczyć pensję`
                    : `${assignedWorkers.map((w) => w.name).join(', ')} — kliknij, aby zarządzać obsadą`
                }
                className={`relative w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm border ${
                  stage.id === 'growing'
                    ? 'bg-sky-950/90 hover:bg-sky-900 border-sky-400 text-sky-300'
                    : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400 text-emerald-400'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-950 border border-white/80 text-white text-[8px] font-mono font-bold flex items-center justify-center leading-none shadow-sm">
                  {stage.id === 'growing' ? 1 : assignedWorkers.length}
                </span>
              </button>
            )}
          </div>
        </div>

      {/* 2. SZYBKIE PRZEŁĄCZNIKI */}
      {stage.id === 'seed_intake' && (
        <div className="my-0.5 flex items-center justify-between text-[11px] leading-tight">
          <span className="text-stone-700 text-[11px]">Źródło nasion:</span>
          <button
            onClick={onToggleSeedSource}
            className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[11px] cursor-pointer hover:bg-stone-400/60 transition-colors"
          >
            {seedSource === 'market' ? 'Rynek (£22)' : 'Spichlerz (0£)'}
          </button>
        </div>
      )}

      {stage.id === 'sowing' && (
        <div className="my-0.5 space-y-1 text-xs leading-snug">
          <div className="flex items-center justify-between">
            <span className="text-stone-700 text-[11px] flex items-center gap-1">
              <span>Wybór zboża:</span>
              <span
                title="Spichlerz ma 1 komorę (10 t) — opróżnij ją tylko wtedy, gdy zmieniasz gatunek zasiewu."
                className="w-4 h-4 rounded-full bg-stone-300 hover:bg-stone-400 text-stone-800 text-[10px] inline-flex items-center justify-center cursor-help"
              >
                ?
              </span>
            </span>
            <span className="text-amber-900 font-bold text-[11px] font-mono">
              {CROPS_CONFIG[cropType]?.name || 'Pszenica'}
            </span>
          </div>
          <select
            value={cropType}
            onChange={(e) => onChangeCropType && onChangeCropType(e.target.value as CropType)}
            className="w-full bg-stone-100 border border-stone-400 rounded-lg py-0.5 px-2 text-stone-900 font-bold text-xs cursor-pointer"
          >
            {Object.values(CROPS_CONFIG).map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name} (£{c.marketPricePerTon}/t)
              </option>
            ))}
          </select>
        </div>
      )}

      {stage.id === 'fertilizing' && (() => {
        const activeLevel: FertilizingLevel = !enableFertilizing ? 0 : (fertilizingLevel ?? 100);
        const setLevel = (lvl: FertilizingLevel) => {
          if (onChangeFertilizingLevel) {
            onChangeFertilizingLevel(lvl);
          } else {
            onToggleFertilizing(lvl > 0);
          }
        };
        return (
          <div className="my-1.5 space-y-1 text-xs leading-snug">
            <div className="grid grid-cols-3 gap-1">
              {([
                { level: 0 as FertilizingLevel, label: '0%', bonus: '' },
                { level: 50 as FertilizingLevel, label: '50%', bonus: '(+20%)' },
                { level: 100 as FertilizingLevel, label: '100%', bonus: '(+30%)' },
              ]).map((opt) => (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => setLevel(opt.level)}
                  className={`py-0.5 px-1 rounded-md text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                    activeLevel === opt.level
                      ? 'bg-amber-300 border-amber-600 text-stone-950 shadow-sm'
                      : 'bg-stone-300 border-stone-400 text-stone-800 hover:bg-stone-400/50'
                  }`}
                >
                  {opt.label}
                  {opt.bonus && <span className="text-emerald-700 font-extrabold ml-0.5">{opt.bonus}</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
              <span className="text-stone-700">
                Obornik: <strong className={manureStockKg >= manureRequiredKg ? 'text-amber-900' : 'text-rose-700'}>{manureStockKg} kg</strong>
                {manureRequiredKg > 0 ? ` / ${manureRequiredKg} kg` : ''}
              </span>
              {manureRequiredKg > 0 && manureStockKg < manureRequiredKg && (
                <span className="text-rose-700 font-bold">⚠️ Za mało!</span>
              )}
            </div>
          </div>
        );
      })()}

      {stage.id === 'weeding' && (
        <div className="my-0.5 space-y-1 text-[10px] leading-tight">
          <label className="flex items-center justify-between gap-1 cursor-pointer">
            <span className={enableWeeding ? 'text-emerald-900 font-bold whitespace-nowrap' : 'text-stone-600 whitespace-nowrap'}>
              🌿 Pielenie ręczne (+5% plonu)
            </span>
            <input
              type="checkbox"
              title="Włącz/wyłącz pielenie"
              checked={enableWeeding}
              onChange={(e) => onToggleWeeding(e.target.checked)}
              className="accent-emerald-600 w-3.5 h-3.5 cursor-pointer shrink-0"
            />
          </label>
        </div>
      )}

      {stage.id === 'growing' && (() => {
        const showWeather =
          currentFarmStage === 'growing' ||
          currentFarmStage === 'harvesting' ||
          currentFarmStage === 'storing_selling';
        const w = growingWeather;
        const wPct = getGrowthWeatherPercent(w, enableIrrigation);
        const wIcon = w === 'rainy' ? '🌧️' : w === 'cloudy' || w === 'partly_cloudy' ? '☁️' : w === 'stormy' ? '⛈️' : '☀️';
        const wLabel = w === 'rainy' ? 'Deszcz' : w === 'cloudy' || w === 'partly_cloudy' ? 'Chmury' : w === 'stormy' ? 'Burza' : 'Susza/Słońce';
        return (
          <div className="my-0.5 space-y-1 text-[10px] leading-tight">
            <label className="flex items-center justify-between gap-1 cursor-pointer">
              <span
                title="Nawadnianie (£8 • +10%, chroni przed suszą — ale nie przed burzą)"
                className={enableIrrigation ? 'text-sky-900 font-bold whitespace-nowrap truncate' : 'text-stone-700 whitespace-nowrap truncate'}
              >
                💧 Nawadnianie (£8 • +10%, bez suszy)
              </span>
              <input
                type="checkbox"
                checked={enableIrrigation}
                onChange={(e) => onToggleIrrigation && onToggleIrrigation(e.target.checked)}
                className="accent-sky-600 w-3.5 h-3.5 cursor-pointer shrink-0"
              />
            </label>
            {showWeather && w && (
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-stone-300/80 border border-stone-400 text-stone-900 font-mono font-bold">
                <span>{wIcon} {wLabel}</span>
                <span className={wPct === 100 ? 'text-emerald-700' : 'text-amber-800'}>{wPct}%</span>
              </div>
            )}
          </div>
        );
      })()}

      {stage.id === 'harvesting' && (() => {
        const showWeather = currentFarmStage === 'harvesting' || currentFarmStage === 'storing_selling';
        const w = harvestWeather;
        if (!showWeather || !w) return null;
        const wPct = getHarvestWeatherPercent(w);
        const wIcon = w === 'sunny' ? '☀️' : w === 'partly_cloudy' ? '⛅' : w === 'cloudy' ? '☁️' : '🌧️';
        const wLabel = w === 'sunny' ? 'Słońce' : w === 'partly_cloudy' ? 'Słońce/Chmury' : w === 'cloudy' ? 'Chmury' : 'Deszcz';
        return (
          <div className="my-0.5 flex items-center justify-between px-1.5 py-0.5 rounded bg-stone-300/80 border border-stone-400 text-stone-900 text-[10px] font-mono font-bold">
            <span>{wIcon} {wLabel}</span>
            <span className={wPct === 100 ? 'text-emerald-700' : 'text-amber-800'}>{wPct}%</span>
          </div>
        );
      })()}

      {stage.id === 'storing_selling' && (() => {
        const defaultPrice = CROPS_CONFIG[cropType]?.marketPricePerTon ?? 110;
        const currentPrice = grainSalePricePerTon ?? defaultPrice;
        return (
          <div className="my-1.5 space-y-1 text-xs leading-snug">
            <div className="flex items-center justify-between">
              <span className="text-stone-700 text-[11px]">Zbycie:</span>
              <span className="px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono">
                🏛️ Spichlerz
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-stone-700 text-[11px] font-mono">Cena zboża (£/t):</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={currentPrice}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  onChangeGrainSalePrice && onChangeGrainSalePrice(val);
                }}
                className="w-16 bg-stone-100 border border-stone-400 rounded-md px-1.5 py-0.5 text-right text-xs font-mono font-bold text-stone-900"
              />
            </div>
          </div>
        );
      })()}

      {/* 3. PRZYCISK OBSADA (TYLKO GDY BRAK PRACOWNIKA LUB ETAP WYŁĄCZONY) */}
      {((stage.id === 'growing' && !agronomist.hired) ||
        (stage.id !== 'growing' && (isOptionalAndDisabled || !assignedWorker))) && (
        <div className="mt-0.5 pt-1 border-t border-stone-300">
          {stage.id === 'growing' ? (
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className="w-full py-0.5 px-2 rounded-md bg-sky-200 hover:bg-sky-300 border border-sky-500 text-sky-950 font-bold text-[11px] cursor-pointer transition-all"
            >
              👥 Obsada
            </button>
          ) : isOptionalAndDisabled ? (
            <div className="w-full py-0.5 px-2 rounded-md bg-stone-300 border border-stone-400 text-stone-700 text-[10px] text-center font-medium">
              ⚪ Wyłączony
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className={`w-full py-0.5 px-2 rounded-md font-bold text-[11px] cursor-pointer transition-all border ${
                isMissing
                  ? 'bg-rose-200 hover:bg-rose-300 border-rose-500 text-rose-950'
                  : 'bg-amber-200 hover:bg-amber-300 border-amber-500 text-amber-950'
              }`}
            >
              👥 Obsada
            </button>
          )}
        </div>
      )}
    </div>

      {/* OKNO OBSADY ETAPU (POZA KONTENEREM Z OPACITY-80, W PEŁNI KRYJĄCE) */}
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
                <span>{stage.icon}</span>
                <span>Obsada: {stage.num}. {stage.shortLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-6 h-6 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {stage.id === 'growing' ? (
              <div className="space-y-2.5">
                {agronomist.hired ? (
                  <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-1 font-mono">
                    <div className="flex items-center justify-between text-sky-100 font-bold">
                      <span>🎩 {agronomist.name}</span>
                      <span className="text-amber-300">£{agronomist.wageDaily.toFixed(1)} / dzień</span>
                    </div>
                    <div className="text-[11px] text-sky-300">{getWorkerStageRoleTitle(stage.id)}</div>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-stone-400">Brak zatrudnionego Agronoma nadzorującego wzrost.</p>
                    {onHireAgronomist && (
                      <button
                        type="button"
                        onClick={() => {
                          onHireAgronomist();
                          setShowStaffModal(false);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold cursor-pointer"
                      >
                        ➕ Zatrudnij Agronoma
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedWorkers.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {assignedWorkers.map((w) => (
                      <div key={w.id} className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 font-mono flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-emerald-100 font-bold truncate">
                            {w.avatar} {w.name}
                          </div>
                          <div className="text-[10px] text-emerald-300">
                            {getWorkerStageRoleTitle(stage.id)} • <span className="text-amber-300">£{w.wageDaily.toFixed(1)}/d</span>
                          </div>
                        </div>
                        {onRemoveWorker && (
                          <button
                            type="button"
                            onClick={() => onRemoveWorker(stage.id, w.id)}
                            title="Usuń z tego kroku"
                            className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 text-[10px] font-bold cursor-pointer shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(() => {
                  const availableToAdd = eligibleWorkers.filter(
                    (w) => !assignedWorkers.some((a) => a.id === w.id)
                  );
                  if (availableToAdd.length === 0) return null;
                  return (
                    <div className="space-y-1">
                      <label className="text-[11px] text-stone-400 block">+ Dodaj pracownika z załogi:</label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onAssignWorker(stage.id, e.target.value);
                          }
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 font-semibold cursor-pointer"
                      >
                        <option value="">-- Dodaj kolejnego pracownika --</option>
                        {[...availableToAdd].reverse().map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.avatar} {w.name} ({w.profession === 'farmer' ? 'Rolnik' : 'Kupiec'}) • £{w.wageDaily.toFixed(1)}/d
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {onHireNewForStage && (
                  <button
                    type="button"
                    onClick={() => {
                      onHireNewForStage(stage.id);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/60 text-amber-200 font-bold cursor-pointer"
                  >
                    ➕ Zatrudnij nowego pracownika
                  </button>
                )}
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
