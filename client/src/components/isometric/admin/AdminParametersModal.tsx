import React, { useState, useEffect } from 'react';
import {
  DEFAULT_GAME_PARAMETERS,
  loadGameParameters,
  saveGameParameters,
  resetGameParameters,
  type GameParametersConfig,
} from './gameParameters';
import { CONTRACT_OPTIONS } from '../modal/industryContracts';

interface AdminParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FieldSpec {
  key: keyof GameParametersConfig;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
}

const SECTIONS: { title: string; subtitle: string; fields: FieldSpec[] }[] = [
  {
    title: 'Rozród i Inseminacja',
    subtitle: 'Skuteczność zabiegów oraz okresy regeneracji po porodzie',
    fields: [
      { key: 'inseminationSuccessFarmerPercent', label: 'Skuteczność inseminacji — Rolnik', unit: '%', min: 0, max: 100 },
      { key: 'inseminationSuccessVetPercent', label: 'Skuteczność inseminacji — Weterynarz', unit: '%', min: 0, max: 100 },
      { key: 'horseRecoveryMonths', label: 'Regeneracja klaczy po porodzie', unit: 'msc', min: 0, max: 24 },
      { key: 'cattleRecoveryMonths', label: 'Regeneracja krowy po porodzie', unit: 'msc', min: 0, max: 24 },
      { key: 'sheepRecoveryMonths', label: 'Regeneracja owcy po wykocie', unit: 'msc', min: 0, max: 24 },
      { key: 'horseInseminationRetryWaitMonths', label: 'Odczekanie po nieudanej próbie (klacz)', unit: 'msc', min: 1, max: 12 },
    ],
  },
  {
    title: 'Ciąża, Wzrost i Żywienie',
    subtitle: 'Parametry biologiczne stada oraz dzienne zużycie paszy',
    fields: [
      { key: 'horseDailyFeedKg', label: 'Dzienne zużycie paszy przez konia', unit: 'kg/dzień', min: 0, max: 100, step: 0.5 },
      { key: 'horseWorkCapacityHa', label: 'Areał obrabiany przez 1 konia', unit: 'ha/koń', min: 0.1, max: 5, step: 0.1 },
      { key: 'horseGestationMonths', label: 'Czas ciąży klaczy', unit: 'msc', min: 1, max: 24 },
      { key: 'cattleGestationMonths', label: 'Czas ciąży krowy', unit: 'msc', min: 1, max: 24 },
      { key: 'sheepGestationMonths', label: 'Czas ciąży owcy', unit: 'msc', min: 1, max: 24 },
      { key: 'horseMaturityYears', label: 'Wiek dorosłości źrebaka (konia)', unit: 'lata', min: 1, max: 10 },
      { key: 'cattleMaturityMonths', label: 'Wiek dorosłości cielęcia (krowy)', unit: 'msc', min: 6, max: 60 },
      { key: 'sheepMaturityMonths', label: 'Wiek dorosłości jagnięcia (owcy)', unit: 'msc', min: 3, max: 48 },
      { key: 'horseMaxAgeYears', label: 'Maksymalny wiek konia', unit: 'lata', min: 5, max: 40 },
      { key: 'cattleMaxAgeYears', label: 'Maksymalny wiek krowy', unit: 'lata', min: 5, max: 30 },
      { key: 'sheepMaxAgeYears', label: 'Maksymalny wiek owcy', unit: 'lata', min: 4, max: 25 },
    ],
  },
  {
    title: 'Domyślne Pojemności Magazynowe',
    subtitle: 'Bazowe limity pojemności zagrody, spichlerza, stogu słomy i płyty obornikowej',
    fields: [
      { key: 'manurePenCapacityKg', label: 'Pojemność obornika w zagrodzie', unit: 'kg', min: 50, max: 5000, step: 10 },
      { key: 'grainSiloBaseCapacityKg', label: 'Bazowa pojemność spichlerza (poziom 1)', unit: 'kg', min: 1000, max: 100000, step: 500 },
      { key: 'strawStackBaseCapacityKg', label: 'Bazowa pojemność stogu słomy (poziom 1)', unit: 'kg', min: 1000, max: 100000, step: 500 },
      { key: 'manureBinBaseCapacityKg', label: 'Bazowa pojemność płyty obornikowej (poziom 1)', unit: 'kg', min: 1000, max: 100000, step: 500 },
    ],
  },
];

export const AdminParametersModal: React.FC<AdminParametersModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<GameParametersConfig>(() => loadGameParameters());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(loadGameParameters());
      setSavedNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof GameParametersConfig, raw: string) => {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    setForm((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleSave = () => {
    saveGameParameters(form);
    setSavedNotice('Zapisano parametry w pamięci gry.');
  };

  const handleReset = () => {
    const fresh = resetGameParameters();
    setForm(fresh);
    setSavedNotice('Przywrócono domyślne parametry.');
  };

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(form, null, 2));
    setSavedNotice('Skopiowano JSON parametrów do schowka.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/92 backdrop-blur-md flex flex-col overflow-hidden text-stone-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/90">
        <div>
          <h1 className="text-lg font-bold tracking-wide text-amber-300 flex items-center gap-2">
            <span>⚙️</span>
            <span>Panel Administracyjny — Parametry Gry</span>
          </h1>
          <p className="text-xs text-stone-400">
            Centralny rejestr parametrów symulacji (zapis lokalny w przeglądarce)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-3 py-1 rounded-lg">
              {savedNotice}
            </span>
          )}
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold cursor-pointer"
          >
            Kopiuj JSON
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 border border-stone-700 text-xs font-semibold text-rose-200 cursor-pointer"
          >
            Domyślne
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
          >
            Zapisz parametry
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-semibold cursor-pointer"
          >
            Powrót do gry ✕
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map((sec) => (
            <section
              key={sec.title}
              className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="border-b border-stone-800 pb-2">
                <h2 className="text-sm font-bold text-amber-200">{sec.title}</h2>
                <p className="text-[11px] text-stone-400">{sec.subtitle}</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {sec.fields.map((f) => (
                  <label key={f.key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-stone-200">{f.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={f.min}
                        max={f.max}
                        step={f.step ?? 1}
                        value={form[f.key]}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        className="w-20 px-2 py-1 rounded bg-stone-950 border border-stone-700 text-right font-mono text-amber-200 focus:outline-none focus:border-amber-500"
                      />
                      <span className="w-14 text-[11px] text-stone-400">{f.unit}</span>
                      <span className="text-[10px] text-stone-500" title="Wartość domyślna">
                        ({DEFAULT_GAME_PARAMETERS[f.key]})
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="border-b border-stone-800 pb-2">
              <h2 className="text-sm font-bold text-amber-200">Kontrakty Terminowe (Standard Systemowy)</h2>
              <p className="text-[11px] text-stone-400">
                Jedno źródło prawdy z industryContracts.ts (podgląd stałych)
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {CONTRACT_OPTIONS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded bg-stone-950/70 border border-stone-800"
                >
                  <span className="font-semibold text-stone-200">{c.label}</span>
                  <span className="font-mono text-stone-400">
                    {c.durationMonths} msc • -{c.discountPercent}% zniżki
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
