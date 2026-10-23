import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { WoodcutterCycleSnake } from './WoodcutterCycleSnake';
import { WoodcutterCrewTab } from './WoodcutterCrewTab';
import { DEFAULT_WOODCUTTER_CREW, type WoodcutterCrewStaff } from './woodcutterTypes';

interface WoodcutterSectionProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const WoodcutterSection: React.FC<WoodcutterSectionProps> = ({
  buildingState,
  businessTab,
  hasGreenRelief,
  clock,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'snake' | 'crew' | 'stock'>('snake');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const forestTiles = buildingState.woodcutterForestTiles ?? 32;
  const efficiency = buildingState.woodcutterEfficiency ?? Math.min(100, Math.round((forestTiles / 32) * 100));
  const currentStock = buildingState.woodcutterStock ?? 0;

  const crew: WoodcutterCrewStaff = (buildingState as any).woodcutterCrew || DEFAULT_WOODCUTTER_CREW;

  const handleUpdateCrew = (newCrew: WoodcutterCrewStaff) => {
    onUpdateState({
      woodcutterCrew: newCrew,
    } as any);
  };

  const pricePerTon = 9; // £ / tona

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSellStock = (amount: number) => {
    if (currentStock < amount) {
      showFeedback('⚠️ Brak wystarczającego zapasu drewna do załadunku wozu!');
      return;
    }
    const rev = amount * pricePerTon;
    onUpdateState({
      woodcutterStock: currentStock - amount,
    });
    showFeedback(`🌲 Sprzedano ${amount} ton wiktoriańskiej dłużycy za £${rev}!`);
  };

  const handleSellAll = () => {
    if (currentStock <= 0) return;
    const rev = currentStock * pricePerTon;
    onUpdateState({ woodcutterStock: 0 });
    showFeedback(`🌲 Sprzedano cały zapas (${currentStock} t) dłużycy za £${rev}!`);
  };

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle="Wyręb Drewna i Baza Drwali"
        energySource={buildingState.businessEnergySource || 'konie'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* GŁÓWNY PRZEŁĄCZNIK ZAKŁADEK */}
      <div className="flex bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 text-xs gap-2 shadow-inner">
        <button
          onClick={() => setSubTab('snake')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'snake'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🌲</span>
          <span>Wąż Produkcyjny (Cykl od Listopada)</span>
        </button>

        <button
          onClick={() => setSubTab('crew')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'crew'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">👥</span>
          <span>Załoga: Leśnik, Drwale, Woźnica, Ochroniarz</span>
        </button>

        <button
          onClick={() => setSubTab('stock')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'stock'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🪵</span>
          <span>Składnica Drewna ({currentStock} t)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs rounded-xl font-bold text-center animate-fade-in shadow-md">
          {feedbackMsg}
        </div>
      )}

      {/* 1. WĄŻ CYKLU PRODUKCYJNEGO */}
      {subTab === 'snake' && (
        <WoodcutterCycleSnake
          crew={crew}
          forestTiles={forestTiles}
          efficiency={efficiency}
          clock={clock}
          onGoToCrewTab={() => setSubTab('crew')}
        />
      )}

      {/* 2. ZAŁOGA WYRĘBU DREWNA */}
      {subTab === 'crew' && (
        <WoodcutterCrewTab
          crew={crew}
          onUpdateCrew={handleUpdateCrew}
        />
      )}

      {/* 3. SKŁADNICA I SPRZEDAŻ DREWNA */}
      {subTab === 'stock' && (
        <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-stone-950/80 rounded-xl border border-stone-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪵</span>
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-400">
                  Drewno Sezonowane Gotowe do Obróbki:
                </span>
                <div className="text-lg font-bold text-amber-200 font-mono">
                  {currentStock} ton <span className="text-xs text-stone-400 font-normal">/ 500 t max</span>
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-stone-400 block">Wartość rynkowa zapasu:</span>
              <span className="text-emerald-300 font-bold text-sm">£ {currentStock * pricePerTon}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => handleSellStock(10)}
              disabled={currentStock < 10}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentStock >= 10
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 cursor-pointer shadow-md'
                  : 'bg-stone-950 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              <span>🛒</span>
              <span>Sprzedaj 10 t za £{10 * pricePerTon}</span>
            </button>

            <button
              onClick={handleSellAll}
              disabled={currentStock <= 0}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentStock > 0
                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow-md'
                  : 'bg-stone-950 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              <span>💰</span>
              <span>Sprzedaj cały zapas ({currentStock} t)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
