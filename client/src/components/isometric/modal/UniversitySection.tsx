import React, { useEffect } from 'react';
import type { BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import {
  createDefaultUniversityState,
  formatUniversityFamilySummary,
  PROFESSOR_QUALIFICATION_LABELS,
  UNIVERSITY_ROLE_LABELS,
  type UniversityCrewMember,
  type UniversityHousingClass,
} from './universityTypes';

interface UniversitySectionProps {
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

const CLASS_GROUPS: Array<{
  cls: UniversityHousingClass;
  title: string;
  badge: string;
  borderClass: string;
  badgeClass: string;
}> = [
  {
    cls: 'elite',
    title: '👑 Elita (Willa Elit)',
    badge: 'Klasa E',
    borderClass: 'border-amber-400/50 bg-amber-950/20',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  {
    cls: 'middle',
    title: '🎓 Mieszczanie (Kamienica Mieszczańska)',
    badge: 'Klasa M',
    borderClass: 'border-sky-500/40 bg-sky-950/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  },
  {
    cls: 'workers',
    title: '🧹 Robotnicy (Kamienica Robotnicza)',
    badge: 'Klasa R',
    borderClass: 'border-emerald-500/40 bg-emerald-950/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
];

export const UniversitySection: React.FC<UniversitySectionProps> = ({
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
  const universityState =
    buildingState.universityState && buildingState.universityState.crew?.length > 0
      ? buildingState.universityState
      : createDefaultUniversityState(buildingId);

  useEffect(() => {
    if (!buildingState.universityState || !buildingState.universityState.crew?.length) {
      onUpdateState({ universityState });
    }
  }, [buildingId]);

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

  const crew = universityState.crew;
  const totalDependents = crew.reduce(
    (sum, m) => sum + (m.hasWife ? 1 : 0) + m.childrenCount + m.parentsCount,
    0
  );

  return (
    <div className="space-y-4">
      <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-amber-300">
            🎓 Załoga Uniwersytetu
          </h3>
          <p className="text-[11px] text-stone-400">
            Rektor (Elita), 5 wykładowców (Mieszczanie) oraz 5 pracowników obsługi (Robotnicy) wraz z rodzinami na utrzymaniu.
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
        {CLASS_GROUPS.map((grp) => {
          const members: UniversityCrewMember[] = crew.filter((m) => m.housingClass === grp.cls);
          return (
            <div
              key={grp.cls}
              className={`rounded-2xl border p-3 space-y-2 ${grp.borderClass}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
                  {grp.title}
                </h4>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${grp.badgeClass}`}
                >
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
                      <span className="text-xs font-bold text-white truncate">
                        👤 {m.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                        {UNIVERSITY_ROLE_LABELS[m.role]}
                        {m.qualification
                          ? ` • ${PROFESSOR_QUALIFICATION_LABELS[m.qualification]}`
                          : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {formatUniversityFamilySummary(m)}
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
