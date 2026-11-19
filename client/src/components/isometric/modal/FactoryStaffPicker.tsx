import React from 'react';
import type { BuildingState } from '../types';
import { generateRandomEnglishName } from './englishNames';

interface FactoryStaffPickerProps {
  role: 'worker' | 'manager' | 'warehouseman' | 'merchant' | 'seller';
  roleLabel: string;
  maxCount: number;
  roster: NonNullable<BuildingState['factoryRoster']>;
  onHireNew: (newName: string) => void;
  onSelectExisting?: (memberId: string) => void;
}

export const FactoryStaffPicker: React.FC<FactoryStaffPickerProps> = ({
  role,
  roleLabel,
  maxCount,
  roster,
  onHireNew,
}) => {
  const members = roster.filter((m) => m.role === role);
  const canHire = members.length < maxCount;

  const handleHire = () => {
    if (!canHire) return;
    const newName = generateRandomEnglishName(roster.map((m) => m.name));
    onHireNew(newName);
  };

  return (
    <div className="p-2 rounded-xl bg-stone-950/75 border border-stone-800 space-y-1.5 text-[10px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-stone-400 font-semibold">
          {roleLabel} ({members.length}/{maxCount}):
        </span>
        {canHire && (
          <button
            type="button"
            onClick={handleHire}
            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 font-bold cursor-pointer"
          >
            ➕ Nowy pracownik
          </button>
        )}
      </div>
      {members.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {members.map((m) => (
            <span
              key={m.id}
              className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-200"
            >
              {m.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
