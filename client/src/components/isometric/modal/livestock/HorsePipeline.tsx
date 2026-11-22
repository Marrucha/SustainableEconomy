import React from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import { calculateFailureRisk, getInseminationSuccessPercent, LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';
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

  const horses = (state.herd?.horses || []).filter((h) => !h.isDeceased);
  const breedingMares = horses.filter((h) => h.group === 'breeding' && h.sex !== 'male');
  const insemMares = breedingMares.filter(
    (h) => h.breedingStatus !== 'pregnant' && (h.breedingWaitMonths ?? 0) === 0
  );
  const restMares = breedingMares.filter(
    (h) => h.breedingStatus === 'failed_wait' || (h.breedingWaitMonths ?? 0) > 0
  );
  const pregnantMares = breedingMares.filter((h) => h.breedingStatus === 'pregnant');
  const growingFoals = horses.filter((h) => h.group === 'growth');

  const avgPregnancyMonths =
    pregnantMares.length > 0
      ? (
          pregnantMares.reduce((sum, h) => sum + (h.pregnancyMonths ?? 0), 0) /
          pregnantMares.length
        ).toFixed(1)
      : '0.0';
  const avgFoalAgeMonths =
    growingFoals.length > 0
      ? (
          growingFoals.reduce((sum, h) => sum + (h.ageMonths ?? 0), 0) / growingFoals.length
        ).toFixed(1)
      : '0.0';
  const totalFailedInseminations = breedingMares.reduce(
    (sum, h) => sum + (h.failedInseminationCount ?? (h.breedingStatus === 'failed_wait' ? 1 : 0)),
    0
  );
  const avgFailedPerMare =
    breedingMares.length > 0
      ? (totalFailedInseminations / breedingMares.length).toFixed(1)
      : '0.0';
  const dueForBirthCount = pregnantMares.filter((h) => (h.pregnancyMonths ?? 0) >= 11).length;

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
  const birthRisk = calculateFailureRisk(birthWorker?.profession);

  return (
    <div className="space-y-5">
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐎</span>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Cykl Hodowli Koni (Zapłodnienie ⇄ Odpoczynek + Odchów)
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

        {/* Rząd 1: Inseminacja -> Ciąża -> Wyźrebienie -> Odchów źrebaka */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)] items-stretch gap-1.5">
          <LivestockStageCard
            stepNum={1}
            icon="🧬"
            title="Zapłodnienie"
            tooltipDesc="Zapłodnienie klaczy przez Weterynarza (50% skuteczności) lub Hodowcę (30% skuteczności; +10% za każdego kolejnego ogiera)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`Skut. ${getInseminationSuccessPercent(insemWorker?.profession)}%`}
            statusLine={`${insemMares.length} klaczy · nieud.: ${avgFailedPerMare}/kl.`}
            isCurrent={false}
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
            title="Ciąża (11 msc)"
            tooltipDesc="Ciąża klaczy trwa dokładnie 11 miesięcy pod stałą opieką hodowcy."
            requiredProfessionLabel="Hodowca"
            badgeText="11 Msc"
            badgeVariant="sky"
            statusLine={`${pregnantMares.length} klaczy · śr. ${avgPregnancyMonths}/11 msc`}
            isCurrent={false}
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
            tooltipDesc="Odbiór porodu źrebaka przez Weterynarza (1-10%) lub Hodowcę (10-30%). Źrebak idzie do Odchowu, a klacz schodzi na Odpoczynek."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${birthRisk.avg}% Ryz.`}
            statusLine={`${dueForBirthCount} klaczy`}
            isCurrent={false}
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
            title="Odchów źrebaka (3 lata)"
            tooltipDesc="Równoległy wychów i ujeżdżanie źrebaka trwa 36 miesięcy (3 lata) pod opieką hodowcy."
            requiredProfessionLabel="Hodowca"
            badgeText="36 Msc"
            badgeVariant="emerald"
            statusLine={`${growingFoals.length} szt. · śr. ${avgFoalAgeMonths}/36 msc`}
            isCurrent={false}
            assignedWorker={getWorkerForStage('calf_growth_2y') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('calf_growth_2y', id)}
            onHireAndAssign={() => handleHireAndAssign('calf_growth_2y', 'breeder')}
          />
        </div>

        {/* Połączenia bez krzyżowania: Wyźrebienie ↘ Odpoczynek (dół) oraz Odpoczynek → Inseminacja (góra) */}
        <div className="hidden md:block relative h-10 w-full -my-1 pointer-events-none select-none">
          <svg
            viewBox="0 0 1000 44"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <marker
                id="horse-loop-arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>
            {/* Strzałka skośna z prawego dolnego narożnika 3. Wyźrebienia -> lewy górny narożnik 5. Odpoczynku */}
            <path
              d="M 740 0 L 768 42"
              fill="none"
              stroke={birthWorker ? '#10b981' : '#f43f5e'}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              markerEnd="url(#horse-loop-arrow)"
            />
            {/* Strzałka zwrotna bez krzyżowania: lewa strona 5. Odpoczynek (Rząd 2) -> lewo -> góra do 1. Zapłodnienie */}
            <path
              d="M 768 92 L 115 92 L 115 6"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              markerEnd="url(#horse-loop-arrow)"
            />
          </svg>
        </div>

        {/* Rząd 2: 5. Odpoczynek (3 msc) dokładnie pod 4. Odchowem */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)] items-stretch gap-1.5">
          <div className="md:col-start-7">
            <LivestockStageCard
              stepNum={5}
              icon="⏸️"
              title="Odpoczynek (3 msc)"
              tooltipDesc="Regeneracja klaczy po wyźrebieniu (3 msc) lub przerwa po nieudanym zapłodnieniu. Po zakończeniu klacz wraca strzałką do Zapłodnienia."
              requiredProfessionLabel="Hodowca"
              badgeText="1–3 Msc"
              badgeVariant="amber"
              statusLine={`${restMares.length} klaczy`}
              isCurrent={false}
              assignedWorker={getWorkerForStage('rest') || getWorkerForStage('gestation_9m') || null}
              eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
              selectPlaceholder="⚠️ [Wybierz hodowcę]"
              hireButtonLabel="➕ Zatrudnij hodowcę"
              onAssign={(id) => handleAssign('rest', id)}
              onHireAndAssign={() => handleHireAndAssign('rest', 'breeder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
