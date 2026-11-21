import React from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import {
  ELITE_PER_VILLA,
  getCityHousingPools,
  MANAGERS_PER_MIDDLE_TENEMENT,
  WORKERS_PER_TENEMENT,
  type HousingClass,
} from '../residentialResidents';

interface TownHallCityStatsTabProps {
  cityBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
}

interface ClassStatsRow {
  cls: HousingClass;
  label: string;
  badgeColor: string;
  workers: number;
  spouses: number;
  children: number;
  parents: number;
  totalPersons: number;
  buildingsCount: number;
  capacityFamilies: number;
}

export const TownHallCityStatsTab: React.FC<TownHallCityStatsTabProps> = ({
  cityBuildings,
  buildingsState,
}) => {
  const pools = getCityHousingPools(cityBuildings, buildingsState);

  const classMeta: Array<{
    cls: HousingClass;
    label: string;
    badgeColor: string;
    typeId: string;
    perBuilding: number;
  }> = [
    {
      cls: 'elite',
      label: '👑 Elita (Klasa E)',
      badgeColor: 'text-amber-300',
      typeId: 'tenement_elite',
      perBuilding: ELITE_PER_VILLA,
    },
    {
      cls: 'middle',
      label: '🏛️ Mieszczanie (Klasa M)',
      badgeColor: 'text-sky-300',
      typeId: 'tenement_middle',
      perBuilding: MANAGERS_PER_MIDDLE_TENEMENT,
    },
    {
      cls: 'workers',
      label: '🛠️ Robotnicy (Klasa R)',
      badgeColor: 'text-emerald-300',
      typeId: 'tenement_workers',
      perBuilding: WORKERS_PER_TENEMENT,
    },
  ];

  const rows: ClassStatsRow[] = classMeta.map((meta) => {
    const list = pools[meta.cls];
    const workers = list.length;
    const spouses = list.reduce((s, p) => s + (p.hasSpouse ? 1 : 0), 0);
    const children = list.reduce((s, p) => s + p.childrenCount, 0);
    const parents = list.reduce((s, p) => s + p.parentsCount, 0);
    const totalPersons = workers + spouses + children + parents;
    const buildingsCount = cityBuildings.filter((b) => b.typeId === meta.typeId).length;
    return {
      cls: meta.cls,
      label: meta.label,
      badgeColor: meta.badgeColor,
      workers,
      spouses,
      children,
      parents,
      totalPersons,
      buildingsCount,
      capacityFamilies: buildingsCount * meta.perBuilding,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      workers: acc.workers + r.workers,
      spouses: acc.spouses + r.spouses,
      children: acc.children + r.children,
      parents: acc.parents + r.parents,
      totalPersons: acc.totalPersons + r.totalPersons,
      buildingsCount: acc.buildingsCount + r.buildingsCount,
      capacityFamilies: acc.capacityFamilies + r.capacityFamilies,
    }),
    {
      workers: 0,
      spouses: 0,
      children: 0,
      parents: 0,
      totalPersons: 0,
      buildingsCount: 0,
      capacityFamilies: 0,
    }
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-stone-950/85 border border-amber-500/40 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Ludność miasta</p>
          <p className="text-lg font-mono font-bold text-amber-300 mt-0.5">
            {totals.totalPersons.toLocaleString('pl-PL')} os.
          </p>
        </div>
        <div className="bg-stone-950/85 border border-stone-800 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Pracownicy</p>
          <p className="text-lg font-mono font-bold text-emerald-300 mt-0.5">
            {totals.workers.toLocaleString('pl-PL')}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-stone-800 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Nieprac. małżonkowie</p>
          <p className="text-lg font-mono font-bold text-sky-300 mt-0.5">
            {totals.spouses.toLocaleString('pl-PL')}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-stone-800 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Dzieci</p>
          <p className="text-lg font-mono font-bold text-yellow-300 mt-0.5">
            {totals.children.toLocaleString('pl-PL')}
          </p>
        </div>
        <div className="bg-stone-950/85 border border-stone-800 rounded-xl p-3">
          <p className="text-[10px] text-stone-400 uppercase">Rodzice na utrzymaniu</p>
          <p className="text-lg font-mono font-bold text-stone-200 mt-0.5">
            {totals.parents.toLocaleString('pl-PL')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950/70">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Klasa społeczna</th>
              <th className="py-2 px-3 text-right">Pracownicy</th>
              <th className="py-2 px-3 text-right">Nieprac. małżonkowie</th>
              <th className="py-2 px-3 text-right">Dzieci</th>
              <th className="py-2 px-3 text-right">Rodzice</th>
              <th className="py-2 px-3 text-right">Łącznie osób</th>
              <th className="py-2 px-3 text-right">Budynki / Miejsca</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80">
            {rows.map((r) => (
              <tr key={r.cls} className="hover:bg-stone-800/30">
                <td className={`py-2 px-3 font-bold ${r.badgeColor}`}>{r.label}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-300">
                  {r.workers}
                </td>
                <td className="py-2 px-3 text-right font-mono text-sky-300">{r.spouses}</td>
                <td className="py-2 px-3 text-right font-mono text-yellow-300">{r.children}</td>
                <td className="py-2 px-3 text-right font-mono text-stone-300">{r.parents}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-white">
                  {r.totalPersons}
                </td>
                <td className="py-2 px-3 text-right font-mono text-stone-300">
                  {r.buildingsCount} bud. ({r.workers}/{r.capacityFamilies} rodz.)
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-stone-900/80 border-t border-stone-700 font-bold">
            <tr>
              <td className="py-2 px-3 text-amber-300 uppercase text-[11px]">Razem Miasto</td>
              <td className="py-2 px-3 text-right font-mono text-emerald-300">{totals.workers}</td>
              <td className="py-2 px-3 text-right font-mono text-sky-300">{totals.spouses}</td>
              <td className="py-2 px-3 text-right font-mono text-yellow-300">{totals.children}</td>
              <td className="py-2 px-3 text-right font-mono text-stone-200">{totals.parents}</td>
              <td className="py-2 px-3 text-right font-mono text-amber-300">
                {totals.totalPersons}
              </td>
              <td className="py-2 px-3 text-right font-mono text-stone-200">
                {totals.buildingsCount} bud. ({totals.workers}/{totals.capacityFamilies} rodz.)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
