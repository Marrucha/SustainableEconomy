import React, { useState } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import { canDemolishBuildingWithPastureRules, countAttachedWheatFields, findConnectedWheatFarm } from './pastureTopology';
import { FarmSection } from './modal/FarmSection';
import { FlaxSection } from './modal/flax/FlaxSection';
import { HopSection } from './modal/hop/HopSection';
import { OrchardSection } from './modal/orchard/OrchardSection';
import { FRUITS_CONFIG } from './modal/orchard/orchardTypes';
import { LivestockSection } from './modal/livestock/LivestockSection';
import { MineSection } from './modal/mine/MineSection';
import { WoodcutterSection } from './modal/woodcutter/WoodcutterSection';
import { ResidentialSection } from './modal/ResidentialSection';
import { IndustrySection } from './modal/IndustrySection';
import { TownHallSection } from './modal/TownHallSection';
import { MarketplaceSection } from './modal/MarketplaceSection';
import { computeCityHousingStatus } from './cityAutoGrowth';
import type { UseGameClockReturn } from './clock/useGameClock';
import { formatGameDate } from './clock/gameClockTypes';
import { checkIsProductionReady, createDefaultFarmCapitalismState } from './modal/farmGridTypes';
import type { WorldSupplierBuilding } from './modal/industrySupplyConfig';
import { ProductInventoryCard } from './modal/ProductInventoryCard';
import { FarmLivestockProductsTab } from './modal/FarmLivestockProductsTab';
import { FarmLivestockFinanceTab } from './modal/FarmLivestockFinanceTab';
import { INDUSTRY_PROFILES } from './modal/industryProfiles';
import { computeFactoryStaffMetrics } from './modal/industryStaffMath';
import { computeMonthlyProductionUnits } from './modal/industryContracts';

