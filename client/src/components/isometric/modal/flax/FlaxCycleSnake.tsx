import React, { useState, useEffect } from 'react';
import type { FlaxCapitalismState, FlaxCycleStage, FlaxVariety } from './flaxTypes';
import { checkIsFlaxProductionReady, canFlaxWorkerHandleStage, FLAX_VARIETIES } from './flaxTypes';
import { FlaxStageCard, type FlaxStageMeta } from './FlaxStageCard';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import {
  type GameDate,
  formatGameDate,
  AGRICULTURAL_SCHEDULE,
} from '../../clock/gameClockTypes';

interface FlaxCycleSnakeProps {
  state: FlaxCapitalismState;
  clock?: UseGameClockReturn;
  onUpdate: (updates: Partial<FlaxCapitalismState>) => void;
  onAdvanceCycle: () => void;
  onGoToCrewTab: () => void;
}

const STAGES_CONFIG: FlaxStageMeta[] = [
  { id: 'seed_intake', num: 1, label: 'Zaopatrzenie w Siemię', shortLabel: 'Siemię', icon: '🛒', desc: 'Pobór nasion lnu z rynku miejskiego (£22) lub z własnego spichlerza.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
  { id: 'plowing', num: 2, label: 'Orka i Bruzdowanie', shortLabel: 'Orka', icon: '🚜', desc: 'Wiosenna uprawa roli, staranne kruszenie brył ziemi pod drobne nasiona lnu.', requiredProfessionLabel: 'Rolnik (Oracz)' },
  { id: 'sowing', num: 3, label: 'Gęsty Zasiew Lnu', shortLabel: 'Zasiew', icon: '🌱', desc: 'Płytki i bardzo gęsty siew (zapewnia wysokie, nierozgałęzione łodygi na długie włókno).', requiredProfessionLabel: 'Rolnik (Siewca)' },
  { id: 'fertilizing', num: 4, label: 'Nawożenie Organiczne 1880', shortLabel: 'Nawożenie', icon: '🧪', desc: 'Opcjonalny nawóz organiczny i popiół drzewny (+220 kg włókna).', requiredProfessionLabel: 'Rolnik (Nawoziciel)', isOptional: true },
  { id: 'weeding', num: 5, label: 'Ręczne Pielenie Łanu', shortLabel: 'Pielenie', icon: '🌿', desc: 'Opcjonalne usuwanie chwastów motykami (+160 kg włókna I gatunku).', requiredProfessionLabel: 'Rolnik (Pielarz)', isOptional: true },
  { id: 'growing', num: 6, label: 'Wzrost pod Okiem Mistrza', shortLabel: 'Wzrost & Kwiat', icon: '🌸', desc: 'Błękitne łany pod stałym nadzorem technologa lniarstwa.', requiredProfessionLabel: 'Nadzór Mistrza' },
  { id: 'harvesting', num: 7, label: 'Rwanie Lnu z Korzeniami', shortLabel: 'Rwanie Lnu', icon: '🚜', desc: 'Tradycyjne rwanie łodyg ręcznie (nie kosi się lnu, by nie zniszczyć długich włókien).', requiredProfessionLabel: 'Rolnik (Rwacz)' },
  { id: 'processing_selling', num: 8, label: 'Roszenie i Zbyt Silosu', shortLabel: 'Roszenie & Zbyt', icon: '💰', desc: 'Moczenie słomy lnianej na łąkach, międlenie, czesanie włókien i zbyt na rynku.', requiredProfessionLabel: 'Kupiec / Przetwórca' },
];

export const FlaxCycleSnake: React.FC<FlaxCycleSnakeProps> = ({
  state,
  clock,
  onUpdate,
  onAdvanceCycle,
  onGoToCrewTab,
}) => {
  const readyCheck = checkIsFlaxProductionReady(state);
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

  const currentScheduleInfo = AGRICULTURAL_SCHEDULE.find((s) => s.stage === state.currentStage);

  // POSTĘP CYKLU: 360 dni w roku (12 msc * 30 dni)
  const currentDayInYear = (clockDate.month - 1) * 30 + clockDate.day;
  const cycleProgressPercent = Math.min(100, Math.max(0, Math.round((currentDayInYear / 360) * 100)));

  const selectedVar = FLAX_VARIETIES[state.variety || 'wloknisty'];
  const baseFiber = selectedVar.baseFiberYield;
  const baseLinseed = selectedVar.baseLinseedYield;

  const hasFertWorker = !!(
    state.stageAssignments?.fertilizing &&
    state.crew?.some((w) => w.id === state.stageAssignments?.fertilizing && canFlaxWorkerHandleStage(w, 'fertilizing'))
  );
  const hasWeedWorker = !!(
    state.stageAssignments?.weeding &&
    state.crew?.some((w) => w.id === state.stageAssignments?.weeding && canFlaxWorkerHandleStage(w, 'weeding'))
  );

  const fertBonus = state.enableFertilizing && hasFertWorker ? 220 : 0;
  const weedBonus = state.enableWeeding && hasWeedWorker ? 160 : 0;
  const agronomistMul = state.agronomist.hired ? 1 + state.agronomist.yieldBonusPercent / 100 : 1.0;

  const totalFiberKg = Math.round((baseFiber + fertBonus + weedBonus) * agronomistMul);
  const totalLinseedKg = Math.round(baseLinseed * agronomistMul);

  const seedCost = state.seedSource === 'market' ? 22 : 0;
  const fertCost = state.enableFertilizing && hasFertWorker ? 14 : 0;
  const weedCost = state.enableWeeding && hasWeedWorker ? 9 : 0;
  const crewCost = (state.crew || []).reduce((acc, w) => acc + w.wageDaily, 0);
  const agroCost = state.agronomist.hired ? state.agronomist.wageDaily : 0;
  const totalDailyCosts = seedCost + fertCost + weedCost + crewCost + agroCost;

  const revFiber = state.productDestination === 'sell_market' ? Math.round((totalFiberKg / 1000) * selectedVar.pricePerTonFiber) : 0;
  const revLinseed = state.productDestination === 'sell_market' ? Math.round((totalLinseedKg / 1000) * selectedVar.pricePerTonLinseed) : 0;
  const estRevenue = revFiber + revLinseed;
  const estProfit = estRevenue - totalDailyCosts;

  // Rezerwowy timer lokalny
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
  }, [clock, internalRunning, internalSpeed, isReady]);

  const handleAssignWorkerToStage = (stageId: FlaxCycleStage, workerId: string) => {
    onUpdate({
      stageAssignments: {
        ...(state.stageAssignments || {}),
        [stageId]: workerId,
      },
    });
  };

  const getStageProps = (stageId: FlaxCycleStage) => {
    const stage = STAGES_CONFIG.find((s) => s.id === stageId)!;
    const isCurrent = state.currentStage === stage.id;
    const stageAssignments = state.stageAssignments || {};
    const crew = state.crew || [];
    const assignedWorkerId = stageAssignments[stage.id];
    const assignedWorker = assignedWorkerId ? crew.find((w) => w.id === assignedWorkerId) || null : null;
    const hasWorker = !!(assignedWorker && canFlaxWorkerHandleStage(assignedWorker, stage.id));

    const isOptionalAndDisabled =
      (stage.id === 'fertilizing' && !state.enableFertilizing) ||
      (stage.id === 'weeding' && !state.enableWeeding);

    const isMissing = !stage.isOptional && stage.id !== 'growing' && !hasWorker;
    const eligibleWorkers = crew.filter((w) => canFlaxWorkerHandleStage(w, stage.id));

    return {
      stage,
      isCurrent,
      assignedWorker,
      eligibleWorkers,
      isOptionalAndDisabled,
      isMissing,
      seedSource: state.seedSource,
      productDestination: state.productDestination,
      enableFertilizing: state.enableFertilizing,
      enableWeeding: state.enableWeeding,
      agronomist: state.agronomist,
      variety: state.variety || 'wloknisty',
      onChangeVariety: (newVar: FlaxVariety) => {
        if (newVar === (state.variety || 'wloknisty')) return;
        onUpdate({
          variety: newVar,
          fiberStockKg: 0,
          linseedStockKg: 0,
          towStockKg: 0,
        });
      },
      onAssignWorker: handleAssignWorkerToStage,
      onToggleFertilizing: (enabled: boolean) => onUpdate({ enableFertilizing: enabled }),
      onToggleWeeding: (enabled: boolean) => onUpdate({ enableWeeding: enabled }),
      onToggleSeedSource: () => onUpdate({ seedSource: state.seedSource === 'market' ? 'storage' : 'market' }),
      onToggleProductDestination: () =>
        onUpdate({ productDestination: state.productDestination === 'sell_market' ? 'store_silo' : 'sell_market' }),
    };
  };

  return (
    <div className="space-y-4">
      {/* 1. GŁÓWNY PASEK POSTĘPU PRODUKCJI (Z ODSTĘPAMI 150% WYSOKOŚCI CZCIONKI) */}
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs leading-[2.5]">
          <span className="font-bold text-amber-200 uppercase tracking-wide flex items-center gap-2 leading-[2.5]">
            <span>{selectedVar.icon}</span> Postęp Uprawy: {selectedVar.name} (Zasiew ➔ Żniwa)
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
          <span className="text-amber-200">🌸 Dojrzewanie (Lato)</span>
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
            <span>🐍</span> Rurociąg Produkcji Lnu (Krok po Kroku)
          </span>
          <span className="font-mono text-[10px] text-stone-400 leading-[2.5]">
            Zakończone zbiory: <strong className="text-amber-300">{state.totalCyclesCompleted}</strong>
          </span>
        </div>

        {/* RZĄD 1 (KROKI 1 ──►► 2 ──►► 3 ──►► 4) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] items-center gap-2.5">
          <FlaxStageCard {...getStageProps('seed_intake')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FlaxStageCard {...getStageProps('plowing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FlaxStageCard {...getStageProps('sowing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="right"
              status={!state.enableFertilizing || !hasFertWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <FlaxStageCard {...getStageProps('fertilizing')} />
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
          <FlaxStageCard {...getStageProps('processing_selling')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FlaxStageCard {...getStageProps('harvesting')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <FlaxStageCard {...getStageProps('growing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="left"
              status={!state.enableWeeding || !hasWeedWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <FlaxStageCard {...getStageProps('weeding')} />
        </div>
      </div>

      {/* 4. DOLNY PANEL EKONOMICZNY */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs leading-[2.5]">
        <div className="flex items-center gap-7">
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Przewidywane włókno:</span>
            <strong className="text-amber-300 font-mono text-sm font-bold">{totalFiberKg} kg</strong>
          </div>
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Siemię lniane:</span>
            <strong className="text-amber-200 font-mono text-sm font-bold">{totalLinseedKg} kg</strong>
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
