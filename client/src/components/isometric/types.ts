import type { FarmCapitalismState } from './modal/farmGridTypes';
import type { LivestockCapitalismState } from './modal/livestock/livestockTypes';
import type { OrchardCapitalismState, FruitType } from './modal/orchard/orchardTypes';
import type { MineDepositType, MineStaffState } from './modal/mine/mineTypes';
import type { MineCapitalismState } from './modal/mine/mineCapitalismTypes';
import type { FlaxCapitalismState } from './modal/flax/flaxTypes';
import type { HopCapitalismState } from './modal/hop/hopTypes';
import type { MillCapitalismState } from './modal/mill/millTypes';
import type { BakeryCapitalismState } from './modal/bakery/bakeryTypes';
import type { ContractType } from './modal/industryContracts';
import type { UniversityState } from './modal/universityTypes';

export interface PlacedBuilding {
  id: string;
  typeId: string;
  name: string;
  playerName?: string;
  cityName?: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  rotation: 0 | 90;
  cost: number;
}

export type TerrainType =
  | 'road'
  | 'grass'
  | 'water'
  | 'quay'
  | 'forest_oak'
  | 'forest_pine'
  | 'forest_grove';

export interface TileDef {
  x: number;
  y: number;
  type: TerrainType;
}

export type TransportMode1880 = 'horses' | 'rail' | 'ship';

export interface MarketStallSupplySlot {
  slotIndex: number; // 1..4
  productId: string;
  supplierBuildingId?: string;
  transportCompanyId?: string;
  transportMode?: TransportMode1880;
  monthlyKg?: number;
  contractType?: ContractType;
  monthsRemaining?: number;
}

export interface MarketStallSeller {
  sellerIndex: number; // 1..4
  productId: string;   // wybierany wyłącznie z produktów zabezpieczonych przez zaopatrzeniowca
  retailPrice?: number;
  traderId?: string;
  traderName?: string;
}

export interface MarketStallCrewMember {
  id: string;
  name: string;
  role: 'supply' | 'trader' | 'delivery';
  dailyWage: number;
  assignedProductId?: string;
}

export interface MarketStallSlot {
  slotIndex: number;
  tenantName: string | null;
  annualRent: number;
  rentedUntilYear?: number;
  rentedUntilTotalDays?: number; // Pełne 3 lata (1080 dni) od dnia wylicytowania
  rentedUntilDateLabel?: string; // Czytelna data końca dzierżawy, np. 15.11.1881
  supplySlots?: MarketStallSupplySlot[]; // 4 sloty zaopatrzeniowca na stoisku
  sellers?: MarketStallSeller[]; // do 4 sprzedawców na jednym stoisku (każdy 1 produkt)
  stageCrew?: Partial<Record<'supply' | 'trader' | 'delivery', MarketStallCrewMember[]>>;
}

export type BusinessEnergySource = 'elektrownia' | 'drewno' | 'wegiel' | 'wegiel_drzewny' | 'gaz' | 'wodor' | 'konie';
export type BusinessEnergyScale = 'eco' | 'standard' | 'turbo';

export interface CoalSupplyOrder {
  supplierId: string;
  monthlyTons: number;
  contractType: ContractType;
  monthsRemaining: number;
}

export interface HorseFeedSupplyOrder {
  supplierId: string;
  monthlyKg: number;
  contractType: ContractType;
  monthsRemaining: number;
}

export interface ShipInterventionLogEntry {
  id: string;
  year: number;
  month: number;
  buyerId: string;
  buyerLabel: string;
  supplierId: string;
  productLabel: string;
  shortfallKg: number;
  costGbp: number;
}