interface BuildingModalProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  placedBuildings?: PlacedBuilding[];
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  cityPlayersCount?: number;
  onAddNewCityPlayer?: () => void;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
  onRenameBuilding?: (buildingId: string, newName: string) => void;
  onClose: () => void;
  onDemolish: () => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  buildingState,
  placedBuildings = [],
  allWorldBuildings = [],
  buildingsState = {},
  clock,
  cityPlayersCount,
  onAddNewCityPlayer,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
  onRenameBuilding,
  onClose,
  onDemolish,
}) => {
  const isFarm = building.typeId === 'wheat_farm';
  const isWheatField = building.typeId === 'wheat_field';
  const isFlax = building.typeId === 'flax_farm' || building.typeId === 'flax_field';
  const isHop = building.typeId === 'hop_farm' || building.typeId === 'hop_field';
  const isOrchard = building.typeId.startsWith('orchard');
  const isLivestock =
    building.typeId === 'livestock_farm' ||
    building.typeId === 'pasture_cattle' ||
    building.typeId === 'pasture_sheep';
  const isMine = building.typeId.startsWith('mine_');
  const isWoodcutter = building.typeId === 'woodcutter';
  const isResidential = building.typeId.startsWith('tenement');
  const isTownHall = building.typeId === 'town_hall';
  const isMarketplace = building.typeId === 'marketplace';
  const isPark = building.typeId === 'oak';
  const isBusiness = isFarm || isFlax || isHop || isOrchard || isLivestock || isMine || isWoodcutter || (!isWheatField && !isResidential && !isTownHall && !isMarketplace && !isPark);

  const validation = canDemolishBuildingWithPastureRules(building, placedBuildings);

  const [businessTab, setBusinessTab] = useState<'production' | 'products' | 'energy' | 'finance'>('production');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2.5 animate-fade-in select-none">
      <div
        className={`relative w-full ${
          isFarm || isFlax || isHop || isLivestock || isOrchard || isMine || isWoodcutter ? 'max-w-6xl' : isTownHall ? 'max-w-5xl' : isBusiness ? 'max-w-2xl' : 'max-w-xl'
        } bg-stone-900/95 border border-amber-500/50 rounded-3xl p-3.5 shadow-2xl text-stone-200 font-sans max-h-[95vh] flex flex-col transition-all duration-200`}
      >
        {/* NAGŁÓWEK (JEDNA LINIA: EPOKA + NAZWA BUDYNKU PO LEWEJ | PRĘDKOŚĆ + STATUS + ZAMKNIJ PO PRAWEJ) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <span className="text-xs tracking-wider uppercase font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shrink-0">
              Epoka 1 • {clock ? formatGameDate(clock.date) : '1880'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-100 truncate">
              {(() => {
                const displayName =
                  building.typeId === 'livestock_farm' && building.name === 'Farma Bydła i Owiec'
                    ? 'Farma Hodowlana'
                    : building.name;
                return isOrchard && buildingState.orchardState?.isFruitLocked && buildingState.orchardState?.fruitType
                  ? `${displayName} • ${FRUITS_CONFIG[buildingState.orchardState.fruitType]?.name || ''}`
                  : displayName;
              })()}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {clock && (
              <div className="flex items-center gap-1.5 font-mono mr-1">
                <button
                  onClick={clock.togglePlay}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  {clock.isPlaying ? '⏸️' : '▶️'}
                </button>
                {[1, 2, 5].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => clock.setSpeed(sp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      clock.speed === sp ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white bg-stone-800/80 border border-stone-700'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            )}
            {isFarm && (() => {
              const rawCap = buildingState.farmCapitalism;
              const farmCap =
                rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
                  ? rawCap
                  : createDefaultFarmCapitalismState();
              const farmReady = checkIsProductionReady(farmCap).isReady;
              return (
                <span
                  title={farmReady ? 'Przepływ aktywny' : 'Brak pełnej obsady'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    farmReady
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  }`}
                >
                  {farmReady ? '✓' : '✕'}
                </span>
              );
            })()}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ZAKŁADKI DLA BIZNESU (ZARZĄDZANIE / ZAKUP ENERGII) */}
        {isBusiness && (
          <div className="mt-1 mb-0 flex-shrink-0">
            <div className="bg-stone-950/80 p-0.5 rounded-xl border border-stone-800 shadow-inner flex gap-1">
              <button
                onClick={() => setBusinessTab('production')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  businessTab === 'production'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-sm">{isFarm ? '🌾' : isOrchard ? '🍎' : isLivestock ? '🐄' : isMine ? '⛏️' : isWoodcutter ? '🪓' : '⚙️'}</span>
                <span className="tracking-wide">
                  {isFarm ? 'Uprawa i Załoga' : isOrchard ? 'Sadownictwo i Załoga' : isLivestock ? 'Hodowla i Załoga' : isMine ? 'Wydobycie i Załoga' : isWoodcutter ? 'Zrąb i Składnica' : 'Profil Produkcji'}
                </span>
              </button>

              <button
                onClick={() => setBusinessTab('products')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  businessTab === 'products'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-sm">📦</span>
                <span className="tracking-wide">Produkty</span>
              </button>

              <button
                onClick={() => setBusinessTab('energy')}
                className={`relative flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  businessTab === 'energy'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-sm">⚡</span>
                <span className="tracking-wide">Zakup Energii do Produkcji</span>
                {isFarm && (buildingState.ownedHorses?.length ?? 0) >= 1 && (
                  <span
                    className="ml-auto w-4 h-4 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm"
                    title="Energia (konie robocze) zapewniona"
                  >
                    ✓
                  </span>
                )}
              </button>

              {(isFarm || isLivestock) && (
                <button
                  onClick={() => setBusinessTab('finance')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    businessTab === 'finance'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-sm">📊</span>
                  <span className="tracking-wide">Finanse — Zestawienie</span>
                </button>
              )}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1 mb-0" />
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
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1.5 mb-0.5" />
          </div>
        )}

        {/* ZAWARTOŚĆ SPECYFICZNA DLA TYPU BUDYNKU */}
        <div className="py-1.5 px-1 space-y-2 text-sm overflow-y-auto flex-1">
          {businessTab === 'finance' && (isFarm || isLivestock) ? (
            <FarmLivestockFinanceTab
              building={building}
              buildingState={buildingState}
              attachedFieldsCount={countAttachedWheatFields(building, placedBuildings)}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onUpdateState={onUpdateState}
            />
          ) : isBusiness && businessTab === 'products' && (isFarm || isLivestock) ? (
            <FarmLivestockProductsTab
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
            />
          ) : isBusiness && businessTab === 'products' ? (
            (() => {
              const profile = INDUSTRY_PROFILES[building.typeId];
              const activeTargetId = buildingState.productionTarget || profile?.options[0]?.id;
              const activeOption =
                profile?.options.find((o) => o.id === activeTargetId) || profile?.options[0];
              const productName = activeOption ? activeOption.label : building.name;
              const staffMetrics = computeFactoryStaffMetrics(
                building.sizeX,
                building.sizeY,
                buildingState
              );
              const monthlyCap = computeMonthlyProductionUnits(
                staffMetrics.workersCount,
                staffMetrics.totalProductionPercent,
                buildingState
              );
              return (
                <ProductInventoryCard
                  productName={productName}
                  buildingName={building.name}
                  buildingState={buildingState}
                  monthlyCapacityUnits={monthlyCap}
                  sellerActive={Boolean(buildingState.factorySellerHired || isFarm || isMine || isLivestock || isOrchard || isFlax || isHop || isWoodcutter)}
                  onUpdateState={onUpdateState}
                />
              );
            })()
          ) : (
            <>
          {isWheatField && (() => {
            const parentFarm = findConnectedWheatFarm(building, placedBuildings);
            return (
              <div className="bg-stone-950/90 border border-amber-500/50 rounded-2xl p-6 text-center space-y-3 shadow-inner">
                <div className="text-4xl">🌾</div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  Pole należy do: {parentFarm ? parentFarm.name : 'Farmy Zbożowej'}
                </h3>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  To pole uprawne (+1 ha • +150 kg wysiewu • +2 t bazowego plonu) jest częścią powyższego gospodarstwa. Załogą, produkcją, spichlerzem i końmi pociągowymi zarządzasz bezpośrednio w oknie farmy.
                </p>
              </div>
            );
          })()}

          {isFarm && (
            <FarmSection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              attachedFieldsCount={countAttachedWheatFields(building, placedBuildings)}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onSpendGold={onSpendGold}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onRenameBuilding={onRenameBuilding}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isFlax && (
            <FlaxSection
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isHop && (
            <HopSection
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isOrchard && (
            <OrchardSection
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isLivestock && (
            <LivestockSection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onSpendGold={onSpendGold}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onRenameBuilding={onRenameBuilding}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isMine && (
            <MineSection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isWoodcutter && (
            <WoodcutterSection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
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

          {isBusiness && !isFarm && !isFlax && !isHop && !isOrchard && !isLivestock && !isMine && !isWoodcutter && (
            <IndustrySection
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab={businessTab === 'energy' ? 'energy' : 'production'}
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
            />
          )}

          {isTownHall && (
            <TownHallSection
              activeReliefs={activeReliefs}
              onToggleRelief={toggleRelief}
              cityHousingStatus={computeCityHousingStatus(
                allWorldBuildings.filter((b) => b.mapType !== 'rural'),
                buildingsState
              )}
              cityPlayersCount={cityPlayersCount}
              onAddNewCityPlayer={onAddNewCityPlayer}
            />
          )}

          {isMarketplace && (
            <MarketplaceSection
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
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
            </>
          )}
        </div>

        {/* DOLNE PRZYCISKI AKCJI */}
        <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-stone-800 flex-shrink-0">
          {isTownHall || isMarketplace || building.typeId === 'city_miniature' ? (
            <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
              <span>🏛️ Stały Budynek Miejski (Obiekt Nienaruszalny)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (validation.allowed) {
                    onDemolish();
                  } else {
                    alert(validation.reason);
                  }
                }}
                disabled={!validation.allowed}
                title={validation.allowed ? 'Wyburz ten budynek' : validation.reason}
                className={`px-4 py-2 border text-xs font-bold rounded-xl transition-colors ${
                  validation.allowed
                    ? 'bg-red-950/60 hover:bg-red-900 border-red-700/50 text-red-200 cursor-pointer'
                    : 'bg-stone-800/60 border-stone-700/50 text-stone-400 cursor-not-allowed opacity-50'
                }`}
              >
                🗑️ Wyburz budynek
              </button>
              {!validation.allowed && (
                <span className="text-[11px] text-amber-300 max-w-xs truncate" title={validation.reason}>
                  ⚠️ {validation.reason}
                </span>
              )}
            </div>
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
