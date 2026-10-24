import React, { useState, useEffect } from 'react';
import type { HopCapitalismState, HopCycleStage, HopVariety } from './hopTypes';
import { checkIsHopProductionReady, canHopWorkerHandleStage, HOP_VARIETIES } from './hopTypes';
import { HopStageCard, type HopStageMeta } from './HopStageCard';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import {
  type GameDate,
  formatGameDate,
  AGRICULTURAL_SCHEDULE,
} from '../../clock/gameClockTypes';

interface HopCycleSnakeProps {
  state: HopCapitalismState;
  clock?: UseGameClockReturn;
  onUpdate: (updates: Partial<HopCapitalismState>) => void;
  onAdvanceCycle: () => void;
  onGoToCrewTab: () => void;
}

const STAGES_CONFIG: HopStageMeta[] = [
  { id: 'rhizome_intake', num: 1, label: 'Zaopatrzenie w Sztobry', shortLabel: 'Sztobry', icon: '🛒', desc: 'Pobór sadzonek i sztobrów chmielu z targu sadzonek (£28) lub z piwnicy.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
  { id: 'plowing_stringing', num: 2, label: 'Orka i Tyczkowanie', shortLabel: 'Tyczkowanie', icon: '🪵', desc: 'Wbijanie wysokich drewnianych żerdzi, orka międzyrzędzi i napinanie drutów/sznurków.', requiredProfessionLabel: 'Rolnik (Tyczkarz)' },
  { id: 'training', num: 3, label: 'Prowadzenie Pędów', shortLabel: 'Prowadzenie', icon: '🌱', desc: 'Ręczne owijanie młodych pędów chmielu zgodnie z ruchem wskazówek zegara wokół sznurów.', requiredProfessionLabel: 'Rolnik (Pielarz)' },
  { id: 'fertilizing', num: 4, label: 'Nawożenie Potasowe 1880', shortLabel: 'Nawożenie', icon: '🧪', desc: 'Opcjonalny nawóz potasowy i popiół drzewny na bujny rozwój szyszek (+260 kg szyszek).', requiredProfessionLabel: 'Rolnik (Nawoziciel)', isOptional: true },
  { id: 'stripping', num: 5, label: 'Olistywanie Dolne', shortLabel: 'Olistywanie', icon: '🌿', desc: 'Opcjonalne obrywanie dolnych liści do 1 metra (chroni przed mączniakiem i szkodnikami, +180 kg).', requiredProfessionLabel: 'Rolnik (Pielarz)', isOptional: true },
  { id: 'growing', num: 6, label: 'Dojrzewanie pod Okiem Mistrza', shortLabel: 'Wzrost & Szyszka', icon: '🍃', desc: 'Bujne zielone pnącza pod czujnym okiem mistrza chmielarstwa z Kent.', requiredProfessionLabel: 'Nadzór Chmielarza' },
  { id: 'harvesting', num: 7, label: 'Zbiór Szyszek do Koszy', shortLabel: 'Zbiór Szyszek', icon: '🧺', desc: 'Ścinanie pędów, ręczne zrywanie dojrzałych, lepkich od lupuliny szyszek do wielkich koszy.', requiredProfessionLabel: 'Rolnik (Zbieracz)' },
  { id: 'drying_selling', num: 8, label: 'Suszenie w Oast House i Zbyt', shortLabel: 'Oast & Zbyt', icon: '💰', desc: 'Suszenie gorącym powietrzem w Oast House z białą wiatrownicą, prasowanie w kieszenie i sprzedaż.', requiredProfessionLabel: 'Kupiec / Chmielarz' },
];

export const HopCycleSnake: React.FC<HopCycleSnakeProps> = ({
  state,
  clock,
  onUpdate,
  onAdvanceCycle,
  onGoToCrewTab,
}) => {
  const readyCheck = checkIsHopProductionReady(state);
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

  const selectedVar = HOP_VARIETIES[state.variety || 'golding'];
  const baseYield = selectedVar.baseConeYield;

  const hasFertWorker = !!(
    state.stageAssignments?.fertilizing &&
    state.crew?.some((w) => w.id === state.stageAssignments?.fertilizing && canHopWorkerHandleStage(w, 'fertilizing'))
  );
  const hasStripWorker = !!(
    state.stageAssignments?.stripping &&
    state.crew?.some((w) => w.id === state.stageAssignments?.stripping && canHopWorkerHandleStage(w, 'stripping'))
  );

  const fertBonus = state.enableFertilizing && hasFertWorker ? 260 : 0;
  const stripBonus = state.enableStripping && hasStripWorker ? 180 : 0;
  const agronomistMul = state.agronomist.hired ? 1 + state.agronomist.yieldBonusPercent / 100 : 1.0;

  const totalConesKg = Math.round((baseYield + fertBonus + stripBonus) * agronomistMul);

  const rhizomeCost = state.rhizomeSource === 'market' ? 28 : 0;
  const fertCost = state.enableFertilizing && hasFertWorker ? 16 : 0;
  const stripCost = state.enableStripping && hasStripWorker ? 11 : 0;
  const crewCost = (state.crew || []).reduce((acc, w) => acc + w.wageDaily, 0);
  const agroCost = state.agronomist.hired ? state.agronomist.wageDaily : 0;
  const totalDailyCosts = rhizomeCost + fertCost + stripCost + crewCost + agroCost;

  const estRevenue = state.productDestination === 'sell_market' ? Math.round((totalConesKg / 1000) * selectedVar.pricePerTonCones) : 0;
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

  const handleAssignWorkerToStage = (stageId: HopCycleStage, workerId: string) => {
    onUpdate({
      stageAssignments: {
        ...(state.stageAssignments || {}),
        [stageId]: workerId,
      },
    });
  };

  const getStageProps = (stageId: HopCycleStage) => {
    const stage = STAGES_CONFIG.find((s) => s.id === stageId)!;
    const isCurrent = state.currentStage === stage.id;
    const stageAssignments = state.stageAssignments || {};
    const crew = state.crew || [];
    const assignedWorkerId = stageAssignments[stage.id];
    const assignedWorker = assignedWorkerId ? crew.find((w) => w.id === assignedWorkerId) || null : null;
    const hasWorker = !!(assignedWorker && canHopWorkerHandleStage(assignedWorker, stage.id));

    const isOptionalAndDisabled =
      (stage.id === 'fertilizing' && !state.enableFertilizing) ||
      (stage.id === 'stripping' && !state.enableStripping);

    const isMissing = !stage.isOptional && stage.id !== 'growing' && !hasWorker;
    const eligibleWorkers = crew.filter((w) => canHopWorkerHandleStage(w, stage.id));

    return {
      stage,
      isCurrent,
      assignedWorker,
      eligibleWorkers,
      isOptionalAndDisabled,
      isMissing,
      rhizomeSource: state.rhizomeSource,
      productDestination: state.productDestination,
      enableFertilizing: state.enableFertilizing,
      enableStripping: state.enableStripping,
      agronomist: state.agronomist,
      variety: state.variety || 'golding',
      onChangeVariety: (newVar: HopVariety) => {
        if (newVar === (state.variety || 'golding')) return;
        onUpdate({
          variety: newVar,
          driedConesStockKg: 0,
          freshConesStockKg: 0,
          spentHopsStockKg: 0,
        });
      },
      onAssignWorker: handleAssignWorkerToStage,
      onToggleFertilizing: (enabled: boolean) => onUpdate({ enableFertilizing: enabled }),
      onToggleStripping: (enabled: boolean) => onUpdate({ enableStripping: enabled }),
      onToggleRhizomeSource: () => onUpdate({ rhizomeSource: state.rhizomeSource === 'market' ? 'storage' : 'market' }),
      onToggleProductDestination: () =>
        onUpdate({ productDestination: state.productDestination === 'sell_market' ? 'store_silo' : 'sell_market' }),
    };
  };

  return (
    <div className="space-y-4">
      {/* 1. GŁÓWNY PASEK POSTĘPU PRODUKCJI */}
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs leading-[2.5]">
          <span className="font-bold text-amber-200 uppercase tracking-wide flex items-center gap-2 leading-[2.5]">
            <span>{selectedVar.icon}</span> Postęp Uprawy: {selectedVar.name} (Tyczkowanie ➔ Zbiór w Kent)
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
          <span className="text-stone-300">🪵 Tyczkowanie & Pędy (Wiosna)</span>
          <span className="hidden sm:inline">🧪/🌿 Nawożenie i Olistywanie</span>
          <span className="text-amber-200">🍃 Dojrzewanie Szyszek (Lato)</span>
          <span className="text-emerald-400 font-bold">🧺 Zbiór & Suszarnia Oast</span>
        </div>
      </div>

      {/* 2. ZINTEGROWANY PASEK OPERACYJNY */}
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
            <span>🐍</span> Rurociąg Uprawy Chmielu (Krok po Kroku)
          </span>
          <span className="font-mono text-[10px] text-stone-400 leading-[2.5]">
            Zakończone zbiory: <strong className="text-amber-300">{state.totalCyclesCompleted}</strong>
          </span>
        </div>

        {/* RZĄD 1 (KROKI 1 ──►► 2 ──►► 3 ──►► 4) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] items-center gap-2.5">
          <HopStageCard {...getStageProps('rhizome_intake')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <HopStageCard {...getStageProps('plowing_stringing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="right" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <HopStageCard {...getStageProps('training')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="right"
              status={!state.enableFertilizing || !hasFertWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <HopStageCard {...getStageProps('fertilizing')} />
        </div>

        {/* ZAKRĘT RURY W DÓŁ */}
        <div className="hidden md:flex justify-end pr-8 lg:pr-14 py-0.5">
          <FarmPipelineArrow
            direction="down"
            status={(!state.enableFertilizing || !hasFertWorker) && (!state.enableStripping || !hasStripWorker) ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
          />
        </div>

        {/* RZĄD 2 (KROKI 8 ◄◄── 7 ◄◄── 6 ◄◄── 5) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] items-center gap-2.5">
          <HopStageCard {...getStageProps('drying_selling')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <HopStageCard {...getStageProps('harvesting')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow direction="left" status={isReady ? 'ready' : 'blocked'} />
          </div>
          <HopStageCard {...getStageProps('growing')} />
          <div className="hidden md:flex">
            <FarmPipelineArrow
              direction="left"
              status={!state.enableStripping || !hasStripWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
            />
          </div>
          <HopStageCard {...getStageProps('stripping')} />
        </div>
      </div>

      {/* 4. DOLNY PANEL EKONOMICZNY */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs leading-[2.5]">
        <div className="flex items-center gap-7">
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Przewidywane szyszki:</span>
            <strong className="text-amber-300 font-mono text-sm font-bold">{totalConesKg} kg</strong>
          </div>
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">Cena za tonę:</span>
            <strong className="text-amber-200 font-mono text-sm font-bold">£ {selectedVar.pricePerTonCones}</strong>
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