export interface BuildingState {
  // Uniwersalne zasilanie energią do produkcji (Farma, Młyn, Warsztaty, Przemysł)
  businessEnergySource?: BusinessEnergySource;
  businessEnergyScale?: BusinessEnergyScale;
  coalStockTons?: number; // Zapas węgla na składzie opałowym (t)
  coalOrder?: CoalSupplyOrder; // Miesięczny kontrakt na dostawę węgla
  coalInterventionBuyEnabled?: boolean; // Zakup interwencyjny węgla ze statku (+10%)
  charcoalStockTons?: number; // Zapas węgla drzewnego na składzie (t)
  charcoalOrder?: CoalSupplyOrder; // Miesięczny kontrakt na dostawę węgla drzewnego
  shipInterventionLogs?: ShipInterventionLogEntry[];

  // Farma Zbożowa
  farmCapitalism?: FarmCapitalismState;
  cropType?: 'pszenica' | 'zyto' | 'jeczmien';

  // Plantacja Lnu
  flaxState?: FlaxCapitalismState;

  // Farma Chmielu
  hopState?: HopCapitalismState;

  // Sad Owocowy
  orchardState?: OrchardCapitalismState;
  fruitType?: FruitType;

  // Ferma Bydła i Owiec
  livestockState?: LivestockCapitalismState;
  ownedHorses?: import('./modal/livestock/livestockTypes').HorseAnimal[];
  horseFeedStockKg?: number; // Zapas paszy dla koni roboczych (kg)
  horseFeedOrder?: HorseFeedSupplyOrder; // Kontrakt na paszę dla koni roboczych
  horseFeedInterventionBuyEnabled?: boolean; // Zakup interwencyjny paszy dla koni ze statku (+10%)
  horseStrawStockKg?: number; // Zapas ściółki dla koni roboczych (kg) — zużywana bez produkcji obornika
  horseStrawOrder?: HorseFeedSupplyOrder; // Kontrakt na ściółkę dla koni roboczych
  workersCount?: number;
  workerWage?: number; // £ / dzień
  managersCount?: number; // Liczba zarządców i agronomów (Klasa M)
  managerWage?: number; // £ / dzień
  farmEnergySource?: 'reczna' | 'wiatrak' | 'maszyna_parowa' | 'siec_elektryczna';

  // Kopalnia Węgla i Rudy (Wiejska 8x8)
  mineDepositType?: MineDepositType;
  mineStock?: number; // zapas wydobytego urobku na hałdzie (t)
  mineCycleStage?: number; // etap cyklu wydobywczego (1..7)
  mineDestination?: 'sell_market' | 'store_silo'; // przeznaczenie: natychmiastowa sprzedaż lub magazyn
  mineStaff?: MineStaffState; // załoga kopalni: górnicy, konie, pracownicy naziemni, kupiec
  mineCapitalism?: MineCapitalismState;

  // Wyręb Drewna (Wiejski 8x4)
  woodcutterForestTiles?: number; // Liczba pól leśnych pod parcelą (1..32)
  woodcutterEfficiency?: number; // Wydajność zrębu (0..100%, max 32 pola = 100%)
  woodcutterStock?: number; // Zapas ściętych bali drewnianych (t)

  // Kamienica Mieszkaniowa
  rentPerApartment?: number; // £ / miesiąc
  heatingEnergySource?: 'drewno' | 'piec_weglowy' | 'gaz_miejski' | 'cieplownia_miejska';
  maintenanceLevel?: 'podstawowy' | 'dobry' | 'luksusowy';
  assignedResidentIds?: string[]; // Stała lista ID lokatorów zameldowanych w tym budynku

  // Identyfikacja producenta na rynku
  ownerName?: string;        // np. 'Gracz'
  enterpriseName?: string;   // np. 'Farma Kowalskiego'

