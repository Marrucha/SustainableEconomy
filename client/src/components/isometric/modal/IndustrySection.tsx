import React from 'react';
import type { PlacedBuilding, BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';
import { INDUSTRY_PROFILES } from './industryProfiles';
import { IndustryPipelineCard } from './IndustryPipelineCard';
import { NewspaperAdPanel } from './NewspaperAdPanel';
import type { WorldSupplierBuilding } from './industrySupplyConfig';

import type { UseGameClockReturn } from '../clock/useGameClock';

interface IndustrySectionProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
}

export const IndustrySection: React.FC<IndustrySectionProps> = ({
  building,
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  businessTab,
  hasGreenRelief,
  clock,
  onSpendGold,
  onUpdateState,
  onUpdateAnyBuildingState,
}) => {
  const profile = INDUSTRY_PROFILES[building.typeId];
  const isCoalPlant = building.typeId === 'coal_plant';
  const isSteamPowered = [
    'mill',
    'sawmill',
    'spinning_mill',
    'sewing_factory',
    'brewery',
    'tannery',
    'dairy',
    'slaughterhouse',
    'furniture_factory',
    'huta',
    'cement_plant',
    'brickworks',
    'factory',
    'sugar_refinery',
    'rolling_mill',
  ].includes(building.typeId);

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={building.name}
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

  // Zakładka 'production'
  if (profile) {
    const activeTarget = buildingState.productionTarget || profile.options[0]?.id;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            {profile.icon} {profile.title}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {profile.options.map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTarget === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">{profile.inputLabel}</span>
            <span className="font-mono font-bold text-amber-300">{profile.inputValue}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">{profile.outputLabel}</span>
            <span className="font-mono font-bold text-emerald-400">{profile.outputValue}</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/60 pt-2">
            {profile.description}
          </p>
        </div>

        <IndustryPipelineCard
          building={building}
          buildingState={buildingState}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          isSteamPowered={isSteamPowered}
          clock={clock}
          onSpendGold={onSpendGold}
          onUpdateState={onUpdateState}
        />

        {building.typeId === 'newspaper_publisher' && (
          <NewspaperAdPanel
            buildingState={buildingState}
            onSpendGold={onSpendGold}
            onUpdateState={onUpdateState}
          />
        )}
      </div>
    );
  }

  if (isCoalPlant) {
    return (
      <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-mono text-amber-400 font-semibold">Generacja Mocy:</span>
          <span className="font-mono text-base font-bold text-emerald-400">+350 kWh / cykl</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          Elektrociepłownia zasila miejską sieć energetyczną dla fabryk i dostarcza parę technologiczną do kamienic wzdłuż nabrzeża.
        </p>
      </div>
    );
  }

  // Domyślny widok dla pozostałych zakładów (Piekarnia, Kuźnia, etc.)
  return (
    <div className="space-y-4">
      <div className="p-4 bg-stone-800/40 rounded-xl border border-stone-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-200">Przedsiębiorstwo Komercyjne / Przemysłowe</span>
          <p className="text-[11px] text-stone-400">Zakład wymaga stałego zasilania napędu do maszyn i urządzeń.</p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Biznes Aktywny
        </span>
      </div>

      <IndustryPipelineCard
        building={building}
        buildingState={buildingState}
        allWorldBuildings={allWorldBuildings}
        buildingsState={buildingsState}
        isSteamPowered={isSteamPowered}
        clock={clock}
        onUpdateState={onUpdateState}
      />
    </div>
  );
};
