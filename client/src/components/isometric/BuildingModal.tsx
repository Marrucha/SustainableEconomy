import React, { useState } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import { FarmSection } from './modal/FarmSection';
import { ResidentialSection } from './modal/ResidentialSection';
import { IndustrySection } from './modal/IndustrySection';
import { TownHallSection } from './modal/TownHallSection';

interface BuildingModalProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  onUpdateState: (updates: Partial<BuildingState>) => void;
  onClose: () => void;
  onDemolish: () => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  buildingState,
  onUpdateState,
  onClose,
  onDemolish,
}) => {
  const isFarm = building.typeId === 'wheat_farm';
  const isResidential = building.typeId.startsWith('tenement');
  const isTownHall = building.typeId === 'town_hall';
  const isPark = building.typeId === 'oak';
  const isBusiness = isFarm || (!isResidential && !isTownHall && !isPark);

  const [businessTab, setBusinessTab] = useState<'production' | 'energy'>('production');
  const [residentialTab, setResidentialTab] = useState<'rent' | 'energy'>('rent');

  const activeReliefs = buildingState.appliedTaxReliefs || {};
  const hasGreenRelief = Boolean(activeReliefs['green_ecology']);

  const toggleRelief = (reliefId: string) => {
    onUpdateState({
      appliedTaxReliefs: {
        ...activeReliefs,
        [reliefId]: !activeReliefs[reliefId],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div
        className={`relative w-full ${
          isTownHall ? 'max-w-4xl' : isBusiness ? 'max-w-2xl' : 'max-w-xl'
        } bg-stone-900/95 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-stone-200 font-sans max-h-[88vh] flex flex-col transition-all duration-200`}
      >
        {/* NAGŁÓWEK */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Epoka 1 • Rok 1880
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Działka: {building.sizeX}x{building.sizeY} kratek
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-amber-100 mt-1">
              {building.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ZAKŁADKI DLA BIZNESU (ZARZĄDZANIE / ZAKUP ENERGII) */}
        {isBusiness && (
          <div className="mt-3 mb-1 flex-shrink-0">
            <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
              <button
                onClick={() => setBusinessTab('production')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  businessTab === 'production'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">{isFarm ? '🌾' : '⚙️'}</span>
                <span className="tracking-wide">{isFarm ? 'Uprawa i Załoga' : 'Profil Produkcji'}</span>
              </button>

              <button
                onClick={() => setBusinessTab('energy')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  businessTab === 'energy'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">⚡</span>
                <span className="tracking-wide">Zakup Energii do Produkcji</span>
              </button>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-3 mb-1" />
          </div>
        )}

        {/* ZAKŁADKI DLA KAMIENIC (NAJEM / OGRZEWANIE I ENERGIA) */}
        {isResidential && (
          <div className="mt-3 mb-1 flex-shrink-0">
            <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
              <button
                onClick={() => setResidentialTab('rent')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  residentialTab === 'rent'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">🪙</span>
                <span className="tracking-wide">Czynsz i Standard</span>
              </button>

              <button
                onClick={() => setResidentialTab('energy')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  residentialTab === 'energy'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">🔥</span>
                <span className="tracking-wide">Ogrzewanie i Energia</span>
              </button>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-3 mb-1" />
          </div>
        )}

        {/* ZAWARTOŚĆ SPECYFICZNA DLA TYPU BUDYNKU */}
        <div className="py-4 space-y-5 text-sm overflow-y-auto flex-1 pr-1">
          {isFarm && (
            <FarmSection
              buildingState={buildingState}
              businessTab={businessTab}
              hasGreenRelief={hasGreenRelief}
              onUpdateState={onUpdateState}
            />
          )}

          {isResidential && (
            <ResidentialSection
              buildingState={buildingState}
              residentialTab={residentialTab}
              onUpdateState={onUpdateState}
            />
          )}

          {isBusiness && !isFarm && (
            <IndustrySection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab}
              hasGreenRelief={hasGreenRelief}
              onUpdateState={onUpdateState}
            />
          )}

          {isTownHall && (
            <TownHallSection
              activeReliefs={activeReliefs}
              onToggleRelief={toggleRelief}
            />
          )}

          {isPark && (
            <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-2">
              <p className="text-xs font-bold text-emerald-400">Efekt Środowiskowy Parku Miejskiego:</p>
              <p className="text-xs text-stone-300">
                +18% Zadowolenie okolicznych mieszkańców, -12% zanieczyszczenia smogowego.
              </p>
            </div>
          )}
        </div>

        {/* DOLNE PRZYCISKI AKCJI */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-800 flex-shrink-0">
          {isTownHall ? (
            <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
              <span>🏛️ Siedziba Magistratu (Obiekt Nienaruszalny)</span>
            </div>
          ) : (
            <button
              onClick={onDemolish}
              className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              🗑️ Wyburz budynek
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zapisz i Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
