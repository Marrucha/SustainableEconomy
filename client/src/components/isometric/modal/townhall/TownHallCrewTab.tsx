import React from 'react';
import type { UniversityHousingClass } from '../universityTypes';
import {
  createDefaultTownHallCrew,
  formatTownHallFamilySummary,
  TOWN_HALL_ROLE_LABELS,
  type TownHallCrewMember,
} from './townHallCrewTypes';

const GROUPS: Array<{
  cls: UniversityHousingClass;
  title: string;
  badge: string;
  borderClass: string;
  badgeClass: string;
}> = [
  {
    cls: 'elite',
    title: '👑 Elita — Burmistrz (Willa Elit)',
    badge: 'Klasa E',
    borderClass: 'border-amber-400/50 bg-amber-950/20',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  {
    cls: 'middle',
    title: '🏛️ Mieszczanie — Urzędnicy (Kamienica Mieszczańska)',
    badge: 'Klasa M',
    borderClass: 'border-sky-500/40 bg-sky-950/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  },
  {
    cls: 'workers',
    title: '🧹 Robotnicy — Obsługa Ratusza (Kamienica Robotnicza)',
    badge: 'Klasa R',
    borderClass: 'border-emerald-500/40 bg-emerald-950/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
];

export const TownHallCrewTab: React.FC = () => {
  const crew: TownHallCrewMember[] = createDefaultTownHallCrew('town_hall_init');

  return (
    <div className="space-y-3 max-h-[54vh] overflow-y-auto pr-1">
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
                      {TOWN_HALL_ROLE_LABELS[m.role]}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {formatTownHallFamilySummary(m)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
