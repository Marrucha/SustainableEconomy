import React from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import { countAttachedWheatFields } from '../pastureTopology';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import {
  createDefaultFarmCapitalismState,
  CROPS_CONFIG,
  getGrainSiloCapacityKg,
  getManureBinCapacityKg,
  getStrawStackCapacityKg,
  type CropType,
} from './farmGridTypes';
import { createDefaultLivestockState } from './livestock/livestockTypes';
import { loadGameParameters } from '../admin/gameParameters';

interface FarmLivestockProductsTabProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
}

interface ProductRow {
  id: string;
  icon: string;
  name: string;
  quantityValue: number;
  capacityValue: number;
  quantityLabel: string;
  capacityLabel: string;
  qualityPercent: number;
  brand: number;
  avgBrand: number;
  unitPriceLabel: string;
}

const ProductTable: React.FC<{ title: string; badge: string; rows: ProductRow[] }> = ({
  title,
  badge,
  rows,
}) => (
  <div className="bg-stone-900/85 border border-stone-800 rounded-2xl p-3 space-y-2">
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{title}</h4>
      <span className="text-[10px] font-mono text-stone-400">{badge}</span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-stone-800">
      <table className="w-full text-left text-xs font-mono border-collapse">
        <thead>
          <tr className="bg-stone-950 text-stone-400 border-b border-stone-800 text-[11px]">
            <th className="py-1.5 px-2.5">Produkt</th>
            <th className="py-1.5 px-2.5 min-w-[155px]">Aktualna ilość</th>
            <th className="py-1.5 px-2.5">Jakość</th>
            <th className="py-1.5 px-2.5">Marka</th>
            <th className="py-1.5 px-2.5">Średnia marka</th>
            <th className="py-1.5 px-2.5">Cena jednostkowa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isZero = r.quantityValue <= 0;
            const pct =
              r.capacityValue > 0
                ? Math.min(100, Math.round((r.quantityValue / r.capacityValue) * 100))
                : 0;
            return (
              <tr key={r.id} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-950/50">
                <td className="py-1.5 px-2.5 text-amber-100 font-semibold whitespace-nowrap">
                  {r.icon} {r.name}
                </td>
                <td className="py-1.5 px-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className={`font-bold whitespace-nowrap ${isZero ? 'text-rose-400' : 'text-emerald-300'}`}>
                      {r.quantityLabel}
                    </span>
                    <span className="text-[9px] text-stone-400 whitespace-nowrap">
                      / {r.capacityLabel} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isZero ? 'bg-rose-500/60' : pct >= 85 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="py-1.5 px-2.5 text-sky-300">{r.qualityPercent}%</td>
                <td className="py-1.5 px-2.5 text-amber-200">{r.brand}/100</td>
                <td className="py-1.5 px-2.5 text-stone-300">{r.avgBrand.toFixed(1)}/100</td>
                <td className="py-1.5 px-2.5 text-amber-300 font-bold whitespace-nowrap">{r.unitPriceLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export const FarmLivestockProductsTab: React.FC<FarmLivestockProductsTabProps> = ({
  building,
  buildingState,
  allWorldBuildings,
  buildingsState,
}) => {
  const isFarm = building.typeId === 'wheat_farm';

  if (isFarm) {
    const farm = buildingState.farmCapitalism || createDefaultFarmCapitalismState();
    const farms = allWorldBuildings.filter((b) => b.typeId === 'wheat_farm');
    const activeCropId = farm.cropType || 'pszenica';
    const activeCrop = CROPS_CONFIG[activeCropId];

    const attachedFields = countAttachedWheatFields(building, allWorldBuildings);
    const siloCapKg = getGrainSiloCapacityKg(farm.siloLevel, attachedFields);
    const strawCapKg = getStrawStackCapacityKg(farm.strawLevel);
    const manureCapKg = getManureBinCapacityKg(farm.manureLevel);

    const avgGrainBrand =
      farms.length > 0
        ? farms.reduce((s, f) => s + (buildingsState[f.id]?.farmCapitalism?.grainBrandLevel ?? 0), 0) / farms.length
        : (farm.grainBrandLevel ?? 0);
    const avgStrawBrand =
      farms.length > 0
        ? farms.reduce((s, f) => s + (buildingsState[f.id]?.farmCapitalism?.strawBrandLevel ?? 0), 0) / farms.length
        : (farm.strawBrandLevel ?? 0);
    const avgManureBrand =
      farms.length > 0
        ? farms.reduce((s, f) => s + (buildingsState[f.id]?.farmCapitalism?.manureBrandLevel ?? 0), 0) / farms.length
        : (farm.manureBrandLevel ?? 0);

    const grainQuality = farm.grainQualityPercent ?? 78;
    const grainBrand = farm.grainBrandLevel ?? 0;

    const getGrainQty = (cropId: CropType): number =>
      farm.grainStockKg?.[cropId] ?? (cropId === 'pszenica' ? farm.wheatStockKg ?? 0 : 0);

    const producedRows: ProductRow[] = (['pszenica', 'zyto', 'jeczmien'] as CropType[]).map((cropId) => {
      const cfg = CROPS_CONFIG[cropId];
      const qty = getGrainQty(cropId);
      const price =
        cropId === activeCropId
          ? (farm.grainSalePricePerTon ?? cfg.marketPricePerTon)
          : cfg.marketPricePerTon;
      return {
        id: cropId,
        icon: cfg.icon,
        name: cfg.name,
        quantityValue: qty,
        capacityValue: siloCapKg,
        quantityLabel: `${qty.toLocaleString()} kg`,
        capacityLabel: `${(siloCapKg / 1000).toFixed(0)} t`,
        qualityPercent: grainQuality,
        brand: grainBrand,
        avgBrand: avgGrainBrand,
        unitPriceLabel: `£ ${price.toFixed(2)} / t`,
      };
    });

    const strawQty = farm.strawStockKg ?? 0;
    producedRows.push({
      id: 'straw',
      icon: '🌾',
      name: 'Słoma / Ściółka zbożowa',
      quantityValue: strawQty,
      capacityValue: strawCapKg,
      quantityLabel: `${strawQty.toLocaleString()} kg`,
      capacityLabel: `${(strawCapKg / 1000).toFixed(0)} t`,
      qualityPercent: farm.strawQualityPercent ?? 80,
      brand: farm.strawBrandLevel ?? 0,
      avgBrand: avgStrawBrand,
      unitPriceLabel: `£ ${(farm.strawPricePerTon ?? 60).toFixed(2)} / t`,
    });

    const activeGrainQty = getGrainQty(activeCropId);
    const manureQty = farm.manureStockKg ?? 0;
    const orderedRows: ProductRow[] = [
      {
        id: `seed_${activeCropId}`,
        icon: activeCrop.icon,
        name: `${activeCrop.name} (do siewu)`,
        quantityValue: activeGrainQty,
        capacityValue: siloCapKg,
        quantityLabel: `${activeGrainQty.toLocaleString()} kg`,
        capacityLabel: `${(siloCapKg / 1000).toFixed(0)} t`,
        qualityPercent: grainQuality,
        brand: grainBrand,
        avgBrand: avgGrainBrand,
        unitPriceLabel: `£ ${(farm.grainSalePricePerTon ?? activeCrop.marketPricePerTon).toFixed(2)} / t`,
      },
      {
        id: 'manure',
        icon: '💩',
        name: 'Obornik naturalny',
        quantityValue: manureQty,
        capacityValue: manureCapKg,
        quantityLabel: `${manureQty.toLocaleString()} kg${
          farm.manureOrder ? ` (+${farm.manureOrder.monthlyQuantityKg}/msc)` : ''
        }`,
        capacityLabel: `${(manureCapKg / 1000).toFixed(0)} t`,
        qualityPercent: farm.manureQualityPercent ?? 82,
        brand: farm.manureBrandLevel ?? 0,
        avgBrand: avgManureBrand,
        unitPriceLabel: `£ ${(farm.manurePricePer100Kg ?? 12).toFixed(2)} / 100 kg`,
      },
    ];

    return (
      <div className="space-y-3">
        <ProductTable
          title="🌾 Produkty Wytwarzane na Farmie"
          badge={`${producedRows.length} pozycji`}
          rows={producedRows}
        />
        <ProductTable
          title="🛒 Produkty Zamawiane (Zaopatrzenie)"
          badge={`${orderedRows.length} pozycji`}
          rows={orderedRows}
        />
      </div>
    );
  }

  // FERMA ZWIERZĘCA
  const ls = buildingState.livestockState || createDefaultLivestockState();
  const livestockFarms = allWorldBuildings.filter((b) => b.typeId === 'livestock_farm');
  const brand = buildingState.productBrand ?? 45;
  const avgBrand =
    livestockFarms.length > 0
      ? livestockFarms.reduce((s, f) => s + (buildingsState[f.id]?.productBrand ?? 45), 0) / livestockFarms.length
      : brand;

  const horsesForSaleCount = (ls.herd.horses || []).filter((h) => h.group === 'sale').length || (ls.herd.horsesForSale ?? 0);
  const milkQty = ls.storage.milkLiters ?? 0;
  const woolQty = ls.storage.woolKg ?? 0;
  const manureQty = ls.storage.manureKg ?? 0;
  const cattleSaleQty = ls.herd.cattleForSale ?? 4;
  const sheepSaleQty = ls.herd.sheepForSale ?? 4;

  const producedRows: ProductRow[] = [
    {
      id: 'milk',
      icon: '🥛',
      name: 'Mleko świeże',
      quantityValue: milkQty,
      capacityValue: 2000,
      quantityLabel: `${milkQty.toLocaleString()} l`,
      capacityLabel: '2 000 l',
      qualityPercent: 82,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.milkPricePer100L ?? 14).toFixed(2)} / 100 l`,
    },
    {
      id: 'wool',
      icon: '🧶',
      name: 'Wełna owcza',
      quantityValue: woolQty,
      capacityValue: 1000,
      quantityLabel: `${woolQty.toLocaleString()} kg`,
      capacityLabel: '1 000 kg',
      qualityPercent: 80,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.woolPricePer50Kg ?? 24).toFixed(2)} / 50 kg`,
    },
    {
      id: 'manure',
      icon: '💩',
      name: 'Obornik naturalny',
      quantityValue: manureQty,
      capacityValue: 2000,
      quantityLabel: `${manureQty.toLocaleString()} kg`,
      capacityLabel: '2 000 kg',
      qualityPercent: 84,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.manurePricePer100Kg ?? 12).toFixed(2)} / 100 kg`,
    },
    {
      id: 'horses',
      icon: '🐎',
      name: 'Konie (na sprzedaż)',
      quantityValue: horsesForSaleCount,
      capacityValue: 20,
      quantityLabel: `${horsesForSaleCount} szt.`,
      capacityLabel: '20 szt.',
      qualityPercent: 85,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.horseSalePrice ?? 85).toFixed(2)} / szt.`,
    },
    {
      id: 'cattle',
      icon: '🐄',
      name: 'Bydło (na sprzedaż)',
      quantityValue: cattleSaleQty,
      capacityValue: 20,
      quantityLabel: `${cattleSaleQty} szt.`,
      capacityLabel: '20 szt.',
      qualityPercent: 82,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.cattleSalePrice ?? 65).toFixed(2)} / szt.`,
    },
    {
      id: 'sheep',
      icon: '🐑',
      name: 'Owce (na sprzedaż)',
      quantityValue: sheepSaleQty,
      capacityValue: 30,
      quantityLabel: `${sheepSaleQty} szt.`,
      capacityLabel: '30 szt.',
      qualityPercent: 80,
      brand,
      avgBrand,
      unitPriceLabel: `£ ${(ls.sheepSalePrice ?? 28).toFixed(2)} / szt.`,
    },
  ];

  const feedQty = ls.supplies?.feedGrainKg ?? 0;
  const strawQty = ls.supplies?.strawBeddingKg ?? 0;
  const livestockParams = loadGameParameters();
  const feedCapKg = livestockParams.grainSiloBaseCapacityKg || 10000;
  const strawCapKg = livestockParams.strawStackBaseCapacityKg || 20000;

  const orderedRows: ProductRow[] = [
    {
      id: 'feed',
      icon: '🌾',
      name: 'Pasza zbożowa',
      quantityValue: feedQty,
      capacityValue: feedCapKg,
      quantityLabel: `${feedQty.toLocaleString()} kg${
        ls.feedOrder ? ` (+${ls.feedOrder.monthlyQuantityKg}/msc)` : ''
      }`,
      capacityLabel: `${feedCapKg.toLocaleString('pl-PL')} kg`,
      qualityPercent: 78,
      brand: 0,
      avgBrand: 0,
      unitPriceLabel: '£ 10.00 / 100 kg',
    },
    {
      id: 'straw',
      icon: '🛏️',
      name: 'Ściółka (słoma)',
      quantityValue: strawQty,
      capacityValue: strawCapKg,
      quantityLabel: `${strawQty.toLocaleString()} kg${
        ls.strawOrder ? ` (+${ls.strawOrder.monthlyQuantityKg}/msc)` : ''
      }`,
      capacityLabel: `${strawCapKg.toLocaleString('pl-PL')} kg`,
      qualityPercent: 80,
      brand: 0,
      avgBrand: 0,
      unitPriceLabel: '£ 6.00 / 100 kg',
    },
  ];

  return (
    <div className="space-y-3">
      <ProductTable
        title="🐄 Produkty Wytwarzane na Fermie"
        badge={`${producedRows.length} pozycji`}
        rows={producedRows}
      />
      <ProductTable
        title="🛒 Produkty Zamawiane (Zaopatrzenie)"
        badge={`${orderedRows.length} pozycji`}
        rows={orderedRows}
      />
    </div>
  );
};
