import React, { useState } from 'react';
import { generateRandomEnglishName } from '../englishNames';
import { WorkdayHoursBar, WorkerDailyWageInput } from '../CrewControls';
import {
  BAKERY_PROFESSIONS,
  BAKERY_STAGES_CONFIG,
  type BakeryCapitalismState,
  type BakeryCrewMember,
  type BakeryProfession,
} from './bakeryTypes';

interface BakeryCrewTabProps {
  state: BakeryCapitalismState;
  buildingName?: string;
  onUpdate: (updates: Partial<BakeryCapitalismState>) => void;
}

export const BakeryCrewTab: React.FC<BakeryCrewTabProps> = ({
  state,
  buildingName = 'Piekarnia Rzemieślnicza',
  onUpdate,
}) => {
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const [newName, setNewName] = useState(() => generateRandomEnglishName());
  const [newProfession, setNewProfession] = useState<BakeryProfession>('baker');
  const [newWage, setNewWage] = useState<number>(BAKERY_PROFESSIONS.baker.defaultWage);
  const [openWorkerInfoId, setOpenWorkerInfoId] = useState<string | null>(null);

  const handleProfessionChange = (prof: BakeryProfession) => {
    setNewProfession(prof);
    setNewWage(BAKERY_PROFESSIONS[prof].defaultWage);
  };

  const handleHire = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim() || generateRandomEnglishName();
    const member: BakeryCrewMember = {
      id: `bakery_w_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
    for (const st of BAKERY_STAGES_CONFIG) {
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
    return BAKERY_STAGES_CONFIG.filter((st) =>
      (state.stageAssignments?.[st.id] || []).includes(workerId)
    ).map((st) => st.shortLabel);
  };

  const dailyPayroll = state.crew.reduce((sum, w) => sum + w.dailyWage, 0);
  const monthlyPayroll = dailyPayroll * 30;
  const profCfg = BAKERY_PROFESSIONS[newProfession];

  return (
    <div className="space-y-3">
      {/* Nagłówek sekcji */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
            <span>👥</span> Kadra Piekarni Rzemieślniczej
          </h3>
          <button
            type="button"
            onClick={() => setShowRoleInfo((v) => !v)}
            className="w-5 h-5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 text-[10px] font-bold flex items-center justify-center cursor-pointer"
            title="Opis ról i bonusów w piekarni"
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
          {Object.values(BAKERY_PROFESSIONS).map((p) => (
            <p key={p.id} className="text-stone-300">
              <strong className="text-amber-300">
                {p.icon} {p.label}:
              </strong>{' '}
              {p.desc}
            </p>
          ))}
        </div>
      )}

      {/* Zwarte okno zatrudnienia */}
      {showHireForm && (
        <form
          onSubmit={handleHire}
          className="bg-stone-900/95 border border-emerald-500/40 rounded-2xl p-3 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                Imię i nazwisko
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setNewName(generateRandomEnglishName())}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs cursor-pointer"
                  title="Losuj imię"
                >
                  🎲
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                Profesja
              </label>
              <select
                value={newProfession}
                onChange={(e) => handleProfessionChange(e.target.value as BakeryProfession)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 cursor-pointer"
              >
                {Object.values(BAKERY_PROFESSIONS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                Stawka dzienna: <span className="text-amber-300 font-mono">£{newWage}/d</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={profCfg.minWage}
                  max={profCfg.maxWage}
                  step={1}
                  value={newWage}
                  onChange={(e) => setNewWage(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Lista pracowników (od najnowszego) */}
      <div className="space-y-1.5">
        {state.crew.length === 0 ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
            Brak zatrudnionej załogi. Kliknij <strong className="text-emerald-300">➕ Zatrudnij</strong> lub wybierz pracownika bezpośrednio na kafelku etapu.
          </div>
        ) : (
          [...state.crew].reverse().map((w) => {
            const prof = BAKERY_PROFESSIONS[w.profession];
            const assignedStages = getAssignedStageLabels(w.id);
            const isManager = w.profession === 'manager';
            const isAssigned = isManager || assignedStages.length > 0;
            const infoOpen = openWorkerInfoId === w.id;

            return (
              <div
                key={w.id}
                className={`rounded-xl px-3 py-2 border transition-all ${
                  isManager
                    ? 'bg-blue-950/90 border-blue-500/60'
                    : isAssigned
                    ? 'bg-stone-900/90 border-emerald-500/40'
                    : 'bg-stone-900/60 border-stone-800 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center text-sm shrink-0">
                      {prof.icon}
                    </span>
                    <span className="font-bold text-xs text-stone-100 truncate">{w.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isManager
                          ? 'bg-blue-900/80 text-blue-200 border border-blue-400/50'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {prof.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenWorkerInfoId(infoOpen ? null : w.id)}
                      className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[9px] flex items-center justify-center cursor-pointer"
                      title="Szczegóły kompetencji"
                    >
                      ℹ
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {isManager ? (
                      <span className="text-blue-300 font-semibold text-[11px]">
                        ✓ Nadzoruje: {buildingName}
                      </span>
                    ) : assignedStages.length > 0 ? (
                      <span className="text-emerald-300 font-semibold text-[11px]">
                        ✓ {assignedStages.join(', ')}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Nieprzypisany</span>
                    )}

                    <WorkerDailyWageInput
                      wage={w.dailyWage}
                      min={prof.minWage}
                      max={prof.maxWage}
                      step={0.5}
                      onChangeWage={(val) => handleUpdateWage(w.id, val)}
                    />
                    <button
                      type="button"
                      onClick={() => handleFire(w.id)}
                      className="px-2 py-0.5 rounded-lg bg-rose-950/70 hover:bg-rose-800 border border-rose-500/40 text-rose-200 text-[10px] font-bold cursor-pointer"
                    >
                      Zwolnij
                    </button>
                  </div>
                </div>

                {infoOpen && (
                  <p className="mt-1.5 pt-1.5 border-t border-stone-800/80 text-[11px] text-stone-300">
                    {prof.desc}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stopka płac */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-stone-400">
          Zatrudnieni: <strong className="text-stone-100 font-mono">{state.crew.length}</strong> os.
        </span>
        <div className="flex items-center gap-4 font-mono">
          <span className="text-stone-300">
            Dziennie: <strong className="text-amber-300">£{dailyPayroll}</strong>
          </span>
          <span className="text-stone-300">
            Miesięcznie (×30): <strong className="text-emerald-300">£{monthlyPayroll}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
