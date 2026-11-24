import React from 'react';
import type {
  BuildingState,
  MarketStallCrewMember,
  MarketStallSeller,
  MarketStallSupplySlot,
} from '../types';
import { ALL_MARKET_GOODS, type MarketGoodOption } from './marketplaceGoods';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import {
  computeProductPurchasePrice,
  estimateProductMonthlyDemand,
  resolveRetailPrice,
  type CityDemographics,
} from './marketDemandMath';

interface MarketStallFinanceTabProps {
  traderCrew: MarketStallCrewMember[];
  sellers: MarketStallSeller[];
  supplySlots: MarketStallSupplySlot[];
  securedGoods: MarketGoodOption[];
  monthlyRentCost: number;
  demographics: CityDemographics;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
}

export const MarketStallFinanceTab: React.FC<MarketStallFinanceTabProps> = ({
  traderCrew,
  sellers,
  supplySlots,
  securedGoods,
  monthlyRentCost,
  demographics,
  allWorldBuildings,
  buildingsState,
}) => {
  const productRows =
    sellers.length > 0
      ? sellers.map((sel) => {
          const good = ALL_MARKET_GOODS.find((g) => g.id === sel.productId);
          const matchingSupply = supplySlots.find((s) => s.productId === sel.productId);
          const retailPrice = resolveRetailPrice(sel.retailPrice, good?.defaultPrice);
          const purchasePrice = computeProductPurchasePrice(
            sel.productId,
            good?.defaultPrice ?? retailPrice,
            matchingSupply?.supplierBuildingId,
            matchingSupply?.contractType,
            allWorldBuildings,
            buildingsState
          );
          const demand = estimateProductMonthlyDemand(
            sel.productId,
            demographics,
            retailPrice,
            good?.defaultPrice
          );
          const monthlyVolume = demand.monthlyVolume;
          const monthlyRevenue = Number((retailPrice * monthlyVolume).toFixed(2));
          const monthlySupplyCost = Number((purchasePrice * monthlyVolume).toFixed(2));
          const monthlyMargin = Number((monthlyRevenue - monthlySupplyCost).toFixed(2));
          return {
            key: `${sel.sellerIndex}_${sel.productId}`,
            good,
            productId: sel.productId,
            tierLabel: demand.tierLabel,
            traderLabel: sel.traderName
              ? `Handlarz: ${sel.traderName}`
              : `Sprzedawca #${sel.sellerIndex}`,
            retailPrice,
            monthlyVolume,
            monthlyRevenue,
            monthlySupplyCost,
            monthlyMargin,
          };
        })
      : traderCrew
          .map((w, idx) => {
            const prodId =
              w.assignedProductId &&
              securedGoods.some((g) => g.id === w.assignedProductId)
                ? w.assignedProductId
                : securedGoods[idx]?.id || securedGoods[0]?.id || '';
            if (!prodId) return null;
            const good = ALL_MARKET_GOODS.find((g) => g.id === prodId);
            const matchingSupply = supplySlots.find((s) => s.productId === prodId);
            const retailPrice = resolveRetailPrice(undefined, good?.defaultPrice);
            const purchasePrice = computeProductPurchasePrice(
              prodId,
              good?.defaultPrice ?? retailPrice,
              matchingSupply?.supplierBuildingId,
              matchingSupply?.contractType,
              allWorldBuildings,
              buildingsState
            );
            const demand = estimateProductMonthlyDemand(
              prodId,
              demographics,
              retailPrice,
              good?.defaultPrice
            );
            const monthlyVolume = demand.monthlyVolume;
            const monthlyRevenue = Number((retailPrice * monthlyVolume).toFixed(2));
            const monthlySupplyCost = Number((purchasePrice * monthlyVolume).toFixed(2));
            const monthlyMargin = Number((monthlyRevenue - monthlySupplyCost).toFixed(2));
            return {
              key: w.id,
              good,
              productId: prodId,
              tierLabel: demand.tierLabel,
              traderLabel: `Handlarz #${idx + 1}: ${w.name}`,
              retailPrice,
              monthlyVolume,
              monthlyRevenue,
              monthlySupplyCost,
              monthlyMargin,
            };
          })
          .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const totalRevenue = Number(
    productRows.reduce((sum, r) => sum + r.monthlyRevenue, 0).toFixed(2)
  );
  const totalSupplyCost = Number(
    productRows.reduce((sum, r) => sum + r.monthlySupplyCost, 0).toFixed(2)
  );
  const totalNet = Number((totalRevenue - totalSupplyCost - monthlyRentCost).toFixed(2));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-stone-950/85 border border-emerald-500/30 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Szac. przychód / msc</p>
          <p className="text-lg font-mono font-bold text-emerald-300 mt-1">
            +£{totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-rose-500/30 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Szac. zakup towaru / msc</p>
          <p className="text-lg font-mono font-bold text-rose-300 mt-1">
            -£{totalSupplyCost.toFixed(2)}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-rose-500/30 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Dzierżawa stoiska / msc</p>
          <p className="text-lg font-mono font-bold text-rose-300 mt-1">
            -£{monthlyRentCost.toFixed(2)}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-amber-500/40 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Wynik netto / msc</p>
          <p
            className={`text-lg font-mono font-bold mt-1 ${
              totalNet >= 0 ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {totalNet >= 0 ? '+' : ''}£{totalNet.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-stone-950/85 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            🧾 Rozbicie sprzedaży na produkty ({productRows.length})
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            Popyt miasta ({demographics.totalPersons} os.: 👑{demographics.elitePersons} • 💼{demographics.middlePersons} • 🔨{demographics.workerPersons})
          </span>
        </div>

        {productRows.length === 0 ? (
          <p className="text-xs text-stone-400 italic">
            Brak aktywnych produktów w sprzedaży. Przypisz towary i handlarzy w Procesie Sprzedaży.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-[10px] uppercase text-stone-400">
                  <th className="py-1.5 pr-2">Produkt</th>
                  <th className="py-1.5 px-2">Handlarz</th>
                  <th className="py-1.5 px-2 text-right">Cena det.</th>
                  <th className="py-1.5 px-2 text-right">Wolumen/msc</th>
                  <th className="py-1.5 px-2 text-right">Przychód</th>
                  <th className="py-1.5 px-2 text-right">Koszt zakupu</th>
                  <th className="py-1.5 pl-2 text-right">Marża</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/70 font-mono">
                {productRows.map((row) => (
                  <tr key={row.key} className="hover:bg-stone-900/60">
                    <td className="py-2 pr-2 font-sans font-bold text-stone-100">
                      <div>{row.good?.icon || '📦'} {row.good?.label || row.productId}</div>
                      <div className="text-[9px] font-normal text-stone-400">{row.tierLabel}</div>
                    </td>
                    <td className="py-2 px-2 font-sans text-[11px] text-stone-300">
                      {row.traderLabel}
                    </td>
                    <td className="py-2 px-2 text-right text-stone-200">
                      £{row.retailPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-stone-300">
                      {row.monthlyVolume} szt.
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-300 font-bold">
                      +£{row.monthlyRevenue.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-rose-300">
                      -£{row.monthlySupplyCost.toFixed(2)}
                    </td>
                    <td className={`py-2 pl-2 text-right font-bold ${row.monthlyMargin >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                      {row.monthlyMargin >= 0 ? '+' : ''}£{row.monthlyMargin.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-500/40 bg-stone-900/90 font-mono font-bold">
                  <td className="py-2 pr-2 font-sans text-amber-300" colSpan={3}>
                    SUMA (wszystkie produkty: {productRows.length})
                  </td>
                  <td className="py-2 px-2 text-right text-stone-200">
                    {productRows.reduce((s, r) => s + r.monthlyVolume, 0)} szt.
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-300">
                    +£{totalRevenue.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-rose-300">
                    -£{totalSupplyCost.toFixed(2)}
                  </td>
                  <td className="py-2 pl-2 text-right text-amber-300">
                    +£{(totalRevenue - totalSupplyCost).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
