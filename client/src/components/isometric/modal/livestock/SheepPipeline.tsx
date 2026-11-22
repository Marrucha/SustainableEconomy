import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockChoiceBranch,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import {
  calculateFailureRisk,
  computeLivestockHorseRequirement,
  getInseminationSuccessPercent,
  LIVESTOCK_PROFESSIONS_CONFIG,
} from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { LivestockStageCard } from './LivestockStageCard';
import { LivestockSaleBranchCard } from './LivestockSaleBranchCard';

interface SheepPipelineProps {
  state: LivestockCapitalismState;
  ownedHorsesCount?: number;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const SheepPipeline: React.FC<SheepPipelineProps> = ({
  state,
  ownedHorsesCount = 0,
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
    onUpdateState({ selectedSheepBranch: branch });
    notify(`Wybrano ścieżkę dla owiec: ${branch === 'sale' ? 'Sprzedaż żywca' : branch === 'slaughter' ? 'Ubój na baraninę i skórę' : 'Stado Wełniste (Strzyżenie 2x/rok)'}`);
  };

  // Obsługa postępu cyklu hodowlanego owiec
  const handleAdvanceStep = () => {
    const horseReq = computeLivestockHorseRequirement(state, ownedHorsesCount);
    if (!horseReq.isSatisfied) {
      notify(
        `⛔ Brak wymaganych koni roboczych w zakładce ⚡ Energia (${horseReq.ownedHorsesCount}/${horseReq.requiredHorses} — 1 koń na 50 owiec) do przewozu paszy i wywozu obornika!`
      );
      return;
    }
    const cur = state.sheepStage || 'insemination';

    if (cur === 'insemination') {
      const recoveryRem = state.sheepRecoveryMonthsRemaining ?? 0;
      if (recoveryRem > 0) {
        notify(`⏳ Owca odpoczywa po wykocie (pozostało ${recoveryRem} msc z 2 msc regeneracji).`);
        return;
      }
      const worker = getWorkerForStage('insemination');
      const successPercent = getInseminationSuccessPercent(worker?.profession);
      const isFailure = Math.random() * 100 >= successPercent;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          sheepProgress: 10,
        });
        notify(`⚠️ Stanówka/Inseminacja owcy nie powiodła się (skuteczność: ${successPercent}%). Konieczne powtórzenie!`);
        return;
      }

