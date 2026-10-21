import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { TileData } from '../../types/game';
import { WorldGrid } from './WorldGrid';

interface SceneProps {
  tiles: TileData[];
  selectedTile: TileData | null;
  onTileClick: (tile: TileData) => void;
  hoveredTileId: string | null;
  setHoveredTileId: (id: string | null) => void;
  smogLevel: number; // 0 to 100
}

export const Scene: React.FC<SceneProps> = ({
  tiles,
  selectedTile,
  onTileClick,
  hoveredTileId,
  setHoveredTileId,
  smogLevel,
}) => {
  // Fog and Sky color based on environmental pollution
  const skyColor = smogLevel > 60 ? '#64748b' : smogLevel > 30 ? '#94a3b8' : '#7dd3fc';
  const fogNear = smogLevel > 60 ? 15 : 25;
  const fogFar = smogLevel > 60 ? 45 : 70;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{
          position: [14, 18, 20],
          fov: 35,
          near: 0.1,
          far: 200,
        }}
      >
        {/* Soft Tilt-Shift Shadows & Fog */}
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, fogNear, fogFar]} />

        {/* Ambient & Sun Lights */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[16, 25, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0005}
        />
        <hemisphereLight args={['#ffffff', '#334155', 0.4]} />

        {/* 3D World Grid of Tiles & Buildings */}
        <WorldGrid
          tiles={tiles}
          selectedTile={selectedTile}
          onTileClick={onTileClick}
          hoveredTileId={hoveredTileId}
          setHoveredTileId={setHoveredTileId}
        />

        {/* Intuitive Camera Controls (Isometric Tilt-Shift constrained) */}
        <OrbitControls
          target={[6, 0, 6]}
          minDistance={10}
          maxDistance={45}
          maxPolarAngle={Math.PI / 2.2} // Prevent camera going underground
          minPolarAngle={Math.PI / 6}
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>
    </div>
  );
};
