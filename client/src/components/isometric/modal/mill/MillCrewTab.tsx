import React, { useState } from 'react';
import { generateRandomEnglishName } from '../englishNames';
import { WorkdayHoursBar, WorkerDailyWageInput } from '../CrewControls';
import {
  MILL_PROFESSIONS,
  MILL_STAGES_CONFIG,
  type MillCapitalismState,
  type MillCrewMember,
  type MillProfession,
} from './millTypes';

interface MillCrewTabProps {
  state: MillCapitalismState;
  buildingName?: string;
  onUpdate: (updates: Partial<MillCapitalismState>) => void;
}

export const MillCrewTab: React.FC<MillCrewTabProps> = ({
  state,
  buildingName = 'Młyn Parowy',
  onUpdate,
}) => {
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const [newName, setNewName] = useState(() => generateRandomEnglishName());
  const [newProfession, setNewProfession] = useState<MillProfession>('miller');
  const [newWage, setNewWage] = useState<number>(MILL_PROFESSIONS.miller.defaultWage);
  const [openWorkerInfoId, setOpenWorkerInfoId] = useState<string | null>(null);

  const handleProfessionChange = (prof: MillProfession) => {
    setNewProfession(prof);
    setNewWage(MILL_PROFESSIONS[prof].defaultWage);
  };

  const handleHire = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim() || generateRandomEnglishName();
    const member: MillCrewMember = {
      id: `mill_w_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: trimmed,
      profession: newProfession,
      dailyWage: newWage,
    };
    onUpdate({ crew: [...state.crew, member] });
    setNewName(generateRandomEnglishName());
    setShowHireForm(false);
  };

  const handleFire = (id: string) => {
    const nextAssignments: typeof state.stageAssignments = {};
    for (const st of MILL_STAGES_CONFIG) {
      const list = state.stageAssignments?.[st.id] || [];
      nextAssignments[st.id] = list.filter((wId) => wId !== id);
    }
    onUpdate({
      crew: state.crew.filter((c) => c.id !== id),
      stageAssignments: nextAssignments,
    });
  };

  const handleUpdateWage = (id: string, dailyWage: number) => {
    onUpdate({
      crew: state.crew.map((c) => (c.id === id ? { ...c, dailyWage } : c)),
    });
  };

  const getAssignedStageLabels = (workerId: string): string[] => {
    return MILL_STAGES_CONFIG.filter((st) =>
      (state.stageAssignments?.[st.id] || []).includes(workerId)
    ).map((st) => st.shortLabel);
  };

  const dailyPayroll = state.crew.reduce((sum, w) => sum + w.dailyWage, 0);
  const monthlyPayroll = dailyPayroll * 30;
  const profCfg = MILL_PROFESSIONS[newProfession];

  return (
    <div className="space-y-3">
      {/* Nagłówek sekcji */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
            <span>👥</span> Kadra Młyna Parowego
          </h3>
          <button
            type="button"
            onClick={() => setShowRoleInfo((v) => !v)}
            className="w-5 h-5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 text-[10px] font-bold flex items-center justify-center cursor-pointer"
            title="Opis ról i bonusów w młynie"
          >
            ℹ
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowHireForm((v) => !v)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
        >
          {showHireForm ? '✕ Anuluj' : '➕ Zatrudnij'}
        </button>
      </div>

      <WorkdayHoursBar
        workdayHours={state.workdayHours ?? 10}
        onChangeHours={(h) => onUpdate({ workdayHours: h })}
      />

      {showRoleInfo && (
        <div className="bg-stone-950/90 border border-amber-500/30 rounded-xl p-3 text-xs space-y-1.5">
          {Object.values(MILL_PROFESSIONS).map((p) => (
            <p key={p.id} className="text-stone-300">
              <span className="font-bold text-amber-300">
                {p.icon} {p.label}:
              </span>{' '}
              {p.desc}
            </p>
          ))}
        </div>
      )}

      {/* Zwarte okno zatrudnienia (inline toggle) */}
      {showHireForm && (
        <form
          onSubmit={handleHire}
          className="bg-stone-900/95 border border-emerald-500/40 rounded-2xl p-3 flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
              Imię i nazwisko
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
              <button
                type="button"
                onClick={() => setNewName(generateRandomEnglishName())}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs cursor-pointer"
                title="Losuj imię"
              >
                🎲
              </button>
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
              Profesja
            </label>
            <select
              value={newProfession}
              onChange={(e) => handleProfessionChange(e.target.value as MillProfession)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 cursor-pointer"
            >
              {Object.values(MILL_PROFESSIONS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
              Płaca dzienna: <span className="text-amber-300 font-mono">£{newWage}/d</span>
            </label>
            <input
              type="range"
              min={profCfg.minWage}
              max={profCfg.maxWage}
              value={newWage}
              onChange={(e) => setNewWage(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold cursor-pointer"
          >
            OK
          </button>
        </form>
      )}

      {/* Zwarte wiersze pracowników (od najnowszego na górze) */}
      <div className="space-y-1.5">
        {state.crew.length === 0 ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-center text-xs text-stone-400">
            Brak zatrudnionych pracowników. Kliknij <strong className="text-emerald-400">➕ Zatrudnij</strong>, aby skompletować załogę młyna.
          </div>
        ) : (
          [...state.crew].reverse().map((worker) => {
            const pCfg = MILL_PROFESSIONS[worker.profession];
            const assignedStages = getAssignedStageLabels(worker.id);
            const isAssigned = assignedStages.length > 0;

            const isManager = worker.profession === 'manager';

            return (
              <div
                key={worker.id}
                className={`rounded-xl px-3 py-2 border flex flex-wrap items-center justify-between gap-2 transition-opacity ${
                  isManager
                    ? 'bg-blue-950/90 border-blue-500/60'
                    : isAssigned
                    ? 'bg-stone-900/90 border-emerald-500/40'
                    : 'bg-stone-900/90 border-stone-800 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0 ${
                      isManager
                        ? 'bg-blue-900/90 border-blue-400/60'
                        : 'bg-stone-800 border-stone-700'
                    }`}
                  >
                    {pCfg.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-100 truncate">{worker.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isManager
                            ? 'bg-blue-900 text-blue-100 border border-blue-400/50'
                            : 'bg-stone-800 text-amber-200'
                        }`}
                      >
                        {pCfg.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenWorkerInfoId((cur) => (cur === worker.id ? null : worker.id))
                        }
                        className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 text-[9px] font-bold flex items-center justify-center cursor-pointer"
                        title="Kompetencje"
                      >
                        ℹ
                      </button>
                    </div>
                    {openWorkerInfoId === worker.id && (
                      <p className="text-[10px] text-stone-400 mt-0.5">{pCfg.desc}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isManager ? (
                    <span className="text-[11px] font-semibold text-blue-300">
                      ✓ Nadzoruje: {buildingName}
                    </span>
                  ) : isAssigned ? (
                    <span className="text-[11px] font-semibold text-emerald-400">
                      ✓ Etapy ({assignedStages.join(', ')})
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-500 italic">Nieprzypisany</span>
                  )}
                  <WorkerDailyWageInput
                    wage={worker.dailyWage}
                    min={pCfg.minWage}
                    max={pCfg.maxWage}
                    step={0.5}
                    onChangeWage={(val) => handleUpdateWage(worker.id, val)}
                  />
                  <button
                    type="button"
                    onClick={() => handleFire(worker.id)}
                    className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700/40 text-rose-200 text-[10px] font-bold cursor-pointer"
                  >
                    Zwolnij
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stopka płac */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-stone-400">
          Łącznie zatrudnionych: <strong className="text-stone-100">{state.crew.length} os.</strong>
        </span>
        <div className="flex items-center gap-4 font-mono">
          <span className="text-stone-300">
            Fundusz dzienny: <strong className="text-amber-300">£{dailyPayroll}/d</strong>
          </span>
          <span className="text-stone-300">
            Fundusz miesięczny (×30): <strong className="text-amber-200">£{monthlyPayroll}/msc</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
