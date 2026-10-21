import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SmokeParticles } from './Buildings';

// Textures for Kenney models
const textureLoader = new THREE.TextureLoader();
const industrialTexture = textureLoader.load('/models/Textures/colormap.png');
industrialTexture.colorSpace = THREE.SRGBColorSpace;
industrialTexture.flipY = false;

// 1. Stylized Wind-Swaying Oak Tree (Big & Rich)
export const GlbOakTree: React.FC<{ position?: [number, number, number]; scale?: number; pollution?: number; rotationY?: number }> = ({
  position = [0, 0, 0],
  scale = 0.85,
  pollution = 0,
  rotationY = 0,
}) => {
  const { scene } = useGLTF('/models/tree_oak.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  React.useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
          if (pollution > 0.5 && mat.color) {
            mat.color.lerp(new THREE.Color('#78716c'), 0.75); // drought/smog dry leaves
          } else {
            // Rich vibrant forest canopy
            mat.roughness = 0.7;
          }
          mesh.material = mat;
        }
      }
    });
  }, [clone, pollution]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 1.5 + phase;
      groupRef.current.rotation.z = Math.sin(t) * 0.04;
      groupRef.current.rotation.x = Math.cos(t * 0.9) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} />
    </group>
  );
};

// 2. Stylized Pine Tree (Tall & Evergreen)
export const GlbPineTree: React.FC<{ position?: [number, number, number]; scale?: number; pollution?: number; rotationY?: number }> = ({
  position = [0, 0, 0],
  scale = 0.9,
  pollution = 0,
  rotationY = 0,
}) => {
  const { scene } = useGLTF('/models/tree_pine.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  React.useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
          if (pollution > 0.5 && mat.color) {
            mat.color.lerp(new THREE.Color('#57534e'), 0.7);
          }
          mesh.material = mat;
        }
      }
    });
  }, [clone, pollution]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 1.8 + phase;
      groupRef.current.rotation.z = Math.sin(t) * 0.035;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} />
    </group>
  );
};

// 3. Natural Rocks & Shoreline Pebbles
export const GlbRock: React.FC<{ position?: [number, number, number]; scale?: number; rotationY?: number }> = ({
  position = [0, 0, 0],
  scale = 0.45,
  rotationY = 0,
}) => {
  const { scene } = useGLTF('/models/rock.glb');
  const clone = useMemo(() => scene.clone(), [scene]);

  React.useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clone]);

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} />
    </group>
  );
};

// 4. Bush & Foliage
export const GlbBush: React.FC<{ position?: [number, number, number]; scale?: number }> = ({
  position = [0, 0, 0],
  scale = 0.5,
}) => {
  const { scene } = useGLTF('/models/bush.glb');
  const clone = useMemo(() => scene.clone(), [scene]);

  React.useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clone]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={clone} />
    </group>
  );
};

// Helper: Apply Kenney Atlas Texture with crisp PBR shading
function applyTexturedMaterial(root: THREE.Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = new THREE.MeshStandardMaterial({
        map: industrialTexture,
        roughness: 0.65,
        metalness: 0.25,
      });
    }
  });
}

// 5. High-Detail Industrial Mill (Fully Textured Brick & Roofs)
export const GlbIndustrialMill: React.FC = () => {
  const { scene: bldg } = useGLTF('/models/industrial_d.glb');
  const { scene: chm } = useGLTF('/models/chimney.glb');

  const bldgClone = useMemo(() => {
    const c = bldg.clone();
    applyTexturedMaterial(c);
    return c;
  }, [bldg]);

  const chmClone = useMemo(() => {
    const c = chm.clone();
    applyTexturedMaterial(c);
    return c;
  }, [chm]);

  return (
    <group position={[0, 0, 0]} scale={[0.55, 0.55, 0.55]}>
      <primitive object={bldgClone} position={[-0.1, 0, 0]} />
      <primitive object={chmClone} position={[0.7, 0, -0.35]} scale={[0.9, 1.3, 0.9]} />
      <SmokeParticles position={[0.38, 1.65, -0.18]} />
    </group>
  );
};

// 6. High-Detail Coal Power Plant (Massive Industrial Complex with Double Chimneys)
export const GlbCoalPowerPlant: React.FC = () => {
  const { scene: bldg } = useGLTF('/models/industrial_a.glb');
  const { scene: chm } = useGLTF('/models/chimney.glb');

  const bldgClone = useMemo(() => {
    const c = bldg.clone();
    applyTexturedMaterial(c);
    return c;
  }, [bldg]);

  const chm1Clone = useMemo(() => {
    const c = chm.clone();
    applyTexturedMaterial(c);
    return c;
  }, [chm]);

  const chm2Clone = useMemo(() => {
    const c = chm.clone();
    applyTexturedMaterial(c);
    return c;
  }, [chm]);

  return (
    <group position={[0, 0, 0]} scale={[0.6, 0.6, 0.6]}>
      <primitive object={bldgClone} position={[0, 0, 0]} />
      <primitive object={chm1Clone} position={[0.72, 0, -0.38]} scale={[1.0, 1.4, 1.0]} />
      <primitive object={chm2Clone} position={[0.72, 0, 0.38]} scale={[1.0, 1.4, 1.0]} />
      <SmokeParticles position={[0.42, 1.9, -0.22]} isHeavy />
      <SmokeParticles position={[0.42, 1.9, 0.22]} isHeavy />
      {/* Coal Pile on side */}
      <mesh position={[-0.6, 0.2, 0.4]} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </group>
  );
};

