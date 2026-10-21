import React from 'react';
import type { TileData } from '../../types/game';
import { BuildingMesh } from './Buildings';
import { 
  ContinuousRiver, 
  LushForestTile 
} from './GlbModels';

interface WorldGridProps {
  tiles: TileData[];
  selectedTile: TileData | null;
  onTileClick: (tile: TileData) => void;
  hoveredTileId: string | null;
  setHoveredTileId: (id: string | null) => void;
}

const GRID_SIZE = 16;
const WATER_COLS: [number, number] = [3, 4];

export const WorldGrid: React.FC<WorldGridProps> = ({
  tiles,
  selectedTile,
  onTileClick,
  hoveredTileId,
  setHoveredTileId,
}) => {
  // Average pollution in water area
  const riverPollution = tiles
    .filter((t) => t.type === 'water')
    .reduce((acc, t, _, arr) => acc + t.pollution / (arr.length || 1), 0);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Continuous Flowing River System across columns 3 and 4 */}
      <ContinuousRiver
        gridSize={GRID_SIZE}
        waterColumns={WATER_COLS}
        pollution={riverPollution}
      />

      {/* 2. Grid of Terrain & Building Tiles */}
      {tiles.map((tile) => (
        <GridTile
          key={tile.id}
          tile={tile}
          isSelected={selectedTile?.id === tile.id}
          isHovered={hoveredTileId === tile.id}
          onClick={() => onTileClick(tile)}
          onPointerOver={() => setHoveredTileId(tile.id)}
          onPointerOut={() => setHoveredTileId(null)}
        />
      ))}
    </group>
  );
};

interface GridTileProps {
  tile: TileData;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const GridTile: React.FC<GridTileProps> = ({
  tile,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const { x, z, type, pollution, building } = tile;
  const isWater = type === 'water';

  // Warm, natural meadow earth palette
  const getTileColor = () => {
    if (type === 'road') return '#475569';
    if (type === 'dirt') return '#a16207';
    // Grass & Forest ground
    if (pollution > 0.7) return '#78716c'; // toxic dead gray
    if (pollution > 0.4) return '#8c857b'; // polluted dry yellow-brown
    return '#4d7c0f'; // warm natural countryside green
  };

  const tileHeight = 0.22;
  const tileSeed = (x * 7 + z * 13) % 10;

  return (
    <group position={[x, 0, z]}>
      {/* If Water Tile: Invisible click plane so player can still click the river for info/bridges */}
      {isWater ? (
        <mesh
          position={[0, -0.04, 0]}
          visible={false}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ) : (
        /* Solid Ground Tile */
        <mesh
          position={[0, 0, 0]}
          receiveShadow
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onPointerOver();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onPointerOut();
          }}
        >
          <boxGeometry args={[0.98, tileHeight, 0.98]} />
          <meshStandardMaterial
            color={getTileColor()}
            roughness={0.85}
            metalness={0.02}
            flatShading
          />
        </mesh>
      )}

      {/* Lush Forest Grove on Forest Tiles */}
      {type === 'forest' && !building && (
        <LushForestTile pollution={pollution} seed={tileSeed} />
      )}

      {/* High-Fidelity Building */}
      {building && (
        <group position={[0, tileHeight / 2, 0]}>
          <BuildingMesh type={building.type} />
        </group>
      )}

      {/* Selection / Hover Indicator */}
      {(isSelected || isHovered) && (
        <mesh position={[0, tileHeight / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.98, 0.98]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : '#fef08a'}
            wireframe
            transparent
            opacity={isSelected ? 0.95 : 0.6}
          />
        </mesh>
      )}
    </group>
  );
};
