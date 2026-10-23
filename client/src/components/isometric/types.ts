import type { FarmCapitalismState } from './modal/farmGridTypes';
import type { LivestockCapitalismState } from './modal/livestock/livestockTypes';
import type { OrchardCapitalismState, FruitType } from './modal/orchard/orchardTypes';
import type { MineDepositType, MineStaffState } from './modal/mine/mineTypes';

export interface PlacedBuilding {
  id: string;
  typeId: string;
  name: string;
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

export type BusinessEnergySource = 'elektrownia' | 'drewno' | 'wegiel' | 'gaz' | 'wodor' | 'konie';
export type BusinessEnergyScale = 'eco' | 'standard' | 'turbo';

export interface BuildingState {
  // Uniwersalne zasilanie energią do produkcji (Farma, Młyn, Warsztaty, Przemysł)
  businessEnergySource?: BusinessEnergySource;
  businessEnergyScale?: BusinessEnergyScale;

  // Farma Zbożowa
  farmCapitalism?: FarmCapitalismState;
  cropType?: 'pszenica' | 'zyto' | 'owies' | 'jeczmien';

  // Sad Owocowy
  orchardState?: OrchardCapitalismState;
  fruitType?: FruitType;

  // Ferma Bydła i Owiec
  livestockState?: LivestockCapitalismState;
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

  // Wyręb Drewna (Wiejski 8x4)
  woodcutterForestTiles?: number; // Liczba pól leśnych pod parcelą (1..32)
  woodcutterEfficiency?: number; // Wydajność zrębu (0..100%, max 32 pola = 100%)
  woodcutterStock?: number; // Zapas ściętych bali drewnianych (t)

  // Kamienica Mieszkaniowa
  rentPerApartment?: number; // £ / miesiąc
  heatingEnergySource?: 'drewno' | 'piec_weglowy' | 'gaz_miejski' | 'cieplownia_miejska';
  maintenanceLevel?: 'podstawowy' | 'dobry' | 'luksusowy';

  // Młyn Parowy
  productionTarget?: 'maka_pszenna' | 'maka_zytnia' | 'kasza';
  industrialEnergySource?: 'lokalny_kociol' | 'siec_elektryczna';

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
  roadSubType?: 'curb' | 'seamless' | 'dirt';
}
