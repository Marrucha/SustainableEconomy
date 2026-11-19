import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../../types';
import type { LivestockCapitalismState } from './livestockTypes';
import { createDefaultLivestockState } from './livestockTypes';
import { BusinessEnergySection } from '../BusinessEnergySection';
import { LivestockPipeline } from './LivestockPipeline';
import { LivestockHerdTab } from './LivestockHerdTab';
import { LivestockCrewTab } from './LivestockCrewTab';
import { LivestockStorageBins } from './LivestockStorageBins';
import { useLivestockTicks } from './useLivestockTicks';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import { resolveUniqueFarmName, type WorldSupplierBuilding } from '../industrySupplyConfig';

interface LivestockSectionProps {
  building?: PlacedBuilding;
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onRenameBuilding?: (buildingId: string, newName: string) => void;
  clock?: UseGameClockReturn;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const LivestockSection: React.FC<LivestockSectionProps> = ({
  building,
  buildingState,
  businessTab,
  hasGreenRelief,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateAnyBuildingState,
  onRenameBuilding,
  clock,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'herd' | 'crew' | 'storage'>('pipeline');
  const [speciesFeedback, setSpeciesFeedback] = useState<string | null>(null);
  const [pendingSpeciesChange, setPendingSpeciesChange] = useState<'cattle' | 'sheep' | 'horses' | null>(null);

  const rawState = buildingState.livestockState;
  const livestockState: LivestockCapitalismState =
    rawState && Array.isArray(rawState.crew) && rawState.herd && rawState.storage
      ? rawState
      : createDefaultLivestockState();

  useLivestockTicks({
    clock,
    livestockState,
    buildingsState,
    onSpendGold,
    onUpdateAnyBuildingState,
    onUpdateState,
  });

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle="Farma Hodowlana"
        energySource="konie"
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        allowedSources={['konie']}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        onSpendGold={onSpendGold}
        onUpdateAnyBuildingState={onUpdateAnyBuildingState}
        onUpdateState={onUpdateState}
      />
    );
  }

  const handleUpdateLivestock = (patch: Partial<LivestockCapitalismState>) => {
    if (patch.crew && building && onRenameBuilding) {
      const hadFarmer = (livestockState.crew || []).some(
        (w) => w.profession === 'breeder' || w.profession === 'handler'
      );
      const firstFarmer = patch.crew.find(
        (w) => w.profession === 'breeder' || w.profession === 'handler'
      );
      if (!hadFarmer && firstFarmer) {
        onRenameBuilding(
          building.id,
          resolveUniqueFarmName('Ferma', firstFarmer.name, allWorldBuildings, building.id)
        );
      }
    }
    const nextState: LivestockCapitalismState = {
      ...livestockState,
      ...patch,
    };
    onUpdateState({ livestockState: nextState });
  };

  const handleConfirmSwitchSpecies = () => {
    if (!pendingSpeciesChange || pendingSpeciesChange === livestockState.activeSpecies) {
      setPendingSpeciesChange(null);
      return;
    }

    const newSpecies = pendingSpeciesChange;

    // Po zmianie typu hodowli automatycznie przepada cały zapas produktów!
    const emptiedStorage = {
      beefKg: 0,
      muttonKg: 0,
      leatherPcs: 0,
      milkLiters: 0,
      woolKg: 0,
      manureKg: 0,
    };

    if (newSpecies === 'cattle') {
      handleUpdateLivestock({
        activeSpecies: 'cattle',
        storage: emptiedStorage,
        herd: {
          ...livestockState.herd,
          milkingGroupCows: livestockState.herd.milkingGroupCows || 12,
          growingGroupCalves: livestockState.herd.growingGroupCalves || 8,
          sheepFlockCount: 0,
          adultSheepCount: 0,
          growingLambsCount: 0,
          horsesFlockCount: 0,
          adultDraftHorses: 0,
          growingFoalsCount: 0,
        },
      });
      setSpeciesFeedback('🐄 Zmieniono profil na Fermę Bydła! Cały dotychczasowy zapas produktów ze starego stada przepadł!');
    } else if (newSpecies === 'sheep') {
      handleUpdateLivestock({
        activeSpecies: 'sheep',
        storage: emptiedStorage,
        herd: {
          ...livestockState.herd,
          milkingGroupCows: 0,
          growingGroupCalves: 0,
          sheepFlockCount: livestockState.herd.adultSheepCount ? (livestockState.herd.adultSheepCount + (livestockState.herd.growingLambsCount || 6)) : 22,
          adultSheepCount: livestockState.herd.adultSheepCount || 16,
          growingLambsCount: livestockState.herd.growingLambsCount || 6,
          horsesFlockCount: 0,
          adultDraftHorses: 0,
          growingFoalsCount: 0,
        },
      });
      setSpeciesFeedback('🐑 Zmieniono profil na Fermę Owiec! Cały dotychczasowy zapas produktów ze starego stada przepadł!');
    } else {
      handleUpdateLivestock({
        activeSpecies: 'horses',
        storage: emptiedStorage,
        herd: {
          ...livestockState.herd,
          milkingGroupCows: 0,
          growingGroupCalves: 0,
          sheepFlockCount: 0,
          adultSheepCount: 0,
          growingLambsCount: 0,
          horsesFlockCount: livestockState.herd.adultDraftHorses ? (livestockState.herd.adultDraftHorses + (livestockState.herd.growingFoalsCount || 4)) : 14,
          adultDraftHorses: livestockState.herd.adultDraftHorses || 10,
          growingFoalsCount: livestockState.herd.growingFoalsCount || 4,
        },
      });
      setSpeciesFeedback('🐎 Zmieniono profil na Hodowlę Koni! Cały dotychczasowy zapas produktów ze starego stada przepadł!');
    }

    setPendingSpeciesChange(null);
    setTimeout(() => setSpeciesFeedback(null), 5000);
  };

