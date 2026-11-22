import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockChoiceBranch,
  LivestockProfession,
  LivestockStage,
  LivestockWorker,
} from './livestockTypes';
import {
  computeLivestockHorseRequirement,
  LIVESTOCK_PROFESSIONS_CONFIG,
} from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';
import { FarmPipelineArrow } from '../FarmPipelineArrow';
import { LivestockStageCard } from './LivestockStageCard';
import { LivestockSaleBranchCard } from './LivestockSaleBranchCard';

interface PoultryPipelineProps {
  state: LivestockCapitalismState;
  ownedHorsesCount?: number;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const PoultryPipeline: React.FC<PoultryPipelineProps> = ({
  state,
  ownedHorsesCount = 0,
  onUpdateState,
  onGoToCrewTab,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const crew = state.crew || [];
  const assignments = state.stageAssignments || {};
  const poultryStage = state.poultryStage || 'insemination';
  const selectedPoultryBranch = state.selectedPoultryBranch || 'milking';
  const incubationDays = state.poultryIncubationDays ?? 0;
  const chickAgeMonths = state.poultryChickAgeMonths ?? 0;
  const targetMaturityMonths = selectedPoultryBranch === 'milking' ? 12 : 6;
  const recoveryMonths = state.poultryRecoveryMonthsRemaining ?? 0;
  const adultHens = state.herd.adultHensCount ?? 10;
  const growingChicks = state.herd.growingChicksCount ?? 10;

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

  const handleAdvanceStep = () => {
    const horseReq = computeLivestockHorseRequirement(state, ownedHorsesCount);
    if (!horseReq.isSatisfied) {
      notify(
        `⛔ Brak wymaganych koni roboczych w zakładce ⚡ Energia (${horseReq.ownedHorsesCount}/${horseReq.requiredHorses} — 1 koń na 500 kurczaków) do przewozu paszy i wywozu obornika!`
      );
      return;
    }
    const curWorker = getWorkerForStage(poultryStage);
    if (!curWorker) {
      notify('⚠️ Przypisz pracownika do bieżącego etapu cyklu drobiu!');
      onGoToCrewTab();
      return;
    }

    if (poultryStage === 'insemination') {
      if (recoveryMonths > 0) {
        notify(`⏳ Kura w regeneracji (pozostało ${recoveryMonths} msc z 2 msc).`);
        return;
      }
      // Zapłodnienie u drobiu zawsze 100%
      onUpdateState({
        poultryStage: 'gestation_9m',
        poultryProgress: 25,
        poultryIncubationDays: 0,
      });
      notify('🐔 Zapłodnienie zakończone (100% skuteczności)! Rozpoczęto 21-dniowy wylęg.');
      return;
    }

    if (poultryStage === 'gestation_9m') {
      onUpdateState({
        poultryStage: 'birth',
        poultryProgress: 50,
        poultryIncubationDays: 21,
      });
      notify('🥚 Zakończono 21-dniową inkubację jaj! Czas na klucie kurcząt.');
      return;
    }

    if (poultryStage === 'birth') {
      const hatched = Math.max(10, adultHens * 10); // 10 kurczaków z jednej kury
      const nextChicks = growingChicks + hatched;
      onUpdateState({
        poultryStage: 'calf_growth_2y',
        poultryProgress: 75,
        poultryChickAgeMonths: 0,
        poultryRecoveryMonthsRemaining: 2, // 2 miesiące regeneracji
        totalChicksHatched: (state.totalChicksHatched || 0) + hatched,
        herd: {
          ...state.herd,
          growingChicksCount: nextChicks,
          poultryFlockCount: adultHens + nextChicks + (state.herd.poultryForSale || 0),
        },
      });
      notify(`🐣 Wykluło się ${hatched} kurcząt (10 z każdej kury)! Kury rozpoczynają 2 msc regeneracji.`);
      return;
    }

    if (poultryStage === 'calf_growth_2y') {
      const matured = growingChicks;
      if (selectedPoultryBranch === 'slaughter') {
        const slaughterCount = Math.max(1, matured);
        const meatGain = slaughterCount * 2;
        const feathersGain = Number((slaughterCount * 0.3).toFixed(1));
        onUpdateState({
          poultryStage: 'insemination',
          poultryProgress: 0,
          storage: {
            ...state.storage,
            poultryMeatKg: (state.storage.poultryMeatKg || 0) + meatGain,
            feathersKg: Number(((state.storage.feathersKg || 0) + feathersGain).toFixed(1)),
          },
          herd: {
            ...state.herd,
            growingChicksCount: 0,
            poultryFlockCount: adultHens + (state.herd.poultryForSale || 0),
          },
        });
        notify(`🍗 Ubój ${slaughterCount} szt. drobiu: +${meatGain} kg mięsa oraz +${feathersGain} kg pierza!`);
      } else if (selectedPoultryBranch === 'sale') {
        const nextSale = (state.herd.poultryForSale || 0) + matured;
        onUpdateState({
          poultryStage: 'insemination',
          poultryProgress: 0,
          herd: {
            ...state.herd,
            growingChicksCount: 0,
            poultryForSale: nextSale,
            poultryFlockCount: adultHens + nextSale,
          },
        });
        notify(`💰 Przekazano ${matured} szt. drobiu na sprzedaż.`);
      } else {
        const eggsGain = adultHens * 20;
        onUpdateState({
          poultryStage: 'insemination',
          poultryProgress: 0,
          storage: {
            ...state.storage,
            eggsCount: (state.storage.eggsCount || 0) + eggsGain,
          },
          herd: {
            ...state.herd,
            growingChicksCount: 0,
            adultHensCount: adultHens + matured,
            poultryFlockCount: adultHens + matured + (state.herd.poultryForSale || 0),
          },
        });
        notify(`🥚 Stado jajeczne powiększone (+${matured} kur) i zebrano +${eggsGain} jaj!`);
      }
    }
  };

  const insemWorker = getWorkerForStage('insemination');
  const gestWorker = getWorkerForStage('gestation_9m');
  const birthWorker = getWorkerForStage('birth');

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK CYKLU DROBIU */}
      <div className="bg-stone-950/95 border border-stone-800 rounded-3xl p-4 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐔</span>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Rurociąg Produkcji Drobiu (4 Etapy)
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
              <span>▶️</span> Rozwiń Cykl Drobiu
            </button>
          </div>
        </div>

        {feedback && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium">
            {feedback}
          </div>
        )}

