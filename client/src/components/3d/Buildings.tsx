import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuildingType } from '../../types/game';

// Animated Smoke Puff for industrial chimneys
export const SmokeParticles: React.FC<{ position: [number, number, number]; isHeavy?: boolean }> = ({ position, isHeavy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = isHeavy ? 6 : 4;
  const particles = useRef(
    Array.from({ length: particleCount }, (_, i) => ({
      offsetY: (i / particleCount) * 1.8,
      speed: 0.015 + Math.random() * 0.01,
      scale: 0.2 + (i / particleCount) * 0.35,
      driftX: (Math.random() - 0.5) * 0.2,
      driftZ: (Math.random() - 0.5) * 0.2,
    }))
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles.current[i];
      p.offsetY += p.speed;
      if (p.offsetY > 2.2) {
        p.offsetY = 0;
      }
      child.position.y = p.offsetY;
      child.position.x = Math.sin(p.offsetY * 2) * 0.15 + p.driftX;
      child.position.z = Math.cos(p.offsetY * 2) * 0.15 + p.driftZ;
      const progress = p.offsetY / 2.2;
      const s = p.scale * (1 + progress * 1.5);
      child.scale.set(s, s, s);
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = (1 - progress) * (isHeavy ? 0.75 : 0.45);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.current.map((_, i) => (
        <mesh key={i}>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color={isHeavy ? '#374151' : '#9ca3af'}
            roughness={0.9}
            transparent
            opacity={0.5}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
};

// Low-poly Forest Trees
export const ForestTile: React.FC<{ pollution: number }> = ({ pollution }) => {
  const treeColor = pollution > 0.6 ? '#78716c' : pollution > 0.3 ? '#84cc16' : '#15803d';

  return (
    <group position={[0, 0, 0]}>
      {/* Tree 1 */}
      <group position={[-0.25, 0, -0.2]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.4, 5]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <coneGeometry args={[0.28, 0.6, 5]} />
          <meshStandardMaterial color={treeColor} flatShading />
        </mesh>
      </group>
      {/* Tree 2 */}
      <group position={[0.25, 0, 0.2]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.05, 0.3, 5]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <coneGeometry args={[0.24, 0.5, 5]} />
          <meshStandardMaterial color={treeColor} flatShading />
        </mesh>
      </group>
      {/* Tree 3 */}
      <group position={[0.15, 0, -0.25]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.35, 5]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <dodecahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={treeColor} flatShading />
        </mesh>
      </group>
    </group>
  );
};

// 1. Wheat Farm (Farma Pszenicy)
export const WheatFarmMesh: React.FC = () => {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Barn Body */}
      <mesh position={[-0.15, 0.25, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.45]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} flatShading />
      </mesh>
      {/* Thatched Roof */}
      <mesh position={[-0.15, 0.58, -0.1]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.42, 0.28, 4]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} flatShading />
      </mesh>
      {/* Silo */}
      <mesh position={[0.3, 0.35, -0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.7, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0.3, 0.76, -0.15]}>
        <coneGeometry args={[0.16, 0.14, 8]} />
        <meshStandardMaterial color="#475569" flatShading />
      </mesh>
      {/* Windmill tower & spinning blades */}
      <mesh position={[-0.2, 0.4, 0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 6]} />
        <meshStandardMaterial color="#cbd5e1" flatShading />
      </mesh>
      <group ref={bladesRef} position={[-0.2, 0.75, 0.37]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      {/* Golden wheat patch */}
      <mesh position={[0.15, 0.06, 0.2]} receiveShadow>
        <boxGeometry args={[0.45, 0.12, 0.45]} />
        <meshStandardMaterial color="#facc15" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
};

// 2. Steam Flour Mill (Młyn Parowy)
export const FlourMillMesh: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Brick Factory */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.7, 0.55]} />
        <meshStandardMaterial color="#991b1b" roughness={0.8} flatShading />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.55, 0.25, 4]} />
        <meshStandardMaterial color="#334155" flatShading />
      </mesh>
      {/* Factory Chimney */}
      <mesh position={[0.25, 0.65, -0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 1.1, 7]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.9} flatShading />
      </mesh>
      <SmokeParticles position={[0.25, 1.25, -0.2]} />
      {/* Steam Pipes & Storage */}
      <mesh position={[-0.25, 0.2, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} flatShading />
      </mesh>
    </group>
  );
};

