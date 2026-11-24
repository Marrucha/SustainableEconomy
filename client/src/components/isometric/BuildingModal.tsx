import React, { useRef, useState } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import { HorseMaintenanceWarningModal } from './modal/HorseMaintenanceWarningModal';
import { canDemolishBuildingWithPastureRules, countAttachedWheatFields, findConnectedWheatFarm } from './pastureTopology';
import { FarmSection } from './modal/FarmSection';
import { FarmStorageBins } from './modal/FarmStorageBins';
import { createDefaultFarmCapitalismState } from './modal/farmGridTypes';
import { FlaxSection } from './modal/flax/FlaxSection';
import { HopSection } from './modal/hop/HopSection';
import { OrchardSection } from './modal/orchard/OrchardSection';
import { LivestockSection } from './modal/livestock/LivestockSection';
import { MineSection } from './modal/mine/MineSection';
import { MineProductsTab } from './modal/mine/MineProductsTab';
import { MineStorageBins } from './modal/mine/MineStorageBins';
import { MineFinanceTab } from './modal/mine/MineFinanceTab';
import { LivestockStorageBins } from './modal/livestock/LivestockStorageBins';
import { createDefaultLivestockState } from './modal/livestock/livestockTypes';
import { WoodcutterSection } from './modal/woodcutter/WoodcutterSection';
import { MillSection } from './modal/mill/MillSection';
import { MillProductsTab } from './modal/mill/MillProductsTab';
import { MillFinanceTab } from './modal/mill/MillFinanceTab';
import { MillRecipesTab } from './modal/mill/MillRecipesTab';
import { MillStorageBins } from './modal/mill/MillStorageBins';
import { createDefaultMillState, MILL_PRODUCTS_CONFIG, type MillProductTarget } from './modal/mill/millTypes';
import { BakerySection } from './modal/bakery/BakerySection';
import { BakeryProductsSection } from './modal/bakery/BakeryProductsSection';
import { BakeryFinanceTab } from './modal/bakery/BakeryFinanceTab';
import { BakeryStorageBins } from './modal/bakery/BakeryStorageBins';
import { createDefaultBakeryState } from './modal/bakery/bakeryTypes';
import { loadGameParameters } from './admin/gameParameters';
import { BuildingModalHeader } from './modal/BuildingModalHeader';
import { BuildingModalTabs, type BusinessTabType } from './modal/BuildingModalTabs';
import { ResidentialSection } from './modal/ResidentialSection';
import { IndustrySection } from './modal/IndustrySection';
import { UniversitySection } from './modal/UniversitySection';
import { TradeSchoolSection } from './modal/TradeSchoolSection';
import { TownHallSection } from './modal/TownHallSection';
import { MarketplaceSection } from './modal/MarketplaceSection';
import { GroceryShopSection } from './modal/GroceryShopSection';
import { TradeShipSection } from './modal/TradeShipSection';
import { computeCityHousingStatus } from './cityAutoGrowth';
import type { UseGameClockReturn } from './clock/useGameClock';
import type { WorldSupplierBuilding } from './modal/industrySupplyConfig';
import { ProductInventoryCard } from './modal/ProductInventoryCard';
import { FarmLivestockProductsTab } from './modal/FarmLivestockProductsTab';
import { FarmLivestockFinanceTab } from './modal/FarmLivestockFinanceTab';
import { INDUSTRY_PROFILES } from './modal/industryProfiles';
import { computeFactoryStaffMetrics } from './modal/industryStaffMath';
import { computeMonthlyProductionUnits } from './modal/industryContracts';
import { computeProductionChecklist } from './modal/productionChecklist';
import { BusinessSummaryTab } from './modal/BusinessSummaryTab';

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
  const isMill = building.typeId === 'mill';
  const isBakery = building.typeId === 'bakery';
  const isGroceryShop = building.typeId === 'grocery_shop';
  const isUniversity = building.typeId === 'university';
  const isTradeSchool = building.typeId === 'trade_school';
  const isResidential = building.typeId.startsWith('tenement');
  const isTownHall = building.typeId === 'town_hall';
  const isMarketplace = building.typeId === 'marketplace';
  const isTradeShip = building.typeId === 'trade_ship';
  const isPark = building.typeId === 'oak';
  const isBusiness = isFarm || isFlax || isHop || isOrchard || isLivestock || isMine || isWoodcutter || isMill || isBakery || (!isWheatField && !isResidential && !isTownHall && !isMarketplace && !isTradeShip && !isPark);

  const validation = canDemolishBuildingWithPastureRules(building, placedBuildings);

  const [businessTab, setBusinessTab] = useState<BusinessTabType>('summary');
  const attachedFieldsCount = isFarm ? countAttachedWheatFields(building, placedBuildings) : 0;
  const checklist = isBusiness
    ? computeProductionChecklist(building, buildingState, attachedFieldsCount)
    : undefined;
  const [productsSubTab, setProductsSubTab] = useState<'inventory' | 'recipes'>('inventory');
  const [residentialTab, setResidentialTab] = useState<'rent' | 'energy'>('rent');
  const activeHorsesCount = (buildingState.ownedHorses || []).filter((h) => !h.isDeceased).length;
  const initialHorsesCountRef = useRef<number>(activeHorsesCount);
  const [showHorseCloseWarning, setShowHorseCloseWarning] = useState<boolean>(false);

  const dailyFeedPerHorse = loadGameParameters().horseDailyFeedKg || 10;
  const neededFeedKg = activeHorsesCount * dailyFeedPerHorse * 30;
  const neededStrawKg = activeHorsesCount * 15 * 30;
  const currentFeedOrderKg = buildingState.horseFeedOrder?.monthlyKg ?? 0;
  const currentStrawOrderKg = buildingState.horseStrawOrder?.monthlyKg ?? 0;
  const horsesIncreased = activeHorsesCount > initialHorsesCountRef.current;
  const hasUnderContractedOrder =
    Boolean(buildingState.horseFeedOrder && currentFeedOrderKg < neededFeedKg) ||
    Boolean(buildingState.horseStrawOrder && currentStrawOrderKg < neededStrawKg);
  const needsHorseMaintenanceConfirm =
    activeHorsesCount > 0 &&
    ((horsesIncreased && (currentFeedOrderKg < neededFeedKg || currentStrawOrderKg < neededStrawKg)) ||
      hasUnderContractedOrder);

  const handleAttemptClose = () => {
    if (needsHorseMaintenanceConfirm) {
      setShowHorseCloseWarning(true);
      return;
    }
    onClose();
  };

  const handleAdjustHorseMaintenanceAndClose = () => {
    const existingSupplier =
      buildingState.horseFeedOrder?.supplierId ||
      buildingState.horseStrawOrder?.supplierId ||
      'trade_ship_init';
    const existingContract =
      buildingState.horseFeedOrder?.contractType ||
      buildingState.horseStrawOrder?.contractType ||
      'pay_as_you_go';
    const existingMonths =
      buildingState.horseFeedOrder?.monthsRemaining ??
      buildingState.horseStrawOrder?.monthsRemaining ??
      0;
    onUpdateState({
      horseFeedInterventionBuyEnabled: true,
      horseFeedOrder: {
        supplierId: existingSupplier,
        monthlyKg: neededFeedKg,
        contractType: existingContract,
        monthsRemaining: existingMonths,
      },
      horseStrawOrder: {
        supplierId: existingSupplier,
        monthlyKg: neededStrawKg,
        contractType: existingContract,
        monthsRemaining: existingMonths,
      },
    });
    setShowHorseCloseWarning(false);
    onClose();
  };

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

  const isWideModal =
    isFarm || isFlax || isHop || isLivestock || isOrchard || isMine || isWoodcutter || isMill || isBakery || isGroceryShop || isTownHall || isTradeShip;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/70 backdrop-blur-sm p-2.5 animate-fade-in select-none ${
        isWideModal ? 'items-start pt-[3vh]' : 'items-center'
      }`}
    >
      <div
        className={`relative w-full ${
          isTradeShip
            ? 'max-w-7xl h-[92vh]'
            : isFarm || isFlax || isHop || isLivestock || isOrchard || isMine || isWoodcutter || isMill || isBakery || isGroceryShop
            ? 'max-w-6xl h-[92vh]'
            : isTownHall
            ? 'max-w-5xl h-[92vh]'
            : isBusiness
            ? 'max-w-2xl h-[82vh]'
            : 'max-w-xl max-h-[92vh]'
        } bg-stone-900/95 border border-amber-500/50 rounded-3xl p-3.5 shadow-2xl text-stone-200 font-sans flex flex-col`}
      >
        <BuildingModalHeader
          building={building}
          buildingState={buildingState}
          isFarm={isFarm}
          isOrchard={isOrchard}
          isMill={isMill}
          isBakery={isBakery}
          isMine={isMine}
          checklist={checklist}
          onGoToSummary={() => setBusinessTab('summary')}
          clock={clock}
          onClose={handleAttemptClose}
        />

        <BuildingModalTabs
          isBusiness={isBusiness}
          isResidential={isResidential}
          isFarm={isFarm}
          isLivestock={isLivestock}
          isMill={isMill}
          isBakery={isBakery}
          isMine={isMine}
          isGroceryShop={isGroceryShop}
          checklistOk={
            isGroceryShop
              ? Boolean(
                  (buildingState.groceryShopState?.stageCrew?.supply?.length ?? 0) > 0 &&
                    (buildingState.groceryShopState?.stageCrew?.trader?.length ?? 0) > 0 &&
                    (buildingState.groceryShopState?.stageCrew?.delivery?.length ?? 0) > 0 &&
                    (buildingState.groceryShopState?.sellers?.length ?? 0) <=
                      (buildingState.groceryShopState?.stageCrew?.trader?.length ?? 0) * 3
                )
              : checklist?.allPassed
          }
          businessTab={businessTab}
          residentialTab={residentialTab}
          onSelectBusinessTab={setBusinessTab}
          onSelectResidentialTab={setResidentialTab}
        />

        {/* ZAWARTOŚĆ SPECYFICZNA DLA TYPU BUDYNKU */}
        <div className="py-1.5 px-1 space-y-2 text-sm overflow-y-auto flex-1">
          {isBusiness && isGroceryShop ? (
            <GroceryShopSection
              building={building}
              buildingState={buildingState}
              businessTab={businessTab}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onNavigateTab={setBusinessTab}
              onUpdateState={onUpdateState}
            />
          ) : isBusiness && businessTab === 'summary' && checklist ? (
            <BusinessSummaryTab checklist={checklist} onNavigateTab={setBusinessTab} />
          ) : businessTab === 'finance' && isMine ? (
            <MineFinanceTab buildingState={buildingState} onUpdateState={onUpdateState} />
          ) : businessTab === 'finance' && isBakery ? (
            <BakeryFinanceTab
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onUpdateState={onUpdateState}
            />
          ) : businessTab === 'finance' && isMill ? (
            <MillFinanceTab
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              onUpdateState={onUpdateState}
            />
          ) : businessTab === 'finance' && (isFarm || isLivestock) ? (
            <FarmLivestockFinanceTab
              building={building}
              buildingState={buildingState}
              attachedFieldsCount={countAttachedWheatFields(building, placedBuildings)}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onUpdateState={onUpdateState}
            />
          ) : isBusiness && businessTab === 'trade' && isFarm ? (
            <FarmStorageBins
              currentBuildingId={building.id}
              state={buildingState.farmCapitalism || createDefaultFarmCapitalismState()}
              attachedFieldsCount={countAttachedWheatFields(building, placedBuildings)}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onSpendGold={onSpendGold}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onUpdateState={(patch) => {
                const cur = buildingState.farmCapitalism || createDefaultFarmCapitalismState();
                onUpdateState({ farmCapitalism: { ...cur, ...patch } });
              }}
            />
          ) : isBusiness && businessTab === 'trade' && isLivestock ? (
            <LivestockStorageBins
              buildingId={building.id}
              state={buildingState.livestockState || createDefaultLivestockState()}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onSpendGold={onSpendGold}
              onUpdateState={(patch) => {
                const cur = buildingState.livestockState || createDefaultLivestockState();
                onUpdateState({ livestockState: { ...cur, ...patch } });
              }}
            />
          ) : isBusiness && businessTab === 'trade' && isMine ? (
            <MineStorageBins
              buildingId={building.id}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
            />
          ) : isBusiness && businessTab === 'trade' && isBakery ? (
            <BakeryStorageBins
              buildingId={building.id}
              state={buildingState.bakeryState || createDefaultBakeryState()}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdate={(updates) => {
                const cur = buildingState.bakeryState || createDefaultBakeryState();
                onUpdateState({ bakeryState: { ...cur, ...updates } });
              }}
            />
          ) : isBusiness && businessTab === 'trade' && isMill ? (
            <MillStorageBins
              buildingId={building.id}
              state={buildingState.millState || createDefaultMillState()}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdate={(updates) => {
                const cur = buildingState.millState || createDefaultMillState();
                onUpdateState({ millState: { ...cur, ...updates } });
              }}
            />
          ) : isBusiness && businessTab === 'products' && isMine ? (
            <MineProductsTab buildingState={buildingState} />
          ) : isBusiness && businessTab === 'products' && isBakery ? (
            <BakeryProductsSection buildingState={buildingState} onUpdateState={onUpdateState} />
          ) : isBusiness && businessTab === 'products' && isMill ? (
            <div className="space-y-3">
              <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setProductsSubTab('inventory')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    productsSubTab === 'inventory'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  📦 Stany magazynowe
                </button>
                <button
                  type="button"
                  onClick={() => setProductsSubTab('recipes')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    productsSubTab === 'recipes'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  📜 Przepisy
                </button>
              </div>
              {productsSubTab === 'inventory' ? (
                <MillProductsTab buildingState={buildingState} />
              ) : (
                <MillRecipesTab
                  state={buildingState.millState || createDefaultMillState()}
                  baseDailyGrainKg={loadGameParameters().millBaseDailyGrainKg ?? 200}
                  onSelectRecipe={(target: MillProductTarget) => {
                    const cur = buildingState.millState || createDefaultMillState();
                    onUpdateState({
                      millState: {
                        ...cur,
                        productTarget: target,
                        flourPricePerKg: MILL_PRODUCTS_CONFIG[target].defaultPricePerKg,
                      },
                    });
                  }}
                />
              )}
            </div>
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
                  To pole uprawne (+5 ha) jest częścią powyższego gospodarstwa. Załogą, produkcją, spichlerzem i końmi pociągowymi zarządzasz bezpośrednio w oknie farmy.
                </p>
              </div>
            );
          })()}

          {isFarm && (
            <FarmSection
              building={building}
              buildingState={buildingState}
              businessTab="production"
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
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isHop && (
            <HopSection
              buildingState={buildingState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isOrchard && (
            <OrchardSection
              buildingState={buildingState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isLivestock && (
            <LivestockSection
              building={building}
              buildingState={buildingState}
              businessTab="production"
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
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onRenameBuilding={onRenameBuilding}
            />
          )}

          {isWoodcutter && (
            <WoodcutterSection
              building={building}
              buildingState={buildingState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onUpdateState={onUpdateState}
            />
          )}

          {isMill && (
            <MillSection
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
            />
          )}

          {isBakery && (
            <BakerySection
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              clock={clock}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
            />
          )}

          {isResidential && (
            <ResidentialSection
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              residentialTab={residentialTab}
              onUpdateState={onUpdateState}
            />
          )}

          {isUniversity && (
            <UniversitySection
              buildingId={building.id}
              buildingTitle={building.name || 'Wiktoriański Uniwersytet'}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              onSpendGold={onSpendGold}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onUpdateState={onUpdateState}
            />
          )}

          {isTradeSchool && (
            <TradeSchoolSection
              buildingId={building.id}
              buildingTitle={building.name || 'Szkoła Branżowa i Techniczna'}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
              hasGreenRelief={hasGreenRelief}
              onSpendGold={onSpendGold}
              onUpdateAnyBuildingState={onUpdateAnyBuildingState}
              onUpdateState={onUpdateState}
            />
          )}

          {isBusiness && !isUniversity && !isTradeSchool && !isFarm && !isFlax && !isHop && !isOrchard && !isLivestock && !isMine && !isWoodcutter && !isMill && !isBakery && (
            <IndustrySection
              building={building}
              buildingState={buildingState}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
              businessTab="production"
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
              cityBuildings={allWorldBuildings.filter((b) => b.mapType !== 'rural')}
              buildingsState={buildingsState}
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

          {isTradeShip && (
            <TradeShipSection
              buildingId={building.id}
              allWorldBuildings={allWorldBuildings}
              buildingsState={buildingsState}
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
            onClick={handleAttemptClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zapisz i Zamknij
          </button>
        </div>
      </div>

      {showHorseCloseWarning && (
        <HorseMaintenanceWarningModal
          activeHorsesCount={activeHorsesCount}
          neededFeedKg={neededFeedKg}
          neededStrawKg={neededStrawKg}
          currentFeedOrderKg={currentFeedOrderKg}
          currentStrawOrderKg={currentStrawOrderKg}
          onAdjustQuantityAndClose={handleAdjustHorseMaintenanceAndClose}
          onChangeSupplier={() => {
            setShowHorseCloseWarning(false);
            setBusinessTab('production');
          }}
          onCloseAnyway={() => {
            setShowHorseCloseWarning(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
