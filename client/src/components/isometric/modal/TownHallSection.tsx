import React, { useState } from 'react';
import { DecreesTab } from './townhall/DecreesTab';
import { TaxesTab } from './townhall/TaxesTab';
import { ReliefsTab } from './townhall/ReliefsTab';

interface TownHallSectionProps {
  activeReliefs: Record<string, boolean>;
  onToggleRelief: (reliefId: string) => void;
}

export const TownHallSection: React.FC<TownHallSectionProps> = ({
  activeReliefs,
  onToggleRelief,
}) => {
  const [townHallTab, setTownHallTab] = useState<'decrees' | 'taxes' | 'reliefs'>('decrees');
  const activeReliefsCount = Object.values(activeReliefs).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 3 CZYTELNE PODSTRONY RATUSZA */}
      <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
        <button
          onClick={() => setTownHallTab('decrees')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            townHallTab === 'decrees'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <span className="text-base">📜</span>
          <span>1. Uchwały</span>
        </button>

        <button
          onClick={() => setTownHallTab('taxes')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            townHallTab === 'taxes'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <span className="text-base">💰</span>
          <span>2. Podatki</span>
        </button>

        <button
          onClick={() => setTownHallTab('reliefs')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            townHallTab === 'reliefs'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <span className="text-base">✍️</span>
          <span>3. Moje wnioski</span>
          {activeReliefsCount > 0 && (
            <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono font-bold">
              {activeReliefsCount}
            </span>
          )}
        </button>
      </div>

      {/* LINIA ODDZIELAJĄCA ZAKŁADKI OD TREŚCI */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-2 mb-2" />

      {townHallTab === 'decrees' && <DecreesTab />}
      {townHallTab === 'taxes' && <TaxesTab />}
      {townHallTab === 'reliefs' && (
        <ReliefsTab
          activeReliefs={activeReliefs}
          activeReliefsCount={activeReliefsCount}
          onToggleRelief={onToggleRelief}
        />
      )}
    </div>
  );
};
