import React, { useState, useEffect } from 'react';
import type { FarmCapitalismState, FarmCrewMember, FarmCycleStage, CropType, WorkerProfession, FertilizingLevel } from './farmGridTypes';
import {
  checkIsProductionReady,
  canWorkerHandleStage,
  CROPS_CONFIG,
  getGrainSiloDailyCostPence,
  getStageAssignedWorkerIds,
} from './farmGridTypes';
import { computeFarmYieldSummary } from './farmYieldMath';
import { FarmStageCard, type StageMeta } from './FarmStageCard';
import { FarmPipelineArrow } from './FarmPipelineArrow';
import { generateRandomEnglishName } from './englishNames';
import type { UseGameClockReturn } from '../clock/useGameClock';
import type { HorseAnimal } from './livestock/livestockTypes';
import {
  type GameDate,
  getStageForMonth,
} from '../clock/gameClockTypes';

interface FarmCycleSnakeProps {
  state: FarmCapitalismState;
  attachedFieldsCount?: number;
  ownedHorsesCount?: number;
  ownedHorses?: HorseAnimal[];
  clock?: UseGameClockReturn;
  onUpdate: (updates: Partial<FarmCapitalismState>) => void;
}

const STAGES_CONFIG: StageMeta[] = [
  { id: 'seed_intake', num: 1, label: 'Zaopatrzenie w Nasiona', shortLabel: 'Nasiona', icon: '🛒', desc: 'Pobór nasion z rynku miejskiego (£22) lub z własnego spichlerza.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
  { id: 'fertilizing', num: 2, label: 'Nawożenie Naturalne 1880', shortLabel: 'Nawożenie', icon: '🧪', desc: 'Opcjonalny obornik naturalny przed orką: 50% (+20% plonu) lub 100% (+30% plonu).', requiredProfessionLabel: 'Rolnik (Nawoziciel)', isOptional: true },
  { id: 'plowing', num: 3, label: 'Orka i Bruzdowanie', shortLabel: 'Orka', icon: '🚜', desc: 'Wiosenna orka wołowa/konna, wymieszanie obornika z glebą i przygotowanie pod wysiew.', requiredProfessionLabel: 'Rolnik (Oracz)' },
  { id: 'sowing', num: 4, label: 'Zasiew Zboża', shortLabel: 'Zasiew', icon: '🌱', desc: 'Precyzyjny wysiew ziarna w wyznaczone bruzdy siewne.', requiredProfessionLabel: 'Rolnik (Siewca)' },
  { id: 'weeding', num: 5, label: 'Pielenie i Nawadnianie', shortLabel: 'Pielenie/Nawod.', icon: '🌿', desc: 'Opcjonalne pielenie ręczne (+5% plonu) oraz nawadnianie (+10% i pełna ochrona przed utratą plonu przy suszy).', requiredProfessionLabel: 'Rolnik (Pielarz/Nawad.)', isOptional: true },
  { id: 'growing', num: 6, label: 'Wzrost pod Okiem Agronoma', shortLabel: 'Wzrost & Gleba', icon: '🌾', desc: 'Wegetacja łanu pod stałym nadzorem agronomicznym (Klasa M).', requiredProfessionLabel: 'Nadzór Agronoma' },
  { id: 'harvesting', num: 7, label: 'Żniwa i Omłot Snopów', shortLabel: 'Żniwa', icon: '🌾', desc: 'Koszenie łanów sierpami, wiązanie snopków i omłot ziarna.', requiredProfessionLabel: 'Rolnik (Żniwiarz)' },
  { id: 'storing_selling', num: 8, label: 'Zbyt lub Magazyn Silosu', shortLabel: 'Zbyt / Silos', icon: '💰', desc: 'Sprzedaż gotówkowa na rynku miejskim lub złożenie ziarna do silosu.', requiredProfessionLabel: 'Kupiec / Sprzedawca' },
];

export const FarmCycleSnake: React.FC<FarmCycleSnakeProps> = ({
  state,
  attachedFieldsCount = 0,
  ownedHorsesCount = 0,
  ownedHorses,
  clock,
  onUpdate,
}) => {
  const readyCheck = checkIsProductionReady(state, ownedHorsesCount);
  const isReady = readyCheck.isReady;

  // 1. ZEGAR GRY (ZSYNCHRONIZOWANY Z MAPĄ ŚWIATA)
  const [internalDate, setInternalDate] = useState<GameDate>({ day: 15, month: 4, year: 1880 });
  const [internalRunning] = useState<boolean>(true);
  const [internalSpeed] = useState<number>(2);

  const clockDate = clock ? clock.date : internalDate;

  const yieldSummary = computeFarmYieldSummary(state, attachedFieldsCount, false, ownedHorsesCount, ownedHorses);
  const {
    totalHectares,
    cultivatedHectares,
    fieldFarmersCount,
    farmerCapacityHa,
    acreageEfficiencyPct,
    harvestQualityPercent,
    seedRequiredKg,
    manureRequiredKg,
    hasEnoughManure,
    agronomistBonusPct,
    farmerBonusPct,
    fertilizerBonusPct,
    weedingBonusPct,
    irrigationBonusPct,
    totalBonusPct,
    totalYieldKg,
    hasFertWorker,
    hasWeedWorker,
  } = yieldSummary;
  const selectedCrop = CROPS_CONFIG[state.cropType || 'pszenica'];

  const effectiveFertLevel: FertilizingLevel = !state.enableFertilizing ? 0 : (state.fertilizingLevel ?? 100);
  const seedCost = state.seedSource === 'market' ? 22 : 0;
  const fertCost = hasFertWorker ? (effectiveFertLevel === 100 ? 14 : effectiveFertLevel === 50 ? 7 : 0) : 0;
  const sprayCost = hasWeedWorker ? (state.enableWeeding ? 9 : 0) + (state.enableIrrigation ? 8 : 0) : 0;
  const crewLaborCost = (state.crew || []).reduce((acc, w) => acc + w.wageDaily, 0);
  const agronomistCost = state.agronomist.hired ? state.agronomist.wageDaily : 0;
  const siloStorageCostGbp = getGrainSiloDailyCostPence(state.siloLevel) / 100;
  const totalDailyCosts = Number((seedCost + fertCost + sprayCost + crewLaborCost + agronomistCost + siloStorageCostGbp).toFixed(2));

  // W cyklu zamkniętym brak automatycznej sprzedaży NPC — przychód pojawia się dopiero przy realnym nabywcy
  const estRevenue = 0;
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

  // 2. AUTOMATYCZNA SYNCHRONIZACJA ETAPU Z MIESIĄCEM (globalne rozliczenie zbiorów realizuje useFarmAnnualTick)
  useEffect(() => {
    if (!isReady || clock) return;

    let scheduledStage = getStageForMonth(clockDate.month);

    if (scheduledStage === 'fertilizing' && (!state.enableFertilizing || !hasFertWorker || !hasEnoughManure)) {
      scheduledStage = 'plowing';
    }
    if (scheduledStage === 'weeding' && (!state.enableWeeding || !hasWeedWorker)) {
      scheduledStage = 'growing';
    }

    if (scheduledStage !== state.currentStage) {
      onUpdate({ currentStage: scheduledStage });
    }
  }, [clock, clockDate.month, isReady, state.enableFertilizing, state.enableWeeding, state.enableIrrigation, hasFertWorker, hasWeedWorker, hasEnoughManure]);

  const handleAssignWorkerToStage = (stage: FarmCycleStage, workerId: string) => {
    if (!workerId) return;
    const updated = { ...(state.stageAssignments || {}) };
    const current = getStageAssignedWorkerIds(updated, stage);
    if (!current.includes(workerId)) {
      updated[stage] = [...current, workerId];
      onUpdate({ stageAssignments: updated });
    }
  };

  const handleRemoveWorkerFromStage = (stage: FarmCycleStage, workerId: string) => {
    const updated = { ...(state.stageAssignments || {}) };
    const next = getStageAssignedWorkerIds(updated, stage).filter((id) => id !== workerId);
    if (next.length === 0) {
      delete updated[stage];
    } else {
      updated[stage] = next;
    }
    onUpdate({ stageAssignments: updated });
  };

  const getStageProps = (stageId: FarmCycleStage) => {
    const stage = STAGES_CONFIG.find((s) => s.id === stageId)!;
    const isCurrent = state.currentStage === stage.id;
    const crew = state.crew || [];
    const assignedIds = getStageAssignedWorkerIds(state.stageAssignments, stage.id);
    const assignedWorkers = assignedIds
      .map((id) => crew.find((w) => w.id === id) || null)
      .filter((w): w is FarmCrewMember => Boolean(w));
    const assignedWorker = assignedWorkers[0] || null;

    const hasWorker = assignedWorkers.some((w) => canWorkerHandleStage(w, stage.id));

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
      assignedWorkers,
      eligibleWorkers,
      isOptionalAndDisabled,
      isMissing,
      seedSource: state.seedSource,
      wheatDestination: state.wheatDestination,
      enableFertilizing: state.enableFertilizing,
      enableWeeding: state.enableWeeding,
      enableIrrigation: Boolean(state.enableIrrigation),
      fertilizingLevel: effectiveFertLevel,
      manureStockKg: state.manureStockKg ?? state.fertilizerStockKg ?? 0,
      manureRequiredKg,
      agronomist: state.agronomist,
      cropType: state.cropType || 'pszenica',
      currentFarmStage: state.currentStage,
      growingWeather: state.growingWeather,
      harvestWeather: state.harvestWeather,
      grainSalePricePerTon: state.grainSalePricePerTon ?? selectedCrop.marketPricePerTon,
      onChangeGrainSalePrice: (pricePerTon: number) => onUpdate({ grainSalePricePerTon: pricePerTon }),
      onChangeCropType: (newCrop: CropType) => {
        if (newCrop === (state.cropType || 'pszenica')) return;
        // Zmiana zasiewu NIE kasuje obecnych zapasów ziarna w spichlerzu
        onUpdate({ cropType: newCrop });
      },
      onAssignWorker: handleAssignWorkerToStage,
      onRemoveWorker: handleRemoveWorkerFromStage,
      onHireNewForStage: (stageId: FarmCycleStage) => {
        const isMerchant = stageId === 'seed_intake' || stageId === 'storing_selling';
        const profession: WorkerProfession = isMerchant ? 'merchant' : 'farmer';
        const newId = `worker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newMember: FarmCrewMember = {
          id: newId,
          name: generateRandomEnglishName(crew.map((w) => w.name)),
          profession,
          wageDaily: isMerchant ? 2.5 : 2.2,
          avatar: isMerchant ? '💰' : '🌾',
          ...(!isMerchant ? { skillBonusPercent: [2, 5, 8, 10][Math.floor(Math.random() * 4)] } : {}),
        };
        const currentIds = getStageAssignedWorkerIds(state.stageAssignments, stageId);
        onUpdate({
          crew: [...crew, newMember],
          stageAssignments: {
            ...state.stageAssignments,
            [stageId]: [...currentIds, newId],
          },
        });
      },
      onHireAgronomist: () => {
        onUpdate({
          agronomist: {
            ...state.agronomist,
            hired: true,
            name: generateRandomEnglishName(crew.map((w) => w.name)),
          },
        });
      },
      onToggleFertilizing: (enabled: boolean) =>
        onUpdate({ enableFertilizing: enabled, fertilizingLevel: enabled ? 100 : 0 }),
      onChangeFertilizingLevel: (level: FertilizingLevel) =>
        onUpdate({ fertilizingLevel: level, enableFertilizing: level > 0 }),
      onToggleWeeding: (enabled: boolean) => onUpdate({ enableWeeding: enabled }),
      onToggleIrrigation: (enabled: boolean) => onUpdate({ enableIrrigation: enabled }),
      onToggleSeedSource: () => onUpdate({ seedSource: state.seedSource === 'market' ? 'storage' : 'market' }),
      onToggleWheatDestination: () =>
        onUpdate({ wheatDestination: state.wheatDestination === 'sell_market' ? 'store_silo' : 'sell_market' }),
    };
  };

  // POSTĘP CYKLU: 360 dni w roku (12 msc * 30 dni) — zatrzymany na 0%, jeśli brak załogi lub gotowości
  const currentDayInYear = (clockDate.month - 1) * 30 + clockDate.day;
  const cycleProgressPercent =
    isReady && state.crew.length > 0
      ? Math.min(100, Math.max(0, Math.round((currentDayInYear / 360) * 100)))
      : 0;

  return (
    <div className="space-y-2">
      {/* 1. GŁÓWNY PASEK POSTĘPU PRODUKCJI */}
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl px-3.5 py-2 shadow-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs leading-tight gap-2 flex-wrap">
          <span className="font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5 py-0.5">
            <span>{selectedCrop.icon}</span> Postęp Uprawy: {selectedCrop.name} (Zasiew ➔ Żniwa)
          </span>
          <div className="flex items-center gap-2">
            {isReady ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Farma pracuje • 🐎 {yieldSummary.ownedHorsesCount}/{yieldSummary.requiredHorsesCount} ({yieldSummary.horseCapacityHa}/{totalHectares} ha)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 text-[11px] font-bold">
                {ownedHorsesCount < 1 ? '⛔ Brak energii (min. 1 koń)' : '⛔ Wstrzymana'}
              </span>
            )}
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {cycleProgressPercent}%
            </span>
          </div>
        </div>

        {/* PROGRES BAR TRACK & FILL */}
        <div className="w-full h-3 bg-stone-900 rounded-full border border-stone-800 p-0.5 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isReady
                ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
            }`}
            style={{ width: `${cycleProgressPercent}%` }}
          />
        </div>
        {!isReady && (
          <div className="text-rose-300 text-[11px] font-semibold">
            ⛔ Brak obsady: {readyCheck.missingStages.map((s) => s.label).join(', ')}
          </div>
        )}
      </div>

      {/* 2. GRAFICZNA ŚCIEŻKA PRODUKCJI */}
      <div className="bg-stone-950/95 border border-stone-800 rounded-2xl px-2.5 py-1.5 space-y-0.5 shadow-2xl">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 py-0.5">
            <span>🐍</span> Rurociąg Produkcji Zboża (Krok po Kroku)
          </span>
          <span className="font-mono text-[10px] text-stone-400">
            Zakończone zbiory: <strong className="text-amber-300">{state.totalCyclesCompleted}</strong>
          </span>
        </div>

        {/* RZĄD 1 (KROKI 1 ──►► 2 ──►► 3 ──►► 4) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-stretch gap-1.5">
          <FarmStageCard {...getStageProps('seed_intake')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="right"
              status={!state.enableFertilizing || !hasFertWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'seed_intake'}
            />
          </div>
          <FarmStageCard {...getStageProps('fertilizing')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="right"
              status={isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'fertilizing'}
            />
          </div>
          <FarmStageCard {...getStageProps('plowing')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="right"
              status={isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'plowing'}
            />
          </div>
          <FarmStageCard {...getStageProps('sowing')} />
        </div>

        {/* ZAKRĘT RURY W DÓŁ — WYŚRODKOWANY POD KARTĄ 4 */}
        <div className="hidden md:grid md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] gap-1.5">
          <div className="col-start-7 flex justify-center">
            <FarmPipelineArrow
              direction="down"
              status={!state.enableWeeding || !hasWeedWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'sowing'}
            />
          </div>
        </div>

        {/* RZĄD 2 (KROKI 8 ◄◄── 7 ◄◄── 6 ◄◄── 5) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-stretch gap-1.5">
          <FarmStageCard {...getStageProps('storing_selling')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="left"
              status={isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'harvesting'}
            />
          </div>
          <FarmStageCard {...getStageProps('harvesting')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="left"
              status={isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'growing'}
            />
          </div>
          <FarmStageCard {...getStageProps('growing')} />
          <div className="hidden md:flex items-center">
            <FarmPipelineArrow
              direction="left"
              status={!state.enableWeeding || !hasWeedWorker ? 'optional_bypassed' : isReady ? 'ready' : 'blocked'}
              isActivePulse={state.currentStage === 'weeding'}
            />
          </div>
          <FarmStageCard {...getStageProps('weeding')} />
        </div>
      </div>

      {/* 4. DOLNY PANEL EKONOMICZNY */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl py-1.5 px-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs leading-snug">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <span className="text-stone-400 block text-[11px]">
              Wysiew ({cultivatedHectares} / {totalHectares} ha • {fieldFarmersCount} roln. / limit {farmerCapacityHa} ha):
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-sky-300 font-mono text-sm font-bold">{seedRequiredKg} kg</strong>
              {cultivatedHectares < totalHectares && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/40 font-mono">
                  ⚠️ Nieobsiane/niezebrane: {Math.max(0, totalHectares - cultivatedHectares).toFixed(1)} ha ({acreageEfficiencyPct}% plon • {harvestQualityPercent}% jak.)
                </span>
              )}
            </div>
          </div>
          <div className="leading-[2.5]">
            <span className="text-stone-400 block text-[11px] leading-[2.5]">
              Przewidywany plon {totalBonusPct > 0 ? `(+${totalBonusPct}%: Agr +${agronomistBonusPct}%, Rol +${farmerBonusPct}%, Naw +${fertilizerBonusPct}%, Piel/Woda +${weedingBonusPct + irrigationBonusPct}%)` : ''}:
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-amber-300 font-mono text-sm font-bold">
                {(totalYieldKg / 1000).toFixed(2)} t ({totalYieldKg} kg)
              </strong>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold border bg-amber-500/20 text-amber-200 border-amber-400/50">
                → 🏛️ Spichlerz
              </span>
            </div>
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
      </div>
    </div>
  );
};
