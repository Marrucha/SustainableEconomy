import React, { useState } from 'react';

interface FinanceMonthlyChartProps {
  mode?: 'monthly' | 'annual';
  monthlyRevenue: number;
  monthlyWages: number;
  monthlySupply: number;
  monthlyRent: number;
}

type CostFilter = 'all' | 'wages' | 'supply' | 'rent';

const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const YEARS = ['1880', '1881', '1882', '1883', '1884'];
// Lekka sezonowość wiktoriańska (popyt rośnie w okresie żniw i przed zimą)
const SEASONAL_REV = [0.88, 0.9, 0.95, 1.0, 1.04, 1.06, 1.08, 1.12, 1.05, 1.02, 0.96, 1.04];

export const FinanceMonthlyChart: React.FC<FinanceMonthlyChartProps> = ({
  mode = 'monthly',
  monthlyRevenue,
  monthlyWages,
  monthlySupply,
  monthlyRent,
}) => {
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [showRevenue, setShowRevenue] = useState(true);

  const isAnnual = mode === 'annual';
  const labels = isAnnual ? YEARS : MONTHS;
  const multiplier = isAnnual ? 12 : 1;

  const data = labels.map((label, idx) => {
    const factor = isAnnual ? 0.95 + idx * 0.04 : SEASONAL_REV[idx];
    const rev = Math.round(monthlyRevenue * multiplier * factor);
    const wages = monthlyWages * multiplier;
    const supply = Math.round(monthlySupply * multiplier * (0.94 + (idx % 3) * 0.04));
    const rent = monthlyRent * multiplier;
    const activeCost =
      costFilter === 'wages'
        ? wages
        : costFilter === 'supply'
        ? supply
        : costFilter === 'rent'
        ? rent
        : wages + supply + rent;
    return { label, rev, wages, supply, rent, activeCost };
  });

  const maxVal = Math.max(
    100,
    ...data.map((d) => Math.max(showRevenue ? d.rev : 0, d.activeCost))
  );

  return (
    <div className="p-4 rounded-2xl bg-stone-950/75 border border-stone-800 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
            {isAnnual
              ? '🌾 Wykres Roczny (Cykl Rolniczy 5 lat): Przychody vs Koszty'
              : '📊 Wykres Miesięczny: Przychody vs Koszty (12 mies.)'}
          </h4>
          <p className="text-[10px] text-stone-400">
            {isAnnual
              ? 'Rolnictwo rozliczane jest w cyklu rocznym — filtruj koszty na wynagrodzenia, surowce i utrzymanie.'
              : 'Filtruj koszty na wynagrodzenia, zakup surowców i czynsz / utrzymanie.'}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-wrap text-[10px]">
          <button
            type="button"
            onClick={() => setShowRevenue((p) => !p)}
            className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer ${
              showRevenue
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
          >
            📈 Przychody
          </button>
          {(
            [
              { id: 'all', label: 'Wszystkie koszty' },
              { id: 'wages', label: '👷 Wynagrodzenia' },
              { id: 'supply', label: '📦 Surowce' },
              { id: 'rent', label: '🏠 Czynsz' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCostFilter(tab.id)}
              className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer ${
                costFilter === tab.id
                  ? 'bg-amber-500/25 border-amber-400 text-amber-100'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Słupki 12 miesięcy */}
      <div className="h-44 flex items-end justify-between gap-1.5 pt-4 pb-1 px-1 border-b border-stone-800">
        {data.map((d) => {
          const revPct = Math.round((d.rev / maxVal) * 100);
          const wagesPct = Math.round((d.wages / maxVal) * 100);
          const supplyPct = Math.round((d.supply / maxVal) * 100);
          const rentPct = Math.round((d.rent / maxVal) * 100);

          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-0.5 h-36">
                {showRevenue && (
                  <div
                    title={`${d.label} — Przychód: £${d.rev.toLocaleString('en-US')}`}
                    style={{ height: `${Math.max(2, revPct)}%` }}
                    className="w-2.5 sm:w-3 rounded-t bg-emerald-500/85 group-hover:bg-emerald-400 transition-all"
                  />
                )}

                {costFilter === 'all' ? (
                  <div
                    title={`${d.label} — Koszty: £${d.activeCost.toLocaleString('en-US')} (Płace: £${d.wages}, Surowce: £${d.supply}, Czynsz: £${d.rent})`}
                    className="w-2.5 sm:w-3 flex flex-col-reverse justify-start rounded-t overflow-hidden"
                    style={{ height: `${Math.max(2, wagesPct + supplyPct + rentPct)}%` }}
                  >
                    {d.wages > 0 && (
                      <div
                        style={{
                          height: `${Math.round((d.wages / Math.max(1, d.activeCost)) * 100)}%`,
                        }}
                        className="w-full bg-rose-500/90"
                      />
                    )}
                    {d.supply > 0 && (
                      <div
                        style={{
                          height: `${Math.round((d.supply / Math.max(1, d.activeCost)) * 100)}%`,
                        }}
                        className="w-full bg-amber-500/90"
                      />
                    )}
                    {d.rent > 0 && (
                      <div
                        style={{
                          height: `${Math.round((d.rent / Math.max(1, d.activeCost)) * 100)}%`,
                        }}
                        className="w-full bg-sky-500/90"
                      />
                    )}
                  </div>
                ) : (
                  <div
                    title={`${d.label} — Wybrany koszt: £${d.activeCost.toLocaleString('en-US')}`}
                    style={{
                      height: `${Math.max(
                        2,
                        costFilter === 'wages' ? wagesPct : costFilter === 'supply' ? supplyPct : rentPct
                      )}%`,
                    }}
                    className={`w-2.5 sm:w-3 rounded-t transition-all ${
                      costFilter === 'wages'
                        ? 'bg-rose-500/90'
                        : costFilter === 'supply'
                        ? 'bg-amber-500/90'
                        : 'bg-sky-500/90'
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] text-stone-400 font-mono">{d.label}</span>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] text-stone-300">
        {showRevenue && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Przychody
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Wynagrodzenia (£{(monthlyWages * multiplier).toLocaleString('en-US')}/{isAnnual ? 'r' : 'm'})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Zakup surowców (£{(monthlySupply * multiplier).toLocaleString('en-US')}/{isAnnual ? 'r' : 'm'})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> Czynsz / Utrzymanie (£{(monthlyRent * multiplier).toLocaleString('en-US')}/{isAnnual ? 'r' : 'm'})
        </span>
      </div>
    </div>
  );
};
