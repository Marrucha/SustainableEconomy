import React, { useEffect, useState } from 'react';
import type { BuildingState } from '../../types';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { computeMillYieldSummary } from './millMath';
import { MillStageCard } from './MillStageCard';
import { computeProductionChecklist } from '../productionChecklist';
import {
  canMillWorkerHandleStage,
  checkIsMillProductionReady,
  getMillStageWorkerIds,
  isMillWorkerAssignedAnywhere,
  MILL_PRODUCTS_CONFIG,
  MILL_PROFESSIONS,
  MILL_STAGES_CONFIG,
  type MillCapitalismState,
  type MillCycleStage,
  type MillProfession,
} from './millTypes';

interface MillCycleSnakeProps {
  state: MillCapitalismState;
  buildingState: BuildingState;
  sizeTiles?: number;
  onUpdate: (updates: Partial<MillCapitalismState>) => void;
}

export const MillCycleSnake: React.FC<MillCycleSnakeProps> = ({
  state,
  buildingState,
  sizeTiles = 2,
  onUpdate,
}) => {
  const readyCheck = checkIsMillProductionReady(state, buildingState, sizeTiles);
  const checklist = computeProductionChecklist(
    {
      id: 'mill',
      typeId: 'mill',
      name: 'Młyn Parowy',
      x: 0,
      y: 0,
      sizeX: 1,
      sizeY: sizeTiles,
      rotation: 0,
      cost: 0,
    },
    { ...buildingState, millState: state }
  );
  const isActuallyRunning = readyCheck.isReady && checklist.allPassed && state.isMillingActive;
  const pausedReason =
    readyCheck.missingReasons[0] ||
    checklist.items.find((i) => !i.passed)?.detail ||
    '';
  const targetHours = Math.round((state.cycleProgressPercent / 100) * 168);
  const [displayHours, setDisplayHours] = useState<number>(targetHours);

  useEffect(() => {
    if (displayHours === targetHours) return;
    const diff = (targetHours - displayHours + 168) % 168;
    if (diff === 0) return;
    const stepMs = Math.max(16, Math.min(55, Math.floor(1200 / diff)));
    const timer = setInterval(() => {
      setDisplayHours((prev) => {
        if (prev === targetHours) return prev;
        return (prev + 1) % 168;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [targetHours, displayHours]);

  const summary = computeMillYieldSummary(state, buildingState);
  const productCfg = MILL_PRODUCTS_CONFIG[state.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;
  const managerMember = state.crew.find((c) => c.profession === 'manager');

  // Zasada fabryk miejskich: 1 osoba = maksymalnie 1 krok lejka
  const handleAssignWorker = (stage: MillCycleStage, workerId: string) => {
    if (isMillWorkerAssignedAnywhere(state, workerId)) return;
    const currentIds = state.stageAssignments?.[stage] || [];
    onUpdate({
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: [...currentIds, workerId],
      },
    });
  };

  const handleHireManager = () => {
    if (managerMember) return;
    const cfg = MILL_PROFESSIONS.manager;
    onUpdate({
      crew: [
        ...state.crew,
        {
          id: `mill_mgr_${Date.now()}`,
          name: generateRandomEnglishName(),
          profession: 'manager',
          dailyWage: cfg.defaultWage,
        },
      ],
    });
  };

  const handleUnassignWorker = (stage: MillCycleStage, workerId: string) => {
    const currentIds = state.stageAssignments?.[stage] || [];
    onUpdate({
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: currentIds.filter((id) => id !== workerId),
      },
    });
  };

  const handleHireForStage = (stage: MillCycleStage, profession: MillProfession) => {
    const profCfg = MILL_PROFESSIONS[profession];
    const newId = `mill_w_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newMember = {
      id: newId,
      name: generateRandomEnglishName(),
      profession,
      dailyWage: profCfg.defaultWage,
    };
    const currentIds = state.stageAssignments?.[stage] || [];
    onUpdate({
      crew: [...state.crew, newMember],
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: [...currentIds, newId],
      },
    });
  };

  const renderStage = (idx: number) => {
    const stageMeta = MILL_STAGES_CONFIG[idx];
    const assignedIds = getMillStageWorkerIds(state, stageMeta.id);
    const assignedWorkers = state.crew.filter((c) => assignedIds.includes(c.id));
    const eligibleWorkers = state.crew.filter(
      (c) =>
        canMillWorkerHandleStage(c.profession, stageMeta.id) &&
        !isMillWorkerAssignedAnywhere(state, c.id)
    );
    const isCurrent = readyCheck.isReady && state.currentStage === stageMeta.id;

    return (
      <MillStageCard
        key={stageMeta.id}
        stageMeta={stageMeta}
        state={state}
        assignedWorkers={assignedWorkers}
        eligibleWorkers={eligibleWorkers}
        isCurrent={isCurrent}
        onAssignWorker={handleAssignWorker}
        onUnassignWorker={handleUnassignWorker}
        onHireForStage={handleHireForStage}
        onUpdateState={onUpdate}
      />
    );
  };

  const hasConditioningWorker = getMillStageWorkerIds(state, 'conditioning').length > 0;
  const isConditioningBypassed = !state.conditioningEnabled || !hasConditioningWorker;

  const getArrowStatus = (fromIdx: number): 'ready' | 'blocked' | 'optional_bypassed' => {
    // Strzałka przed (1 -> 2) i po (2 -> 3) opcjonalnym etapie nawilżania ma kolor optional_bypassed (żółty przerywany), gdy etap jest wyłączony lub nieobsadzony — identycznie jak na Farmie
    if (fromIdx === 1 || fromIdx === 2) {
      if (isConditioningBypassed) return 'optional_bypassed';
    }
    return readyCheck.isReady ? 'ready' : 'blocked';
  };

  const isStagePulse = (fromIdx: number) =>
    readyCheck.isReady && state.currentStage === MILL_STAGES_CONFIG[fromIdx].id;

  return (
    <div className="space-y-3">
      {/* Pasek postępu na górze lejka */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 space-y-2 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{productCfg.icon}</span>
            <div>
              <p className="text-xs font-bold text-amber-200">
                Cykl Przemiału • {productCfg.label}
              </p>
              <p className="text-[11px] text-stone-400">
                Wydajność: <span className="text-stone-200 font-mono">{summary.dailyGrainInputKg} kg ziarna/d</span>{' '}
                (~<span className="text-sky-300 font-mono">{((summary.dailyGrainInputKg * (state.freeSaturdays ? 5 : 6)) / 1000).toFixed(1)} t/tydz.</span>) →{' '}
                <span className="text-emerald-300 font-mono">{summary.dailyFlourOutputKg} kg mąki</span> +{' '}
                <span className="text-amber-300 font-mono">{summary.dailyBranOutputKg} kg otrąb</span> ({summary.energyModeLabel})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sizeTiles >= 2 && (
              managerMember ? (
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/95 border border-blue-400/70 text-blue-100 text-[11px] font-bold shadow-sm">
                  🎩 Zarządca: {managerMember.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleHireManager}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400 text-rose-200 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  🎩 Zatrudnij Zarządcę (£{MILL_PROFESSIONS.manager.defaultWage}/d)
                </button>
              )
            )}
            <span
              title={isActuallyRunning ? 'Przemiał w toku' : pausedReason}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                isActuallyRunning
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}
            >
              {isActuallyRunning ? '⚡ Przemiał w toku' : '⏸️ Przemiał wstrzymany'}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 text-right shrink-0">
              {Math.round((displayHours / 168) * 100)}% ({displayHours}/168h)
            </span>
          </div>
        </div>

        {/* Pasek postępu tygodniowy podzielony na 7 dni × 24 godziny (168 odcinków) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>Cykl tygodniowy (Pn–Nd • 168h)</span>
            <label className="flex items-center gap-1.5 text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(state.freeSaturdays)}
                onChange={(e) => onUpdate({ freeSaturdays: e.target.checked })}
                className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
              />
              <span>Wolne soboty</span>
            </label>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((dayLabel, dayIdx) => {
              const totalFilledHours = displayHours;
              const dayStartHour = dayIdx * 24;
              const isSundayCol = dayIdx === 6;
              const isSaturdayOff = dayIdx === 5 && Boolean(state.freeSaturdays);
              const isOffDay = isSundayCol || isSaturdayOff;
              const workdayHours = isOffDay ? 0 : (state.workdayHours ?? 10);
              return (
                <div key={dayLabel} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 px-0.5">
                    <span className={isOffDay ? 'text-rose-400 font-bold' : ''}>{dayLabel}</span>
                    <span>{isOffDay ? 'Wolne' : `${workdayHours}h`}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-[1px] bg-stone-950 p-0.5 rounded border border-stone-800">
                    {Array.from({ length: 24 }).map((_, hourIdx) => {
                      const globalHour = dayStartHour + hourIdx;
                      const isFilled = globalHour < totalFilledHours;
                      const isWorkHour = hourIdx < workdayHours;
                      return (
                        <div
                          key={hourIdx}
                          title={`${dayLabel} ${hourIdx}:00`}
                          className={`h-1.5 rounded-[1px] ${
                            isFilled
                              ? isWorkHour
                                ? 'bg-amber-400'
                                : 'bg-emerald-500/70'
                              : isWorkHour
                              ? 'bg-stone-800'
                              : 'bg-stone-900'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rząd 1: Etapy 1 ──► 2 ──► 3 ──► 4 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-stretch gap-1.5">
        {renderStage(0)}
        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow
            direction="right"
            status={getArrowStatus(0)}
            isActivePulse={isStagePulse(0)}
          />
        </div>
        {renderStage(1)}
        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow
            direction="right"
            status={getArrowStatus(1)}
            isActivePulse={isStagePulse(1)}
          />
        </div>
        {renderStage(2)}
        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow
            direction="right"
            status={getArrowStatus(2)}
            isActivePulse={isStagePulse(2)}
          />
        </div>
        {renderStage(3)}
      </div>

      {/* Zakręt rury w dół — wyśrodkowany pod kartą 4 */}
      <div className="hidden md:grid md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] gap-1.5">
        <div className="col-start-7 flex justify-center">
          <FarmPipelineArrow
            direction="down"
            status={getArrowStatus(3)}
            isActivePulse={isStagePulse(3)}
          />
        </div>
      </div>

      {/* Rząd 2: Etapy 7 ◄── 6 ◄── 5 (w kolumnach 3, 5, 7 pod etapami 2, 3, 4) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-stretch gap-1.5">
        <div className="hidden md:block" />
        <div className="hidden md:block" />
        {renderStage(6)}
        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow
            direction="left"
            status={getArrowStatus(5)}
            isActivePulse={isStagePulse(5)}
          />
        </div>
        {renderStage(5)}
        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow
            direction="left"
            status={getArrowStatus(4)}
            isActivePulse={isStagePulse(4)}
          />
        </div>
        {renderStage(4)}
      </div>
    </div>
  );
};
