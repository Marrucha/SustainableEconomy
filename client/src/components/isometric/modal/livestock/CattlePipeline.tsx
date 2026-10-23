import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockChoiceBranch,
  LivestockWorker,
} from './livestockTypes';
import { calculateFailureRisk } from './livestockTypes';

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

  const handleSelectBranch = (branch: LivestockChoiceBranch) => {
    onUpdateState({ selectedBranch: branch });
    notify(`Wybrano ścieżkę: ${branch === 'sale' ? 'Sprzedaż żywca' : branch === 'slaughter' ? 'Ubój na mięso i skóry' : 'Stado Mleczne & Nawóz'}`);
  };

  const handleAdvanceStep = () => {
    const cur = state.currentStage;

    if (cur === 'insemination') {
      if ((state.herd.milkingGroupCows || 0) <= 0) {
        notify('⛔ Rozmnażanie stada jest niemożliwe! Rozród możliwy jest wyłącznie na populacji mlecznej (brak krów matek).');
        return;
      }

      const worker = getWorkerForStage('insemination');
      const risk = calculateFailureRisk(worker?.profession);
      const isFailure = Math.random() * 100 < risk.avg;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          stageProgress: 10,
        });
        notify(`⚠️ Inseminacja nie powiodła się (${risk.label}). Konieczne powtórzenie zabiegu!`);
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
        const saleRev = 45;
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
        notify(`💰 Handlarz sprzedał dorosłe bydło na rynku miejskim za £${saleRev}! Cykl rozpoczyna się od nowa.`);
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
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-800/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🐄</span> Cykl Rozrodu i Produkcji Bydła (Krowy 1880 r.)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Ciąża trwa <strong>9 miesięcy</strong> (dojenie przez pierwsze 6 msc), wzrost cielaka <strong>2 lata</strong>, nawóz tylko z dojenia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onGoToCrewTab}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 leading-[2.5]"
            >
              <span>👥</span> Kadra Fermy
            </button>
            <button
              onClick={handleAdvanceStep}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 leading-[2.5]"
            >
              <span>▶️</span> Rozwiń Cykl Bydła
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2.5 rounded-xl font-medium animate-fadeIn">
            {feedback}
          </div>
        )}
      </div>

      {/* 4 ETAPY BAZOWE BYDŁA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KROK 1: INSEMINACJA */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.currentStage === 'insemination' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                {insemRisk.avg}% Ryzyka
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Inseminacja / Krycie</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Rozmnażanie stada jest możliwe wyłącznie na populacji mlecznej (<strong>{state.herd.milkingGroupCows} krów matek</strong>, max 50% pogłowia). Weterynarz (1-10%) lub Hodowca (10-30%).
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <label className="text-[10px] text-stone-400 block font-mono">Kto wykonuje:</label>
            <select
              value={assignments.insemination || ''}
              onChange={(e) => handleAssign('insemination', e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-xs text-stone-200 p-1.5 rounded-lg cursor-pointer leading-[2.5]"
            >
              <option value="">Wybierz kadrę...</option>
              {crew.filter((w) => w.profession === 'vet' || w.profession === 'breeder').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.avatar} {w.name} ({w.profession === 'vet' ? 'Weterynarz 1-10%' : 'Hodowca 10-30%'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KROK 2: WZROST PŁODU 9 MIESIĘCY */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.currentStage === 'gestation_9m' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300">
                9 Miesięcy
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Wzrost Płodu (Ciąża)</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Hodowca dba o dietę. <strong>Mleko pozyskiwane przez pierwsze 6 msc!</strong>
            </p>
            <div className="bg-stone-950/80 p-2 rounded-xl text-[10px] font-mono text-stone-300 mb-2">
              Stan: {state.pregnancyMonthsPassed}/9 msc ciąży (laktacja: {state.lactationMonthsPassed}/6 msc)
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <label className="text-[10px] text-stone-400 block font-mono">Opiekun (Hodowca):</label>
            <select
              value={assignments.gestation_9m || ''}
              onChange={(e) => handleAssign('gestation_9m', e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-xs text-stone-200 p-1.5 rounded-lg cursor-pointer leading-[2.5]"
            >
              <option value="">Wybierz hodowcę...</option>
              {crew.filter((w) => w.profession === 'breeder').map((w) => (
                <option key={w.id} value={w.id}>{w.avatar} {w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KROK 3: PORÓD */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.currentStage === 'birth' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 3</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                {birthRisk.avg}% Ryzyka
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Poród / Ocielenie</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Odbiór przez Weterynarza (1-10% porażki) lub Hodowcę (10-30% porażki).
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <label className="text-[10px] text-stone-400 block font-mono">Kto odbiera poród:</label>
            <select
              value={assignments.birth || ''}
              onChange={(e) => handleAssign('birth', e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-xs text-stone-200 p-1.5 rounded-lg cursor-pointer leading-[2.5]"
            >
              <option value="">Wybierz kadrę...</option>
              {crew.filter((w) => w.profession === 'vet' || w.profession === 'breeder').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.avatar} {w.name} ({w.profession === 'vet' ? 'Weterynarz' : 'Hodowca'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KROK 4: WZROST CIELAKA 2 LATA */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.currentStage === 'calf_growth_2y' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 4</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                2 Lata
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Wzrost Cielaka (Opas)</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Hodowca prowadzi cielę przez 2 lata aż do pełnej dojrzałości.
            </p>
            <div className="bg-stone-950/80 p-2 rounded-xl text-[10px] font-mono text-stone-300 mb-2">
              Wiek: {state.calfAgeMonths}/24 miesięcy ({(state.calfAgeMonths / 12).toFixed(1)} roku)
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <label className="text-[10px] text-stone-400 block font-mono">Prowadzący hodowca:</label>
            <select
              value={assignments.calf_growth_2y || ''}
              onChange={(e) => handleAssign('calf_growth_2y', e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-xs text-stone-200 p-1.5 rounded-lg cursor-pointer leading-[2.5]"
            >
              <option value="">Wybierz hodowcę...</option>
              {crew.filter((w) => w.profession === 'breeder').map((w) => (
                <option key={w.id} value={w.id}>{w.avatar} {w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ROZGAŁĘZIENIE NA 3 ŚCIEŻKI */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>🔀</span> Rozgałęzienie po 2 Latach Wzrostu Cielaka (3 Ścieżki)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Wybierz przeznaczenie dorosłego bydła: sprzedaż żywca, ubój czy stado mleczne.
            </p>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Aktywny wybór: <strong className="text-amber-300">{state.selectedBranch}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleSelectBranch('sale')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedBranch === 'sale' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💰</span>
                <span className="font-bold text-xs text-amber-200">1. Sprzedaż Żywca</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Kupiec/Handlarz sprzedaje dorosłe bydło na targu miejskim (£45 za sztukę).
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold mt-2">Przychód gotówkowy: £45 / szt.</span>
          </button>

          <button
            onClick={() => handleSelectBranch('slaughter')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedBranch === 'slaughter' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🥩</span>
                <span className="font-bold text-xs text-amber-200">2. Ubój (Rzeźnia)</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Hodowca dokonuje uboju: pozyskuje 180 kg wołowiny oraz 2 skóry bydlęce (ubój nie generuje obornika).
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold mt-2">Surowce: Mięso + Skóra</span>
          </button>

          <button
            onClick={() => handleSelectBranch('milking')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedBranch === 'milking' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🥛</span>
                <span className="font-bold text-xs text-amber-200">3. Stado Mleczne & Nawóz</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Dojenie (Obsługa), produkcja nawozu w oborze (Obsługa) oraz ponowna inseminacja (Weterynarz/Hodowca).
              </p>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold mt-2">Ciągła produkcja mleka & nawozu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
