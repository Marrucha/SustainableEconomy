import type { BuildingState } from '../../types';
import type { UseGameClockReturn } from '../../clock/useGameClock';
import type { LivestockCapitalismState } from './livestockTypes';

interface UseLivestockTicksParams {
  clock?: UseGameClockReturn;
  livestockState: LivestockCapitalismState;
  ownedHorsesCount?: number;
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

/**
 * Cała symulacja ferm zwierzęcych (dzienna, miesięczna i roczna) działa obecnie globalnie w `useLivestockWorldTick`,
 * aby ciąża, odchów, dostawy paszy/ściółki, obornik i starzenie koni postępowały również przy zamkniętym oknie budynku.
 */
export function useLivestockTicks(_params: UseLivestockTicksParams) {
  // Celowo puste — logikę przejął globalny useLivestockWorldTick w useWorldSimulationTicks.
}
