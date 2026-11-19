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

interface HorsePipelineProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const HorsePipeline: React.FC<HorsePipelineProps> = ({
  state,
  onUpdateState,
  onGoToCrewTab,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};
  const curStage = state.horseStage || 'insemination';
  const selectedBranch = state.selectedHorseBranch || 'milking';

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
    onUpdateState({ selectedHorseBranch: branch });
    notify(
      `Wybrano przeznaczenie koni: ${
        branch === 'milking'
          ? 'Zachowaj do rozrodu (Stado podstawowe & obornik koński)'
          : 'Sprzedaż konia na rynku (£85/szt.)'
      }`
    );
  };

  const handleAdvanceStep = () => {
    if (curStage === 'insemination') {
      const recoveryRem = state.horseRecoveryMonthsRemaining ?? 0;
      if (recoveryRem > 0) {
        notify(`⏳ Klacz odpoczywa po porodzie (pozostało ${recoveryRem} msc z 3 msc regeneracji).`);
        return;
      }
      const waitRem = state.horseInseminationWaitMonths ?? 0;
      if (waitRem > 0) {
        notify(`⏳ Nieudana próba — odczekaj ${waitRem} msc przed kolejną próbą zapłodnienia.`);
        return;
      }

      const adultHorses = state.herd.adultDraftHorses ?? 10;
      const horsesList = state.herd.horses;
      if (horsesList && horsesList.length > 0) {
        const breedingHorses = horsesList.filter((h) => h.group === 'breeding');
        const hasMale = breedingHorses.some((h, i) => (h.sex ?? (i % 4 === 0 ? 'male' : 'female')) === 'male');
        const hasFemale = breedingHorses.some((h, i) => (h.sex ?? (i % 4 === 0 ? 'male' : 'female')) === 'female');
        if (!hasMale || !hasFemale) {
          notify('⛔ Rozród koni wymaga minimum 1 ogiera (samca) oraz 1 klaczy (samicy) w grupie Rozród!');
          return;
        }
      } else if (adultHorses <= 0) {
        notify('⛔ Rozród koni niemożliwy — brak dorosłych koni w stadzie podstawowym.');
        return;
      }

      const worker = getWorkerForStage('insemination');
      const successPercent = getInseminationSuccessPercent(worker?.profession);
      if (Math.random() * 100 >= successPercent) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          horseInseminationWaitMonths: 1,
          horseProgress: 10,
        });
        notify(`⚠️ Stanówka klaczy nie powiodła się (skuteczność: ${successPercent}%). Ponowna próba za 1 miesiąc.`);
        return;
      }

      onUpdateState({
        horseStage: 'gestation_9m',
        horsePregnancyMonths: 1,
        horseProgress: 25,
      });
      notify('✓ Sukces! Klacz jest źrebna. Rozpoczyna się 11 miesięcy ciąży.');
      return;
    }

    if (curStage === 'gestation_9m') {
      const nextMonths = (state.horsePregnancyMonths || 0) + 3;
      if (nextMonths < 11) {
        onUpdateState({
          horsePregnancyMonths: nextMonths,
          horseProgress: 25 + Math.round((nextMonths / 11) * 25),
        });
        notify(`Upłynęły kolejne 3 miesiące źrebności (${nextMonths}/11 msc).`);
        return;
      }

      onUpdateState({
        horseStage: 'birth',
        horsePregnancyMonths: 11,
        horseProgress: 50,
      });
      notify('Klacz donosiła ciążę (11 miesięcy)! Czas na wyźrebienie.');
      return;
    }

    if (curStage === 'birth') {
      const worker = getWorkerForStage('birth');
      const risk = calculateFailureRisk(worker?.profession);
      if (Math.random() * 100 < risk.avg) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          horseStage: 'insemination',
          horsePregnancyMonths: 0,
          horseProgress: 0,
        });
        notify(`⚠️ Powikłania przy wyźrebieniu (${risk.label}). Klacz wraca do stada.`);
        return;
      }

      const curFoals = state.herd.growingFoalsCount ?? 4;
      const curAdults = state.herd.adultDraftHorses ?? 10;
      onUpdateState({
        horseStage: 'calf_growth_2y',
        foalAgeMonths: 1,
        horseRecoveryMonthsRemaining: 3,
        herd: {
          ...state.herd,
          growingFoalsCount: curFoals + 1,
          horsesFlockCount: curAdults + curFoals + 1,
        },
        horseProgress: 60,
      });
      notify('🎉 Szczęśliwe wyźrebienie! Zdrowy źrebak dołączył do grupy odchowu.');
      return;
    }

    if (curStage === 'calf_growth_2y') {
      const nextAge = (state.foalAgeMonths || 0) + 9;
      if (nextAge < 36) {
        onUpdateState({
          foalAgeMonths: nextAge,
          horseProgress: 60 + Math.round((nextAge / 36) * 25),
        });
        notify(`Źrebak dorasta pod okiem hodowcy: ${nextAge}/36 msc (${(nextAge / 12).toFixed(1)} r.).`);
        return;
      }

      onUpdateState({
        horseStage: 'branch_decision',
        foalAgeMonths: 36,
        horseProgress: 85,
      });
      notify('Koń osiągnął pełną dojrzałość (3 lata / 36 msc)! Wybierz przeznaczenie.');
      return;
    }

    if (curStage === 'branch_decision') {
      const curFoals = state.herd.growingFoalsCount ?? 4;
      const curAdults = state.herd.adultDraftHorses ?? 10;

      if (selectedBranch === 'sale' || selectedBranch === 'slaughter') {
        const salesWorker = crew.find((w) => w.profession === 'trader' || w.profession === 'breeder');
        if (!salesWorker) {
          notify('⚠️ Brak handlarza lub hodowcy do ustalenia ceny i sprzedaży konia!');
          return;
        }
        const rev = state.horseSalePrice ?? 85;
        onUpdateState({
          horseStage: 'insemination',
          horsePregnancyMonths: 0,
          foalAgeMonths: 0,
          horseProgress: 0,
          herd: {
            ...state.herd,
            growingFoalsCount: Math.max(0, curFoals - 1),
            horsesFlockCount: curAdults + Math.max(0, curFoals - 1),
          },
          lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
        });
        notify(`💰 ${salesWorker.name} sprzedał dorosłego konia na rynku za £${rev}!`);
        return;
      }

      onUpdateState({
        horseStage: 'insemination',
        horsePregnancyMonths: 0,
        foalAgeMonths: 0,
        horseProgress: 0,
        herd: {
          ...state.herd,
          growingFoalsCount: Math.max(0, curFoals - 1),
          adultDraftHorses: curAdults + 1,
          horsesFlockCount: curAdults + 1 + Math.max(0, curFoals - 1),
        },
        storage: {
          ...state.storage,
          manureKg: state.storage.manureKg + 140,
        },
      });
      notify('🐎 Koń dołączył do stada podstawowego! Pozyskano +140 kg obornika końskiego.');
    }
  };

  const insemWorker = getWorkerForStage('insemination');
  const birthWorker = getWorkerForStage('birth');
  const insemRisk = calculateFailureRisk(insemWorker?.profession);
  const birthRisk = calculateFailureRisk(birthWorker?.profession);

  return (
    <div className="space-y-5">
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐎</span>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Rurociąg Hodowli Koni (4 Etapy)
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
              <span>▶️</span> Rozwiń Cykl Koni
            </button>
          </div>
        </div>

        {feedback && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-stretch gap-2">
          <LivestockStageCard
            stepNum={1}
            icon="🧬"
            title="Stanówka Klaczy"
            tooltipDesc="Krycie klaczy przez Weterynarza (1-10% ryzyka) lub Hodowcę (10-30% ryzyka)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${insemRisk.avg}% Ryz.`}
            isCurrent={curStage === 'insemination'}
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
            icon="🐎"
            title="Źrebność (11 msc)"
            tooltipDesc="Ciąża klaczy trwa dokładnie 11 miesięcy pod stałą opieką hodowcy."
            requiredProfessionLabel="Hodowca"
            badgeText="11 Msc"
            badgeVariant="sky"
            statusLine={`Ciąża: ${state.horsePregnancyMonths || 0}/11 msc`}
            isCurrent={curStage === 'gestation_9m'}
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
            icon="🐴"
            title="Wyźrebienie"
            tooltipDesc="Odbiór porodu źrebaka przez Weterynarza (1-10%) lub Hodowcę (10-30%)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${birthRisk.avg}% Ryz.`}
            isCurrent={curStage === 'birth'}
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
            icon="🏇"
            title="Odchów (3 lata)"
            tooltipDesc="Wychów i ujeżdżanie źrebaka trwa 36 miesięcy (3 lata) pod opieką hodowcy."
            requiredProfessionLabel="Hodowca"
            badgeText="36 Msc"
            badgeVariant="emerald"
            statusLine={`Wiek: ${state.foalAgeMonths || 0}/36 msc (${((state.foalAgeMonths || 0) / 12).toFixed(1)} r.)`}
            isCurrent={curStage === 'calf_growth_2y'}
            assignedWorker={getWorkerForStage('calf_growth_2y') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('calf_growth_2y', id)}
            onHireAndAssign={() => handleHireAndAssign('calf_growth_2y', 'breeder')}
          />
        </div>
      </div>

      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔀</span> Przeznaczenie dorosłego konia (po 3 latach)
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Wybrano: <strong className="text-amber-300">{selectedBranch}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <LivestockSaleBranchCard
            title="1. Sprzedaż Konia"
            isSelected={selectedBranch === 'sale' || selectedBranch === 'slaughter'}
            salePrice={state.horseSalePrice ?? 85}
            crew={crew}
            onSelect={() => handleSelectBranch('sale')}
            onChangePrice={(val) => onUpdateState({ horseSalePrice: val })}
            onHireTrader={(w) => onUpdateState({ crew: [...crew, w] })}
          />

          <button
            onClick={() => handleSelectBranch('milking')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${selectedBranch === 'milking' ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🐎</span>
              <span className="font-bold text-xs text-amber-200">2. Zachowaj do Rozrodu</span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold">Stado + Obornik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
