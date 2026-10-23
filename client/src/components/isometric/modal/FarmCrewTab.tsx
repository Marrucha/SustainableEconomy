import React, { useState } from 'react';
import type { FarmCapitalismState, FarmCrewMember, WorkerProfession } from './farmGridTypes';
import { PROFESSION_LABELS, getWorkerStageRoleTitle } from './farmGridTypes';

interface FarmCrewTabProps {
  state: FarmCapitalismState;
  onUpdateState: (updates: Partial<FarmCapitalismState>) => void;
}

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
      agronomist: {
        ...agronomist,
        hired: !agronomist.hired,
      },
    });
  };

  const handleChangeAgronomistSpec = (spec: 'norfolk' | 'soil_chemistry' | 'botany') => {
    onUpdateState({
      agronomist: {
        ...agronomist,
        specialization: spec,
      },
    });
  };

  const handleRemoveWorker = (id: string) => {
    const updatedCrew = crew.filter((w) => w.id !== id);
    const updatedAssignments = { ...state.stageAssignments };
    for (const stage in updatedAssignments) {
      if (updatedAssignments[stage as keyof typeof updatedAssignments] === id) {
        delete updatedAssignments[stage as keyof typeof updatedAssignments];
      }
    }
    onUpdateState({
      crew: updatedCrew,
      stageAssignments: updatedAssignments,
    });
  };

  const handleAddWorker = () => {
    if (!newWorkerName.trim()) return;
    const newWorker: FarmCrewMember = {
      id: `crew_${Date.now()}`,
      name: newWorkerName.trim(),
      profession: newProfession,
      wageDaily: Number(newWage.toFixed(1)),
      avatar: newProfession === 'merchant' ? '🎩' : '👨‍🌾',
    };
    onUpdateState({
      crew: [...crew, newWorker],
    });
    setNewWorkerName('');
    setIsAddingNew(false);
  };

  const handleAssignFarmerToAllFieldStages = (workerId: string) => {
    onUpdateState({
      stageAssignments: {
        ...state.stageAssignments,
        plowing: workerId,
        sowing: workerId,
        fertilizing: workerId,
        weeding: workerId,
        harvesting: workerId,
      },
    });
  };

  const handleAssignMerchantToAllTradeStages = (workerId: string) => {
    onUpdateState({
      stageAssignments: {
        ...state.stageAssignments,
        seed_intake: workerId,
        storing_selling: workerId,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. KADRA GOSPODARSTWA: WSPÓLNA PIONOWA LISTA KAFELKÓW NA PEŁNĄ SZEROKOŚĆ */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 leading-[2.5]">
              <span>👥</span> Kadra Gospodarstwa Rolnego (Agronom, Rolnicy i Kupcy)
            </h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Agronom Królewski (Klasa M) sprawuje nadzór agrotechniczny, a pracownicy polowi i kupcy realizują kolejne etapy cyklu.
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
              <span>Nowa umowa o pracę (Wielka Brytania 1880)</span>
              <button onClick={() => setIsAddingNew(false)} className="text-stone-400 hover:text-white cursor-pointer px-2">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1.5 leading-[2.5]">Imię i nazwisko pracownika:</label>
                <input
                  type="text"
                  placeholder="np. Arthur Pendelton"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 leading-[2.5]"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1.5 leading-[2.5]">Zawód / Kwalifikacja:</label>
                <select
                  value={newProfession}
                  onChange={(e) => setNewProfession(e.target.value as WorkerProfession)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs cursor-pointer leading-[2.5]"
                >
                  <option value="farmer">🌾 Rolnik Polowy (Orka, Siew, Pielenie, Oprysk, Żniwa)</option>
                  <option value="merchant">💰 Kupiec / Sprzedawca (Nasiona & Zbyt zboża)</option>
                  <option value="all_rounder">⭐ Gospodarz Wszechstronny (Pole i Handel)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-3 leading-[2.5]">
                <span className="text-[11px] text-stone-400 leading-[2.5]">Płaca dzienna:</span>
                <input
                  type="range"
                  min="1.2"
                  max="4.0"
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

        {/* PIONOWA LISTA KAFELKÓW KADRY (AGRONOM NA POCZĄTKU + PRACOWNICY) */}
        <div className="flex flex-col gap-3.5">
          {/* KAFELEK 1: AGRONOM GOSPODARSTWA (KLASA M - NADZÓR I KONSULTACJE) */}
          <div className="bg-gradient-to-r from-stone-900/95 via-sky-950/30 to-stone-900/95 border border-sky-600/50 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2 rounded-xl bg-sky-950/90 border border-sky-500/60 shadow-inner">
                  🎩
                </span>
                <div>
                  <div className="flex items-center gap-2.5 leading-[2.5]">
                    <h3 className="font-serif font-bold text-sm text-sky-100 leading-[2.5]">{agronomist.name}</h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono font-bold leading-[2.5]">
                      Klasa M • Główny Agronom Folwarku
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-300/80 leading-[2.5]">{agronomist.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right leading-[2.5]">
                  <span className="text-[10px] text-stone-400 block font-mono leading-[2.5]">Wynagrodzenie:</span>
                  <span className="text-xs font-bold font-mono text-sky-300 leading-[2.5]">
                    £ {agronomist.wageDaily.toFixed(1)} / dzień
                  </span>
                </div>
                <button
                  onClick={handleToggleAgronomist}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer leading-[2.5] ${
                    agronomist.hired
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30'
                      : 'bg-stone-800 border border-stone-700 text-stone-400 hover:text-white'
                  }`}
                >
                  {agronomist.hired ? '✓ Zatrudniony' : '+ Zatrudnij Agronoma'}
                </button>
              </div>
            </div>

            {/* SPECJALIZACJA AGRONOMA */}
            {agronomist.hired ? (
              <div className="pt-2.5 border-t border-sky-800/40">
                <div className="text-[11px] text-sky-300/90 font-semibold mb-2 leading-[2.5]">
                  Specjalizacja naukowa i agrotechniczna (Wybierz doktrynę):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'norfolk', label: 'Płodozmian Norfolk 1880', bonus: '+25% plonów z kłosa' },
                    { id: 'soil_chemistry', label: 'Chemia gleby i wapnowanie', bonus: '+30% bonusu z nawozów' },
                    { id: 'botany', label: 'Ochrona fitosanitarna', bonus: '-50% strat z chwastów' },
                  ].map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => handleChangeAgronomistSpec(spec.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer leading-[2.5] ${
                        agronomist.specialization === spec.id
                          ? 'bg-sky-500/20 border-sky-400 text-sky-100 shadow-sm ring-1 ring-sky-400/40'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-sky-200 leading-[2.5]">{spec.label}</div>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold leading-[2.5] mt-0.5">{spec.bonus}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-sky-800/30 text-[11px] text-stone-500 italic leading-[2.5]">
                Brak zatrudnionego agronoma – gospodarstwo nie otrzymuje bonusów z wiedzy agrotechnicznej Klasy M.
              </div>
            )}
          </div>

          {/* KAFELKI POZOSTAŁYCH PRACOWNIKÓW */}
          {crew.map((worker) => {
            const profession = worker.profession || 'farmer';
            const profLabel = PROFESSION_LABELS[profession] || PROFESSION_LABELS.farmer;
            const isFarmer = profession === 'farmer' || profession === 'all_rounder';
            const isMerchant = profession === 'merchant' || profession === 'all_rounder';

            const stageAssignments = state.stageAssignments || {};
            const assignedStages = Object.entries(stageAssignments)
              .filter(([_, workerId]) => workerId === worker.id)
              .map(([stage]) => getWorkerStageRoleTitle(stage as any));

            return (
              <div
                key={worker.id}
                className="bg-stone-900/75 border border-stone-800 rounded-2xl p-4 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-md space-y-3"
              >
                {/* GÓRNY WIERSZ KAFELKA: AWATAR, DANE I STAWKA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800">
                      {worker.avatar || '👨‍🌾'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 leading-[2.5]">
                        <p className="font-bold text-sm text-amber-100 leading-[2.5]">{worker.name}</p>
                        <span className="inline-block text-[10px] px-2.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 leading-[2.5]">
                          {profLabel.icon} {profLabel.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-[2.5]">
                        {profLabel.desc}
                      </p>
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

                {/* DOLNY WIERSZ KAFELKA: PRZYPISANE ETAPY ORAZ SZYBKIE PRZYPISANIE */}
                <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-stone-400 leading-[2.5] flex items-center gap-2">
                      <span>Aktywne role w cyklu:</span>
                      <strong className="font-mono text-emerald-400">
                        {assignedStages.length > 0 ? `${assignedStages.length} ról` : 'Brak przydziału'}
                      </strong>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {assignedStages.length > 0 ? (
                        assignedStages.map((title, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono leading-[2.5]">
                            ✓ {title}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-500 italic leading-[2.5]">
                          Przypisz pracownika do kroków w wężu produkcji
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFarmer && (
                      <button
                        onClick={() => handleAssignFarmerToAllFieldStages(worker.id)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-bold cursor-pointer transition-all leading-[2.5]"
                      >
                        ⚡ Obsadź całe pole (Orka, Siew, Żniwa)
                      </button>
                    )}
                    {isMerchant && (
                      <button
                        onClick={() => handleAssignMerchantToAllTradeStages(worker.id)}
                        className="py-1.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 text-[11px] font-bold cursor-pointer transition-all leading-[2.5]"
                      >
                        ⚡ Obsadź handel (Nasiona & Zbyt)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PODSUMOWANIE FUNDUSZU PŁAC */}
      <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-3 font-mono leading-[2.5]">
        <span className="text-stone-300 leading-[2.5]">
          Zatrudnieni: <strong className="text-amber-300">{crew.length} ludzi</strong> +{' '}
          <strong className="text-sky-300">{agronomist.hired ? '1 agronom (Klasa M)' : 'brak agronoma'}</strong>
        </span>
        <span className="text-stone-300 leading-[2.5]">
          Dzienny fundusz płac:{' '}
          <strong className="text-emerald-400 text-sm">£ {totalDailyPayroll.toFixed(1)} / dzień</strong>{' '}
          (£ {Math.round(totalDailyPayroll * 30)} / msc)
        </span>
      </div>
    </div>
  );
};
