import React from 'react';
import type { BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import type { UniversityHousingClass } from './universityTypes';
import {
  createDefaultTradeSchoolCrew,
  formatTradeSchoolFamilySummary,
  TRADE_SCHOOL_ROLE_LABELS,
} from './tradeSchoolTypes';

interface TradeSchoolSectionProps {
  buildingId: string;
  buildingTitle: string;
  buildingState: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const GROUPS: Array<{
  cls: UniversityHousingClass;
  title: string;
  badge: string;
  borderClass: string;
  badgeClass: string;
}> = [
  {
    cls: 'middle',
    title: '🏛️ Mieszczanie — Dyrektor (Kamienica Mieszczańska)',
    badge: 'Klasa M',
    borderClass: 'border-sky-500/40 bg-sky-950/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  },
  {
    cls: 'workers',
    title: '🛠️ Robotnicy — Kadra i Obsługa (Kamienica Robotnicza)',
    badge: 'Klasa R',
    borderClass: 'border-emerald-500/40 bg-emerald-950/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
];

export const TradeSchoolSection: React.FC<TradeSchoolSectionProps> = ({
  buildingId,
  buildingTitle,
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  businessTab,
  hasGreenRelief,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={buildingTitle}
        energySource={buildingState.businessEnergySource}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        onSpendGold={onSpendGold}
        onUpdateAnyBuildingState={onUpdateAnyBuildingState}
        onUpdateState={onUpdateState}
      />
    );
  }

  const crew = createDefaultTradeSchoolCrew(buildingId);
  const totalDependents = crew.reduce(
    (sum, m) => sum + (m.hasWife ? 1 : 0) + m.childrenCount + m.parentsCount,
    0
  );

  return (
    <div className="space-y-4">
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-amber-300">
            🏫 Załoga Szkoły Branżowej i Technicznej
          </h3>
          <p className="text-[11px] text-stone-400">
            Dyrektor (Mieszczanin) oraz 5 nauczycieli, woźna i stróż nocny (Robotnicy) z rodzinami na utrzymaniu.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            Pracownicy: <strong className="text-amber-300">{crew.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            Rodziny: <strong className="text-sky-300">{totalDependents} os.</strong>
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
        {GROUPS.map((grp) => {
          const members = crew.filter((m) => m.housingClass === grp.cls);
          return (
            <div key={grp.cls} className={`rounded-2xl border p-3 space-y-2 ${grp.borderClass}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
                  {grp.title}
                </h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${grp.badgeClass}`}>
                  {grp.badge} • {members.length} os.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="bg-stone-950/85 border border-stone-800 rounded-xl px-3 py-2 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">👤 {m.name}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                        {TRADE_SCHOOL_ROLE_LABELS[m.role]}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {formatTradeSchoolFamilySummary(m)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
