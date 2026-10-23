import React from 'react';
import { BuildingModal } from './BuildingModal';
import { TerrainModal } from './modal/TerrainModal';
import { ConfirmDemolishModal } from './modal/ConfirmDemolishModal';
import { RebuildDemolishModal, type RebuildTarget } from './modal/RebuildDemolishModal';
import type { PlacedBuilding, BuildingState, TerrainType, TileDef } from './types';
import type { UseGameClockReturn } from './clock/useGameClock';

interface IsometricModalsProps {
  inspectingBuilding: PlacedBuilding | null;
  inspectingTerrain: { x: number; y: number } | null;
  demolishTargetBuilding: PlacedBuilding | null;
  rebuildTarget: RebuildTarget | null;
  buildingsState: Record<string, BuildingState>;
  terrainTiles: Record<string, TileDef['type']>;
  gold: number;
  placedBuildings: PlacedBuilding[];
  clock?: UseGameClockReturn;
  onUpdateBuildingState: (id: string, newState: Partial<BuildingState>) => void;
  onDemolishBuilding: (id: string) => void;
  onCloseInspectingBuilding: () => void;
  onSetTerrain: (x: number, y: number, newType: TerrainType, goldDelta: number) => void;
  onCloseInspectingTerrain: () => void;
  onConfirmDemolishTarget: () => void;
  onCancelDemolishTarget: () => void;
  onDemolishRoad: (x: number, y: number) => void;
  onChangeRoadType: (x: number, y: number, newType: 'curb' | 'seamless' | 'dirt') => void;
  onRotateRoad: (x: number, y: number) => void;
  onRenovateBuilding: (bldg: PlacedBuilding) => void;
  onClearForest: (x: number, y: number) => void;
  onCloseRebuildTarget: () => void;
}

export const IsometricModals: React.FC<IsometricModalsProps> = ({
  inspectingBuilding,
  inspectingTerrain,
  demolishTargetBuilding,
  rebuildTarget,
  buildingsState,
  terrainTiles,
  gold,
  placedBuildings,
  clock,
  onUpdateBuildingState,
  onDemolishBuilding,
  onCloseInspectingBuilding,
  onSetTerrain,
  onCloseInspectingTerrain,
  onConfirmDemolishTarget,
  onCancelDemolishTarget,
  onDemolishRoad,
  onChangeRoadType,
  onRotateRoad,
  onRenovateBuilding,
  onClearForest,
  onCloseRebuildTarget,
}) => {
  return (
    <>
      {/* 1. MODAL INSPEKCJI I ZARZĄDZANIA BUDYNKIEM */}
      {inspectingBuilding && (
        <BuildingModal
          building={inspectingBuilding}
          buildingState={buildingsState[inspectingBuilding.id] || {}}
          placedBuildings={placedBuildings}
          clock={clock}
          onUpdateState={(newState) => onUpdateBuildingState(inspectingBuilding.id, newState)}
          onClose={onCloseInspectingBuilding}
          onDemolish={() => onDemolishBuilding(inspectingBuilding.id)}
        />
      )}

      {/* 2. OKNO INFORMACJI O TERENIE (LPM W POLE) */}
      {inspectingTerrain && (
        <TerrainModal
          tileCoord={inspectingTerrain}
          currentType={(terrainTiles[`${inspectingTerrain.x},${inspectingTerrain.y}`] as TerrainType) || 'grass'}
          gold={gold}
          onSetTerrain={(newType, goldDelta) => {
            onSetTerrain(inspectingTerrain.x, inspectingTerrain.y, newType, goldDelta);
          }}
          onClose={onCloseInspectingTerrain}
        />
      )}

      {/* 3. POTWIERDZENIE WYBURZENIA BUDYNKU W TRYBIE BURZENIA */}
      {demolishTargetBuilding && (
        <ConfirmDemolishModal
          building={demolishTargetBuilding}
          placedBuildings={placedBuildings}
          onConfirm={onConfirmDemolishTarget}
          onCancel={onCancelDemolishTarget}
        />
      )}

      {/* 4. MENU WYBURZENIA LUB PRZEBUDOWY/REMONTU (PPM NA DOWOLNY ELEMENT) */}
      {rebuildTarget && (
        <RebuildDemolishModal
          target={rebuildTarget}
          gold={gold}
          placedBuildings={placedBuildings}
          onDemolishBuilding={onDemolishBuilding}
          onDemolishRoad={onDemolishRoad}
          onChangeRoadType={onChangeRoadType}
          onRotateRoad={onRotateRoad}
          onRenovateBuilding={onRenovateBuilding}
          onClearForest={onClearForest}
          onChangeTerrainType={(x, y, newType, costDelta) => onSetTerrain(x, y, newType as TerrainType, costDelta)}
          onClose={onCloseRebuildTarget}
        />
      )}
    </>
  );
};
