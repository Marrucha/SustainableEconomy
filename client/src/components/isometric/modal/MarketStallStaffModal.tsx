import React from 'react';
import type { MarketStallCrewMember } from '../types';
import { generateRandomEnglishName } from './englishNames';

export type StallStageKey = 'supply' | 'trader' | 'delivery';

interface StallStageMeta {
  num: number;
  key: StallStageKey;
  title: string;
  icon: string;
  professionIcon: string;
  professionLabel: string;
  dailyWage: number;
}

export const STALL_STAGE_META: Record<StallStageKey, StallStageMeta> = {
  supply: {
    num: 1,
    key: 'supply',
    title: 'Zaopatrzenie',
    icon: '📦',
    professionIcon: '🧑‍💼',
    professionLabel: 'Zaopatrzeniowiec',
    dailyWage: 4,
  },
  trader: {
    num: 2,
    key: 'trader',
    title: 'Handlarz',
    icon: '🗣️',
    professionIcon: '👤',
    professionLabel: 'Handlarz / Ekspedient',
    dailyWage: 3,
  },
  delivery: {
    num: 3,
    key: 'delivery',
    title: 'Dostawa',
    icon: '🚚',
    professionIcon: '🐎',
    professionLabel: 'Woźnica / Dostawca',
    dailyWage: 3,
  },
};

interface MarketStallStaffModalProps {
  stageKey: StallStageKey;
  assigned: MarketStallCrewMember[];
  onAssignNew: (member: MarketStallCrewMember) => void;
  onUnassign: (memberId: string) => void;
  onClose: () => void;
}

export const MarketStallStaffModal: React.FC<MarketStallStaffModalProps> = ({
  stageKey,
  assigned,
  onAssignNew,
  onUnassign,
  onClose,
}) => {
  const meta = STALL_STAGE_META[stageKey];

  const handleHireAndAssign = () => {
    const member: MarketStallCrewMember = {
      id: `stall_${stageKey}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: generateRandomEnglishName(),
      role: stageKey,
      dailyWage: meta.dailyWage,
    };
    onAssignNew(member);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-stone-900 border border-amber-500/50 rounded-2xl p-4 shadow-2xl space-y-3 text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {meta.num}. {meta.title}
              </h4>
              <p className="text-[11px] text-stone-400">
                Wymagany: {meta.professionLabel} (1 osoba = 1 krok lejka)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            PRZYPISANI DO TEGO KROKU ({assigned.length}):
          </p>

          {assigned.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-1">
              Brak przypisanego pracownika do tego kroku.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {assigned.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{meta.professionIcon}</span>
                    <span className="text-xs font-bold text-white truncate">{w.name}</span>
                    <span className="text-xs font-medium text-emerald-300 truncate">
                      {meta.professionLabel} • £{w.dailyWage}/d
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnassign(w.id)}
                    className="px-2.5 py-1 rounded-full bg-rose-900/90 hover:bg-rose-800 text-rose-100 text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    Odepnij
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleHireAndAssign}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
        >
          <span>➕</span>
          <span>
            Zatrudnij i przypisz ({meta.professionLabel} • £{meta.dailyWage}/d)
          </span>
        </button>
      </div>
    </div>
  );
};