      onUpdateState({
        sheepStage: 'gestation_9m', // etap ciąży
        sheepPregnancyMonths: 1,
        sheepProgress: 25,
      });
      notify('✓ Sukces! Owca jest kotna. Rozpoczyna się 5 miesięcy ciąży owcy!');
      return;
    }

    if (cur === 'gestation_9m') {
      const nextMonths = (state.sheepPregnancyMonths || 0) + 2;
      if (nextMonths < 5) {
        onUpdateState({
          sheepPregnancyMonths: nextMonths,
          sheepProgress: 25 + Math.round((nextMonths / 5) * 20),
        });
        notify(`Upłynęło kolejne 2 miesiące ciąży owcy (${nextMonths}/5 msc). Stado wypasane na łąkach.`);
        return;
      }

      onUpdateState({
        sheepStage: 'birth',
        sheepPregnancyMonths: 5,
        sheepProgress: 50,
      });
      notify('Owca donosiła ciążę (5 miesięcy)! Nadszedł czas na wykot (narodziny jagnięcia).');
      return;
    }

    if (cur === 'birth') {
      const worker = getWorkerForStage('birth');
      const risk = calculateFailureRisk(worker?.profession);
      const isFailure = Math.random() * 100 < risk.avg;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          sheepStage: 'insemination',
          sheepPregnancyMonths: 0,
          sheepProgress: 0,
        });
        notify(`⚠️ Powikłania przy wykocie (${risk.label}). Jagnię nie przeżyło. Owca wraca do stada.`);
        return;
      }

      onUpdateState({
        sheepStage: 'calf_growth_2y', // etap wzrostu jagnięcia
        lambAgeMonths: 1,
        sheepRecoveryMonthsRemaining: 2,
        totalLambsBorn: (state.totalLambsBorn || 0) + 1,
        herd: {
          ...state.herd,
          growingLambsCount: (state.herd.growingLambsCount || 0) + 1,
          sheepFlockCount: (state.herd.sheepFlockCount || 0) + 1,
        },
        sheepProgress: 60,
      });
      notify('🎉 Szczęśliwy wykot! Na świat przyszło zdrowe jagnię (okres wzrostu: 15 miesięcy).');
      return;
    }

    if (cur === 'calf_growth_2y') {
      const nextAge = (state.lambAgeMonths || 0) + 5;
      const shearingCycles = Math.floor(nextAge / 6); // Wełna strzyżona 2 razy w roku (co 6 msc)
      const woolAdded = shearingCycles > Math.floor((state.lambAgeMonths || 0) / 6) ? 75 : 0;

      if (nextAge < 15) {
        onUpdateState({
          lambAgeMonths: nextAge,
          sheepProgress: 60 + Math.round((nextAge / 15) * 25),
          storage: {
            ...state.storage,
            woolKg: state.storage.woolKg + woolAdded,
          },
        });
        notify(`Jagnię rośnie: wiek ${nextAge}/15 miesięcy. ${woolAdded > 0 ? `✂️ Strzyżenie sezonowe (2x w roku): pozyskano +${woolAdded} kg wełny!` : ''}`);
        return;
      }

      onUpdateState({
        sheepStage: 'branch_decision',
        lambAgeMonths: 15,
        sheepProgress: 85,
        storage: {
          ...state.storage,
          woolKg: state.storage.woolKg + woolAdded,
        },
      });
      notify('Owca osiągnęła pełną dojrzałość (15 miesięcy)! Wybierz jedną z 3 ścieżek gospodarczych.');
      return;
    }

    if (cur === 'branch_decision') {
      const branch = state.selectedSheepBranch || 'milking';

      if (branch === 'sale') {
        const salesWorker = crew.find((w) => w.profession === 'trader' || w.profession === 'breeder');
        if (!salesWorker) {
          notify('⚠️ Brak handlarza lub hodowcy do ustalenia ceny i sprzedaży owcy!');
          return;
        }
        const saleRev = state.sheepSalePrice ?? 18;
        onUpdateState({
          sheepStage: 'insemination',
          sheepPregnancyMonths: 0,
          lambAgeMonths: 0,
          sheepProgress: 0,
          herd: {
            ...state.herd,
            growingLambsCount: Math.max(0, (state.herd.growingLambsCount || 0) - 1),
          },
          lastCycleRevenue: (state.lastCycleRevenue || 0) + saleRev,
        });
        notify(`💰 ${salesWorker.name} sprzedał owcę na rynku miejskim za £${saleRev}! Cykl owcy rozpoczyna się od nowa.`);
        return;
      }

      if (branch === 'slaughter') {
        onUpdateState({
          sheepStage: 'insemination',
          sheepPregnancyMonths: 0,
          lambAgeMonths: 0,
          sheepProgress: 0,
          herd: {
            ...state.herd,
            growingLambsCount: Math.max(0, (state.herd.growingLambsCount || 0) - 1),
          },
          storage: {
            ...state.storage,
            muttonKg: state.storage.muttonKg + 45,
            leatherPcs: state.storage.leatherPcs + 1,
          },
        });
        notify('🍖 Hodowca dokonał uboju: pozyskano +45 kg baraniny oraz +1 skórę owczą (ubój nie generuje obornika).');
        return;
      }

      // branch === 'milking' (Stado Wełniste)
      onUpdateState({
        sheepStage: 'insemination',
        sheepPregnancyMonths: 0,
        lambAgeMonths: 0,
        sheepProgress: 0,
        herd: {
          ...state.herd,
          growingLambsCount: Math.max(0, (state.herd.growingLambsCount || 0) - 1),
          adultSheepCount: (state.herd.adultSheepCount || 0) + 1,
        },
        storage: {
          ...state.storage,
          woolKg: state.storage.woolKg + 90,
        },
      });
      notify('🧶 Owca dołączyła do dorosłego Stada Wełnistego! Pozyskano +90 kg wełny ze strzyżenia. Rozpoczyna się kolejny cykl.');
    }
  };

  const insemWorker = getWorkerForStage('insemination');
  const birthWorker = getWorkerForStage('birth');
  const birthRisk = calculateFailureRisk(birthWorker?.profession);

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK CYKLU OWIEC */}
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐑</span>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Rurociąg Produkcji Owiec (4 Etapy)
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
              <span>▶️</span> Rozwiń Cykl Owiec
            </button>
          </div>
        </div>

        {feedback && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium">
            {feedback}
          </div>
        )}

        {/* 4 ETAPY CYKLU OWIEC */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-stretch gap-2">
          <LivestockStageCard
            stepNum={1}
            icon="🧬"
            title="Stanówka"
            tooltipDesc="Krycie owcy przez Weterynarza (50% skuteczności) lub Hodowcę (30% skuteczności)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`Skut. ${getInseminationSuccessPercent(insemWorker?.profession)}%`}
            isCurrent={state.sheepStage === 'insemination'}
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
            icon="🐑"
            title="Kotność (5 msc)"
            tooltipDesc="Ciąża owcy trwa dokładnie 5 miesięcy pod opieką hodowcy."
            requiredProfessionLabel="Hodowca"
            badgeText="5 Msc"
            badgeVariant="sky"
            statusLine={`Ciąża: ${state.sheepPregnancyMonths || 0}/5 msc`}
            isCurrent={state.sheepStage === 'gestation_9m'}
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
            title="Wykot"
            tooltipDesc="Odbiór porodu jagnięcia przez Weterynarza (1-10%) lub Hodowcę (10-30%)."
            requiredProfessionLabel="Weterynarz / Hodowca"
            badgeText={`${birthRisk.avg}% Ryz.`}
            isCurrent={state.sheepStage === 'birth'}
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
            icon="🧶"
            title="Wzrost (15 msc)"
            tooltipDesc="Wzrost jagnięcia trwa 15 miesięcy. Wełna strzyżona jest 2 razy w roku."
            requiredProfessionLabel="Hodowca"
            badgeText="15 Msc"
            badgeVariant="emerald"
            statusLine={`Wiek: ${state.lambAgeMonths || 0}/15 msc • Strzyżenie: 2x/rok`}
            isCurrent={state.sheepStage === 'calf_growth_2y'}
            assignedWorker={getWorkerForStage('calf_growth_2y') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('calf_growth_2y', id)}
            onHireAndAssign={() => handleHireAndAssign('calf_growth_2y', 'breeder')}
          />
        </div>
      </div>

      {/* 3 ŚCIEŻKI GOSPODARCZE DLA DOROSŁYCH OWIEC (PO 15 MSC) */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔀</span> Przeznaczenie dorosłej owcy (po 15 msc)
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Wybrano: <strong className="text-amber-300">{state.selectedSheepBranch || 'milking'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <LivestockSaleBranchCard
            title="1. Sprzedaż żywca"
            isSelected={(state.selectedSheepBranch || 'milking') === 'sale' || state.selectedSheepBranch === 'slaughter'}
            salePrice={state.sheepSalePrice ?? 18}
            crew={crew}
            onSelect={() => handleSelectBranch('sale')}
            onChangePrice={(val) => onUpdateState({ sheepSalePrice: val })}
            onHireTrader={(w) => onUpdateState({ crew: [...crew, w] })}
          />

          <button
            onClick={() => handleSelectBranch('milking')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${state.selectedSheepBranch === 'milking' ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🧶</span>
              <span className="font-bold text-xs text-amber-200">2. Stado Wełniste & Rozród</span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold">Wełna 2x/rok</span>
          </button>
        </div>
      </div>
    </div>
  );
};
