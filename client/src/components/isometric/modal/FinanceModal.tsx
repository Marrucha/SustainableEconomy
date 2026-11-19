import React, { useState } from 'react';
import type { BuildingState } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { getProducerMarketAvailability } from './industrySupplyConfig';
import { FinanceBusinessDetail } from './FinanceBusinessDetail';

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
  'wheat_farm', 'wheat_field', 'orchard', 'flax_farm', 'flax_field',
  'hop_farm', 'hop_field', 'livestock_farm', 'pasture_cattle', 'pasture_sheep',
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

function countBuildingStaff(st?: BuildingState): number {
  if (!st) return 0;
  const factoryStaff =
    (st.factoryWorkersCount ?? 0) +
    (st.factoryManagersCount ?? 0) +
    (st.factoryWarehousemenCount ?? 0) +
    (st.merchantHired ? 1 : 0) +
    (st.factorySellerHired ? 1 : 0);
  const marketStaff =
    (st.marketSuppliersCount ?? 0) +
    (st.marketStalls || []).reduce((s, slot) => s + (slot.sellers?.length ?? 0), 0);
  const ruralCrew =
    (st.farmCapitalism?.crew?.length ?? 0) +
    (st.flaxState?.crew?.length ?? 0) +
    (st.hopState?.crew?.length ?? 0) +
    (st.orchardState?.crew?.length ?? 0) +
    (st.livestockState?.crew?.length ?? 0) +
    (st.mineStaff?.surfaceWorkersCount ?? 0) +
    (st.mineStaff?.minersCount ?? 0);
  return factoryStaff + marketStaff + ruralCrew;
}

interface FinanceModalProps {
  gold: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onClose: () => void;
}

function formatMarketplaceName(st?: BuildingState): string {
  const count = (st?.marketStalls || []).filter((s) => s.tenantName === 'Gracz').length;
  const word = count === 1 ? 'stoisko' : count >= 2 && count <= 4 ? 'stoiska' : 'stoisk';
  return `Targowisko Miejskie (${count} ${word})`;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({
  gold,
  allWorldBuildings,
  buildingsState,
  onClose,
}) => {
  const [activeSector, setActiveSector] = useState<EconomySector | 'all'>('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const rows = allWorldBuildings
    .map((b) => {
      const sector = classifySector(b.typeId);
      if (!sector) return null;
      const st = buildingsState[b.id];
      const staff = countBuildingStaff(st);
      const avail = getProducerMarketAvailability(b, st);
      const unitPrice = st?.productPrice ?? 2.0;
      const estStockValue = Math.round(avail.stockUnits * unitPrice);
      const enterpriseName =
        b.typeId === 'marketplace'
          ? formatMarketplaceName(st)
          : st?.enterpriseName || b.name;
      return {
        building: b,
        sector,
        enterpriseName,
        ownerName: st?.ownerName || 'Gracz 1',
        staff,
        avail,
        unitPrice,
        estStockValue,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const sectorSummaries = SECTORS.map((meta) => {
    const items = rows.filter((r) => r.sector === meta.id);
    return {
      ...meta,
      count: items.length,
      staff: items.reduce((s, r) => s + r.staff, 0),
      stockValue: items.reduce((s, r) => s + r.estStockValue, 0),
    };
  });

  const filteredRows = activeSector === 'all' ? rows : rows.filter((r) => r.sector === activeSector);
  const totalStaff = rows.reduce((s, r) => s + r.staff, 0);
  const totalStockValue = rows.reduce((s, r) => s + r.estStockValue, 0);
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Skarbiec</p>
            <p className="text-lg font-mono font-bold text-emerald-400">£{gold.toLocaleString('en-US')}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Wszystkie zakłady</p>
            <p className="text-lg font-mono font-bold text-amber-200">{rows.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Łączne zatrudnienie</p>
            <p className="text-lg font-mono font-bold text-sky-300">{totalStaff} os.</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
            <p className="text-[10px] text-stone-400 uppercase">Wartość magazynów</p>
            <p className="text-lg font-mono font-bold text-amber-300">£{totalStockValue.toLocaleString('en-US')}</p>
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
                    <p className="text-[11px] font-mono text-emerald-300 mt-0.5">
                      Magazyn: £{sec.stockValue.toLocaleString('en-US')}
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
                      <th className="p-3">Magazyn</th>
                      <th className="p-3">Sprzedawca</th>
                      <th className="p-3 text-right">Wartość zapasu</th>
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
                          <td className="p-3 text-stone-300 font-mono text-[11px]">
                            {row.building.mapType === 'rural' ? 'Wieś' : 'Miasto'} ({row.building.x}, {row.building.y})
                          </td>
                          <td className="p-3 font-mono text-sky-300">{row.staff} os.</td>
                          <td className="p-3 font-mono text-amber-200">{row.avail.stockLabel}</td>
                          <td className="p-3">
                            {row.avail.hasSeller ? (
                              <span className="text-emerald-300 text-[11px] font-semibold">✓ Aktywny</span>
                            ) : (
                              <span className="text-stone-500 text-[11px]">Brak</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            £{row.estStockValue.toLocaleString('en-US')} →
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
