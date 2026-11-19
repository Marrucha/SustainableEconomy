import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockChoiceBranch,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import { calculateFailureRisk, getInseminationSuccessPercent, LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { LivestockStageCard } from './LivestockStageCard';
import { LivestockSaleBranchCard } from './LivestockSaleBranchCard';

interface CattlePipelineProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const CattlePipeline: React.FC<CattlePipelineProps> = ({
  state,
  onUpdateState,
  onGoToCrewTab,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};

  const getWorkerForStage = (stage: LivestockStage): LivestockWorker | undefined => {
    const workerId = assignments[stage];
    return crew.find((w) => w.id === workerId);
  };

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAssign = (stage: LivestockStage, workerId: string) => {
    onUpdateState({
      stageAssignments: {
        ...assignments,
        [stage]: workerId,
      },
    });
  };

  const handleHireAndAssign = (stage: LivestockStage, profession: LivestockProfession) => {
    const cfg = LIVESTOCK_PROFESSIONS_CONFIG[profession];
    const newId = `livestock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newWorker: LivestockWorker = {
      id: newId,
      name: generateRandomEnglishName(crew.map((w) => w.name)),
      profession,
      wageDaily: cfg.defaultWage,
      avatar: cfg.icon,
      title: cfg.label,
    };
    onUpdateState({
      crew: [...crew, newWorker],
      stageAssignments: {
        ...assignments,
        [stage]: newId,
      },
    });
  };

  const handleSelectBranch = (branch: LivestockChoiceBranch) => {
    onUpdateState({ selectedBranch: branch });
    notify(`Wybrano ścieżkę: ${branch === 'sale' ? 'Sprzedaż żywca' : branch === 'slaughter' ? 'Ubój na mięso i skóry' : 'Stado Mleczne & Nawóz'}`);
  };

  const handleAdvanceStep = () => {
    const cur = state.currentStage;

    if (cur === 'insemination') {
      const recoveryRem = state.cattleRecoveryMonthsRemaining ?? 0;
      if (recoveryRem > 0) {
        notify(`⏳ Krowa odpoczywa po porodzie (pozostało ${recoveryRem} msc z 3 msc regeneracji).`);
        return;
      }
      if ((state.herd.milkingGroupCows || 0) <= 0) {
        notify('⛔ Rozmnażanie stada jest niemożliwe! Rozród możliwy jest wyłącznie na populacji mlecznej (brak krów matek).');
        return;
      }

      const worker = getWorkerForStage('insemination');
      const successPercent = getInseminationSuccessPercent(worker?.profession);
      const isFailure = Math.random() * 100 >= successPercent;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          stageProgress: 10,
        });
        notify(`⚠️ Inseminacja nie powiodła się (skuteczność: ${successPercent}%). Konieczne powtórzenie zabiegu!`);
        return;
      }

      onUpdateState({
        currentStage: 'gestation_9m',
        pregnancyMonthsPassed: 1,
        lactationMonthsPassed: 1,
        stageProgress: 25,
      });
      notify('✓ Sukces! Krowa jest cielna. Rozpoczyna się 9 miesięcy ciąży (dojenie aktywne przez pierwsze 6 msc)!');
      return;
    }

    if (cur === 'gestation_9m') {
      const nextMonths = (state.pregnancyMonthsPassed || 0) + 3;
      if (nextMonths < 9) {
        const milkGained = nextMonths <= 6 ? 120 : 0;
        onUpdateState({
          pregnancyMonthsPassed: nextMonths,
          lactationMonthsPassed: Math.min(6, nextMonths),
          stageProgress: 25 + Math.round((nextMonths / 9) * 20),
          storage: {
            ...state.storage,
            milkLiters: state.storage.milkLiters + milkGained,
          },
        });
        notify(`Upłynęło kolejne 3 miesiące ciąży (${nextMonths}/9 msc). ${milkGained > 0 ? `Pozyskano +${milkGained} l mleka!` : 'Krowa zasuszona przed porodem.'}`);
        return;
      }

      onUpdateState({
        currentStage: 'birth',
        pregnancyMonthsPassed: 9,
        stageProgress: 50,
      });
      notify('Krowa donosiła ciążę (9 miesięcy)! Nadszedł czas na odebranie porodu.');
      return;
    }

    if (cur === 'birth') {
      const worker = getWorkerForStage('birth');
      const risk = calculateFailureRisk(worker?.profession);
      const isFailure = Math.random() * 100 < risk.avg;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          currentStage: 'insemination',
          pregnancyMonthsPassed: 0,
          stageProgress: 0,
        });
        notify(`⚠️ Powikłania okołoporodowe (${risk.label}). Cielę nie przeżyło. Krowa wraca do stada.`);
        return;
      }

      onUpdateState({
        currentStage: 'calf_growth_2y',
        calfAgeMonths: 1,
        cattleRecoveryMonthsRemaining: 3,
        totalCalvesBorn: (state.totalCalvesBorn || 0) + 1,
        herd: {
          ...state.herd,
          growingGroupCalves: state.herd.growingGroupCalves + 1,
        },
        stageProgress: 60,
      });
      notify('🎉 Szczęśliwy poród! Na świat przyszło zdrowe cielę i dołączyło do Grupy Wzrostu.');
      return;
    }

    if (cur === 'calf_growth_2y') {
      const nextAge = (state.calfAgeMonths || 0) + 6;
      if (nextAge < 24) {
        onUpdateState({
          calfAgeMonths: nextAge,
          stageProgress: 60 + Math.round((nextAge / 24) * 25),
        });
        notify(`Cielę rośnie pod okiem hodowcy: wiek ${nextAge}/24 miesięcy (${(nextAge / 12).toFixed(1)} roku).`);
        return;
      }

      onUpdateState({
        currentStage: 'branch_decision',
        calfAgeMonths: 24,
        stageProgress: 85,
      });
      notify('Bydło osiągnęło pełną dojrzałość (2 lata)! Wybierz jedną z 3 ścieżek gospodarczych.');
      return;
    }

    if (cur === 'branch_decision') {
      const branch = state.selectedBranch || 'milking';

      if (branch === 'sale') {
        const salesWorker = crew.find((w) => w.profession === 'trader' || w.profession === 'breeder');
        if (!salesWorker) {
          notify('⚠️ Brak handlarza lub hodowcy do ustalenia ceny i sprzedaży bydła!');
          return;
        }
        const saleRev = state.cattleSalePrice ?? 45;
        onUpdateState({
          currentStage: 'insemination',
          pregnancyMonthsPassed: 0,
          calfAgeMonths: 0,
          stageProgress: 0,
          herd: {
            ...state.herd,
            growingGroupCalves: Math.max(0, state.herd.growingGroupCalves - 1),
          },
          lastCycleRevenue: (state.lastCycleRevenue || 0) + saleRev,
        });
        notify(`💰 ${salesWorker.name} sprzedał dorosłe bydło na rynku miejskim za £${saleRev}! Cykl rozpoczyna się od nowa.`);
        return;
      }

      if (branch === 'slaughter') {
        onUpdateState({
          currentStage: 'insemination',
          pregnancyMonthsPassed: 0,
          calfAgeMonths: 0,
          stageProgress: 0,
          herd: {
            ...state.herd,
            growingGroupCalves: Math.max(0, state.herd.growingGroupCalves - 1),
          },
          storage: {
            ...state.storage,
            beefKg: state.storage.beefKg + 180,
            leatherPcs: state.storage.leatherPcs + 2,
          },
        });
        notify('🥩 Hodowca dokonał uboju: pozyskano +180 kg wołowiny oraz +2 skóry garbarskie (ubój nie generuje obornika).');
        return;
      }

      const totalCattle = (state.herd.milkingGroupCows || 0) + (state.herd.growingGroupCalves || 0);
      const maxMilkingAllowed = Math.max(1, Math.floor(totalCattle * 0.5));
      const canAddToMilking = (state.herd.milkingGroupCows + 1) <= maxMilkingAllowed;

      if (!canAddToMilking) {
        onUpdateState({
          currentStage: 'insemination',
          pregnancyMonthsPassed: 0,
          calfAgeMonths: 0,
          stageProgress: 0,
        });
        notify('🐂 Dorosła sztuka to byk (maksymalnie 50% stada może być dojne - byki nie mają mleka). Byk zasila stado opasowe.');
        return;
      }

      onUpdateState({
        currentStage: 'insemination',
        pregnancyMonthsPassed: 0,
        calfAgeMonths: 0,
        stageProgress: 0,
        herd: {
          ...state.herd,
          growingGroupCalves: Math.max(0, state.herd.growingGroupCalves - 1),
          milkingGroupCows: state.herd.milkingGroupCows + 1,
        },
        storage: {
          ...state.storage,
          milkLiters: state.storage.milkLiters + 240,
          manureKg: state.storage.manureKg + 120,
        },
      });
      notify('🥛 Krowa włączona do Stada Dojenia! Pozyskano +240 l mleka i +120 kg nawozu. Rozpoczyna się reinseminacja.');
    }
  };

  const insemWorker = getWorkerForStage('insemination');
  const birthWorker = getWorkerForStage('birth');
  const insemRisk = calculateFailureRisk(insemWorker?.profession);
  const birthRisk = calculateFailureRisk(birthWorker?.profession);

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK CYKLU I INTERAKCJA */}
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐄</span>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Rurociąg Produkcji Bydła (4 Etapy)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onGoToCrewTab}
              className="py-1.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>👥</span> Kadra Fermy
            </button>
            <button
              onClick={handleAdvanceStep}
              className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs cursor-pointer shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>▶️</span> Rozwiń Cykl Bydła
            </button>
          </div>
        </div>

        {feedback && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium">
            {feedback}
          </div>
        )}

        {/* 4 ETAPY BAZOWE BYDŁA */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-stretch gap-2">
          <LivestockStageCard
            stepNum={1}
            icon="🧬"
            title="Inseminacja"
            tooltipDesc={`Rozmnażanie na populacji mlecznej (${state.herd.milkingGroupCows} krów matek, max 50% pogłowia). Weterynarz: 1-10% ryzyka, Hodowca: 10-30%.`}
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${insemRisk.avg}% Ryz.`}
            isCurrent={state.currentStage === 'insemination'}
            assignedWorker={insemWorker || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'vet' || w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz kadrę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            secondaryHireButtonLabel="🩺 Zatrudnij weterynarza"
            onAssign={(id) => handleAssign('insemination', id)}
            onHireAndAssign={() => handleHireAndAssign('insemination', 'breeder')}
            onSecondaryHireAndAssign={() => handleHireAndAssign('insemination', 'vet')}
          />

          <div className="hidden md:flex items-center">
            <FarmPipelineArrow direction="right" status={insemWorker ? 'ready' : 'blocked'} />
          </div>

          <LivestockStageCard
            stepNum={2}
            icon="🐄"
            title="Ciąża (9 msc)"
            tooltipDesc="Hodowca dba o dietę przez 9 miesięcy. Mleko pozyskiwane jest przez pierwsze 6 miesięcy."
            requiredProfessionLabel="Hodowca"
            badgeText="9 Msc"
            badgeVariant="sky"
            statusLine={`Ciąża: ${state.pregnancyMonthsPassed}/9 msc • Laktacja: ${state.lactationMonthsPassed}/6 msc`}
            isCurrent={state.currentStage === 'gestation_9m'}
            assignedWorker={getWorkerForStage('gestation_9m') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('gestation_9m', id)}
            onHireAndAssign={() => handleHireAndAssign('gestation_9m', 'breeder')}
          />

          <div className="hidden md:flex items-center">
            <FarmPipelineArrow direction="right" status={getWorkerForStage('gestation_9m') ? 'ready' : 'blocked'} />
          </div>

          <LivestockStageCard
            stepNum={3}
            icon="🍼"
            title="Poród"
            tooltipDesc="Odbiór porodu przez Weterynarza (1-10% ryzyka) lub Hodowcę (10-30% ryzyka)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${birthRisk.avg}% Ryz.`}
            isCurrent={state.currentStage === 'birth'}
            assignedWorker={birthWorker || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'vet' || w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz kadrę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            secondaryHireButtonLabel="🩺 Zatrudnij weterynarza"
            onAssign={(id) => handleAssign('birth', id)}
            onHireAndAssign={() => handleHireAndAssign('birth', 'breeder')}
            onSecondaryHireAndAssign={() => handleHireAndAssign('birth', 'vet')}
          />

          <div className="hidden md:flex items-center">
            <FarmPipelineArrow direction="right" status={birthWorker ? 'ready' : 'blocked'} />
          </div>

          <LivestockStageCard
            stepNum={4}
            icon="🐂"
            title="Opas (2 lata)"
            tooltipDesc="Hodowca prowadzi cielę przez 24 miesiące aż do osiągnięcia pełnej dojrzałości."
            requiredProfessionLabel="Hodowca"
            badgeText="2 Lata"
            badgeVariant="emerald"
            statusLine={`Wiek: ${state.calfAgeMonths}/24 msc (${(state.calfAgeMonths / 12).toFixed(1)} r.)`}
            isCurrent={state.currentStage === 'calf_growth_2y'}
            assignedWorker={getWorkerForStage('calf_growth_2y') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('calf_growth_2y', id)}
            onHireAndAssign={() => handleHireAndAssign('calf_growth_2y', 'breeder')}
          />
        </div>
      </div>

      {/* ROZGAŁĘZIENIE NA 3 ŚCIEŻKI */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔀</span> Przeznaczenie dorosłego bydła (po 2 latach)
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Wybrano: <strong className="text-amber-300">{state.selectedBranch}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <LivestockSaleBranchCard
            title="1. Sprzedaż żywca"
            isSelected={state.selectedBranch === 'sale' || state.selectedBranch === 'slaughter'}
            salePrice={state.cattleSalePrice ?? 45}
            crew={crew}
            onSelect={() => handleSelectBranch('sale')}
            onChangePrice={(val) => onUpdateState({ cattleSalePrice: val })}
            onHireTrader={(w) => onUpdateState({ crew: [...crew, w] })}
          />

          <button
            onClick={() => handleSelectBranch('milking')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${state.selectedBranch === 'milking' ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🥛</span>
              <span className="font-bold text-xs text-amber-200">2. Stado Mleczne & Rozród</span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold">Mleko + Obornik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
