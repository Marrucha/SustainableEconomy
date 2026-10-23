import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { MINE_DEPOSITS, type MineDepositType, DEFAULT_MINE_STAFF, type MineStaffState } from './mineTypes';
import { MineDepositSelector } from './MineDepositSelector';
import { MineCycleProgress } from './MineCycleProgress';
import { MineStoragePile } from './MineStoragePile';
import { MineCrewTab } from './MineCrewTab';
import { OreNuggetIcon } from './OreNuggetIcon';
import { BusinessEnergySection } from '../BusinessEnergySection';

interface MineSectionProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const MineSection: React.FC<MineSectionProps> = ({
  buildingState,
  businessTab,
  hasGreenRelief,
  clock,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'extraction' | 'crew'>('extraction');
  const currentDeposit = buildingState.mineDepositType;
  const isConfigured = Boolean(currentDeposit && MINE_DEPOSITS[currentDeposit]);

  const handleSelectDeposit = (newDeposit: MineDepositType) => {
    onUpdateState({
      mineDepositType: newDeposit,
      mineStock: 0,
      mineCycleStage: 1,
      mineDestination: buildingState.mineDestination || 'store_silo',
      mineStaff: buildingState.mineStaff || DEFAULT_MINE_STAFF,
    });
  };

  const handleAdvanceStage = () => {
    if (!currentDeposit) return;
    const depositInfo = MINE_DEPOSITS[currentDeposit];
    const stock = buildingState.mineStock ?? 0;
    const destination = buildingState.mineDestination ?? 'store_silo';
    const yieldTons = depositInfo.baseYieldPerCycle;

    if (destination === 'sell_market') {
      onUpdateState({ mineCycleStage: 1 });
    } else {
      onUpdateState({
        mineStock: Math.min(600, stock + yieldTons),
        mineCycleStage: 1,
      });
    }
  };

  const handleSellAll = () => {
    onUpdateState({ mineStock: 0 });
  };

  const handleUpdateStaff = (newStaff: MineStaffState) => {
    onUpdateState({ mineStaff: newStaff });
  };

  // 1. ZAKŁADKA ENERGII
  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={isConfigured ? `Kopalnia - ${MINE_DEPOSITS[currentDeposit!].name}` : 'Kopalnia'}
        energySource={buildingState.businessEnergySource || 'konie'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  // 2. KOPALNIA NIEURUCHOMIONA (BRAK PROFILU - JEDNORAZOWY WYBÓR ZŁOŻA)
  if (!isConfigured) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="p-4 bg-amber-950/60 border border-amber-500/60 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛏️</span>
            <div>
              <h3 className="text-base font-bold text-amber-200">Jednorazowe Uruchomienie Kopalni (Epoka 1880)</h3>
              <p className="text-xs text-stone-300">
                Wybierz poniżej surowiec do wydobycia. <strong className="text-amber-300 underline">Uwaga: wybór jest ostateczny i dożywotni!</strong> Po wyborze kopalnia na stałe zwiąże się z tym złożem.
              </p>
            </div>
          </div>
        </div>

        <MineDepositSelector
          currentDeposit={'coal'}
          currentStock={0}
          onSelectDeposit={handleSelectDeposit}
        />
      </div>
    );
  }

  const depositInfo = MINE_DEPOSITS[currentDeposit!];
  const stock = buildingState.mineStock ?? 0;
  const stage = buildingState.mineCycleStage ?? 1;
  const destination = buildingState.mineDestination ?? 'store_silo';
  const staff = buildingState.mineStaff || DEFAULT_MINE_STAFF;

  // 3. KOPALNIA AKTYWNA: STAŁY PROFIL (INNE SUROWCE USUNIĘTE Z OKNA) + ZAKŁADKA ZAŁOGA
  return (
    <div className="space-y-4 animate-fade-in">
      {/* NAGŁÓWEK STAŁEGO ZŁOŻA - BRAK MOŻLIWOŚCI ZMIANY (POZOSTAŁE SUROWCE USUNIĘTE) */}
      <div className="p-3.5 bg-stone-950/90 rounded-2xl border border-stone-800 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 rounded-xl border border-stone-700 shadow-inner flex items-center justify-center">
            <OreNuggetIcon depositType={currentDeposit!} size={38} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🔒 Złoże Dożywotnie: {depositInfo.category}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Wydajność: ~{depositInfo.baseYieldPerCycle} t / miesiąc
              </span>
            </div>
            <h3 className="text-base font-bold text-amber-100 mt-0.5">{depositInfo.name}</h3>
            <p className="text-xs text-stone-400 max-w-xl">{depositInfo.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block font-mono">Cena rynkowa:</span>
          <span className="text-lg font-bold text-amber-300 font-mono">£ {depositInfo.basePricePerTon} / t</span>
        </div>
      </div>

      {/* PRZEŁĄCZNIK ZAKŁADEK: WYDOBYCIE I HAŁDA / ZAŁOGA KOPALNI */}
      <div className="flex bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 text-xs gap-2 shadow-inner">
        <button
          onClick={() => setSubTab('extraction')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'extraction'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">⛏️</span>
          <span>Wydobycie i Hałda</span>
        </button>

        <button
          onClick={() => setSubTab('crew')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'crew'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">👥</span>
          <span>Załoga Kopalni i Rekrutacja</span>
        </button>
      </div>

      {/* 1. WIDOK: WYDOBYCIE I HAŁDA */}
      {subTab === 'extraction' && (
        <div className="space-y-4">
          <MineCycleProgress
            depositInfo={depositInfo}
            stageNum={stage}
            destination={destination}
            clock={clock}
            onSetDestination={(dest) => onUpdateState({ mineDestination: dest })}
            onAdvanceStage={handleAdvanceStage}
          />

          <MineStoragePile
            depositInfo={depositInfo}
            stockTons={stock}
            maxCapacity={600}
            onSellAll={handleSellAll}
          />
        </div>
      )}

      {/* 2. WIDOK: ZAŁOGA KOPALNI I REKRUTACJA */}
      {subTab === 'crew' && (
        <MineCrewTab
          staff={staff}
          stockTons={stock}
          depositPricePerTon={depositInfo.basePricePerTon}
          onUpdateStaff={handleUpdateStaff}
          onSellAll={handleSellAll}
        />
      )}
    </div>
  );
};
