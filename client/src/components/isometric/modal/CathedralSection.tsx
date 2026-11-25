import React from 'react';
import type { BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import type { UniversityHousingClass } from './universityTypes';
import {
  CATHEDRAL_ROLE_LABELS,
  createDefaultCathedralCrew,
  formatCathedralFamilySummary,
} from './cathedralTypes';

interface CathedralSectionProps {
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
    cls: 'elite',
    title: '👑 Elita — Biskup (Willa Elity)',
    badge: 'Klasa E',
    borderClass: 'border-amber-500/40 bg-amber-950/20',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  {
    cls: 'middle',
    title: '🏛️ Mieszczanie — Księża (Kamienica Mieszczańska)',
    badge: 'Klasa M',
    borderClass: 'border-sky-500/40 bg-sky-950/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  },
  {
    cls: 'workers',
    title: '🛠️ Robotnicy — Organista i Zakonnice (Kamienica Robotnicza)',
    badge: 'Klasa R',
    borderClass: 'border-emerald-500/40 bg-emerald-950/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
];

export const CathedralSection: React.FC<CathedralSectionProps> = ({
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

  const crew = createDefaultCathedralCrew(buildingId);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-100/90 flex flex-wrap items-center justify-between gap-2">
        <span>
          ⛪ Duchowieństwo i obsługa katedry (<strong className="text-amber-300">{crew.length} osób</strong>): 1 Biskup (Elita), 3 Księży (Mieszczanie), 1 Organista i 5 Zakonnic (Robotnicy).
        </span>
      </div>

      {GROUPS.map((g) => {
        const members = crew.filter((m) => m.housingClass === g.cls);
        if (members.length === 0) return null;
        return (
          <div key={g.cls} className={`rounded-xl border p-4 space-y-2.5 ${g.borderClass}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-stone-100">{g.title}</div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${g.badgeClass}`}>
                {g.badge} · {members.length} os.
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg bg-stone-950/70 border border-stone-800/80 px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-stone-100">{m.name}</div>
                    <div className="text-[11px] text-amber-300/90">{CATHEDRAL_ROLE_LABELS[m.role]}</div>
                  </div>
                  <div className="text-[11px] text-stone-400 text-right">
                    {formatCathedralFamilySummary(m)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
