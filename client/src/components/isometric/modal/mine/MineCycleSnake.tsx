import React from 'react';
import type { BuildingState } from '../../types';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { computeMineYieldSummary } from './mineMath';
import { MineStageCard } from './MineStageCard';
import {
  canMineWorkerHandleStage,
  checkIsMineProductionReady,
  getMineStageWorkerIds,
  isMineWorkerAssignedAnywhere,
  MINE_PROFESSIONS,
  MINE_STAGES_CONFIG,
  type MineCapitalismState,
  type MineCycleStage,
  type MineProfession,
} from './mineCapitalismTypes';
import type { MineDepositInfo } from './mineTypes';

interface MineCycleSnakeProps {
  state: MineCapitalismState;
  buildingState: BuildingState;
  depositInfo: MineDepositInfo;
  sizeTiles?: number;
  onUpdate: (updates: Partial<MineCapitalismState>) => void;
}

export const MineCycleSnake: React.FC<MineCycleSnakeProps> = ({
  state,
  buildingState,
  depositInfo,
  sizeTiles = 2,
  onUpdate,
}) => {
  const readyCheck = checkIsMineProductionReady(state, buildingState, sizeTiles);
  const summary = computeMineYieldSummary(state, buildingState, depositInfo);
  const managerMember = state.crew.find((c) => c.profession === 'manager');
  const stockTons = buildingState.mineStock ?? 0;

  // Zasada kopalń i fabryk: 1 osoba = maksymalnie 1 krok lejka
  const handleAssignWorker = (stage: MineCycleStage, workerId: string) => {
    if (isMineWorkerAssignedAnywhere(state, workerId)) return;
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
    const cfg = MINE_PROFESSIONS.manager;
    onUpdate({
      crew: [
        ...state.crew,
        {
          id: `mine_mgr_${Date.now()}`,
          name: generateRandomEnglishName(),
          profession: 'manager',
          dailyWage: cfg.defaultWage,
        },
      ],
    });
  };

  const handleUnassignWorker = (stage: MineCycleStage, workerId: string) => {
    const currentIds = state.stageAssignments?.[stage] || [];
    onUpdate({
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: currentIds.filter((id) => id !== workerId),
      },
    });
  };

  const handleHireForStage = (stage: MineCycleStage, profession: MineProfession) => {
    const profCfg = MINE_PROFESSIONS[profession];
    const newId = `mine_w_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
    const stageMeta = MINE_STAGES_CONFIG[idx];
    const assignedIds = getMineStageWorkerIds(state, stageMeta.id);
    const assignedWorkers = state.crew.filter((c) => assignedIds.includes(c.id));
    const eligibleWorkers = state.crew.filter(
      (c) =>
        canMineWorkerHandleStage(c.profession, stageMeta.id) &&
        !isMineWorkerAssignedAnywhere(state, c.id)
    );
    const isCurrent = readyCheck.isReady && state.currentStage === stageMeta.id;

    return (
      <MineStageCard
        key={stageMeta.id}
        stageMeta={stageMeta}
        state={state}
        depositInfo={depositInfo}
        stockTons={stockTons}
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

  const hasVentilationWorker = getMineStageWorkerIds(state, 'ventilation').length > 0;
  const isVentilationBypassed = !state.ventilationEnabled || !hasVentilationWorker;

  const getArrowStatus = (fromIdx: number): 'ready' | 'blocked' | 'optional_bypassed' => {
    if (fromIdx === 1 || fromIdx === 2) {
      if (isVentilationBypassed) return 'optional_bypassed';
    }
    return readyCheck.isReady ? 'ready' : 'blocked';
  };

  const isStagePulse = (fromIdx: number) =>
    readyCheck.isReady && state.currentStage === MINE_STAGES_CONFIG[fromIdx].id;

  return (
    <div className="space-y-3">
      {/* Pasek postępu na górze lejka */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 space-y-2 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{depositInfo.icon}</span>
            <div>
              <p className="text-xs font-bold text-amber-200">
                Cykl Wydobycia • {depositInfo.name} (🔒 Złoże dożywotnie)
              </p>
              <p className="text-[11px] text-stone-400">
                Wydajność:{' '}
                <span className="text-emerald-300 font-mono">{summary.monthlyOreTons} t/msc</span>{' '}
                (~{summary.dailyOreTons} t/d) • {summary.energyModeLabel}
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
                  🎩 Zatrudnij Zarządcę (£{MINE_PROFESSIONS.manager.defaultWage}/d)
                </button>
              ))}
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                readyCheck.isReady
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}
            >
              {readyCheck.isReady ? '⚡ Wydobycie w toku' : `⚠️ ${readyCheck.missingReasons[0]}`}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 w-10 text-right">
              {Math.round(state.cycleProgressPercent)}%
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
          <div
            className={`h-full transition-all duration-300 ${
              readyCheck.isReady
                ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400'
                : 'bg-stone-700'
            }`}
            style={{ width: `${state.cycleProgressPercent}%` }}
          />
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

      {/* Rząd 2: Etapy 7 ◄── 6 ◄── 5 */}
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
