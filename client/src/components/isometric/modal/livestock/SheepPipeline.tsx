import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockStage,
  LivestockChoiceBranch,
  LivestockWorker,
} from './livestockTypes';
import { calculateFailureRisk } from './livestockTypes';

interface SheepPipelineProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
  onGoToCrewTab: () => void;
}

export const SheepPipeline: React.FC<SheepPipelineProps> = ({
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
    onUpdateState({ selectedSheepBranch: branch });
    notify(`Wybrano ścieżkę dla owiec: ${branch === 'sale' ? 'Sprzedaż żywca' : branch === 'slaughter' ? 'Ubój na baraninę i skórę' : 'Stado Wełniste (Strzyżenie 2x/rok)'}`);
  };

  // Obsługa postępu cyklu hodowlanego owiec
  const handleAdvanceStep = () => {
    const cur = state.sheepStage || 'insemination';

    if (cur === 'insemination') {
      const worker = getWorkerForStage('insemination');
      const risk = calculateFailureRisk(worker?.profession);
      const isFailure = Math.random() * 100 < risk.avg;

      if (isFailure) {
        onUpdateState({
          totalProceduresFailed: (state.totalProceduresFailed || 0) + 1,
          sheepProgress: 10,
        });
        notify(`⚠️ Stanówka/Inseminacja owcy nie powiodła się (${risk.label}). Konieczne powtórzenie!`);
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
        const saleRev = 18; // £18 za dorosłą owcę
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
        notify(`💰 Handlarz sprzedał owcę na rynku miejskim za £${saleRev}! Cykl owcy rozpoczyna się od nowa.`);
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
  const insemRisk = calculateFailureRisk(insemWorker?.profession);
  const birthRisk = calculateFailureRisk(birthWorker?.profession);

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK CYKLU OWIEC */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-800/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🐑</span> Cykl Rozrodu i Produkcji Owiec (Wełna i Baranina 1880 r.)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Ciąża trwa <strong>5 miesięcy</strong>, wzrost jagnięcia <strong>15 miesięcy</strong>, a zamiast mleka wełna jest pozyskiwana <strong>2 razy w roku</strong>.
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
              <span>▶️</span> Rozwiń Cykl Owiec
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2.5 rounded-xl font-medium animate-fadeIn">
            {feedback}
          </div>
        )}
      </div>

      {/* 4 ETAPY CYKLU OWIEC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KROK 1: STANÓWKA / INSEMINACJA */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.sheepStage === 'insemination' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                {insemRisk.avg}% Ryzyka
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Stanówka / Inseminacja</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Krycie owcy przez Weterynarza (1-10% porażki) lub Hodowcę (10-30% porażki).
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
                  {w.avatar} {w.name} ({w.profession === 'vet' ? 'Weterynarz' : 'Hodowca'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KROK 2: CIĄŻA OWCY (5 MIESIĘCY) */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.sheepStage === 'gestation_9m' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300">
                5 Miesięcy
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Kotność (Ciąża Owcy)</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Ciąża owcy trwa dokładnie <strong>5 miesięcy</strong> pod opieką hodowcy.
            </p>
            <div className="bg-stone-950/80 p-2 rounded-xl text-[10px] font-mono text-stone-300 mb-2">
              Stan: {state.sheepPregnancyMonths || 0}/5 miesięcy ciąży
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

        {/* KROK 3: WYKOT (PORÓD JAGNIĘCIA) */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.sheepStage === 'birth' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 3</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                {birthRisk.avg}% Ryzyka
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Wykot (Narodziny)</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Odbiór porodu przez Weterynarza (1-10%) lub Hodowcę (10-30%).
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <label className="text-[10px] text-stone-400 block font-mono">Kto odbiera wykot:</label>
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

        {/* KROK 4: WZROST JAGNIĘCIA (15 MIESIĘCY + WEŁNA 2X W ROKU) */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${state.sheepStage === 'calf_growth_2y' ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/40' : 'bg-stone-900/70 border-stone-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">Krok 4</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                15 Miesięcy
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-100">Wzrost Jagnięcia</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
              Wzrost trwa <strong>15 miesięcy</strong>. W tym czasie wełna strzyżona jest <strong>2x w roku</strong>.
            </p>
            <div className="bg-stone-950/80 p-2 rounded-xl text-[10px] font-mono text-stone-300 mb-2">
              Wiek: {state.lambAgeMonths || 0}/15 miesięcy (strzyżenie: 2x w roku)
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

      {/* 3 ŚCIEŻKI GOSPODARCZE DLA DORSŁYCH OWIEC (PO 15 MSC) */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>🔀</span> Rozgałęzienie po 15 Miesiącach Wzrostu Owcy (3 Ścieżki)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Wybierz przeznaczenie dorosłej owcy: sprzedaż żywca, ubój na baraninę czy dołączenie do stada wełnistego.
            </p>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Aktywny wybór: <strong className="text-amber-300">{state.selectedSheepBranch || 'milking'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* ŚCIEŻKA 1: SPRZEDAŻ ŻYWCA */}
          <button
            onClick={() => handleSelectBranch('sale')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedSheepBranch === 'sale' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💰</span>
                <span className="font-bold text-xs text-amber-200">1. Sprzedaż Żywca</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Handlarz sprzedaje dorosłą owcę handlarzom na targu miejskim (£18 za sztukę).
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold mt-2">Przychód gotówkowy: £18 / szt.</span>
          </button>

          {/* ŚCIEŻKA 2: UBÓJ (BARANINA + SKÓRA) */}
          <button
            onClick={() => handleSelectBranch('slaughter')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedSheepBranch === 'slaughter' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🍖</span>
                <span className="font-bold text-xs text-amber-200">2. Ubój (Rzeźnia)</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Ubój na mięso: pozyskanie 45 kg baraniny oraz 1 skóry owczej (ubój nie daje obornika).
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold mt-2">Surowce: Baranina + Skóra owcza</span>
          </button>

          {/* ŚCIEŻKA 3: STADO WEŁNISTE */}
          <button
            onClick={() => handleSelectBranch('milking')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${state.selectedSheepBranch === 'milking' ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/30' : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 text-stone-300'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🧶</span>
                <span className="font-bold text-xs text-amber-200">3. Stado Wełniste (2x Strzyżenie/Rok)</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Włączenie owcy do stada wełnistego: strzyżenie runa 2 razy w roku i ponowna stanówka.
              </p>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold mt-2">Cykliczne pozyskiwanie wełny</span>
          </button>
        </div>
      </div>
    </div>
  );
};
