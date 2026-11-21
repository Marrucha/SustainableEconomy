import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import { LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';
import { generateRandomEnglishName } from '../englishNames';
import { WorkdayHoursBar, WorkerDailyWageInput } from '../CrewControls';

interface LivestockCrewTabProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

const STAGE_LABELS: Record<string, string> = {
  insemination: 'Stanówka / Inseminacja',
  gestation_9m: 'Ciąża',
  birth: 'Poród / Wyźrebienie',
  calf_growth_2y: 'Odchów młodych',
  branch_milking: 'Dojenie / Obsługa',
  branch_sale: 'Sprzedaż żywca',
};

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

export const LivestockCrewTab: React.FC<LivestockCrewTabProps> = ({
  state,
  onUpdateState,
}) => {
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newProfession, setNewProfession] = useState<LivestockProfession>('breeder');
  const [newWage, setNewWage] = useState(2.6);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const crew = state.crew || [];
  const totalDailyPayroll = crew.reduce((sum, w) => sum + w.wageDaily, 0);

  const handleRemoveWorker = (id: string) => {
    const updatedCrew = crew.filter((w) => w.id !== id);
    const updatedAssignments = { ...state.stageAssignments };
    for (const key in updatedAssignments) {
      if (updatedAssignments[key as keyof typeof updatedAssignments] === id) {
        delete updatedAssignments[key as keyof typeof updatedAssignments];
      }
    }
    onUpdateState({
      crew: updatedCrew,
      stageAssignments: updatedAssignments,
    });
  };

  const handleAddWorker = () => {
    if (!newWorkerName.trim()) return;
    const profCfg = LIVESTOCK_PROFESSIONS_CONFIG[newProfession];
    const newWorker: LivestockWorker = {
      id: `livestock_${Date.now()}`,
      name: newWorkerName.trim(),
      profession: newProfession,
      wageDaily: Number(newWage.toFixed(1)),
      avatar: profCfg.icon,
      title: profCfg.label,
    };

    onUpdateState({
      crew: [...crew, newWorker],
    });
    setNewWorkerName('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2.5">
        {/* NAGŁÓWEK */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              👥 Kadra Farmy Hodowlanej
            </h4>
            <InfoHoverIcon
              title="Kadra i Specjaliści"
              body="Weterynarz (50% skuteczności inseminacji, 1% śmiertelności źrebiąt), Hodowca (30% skuteczności, odchów), Obsługa (dojenie/obornik) oraz Kupiec."
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

        <WorkdayHoursBar
          workdayHours={state.workdayHours ?? 10}
          onChangeHours={(h) => onUpdateState({ workdayHours: h })}
        />

        {/* ZWARTY FORMULARZ ZATRUDNIENIA (SPÓJNY Z FARMĄ ZBOŻOWĄ) */}
        {isAddingNew && (
          <div className="bg-stone-900 border border-amber-500/60 rounded-xl p-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-200">
              <span>Nowy pracownik</span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
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
                  const prof = e.target.value as LivestockProfession;
                  setNewProfession(prof);
                  setNewWage(LIVESTOCK_PROFESSIONS_CONFIG[prof].defaultWage);
                }}
                className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-100"
              >
                {Object.entries(LIVESTOCK_PROFESSIONS_CONFIG).map(([id, cfg]) => (
                  <option key={id} value={id}>
                    {cfg.icon} {cfg.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="range"
                  min="1.5"
                  max="6.0"
                  step="0.1"
                  value={newWage}
                  onChange={(e) => setNewWage(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-300 shrink-0">
                  £{newWage.toFixed(1)}/d
                </span>
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

        {/* ZWARTE WIERSZE PRACOWNIKÓW */}
        <div className="space-y-1.5">
          {crew.length === 0 ? (
            <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800 text-center text-xs text-stone-400">
              Brak zatrudnionych pracowników. Kliknij „➕ Zatrudnij” lub dodaj kadrę z poziomu etapów.
            </div>
          ) : (
            [...crew].reverse().map((worker) => {
              const profCfg =
                LIVESTOCK_PROFESSIONS_CONFIG[worker.profession] || LIVESTOCK_PROFESSIONS_CONFIG.breeder;
              const isClassM = worker.profession === 'vet' || worker.profession === 'agronomist';
              const assignedStages = Object.entries(state.stageAssignments || {})
                .filter(([, wId]) => wId === worker.id)
                .map(([stage]) => STAGE_LABELS[stage] || stage);
              const isAssigned = assignedStages.length > 0;

              return (
                <div
                  key={worker.id}
                  className={`border rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
                    isAssigned
                      ? 'bg-stone-900/90 border-emerald-500/40 hover:border-emerald-400/60'
                      : 'bg-stone-950/60 border-stone-800/80 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{worker.avatar || profCfg.icon}</span>
                    <span className="font-bold text-amber-100">{worker.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                        isClassM
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {profCfg.icon} {profCfg.label}
                    </span>
                    <InfoHoverIcon
                      title={worker.title || profCfg.label}
                      body={
                        worker.profession === 'vet'
                          ? `${profCfg.desc} Skuteczność inseminacji: 50%, śmiertelność źrebiąt: 1%.`
                          : worker.profession === 'breeder'
                          ? `${profCfg.desc} Skuteczność inseminacji: 30%.`
                          : profCfg.desc
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isAssigned ? (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-700/50 px-2 py-0.5 rounded-md">
                        ✓ {assignedStages.join(', ')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-500">Nieprzypisany</span>
                    )}
                    <WorkerDailyWageInput
                      wage={worker.wageDaily}
                      min={0.5}
                      max={15}
                      step={0.5}
                      onChangeWage={(val) =>
                        onUpdateState({
                          crew: crew.map((w) =>
                            w.id === worker.id ? { ...w, wageDaily: val } : w
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/40 cursor-pointer"
                    >
                      Zwolnij
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PODSUMOWANIE FUNDUSZU PŁAC */}
      <div className="bg-stone-900/60 px-3.5 py-2.5 rounded-xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
        <span className="text-stone-300">
          Zatrudnieni w fermie: <strong className="text-amber-300">{crew.length} osób</strong>
        </span>
        <span className="text-stone-300">
          Dzienny fundusz płac:{' '}
          <strong className="text-emerald-400">£{totalDailyPayroll.toFixed(1)}/d</strong>{' '}
          (£{Math.round(totalDailyPayroll * 30)}/msc)
        </span>
      </div>
    </div>
  );
};
