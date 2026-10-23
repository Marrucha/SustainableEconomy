import React from 'react';
import type {
  OrchardCapitalismState,
  OrchardCrewMember,
  OrchardCycleStage,
} from './orchardTypes';
import {
  ORCHARD_STAGE_LABELS,
  ORCHARD_PROFESSION_LABELS,
} from './orchardTypes';

interface OrchardCrewTabProps {
  state: OrchardCapitalismState;
  onUpdateState: (patch: Partial<OrchardCapitalismState>) => void;
}

const CANDIDATES: OrchardCrewMember[] = [
  { id: 'cand_1', name: 'William Fletcher', profession: 'orchardist', wageDaily: 1.8, avatar: '👨‍🌾' },
  { id: 'cand_2', name: 'Edward Higgins', profession: 'merchant', wageDaily: 2.2, avatar: '💰' },
  { id: 'cand_3', name: 'Thomas Ward', profession: 'all_rounder', wageDaily: 2.4, avatar: '⭐' },
];

export const OrchardCrewTab: React.FC<OrchardCrewTabProps> = ({
  state,
  onUpdateState,
}) => {
  const crew = state.crew;
  const pomologist = state.pomologist;

  const totalCrewWages = crew.reduce((acc, m) => acc + m.wageDaily, 0);
  const totalWages = totalCrewWages + (pomologist.hired ? pomologist.wageDaily : 0);

  const handleHireMember = (cand: OrchardCrewMember) => {
    if (crew.length >= 4) return;
    const newMember: OrchardCrewMember = {
      ...cand,
      id: `orch_${Date.now()}`,
    };
    onUpdateState({
      crew: [...crew, newMember],
    });
  };

  const handleFireMember = (id: string) => {
    if (crew.length <= 1) return;
    const updatedCrew = crew.filter((m) => m.id !== id);
    const updatedAssignments = { ...state.stageAssignments };
    for (const key of Object.keys(updatedAssignments) as OrchardCycleStage[]) {
      if (updatedAssignments[key] === id) {
        delete updatedAssignments[key];
      }
    }
    onUpdateState({
      crew: updatedCrew,
      stageAssignments: updatedAssignments,
    });
  };

  const handleAssignRole = (stage: OrchardCycleStage, workerId: string) => {
    onUpdateState({
      stageAssignments: {
        ...state.stageAssignments,
        [stage]: workerId,
      },
    });
  };

  const handleTogglePomologist = () => {
    onUpdateState({
      pomologist: {
        ...pomologist,
        hired: !pomologist.hired,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. MISTRZ SADOWNICTWA / POMOLOG (SYSTEM 2w1 Z ROLNICTWA) */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-stone-950 rounded-2xl border border-amber-500/40 shadow-sm">
              🎩
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Klasa M (Zarządca i Uczony 1880 r.)
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Płaca: £{pomologist.wageDaily} / dzień
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-100 mt-1">
                {pomologist.name} – {pomologist.title}
              </h4>
              <p className="text-xs text-stone-300 mt-1 leading-[2.5]">
                Specjalizacja w formowaniu koron i szczepieniu drzewek. Zapewnia{' '}
                <span className="text-emerald-400 font-bold">+{pomologist.yieldBonusPercent}% do rocznego zbioru owoców</span>.
              </p>
            </div>
          </div>

          <button
            onClick={handleTogglePomologist}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer leading-[2.5] ${
              pomologist.hired
                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold'
            }`}
          >
            {pomologist.hired ? 'Zwolnij Pomologa' : 'Zatrudnij Pomologa (£3.5/d)'}
          </button>
        </div>
      </div>

      {/* 2. ZAŁOGA SADOWNIKÓW (ROBOTNICY POLOWI I KUPCY) */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>👥</span> Kadra Sadowników i Handlarzy (Maksymalnie 4 pracowników)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Pracownicy odpowiadają za bielenie pni, cięcie koron, zbiór owoców oraz sprzedaż na targu miejskim.
            </p>
          </div>
          <div className="text-xs font-mono text-stone-300 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            Dzienny koszt płac sadu: <span className="text-amber-300 font-bold">£{totalWages.toFixed(2)}</span>
          </div>
        </div>

        {/* LISTA AKTYWNYCH PRACOWNIKÓW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crew.map((member) => {
            const prof = ORCHARD_PROFESSION_LABELS[member.profession];
            return (
              <div
                key={member.id}
                className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl p-1 bg-stone-950 rounded-xl border border-stone-800">
                      {member.avatar}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      £{member.wageDaily}/dzień
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-amber-100">{member.name}</h5>
                  <span className="text-[10px] text-amber-400 font-mono block mb-1">
                    {prof.label}
                  </span>
                  <p className="text-[11px] text-stone-400 leading-[2.5]">
                    {prof.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-800/80 mt-2 flex justify-end">
                  <button
                    onClick={() => handleFireMember(member.id)}
                    disabled={crew.length <= 1}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      crew.length > 1
                        ? 'text-rose-400 hover:bg-rose-950/40 cursor-pointer'
                        : 'text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    Zwolnij
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* REKRUTACJA SADOWNIKA */}
        {crew.length < 4 && (
          <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-3">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
              Dostępni czeladnicy sadowniczy do zatrudnienia:
            </span>
            <div className="flex flex-wrap gap-2">
              {CANDIDATES.map((cand) => (
                <button
                  key={cand.id}
                  onClick={() => handleHireMember(cand)}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>{cand.avatar}</span>
                  <span>{cand.name}</span>
                  <span className="text-stone-400 font-mono">(£{cand.wageDaily}/d)</span>
                  <span className="text-emerald-400 ml-1">+</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. MATRYCA PRZYPISANIA DO 7 ETAPÓW SADU */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <span>📋</span> Przypisanie Sadowników do 7 Etapów Produkcji
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {(Object.keys(ORCHARD_STAGE_LABELS) as OrchardCycleStage[]).map((st) => {
            const stInfo = ORCHARD_STAGE_LABELS[st];
            const currentWorkerId = state.stageAssignments[st];

            return (
              <div
                key={st}
                className="bg-stone-900/90 border border-stone-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stInfo.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">{stInfo.label}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{stInfo.season.split(' ')[0]}</span>
                  </div>
                </div>

                <select
                  value={currentWorkerId || ''}
                  onChange={(e) => handleAssignRole(st, e.target.value)}
                  className="bg-stone-950 border border-stone-700 text-amber-200 text-xs rounded-lg px-2 py-1 font-bold cursor-pointer"
                >
                  <option value="">-- Wybierz --</option>
                  {crew.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
