import React from 'react';
import type { HorseAnimal, LivestockCapitalismState } from './livestockTypes';
import { HorseRosterSection, createDefaultHorsesList } from './HorseRosterSection';

interface LivestockHerdTabProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

export const LivestockHerdTab: React.FC<LivestockHerdTabProps> = ({
  state,
  onUpdateState,
}) => {
  const herd = state.herd;
  const species = state.activeSpecies || 'cattle';
  const isCattle = species === 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';

  const horsesList: HorseAnimal[] =
    herd.horses && herd.horses.length > 0 ? herd.horses : createDefaultHorsesList();

  const handleUpdateHorses = (nextHorses: HorseAnimal[]) => {
    const adultDraftHorses = nextHorses.filter((h) => h.group === 'breeding').length;
    const growingFoalsCount = nextHorses.filter((h) => h.group === 'growth').length;
    const horsesForSale = nextHorses.filter((h) => h.group === 'sale').length;
    onUpdateState({
      herd: {
        ...herd,
        horses: nextHorses,
        adultDraftHorses,
        growingFoalsCount,
        horsesForSale,
        horsesFlockCount: nextHorses.length,
      },
    });
  };

  const speciesIcon = isCattle ? '🐄' : isSheep ? '🐑' : '🐎';
  const breedingCount = isCattle
    ? herd.milkingGroupCows
    : isSheep
    ? herd.adultSheepCount || 16
    : horsesList.filter((h) => h.group === 'breeding').length;
  const growthCount = isCattle
    ? herd.growingGroupCalves
    : isSheep
    ? herd.growingLambsCount || 6
    : horsesList.filter((h) => h.group === 'growth').length;
  const forSaleCount = isCattle
    ? herd.cattleForSale ?? 4
    : isSheep
    ? herd.sheepForSale ?? 4
    : horsesList.filter((h) => h.group === 'sale').length;

  const totalAnimals = breedingCount + growthCount + forSaleCount;
  const dailyManureRate = Math.max(2, Math.round(totalAnimals * 1.5));
  const penCap = state.penManureCapacityKg ?? 200;
  const penManureKg = Math.min(penCap, state.penManureKg ?? 0);
  const penManurePct = Math.min(100, Math.round((penManureKg / penCap) * 100));
  const isPenFull = penManurePct >= 100;

  const renderAnimalIcons = (count: number) => {
    const shown = Math.min(8, Math.max(0, count));
    const extra = count - shown;
    return (
      <div className="flex items-center flex-wrap gap-1 min-h-[26px]">
        {Array.from({ length: shown }).map((_, idx) => (
          <span key={idx} className="text-base leading-none">
            {speciesIcon}
          </span>
        ))}
        {extra > 0 && (
          <span className="text-[11px] font-mono font-bold text-stone-400 ml-1">+{extra}</span>
        )}
        {count === 0 && (
          <span className="text-[11px] font-mono text-stone-500">Brak sztuk</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ZAGRODA I OBORNIK W ZAGRODZIE */}
      <div className="bg-stone-950/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-stone-900 rounded-xl border border-stone-800">
              {speciesIcon}
            </span>
            <div>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Zagroda ({isCattle ? 'Bydło' : isSheep ? 'Owce' : 'Konie'}) • Łącznie: {totalAnimals} szt.
              </h3>
              <span className="text-[11px] font-mono text-stone-400">
                Przyrost obornika: +{dailyManureRate} kg / dzień
              </span>
            </div>
          </div>

          <div className="py-2 px-3.5 rounded-xl text-xs font-bold bg-stone-900 text-amber-300 border border-stone-800 flex items-center gap-2">
            <span>💩</span>
            <span>Obornik w zagrodzie: {penManurePct}% (auto-wywóz na hałdę przy 100%)</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isPenFull
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-amber-700 to-amber-500'
              }`}
              style={{ width: `${penManurePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-stone-400">
            <span>Stan obornika w zagrodzie: {penManureKg} / {penCap} kg</span>
            <span>Automatyczny wywóz na hałdę przy 100%</span>
          </div>
        </div>
      </div>

      {/* SEKCJE STADA: KONIE (3 SEKCJE Z INDYWIDUALNYMI IKONKAMI BRĄZ/BIAŁY), BYDŁO/OWCE (4 SEKCJE, TYLKO STAN) */}
      {isHorses ? (
        <HorseRosterSection
          horses={horsesList}
          onUpdateHorses={handleUpdateHorses}
          horseStage={state.horseStage}
          horseRecoveryMonthsRemaining={state.horseRecoveryMonthsRemaining}
          horseInseminationWaitMonths={state.horseInseminationWaitMonths}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. ROZRÓD */}
          <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <span>🧬</span> 1. Rozród
                </span>
                <span className="text-lg font-bold font-mono text-emerald-300">{breedingCount} szt.</span>
              </div>
              {renderAnimalIcons(breedingCount)}
            </div>
            <div className="pt-2 border-t border-stone-800 text-[11px] font-mono text-stone-400">
              {isCattle ? 'Krowy matki' : 'Maciorki'}
            </div>
          </div>

          {/* 2. WZROST */}
          <div className="bg-stone-900/90 border border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <span>🌱</span> 2. Wzrost
                </span>
                <span className="text-lg font-bold font-mono text-amber-300">{growthCount} szt.</span>
              </div>
              {renderAnimalIcons(growthCount)}
            </div>
            <div className="pt-2 border-t border-stone-800 text-[11px] font-mono text-stone-400">
              {isCattle ? 'Cielęta (24 msc)' : 'Jagnięta (15 msc)'}
            </div>
          </div>

          {/* 3. SPRZEDAŻ (TYLKO STAN — ZAKONTRAKTOWANIE PRZEZ NABYWCĘ) */}
          <div className="bg-stone-900/90 border border-sky-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-200 flex items-center gap-1.5">
                  <span>💰</span> 3. Sprzedaż
                </span>
                <span className="text-lg font-bold font-mono text-sky-300">{forSaleCount} szt.</span>
              </div>
              {renderAnimalIcons(forSaleCount)}
            </div>
            <div className="pt-2 border-t border-stone-800 text-[10px] font-mono text-stone-400">
              Gotowe do zakontraktowania (tylko stan)
            </div>
          </div>

          {/* 4. PRODUKCJA */}
          <div className="bg-stone-900/90 border border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <span>{isCattle ? '🥛' : '🧶'}</span> 4. Produkcja
                </span>
                <span className="text-lg font-bold font-mono text-purple-300">{breedingCount} szt.</span>
              </div>
              {renderAnimalIcons(breedingCount)}
            </div>
            <div className="pt-2 border-t border-stone-800 text-[11px] font-mono text-purple-300">
              {isCattle
                ? `Mleko: ~${Math.round(herd.milkingGroupCows * 14)} l/d`
                : `Wełna: ~${Math.round((herd.adultSheepCount || 16) * 18)} kg/r`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
