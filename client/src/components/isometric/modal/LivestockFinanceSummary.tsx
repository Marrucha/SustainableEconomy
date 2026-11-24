import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import { computeDailyManureKg, createDefaultLivestockState } from './livestock/livestockTypes';
import { createDefaultHorsesList } from './livestock/HorseRosterSection';
import { getContractMeta } from './industryContracts';
import type { FinanceContractLine } from './FarmFinanceSummary';

interface LivestockFinanceSummaryProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  industryBuyerLines: FinanceContractLine[];
  activeSubTab: 'summary' | 'pricelist';
  onUpdateState?: (updates: Partial<BuildingState>) => void;
}

const formatHorsesWord = (n: number): string => {
  if (n === 1) return 'koń';
  if (n >= 2 && n <= 4) return 'konie';
  return 'koni';
};

const formatYearsWord = (y: number): string => {
  if (y === 1) return 'rok';
  if (y >= 2 && y <= 4) return 'lata';
  return 'lat';
};

export const getDefaultHorsePriceForAge = (ageYears: number, fallbackPrice = 85): number => {
  if (ageYears < 3) return Math.round(fallbackPrice * (0.45 + ageYears * 0.15)); // źrebak 0..2 lat
  if (ageYears <= 6) return fallbackPrice + (ageYears - 2) * 5; // młody koń roboczy
  if (ageYears <= 10) return fallbackPrice + 15; // szczyt formy
  return Math.max(30, fallbackPrice - (ageYears - 10) * 10); // starszy koń 11..14 lat
};

