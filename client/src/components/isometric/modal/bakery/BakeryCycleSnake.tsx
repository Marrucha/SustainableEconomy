import React, { useEffect, useState } from 'react';
import type { BuildingState } from '../../types';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { computeBakeryYieldSummary } from './bakeryMath';
import { BakeryStageCard } from './BakeryStageCard';
import {
  BAKERY_PRODUCTS_CONFIG,
  BAKERY_PROFESSIONS,
  BAKERY_STAGES_CONFIG,
  canBakeryWorkerHandleStage,
  checkIsBakeryProductionReady,
  getBakeryStageWorkerIds,
  isBakeryWorkerAssignedAnywhere,
  type BakeryCapitalismState,
  type BakeryCycleStage,
  type BakeryProductTarget,
  type BakeryProfession,
} from './bakeryTypes';

interface BakeryCycleSnakeProps {
  state: BakeryCapitalismState;
  buildingState: BuildingState;
  sizeTiles?: number;
  onUpdate: (updates: Partial<BakeryCapitalismState>) => void;
}

export const BakeryCycleSnake: React.FC<BakeryCycleSnakeProps> = ({
  state,
  buildingState,
  sizeTiles = 1,
  onUpdate,
}) => {
  const readyCheck = checkIsBakeryProductionReady(state, buildingState, sizeTiles);
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

  const summary = computeBakeryYieldSummary(state, buildingState);
  const productCfg =
    BAKERY_PRODUCTS_CONFIG[state.productTarget] || BAKERY_PRODUCTS_CONFIG.chleb_pszenny;
  const managerMember = state.crew.find((c) => c.profession === 'manager');

  // Zasada przetwórni miejskich: 1 osoba = maksymalnie 1 krok lejka
  const handleAssignWorker = (stage: BakeryCycleStage, workerId: string) => {
    if (isBakeryWorkerAssignedAnywhere(state, workerId)) return;
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
    const cfg = BAKERY_PROFESSIONS.manager;
    onUpdate({
      crew: [
        ...state.crew,
        {
          id: `bakery_mgr_${Date.now()}`,
          name: generateRandomEnglishName(),
          profession: 'manager',
          dailyWage: cfg.defaultWage,
        },
      ],
    });
  };

  const handleUnassignWorker = (stage: BakeryCycleStage, workerId: string) => {
    const currentIds = state.stageAssignments?.[stage] || [];
    onUpdate({
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: currentIds.filter((id) => id !== workerId),
      },
    });
  };

  const handleHireForStage = (stage: BakeryCycleStage, profession: BakeryProfession) => {
    const profCfg = BAKERY_PROFESSIONS[profession];
    const newId = `bakery_w_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
    const stageMeta = BAKERY_STAGES_CONFIG[idx];
    const assignedIds = getBakeryStageWorkerIds(state, stageMeta.id);
    const assignedWorkers = state.crew.filter((c) => assignedIds.includes(c.id));
    const eligibleWorkers = state.crew.filter(
      (c) =>
        canBakeryWorkerHandleStage(c.profession, stageMeta.id) &&
        !isBakeryWorkerAssignedAnywhere(state, c.id)
    );
    const isCurrent = readyCheck.isReady && state.currentStage === stageMeta.id;

    return (
      <BakeryStageCard
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

  const hasProofingWorker = getBakeryStageWorkerIds(state, 'proofing').length > 0;
  const isProofingBypassed = !state.proofingEnabled || !hasProofingWorker;

  const getArrowStatus = (fromIdx: number): 'ready' | 'blocked' | 'optional_bypassed' => {
    if (fromIdx === 1 || fromIdx === 2) {
      if (isProofingBypassed) return 'optional_bypassed';
    }
    return readyCheck.isReady ? 'ready' : 'blocked';
  };

  const isStagePulse = (fromIdx: number) =>
    readyCheck.isReady && state.currentStage === BAKERY_STAGES_CONFIG[fromIdx].id;

  return (
    <div className="space-y-3">
      {/* Pasek postępu na górze lejka */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 space-y-2 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{productCfg.icon}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold text-amber-200">Cykl Wypieku:</p>
                <select
                  value={state.productTarget}
                  onChange={(e) => {
                    const target = e.target.value as BakeryProductTarget;
                    onUpdate({
                      productTarget: target,
                      breadPricePerKg: BAKERY_PRODUCTS_CONFIG[target].defaultPricePerKg,
                    });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-stone-950 border border-amber-500/40 text-amber-100 font-bold text-xs cursor-pointer"
                >
                  {Object.values(BAKERY_PRODUCTS_CONFIG).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Wydajność:{' '}
                <span className="text-stone-200 font-mono">{summary.dailyFlourInputKg} kg mąki/d</span>{' '}
                →{' '}
                <span className="text-emerald-300 font-mono">{summary.dailyBreadOutputKg} szt. wypieku</span>{' '}
                +{' '}
                <span className="text-amber-300 font-mono">{summary.dailyRusksOutputKg} kg bułki tartej</span>{' '}
                ({summary.energyModeLabel})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sizeTiles >= 2 &&
              (managerMember ? (
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/95 border border-blue-400/70 text-blue-100 text-[11px] font-bold shadow-sm">
                  🎩 Zarządca: {managerMember.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleHireManager}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400 text-rose-200 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  🎩 Zatrudnij Zarządcę (£{BAKERY_PROFESSIONS.manager.defaultWage}/d)
                </button>
              ))}
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                readyCheck.isReady
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}
            >
              {readyCheck.isReady ? '⚡ Wypiek w toku' : `⚠️ ${readyCheck.missingReasons[0]}`}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 text-right shrink-0">
              {Math.round((displayHours / 168) * 100)}% ({displayHours}/168h)
            </span>
          </div>
        </div>

        {/* Pasek postępu tygodniowy podzielony na 7 dni × 24 godziny (168 odcinków) */}
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((dayLabel, dayIdx) => {
              const totalFilledHours = displayHours;
              const dayStartHour = dayIdx * 24;
              const isSundayCol = dayIdx === 6;
              const workdayHours = isSundayCol ? 0 : (state.workdayHours ?? 10);
              return (
                <div key={dayLabel} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 px-0.5">
                    <span className={isSundayCol ? 'text-rose-400 font-bold' : ''}>{dayLabel}</span>
                    <span>{isSundayCol ? 'Wolne' : `${workdayHours}h`}</span>
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
