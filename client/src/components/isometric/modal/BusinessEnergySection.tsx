import React from 'react';
import type { BuildingState, BusinessEnergySource, BusinessEnergyScale } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { ENERGY_SOURCES_INFO, SCALE_CONFIG } from './energyConfig';
import { HorsePurchaseOfferPanel } from './HorsePurchaseOfferPanel';
import { HorseFeedStoragePanel } from './HorseFeedStoragePanel';
import { CoalPurchaseOfferPanel } from './CoalPurchaseOfferPanel';
import { loadGameParameters } from '../admin/gameParameters';
import { WorkingHorsesRoster } from './WorkingHorsesRoster';
import { getHorseEffectiveCapacityHa } from './horseEnergyMath';

interface BusinessEnergySectionProps {
  buildingId?: string;
  businessTitle: string;
  energySource?: BusinessEnergySource;
  energyScale: BusinessEnergyScale;
  hasGreenRelief: boolean;
  allowedSources?: BusinessEnergySource[];
  buildingState?: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const BusinessEnergySection: React.FC<BusinessEnergySectionProps> = ({
  buildingId,
  businessTitle,
  energySource,
  energyScale,
  hasGreenRelief,
  allowedSources,
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  const availableEntries = (
    Object.entries(ENERGY_SOURCES_INFO) as [
      BusinessEnergySource,
      (typeof ENERGY_SOURCES_INFO)[BusinessEnergySource],
    ][]
  ).filter(([key]) => !allowedSources || allowedSources.includes(key));

  const effectiveSourceKey: BusinessEnergySource | null =
    energySource && (!allowedSources || allowedSources.includes(energySource))
      ? energySource
      : null;

  const isFarmHorseOnly = allowedSources?.length === 1 && allowedSources[0] === 'konie';
  const rawSource = effectiveSourceKey ? ENERGY_SOURCES_INFO[effectiveSourceKey] : null;
  const currentSource =
    isFarmHorseOnly && (effectiveSourceKey === 'konie' || effectiveSourceKey === null)
      ? {
          ...ENERGY_SOURCES_INFO.konie,
          name: 'Konie Pociągowe',
          description:
            'Tradycyjna siła pociągowa w rolnictwie 1880 r. Konie pociągowe obsługują orkę, bronowanie, siew oraz transport plonów wozami.',
        }
      : rawSource;
  const currentScale = SCALE_CONFIG[energyScale || 'standard'];
  const finalCost = currentSource ? (currentSource.baseCost * currentScale.multiplier).toFixed(2) : '0.00';
  const finalEfficiency = currentSource ? Math.round(currentSource.baseEfficiency * currentScale.effMultiplier) : 0;
  const chimneyTax = currentSource && currentSource.hasChimneyTax && !hasGreenRelief ? 5.0 : 0.0;

  if (isFarmHorseOnly) {
    const ownedHorses = buildingState?.ownedHorses || [];
    const activeHorsesCount = ownedHorses.filter((h) => !h.isDeceased).length;
    const params = loadGameParameters();
    const dailyFeedKg = Number((activeHorsesCount * params.horseDailyFeedKg).toFixed(1));
    const workAreaHa = getHorseEffectiveCapacityHa(ownedHorses, params.horseWorkCapacityHa);

    return (
      <div className="space-y-3 animate-fade-in">
        <HorsePurchaseOfferPanel
          ownedHorses={ownedHorses}
          buildingState={buildingState}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateAnyBuildingState={onUpdateAnyBuildingState}
          onUpdateState={onUpdateState}
        />

        <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-700/70 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-stone-300">
            🐎 Moc robocza: <strong className="text-emerald-300">{workAreaHa} ha</strong> ({params.horseWorkCapacityHa} ha/koń przy 100%)
          </span>
          <span className="text-stone-300">
            🌾 Zużycie paszy: <strong className="text-amber-300">{dailyFeedKg} kg/dzień</strong> ({params.horseDailyFeedKg} kg/koń)
          </span>
        </div>

        <WorkingHorsesRoster
          horses={ownedHorses}
          perHorseHa={params.horseWorkCapacityHa || 5}
        />

        <HorseFeedStoragePanel
          buildingId={buildingId}
          ownedHorsesCount={activeHorsesCount}
          horseFeedStockKg={buildingState?.horseFeedStockKg ?? 0}
          horseStrawStockKg={buildingState?.horseStrawStockKg ?? 0}
          horseFeedOrder={buildingState?.horseFeedOrder}
          horseStrawOrder={buildingState?.horseStrawOrder}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onUpdateState={onUpdateState}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
        <span className="text-xl">⚙️</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-amber-200 text-xs uppercase tracking-wider">
              Zasilanie Napędu Maszyn • {businessTitle}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Wybór Inwestora
            </span>
          </div>
          <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
            {allowedSources?.length === 1 && allowedSources[0] === 'konie'
              ? 'W 1880 roku w rolnictwie nie było jeszcze prądu ani gazu — jedynym źródłem napędu i siły pociągowej są konie robocze.'
              : 'Wybierz sposób zasilania urządzeń produkcyjnych: zakup prądu/pary z sieci miejskiej lub własny kocioł i palenisko.'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          1. Wybierz źródło napędu i paliwa ({availableEntries.length} {availableEntries.length === 1 ? 'opcja' : 'opcji'})
        </label>
        {!effectiveSourceKey && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 font-semibold">
            ⚠️ Brak wybranego źródła napędu i paliwa — wybierz poniżej, aby uruchomić budynek.
          </div>
        )}
        <div className="space-y-2">
          {availableEntries.map(
            ([key, rawInfo]) => {
              const info =
                isFarmHorseOnly && key === 'konie'
                  ? {
                      ...rawInfo,
                      name: 'Konie Pociągowe',
                      description:
                        'Tradycyjna siła pociągowa w rolnictwie 1880 r. Konie pociągowe obsługują orkę, bronowanie, siew oraz transport plonów wozami.',
                    }
                  : rawInfo;
              const isSelected = effectiveSourceKey === key;
              return (
                <div
                  key={key}
                  onClick={() => onUpdateState({ businessEnergySource: key })}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{info.icon}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-stone-100">{info.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">
                          {info.badge}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${info.emissionBadgeColor}`}>
                          {info.emissionLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-tight">{info.description}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400 pt-0.5">
                        <span>🚚 {info.logistics}</span>
                        {info.hasChimneyTax && (
                          <span className={hasGreenRelief ? 'text-emerald-400' : 'text-red-400'}>
                            {hasGreenRelief ? '🌿 Zwolniony z opłaty dymowej' : '🌫️ Opłata dymowa: +£5.00/msc'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-base font-bold text-emerald-400 block">
                      £ {info.baseCost.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">/ msc</span>
                    <span className="text-[10px] font-mono text-amber-300 block mt-1">
                      Sprawność: {info.baseEfficiency}%
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {effectiveSourceKey === 'konie' && (
        <div className="space-y-3">
          <HorsePurchaseOfferPanel
            ownedHorses={buildingState?.ownedHorses || []}
            buildingState={buildingState}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
            onSpendGold={onSpendGold}
            onUpdateAnyBuildingState={onUpdateAnyBuildingState}
            onUpdateState={onUpdateState}
          />
          <WorkingHorsesRoster
            horses={buildingState?.ownedHorses || []}
            perHorseHa={loadGameParameters().horseWorkCapacityHa || 5}
          />
          <HorseFeedStoragePanel
            buildingId={buildingId}
            ownedHorsesCount={(buildingState?.ownedHorses || []).filter((h) => !h.isDeceased).length}
            horseFeedStockKg={buildingState?.horseFeedStockKg ?? 0}
            horseStrawStockKg={buildingState?.horseStrawStockKg ?? 0}
            horseFeedOrder={buildingState?.horseFeedOrder}
            horseStrawOrder={buildingState?.horseStrawOrder}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
            onUpdateState={onUpdateState}
          />
        </div>
      )}

      {(effectiveSourceKey === 'wegiel' || effectiveSourceKey === 'wegiel_drzewny') && (
        <CoalPurchaseOfferPanel
          fuelKind={effectiveSourceKey}
          coalStockTons={
            effectiveSourceKey === 'wegiel_drzewny'
              ? (buildingState?.charcoalStockTons ?? 0)
              : (buildingState?.coalStockTons ?? 0)
          }
          coalOrder={
            effectiveSourceKey === 'wegiel_drzewny'
              ? buildingState?.charcoalOrder
              : buildingState?.coalOrder
          }
          coalInterventionBuyEnabled={buildingState?.coalInterventionBuyEnabled}
          energyScale={energyScale || 'standard'}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onSpendGold={onSpendGold}
          onUpdateAnyBuildingState={onUpdateAnyBuildingState}
          onUpdateState={onUpdateState}
        />
      )}

      <div>
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          2. Tryb pracy i obciążenie instalacji
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(SCALE_CONFIG) as [BusinessEnergyScale, typeof SCALE_CONFIG[BusinessEnergyScale]][]).map(
            ([scaleKey, conf]) => {
              const isSelected = (energyScale || 'standard') === scaleKey;
              return (
                <button
                  key={scaleKey}
                  type="button"
                  onClick={() => onUpdateState({ businessEnergyScale: scaleKey })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-sm ring-1 ring-amber-400/30'
                      : 'bg-stone-800/50 border-stone-700/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <p className="font-bold text-xs">{conf.label}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{conf.sub}</p>
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-700/70 flex items-center justify-between shadow-inner">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-amber-300 font-bold">Miesięczny Rachunek Energii:</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
              {currentSource ? `${currentSource.name} (${currentScale.label})` : 'Nie wybrano'}
            </span>
          </div>
          <p className="text-[11px] text-stone-400">
            {currentSource
              ? `Zawiera koszt paliwa/przesyłu (${finalCost})${chimneyTax > 0 ? ` + opłata za dym kominowy (£ ${chimneyTax.toFixed(2)})` : ''}`
              : 'Wybierz źródło napędu i paliwa powyżej.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-mono font-black text-emerald-400">
            £ {(parseFloat(finalCost) + chimneyTax).toFixed(2)}
          </span>
          <span className="text-[10px] font-mono text-stone-400 block">/ msc</span>
          <span className="text-[10px] font-mono text-amber-300 block">
            Efektywność produkcji: {finalEfficiency}%
          </span>
        </div>
      </div>
    </div>
  );
};