// 7. Victorian Town House / Residential (Fully Textured)
export const GlbTownHouse: React.FC = () => {
  const { scene: houseA } = useGLTF('/models/house_a.glb');
  const clone = useMemo(() => {
    const c = houseA.clone();
    applyTexturedMaterial(c);
    return c;
  }, [houseA]);

  return (
    <group position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
      <primitive object={clone} />
    </group>
  );
};

// 8. Bakery / Commercial Shop (Fully Textured)
export const GlbBakeryShop: React.FC = () => {
  const { scene: houseD } = useGLTF('/models/house_d.glb');
  const clone = useMemo(() => {
    const c = houseD.clone();
    applyTexturedMaterial(c);
    return c;
  }, [houseD]);

  return (
    <group position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
      <primitive object={clone} />
      <SmokeParticles position={[-0.1, 1.3, -0.1]} />
    </group>
  );
};

// 9. Lush & Dense Forest Tile (Real Woodland Grove)
export const LushForestTile: React.FC<{ pollution: number; seed: number }> = ({ pollution, seed }) => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Large primary Oak Tree */}
      <GlbOakTree position={[-0.15, 0, -0.1]} scale={0.75} pollution={pollution} rotationY={seed} />
      {/* Tall Pine Tree */}
      <GlbPineTree position={[0.22, 0, 0.18]} scale={0.82} pollution={pollution} rotationY={seed * 2} />
      {/* Secondary Younger Tree */}
      <GlbOakTree position={[0.18, 0, -0.22]} scale={0.52} pollution={pollution} rotationY={seed * 1.5} />
      {/* Rich Undergrowth Bushes and Rocks */}
      <GlbBush position={[-0.25, 0, 0.22]} scale={0.45} />
      <GlbBush position={[0.0, 0, 0.25]} scale={0.35} />
      <GlbRock position={[-0.05, 0, -0.28]} scale={0.25} rotationY={seed} />
    </group>
  );
};

// 10. Continuous River Waterway Mesh (Runs across the world smoothly)
export const ContinuousRiver: React.FC<{ 
  gridSize: number; 
  waterColumns: [number, number]; 
  pollution: number 
}> = ({ gridSize, waterColumns, pollution }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);

  const centerX = (waterColumns[0] + waterColumns[1]) / 2;
  const riverWidth = (waterColumns[1] - waterColumns[0] + 1) * 1.0;
  const riverLength = gridSize * 1.0;

  // Water Color Transition: Pristine Blue -> Murky Teal -> Toxic Industrial Brown
  const waterColor = useMemo(() => {
    if (pollution > 0.6) return new THREE.Color('#3f3f46'); // dark polluted gray
    if (pollution > 0.3) return new THREE.Color('#0f766e'); // distressed murky teal
    return new THREE.Color('#0284c7'); // sparkling azure water
  }, [pollution]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterRef.current) {
      waterRef.current.position.y = -0.04 + Math.sin(t * 1.8) * 0.008;
    }
    if (foamRef.current) {
      foamRef.current.position.y = -0.038 + Math.cos(t * 2.2) * 0.006;
    }
  });

  return (
    <group position={[centerX, 0, (gridSize - 1) / 2]}>
      {/* Sunken Riverbed (Gravel, Silt & Rocks) */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[riverWidth, 0.16, riverLength + 1]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </mesh>

      {/* Scattered Rocks in the River */}
      {Array.from({ length: 8 }).map((_, i) => (
        <GlbRock
          key={i}
          position={[
            (Math.sin(i * 3) * 0.35) * riverWidth,
            -0.08,
            (i - 4) * 1.8,
          ]}
          scale={0.25 + (i % 3) * 0.08}
          rotationY={i * 1.2}
        />
      ))}

      {/* Main Flowing Water Surface */}
      <mesh ref={waterRef} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[riverWidth, riverLength + 1, 32, 32]} />
        <meshStandardMaterial
          color={waterColor}
          roughness={0.06}
          metalness={0.35}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Foam Shoreline Ribbons */}
      <mesh ref={foamRef} position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[riverWidth * 0.98, riverLength + 1, 16, 16]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};
