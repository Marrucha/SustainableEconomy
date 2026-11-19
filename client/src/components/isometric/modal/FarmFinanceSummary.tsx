import React from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import { createDefaultFarmCapitalismState, CROPS_CONFIG, getGrainSiloDailyCostPence } from './farmGridTypes';
import { computeFarmYieldSummary } from './farmYieldMath';
import { getContractMeta } from './industryContracts';

export interface FinanceContractLine {
  id: string;
  counterpartyName: string;
  goodsLabel: string;
  amountLabel: string;
  contractLabel: string;
  monthlyValueGbp: number;
}

interface FarmFinanceSummaryProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  attachedFieldsCount: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  industryBuyerLines: FinanceContractLine[];
  activeSubTab: 'summary' | 'pricelist';
  onUpdateState?: (updates: Partial<BuildingState>) => void;
}

export const FarmFinanceSummary: React.FC<FarmFinanceSummaryProps> = ({
  building,
  buildingState,
  attachedFieldsCount,
  allWorldBuildings,
  buildingsState,
  industryBuyerLines,
  activeSubTab,
  onUpdateState,
}) => {
  const farm = buildingState.farmCapitalism || createDefaultFarmCapitalismState();
  const summary = computeFarmYieldSummary(farm, attachedFieldsCount);
  const cropCfg = CROPS_CONFIG[farm.cropType || 'pszenica'];

  const grainPricePerTon = farm.grainSalePricePerTon ?? cropCfg.marketPricePerTon;
  const strawPricePerTon = farm.strawPricePerTon ?? 60;
  const manurePricePer100Kg = farm.manurePricePer100Kg ?? 12;

  const updateFarmPrice = (patch: Partial<typeof farm>) => {
    onUpdateState?.({
      farmCapitalism: {
        ...farm,
        ...patch,
      },
    });
  };

  if (activeSubTab === 'pricelist') {
    const products = [
      {
        id: 'grain',
        icon: cropCfg.icon,
        name: `Ziarno (${cropCfg.name})`,
        unit: '1 tona (1000 kg)',
        marketRef: `£ ${cropCfg.marketPricePerTon.toFixed(2)}`,
        value: grainPricePerTon,
        onChange: (val: number) => updateFarmPrice({ grainSalePricePerTon: Math.max(1, val) }),
      },
      {
        id: 'straw',
        icon: '🌾',
        name: 'Słoma / Ściółka zbożowa',
        unit: '1 tona (1000 kg)',
        marketRef: '£ 60.00',
        value: strawPricePerTon,
        onChange: (val: number) => updateFarmPrice({ strawPricePerTon: Math.max(1, val) }),
      },
      {
        id: 'manure',
        icon: '💩',
        name: 'Obornik (wycena zakupu / referencyjna)',
        unit: '100 kg',
        marketRef: '£ 12.00',
        value: manurePricePer100Kg,
        onChange: (val: number) => updateFarmPrice({ manurePricePer100Kg: Math.max(1, val) }),
      },
    ];

    return (
      <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            🏷️ Cennik Produktów Farmy Zbożowej
          </h4>
          <span className="text-[11px] font-mono text-stone-400">
            Ceny obowiązują w sprzedaży i wycenie kontraktów
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                <th className="py-2 px-3">Produkt</th>
                <th className="py-2 px-3">Jednostka</th>
                <th className="py-2 px-3">Cena rynkowa (ref.)</th>
                <th className="py-2 px-3">Twoja cena (£)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-950/50">
                  <td className="py-2 px-3 text-amber-100 font-semibold">
                    {p.icon} {p.name}
                  </td>
                  <td className="py-2 px-3 text-stone-300">{p.unit}</td>
                  <td className="py-2 px-3 text-stone-400">{p.marketRef}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">£</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={p.value}
                        onChange={(e) => p.onChange(Number(e.target.value) || 1)}
                        className="w-24 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-lg px-2 py-1 text-xs font-mono text-emerald-300 font-bold outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const annualYieldKg = summary.totalYieldKg;
  const monthlyYieldKg = Math.round(annualYieldKg / 12);
  // W realiach 1880 r. (długosłome odmiany zbóż) masa słomy przekracza masę ziarna (~135% ziarna)
  const annualStrawKg = Math.round(annualYieldKg * 1.35);
  const monthlyStrawKg = Math.round(annualStrawKg / 12);

  const salesLines: FinanceContractLine[] = [...industryBuyerLines];
  allWorldBuildings
    .filter((b) => b.typeId === 'livestock_farm')
    .forEach((b) => {
      const ls = buildingsState[b.id]?.livestockState;
      if (ls?.feedOrder?.supplierId === building.id) {
        const meta = getContractMeta(ls.feedOrder.contractType);
        const rev = Number(
          ((ls.feedOrder.monthlyQuantityKg / 1000) * grainPricePerTon * (1 - meta.discountPercent / 100)).toFixed(2)
        );
        salesLines.push({
          id: `feed_${b.id}`,
          counterpartyName: formatSupplierOrderLabel(b),
          goodsLabel: 'Pasza zbożowa',
          amountLabel: `${ls.feedOrder.monthlyQuantityKg} kg/msc`,
          contractLabel: meta.label,
          monthlyValueGbp: rev,
        });
      }
      if (ls?.strawOrder?.supplierId === building.id) {
        const meta = getContractMeta(ls.strawOrder.contractType);
        const rev = Number(
          ((ls.strawOrder.monthlyQuantityKg / 1000) * strawPricePerTon * (1 - meta.discountPercent / 100)).toFixed(2)
        );
        salesLines.push({
          id: `straw_${b.id}`,
          counterpartyName: formatSupplierOrderLabel(b),
          goodsLabel: 'Ściółka (słoma)',
          amountLabel: `${ls.strawOrder.monthlyQuantityKg} kg/msc`,
          contractLabel: meta.label,
          monthlyValueGbp: rev,
        });
      }
    });

  const totalSalesRevenue = Number(salesLines.reduce((s, l) => s + l.monthlyValueGbp, 0).toFixed(2));

  const dailyWages =
    (farm.crew || []).reduce((s, w) => s + w.wageDaily, 0) +
    (farm.agronomist?.hired ? farm.agronomist.wageDaily : 0);
  const purchaseLines: { label: string; detail: string; cost: number }[] = [
    { label: 'Kadra i Agronom', detail: '30 dni', cost: Number((dailyWages * 30).toFixed(2)) },
    {
      label: 'Utrzymanie silosu',
      detail: '30 dni',
      cost: Number(((getGrainSiloDailyCostPence(farm.siloLevel) / 100) * 30).toFixed(2)),
    },
  ];
  if (farm.seedSource === 'market') {
    purchaseLines.push({ label: 'Nasiona z rynku', detail: `${summary.seedRequiredKg} kg`, cost: 22 });
  }
  if (farm.manureOrder) {
    const mMeta = getContractMeta(farm.manureOrder.contractType);
    const mSupplier = allWorldBuildings.find((b) => b.id === farm.manureOrder?.supplierId);
    const mCost = Number(
      (
        (farm.manureOrder.monthlyQuantityKg / 100) *
        manurePricePer100Kg *
        (1 - mMeta.discountPercent / 100)
      ).toFixed(2)
    );
    purchaseLines.push({
      label: `Obornik (${mSupplier ? formatSupplierOrderLabel(mSupplier) : 'Ferma'})`,
      detail: `${farm.manureOrder.monthlyQuantityKg} kg/msc • ${mMeta.label}`,
      cost: mCost,
    });
  }
  const totalPurchasesCost = Number(purchaseLines.reduce((s, l) => s + l.cost, 0).toFixed(2));
  const monthlyNet = Number((totalSalesRevenue - totalPurchasesCost).toFixed(2));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            🌾 Produkcja ({cropCfg.name})
          </h4>
          <div className="text-xs font-mono space-y-1.5 text-stone-300">
            <div className="flex justify-between">
              <span>Ziarno / rok:</span>
              <strong className="text-amber-300">{annualYieldKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span>Ziarno / miesiąc:</span>
              <strong className="text-emerald-300">~{monthlyYieldKg} kg/msc</strong>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-stone-800">
              <span>Słoma / rok:</span>
              <strong className="text-amber-200">{annualStrawKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span>Słoma / miesiąc:</span>
              <strong className="text-emerald-300">~{monthlyStrawKg} kg/msc</strong>
            </div>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-2.5">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">📜 Sprzedaż w Kontraktach</h4>
            {salesLines.length === 0 ? (
              <div className="text-[11px] font-mono text-stone-500">Brak aktywnych kontraktów odbiorców</div>
            ) : (
              <div className="space-y-1.5 text-[11px] font-mono">
                {salesLines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-2 bg-stone-950/70 px-2.5 py-1.5 rounded-lg border border-stone-800"
                  >
                    <div className="min-w-0">
                      <div className="text-stone-200 truncate font-semibold">{line.counterpartyName}</div>
                      <div className="text-[10px] text-stone-400">
                        {line.goodsLabel} • {line.amountLabel} • {line.contractLabel}
                      </div>
                    </div>
                    <strong className="text-emerald-300 shrink-0">£ {line.monthlyValueGbp.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs font-mono pt-2 border-t border-stone-800">
            <span className="text-stone-300 font-bold">Podsumowanie sprzedaży:</span>
            <strong className="text-emerald-400">£ {totalSalesRevenue.toFixed(2)} / msc</strong>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-2.5">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">💸 Zakupy i Koszty (Miesiąc)</h4>
            <div className="space-y-1.5 text-[11px] font-mono">
              {purchaseLines.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-stone-950/70 px-2.5 py-1.5 rounded-lg border border-stone-800"
                >
                  <div>
                    <div className="text-stone-200 font-semibold">{p.label}</div>
                    <div className="text-[10px] text-stone-400">{p.detail}</div>
                  </div>
                  <strong className="text-rose-300 shrink-0">£ {p.cost.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1 pt-2 border-t border-stone-800 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-300 font-bold">Podsumowanie kosztów:</span>
              <strong className="text-rose-400">£ {totalPurchasesCost.toFixed(2)} / msc</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Bilans miesięczny:</span>
              <strong className={monthlyNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                £ {monthlyNet.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
