import React from 'react';
import type { BuildingState } from '../../types';
import {
  createDefaultMillState,
  MILL_PRODUCTS_CONFIG,
  type MillCapitalismState,
} from './millTypes';

interface MillProductsTabProps {
  buildingState: BuildingState;
}

interface MillProductRow {
  id: string;
  icon: string;
  name: string;
  role: 'Produkcja' | 'Zamawiany surowiec';
  qtyKg: number;
  capacityKg: number;
  qualityPct: number;
  avgQualityPct: number;
  unitPriceLabel: string;
}

export const MillProductsTab: React.FC<MillProductsTabProps> = ({ buildingState }) => {
  const mill: MillCapitalismState = buildingState.millState || createDefaultMillState();
  const productCfg = MILL_PRODUCTS_CONFIG[mill.productTarget] || MILL_PRODUCTS_CONFIG.maka_pszenna;

  const rows: MillProductRow[] = [
    {
      id: mill.productTarget,
      icon: productCfg.icon,
      name: productCfg.label,
      role: 'Produkcja',
      qtyKg: mill.flourStockKg,
      capacityKg: mill.flourCapacityKg,
      qualityPct: mill.flourQualityPercent,
      avgQualityPct: mill.flourQualityPercent,
      unitPriceLabel: `£${mill.flourPricePerKg.toFixed(2)} / kg`,
    },
    {
      id: 'otreby',
      icon: '🥣',
      name: 'Otręby Paszowe',
      role: 'Produkcja',
      qtyKg: mill.branStockKg,
      capacityKg: mill.branCapacityKg,
      qualityPct: 80,
      avgQualityPct: 80,
      unitPriceLabel: `£${mill.branPricePerKg.toFixed(2)} / kg`,
    },
    {
      id: 'zboze_input',
      icon: '🌾',
      name: productCfg.requiredGrainLabel,
      role: 'Zamawiany surowiec',
      qtyKg: mill.grainStockKg,
      capacityKg: mill.grainCapacityKg,
      qualityPct: 85,
      avgQualityPct: 85,
      unitPriceLabel: '£0.35 / kg (baz.)',
    },
  ];

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
          <span>📦</span> Produkty i Surowce Młyna Parowego
        </h3>
        <span className="text-[11px] font-mono text-stone-400">
          Profil: {productCfg.label}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-950/90 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Produkt / Surowiec</th>
              <th className="py-2 px-3">Kategoria</th>
              <th className="py-2 px-3">Stan magazynowy</th>
              <th className="py-2 px-3">Pojemność</th>
              <th className="py-2 px-3">Jakość / Śr.</th>
              <th className="py-2 px-3 text-right">Cena jedn.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80 bg-stone-900/60">
            {rows.map((r) => {
              const pct = Math.min(100, Math.round((r.qtyKg / Math.max(1, r.capacityKg)) * 100));
              const isEmpty = r.qtyKg <= 0;
              return (
                <tr key={r.id} className="hover:bg-stone-800/40">
                  <td className="py-2.5 px-3 font-bold text-stone-100">
                    <span className="mr-1.5">{r.icon}</span>
                    {r.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.role === 'Produkcja'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={isEmpty ? 'text-rose-400' : 'text-emerald-300'}>
                      {r.qtyKg.toLocaleString('pl-PL')} kg
                    </span>
                  </td>
                  <td className="py-2.5 px-3 min-w-[140px]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                      <span>{pct}%</span>
                      <span>{r.capacityKg.toLocaleString('pl-PL')} kg</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className={`h-full ${isEmpty ? 'bg-rose-500/50' : 'bg-amber-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-200">
                    {r.qualityPct}% <span className="text-stone-500">/ {r.avgQualityPct}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                    {r.unitPriceLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
