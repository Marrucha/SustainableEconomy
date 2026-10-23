import React, { useState, useEffect } from 'react';
import type { FarmCapitalismState, FarmCycleStage, CropType } from './farmGridTypes';
import { checkIsProductionReady, canWorkerHandleStage, CROPS_CONFIG } from './farmGridTypes';
import { FarmStageCard, type StageMeta } from './FarmStageCard';
import { FarmPipelineArrow } from './FarmPipelineArrow';
import type { UseGameClockReturn } from '../clock/useGameClock';
import {
  type GameDate,
  formatGameDate,
  getStageForMonth,
  AGRICULTURAL_SCHEDULE,
} from '../clock/gameClockTypes';

interface FarmCycleSnakeProps {
  state: FarmCapitalismState;
  clock?: UseGameClockReturn;
  onUpdate: (updates: Partial<FarmCapitalismState>) => void;
  onAdvanceCycle: () => void;
  onGoToCrewTab: () => void;
}

const STAGES_CONFIG: StageMeta[] = [
  { id: 'seed_intake', num: 1, label: 'Zaopatrzenie w Nasiona', shortLabel: 'Nasiona', icon: '🛒', desc: 'Pobór nasion z rynku miejskiego (£22) lub z własnego spichlerza.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
  { id: 'plowing', num: 2, label: 'Orka i Bruzdowanie', shortLabel: 'Orka', icon: '🚜', desc: 'Wiosenna orka wołowa/konna i przygotowanie gruntu pod wysiew.', requiredProfessionLabel: 'Rolnik (Oracz)' },
  { id: 'sowing', num: 3, label: 'Zasiew Zboża', shortLabel: 'Zasiew', icon: '🌱', desc: 'Precyzyjny wysiew ziarna w wyznaczone bruzdy siewne.', requiredProfessionLabel: 'Rolnik (Siewca)' },
  { id: 'fertilizing', num: 4, label: 'Nawożenie Organiczne 1880', shortLabel: 'Nawożenie', icon: '🧪', desc: 'Opcjonalny obornik i guano peruwiańskie 1880 r. (+250 kg plonu).', requiredProfessionLabel: 'Rolnik (Nawoziciel)', isOptional: true },
  { id: 'weeding', num: 5, label: 'Pielenie i Mleko Wapienne', shortLabel: 'Pielenie/Oprysk', icon: '🌿', desc: 'Opcjonalna ochrona przed rdzą i chwastami (+180 kg ziarna).', requiredProfessionLabel: 'Rolnik (Pielarz/Oprysk)', isOptional: true },
  { id: 'growing', num: 6, label: 'Wzrost pod Okiem Agronoma', shortLabel: 'Wzrost & Gleba', icon: '🌾', desc: 'Wegetacja łanu pod stałym nadzorem agronomicznym (Klasa M).', requiredProfessionLabel: 'Nadzór Agronoma' },
  { id: 'harvesting', num: 7, label: 'Żniwa i Omłot Snopów', shortLabel: 'Żniwa', icon: '🌾', desc: 'Koszenie łanów sierpami, wiązanie snopków i omłot ziarna.', requiredProfessionLabel: 'Rolnik (Żniwiarz)' },
  { id: 'storing_selling', num: 8, label: 'Zbyt lub Magazyn Silosu', shortLabel: 'Zbyt / Silos', icon: '💰', desc: 'Sprzedaż gotówkowa na rynku miejskim lub złożenie ziarna do silosu.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
];

export const FarmCycleSnake: React.FC<FarmCycleSnakeProps> = ({
  state,
  clock,
  onUpdate,
  onAdvanceCycle,
  onGoToCrewTab,
}) => {
  const readyCheck = checkIsProductionReady(state);
  const isReady = readyCheck.isReady;

  // 1. ZEGAR GRY (ZSYNCHRONIZOWANY Z MAPĄ ŚWIATA)
  const [internalDate, setInternalDate] = useState<GameDate>({ day: 15, month: 4, year: 1880 });
  const [internalRunning, setInternalRunning] = useState<boolean>(true);
  const [internalSpeed, setInternalSpeed] = useState<number>(2);

  const clockDate = clock ? clock.date : internalDate;
  const isClockRunning = clock ? clock.isPlaying : internalRunning;
  const clockSpeed = clock ? clock.speed : internalSpeed;
  const togglePlay = clock ? clock.togglePlay : () => setInternalRunning(!internalRunning);
  const setSpeed = clock ? clock.setSpeed : (sp: number) => setInternalSpeed(sp);

  const hasFertWorker = !!(
    state.stageAssignments?.fertilizing &&
    state.crew?.some((w) => w.id === state.stageAssignments?.fertilizing && canWorkerHandleStage(w, 'fertilizing'))
  );
  const hasWeedWorker = !!(
    state.stageAssignments?.weeding &&
    state.crew?.some((w) => w.id === state.stageAssignments?.weeding && canWorkerHandleStage(w, 'weeding'))
  );

  const selectedCrop = CROPS_CONFIG[state.cropType || 'pszenica'];
  const baseYield = selectedCrop.baseYield;
  const fertBonus = state.enableFertilizing && hasFertWorker ? 250 : 0;
  const weedBonus = state.enableWeeding && hasWeedWorker ? 180 : 0;
  const agronomistMultiplier = state.agronomist.hired ? 1 + state.agronomist.yieldBonusPercent / 100 : 1.0;
  const totalYieldKg = Math.round((baseYield + fertBonus + weedBonus) * agronomistMultiplier);

  const seedCost = state.seedSource === 'market' ? 22 : 0;
  const fertCost = state.enableFertilizing && hasFertWorker ? 14 : 0;
  const sprayCost = state.enableWeeding && hasWeedWorker ? 9 : 0;
  const crewLaborCost = (state.crew || []).reduce((acc, w) => acc + w.wageDaily, 0);
  const agronomistCost = state.agronomist.hired ? state.agronomist.wageDaily : 0;
  const totalDailyCosts = seedCost + fertCost + sprayCost + crewLaborCost + agronomistCost;

  const marketPricePerTon = selectedCrop.marketPricePerTon;
  const estRevenue = state.wheatDestination === 'sell_market'
    ? Math.round((totalYieldKg / 1000) * marketPricePerTon)
    : 0;
  const estProfit = estRevenue - totalDailyCosts;

  // Rezerwowy timer lokalny, jeśli nie przekazano zegara globalnego
  useEffect(() => {
    if (clock || !internalRunning || !isReady) return;

    const intervalMs = Math.max(40, Math.round(350 / internalSpeed));
    const interval = setInterval(() => {
      setInternalDate((prev) => {
        let nDay = prev.day + 1;
        let nMonth = prev.month;
        let nYear = prev.year;
        if (nDay > 30) {
          nDay = 1;
          nMonth += 1;
          if (nMonth > 12) {
            nMonth = 1;
            nYear += 1;
          }
        }
        return { day: nDay, month: nMonth, year: nYear };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [clock, internalRunning, isReady, internalSpeed]);

  // 2. AUTOMATYCZNA SYNCHRONIZACJA ETAPU Z MIESIĄCEM
  useEffect(() => {
    if (!isReady) return;

    let scheduledStage = getStageForMonth(clockDate.month);

    if (scheduledStage === 'fertilizing' && (!state.enableFertilizing || !hasFertWorker)) {
      scheduledStage = 'growing';
    }
    if (scheduledStage === 'weeding' && (!state.enableWeeding || !hasWeedWorker)) {
      scheduledStage = 'growing';
    }

    if (scheduledStage !== state.currentStage) {
      onUpdate({ currentStage: scheduledStage });
    }

    if (clockDate.month === 1 && clockDate.day === 1) {
      onUpdate({
        totalCyclesCompleted: state.totalCyclesCompleted + 1,
        wheatStockKg:
          state.wheatDestination === 'store_silo'
            ? state.wheatStockKg + totalYieldKg
            : state.wheatStockKg,
        lastCycleYieldKg: totalYieldKg,
        lastCycleRevenue: estRevenue,
        lastCycleCost: totalDailyCosts,
      });
    }
  }, [clockDate.month, clockDate.day, isReady, state.enableFertilizing, state.enableWeeding, hasFertWorker, hasWeedWorker]);

  const handleAssignWorkerToStage = (stage: FarmCycleStage, workerId: string) => {
    const updated = { ...(state.stageAssignments || {}) };
    if (!workerId) {
      delete updated[stage];
    } else {
      updated[stage] = workerId;
    }
    onUpdate({ stageAssignments: updated });
  };

  const getStageProps = (stageId: FarmCycleStage) => {
    const stage = STAGES_CONFIG.find((s) => s.id === stageId)!;
    const isCurrent = state.currentStage === stage.id;
    const stageAssignments = state.stageAssignments || {};
    const crew = state.crew || [];
    const assignedWorkerId = stageAssignments[stage.id];
    const assignedWorker = assignedWorkerId ? crew.find((w) => w.id === assignedWorkerId) || null : null;

    const hasWorker = !!(assignedWorker && canWorkerHandleStage(assignedWorker, stage.id));

    // KROKI OPCJONALNE: są wyłączone/pominięte TYLKO wtedy, gdy gracz odznaczy checkbox!
    const isOptionalAndDisabled =
      (stage.id === 'fertilizing' && !state.enableFertilizing) ||
      (stage.id === 'weeding' && !state.enableWeeding);

    // Tylko etapy bazowe mogą być uznane za brakujące (blokujące)
    const isMissing = !stage.isOptional && stage.id !== 'growing' && !hasWorker;

    const eligibleWorkers = crew.filter((w) => canWorkerHandleStage(w, stage.id));

    return {
      stage,
      isCurrent,
      assignedWorker,
      eligibleWorkers,
      isOptionalAndDisabled,
      isMissing,
      seedSource: state.seedSource,
      wheatDestination: state.wheatDestination,
      enableFertilizing: state.enableFertilizing,
      enableWeeding: state.enableWeeding,
      agronomist: state.agronomist,
      cropType: state.cropType || 'pszenica',
      onChangeCropType: (newCrop: CropType) => {
        if (newCrop === (state.cropType || 'pszenica')) return;
        // Po zmianie typu uprawy automatycznie przepada cały zapas ziarna!
        onUpdate({
          cropType: newCrop,
          wheatStockKg: 0,
          grainStockKg: {
            pszenica: 0,
            zyto: 0,
            owies: 0,
            jeczmien: 0,
          },
        });
      },
      onAssignWorker: handleAssignWorkerToStage,
      onToggleFertilizing: (enabled: boolean) => onUpdate({ enableFertilizing: enabled }),
      onToggleWeeding: (enabled: boolean) => onUpdate({ enableWeeding: enabled }),
      onToggleSeedSource: () => onUpdate({ seedSource: state.seedSource === 'market' ? 'storage' : 'market' }),
      onToggleWheatDestination: () =>
        onUpdate({ wheatDestination: state.wheatDestination === 'sell_market' ? 'store_silo' : 'sell_market' }),
    };
  };

  const currentScheduleInfo = AGRICULTURAL_SCHEDULE.find((s) => s.stage === state.currentStage);

  // POSTĘP CYKLU: 360 dni w roku (12 msc * 30 dni)
  const currentDayInYear = (clockDate.month - 1) * 30 + clockDate.day;
  const cycleProgressPercent = Math.min(100, Math.max(0, Math.round((currentDayInYear / 360) * 100)));

  return (
    <div className="space-y-4">
      {/* 1. GŁÓWNY PASEK POSTĘPU PRODUKCJI (Z ODSTĘPAMI 150% WYSOKOŚCI CZCIONKI) */}
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs leading-[2.5]">
          <span className="font-bold text-amber-200 uppercase tracking-wide flex items-center gap-2 leading-[2.5]">
            <span>{selectedCrop.icon}</span> Postęp Uprawy: {selectedCrop.name} (Zasiew ➔ Żniwa)
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm leading-[2.5]">
            {cycleProgressPercent}%
          </span>
        </div>

        {/* PROGRES BAR TRACK & FILL */}
        <div className="w-full h-3.5 bg-stone-900 rounded-full border border-stone-800 p-0.5 overflow-hidden shadow-inner my-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isReady
                ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
            }`}
            style={{ width: `${cycleProgressPercent}%` }}
          />
        </div>

        {/* KAMIENIE MILOWE */}
        <div className="flex items-center justify-between text-[11px] leading-[2.5] font-mono text-stone-400 pt-1">
          <span className="text-stone-300">🌱 Start Zasiewu (Wiosna)</span>
          <span className="hidden sm:inline">🧪/🌿 Pielęgnacja</span>
          <span className="text-amber-200">🌾 Dojrzewanie (Lato)</span>
          <span className="text-emerald-400 font-bold">🚜 Koniec Zbiorów & Silos</span>
        </div>
      </div>

      {/* 2. ZINTEGROWANY PASEK OPERACYJNY (ZEGAR + STATUS + AGRONOM) */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-4 text-xs leading-[2.5] shadow-lg">
        {/* LEWA STRONA: ZEGAR I PRĘDKOŚĆ */}
        <div className="flex items-center gap-3">
          <span className="text-lg">⏱️</span>
          <span className="font-mono font-bold text-amber-200 text-sm leading-[2.5]">
            {formatGameDate(clockDate)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 leading-[2.5]">
            {currentScheduleInfo?.seasonName || 'Kalendarz 1880'}
          </span>

          <div className="flex items-center gap-1 font-mono ml-1">
            <button
              onClick={togglePlay}
              className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 hover:text-white cursor-pointer transition-colors"
            >
              {isClockRunning ? '⏸️' : '▶️'}
            </button>
            {[1, 2, 5].map((sp) => (
              <button
                key={sp}
                onClick={() => setSpeed(sp)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                  clockSpeed === sp ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200 bg-stone-900/60'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        {/* ŚRODEK: STATUS PRZEPŁYWU RUROCIĄGU */}
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border leading-[2.5] ${
              isReady
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500 text-rose-300'
            }`}
          >
            {isReady ? '● PRZEPŁYW AKTYWNY' : '● ZABLOKOWANY'}
          </span>
          {!isReady && (
            <span className="text-rose-300 text-[11px] font-semibold leading-[2.5]">
              Brak: {readyCheck.missingStages.map((s) => s.label).join(', ')}
            </span>
          )}
        </div>

        {/* PRAWA STRONA: AGRONOM I SKRÓT DO ZAŁOGI */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 leading-[2.5]">
            <span className="text-base">🎩</span>
            <span className="font-bold text-sky-200">{state.agronomist.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
              {state.agronomist.hired ? `+${state.agronomist.yieldBonusPercent}%` : 'Brak'}
            </span>
          </div>

          <button
            onClick={onGoToCrewTab}
            className="px-3.5 py-1 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer shadow-sm leading-[2.5]"
          >
            Załoga →
          </button>
        </div>
      </div>

      {/* 3. GRAFICZNA ŚCIEŻKA PRODUKCJI */}
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-3.5 shadow-2xl">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 leading-[2.5]">
            <span>🐍</span> Rurociąg Produkcji Zboża (Krok po Kroku)
          </span>
          <span className="font-mono text-[10px] text-stone-400 leading-[2.5]">
            Zakończone zbiory: <strong className="text-amber-300">{state.totalCyclesCompleted}</strong>
          </span>
        </div>

        {/* RZĄD 1 (KROKI 1 ──►► 2 ──►► 3 ──►► 4) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] items-center gap-2.5">
          <FarmStageCard {...getStageProps('seed_intake')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FarmStageCard {...getStageProps('plowing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FarmStageCard {...getStageProps('sowing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="right"
              status={!state.enableFertilizing || !hasFertWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <FarmStageCard {...getStageProps('fertilizing')} />
        </div>

        {/* ZAKRĘT RURY W DÓŁ */}
        <div className="hidden md:flex justify-end pr-8 lg:pr-14 py-0.5">
          <FarmPipelineArrow
            direction="down"
            status={(!state.enableFertilizing || !hasFertWorker) && (!state.enableWeeding || !hasWeedWorker) ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
          />
        </div>

        {/* RZĄD 2 (KROKI 8 ◄◄── 7 ◄◄── 6 ◄◄── 5) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] items-center gap-2.5">
          <FarmStageCard {...getStageProps('storing_selling')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FarmStageCard {...getStageProps('harvesting')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FarmStageCard {...getStageProps('growing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="left"
              status={!state.enableWeeding || !hasWeedWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <FarmStageCard {...getStageProps('weeding')} />
        </div>
      </div>

      {/* 4. DOLNY PANEL EKONOMICZNY */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs leading-[2.5]">
        <div className="flex items-center gap-7">
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Przewidywany plon:</span>
            <strong className="text-amber-300 font-mono text-sm font-bold">{totalYieldKg} kg</strong>
          </div>
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Koszty łączne:</span>
            <strong className="text-rose-400 font-mono text-sm font-bold">£ {totalDailyCosts}</strong>
          </div>
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Zysk netto:</span>
            <strong
              className={`font-mono text-sm font-bold ${estProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              £ {estProfit}
            </strong>
          </div>
        </div>

        <button
          onClick={onAdvanceCycle}
          disabled={!isReady}
          className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 leading-[2.5] ${
            isReady
              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 active:scale-95 shadow-emerald-500/20'
              : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{isReady ? 'Kolejny etap ⏩' : 'Brak obsady ⛔'}</span>
        </button>
      </div>
    </div>
  );
};