        {/* 4 ETAPY CYKLU DROBIU */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-stretch gap-2">
          <LivestockStageCard
            stepNum={1}
            icon="🐔"
            title="Zapłodnienie (100%)"
            tooltipDesc="Dobór lęgowy drobiu — zapłodnienie zawsze wynosi 100%. Po wylęgu obowiązuje 2 msc regeneracji."
            requiredProfessionLabel="Hodowca / Weterynarz"
            badgeText="Skut. 100%"
            statusLine={recoveryMonths > 0 ? `Regeneracja: ${recoveryMonths}/2 msc` : 'Gotowe do wylęgu'}
            isCurrent={poultryStage === 'insemination'}
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
            icon="🥚"
            title="Wylęg (21 dni)"
            tooltipDesc="Rzeczywista długość inkubacji jaja kurzego wynosi 21 dni (szybsza niż u owcy)."
            requiredProfessionLabel="Hodowca"
            badgeText="21 Dni"
            badgeVariant="sky"
            statusLine={`Inkubacja: ${incubationDays}/21 dni`}
            isCurrent={poultryStage === 'gestation_9m'}
            assignedWorker={gestWorker || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('gestation_9m', id)}
            onHireAndAssign={() => handleHireAndAssign('gestation_9m', 'breeder')}
          />

          <div className="hidden md:flex items-center">
            <FarmPipelineArrow direction="right" status={gestWorker ? 'ready' : 'blocked'} />
          </div>

          <LivestockStageCard
            stepNum={3}
            icon="🐣"
            title="Klucie (10/kura)"
            tooltipDesc="Z każdej kury lęgowej wykluwa się 10 kurcząt, po czym kura przechodzi 2 miesiące regeneracji."
            requiredProfessionLabel="Hodowca / Weterynarz"
            badgeText="10 szt./kura"
            badgeVariant="emerald"
            statusLine={`Wynik: +${adultHens * 10} kurcząt`}
            isCurrent={poultryStage === 'birth'}
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
            icon="🐤"
            title={
              selectedPoultryBranch === 'milking'
                ? 'Odchów (1 rok)'
                : 'Odchów (0.5 roku)'
            }
            tooltipDesc="Dojrzewanie kurczaka trwa 1 rok (12 msc), aby został kurą nioską, lub 0.5 roku (6 msc) do sprzedaży / uboju."
            requiredProfessionLabel="Hodowca"
            badgeText={selectedPoultryBranch === 'milking' ? '12 Msc' : '6 Msc'}
            badgeVariant="emerald"
            statusLine={`Wiek: ${chickAgeMonths}/${targetMaturityMonths} msc • ${growingChicks} szt.`}
            isCurrent={poultryStage === 'calf_growth_2y'}
            assignedWorker={getWorkerForStage('calf_growth_2y') || null}
            eligibleWorkers={crew.filter((w) => w.profession === 'breeder')}
            selectPlaceholder="⚠️ [Wybierz hodowcę]"
            hireButtonLabel="➕ Zatrudnij hodowcę"
            onAssign={(id) => handleAssign('calf_growth_2y', id)}
            onHireAndAssign={() => handleHireAndAssign('calf_growth_2y', 'breeder')}
          />
        </div>
      </div>

      {/* ŚCIEŻKI GOSPODARCZE DLA DROBIU */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔀</span> Przeznaczenie drobiu (Jajeczna / Ubój na mięso i pierze)
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Wybrano: <strong className="text-amber-300">{selectedPoultryBranch}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <LivestockSaleBranchCard
            title="1. Sprzedaż żywca"
            isSelected={selectedPoultryBranch === 'sale'}
            salePrice={state.poultrySalePrice ?? 3}
            crew={crew}
            onSelect={() => onUpdateState({ selectedPoultryBranch: 'sale' as LivestockChoiceBranch })}
            onChangePrice={(val) => onUpdateState({ poultrySalePrice: val })}
            onHireTrader={(w) => onUpdateState({ crew: [...crew, w] })}
          />

          <button
            onClick={() => onUpdateState({ selectedPoultryBranch: 'slaughter' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedPoultryBranch === 'slaughter'
                ? 'bg-rose-500/20 border-rose-400 text-rose-100 ring-1 ring-rose-400/30'
                : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🍗</span>
              <span className="font-bold text-xs text-rose-200">2. Ubój (Mięso i Pierze)</span>
            </div>
            <span className="text-[10px] font-mono text-rose-300 font-bold">Mięso + Pierze</span>
          </button>

          <button
            onClick={() => onUpdateState({ selectedPoultryBranch: 'milking' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedPoultryBranch === 'milking'
                ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/30'
                : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🥚</span>
              <span className="font-bold text-xs text-amber-200">3. Kura Jajeczna & Rozród</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Jaja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
