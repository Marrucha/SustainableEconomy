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

export interface TileDef {
  x: number;
  y: number;
  type: 'road' | 'grass' | 'water' | 'quay';
}

export type BusinessEnergySource = 'elektrownia' | 'drewno' | 'wegiel' | 'gaz' | 'wodor';
export type BusinessEnergyScale = 'eco' | 'standard' | 'turbo';

export interface BuildingState {
  // Uniwersalne zasilanie energią do produkcji (Farma, Młyn, Warsztaty, Przemysł)
  businessEnergySource?: BusinessEnergySource;
  businessEnergyScale?: BusinessEnergyScale;

  // Farma Zbożowa
  cropType?: 'pszenica' | 'zyto' | 'owies' | 'jeczmien';
  workersCount?: number;
  workerWage?: number; // £ / dzień
  managersCount?: number; // Liczba zarządców i agronomów (Klasa M)
  managerWage?: number; // £ / dzień
  farmEnergySource?: 'reczna' | 'wiatrak' | 'maszyna_parowa' | 'siec_elektryczna';

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