// 3. Bakery (Piekarnia)
export const BakeryMesh: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Cozy Shop Building */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.5, 0.45]} />
        <meshStandardMaterial color="#fef08a" roughness={0.6} flatShading />
      </mesh>
      {/* Slate Roof */}
      <mesh position={[0, 0.56, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.48, 0.22, 4]} />
        <meshStandardMaterial color="#475569" flatShading />
      </mesh>
      {/* Small Bakery Chimney */}
      <mesh position={[-0.18, 0.55, -0.12]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.5, 6]} />
        <meshStandardMaterial color="#dc2626" flatShading />
      </mesh>
      <SmokeParticles position={[-0.18, 0.85, -0.12]} />
      {/* Striped Awning */}
      <mesh position={[0, 0.28, 0.26]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.2]} />
        <meshStandardMaterial color="#ea580c" flatShading />
      </mesh>
    </group>
  );
};

// 4. Coal Power Plant (Elektrownia Węglowa)
export const CoalPowerPlantMesh: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Generator Hall */}
      <mesh position={[-0.1, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.7, 0.65]} />
        <meshStandardMaterial color="#334155" roughness={0.8} flatShading />
      </mesh>
      {/* Twin Tall Chimneys */}
      <mesh position={[0.28, 0.75, -0.18]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.4, 8]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0.28, 0.75, 0.18]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.4, 8]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <SmokeParticles position={[0.28, 1.5, -0.18]} isHeavy />
      <SmokeParticles position={[0.28, 1.5, 0.18]} isHeavy />
      {/* Coal storage pile */}
      <mesh position={[-0.32, 0.15, 0.28]} castShadow>
        <coneGeometry args={[0.22, 0.28, 5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
};

// 5. Solar Farm (Farma Fotowoltaiczna)
export const SolarFarmMesh: React.FC = () => {
  const panelPositions: [number, number, number][] = [
    [-0.25, 0.14, -0.25],
    [0.25, 0.14, -0.25],
    [-0.25, 0.14, 0.25],
    [0.25, 0.14, 0.25],
  ];

  return (
    <group position={[0, 0, 0]}>
      {panelPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Post stand */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 4]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          {/* Tilted Blue Panel */}
          <mesh position={[0, 0.16, 0]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 0.02, 0.28]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Inverter Box */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.2, 0.12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.3} />
      </mesh>
    </group>
  );
};

// 6. Victorian Tenement Houses (Kamienice Robotnicze)
export const ResidentialMesh: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[-0.15, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.7, 0.55]} />
        <meshStandardMaterial color="#854d0e" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0.2, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.6, 0.5]} />
        <meshStandardMaterial color="#a16207" roughness={0.7} flatShading />
      </mesh>
      {/* Roofs */}
      <mesh position={[-0.15, 0.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.3, 0.2, 4]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0.2, 0.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.28, 0.18, 4]} />
        <meshStandardMaterial color="#334155" flatShading />
      </mesh>
    </group>
  );
};

import { 
  GlbIndustrialMill, 
  GlbCoalPowerPlant, 
  GlbTownHouse, 
  GlbBakeryShop 
} from './GlbModels';

// Dispatcher Component for Buildings
export const BuildingMesh: React.FC<{ type: BuildingType }> = ({ type }) => {
  switch (type) {
    case 'wheat_farm':
      return <WheatFarmMesh />;
    case 'flour_mill':
      return <GlbIndustrialMill />;
    case 'bakery':
      return <GlbBakeryShop />;
    case 'coal_power':
      return <GlbCoalPowerPlant />;
    case 'solar_farm':
      return <SolarFarmMesh />;
    case 'residential':
      return <GlbTownHouse />;
    default:
      return null;
  }
};
