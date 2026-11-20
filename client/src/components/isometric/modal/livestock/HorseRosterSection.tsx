import React, { useState } from 'react';
import type { HorseAnimal } from './livestockTypes';
import { loadGameParameters } from '../../admin/gameParameters';

const HORSE_NAMES = [
  'Samson', 'Duchess', 'Captain', 'Bella', 'Arthur', 'Clover', 'Duke', 'Molly',
  'Prince', 'Daisy', 'Winston', 'Hazel', 'Barney', 'Ruby', 'Chester', 'Rosie',
];

export const createDefaultHorsesList = (): HorseAnimal[] => {
  const list: HorseAnimal[] = [];
  for (let i = 0; i < 3; i++) {
    list.push({
      id: `horse_b_${i}`,
      name: HORSE_NAMES[i % HORSE_NAMES.length],
      sex: i === 0 ? 'male' : 'female', // 1 ogier + 2 klacze
      ageYears: 4 + i,
      group: 'breeding',
      postGrowthTarget: 'sale',
      breedingStatus: 'waiting',
      breedingWaitMonths: 0,
      pregnancyMonths: 0,
      vitalityPercent: 100,
    });
  }
  return list;
};

interface HorseRosterSectionProps {
  horses: HorseAnimal[];
  onUpdateHorses: (nextHorses: HorseAnimal[]) => void;
  horseStage?: string;
  horsePregnancyMonths?: number;
  horseRecoveryMonthsRemaining?: number;
  horseInseminationWaitMonths?: number;
  clockDay?: number;
}

