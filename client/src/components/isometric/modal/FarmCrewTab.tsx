import React, { useState } from 'react';
import type { FarmCapitalismState, FarmCrewMember, FarmCycleStage, WorkerProfession } from './farmGridTypes';
import { PROFESSION_LABELS, getStageAssignedWorkerIds, getWorkerStageRoleTitle } from './farmGridTypes';
import { generateRandomEnglishName } from './englishNames';

interface FarmCrewTabProps {
  state: FarmCapitalismState;
  onUpdateState: (updates: Partial<FarmCapitalismState>) => void;
}

const InfoHoverIcon: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <span className="relative group inline-flex items-center">
    <span className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-sky-300 text-[10px] font-bold inline-flex items-center justify-center cursor-help border border-stone-700">
      ℹ
    </span>
    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-2.5 rounded-xl bg-stone-950 border border-amber-500/60 shadow-2xl text-[11px] text-stone-200 z-50 leading-snug font-normal">
      <strong className="block text-amber-300 mb-0.5">{title}</strong>
      <span className="text-stone-300">{body}</span>
    </span>
  </span>
);

export const FarmCrewTab: React.FC<FarmCrewTabProps> = ({ state, onUpdateState }) => {
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newProfession, setNewProfession] = useState<WorkerProfession>('farmer');
  const [newWage, setNewWage] = useState(2.2);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const crew = state.crew || [];
  const agronomist = state.agronomist;

  const totalCrewWages = crew.reduce((sum, w) => sum + w.wageDaily, 0);
  const agronomistWage = agronomist.hired ? agronomist.wageDaily : 0;
  const totalDailyPayroll = totalCrewWages + agronomistWage;

  const handleToggleAgronomist = () => {
    onUpdateState({
      agronomist: { ...agronomist, hired: !agronomist.hired },
    });
  };

  const handleChangeAgronomistSpec = (spec: 'norfolk' | 'soil_chemistry' | 'botany') => {
    onUpdateState({
      agronomist: { ...agronomist, specialization: spec },
    });
  };

  const handleRemoveWorker = (id: string) => {
    const updatedCrew = crew.filter((w) => w.id !== id);
    const updatedAssignments = { ...state.stageAssignments };
    for (const stage in updatedAssignments) {
      const key = stage as keyof typeof updatedAssignments;
      const val = updatedAssignments[key];
      if (Array.isArray(val)) {
        const filtered = val.filter((wId) => wId !== id);
        if (filtered.length === 0) delete updatedAssignments[key];
        else updatedAssignments[key] = filtered;
      } else if (val === id) {
        delete updatedAssignments[key];
      }
    }
    onUpdateState({ crew: updatedCrew, stageAssignments: updatedAssignments });
  };

  const handleAddWorker = () => {
    if (!newWorkerName.trim()) return;
    const isFarmerRole = newProfession === 'farmer' || newProfession === 'all_rounder';
    const newWorker: FarmCrewMember = {
      id: `crew_${Date.now()}`,
      name: newWorkerName.trim(),
      profession: newProfession,
      wageDaily: Number(newWage.toFixed(1)),
      avatar: newProfession === 'merchant' ? '🎩' : '👨‍🌾',
      ...(isFarmerRole ? { skillBonusPercent: [2, 5, 8, 10][Math.floor(Math.random() * 4)] } : {}),
    };
    onUpdateState({ crew: [...crew, newWorker] });
    setNewWorkerName('');
    setIsAddingNew(false);
  };

  const appendWorkerToStages = (workerId: string, stages: FarmCycleStage[]) => {
    const next = { ...state.stageAssignments };
    for (const st of stages) {
      const cur = getStageAssignedWorkerIds(next, st);
      if (!cur.includes(workerId)) next[st] = [...cur, workerId];
    }
    onUpdateState({ stageAssignments: next });
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2.5">
        {/* NAGŁÓWEK */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              👥 Kadra Gospodarstwa
            </h4>
            <InfoHoverIcon
              title="Kadra i Agronom"
              body="Agronom Królewski (Klasa M) daje premie agrotechniczne, a rolnicy i kupcy realizują kolejne etapy cyklu."
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setNewWorkerName(generateRandomEnglishName(crew.map((w) => w.name)));
              setIsAddingNew((v) => !v);
            }}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold cursor-pointer"
          >
            ➕ Zatrudnij
          </button>
        </div>

        {/* FORMULARZ ZATRUDNIENIA */}
        {isAddingNew && (
          <div className="bg-stone-900 border border-amber-500/60 rounded-xl p-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-200">
              <span>Nowy pracownik</span>
              <button type="button" onClick={() => setIsAddingNew(false)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="Imię i nazwisko"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setNewWorkerName(generateRandomEnglishName(crew.map((w) => w.name)))}
                  className="px-2 rounded-lg bg-stone-800 border border-stone-700 cursor-pointer"
                  title="Losuj imię"
                >
                  🎲
                </button>
              </div>
              <select
                value={newProfession}
                onChange={(e) => {
                  const prof = e.target.value as WorkerProfession;
                  setNewProfession(prof);
                  setNewWage(prof === 'merchant' ? 2.5 : prof === 'all_rounder' ? 3.2 : 2.2);
                }}
                className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-100"
              >
                {Object.entries(PROFESSION_LABELS).map(([id, cfg]) => (
                  <option key={id} value={id}>{cfg.icon} {cfg.label}</option>
                ))}
              </select>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="range"
                  min="1.2"
                  max="4.0"
                  step="0.1"
                  value={newWage}
                  onChange={(e) => setNewWage(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-300 shrink-0">£{newWage.toFixed(1)}/d</span>
                <button
                  type="button"
                  onClick={handleAddWorker}
                  disabled={!newWorkerName.trim()}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold cursor-pointer disabled:opacity-40"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WIERSZ 1: AGRONOM (ZWARTY) */}
        <div className="bg-sky-950/30 border border-sky-600/40 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">🎩</span>
            <span className="font-bold text-sky-100">{agronomist.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
              Agronom
            </span>
            <InfoHoverIcon
              title={agronomist.title || 'Główny Agronom'}
              body="Nadzór nad wzrostem zbóż (Klasa M). Wybierz doktrynę agrotechniczną obok."
            />
          </div>

          {agronomist.hired && (
            <div className="flex items-center gap-1">
              {[
                { id: 'norfolk', label: 'Norfolk (+20%)' },
                { id: 'soil_chemistry', label: 'Chemia (+30%)' },
                { id: 'botany', label: 'Ochrona (-50%)' },
              ].map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleChangeAgronomistSpec(spec.id as any)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                    agronomist.specialization === spec.id
                      ? 'bg-sky-500/25 border-sky-400 text-sky-100'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-mono font-bold text-sky-300">£{agronomist.wageDaily.toFixed(1)}/d</span>
            <button
              type="button"
              onClick={handleToggleAgronomist}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer border ${
                agronomist.hired
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
              }`}
            >
              {agronomist.hired ? '✓ Zatrudniony' : '+ Zatrudnij'}
            </button>
          </div>
        </div>

        {/* WIERSZE PRACOWNIKÓW (ZWARTE, OPISY POD IKONKĄ ℹ) */}
        <div className="space-y-1.5">
          {[...crew].reverse().map((worker) => {
            const profession = worker.profession || 'farmer';
            const profLabel = PROFESSION_LABELS[profession] || PROFESSION_LABELS.farmer;
            const isFarmer = profession === 'farmer' || profession === 'all_rounder';
            const isMerchant = profession === 'merchant' || profession === 'all_rounder';

            const stageAssignments = state.stageAssignments || {};
            const assignedStages = Object.entries(stageAssignments)
              .filter(([_, workerVal]) =>
                Array.isArray(workerVal) ? workerVal.includes(worker.id) : workerVal === worker.id
              )
              .map(([stage]) => getWorkerStageRoleTitle(stage as any));

            const isAssigned = assignedStages.length > 0;

            return (
              <div
                key={worker.id}
                className={`border rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
                  isAssigned
                    ? 'bg-stone-900/90 border-emerald-500/40 hover:border-emerald-400/60'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{worker.avatar || '👨‍🌾'}</span>
                  <span className="font-bold text-amber-100">{worker.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {profLabel.icon} {profLabel.label}
                  </span>
                  {isAssigned ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ Przypisany ({assignedStages.length})
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-stone-800 text-stone-400 border border-stone-700">
                      ⚪ Bez przydziału
                    </span>
                  )}
                  {isFarmer && typeof worker.skillBonusPercent === 'number' && worker.skillBonusPercent > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      +{worker.skillBonusPercent}%
                    </span>
                  )}
                  <InfoHoverIcon
                    title={`${profLabel.label} (${assignedStages.length} ról)`}
                    body={`${profLabel.desc}${isAssigned ? ` • Role: ${assignedStages.join(', ')}` : ' • Pracownik w farmie, bez przydziału do etapu'}`}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isFarmer && (
                    <button
                      type="button"
                      onClick={() => appendWorkerToStages(worker.id, ['plowing', 'sowing', 'fertilizing', 'weeding', 'harvesting'])}
                      className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold cursor-pointer"
                    >
                      ⚡ Pole
                    </button>
                  )}
                  {isMerchant && (
                    <button
                      type="button"
                      onClick={() => appendWorkerToStages(worker.id, ['seed_intake', 'storing_selling'])}
                      className="px-2 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 text-[10px] font-bold cursor-pointer"
                    >
                      ⚡ Handel
                    </button>
                  )}
                  <span className="font-mono font-bold text-amber-300">£{worker.wageDaily.toFixed(1)}/d</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(worker.id)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-300 bg-rose-950/50 border border-rose-800/60 hover:bg-rose-900/60 cursor-pointer"
                  >
                    Zwolnij
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PODSUMOWANIE FUNDUSZU PŁAC */}
      <div className="bg-stone-900/60 px-3 py-2 rounded-xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
        <span className="text-stone-300">
          Załoga: <strong className="text-amber-300">{crew.length} os.</strong> +{' '}
          <strong className="text-sky-300">{agronomist.hired ? '1 agronom' : 'brak agronoma'}</strong>
        </span>
        <span className="text-stone-300">
          Płace: <strong className="text-emerald-400">£ {totalDailyPayroll.toFixed(1)} / dzień</strong>{' '}
          <span className="text-stone-400">(£ {Math.round(totalDailyPayroll * 30)} / msc)</span>
        </span>
      </div>
    </div>
  );
};