  const currentSpecies = livestockState.activeSpecies;

  return (
    <div className="space-y-4">
      {/* WYBÓR PROFILU HODOWLANEGO (KOMPAKTOWY PASEK JAK W FARMIE ZBOŻOWEJ) */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl px-4 py-2.5 shadow-inner flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] uppercase font-mono font-bold text-amber-400 tracking-wider">
          Profil Hodowlany (1 Gatunek):
        </span>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (currentSpecies !== 'cattle') setPendingSpeciesChange('cattle');
            }}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentSpecies === 'cattle'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🐄</span>
            <span>Bydło</span>
          </button>

          <button
            onClick={() => {
              if (currentSpecies !== 'sheep') setPendingSpeciesChange('sheep');
            }}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentSpecies === 'sheep'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🐑</span>
            <span>Owce</span>
          </button>

          <button
            onClick={() => {
              if (currentSpecies !== 'horses') setPendingSpeciesChange('horses');
            }}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentSpecies === 'horses'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🐎</span>
            <span>Konie</span>
          </button>
        </div>
      </div>

      {/* MODAL OSTRZEŻENIA O ZMIANIE PROFILU I UTRACIE ZAPASÓW */}
      {pendingSpeciesChange && (
        <div className="bg-rose-950/80 border-2 border-rose-500 p-4 rounded-2xl space-y-3 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <span>⚠️</span>
            <span>Ostrzeżenie o Zmianie Profilu Hodowlanego!</span>
          </div>
          <p className="text-xs text-rose-100 leading-[2.5]">
            Czy na pewno chcesz zmienić profil na{' '}
            <strong>
              {pendingSpeciesChange === 'cattle'
                ? 'Fermę Bydła 🐄'
                : pendingSpeciesChange === 'sheep'
                ? 'Fermę Owiec 🐑'
                : 'Hodowlę Koni 🐎'}
            </strong>?
            <br />
            <strong>BEZWZGLĘDNA UWAGA:</strong> Zmiana profilu spowoduje{' '}
            <span className="text-rose-400 font-bold uppercase underline">
              całkowite przepadnięcie (utratę)
            </span>{' '}
            wszystkich dotychczasowych zapasów produktów (mleko, obornik, wełna) oraz wymianę stada!
            Zaleca się wyprzedać wszystkie towary przed zmianą profilu.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              onClick={() => setPendingSpeciesChange(null)}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer leading-[2.5]"
            >
              Anuluj (Zatrzymaj towar)
            </button>
            <button
              onClick={handleConfirmSwitchSpecies}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer leading-[2.5]"
            >
              Tak, zmień profil i zutylizuj zapasy
            </button>
          </div>
        </div>
      )}

      {/* 4 GŁÓWNE ZAKŁADKI FERMY ZWIERZĘCEJ */}
      <div className="flex bg-stone-950/80 p-1 rounded-2xl border border-stone-800 text-xs gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🧬</span>
          <span>
            {currentSpecies === 'cattle'
              ? 'Cykl Rozrodu (4 Etapy)'
              : currentSpecies === 'sheep'
              ? 'Cykl Rozrodu (4 Etapy)'
              : 'Cykl Rozrodu (4 Etapy)'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('herd')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'herd'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">{currentSpecies === 'cattle' ? '🐄' : currentSpecies === 'sheep' ? '🐑' : '🐎'}</span>
          <span>
            {currentSpecies === 'cattle'
              ? 'Stado (2 Grupy)'
              : currentSpecies === 'sheep'
              ? 'Stado Owiec'
              : 'Stado Koni'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('crew')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'crew'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">👥</span>
          <span>Kadra i Specjaliści</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'storage'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-md ring-1 ring-emerald-400/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-base">🏛️</span>
          <span>Magazyn i Hałda</span>
        </button>
      </div>

      {/* ZAWARTOŚĆ AKTYWNEJ ZAKŁADKI */}
      {speciesFeedback && (
        <div className="bg-amber-500/20 border border-amber-400 text-amber-200 text-xs p-3 rounded-2xl font-bold animate-fadeIn">
          {speciesFeedback}
        </div>
      )}

      {activeTab === 'pipeline' && (
        <LivestockPipeline
          state={livestockState}
          clock={clock}
          onUpdateState={handleUpdateLivestock}
          onGoToCrewTab={() => setActiveTab('crew')}
        />
      )}

      {activeTab === 'herd' && (
        <LivestockHerdTab
          state={livestockState}
          clockDay={clock?.date.day ?? 1}
          onUpdateState={handleUpdateLivestock}
        />
      )}

      {activeTab === 'crew' && (
        <LivestockCrewTab
          state={livestockState}
          onUpdateState={handleUpdateLivestock}
        />
      )}

      {activeTab === 'storage' && (
        <LivestockStorageBins
          state={livestockState}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateState={handleUpdateLivestock}
        />
      )}
    </div>
  );
};
