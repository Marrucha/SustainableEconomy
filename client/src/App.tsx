import React, { useState, useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { HUD } from './components/ui/HUD';
import { Isometric1880 } from './components/isometric/Isometric1880';
import type { TileData, GameState, BuildingType, BuildingData } from './types/game';

const GRID_SIZE = 16;

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'isometric_1880' | 'threejs_3d'>('isometric_1880');
  // Generate Starter World (16x16 Square Grid)
  const [tiles, setTiles] = useState<TileData[]>(() => {
    const initialTiles: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        // Natural River running down column 3 and 4
        const isWater = (x === 3 || x === 4) && z > 1 && z < 14;
        // Natural Forest Clusters
        const isForest = !isWater && (
          (x <= 2 && z <= 3) || 
          (x >= 12 && z >= 12) || 
          (x === 5 && z >= 4 && z <= 6)
        );

        initialTiles.push({
          id: `${x}_${z}`,
          x,
          z,
          type: isWater ? 'water' : isForest ? 'forest' : 'grass',
          pollution: 0.05,
        });
      }
    }

    // Place Initial Era 1 Industrial Chain (UK 1880)
    const setStarterBuilding = (x: number, z: number, building: BuildingData) => {
      const idx = initialTiles.findIndex((t) => t.x === x && t.z === z);
      if (idx !== -1) {
        initialTiles[idx].building = building;
        initialTiles[idx].type = 'grass';
      }
    };

    // 1. Wheat Farm
    setStarterBuilding(7, 5, {
      id: 'b_wheat_1',
      type: 'wheat_farm',
      name: 'Farma Zbożowa Sussex',
      era: 1,
      size: [1, 1],
      workers: { R: 4, M: 1, E: 0 },
      energyKwh: 10,
      energySource: 'grid',
      pollutionPerTick: 0.01,
      monthlyOutput: '10 t Pszenicy (L0)',
      monthlyRevenue: 1200,
      monthlyCost: 400,
      efficiency: 100,
    });

    // 2. Steam Flour Mill
    setStarterBuilding(9, 5, {
      id: 'b_mill_1',
      type: 'flour_mill',
      name: 'Młyn Parowy Manchester',
      era: 1,
      size: [1, 1],
      workers: { R: 6, M: 2, E: 0 },
      energyKwh: 45,
      energySource: 'coal_local',
      pollutionPerTick: 0.08,
      monthlyOutput: '8 t Mąki Pszennej (L1)',
      monthlyRevenue: 2800,
      monthlyCost: 1100,
      efficiency: 95,
    });

    // 3. Bakery
    setStarterBuilding(11, 5, {
      id: 'b_bakery_1',
      type: 'bakery',
      name: 'Piekarnia Londyńska',
      era: 1,
      size: [1, 1],
      workers: { R: 5, M: 1, E: 0 },
      energyKwh: 30,
      energySource: 'grid',
      pollutionPerTick: 0.03,
      monthlyOutput: '6 000 Bochenków Chleba',
      monthlyRevenue: 3900,
      monthlyCost: 1400,
      efficiency: 100,
    });

    // 4. Coal Power Plant
    setStarterBuilding(13, 9, {
      id: 'b_coal_1',
      type: 'coal_power',
      name: 'Elektrownia Węglowa Newcastle',
      era: 1,
      size: [1, 1],
      workers: { R: 18, M: 4, E: 1 },
      energyKwh: 0,
      energySource: 'coal_local',
      pollutionPerTick: 0.25, // heavy pollution source
      monthlyOutput: '+500 kWh Energii Elektrycznej',
      monthlyRevenue: 4500,
      monthlyCost: 2200,
      efficiency: 100,
    });

    // 5. Worker Tenement Housing
    setStarterBuilding(9, 8, {
      id: 'b_res_1',
      type: 'residential',
      name: 'Kamienice Robotnicze East End',
      era: 1,
      size: [1, 1],
      workers: { R: 0, M: 0, E: 0 },
      energyKwh: 20,
      energySource: 'grid',
      pollutionPerTick: 0.02,
      monthlyOutput: '+150 Mieszkańców [R/M]',
      monthlyRevenue: 900,
      monthlyCost: 200,
      efficiency: 100,
    });

    return initialTiles;
  });

  const [gameState, setGameState] = useState<GameState>({
    funds: 125000,
    monthlyNetIncome: 4200,
    year: 1880,
    era: 1,
    population: { R: 450, M: 120, E: 25 },
    socialScore: 82,
    planetHealth: 76,
    globalSmogLevel: 32,
    speed: 1,
    selectedTile: null,
    buildMode: null,
  });

  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);

  // Simulation Tick Engine (Every 1.5 seconds per game month at 1x speed)
  useEffect(() => {
    if (gameState.speed === 0) return;

    const intervalTime = 1600 / gameState.speed;
    const timer = setInterval(() => {
      setGameState((prev) => {
        // Calculate monthly finances and environmental impact
        let tickIncome = 0;
        let totalPollutionGenerated = 0;
        let totalForestsCleaning = 0;

        tiles.forEach((t) => {
          if (t.building) {
            tickIncome += t.building.monthlyRevenue - t.building.monthlyCost;
            totalPollutionGenerated += t.building.pollutionPerTick;
          }
          if (t.type === 'forest') {
            totalForestsCleaning += 0.04;
          }
        });

        const newSmog = Math.max(5, Math.min(100, prev.globalSmogLevel + (totalPollutionGenerated - totalForestsCleaning) * 3));
        const newPlanetHealth = Math.round(100 - newSmog * 0.7);
        const newSocial = Math.round(Math.max(20, Math.min(100, 85 - newSmog * 0.2 + (tickIncome > 0 ? 5 : -5))));

        return {
          ...prev,
          funds: prev.funds + tickIncome,
          monthlyNetIncome: tickIncome,
          globalSmogLevel: Math.round(newSmog),
          planetHealth: newPlanetHealth,
          socialScore: newSocial,
          year: prev.year < 2080 ? prev.year + 1 : 2080,
        };
      });

      // Update tile-specific pollution diffusions
      setTiles((prevTiles) =>
        prevTiles.map((tile) => {
          let pollutionChange = 0;
          if (tile.building) {
            pollutionChange += tile.building.pollutionPerTick * 0.15;
          }
          if (tile.type === 'forest') {
            pollutionChange -= 0.06;
          }
          const nextPollution = Math.max(0, Math.min(1.0, tile.pollution + pollutionChange));
          return {
            ...tile,
            pollution: nextPollution,
          };
        })
      );
    }, intervalTime);

    return () => clearInterval(timer);
  }, [gameState.speed, tiles]);

  // Handle Tile Click: Build or Inspect
  const handleTileClick = (tile: TileData) => {
    if (gameState.buildMode) {
      if (gameState.buildMode === 'demolish') {
        if (tile.building) {
          setTiles((prev) =>
            prev.map((t) => (t.id === tile.id ? { ...t, building: undefined } : t))
          );
          setGameState((prev) => ({
            ...prev,
            funds: prev.funds + 1000,
            selectedTile: null,
          }));
        }
        return;
      }

      if (gameState.buildMode === 'forest') {
        if (tile.type !== 'water') {
          setTiles((prev) =>
            prev.map((t) => (t.id === tile.id ? { ...t, type: 'forest', building: undefined } : t))
          );
          setGameState((prev) => ({
            ...prev,
            funds: prev.funds - 1500,
          }));
        }
        return;
      }

      // Build Building
      const costMap: Record<BuildingType, number> = {
        wheat_farm: 5000,
        flour_mill: 12000,
        bakery: 8000,
        coal_power: 35000,
        solar_farm: 25000,
        residential: 6000,
      };

      const buildingCost = costMap[gameState.buildMode as BuildingType] || 5000;
      if (gameState.funds < buildingCost) {
        alert('Niewystarczające fundusze na realizację tej inwestycji!');
        return;
      }

      const newBuilding: BuildingData = {
        id: `b_${Date.now()}`,
        type: gameState.buildMode as BuildingType,
        name: getBuildingName(gameState.buildMode as BuildingType),
        era: gameState.era,
        size: [1, 1],
        workers: { R: 6, M: 2, E: 0 },
        energyKwh: gameState.buildMode === 'solar_farm' ? 0 : 25,
        energySource: gameState.buildMode === 'coal_power' ? 'coal_local' : 'grid',
        pollutionPerTick: gameState.buildMode === 'coal_power' ? 0.25 : gameState.buildMode === 'solar_farm' ? 0 : 0.04,
        monthlyOutput: getBuildingOutput(gameState.buildMode as BuildingType),
        monthlyRevenue: getBuildingRevenue(gameState.buildMode as BuildingType),
        monthlyCost: 800,
        efficiency: 100,
      };

      setTiles((prev) =>
        prev.map((t) =>
          t.id === tile.id ? { ...t, type: 'grass', building: newBuilding } : t
        )
      );

      setGameState((prev) => ({
        ...prev,
        funds: prev.funds - buildingCost,
        selectedTile: { ...tile, building: newBuilding },
        buildMode: null, // exit build mode after successful placement
      }));
    } else {
      // Normal Inspect Mode
      setGameState((prev) => ({
        ...prev,
        selectedTile: tile,
      }));
    }
  };

  const getBuildingName = (type: BuildingType) => {
    switch (type) {
      case 'wheat_farm': return 'Nowa Farma Pszenicy';
      case 'flour_mill': return 'Nowoczesny Młyn';
      case 'bakery': return 'Piekarnia Rzemieślnicza';
      case 'coal_power': return 'Elektrownia Cieplna Węglowa';
      case 'solar_farm': return 'Farma Fotowoltaiczna';
      case 'residential': return 'Osiedle Mieszkaniowe';
    }
  };

  const getBuildingOutput = (type: BuildingType) => {
    switch (type) {
      case 'wheat_farm': return '12 t Pszenicy (L0)';
      case 'flour_mill': return '10 t Mąki Pszennej (L1)';
      case 'bakery': return '8 000 Bochenków Chleba (Wyrób Końcowy)';
      case 'coal_power': return '+500 kWh Energii Elektrycznej';
      case 'solar_farm': return '+350 kWh Czystej Energii OZE';
      case 'residential': return '+180 Mieszkańców [R/M]';
    }
  };

  const getBuildingRevenue = (type: BuildingType) => {
    switch (type) {
      case 'wheat_farm': return 1500;
      case 'flour_mill': return 3200;
      case 'bakery': return 4800;
      case 'coal_power': return 5000;
      case 'solar_farm': return 3800;
      case 'residential': return 1200;
    }
  };

  // Toggle Energy Sourcing (Grid vs Local Coal Combustion)
  const handleEnergySourceToggle = (tileId: string) => {
    setTiles((prev) =>
      prev.map((t) => {
        if (t.id === tileId && t.building) {
          const nextSource = t.building.energySource === 'grid' ? 'coal_local' : 'grid';
          const nextPollution = nextSource === 'coal_local' ? t.building.pollutionPerTick * 2.2 : t.building.pollutionPerTick / 2.2;
          const updatedBuilding: BuildingData = {
            ...t.building,
            energySource: nextSource,
            pollutionPerTick: nextPollution,
          };
          if (gameState.selectedTile?.id === tileId) {
            setGameState((s) => ({ ...s, selectedTile: { ...t, building: updatedBuilding } }));
          }
          return { ...t, building: updatedBuilding };
        }
        return t;
      })
    );
  };

  // Demolish Selected
  const handleDemolishSelected = () => {
    if (gameState.selectedTile?.building) {
      const tileId = gameState.selectedTile.id;
      setTiles((prev) =>
        prev.map((t) => (t.id === tileId ? { ...t, building: undefined } : t))
      );
      setGameState((prev) => ({
        ...prev,
        funds: prev.funds + 1000,
        selectedTile: null,
      }));
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-stone-950 font-sans">
      {/* VIEWPORT MODE SWITCHER */}
      <div className="absolute top-4 right-4 z-50 flex items-center bg-stone-900/95 border border-amber-500/40 rounded-xl p-1 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setViewMode('isometric_1880')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            viewMode === 'isometric_1880'
              ? 'bg-amber-600 text-stone-900 font-bold shadow-md shadow-amber-600/30'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          🏛️ Izometria 2.5D (Styl 1880)
        </button>
        <button
          onClick={() => setViewMode('threejs_3d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            viewMode === 'threejs_3d'
              ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          🌐 Eksperyment 3D (Three.js)
        </button>
      </div>

      {viewMode === 'isometric_1880' ? (
        /* HIGH-DETAIL 1880 VICTORIAN ISOMETRIC ENGINE */
        <Isometric1880 />
      ) : (
        /* PREVIOUS 3D PROTOTYPE */
        <>
          <Scene
            tiles={tiles}
            selectedTile={gameState.selectedTile}
            onTileClick={handleTileClick}
            hoveredTileId={hoveredTileId}
            setHoveredTileId={setHoveredTileId}
            smogLevel={gameState.globalSmogLevel}
          />
          <HUD
            state={gameState}
            onSetBuildMode={(mode) => setGameState((prev) => ({ ...prev, buildMode: mode }))}
            onSetSpeed={(speed) => setGameState((prev) => ({ ...prev, speed }))}
            onEnergySourceToggle={handleEnergySourceToggle}
            onDemolishSelected={handleDemolishSelected}
          />
        </>
      )}
    </div>
  );
};

export default App;