  // Młyn Parowy i Przetwórnie Przemysłowe
  millState?: MillCapitalismState;
  bakeryState?: BakeryCapitalismState;
  universityState?: UniversityState;
  productionTarget?: 'maka_pszenna' | 'maka_zytnia' | 'kasza';
  industrialEnergySource?: 'lokalny_kociol' | 'siec_elektryczna';
  merchantHired?: boolean;
  merchantSupplierId?: string;
  factoryWorkersCount?: number;
  factoryManagersCount?: number;
  factoryWarehousemenCount?: number;
  factorySellerHired?: boolean;
  factoryRoster?: Array<{
    id: string;
    name: string;
    role: 'worker' | 'manager' | 'warehouseman' | 'merchant' | 'seller';
  }>;
  merchantRoleMode?: 'dedicated' | 'worker';
  warehousemanRoleMode?: 'dedicated' | 'worker';
  sellerRoleMode?: 'dedicated' | 'worker';
  // Kontrakty zakupowe Kupca i Sprzedaż/Produkty Fabryki
  merchantContractType?: 'pay_as_you_go' | 'contract_3y' | 'contract_5y' | 'contract_10y';
  merchantContractStartTotalMonths?: number; // year * 12 + month
  merchantContractUnitsPerMonth?: number;
  merchantTransportCompanyId?: string;
  merchantTransportMode?: TransportMode1880;
  productPrice?: number;
  productStockUnits?: number;
  productQuality?: number; // 1..100
  productBrand?: number;   // 0..100
  workerExperienceYears?: number;
  workerSchoolCoursesCompleted?: number;
  workerInSchoolMonthsLeft?: number;

  // Targowisko Miejskie (8 stoisk, licytacja raz w roku, zaopatrzeniowiec 1:4 stoiska)
  marketStalls?: MarketStallSlot[];
  marketReserveTemplates?: Array<{
    sellers?: MarketStallSeller[];
    supplySlots?: MarketStallSupplySlot[];
    stageCrew?: MarketStallSlot['stageCrew'];
  }>;
  groceryShopState?: MarketStallSlot;
  marketLastAuctionYear?: number;
  marketSuppliersCount?: number; // liczba zaopatrzeniowców (1 obsługuje do 4 stoisk)
  newspaperAds?: Array<{
    id: string;
    playerName: string;
    packageLabel: string;
    cost: number;
    boostPercent: number;
  }>;

  // Elektrociepłownia
  powerOutputFuelRate?: number; // %

  // Ratusz Miejski - Uchwały Rady Miasta i Poziom Bazowy Podatków
  taxLandPerTile?: number; // £ / kratkę / cykl (podatek gruntowy)
  taxAgriculture?: number; // % podatek branżowy - rolnictwo
  taxIndustry?: number; // % podatek branżowy - przemysł i manufaktury
  taxServices?: number; // % podatek branżowy - handel i usługi
  taxTurnoverOrVat?: number; // % podatek od sprzedaży (obrotowy / w przyszłości VAT)
  taxClassR?: number; // % podatek od ludności - klasa robotnicza (R)
  taxClassM?: number; // % podatek od ludności - klasa średnia (M)
  taxClassE?: number; // % podatek od ludności - klasa wyższa / elita (E)
  taxCarbonEmissions?: number; // £ / tona CO2 (w późniejszych epokach)
  co2TaxUnlocked?: boolean; // Status uchwały o podatku emisyjnym (późniejszy okres)
  decreeChimneySootTax?: boolean; // 1880: lokalna opłata kominowa za dym i sadzę

  // Wnioskowanie o ulgi podatkowe dla biznesu (Rada Miasta)
  appliedTaxReliefs?: Record<string, boolean>; // id ulgi -> czy wniosek przyznany przez magistrat
}

export type BuildingCategory =
  | 'Budynki rolnicze'
  | 'Budynki przemysłowe'
  | 'Budynki mieszkalne'
  | 'Budynki usługowe'
  | 'Elementy rozrywkowe';

export interface BuildingCatalogItem {
  typeId: string;
  name: string;
  category: BuildingCategory;
  defaultSizeX: number;
  defaultSizeY: number;
  isSquare: boolean; // Kwadratowa podstawa nie wymaga obrotu 90 deg
  cost: number;
  spriteBaseName: string;
  anchorNormX: number;
  anchorNormY: number;
  baseWidth: number;
  yardSpriteBaseName?: string;
  yardAnchorNormX?: number;
  yardAnchorNormY?: number;
  yardBaseWidth?: number;
  roadSubType?: 'curb' | 'seamless' | 'dirt' | 'railway';
}
