import React from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import { calculateFailureRisk, LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { LivestockStageCard } from './LivestockStageCard';

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
  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};
  const curStage = state.horseStage || 'insemination';

  const getWorkerForStage = (stage: LivestockStage): LivestockWorker | undefined => {
    const workerId = assignments[stage];
    return crew.find((w) => w.id === workerId);
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
          </div>
        </div>

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
    </div>
  );
};
