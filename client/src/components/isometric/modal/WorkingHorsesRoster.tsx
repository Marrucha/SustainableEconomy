import React from 'react';
import type { HorseAnimal } from './livestock/livestockTypes';
import {
  WORKING_HORSE_MAX_AGE_YEARS,
  getHorseVitalityPercent,
  getSingleHorseCapacityHa,
} from './horseEnergyMath';

interface WorkingHorsesRosterProps {
  horses: HorseAnimal[];
  perHorseHa: number;
}

export const WorkingHorsesRoster: React.FC<WorkingHorsesRosterProps> = ({
  horses,
  perHorseHa,
}) => {
  if (!horses || horses.length === 0) return null;

  return (
    <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-700/70 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-300">
        <span>🐎 Konie robocze ({horses.filter((h) => !h.isDeceased).length} szt.)</span>
        <span className="text-[10px] font-normal text-stone-400">
          Obwódka: wiek (0–{WORKING_HORSE_MAX_AGE_YEARS} lat) · Słupek: kondycja (0–100%)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {horses.map((h) => {
          const vitality = getHorseVitalityPercent(h);
          const capacityHa = getSingleHorseCapacityHa(h, perHorseHa);
          const agePct = Math.min(
            100,
            Math.max(6, Math.round((h.ageYears / WORKING_HORSE_MAX_AGE_YEARS) * 100))
          );
          const ringColor = h.isDeceased ? '#44403c' : '#ef4444';
          const barColor =
            vitality >= 75
              ? 'bg-emerald-400'
              : vitality >= 40
              ? 'bg-amber-400'
              : 'bg-rose-500';

          return (
            <div
              key={h.id}
              title={
                h.isDeceased
                  ? `${h.name} · Odszedł (${h.ageYears} lat)`
                  : `${h.name} · Wiek: ${h.ageYears}/${WORKING_HORSE_MAX_AGE_YEARS} lat · Kondycja: ${vitality}% · Obsługuje: ${capacityHa} / ${perHorseHa} ha`
              }
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800"
            >
              {/* Ikona konia roboczego z szarym tłem i obwódką wieku (conic-gradient) */}
              <div
                className="p-[2.5px] rounded-xl transition-all shrink-0"
                style={{
                  background: h.isDeceased
                    ? '#44403c'
                    : `conic-gradient(${ringColor} ${agePct}%, #292524 ${agePct}% 100%)`,
                }}
              >
                <div
                  className={`w-8 h-8 rounded-[10px] border text-lg flex items-center justify-center ${
                    h.isDeceased
                      ? 'bg-stone-800 border-stone-700 grayscale opacity-60'
                      : 'bg-stone-500 border-stone-300 text-stone-100'
                  }`}
                >
                  {h.isDeceased ? '🪦' : '🐎'}
                </div>
              </div>

              {/* Słupek kondycji (0-100%) obok ikonki konia */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-8 bg-stone-800 rounded-full overflow-hidden border border-stone-700 flex flex-col justify-end"
                  aria-label={`Kondycja ${vitality}%`}
                >
                  <div
                    className={`w-full transition-all ${barColor}`}
                    style={{ height: `${vitality}%` }}
                  />
                </div>
                <div className="flex flex-col leading-tight text-[10px] font-mono">
                  <span
                    className={`font-bold ${
                      h.isDeceased
                        ? 'text-stone-500'
                        : vitality >= 75
                        ? 'text-emerald-300'
                        : vitality >= 40
                        ? 'text-amber-300'
                        : 'text-rose-400'
                    }`}
                  >
                    {vitality}%
                  </span>
                  <span className="text-stone-400">
                    {capacityHa.toFixed(1)} ha
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
