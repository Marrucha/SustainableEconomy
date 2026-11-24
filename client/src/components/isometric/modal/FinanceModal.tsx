import React, { useState } from 'react';
import type { BuildingState } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { getProducerMarketAvailability } from './industrySupplyConfig';
import { FinanceBusinessDetail } from './FinanceBusinessDetail';
import { computeBuildingFinanceNumbers, countAllBuildingStaff } from './financeSummaryMath';
import {
  countAttachedFlaxFields,
  countAttachedHopFields,
  countAttachedPastures,
  countAttachedWheatFields,
} from '../pastureTopology';

export type EconomySector =
  | 'wydobywcza'
  | 'rolnictwo'
  | 'produkcja'
  | 'rzemioslo'
  | 'handel';

interface SectorMeta {
  id: EconomySector;
  label: string;
  icon: string;
  badgeClass: string;
}

const SECTORS: SectorMeta[] = [
  { id: 'wydobywcza', label: 'Wydobywcza', icon: '⛏️', badgeClass: 'bg-stone-700/60 text-stone-200 border-stone-500/40' },
  { id: 'rolnictwo', label: 'Rolnictwo', icon: '🌾', badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' },
  { id: 'produkcja', label: 'Produkcja', icon: '🏭', badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40' },
  { id: 'rzemioslo', label: 'Rzemiosło', icon: '🛠️', badgeClass: 'bg-sky-950/60 text-sky-300 border-sky-500/40' },
  { id: 'handel', label: 'Handel', icon: '🏪', badgeClass: 'bg-purple-950/60 text-purple-300 border-purple-500/40' },
];

const MINING_IDS = new Set(['mine_shaft', 'coal_mine', 'woodcutter']);
const AGRICULTURE_IDS = new Set([
  'wheat_farm', 'orchard', 'flax_farm',
  'hop_farm', 'livestock_farm',
  'rubber_plantation', 'sugar_beet_farm', 'tobacco_field', 'cotton_plantation', 'horse_ranch',
]);
const CRAFT_IDS = new Set(['bakery', 'blacksmith', 'shoemaker', 'butcher', 'jeweler', 'watchmaker']);
const TRADE_IDS = new Set(['marketplace', 'meat_shop', 'grocery_shop', 'clothing_shop', 'building_depot', 'transport_company']);

function classifySector(typeId: string): EconomySector | null {
  if (MINING_IDS.has(typeId)) return 'wydobywcza';
  if (AGRICULTURE_IDS.has(typeId)) return 'rolnictwo';
  if (CRAFT_IDS.has(typeId)) return 'rzemioslo';
  if (TRADE_IDS.has(typeId)) return 'handel';
  if (
    ['mill', 'sawmill', 'spinning_mill', 'sewing_factory', 'brewery', 'tannery', 'dairy',
     'slaughterhouse', 'furniture_factory', 'coal_plant', 'huta', 'cement_plant',
     'brickworks', 'factory', 'sugar_refinery', 'rolling_mill', 'newspaper_publisher'].includes(typeId)
  ) {
    return 'produkcja';
  }
  return null;
}

interface FinanceModalProps {
  gold: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onNavigateToBuilding?: (building: WorldSupplierBuilding) => void;
  onClose: () => void;
}

function formatMarketplaceName(st?: BuildingState): string {
  const count = (st?.marketStalls || []).filter((s) => s.tenantName === 'Gracz').length;
  const word = count === 1 ? 'stoisko' : count >= 2 && count <= 4 ? 'stoiska' : 'stoisk';
  return `Targowisko Miejskie (${count} ${word})`;
}

function formatPluralPl(count: number, one: string, few: string, many: string): string {
  if (count === 1) return `${count} ${one}`;
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

function formatEnterpriseName(
  b: WorldSupplierBuilding,
  st: BuildingState | undefined,
  allWorldBuildings: WorldSupplierBuilding[]
): string {
  if (b.typeId === 'marketplace') return formatMarketplaceName(st);
  const baseName = st?.enterpriseName || b.name;
  if (b.typeId === 'wheat_farm') {
    const count = countAttachedWheatFields(b, allWorldBuildings);
    return `${baseName} (${formatPluralPl(count, 'pole', 'pola', 'pól')})`;
  }
  if (b.typeId === 'flax_farm') {
    const count = countAttachedFlaxFields(b, allWorldBuildings);
    return `${baseName} (${formatPluralPl(count, 'pole', 'pola', 'pól')})`;
  }
  if (b.typeId === 'hop_farm') {
    const count = countAttachedHopFields(b, allWorldBuildings);
    return `${baseName} (${formatPluralPl(count, 'pole', 'pola', 'pól')})`;
  }
  if (b.typeId === 'livestock_farm') {
    const count = countAttachedPastures(b, allWorldBuildings);
    return `${baseName} (${formatPluralPl(count, 'zagroda', 'zagrody', 'zagród')})`;
  }
  return baseName;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({
  gold,
  allWorldBuildings,
  buildingsState,
  onNavigateToBuilding,
  onClose,
}) => {
  const [activeSector, setActiveSector] = useState<EconomySector | 'all'>('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const rows = allWorldBuildings
    .map((b) => {
      const sector = classifySector(b.typeId);
      if (!sector) return null;
      const st = buildingsState[b.id];
      const staff = countAllBuildingStaff(st);
      const avail = getProducerMarketAvailability(b, st);
      const fin = computeBuildingFinanceNumbers(b, st, allWorldBuildings, buildingsState);
      const enterpriseName = formatEnterpriseName(b, st, allWorldBuildings);
      return {
        building: b,
        sector,
        enterpriseName,
        ownerName: st?.ownerName || 'Gracz 1',
        staff,
        avail,
        revenue: fin.revenue,
        cost: fin.cost,
        profit: fin.profit,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const sectorSummaries = SECTORS.map((meta) => {
    const items = rows.filter((r) => r.sector === meta.id);
    const revenue = items.reduce((s, r) => s + r.revenue, 0);
    const cost = items.reduce((s, r) => s + r.cost, 0);
    return {
      ...meta,
      count: items.length,
      staff: items.reduce((s, r) => s + r.staff, 0),
      revenue,
      cost,
      profit: revenue - cost,
    };
  });

  const filteredRows = activeSector === 'all' ? rows : rows.filter((r) => r.sector === activeSector);
  const totalStaff = rows.reduce((s, r) => s + r.staff, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const selectedRow = selectedBuildingId
    ? rows.find((r) => r.building.id === selectedBuildingId) || null
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-6xl max-h-[90vh] bg-stone-900/95 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-stone-200 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ekonomia i Finanse • Rok 1880
            </span>
            <h2 className="text-xl font-bold font-serif text-amber-100 mt-1">
              💰 Zestawienie Finansowe i Podsumowanie Branż
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Główne KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Skarbiec</p>
            <p className="text-lg font-mono font-bold text-emerald-400">£{gold.toLocaleString('en-US')}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Zakłady</p>
            <p className="text-lg font-mono font-bold text-amber-200">{rows.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Zatrudnienie</p>
            <p className="text-lg font-mono font-bold text-sky-300">{totalStaff} os.</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-emerald-500/30">
            <p className="text-[10px] text-stone-400 uppercase">Przychód</p>
            <p className="text-lg font-mono font-bold text-emerald-300">+£{totalRevenue.toLocaleString('en-US')}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-rose-500/30">
            <p className="text-[10px] text-stone-400 uppercase">Koszt</p>
            <p className="text-lg font-mono font-bold text-rose-400">-£{totalCost.toLocaleString('en-US')}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-amber-500/40">
            <p className="text-[10px] text-stone-400 uppercase">Zysk</p>
            <p className={`text-lg font-mono font-bold ${totalProfit >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? `+£${totalProfit.toLocaleString('en-US')}` : `-£${Math.abs(totalProfit).toLocaleString('en-US')}`}
            </p>
          </div>
        </div>

        {/* Podsumowanie 5 branż */}
        {selectedRow ? (
          <FinanceBusinessDetail
            building={selectedRow.building}
            buildingState={buildingsState[selectedRow.building.id]}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
            sectorLabel={SECTORS.find((s) => s.id === selectedRow.sector)?.label || 'Produkcja'}
            onBack={() => setSelectedBuildingId(null)}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {sectorSummaries.map((sec) => {
                const isActive = activeSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSector(isActive ? 'all' : sec.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-stone-100">
                      {sec.icon} {sec.label}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Zakłady: <strong className="text-amber-200">{sec.count}</strong> • Załoga:{' '}
                      <strong className="text-sky-300">{sec.staff}</strong>
                    </p>
                    <p className="text-[10px] font-mono text-stone-300 mt-0.5">
                      <span className="text-emerald-300">+£{sec.revenue.toLocaleString('en-US')}</span>
                      {' / '}
                      <span className="text-rose-300">-£{sec.cost.toLocaleString('en-US')}</span>
                    </p>
                    <p className={`text-[11px] font-mono font-bold ${sec.profit >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                      Zysk: {sec.profit >= 0 ? `+£${sec.profit.toLocaleString('en-US')}` : `-£${Math.abs(sec.profit).toLocaleString('en-US')}`}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Lista wszystkich fabryk i zakładów */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200">
                Lista zakładów ({filteredRows.length}) — kliknij wiersz, aby otworzyć finanse zakładu
              </span>
              {activeSector !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveSector('all')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer"
                >
                  Pokaż wszystkie branże
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl border border-stone-800 bg-stone-950/60">
              {filteredRows.length === 0 ? (
                <p className="p-6 text-center text-xs text-stone-400">
                  Brak wybudowanych zakładów w tej branży.
                </p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-900/90 text-[10px] uppercase text-stone-400 sticky top-0">
                    <tr>
                      <th className="p-3">Zakład / Firma</th>
                      <th className="p-3">Branża</th>
                      <th className="p-3">Lokalizacja</th>
                      <th className="p-3">Załoga</th>
                      <th className="p-3 text-right">Przychód</th>
                      <th className="p-3 text-right">Koszt</th>
                      <th className="p-3 text-right">Zysk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/70">
                    {filteredRows.map((row) => {
                      const meta = SECTORS.find((s) => s.id === row.sector)!;
                      return (
                        <tr
                          key={row.building.id}
                          onClick={() => setSelectedBuildingId(row.building.id)}
                          className="hover:bg-amber-500/10 cursor-pointer transition-colors"
                        >
                          <td className="p-3">
                            <p className="font-bold text-stone-100">{row.enterpriseName}</p>
                            <p className="text-[10px] text-stone-400">Właściciel: {row.ownerName}</p>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${meta.badgeClass}`}>
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToBuilding?.(row.building);
                                onClose();
                              }}
                              title="Przejdź na mapę i wyśrodkuj na obiekcie"
                              className="font-mono text-[11px] text-sky-300 hover:text-sky-200 underline decoration-sky-500/60 hover:decoration-sky-300 cursor-pointer"
                            >
                              📍 {row.building.mapType === 'rural' ? 'Wieś' : 'Miasto'} ({row.building.x}, {row.building.y})
                            </button>
                          </td>
                          <td className="p-3 font-mono text-sky-300">{row.staff} os.</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-300">
                            +£{row.revenue.toLocaleString('en-US')}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-rose-400">
                            -£{row.cost.toLocaleString('en-US')}
                          </td>
                          <td className={`p-3 text-right font-mono font-bold ${row.profit >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                            {row.profit >= 0 ? `+£${row.profit.toLocaleString('en-US')}` : `-£${Math.abs(row.profit).toLocaleString('en-US')}`} →
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
