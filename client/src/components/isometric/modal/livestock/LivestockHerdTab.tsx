import React from 'react';
import {
  computeDailyManureKg,
  type HorseAnimal,
  type LivestockCapitalismState,
} from './livestockTypes';
import { HorseRosterSection } from './HorseRosterSection';
import { loadGameParameters } from '../../admin/gameParameters';
import { generateRandomEnglishName } from '../englishNames';

interface LivestockHerdTabProps {
  state: LivestockCapitalismState;
  clockDay?: number;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

export const LivestockHerdTab: React.FC<LivestockHerdTabProps> = ({
  state,
  clockDay = 1,
  onSpendGold,
  onUpdateState,
}) => {
  const herd = state.herd;
  const species = state.activeSpecies || 'cattle';
  const isCattle = species === 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';
  const isPoultry = species === 'poultry';

  const horsesList: HorseAnimal[] = herd.horses || [];

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
    ? herd.adultSheepCount || 0
    : horsesList.filter((h) => h.group === 'breeding').length;
  const growthCount = isCattle
    ? herd.growingGroupCalves
    : isSheep
    ? herd.growingLambsCount || 0
    : horsesList.filter((h) => h.group === 'growth').length;
  const forSaleCount = isCattle
    ? herd.cattleForSale ?? 4
    : isSheep
    ? herd.sheepForSale ?? 4
    : horsesList.filter((h) => h.group === 'sale').length;

  const totalAnimals = breedingCount + growthCount + forSaleCount;
  const hasStrawBedding = (state.supplies?.strawBeddingKg ?? 0) > 0;
  const dailyManureRate = hasStrawBedding ? computeDailyManureKg(species, totalAnimals) : 0;
  const perAnimalCap = loadGameParameters().manurePenCapacityKg || 1000;
  const penCap = Math.max(perAnimalCap, totalAnimals * perAnimalCap);
  const penManureKg = Math.round(Math.min(penCap, state.penManureKg ?? 0));
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

  const handleBuyHorseFromPort = (sex: 'female' | 'male', cost: number) => {
    if (onSpendGold) onSpendGold(cost);
    const newHorse: HorseAnimal = {
      id: `horse_port_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: generateRandomEnglishName(),
      sex,
      ageYears: 3.5,
      ageMonths: 42,
      vitalityPercent: 100,
      group: 'breeding',
      breedingStatus: 'waiting',
      breedingWaitMonths: 0,
      postGrowthTarget: 'breeding',
    };
    handleUpdateHorses([...horsesList, newHorse]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚢</span>
          <div>
            <h4 className="text-xs font-bold text-sky-200">
              Szybki zakup stada z Portu (Statek Handlowy)
            </h4>
            <p className="text-[10px] font-mono text-stone-400">
              {isCattle
                ? 'Dokup krowy mleczne / rozrodowe'
                : isSheep
                ? 'Dokup owce do stada'
                : 'Dokup klacze i ogiery do stada rozrodowego'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {isCattle && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(45);
                  onUpdateState({
                    herd: { ...herd, milkingGroupCows: (herd.milkingGroupCows || 0) + 1 },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Krowa (£45)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(65);
                  onUpdateState({
                    herd: { ...herd, bullsCount: (herd.bullsCount || 0) + 1 },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Buhaj (£65)
              </button>
            </>
          )}
          {isSheep && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(24);
                  const nextAdult = (herd.adultSheepCount || 0) + 2;
                  onUpdateState({
                    herd: {
                      ...herd,
                      adultSheepCount: nextAdult,
                      sheepFlockCount: nextAdult + (herd.ramsCount || 0) + (herd.growingLambsCount || 0) + (herd.sheepForSale || 0),
                    },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +2 Owce (£24)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(22);
                  const nextRams = (herd.ramsCount || 0) + 1;
                  onUpdateState({
                    herd: {
                      ...herd,
                      ramsCount: nextRams,
                      sheepFlockCount: (herd.adultSheepCount || 0) + nextRams + (herd.growingLambsCount || 0) + (herd.sheepForSale || 0),
                    },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Baran (£22)
              </button>
            </>
          )}
          {isPoultry && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(15);
                  const nextHens = (herd.adultHensCount || 0) + 5;
                  onUpdateState({
                    herd: {
                      ...herd,
                      adultHensCount: nextHens,
                      poultryFlockCount: nextHens + (herd.roostersCount || 0) + (herd.growingChicksCount || 0) + (herd.poultryForSale || 0),
                    },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +5 Kur niosek (£15)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSpendGold) onSpendGold(5);
                  const nextRoosters = (herd.roostersCount || 0) + 1;
                  onUpdateState({
                    herd: {
                      ...herd,
                      roostersCount: nextRoosters,
                      poultryFlockCount: (herd.adultHensCount || 0) + nextRoosters + (herd.growingChicksCount || 0) + (herd.poultryForSale || 0),
                    },
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Kogut (£5)
              </button>
            </>
          )}
          {isHorses && (
            <>
              <button
                type="button"
                onClick={() => handleBuyHorseFromPort('female', 85)}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Klacz (£85)
              </button>
              <button
                type="button"
                onClick={() => handleBuyHorseFromPort('male', 95)}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-[11px] font-mono font-bold cursor-pointer"
              >
                +1 Ogier (£95)
              </button>
            </>
          )}
        </div>
      </div>

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
                Przyrost obornika: +{dailyManureRate} kg / dzień (+{(dailyManureRate * 30).toLocaleString('pl-PL')} kg / msc)
                {!hasStrawBedding && totalAnimals > 0 && (
                  <span className="text-rose-400 font-bold ml-1.5">• brak ściółki</span>
                )}
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
          horsePregnancyMonths={state.horsePregnancyMonths}
          horseRecoveryMonthsRemaining={state.horseRecoveryMonthsRemaining}
          horseInseminationWaitMonths={state.horseInseminationWaitMonths}
          clockDay={clockDay}
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
                : `Wełna: ~${Math.round((herd.adultSheepCount || 0) * 18)} kg/r`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