export const HorseRosterSection: React.FC<HorseRosterSectionProps> = ({
  horses,
  onUpdateHorses,
  horseStage,
  horsePregnancyMonths = 0,
  horseRecoveryMonthsRemaining = 0,
  horseInseminationWaitMonths = 0,
  clockDay = 1,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const breeding = horses.filter((h) => h.group === 'breeding');
  const growth = horses.filter((h) => h.group === 'growth');
  const sale = horses.filter((h) => h.group === 'sale');

  const getHorseSex = (h: HorseAnimal, idx = 0): 'male' | 'female' =>
    h.sex ?? (idx % 4 === 0 ? 'male' : 'female');

  const breedingMales = breeding.filter((h, i) => getHorseSex(h, i) === 'male').length;
  const breedingFemales = breeding.length - breedingMales;
  const growthToSale = growth.filter((h) => h.postGrowthTarget === 'sale').length;
  const growthToBreed = growth.filter((h) => h.postGrowthTarget === 'breeding').length;

  const updateOne = (id: string, patch: Partial<HorseAnimal>) => {
    onUpdateHorses(horses.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const renderHorseIcons = (list: HorseAnimal[]) => {
    if (list.length === 0) {
      return <span className="text-[11px] font-mono text-stone-500">Brak sztuk</span>;
    }
    return (
      <div className="flex items-center flex-wrap gap-2 min-h-[34px]">
        {list.map((h, idx) => {
          const isOpen = hoveredId === h.id;
          const isSaleColor =
            h.group === 'sale' || (h.group === 'growth' && h.postGrowthTarget === 'sale');
          const isFoal = h.group === 'growth';
          const foalMonths = h.ageMonths ?? (h.ageYears || 0) * 12;
          const ringPct = isFoal
            ? Math.min(100, Math.max(4, Math.round((foalMonths / 36) * 100)))
            : Math.min(100, Math.max(6, Math.round((h.ageYears / 15) * 100)));
          const ringColor = isFoal ? '#22c55e' : '#ef4444';

          return (
            <div
              key={h.id}
              className="relative inline-block"
              onMouseEnter={() => setHoveredId(h.id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === h.id ? null : cur))}
            >
              {/* Obwódka postępu: zielona dla źrebaka (0-3 lata), czerwona dla dorosłego konia (0-15 lat) */}
              <div
                className="p-[2.5px] rounded-xl transition-all"
                style={{
                  background: h.isDeceased
                    ? '#44403c'
                    : `conic-gradient(${ringColor} ${ringPct}%, #292524 ${ringPct}% 100%)`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setHoveredId(isOpen ? null : h.id)}
                  className={`w-8 h-8 rounded-[10px] border text-lg leading-none transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                    h.isDeceased
                      ? 'bg-stone-900 border-stone-700 opacity-65 grayscale'
                      : isSaleColor
                      ? 'bg-stone-100 border-stone-300 hover:border-white'
                      : 'bg-amber-900 border-amber-600 hover:border-amber-300'
                  }`}
                  title={
                    h.isDeceased
                      ? `${h.name} — RIP (zniknie za ${h.deceasedMonthsRemaining ?? 3} msc)`
                      : `${h.name} (${h.ageYears} lat)`
                  }
                >
                  <span className={isSaleColor ? 'brightness-110 contrast-125' : ''}>🐎</span>
                </button>
              </div>
              {h.isDeceased && (
                <span
                  title={`Padłe źrebię — RIP (zniknie za ${h.deceasedMonthsRemaining ?? 3} msc)`}
                  className="pointer-events-none absolute -top-1.5 -right-1.5 px-1 h-4 rounded-full bg-stone-950 text-stone-100 border border-stone-500 flex items-center justify-center text-[8px] font-black shadow"
                >
                  ✝ RIP
                </span>
              )}
              {h.group === 'breeding' && getHorseSex(h, idx) === 'male' && (
                <span
                  title="Ogier (samiec)"
                  className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-stone-950 border border-stone-900 flex items-center justify-center text-[10px] font-black shadow"
                >
                  ♂
                </span>
              )}
              {h.group === 'breeding' && getHorseSex(h, idx) === 'female' && (() => {
                const params = loadGameParameters();
                const status =
                  h.breedingStatus ??
                  (horseStage === 'gestation_9m' || horseStage === 'birth'
                    ? 'pregnant'
                    : horseInseminationWaitMonths > 0
                    ? 'failed_wait'
                    : 'waiting');
                const pregMonths = h.pregnancyMonths ?? horsePregnancyMonths;
                const waitRem =
                  h.breedingWaitMonths !== undefined
                    ? h.breedingWaitMonths
                    : status === 'failed_wait'
                    ? horseInseminationWaitMonths
                    : horseRecoveryMonthsRemaining;

                if (status === 'pregnant') {
                  const totalPregMonths = Math.max(1, params.horseGestationMonths || 11);
                  const elapsedDays = Math.max(0, pregMonths - 1) * 30 + (clockDay - 1);
                  const pregPct = Math.min(
                    100,
                    Math.max(4, Math.round((elapsedDays / (totalPregMonths * 30)) * 100))
                  );
                  return (
                    <span
                      title={`Zapłodniona — ciąża (${pregMonths}/${totalPregMonths} msc • ${pregPct}%)`}
                      className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 shadow"
                      style={{
                        background: `conic-gradient(#3b82f6 ${pregPct}%, #ffffff ${pregPct}% 100%)`,
                      }}
                    />
                  );
                }
                if (status === 'failed_wait') {
                  const totalWaitMonths = Math.max(1, params.horseInseminationRetryWaitMonths || 1);
                  const waitElapsed = Math.max(0, totalWaitMonths - waitRem) * 30 + (clockDay - 1);
                  const waitPct = Math.min(
                    100,
                    Math.max(4, Math.round((waitElapsed / (totalWaitMonths * 30)) * 100))
                  );
                  return (
                    <span
                      title={`Nieudana inseminacja — oczekiwanie (${clockDay}/30 dzień • ${waitPct}%)`}
                      className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 shadow"
                      style={{
                        background: `conic-gradient(#ef4444 ${waitPct}%, #ffffff ${waitPct}% 100%)`,
                      }}
                    />
                  );
                }
                const totalRecMonths = Math.max(1, params.horseRecoveryMonths || 3);
                const fillPct =
                  waitRem > 0
                    ? Math.min(
                        100,
                        Math.max(
                          4,
                          Math.round(
                            ((Math.max(0, totalRecMonths - waitRem) * 30 + (clockDay - 1)) /
                              (totalRecMonths * 30)) *
                              100
                          )
                        )
                      )
                    : 100;

                return (
                  <span
                    title={
                      waitRem > 0
                        ? `Okres oczekiwania po porodzie (${waitRem} msc • ${fillPct}%)`
                        : 'Gotowa do inseminacji'
                    }
                    className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 shadow"
                    style={{
                      background: `conic-gradient(#10b981 ${fillPct}%, #ffffff ${fillPct}% 100%)`,
                    }}
                  />
                );
              })()}

              {isOpen && (
                <div className="absolute left-0 bottom-full pb-1.5 z-50 w-52">
                  <div className="p-2.5 rounded-xl bg-stone-950/95 border border-amber-500/70 shadow-2xl text-xs space-y-2 backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                      <span className="font-bold text-amber-200">
                        🐎 {h.name}{' '}
                        <span className={getHorseSex(h, idx) === 'male' ? 'text-sky-300' : 'text-pink-300'}>
                          ({getHorseSex(h, idx) === 'male' ? '♂ Ogier' : '♀ Klacz'})
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-stone-300">
                        {h.ageYears}/15 lat • ❤️{h.vitalityPercent ?? 100}%
                      </span>
                    </div>

                    {h.group === 'growth' ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-mono block">
                          Po wzroście (3 lata):
                        </span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => updateOne(h.id, { postGrowthTarget: 'sale' })}
                            className={`py-1 px-1.5 rounded text-[10px] font-bold cursor-pointer border ${
                              h.postGrowthTarget === 'sale'
                                ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                                : 'bg-stone-900 border-stone-700 text-stone-400'
                            }`}
                          >
                            💰 Sprzedaż
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOne(h.id, { postGrowthTarget: 'breeding' })}
                            className={`py-1 px-1.5 rounded text-[10px] font-bold cursor-pointer border ${
                              h.postGrowthTarget === 'breeding'
                                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                                : 'bg-stone-900 border-stone-700 text-stone-400'
                            }`}
                          >
                            🧬 Rozród
                          </button>
                        </div>
                      </div>
                    ) : h.group === 'breeding' ? (
                      <button
                        type="button"
                        onClick={() => {
                          updateOne(h.id, { group: 'sale' });
                          setHoveredId(null);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[10px] font-bold cursor-pointer"
                      >
                        💰 Przenieś na sprzedaż
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          updateOne(h.id, {
                            group: 'breeding',
                            breedingStatus: 'waiting',
                            breedingWaitMonths: 0,
                            pregnancyMonths: 0,
                          });
                          setHoveredId(null);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 text-[10px] font-bold cursor-pointer"
                      >
                        🧬 Przenieś do rozrodu
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* 1. ROZRÓD */}
      <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
              <span>🧬</span> 1. Rozród
            </span>
            <span className="text-lg font-bold font-mono text-emerald-300">{breeding.length} szt.</span>
          </div>
          {renderHorseIcons(breeding)}
        </div>
        <div className="pt-2 border-t border-stone-800 text-[10px] font-mono space-y-1">
          <div className="text-stone-300">
            ♂ Ogiery: <strong className="text-sky-300">{breedingMales}</strong> • ♀ Klacze:{' '}
            <strong className="text-pink-300">{breedingFemales}</strong>
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-stone-400">
            <span className="flex items-center gap-1"><span className="text-sky-400 font-bold">♂</span> ogier</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 border border-stone-700" /> ciąża (11 msc)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 border border-stone-700" /> nieudana (1 msc)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 border border-stone-700" /> regeneracja (3 msc)</span>
          </div>
          {breedingMales === 0 ? (
            <div className="text-rose-300">⚠️ Brak ogiera (wymagany min. 1 samiec do rozrodu!)</div>
          ) : breedingFemales === 0 ? (
            <div className="text-rose-300">⚠️ Brak klaczy (samce się nie rozmnażają!)</div>
          ) : null}
        </div>
      </div>

      {/* 2. WZROST */}
      <div className="bg-stone-900/90 border border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <span>🌱</span> 2. Wzrost (Źrebaki)
            </span>
            <span className="text-lg font-bold font-mono text-amber-300">{growth.length} szt.</span>
          </div>
          {renderHorseIcons(growth)}
        </div>
        <div className="pt-2 border-t border-stone-800 text-[10px] font-mono text-amber-200/90">
          Po wzroście (3 lata): {growthToSale} → Sprzedaż • {growthToBreed} → Rozród
        </div>
      </div>

      {/* 3. SPRZEDAŻ (TYLKO STAN — ZAKONTRAKTOWANIE PRZEZ INNY BUDYNEK) */}
      <div className="bg-stone-900/90 border border-sky-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-200 flex items-center gap-1.5">
              <span>💰</span> 3. Sprzedaż
            </span>
            <span className="text-lg font-bold font-mono text-sky-300">{sale.length} szt.</span>
          </div>
          {renderHorseIcons(sale)}
        </div>
        <div className="pt-2 border-t border-stone-800 text-[10px] font-mono text-stone-400">
          Gotowe do zakontraktowania przez nabywcę (tylko stan)
        </div>
      </div>
    </div>
  );
};