export const LivestockFinanceSummary: React.FC<LivestockFinanceSummaryProps> = ({
  building,
  buildingState,
  allWorldBuildings,
  buildingsState,
  industryBuyerLines,
  activeSubTab,
  onUpdateState,
}) => {
  const [showHorseNames, setShowHorseNames] = useState(false);

  const ls = buildingState.livestockState || createDefaultLivestockState();
  const species = ls.activeSpecies || 'cattle';
  const isCattle = species === 'cattle';
  const isSheep = species === 'sheep';
  const isHorses = species === 'horses';

  const updateLs = (patch: Partial<typeof ls>) => {
    onUpdateState?.({
      livestockState: {
        ...ls,
        ...patch,
      },
    });
  };

  if (activeSubTab === 'pricelist') {
    const milkPrice = ls.milkPricePer100L ?? 14;
    const woolPrice = ls.woolPricePer50Kg ?? 24;
    const manurePrice = ls.manurePricePer100Kg ?? 12;
    const cattlePrice = ls.cattleSalePrice ?? 65;
    const sheepPrice = ls.sheepSalePrice ?? 28;
    const baseHorsePrice = ls.horseSalePrice ?? 85;
    const horseAges = Array.from({ length: 15 }, (_, i) => i); // 0..14 lat

    const productRows = [
      {
        id: 'milk',
        icon: '🥛',
        name: 'Mleko świeże',
        unit: '100 litrów',
        ref: '£ 14.00',
        value: milkPrice,
        onChange: (v: number) => updateLs({ milkPricePer100L: Math.max(1, v) }),
      },
      {
        id: 'wool',
        icon: '🧶',
        name: 'Wełna owcza',
        unit: '50 kg',
        ref: '£ 24.00',
        value: woolPrice,
        onChange: (v: number) => updateLs({ woolPricePer50Kg: Math.max(1, v) }),
      },
      {
        id: 'manure',
        icon: '💩',
        name: 'Obornik naturalny',
        unit: '100 kg',
        ref: '£ 12.00',
        value: manurePrice,
        onChange: (v: number) => updateLs({ manurePricePer100Kg: Math.max(1, v) }),
      },
    ];

    return (
      <div className="space-y-4">
        {/* Cennik produktów fermy */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            🏷️ Cennik Produktów Fermy
          </h4>
          <div className="overflow-x-auto rounded-xl border border-stone-800">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                  <th className="py-2 px-3">Produkt</th>
                  <th className="py-2 px-3">Jednostka</th>
                  <th className="py-2 px-3">Cena bazowa</th>
                  <th className="py-2 px-3">Twoja cena (£)</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row) => (
                  <tr key={row.id} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-950/50">
                    <td className="py-2 px-3 text-amber-100 font-semibold">
                      {row.icon} {row.name}
                    </td>
                    <td className="py-2 px-3 text-stone-300">{row.unit}</td>
                    <td className="py-2 px-3 text-stone-400">{row.ref}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">£</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={row.value}
                          onChange={(e) => row.onChange(Number(e.target.value) || 1)}
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

        {/* Tabela cen zwierząt w zależności od wieku */}
        <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              🐎 Cennik Zwierząt wg Wieku (Konie, Bydło, Owce)
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono">
              <label className="flex items-center gap-1.5 text-stone-300">
                <span>🐄 Bydło dorosłe (£):</span>
                <input
                  type="number"
                  min={10}
                  value={cattlePrice}
                  onChange={(e) => updateLs({ cattleSalePrice: Math.max(10, Number(e.target.value) || 10) })}
                  className="w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-0.5 text-emerald-300 font-bold outline-none"
                />
              </label>
              <label className="flex items-center gap-1.5 text-stone-300">
                <span>🐑 Owca dorosła (£):</span>
                <input
                  type="number"
                  min={5}
                  value={sheepPrice}
                  onChange={(e) => updateLs({ sheepSalePrice: Math.max(5, Number(e.target.value) || 5) })}
                  className="w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-0.5 text-emerald-300 font-bold outline-none"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                  <th className="py-2 px-3">Wiek konia</th>
                  <th className="py-2 px-3">Klasa / Etap</th>
                  <th className="py-2 px-3">Sugerowana cena</th>
                  <th className="py-2 px-3">Cena sprzedaży (£/szt.)</th>
                </tr>
              </thead>
              <tbody>
                {horseAges.map((age) => {
                  const defaultForAge = getDefaultHorsePriceForAge(age, baseHorsePrice);
                  const currentVal = ls.horsePricesByAge?.[age] ?? defaultForAge;
                  return (
                    <tr key={age} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-950/50">
                      <td className="py-1.5 px-3 text-amber-300 font-bold">
                        {age} {formatYearsWord(age)}
                      </td>
                      <td className="py-1.5 px-3 text-stone-300">
                        {age < 3 ? 'Źrebak (odchów)' : age <= 10 ? 'Koń roboczy (pełnia sił)' : 'Koń starszy'}
                      </td>
                      <td className="py-1.5 px-3 text-stone-400">£ {defaultForAge}</td>
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">£</span>
                          <input
                            type="number"
                            min={10}
                            step={1}
                            value={currentVal}
                            onChange={(e) => {
                              const nextVal = Math.max(10, Number(e.target.value) || 10);
                              updateLs({
                                horsePricesByAge: {
                                  ...(ls.horsePricesByAge || {}),
                                  [age]: nextVal,
                                },
                              });
                            }}
                            className="w-24 bg-stone-950 border border-stone-700 focus:border-sky-500 rounded-lg px-2 py-1 text-xs font-mono text-emerald-300 font-bold outline-none"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const horsesList =
    ls.herd.horses && ls.herd.horses.length > 0 ? ls.herd.horses : createDefaultHorsesList();

  const ageGroups = Array.from(
    horsesList.reduce((acc, h) => {
      acc.set(h.ageYears, (acc.get(h.ageYears) || 0) + 1);
      return acc;
    }, new Map<number, number>())
  ).sort((a, b) => b[0] - a[0]);

  const animalCount = isCattle
    ? ls.herd.milkingGroupCows + ls.herd.growingGroupCalves + (ls.herd.cattleForSale ?? 4)
    : isSheep
    ? (ls.herd.adultSheepCount || 16) + (ls.herd.growingLambsCount || 6) + (ls.herd.sheepForSale ?? 4)
    : horsesList.length;

  const hasStrawBedding = (ls.supplies?.strawBeddingKg ?? 0) > 0;
  const dailyManureKg = hasStrawBedding ? computeDailyManureKg(species, animalCount) : 0;
  const monthlyManureKg = dailyManureKg * 30;
  const monthlyMilkL = isCattle ? ls.herd.milkingGroupCows * 14 * 30 : 0;
  const annualWoolKg = isSheep ? (ls.herd.adultSheepCount || 16) * 18 : 0;
  const monthlyWoolKg = Math.round(annualWoolKg / 12);
  const manurePricePer100 = ls.manurePricePer100Kg ?? 12;

  const salesLines: FinanceContractLine[] = [...industryBuyerLines];
  allWorldBuildings
    .filter((b) => b.typeId === 'wheat_farm')
    .forEach((b) => {
      const fCap = buildingsState[b.id]?.farmCapitalism;
      if (fCap?.manureOrder?.supplierId === building.id) {
        const meta = getContractMeta(fCap.manureOrder.contractType);
        const rev = Number(
          (
            (fCap.manureOrder.monthlyQuantityKg / 100) *
            manurePricePer100 *
            (1 - meta.discountPercent / 100)
          ).toFixed(2)
        );
        salesLines.push({
          id: `manure_${b.id}`,
          counterpartyName: formatSupplierOrderLabel(b),
          goodsLabel: 'Obornik naturalny',
          amountLabel: `${fCap.manureOrder.monthlyQuantityKg} kg/msc`,
          contractLabel: meta.label,
          monthlyValueGbp: rev,
        });
      }
    });
  const totalSalesRevenue = Number(salesLines.reduce((s, l) => s + l.monthlyValueGbp, 0).toFixed(2));

  const purchaseLines: FinanceContractLine[] = [];
  const feedOrdersList = Array.isArray(ls.feedOrders)
    ? ls.feedOrders
    : ls.feedOrder
    ? [ls.feedOrder]
    : [];
  const strawOrdersList = Array.isArray(ls.strawOrders)
    ? ls.strawOrders
    : ls.strawOrder
    ? [ls.strawOrder]
    : [];

  feedOrdersList.forEach((ord, idx) => {
    const isShip = ord.supplierId.startsWith('trade_ship');
    const prod = allWorldBuildings.find((b) => b.id === ord.supplierId);
    const isMill = prod?.typeId === 'mill';
    const meta = getContractMeta(ord.contractType);
    const basePer100 = isShip
      ? 11
      : isMill
      ? Number(((buildingsState[ord.supplierId]?.millState?.branPricePerKg ?? 0.45) * 100).toFixed(2))
      : 10;
    const cost = Number(
      ((ord.monthlyQuantityKg / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
    );
    purchaseLines.push({
      id: `buy_feed_${ord.supplierId}_${idx}`,
      counterpartyName: isShip
        ? '🚢 Port Londyn • Statek Handlowy'
        : prod
        ? formatSupplierOrderLabel(prod, buildingsState)
        : 'Farma Zbożowa',
      goodsLabel: isShip ? 'Pasza (Import)' : isMill ? 'Otręby Paszowe' : 'Pasza zbożowa',
      amountLabel: `${ord.monthlyQuantityKg} kg/msc`,
      contractLabel: meta.label,
      monthlyValueGbp: cost,
    });
  });

  strawOrdersList.forEach((ord, idx) => {
    const isShip = ord.supplierId.startsWith('trade_ship');
    const prod = allWorldBuildings.find((b) => b.id === ord.supplierId);
    const meta = getContractMeta(ord.contractType);
    const basePer100 = isShip ? 6.6 : 6;
    const cost = Number(
      ((ord.monthlyQuantityKg / 100) * basePer100 * (1 - meta.discountPercent / 100)).toFixed(2)
    );
    purchaseLines.push({
      id: `buy_straw_${ord.supplierId}_${idx}`,
      counterpartyName: isShip
        ? '🚢 Port Londyn • Statek Handlowy'
        : prod
        ? formatSupplierOrderLabel(prod, buildingsState)
        : 'Farma Zbożowa',
      goodsLabel: isShip ? 'Ściółka (Import)' : 'Ściółka (słoma)',
      amountLabel: `${ord.monthlyQuantityKg} kg/msc`,
      contractLabel: meta.label,
      monthlyValueGbp: cost,
    });
  });
  const monthlyWages = Number(((ls.crew || []).reduce((s, w) => s + w.wageDaily, 0) * 30).toFixed(2));
  purchaseLines.push({
    id: 'buy_wages',
    counterpartyName: 'Załoga fermy',
    goodsLabel: 'Płace (30 dni)',
    amountLabel: `${(ls.crew || []).length} os.`,
    contractLabel: 'Stałe',
    monthlyValueGbp: monthlyWages,
  });

  const totalPurchasesCost = Number(purchaseLines.reduce((s, l) => s + l.monthlyValueGbp, 0).toFixed(2));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            {isCattle ? '🐄 Produkcja (Bydło)' : isSheep ? '🐑 Produkcja (Owce)' : '🐎 Produkcja (Konie)'}
          </h4>
          <div className="text-xs font-mono space-y-1.5 text-stone-300">
            {isCattle && (
              <>
                <div className="flex justify-between">
                  <span>Mleko / miesiąc:</span>
                  <strong className="text-sky-300">{monthlyMilkL} l/msc</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mleko / rok:</span>
                  <strong className="text-sky-200">{monthlyMilkL * 12} l/rok</strong>
                </div>
              </>
            )}
            {isSheep && (
              <>
                <div className="flex justify-between">
                  <span>Wełna / miesiąc:</span>
                  <strong className="text-pink-300">~{monthlyWoolKg} kg/msc</strong>
                </div>
                <div className="flex justify-between">
                  <span>Wełna / rok:</span>
                  <strong className="text-pink-200">{annualWoolKg} kg/rok</strong>
                </div>
              </>
            )}
            {isHorses && (
              <div className="text-[11px] text-stone-400">Brak produkcji towarowej (rozród i odchów)</div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-stone-800">
              <span>Obornik / miesiąc:</span>
              <strong className="text-amber-300">{monthlyManureKg} kg/msc</strong>
            </div>
            <div className="flex justify-between">
              <span>Obornik / rok:</span>
              <strong className="text-amber-200">{monthlyManureKg * 12} kg/rok</strong>
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
              {purchaseLines.map((line) => (
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
                  <strong className="text-rose-300 shrink-0">£ {line.monthlyValueGbp.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs font-mono pt-2 border-t border-stone-800">
            <span className="text-stone-300 font-bold">Podsumowanie zakupów:</span>
            <strong className="text-rose-400">£ {totalPurchasesCost.toFixed(2)} / msc</strong>
          </div>
        </div>
      </div>

      {/* WIEK ZWIERZĄT */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">⏳ Wiek Zwierząt w Zagrodzie</h4>
          {isHorses && (
            <button
              type="button"
              onClick={() => setShowHorseNames((v) => !v)}
              className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[11px] font-bold text-amber-200 cursor-pointer"
            >
              {showHorseNames ? '▲ Zwiń listę imienną' : '▼ Rozwiń listę imienną'}
            </button>
          )}
        </div>

        {isHorses ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-stone-800">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-400 border-b border-stone-800">
                    <th className="py-2 px-3">Wiek</th>
                    <th className="py-2 px-3">Liczba koni</th>
                    <th className="py-2 px-3">Kategoria</th>
                  </tr>
                </thead>
                <tbody>
                  {ageGroups.map(([age, count]) => (
                    <tr key={age} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-900/50">
                      <td className="py-1.5 px-3 text-amber-300 font-bold">
                        {age} {formatYearsWord(age)}
                      </td>
                      <td className="py-1.5 px-3 text-amber-100">
                        <strong>{count}</strong> {formatHorsesWord(count)}
                      </td>
                      <td className="py-1.5 px-3 text-stone-400">
                        {age < 3 ? 'Źrebaki (wzrost)' : 'Dorosłe (max 15 lat)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-900/80 border-t border-stone-800 font-bold text-amber-200">
                    <td className="py-2 px-3">Łącznie</td>
                    <td className="py-2 px-3">
                      {horsesList.length} {formatHorsesWord(horsesList.length)}
                    </td>
                    <td className="py-2 px-3 text-stone-400 font-normal">Zagroda</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {showHorseNames && (
              <div className="overflow-x-auto rounded-xl border border-stone-800 mt-2">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-stone-900 text-stone-400 border-b border-stone-800">
                      <th className="py-1.5 px-3">Imię</th>
                      <th className="py-1.5 px-3">Płeć</th>
                      <th className="py-1.5 px-3">Wiek</th>
                      <th className="py-1.5 px-3">Grupa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horsesList.map((h) => (
                      <tr key={h.id} className="border-b border-stone-800/60 last:border-b-0 hover:bg-stone-900/50">
                        <td className="py-1.5 px-3 text-amber-100 font-semibold">🐎 {h.name}</td>
                        <td className="py-1.5 px-3">
                          {h.sex === 'male' ? (
                            <span className="text-sky-300">♂ Ogier</span>
                          ) : (
                            <span className="text-pink-300">♀ Klacz</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-amber-300">{h.ageYears} / 15 lat</td>
                        <td className="py-1.5 px-3 text-stone-300">
                          {h.group === 'breeding' ? 'Rozród' : h.group === 'growth' ? 'Wzrost' : 'Sprzedaż'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-300">
            <span>
              {isCattle ? 'Cielęta w odchowie:' : 'Jagnięta w odchowie:'}{' '}
              <strong className="text-amber-300">
                {isCattle ? `${ls.calfAgeMonths}/24 msc` : `${ls.lambAgeMonths}/15 msc`}
              </strong>
            </span>
            <span>
              {isCattle ? 'Ciąża krów:' : 'Kotność owiec:'}{' '}
              <strong className="text-emerald-300">
                {isCattle ? `${ls.pregnancyMonthsPassed}/9 msc` : `${ls.sheepPregnancyMonths}/5 msc`}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
