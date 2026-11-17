import React from 'react';
import type { BuildingState } from '../types';
import { BASE_UNIT_MARKET_PRICE } from './industryContracts';

interface ProductInventoryCardProps {
  productName: string;
  buildingName: string;
  buildingState: BuildingState;
  monthlyCapacityUnits: number;
  sellerActive: boolean;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const ProductInventoryCard: React.FC<ProductInventoryCardProps> = ({
  productName,
  buildingName,
  buildingState,
  monthlyCapacityUnits,
  sellerActive,
  onUpdateState,
}) => {
  const stockUnits = buildingState.productStockUnits ?? 0;
  const price = buildingState.productPrice ?? BASE_UNIT_MARKET_PRICE;

  const expBonus = buildingState.workerExperienceYears ?? 0;
  const schoolBonus = (buildingState.workerSchoolCoursesCompleted ?? 0) * 5;
  const quality = Math.min(100, buildingState.productQuality ?? Math.min(100, 70 + expBonus + schoolBonus));
  const brand = Math.min(100, buildingState.productBrand ?? 45);

  return (
    <div className="p-3.5 rounded-2xl bg-stone-900/75 border border-stone-700/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>📋</span> Karta Produktu — {productName}
        </h4>
        <span className="text-[10px] font-mono text-stone-400">
          Wydajność: <strong className="text-emerald-300">{monthlyCapacityUnits.toLocaleString()}</strong> jedn./mies.
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* 1. Ilość w magazynie */}
        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400">Ilość w magazynie</p>
          <p className="font-mono font-bold text-emerald-300 mt-0.5">
            {stockUnits.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">jedn.</span>
          </p>
        </div>

        {/* 2. Cena ustalana przez Sprzedawcę */}
        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Cena (£/jedn.)</span>
            {!sellerActive && <span className="text-[9px] text-amber-400">Brak sprzed.</span>}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              disabled={!sellerActive}
              value={price}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!Number.isNaN(val) && val > 0) {
                  onUpdateState({ productPrice: Math.round(val * 100) / 100 });
                }
              }}
              className="w-16 bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 font-mono font-bold text-amber-200 text-xs disabled:opacity-50"
            />
            <span className="text-[10px] text-stone-400">£</span>
          </div>
        </div>

        {/* 3. Jakość */}
        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400">Jakość produktu</p>
          <p className="font-mono font-bold text-sky-300 mt-0.5">
            {quality}% <span className="text-[10px] font-normal text-stone-400">({quality >= 85 ? 'Premium' : quality >= 65 ? 'Dobra' : 'Standard'})</span>
          </p>
        </div>

        {/* 4. Marka */}
        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400">Marka zakładu</p>
          <p className="font-mono font-bold text-amber-200 mt-0.5 truncate" title={buildingName}>
            {brand}/100 <span className="text-[10px] font-normal text-stone-400">pkt</span>
          </p>
        </div>
      </div>
    </div>
  );
};
