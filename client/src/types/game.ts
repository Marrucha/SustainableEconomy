export type SocialClass = 'R' | 'M' | 'E'; // Robotnicy, Klasa Średnia, Elita

export type TileType = 'grass' | 'water' | 'dirt' | 'forest' | 'road';

export type BuildingType = 
  | 'wheat_farm' 
  | 'flour_mill' 
  | 'bakery' 
  | 'coal_power' 
  | 'solar_farm' 
  | 'residential';

export interface BuildingData {
  id: string;
  type: BuildingType;
  name: string;
  era: number;
  size: [number, number]; // [width, depth] in grid tiles
  workers: { R: number; M: number; E: number };
  energyKwh: number; // energy required per tick
  energySource: 'grid' | 'coal_local' | 'gas_local' | 'clean';
  pollutionPerTick: number; // environmental footprint
  monthlyOutput: string;
  monthlyRevenue: number;
  monthlyCost: number;
  efficiency: number; // 0 to 100%
}

export interface TileData {
  id: string;
  x: number;
  z: number;
  type: TileType;
  pollution: number; // 0.0 (pristine) to 1.0 (heavily poisoned/smoggy)
  building?: BuildingData;
}

export interface GameState {
  funds: number;
  monthlyNetIncome: number;
  year: number;
  era: number;
  population: { R: number; M: number; E: number };
  socialScore: number; // 0 - 100%
  planetHealth: number; // 0 - 100%
  globalSmogLevel: number; // 0 - 100%
  speed: 0 | 1 | 2 | 3;
  selectedTile: TileData | null;
  buildMode: BuildingType | 'forest' | 'road' | 'demolish' | null;
}
