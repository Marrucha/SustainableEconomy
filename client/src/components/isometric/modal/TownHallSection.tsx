import React, { useState } from 'react';
import { DecreesTab } from './townhall/DecreesTab';
import { TaxesTab } from './townhall/TaxesTab';
import { ReliefsTab } from './townhall/ReliefsTab';
import { TownHallCrewTab } from './townhall/TownHallCrewTab';
import { TownHallCityStatsTab } from './townhall/TownHallCityStatsTab';
import type { CityHousingStatus } from '../cityAutoGrowth';
import type { BuildingState, PlacedBuilding } from '../types';

interface TownHallSectionProps {
  activeReliefs: Record<string, boolean>;
  onToggleRelief: (reliefId: string) => void;
  cityHousingStatus?: CityHousingStatus;
  cityBuildings?: PlacedBuilding[];
  buildingsState?: Record<string, BuildingState>;
  cityPlayersCount?: number;
  onAddNewCityPlayer?: () => void;
}

export const TownHallSection: React.FC<TownHallSectionProps> = ({
  activeReliefs,
  onToggleRelief,
  cityHousingStatus,
  cityBuildings = [],
  buildingsState = {},
  cityPlayersCount = 1,
  onAddNewCityPlayer,
}) => {
  const [townHallTab, setTownHallTab] = useState<'decrees' | 'taxes' | 'reliefs' | 'crew' | 'city'>('decrees');
  const activeReliefsCount = Object.values(activeReliefs).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {cityHousingStatus && (
        <div className="p-3.5 rounded-2xl bg-stone-900/75 border border-stone-700/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              🏘️ Demografia i Rozwój Miasta (Auto-budowa + Rozszerzenie terenu o +3 pola)
            </h4>
            {onAddNewCityPlayer && (
              <button
                type="button"
                onClick={onAddNewCityPlayer}
                className="text-[11px] font-bold px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 cursor-pointer"
              >
                👤 + Nowy Gracz (Nowa Willa Elity)
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800">
              <p className="text-stone-400">Bloki Robotnicze (20/blok)</p>
              <p className="font-mono font-bold text-emerald-300 mt-0.5">
                {cityHousingStatus.workersAndTradeCount} / {cityHousingStatus.workersCapacity} rodzin ({cityHousingStatus.workersBlocksCount} bl.)
              </p>
            </div>
            <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800">
              <p className="text-stone-400">Bloki Mieszczańskie (10/blok)</p>
              <p className="font-mono font-bold text-sky-300 mt-0.5">
                {cityHousingStatus.managersCount} / {cityHousingStatus.managersCapacity} rodzin ({cityHousingStatus.middleBlocksCount} bl.)
              </p>
            </div>
            <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800">
              <p className="text-stone-400">Wille Elity (Burmistrz + Gracze)</p>
              <p className="font-mono font-bold text-amber-200 mt-0.5">
                {cityHousingStatus.eliteVillasCount} willi ({cityPlayersCount} graczy)
              </p>
            </div>
          </div>
        </div>
      )}

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

        <button
          onClick={() => setTownHallTab('crew')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            townHallTab === 'crew'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <span className="text-base">👥</span>
          <span>4. Załoga (28)</span>
        </button>

        <button
          onClick={() => setTownHallTab('city')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            townHallTab === 'city'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <span className="text-base">🏙️</span>
          <span>5. Miasto</span>
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
      {townHallTab === 'crew' && <TownHallCrewTab />}
      {townHallTab === 'city' && (
        <TownHallCityStatsTab
          cityBuildings={cityBuildings}
          buildingsState={buildingsState}
        />
      )}
    </div>
  );
};
