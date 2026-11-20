import React from 'react';
import type { BuildingState } from '../types';
import { CROPS_CONFIG, createDefaultFarmCapitalismState, type CropType } from './farmGridTypes';
import { computeFarmYieldSummary } from './farmYieldMath';

interface FarmAnnualYieldChartProps {
  buildingState: BuildingState;
  attachedFieldsCount: number;
}

export const FarmAnnualYieldChart: React.FC<FarmAnnualYieldChartProps> = ({
  buildingState,
  attachedFieldsCount,
}) => {
  const farm = buildingState.farmCapitalism || createDefaultFarmCapitalismState();
  const ownedHorsesCount = buildingState.ownedHorses?.length ?? 0;
  const summary = computeFarmYieldSummary(
    farm,
    attachedFieldsCount,
    false,
    ownedHorsesCount,
  );
  const activeCrop: CropType = farm.cropType || 'pszenica';
  const history = farm.annualYieldHistory || [];

  const entries = [
    ...history,
    ...(history.length === 0 && farm.lastCycleYieldKg > 0
      ? [{
          year: farm.lastHarvestYear ?? 1880,
          cropType: activeCrop,
          yieldKg: farm.lastCycleYieldKg,
          hectares: summary.totalHectares,
        }]
      : []),
    {
      year: (history[history.length - 1]?.year ?? farm.lastHarvestYear ?? 1880) + 1,
      cropType: activeCrop,
      yieldKg: summary.totalYieldKg,
      hectares: summary.totalHectares,
      isForecast: true,
    },
  ];

  const maxYield = Math.max(1000, ...entries.map((e) => e.yieldKg));

  return (
    <div className="space-y-4">
      <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span>📈</span> Plony Roczne Farmy Zbożowej
            </h4>
            <p className="text-[11px] text-stone-400">
              Zebrane plony w kolejnych latach oraz prognoza bieżącego cyklu ({summary.totalHectares} ha)
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-stone-400">Prognoza cyklu: </span>
            <strong className="text-emerald-300">{(summary.totalYieldKg / 1000).toFixed(2)} t</strong>
            <span className="text-stone-500"> ({summary.totalYieldKg.toLocaleString('pl-PL')} kg)</span>
          </div>
        </div>

        <div className="flex items-end gap-3 h-52 pt-6 pb-2 px-2 bg-stone-950/80 rounded-xl border border-stone-800 overflow-x-auto">
          {entries.map((item, idx) => {
            const pct = Math.max(6, Math.round((item.yieldKg / maxYield) * 100));
            const crop = CROPS_CONFIG[item.cropType] || CROPS_CONFIG.pszenica;
            const isForecast = 'isForecast' in item && item.isForecast;
            const perHa = item.hectares > 0 ? (item.yieldKg / 1000 / item.hectares).toFixed(2) : '0.00';

            return (
              <div
                key={`${item.year}_${idx}`}
                className="flex-1 min-w-[64px] h-full flex flex-col items-center justify-end gap-1"
              >
                <span className="text-[10px] font-mono font-bold text-amber-200 whitespace-nowrap">
                  {(item.yieldKg / 1000).toFixed(1)} t
                </span>
                <div className="w-full max-w-[44px] flex-1 flex items-end">
                  <div
                    title={`${item.year} r. (${crop.name}): ${item.yieldKg.toLocaleString('pl-PL')} kg (${perHa} t/ha)`}
                    className={`w-full rounded-t-lg transition-all duration-300 border ${
                      isForecast
                        ? 'bg-gradient-to-t from-amber-600/60 to-amber-400/70 border-amber-400/80 border-dashed'
                        : 'bg-gradient-to-t from-emerald-700 to-emerald-400 border-emerald-300/60'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <div className="text-center leading-tight pt-1">
                  <span className="text-[11px] font-mono font-bold text-stone-200 block">
                    {crop.icon} {item.year}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 block">
                    {isForecast ? 'prognoza' : `${perHa} t/ha`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
