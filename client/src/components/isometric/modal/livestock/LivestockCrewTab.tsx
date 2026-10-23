import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockWorker,
  LivestockProfession,
} from './livestockTypes';
import { LIVESTOCK_PROFESSIONS_CONFIG } from './livestockTypes';

interface LivestockCrewTabProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

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
    <div className="space-y-5">
      {/* NAGŁÓWEK KADRY */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 leading-[2.5]">
              <span>👥</span> Kadra Fermy Zwierzęcej (Specjaliści, Hodowcy, Obsługa i Kupcy)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Weterynarz (1-10% ryzyka porażki), Agronom (Klasa M), Hodowcy stada, Dojarze (Obsługa) oraz Kupiec handlowy.
            </p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 leading-[2.5] self-start sm:self-auto"
          >
            <span>➕</span> Zatrudnij Nowego Pracownika
          </button>
        </div>

        {/* FORMULARZ ZATRUDNIENIA */}
        {isAddingNew && (
          <div className="bg-stone-900/95 border border-amber-500/60 rounded-xl p-4 space-y-4 animate-fade-in shadow-2xl">
            <div className="text-xs font-bold text-amber-200 flex items-center justify-between leading-[2.5]">
              <span>Nowa umowa o pracę w fermie zwierzęcej (1880 r.)</span>
              <button onClick={() => setIsAddingNew(false)} className="text-stone-400 hover:text-white cursor-pointer px-2">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1.5 leading-[2.5]">Imię i nazwisko pracownika:</label>
                <input
                  type="text"
                  placeholder="np. William Stewart"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 leading-[2.5]"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1.5 leading-[2.5]">Zawód i funkcja w fermie:</label>
                <select
                  value={newProfession}
                  onChange={(e) => {
                    const prof = e.target.value as LivestockProfession;
                    setNewProfession(prof);
                    setNewWage(LIVESTOCK_PROFESSIONS_CONFIG[prof].defaultWage);
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs cursor-pointer leading-[2.5]"
                >
                  <option value="vet">🩺 Weterynarz (Chirurg weterynarii – 1-10% porażki)</option>
                  <option value="agronomist">🎩 Agronom Zwierzęcy (Klasa M – żywienie i pastwiska)</option>
                  <option value="breeder">🤠 Hodowca Bydła (Ciąża 9 msc, wzrost 2 lata, ubój)</option>
                  <option value="handler">🥛 Obsługa Fermy (Dojenie krów i produkcja nawozu)</option>
                  <option value="trader">💰 Kupiec / Handlarz (Sprzedaż żywca, mleka, skór i mięsa)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-3 leading-[2.5]">
                <span className="text-[11px] text-stone-400 leading-[2.5]">Płaca dzienna:</span>
                <input
                  type="range"
                  min="1.5"
                  max="6.0"
                  step="0.1"
                  value={newWage}
                  onChange={(e) => setNewWage(parseFloat(e.target.value))}
                  className="w-32 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-300 leading-[2.5]">£ {newWage.toFixed(1)} / dzień</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-1.5 rounded-lg text-stone-400 hover:text-white text-xs cursor-pointer leading-[2.5]"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddWorker}
                  disabled={!newWorkerName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer disabled:opacity-40 leading-[2.5]"
                >
                  Zatrudnij
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PIONOWA LISTA KAFELKÓW KADRY */}
        <div className="flex flex-col gap-3.5">
          {crew.map((worker) => {
            const profCfg = LIVESTOCK_PROFESSIONS_CONFIG[worker.profession] || LIVESTOCK_PROFESSIONS_CONFIG.breeder;
            const isClassM = worker.profession === 'vet' || worker.profession === 'agronomist';

            return (
              <div
                key={worker.id}
                className={`border rounded-2xl p-4 transition-all flex flex-col justify-between shadow-md space-y-3 ${
                  isClassM
                    ? 'bg-gradient-to-r from-stone-900/95 via-sky-950/25 to-stone-900/95 border-sky-600/50'
                    : 'bg-stone-900/75 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800 shadow-sm">
                      {worker.avatar || profCfg.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 leading-[2.5]">
                        <p className="font-bold text-sm text-amber-100 leading-[2.5]">{worker.name}</p>
                        <span
                          className={`inline-block text-[10px] px-2.5 py-0.5 rounded font-mono font-bold leading-[2.5] ${
                            isClassM
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {profCfg.icon} {profCfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-[2.5]">{worker.title || profCfg.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right leading-[2.5]">
                      <span className="font-mono text-xs font-bold text-amber-300 block leading-[2.5]">
                        £ {worker.wageDaily.toFixed(1)} / dzień
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/40 cursor-pointer transition-all leading-[2.5]"
                    >
                      Zwolnij
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 leading-[2.5] flex items-center justify-between">
                  <span>Kompetencje w cyklu: {profCfg.desc}</span>
                  {worker.profession === 'vet' && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">✓ 1-10% ryzyka porażki</span>
                  )}
                  {worker.profession === 'breeder' && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold">⚠️ 10-30% ryzyka porażki</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PODSUMOWANIE FUNDUSZU PŁAC */}
      <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-3 font-mono leading-[2.5]">
        <span className="text-stone-300 leading-[2.5]">
          Zatrudnieni w fermie: <strong className="text-amber-300">{crew.length} osób</strong>
        </span>
        <span className="text-stone-300 leading-[2.5]">
          Dzienny fundusz płac fermy:{' '}
          <strong className="text-emerald-400 text-sm">£ {totalDailyPayroll.toFixed(1)} / dzień</strong>{' '}
          (£ {Math.round(totalDailyPayroll * 30)} / msc)
        </span>
      </div>
    </div>
  );
};
