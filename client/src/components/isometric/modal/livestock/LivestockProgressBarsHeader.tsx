import React from 'react';
import type { LivestockCapitalismState } from './livestockTypes';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { MONTH_NAMES } from '../../clock/gameClockTypes';

interface LivestockProgressBarsHeaderProps {
  state: LivestockCapitalismState;
  clock?: UseGameClockReturn;
}

export const LivestockProgressBarsHeader: React.FC<LivestockProgressBarsHeaderProps> = ({
  state,
  clock,
}) => {
  const species = state.activeSpecies || 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';
  const reproMax = isSheep ? 5 : isHorses ? 11 : 9;
  const growthMax = isSheep ? 15 : isHorses ? 36 : 24;

  const totalDays = clock
    ? (clock.date.year - 1880) * 360 + (clock.date.month - 1) * 30 + clock.date.day
    : 105;

  const currentMonthName = clock
    ? MONTH_NAMES[clock.date.month - 1]
    : 'Kwiecień';

  const hasCrew = state.crew.length > 0;

  const reproMaxDays = reproMax * 30;
  const reproDaysPassed = hasCrew ? (totalDays % reproMaxDays) || reproMaxDays : 0;
  const reproPassed = hasCrew ? Math.floor(reproDaysPassed / 30) : 0;
  const reproPct = hasCrew ? Math.min(100, Math.round((reproDaysPassed / reproMaxDays) * 100)) : 0;

  const growthMaxDays = growthMax * 30;
  const growthDaysPassed = hasCrew ? (totalDays % growthMaxDays) || growthMaxDays : 0;
  const growthPassed = hasCrew ? Math.floor(growthDaysPassed / 30) : 0;
  const growthPct = hasCrew ? Math.min(100, Math.round((growthDaysPassed / growthMaxDays) * 100)) : 0;

  // Szacunki bieżącej produkcji (0 przy braku załogi)
  const dailyMilk = hasCrew ? Math.round(state.herd.milkingGroupCows * 14) : 0;
  const dailyManure = hasCrew ? Math.round(state.herd.milkingGroupCows * 24) : 0;
  const annualWool = hasCrew ? Math.round((state.herd.adultSheepCount || 16) * 18) : 0;
  const adultHorses = state.herd.adultDraftHorses ?? 10;
  const dailyHorseManure = hasCrew ? Math.round(adultHorses * 20) : 0;

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">
            {isSheep ? '🐑' : isHorses ? '🐎' : '🐄'}
          </span>
          <div>
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">
              Zegar Biologiczny Fermy • Kalendarz 1880 r.
            </span>
            <h4 className="text-xs font-bold text-amber-100 flex items-center gap-2">
              <span>{isSheep ? 'Owce (Jarki & Maciorki)' : isHorses ? 'Konie Robocze & Źrebaki' : 'Bydło Mleczne & Cielęta'}</span>
              <span className="text-stone-400 font-normal font-mono">• {currentMonthName}</span>
            </h4>
          </div>
        </div>

        {/* WSKAŹNIKI PRODUKCJI DZIENNEJ I ROCZNEJ */}
        <div className="flex items-center gap-3 bg-stone-950/80 px-3.5 py-1.5 rounded-xl border border-stone-800">
          {isHorses ? (
            <>
              <div className="text-center">
                <span className="text-[10px] text-stone-400 block font-mono">🐎 Konie robocze:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">{adultHorses} szt.</span>
              </div>
              <div className="w-px h-6 bg-stone-800" />
              <div className="text-center">
                <span className="text-[10px] text-stone-400 block font-mono">💩 Obornik koński:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">{dailyHorseManure} kg/d</span>
              </div>
            </>
          ) : !isSheep ? (
            <>
              <div className="text-center">
                <span className="text-[10px] text-stone-400 block font-mono">🥛 Mleko dzienne:</span>
                <span className="text-xs font-bold text-sky-400 font-mono">{dailyMilk} l/d</span>
              </div>
              <div className="w-px h-6 bg-stone-800" />
              <div className="text-center">
                <span className="text-[10px] text-stone-400 block font-mono">💩 Nawóz (Obornik):</span>
                <span className="text-xs font-bold text-amber-300 font-mono">{dailyManure} kg/d</span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <span className="text-[10px] text-stone-400 block font-mono">🧶 Wełna (2 strzyżenia/r):</span>
              <span className="text-xs font-bold text-pink-400 font-mono">{annualWool} kg/rok</span>
            </div>
          )}
        </div>
      </div>

      {/* DWA PASKI POSTĘPU: CIĄŻA (ZIELONY) ORAZ WZROST (ŻÓŁTY) — ukryte dla koni (indywidualne na stadzie) */}
      {!isHorses && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {/* 1. PASEK CIĄŻY / ROZRÓD - ZIELONY */}
        <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>🟢</span> Ciąża / Rozród:
            </span>
            <span className="text-stone-200 font-bold">
              {reproPassed} / {reproMax} msc <span className="text-emerald-400 font-normal">({reproPct}%)</span>
            </span>
          </div>
          <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${reproPct}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">
            {isSheep ? 'Ciąża owcy trwa 5 miesięcy' : isHorses ? 'Ciąża klaczy trwa 11 miesięcy' : 'Ciąża krowy trwa 9 miesięcy (laktacja 6 msc)'}
          </span>
        </div>

        {/* 2. PASEK WZROSTU - ŻÓŁTY */}
        <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-yellow-400 font-bold flex items-center gap-1.5">
              <span>🟡</span> Wzrost Młodych:
            </span>
            <span className="text-stone-200 font-bold">
              {growthPassed} / {growthMax} msc <span className="text-yellow-400 font-normal">({growthPct}%)</span>
            </span>
          </div>
          <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
            <div
              className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${growthPct}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">
            {isSheep ? 'Wzrost jagnięcia do maciorki trwa 15 miesięcy' : 'Odchów cielaka trwa 24 miesiące (2 lata)'}
          </span>
        </div>
      </div>
      )}
    </div>
  );
};
