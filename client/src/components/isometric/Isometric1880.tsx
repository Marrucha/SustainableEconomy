import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BuildingModal } from './BuildingModal';
import { RoadModal } from './RoadModal';
import { IsometricHeader } from './IsometricHeader';
import { BuildToolbar } from './BuildToolbar';
import { BuildCursorBanner } from './BuildCursorBanner';
import { CATALOG, GRID_SIZE_X, GRID_SIZE_Y } from './catalog';
import type { TileDef } from './types';
import { screenToTile } from './isoMath';
import { useIsometricAssets } from './useIsometricAssets';
import { renderIsometricScene } from './isometricRenderer';
import type { PlacedBuilding, BuildingState, BuildingCatalogItem, BuildingCategory } from './types';

export const Isometric1880: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.95);
  const [pan, setPan] = useState({ x: -20, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  // Budowanie i interakcja
  const [selectedType, setSelectedType] = useState<BuildingCatalogItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<BuildingCategory | 'Wszystkie'>('Wszystkie');
  const [buildRotation, setBuildRotation] = useState<0 | 90>(0);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [gold, setGold] = useState<number>(35000);

  // Dynamiczna siatka terenu i kierunki dróg
  const [terrainTiles, setTerrainTiles] = useState<Record<string, TileDef['type']>>(() => {
    const initial: Record<string, TileDef['type']> = {};
    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let y = 0; y < GRID_SIZE_Y; y++) {
        let type: TileDef['type'] = 'grass';
        if (x === 0) type = 'water';
        else if (x === 1) type = 'quay';
        else if (x === 2 || (x > 2 && y === 2)) type = 'road';
        initial[`${x},${y}`] = type;
      }
    }
    return initial;
  });
  const [roadOrientations, setRoadOrientations] = useState<Record<string, 0 | 90>>({});
  const [roadTypes, setRoadTypes] = useState<Record<string, 'curb' | 'seamless' | 'dirt'>>({});

  // Inspekcja budynku i drogi (Modal akcji)
  const [inspectingBuilding, setInspectingBuilding] = useState<PlacedBuilding | null>(null);
  const [inspectingRoad, setInspectingRoad] = useState<{ x: number; y: number } | null>(null);
  const [buildingsState, setBuildingsState] = useState<Record<string, BuildingState>>({});

  // Postawione budynki na mapie (dokładnie wyrównane na parcelach, z dala od dróg)
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>([
    {
      id: 'town_hall_init',
      typeId: 'town_hall',
      name: 'Wiktoriański Ratusz',
      x: 8,
      y: 4,
      sizeX: 3,
      sizeY: 3,
      rotation: 0,
      cost: 15000,
    },
    {
      id: 'mill_init',
      typeId: 'mill',
      name: 'Młyn Parowy',
      x: 4,
      y: 0,
      sizeX: 1,
      sizeY: 2,
      rotation: 0,
      cost: 3500,
    },
    {
      id: 'coal_init',
      typeId: 'coal_plant',
      name: 'Elektrociepłownia Węglowa',
      x: 6,
      y: 0,
      sizeX: 1,
      sizeY: 2,
      rotation: 0,
      cost: 6200,
    },
    {
      id: 'tenements_init',
      typeId: 'tenement_middle',
      name: 'Kamienica Mieszczańska',
      x: 4,
      y: 4,
      sizeX: 1,
      sizeY: 2,
      rotation: 0,
      cost: 2600,
    },
    {
      id: 'workers_init',
      typeId: 'tenement_workers',
      name: 'Kamienica Robotnicza',
      x: 6,
      y: 4,
      sizeX: 1,
      sizeY: 2,
      rotation: 0,
      cost: 1200,
    },
    {
      id: 'oak_init',
      typeId: 'oak',
      name: 'Park z Dębem',
      x: 4,
      y: 7,
      sizeX: 2,
      sizeY: 2,
      rotation: 0,
      cost: 1500,
    },
  ]);

  // Ładowanie zasobów graficznych
  const { assetsRef } = useIsometricAssets();

  // Obsługa skrótów klawiaturowych
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (selectedType && !selectedType.isSquare) {
          setBuildRotation((prev) => (prev === 0 ? 90 : 0));
        }
      } else if (e.key === 'Escape') {
        setSelectedType(null);
        setInspectingBuilding(null);
        setInspectingRoad(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedType]);

  // Główna pętla renderowania Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 1200;
      const canvasHeight = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 800;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      renderIsometricScene({
        ctx,
        canvasWidth,
        dpr,
        zoom,
        pan,
        assets: assetsRef.current,
        terrainTiles,
        roadOrientations,
        roadTypes,
        placedBuildings,
        selectedType,
        buildRotation,
        hoverTile,
        gold,
        inspectingBuilding,
        inspectingRoad,
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [zoom, pan, placedBuildings, selectedType, buildRotation, hoverTile, gold, terrainTiles, roadOrientations, roadTypes, inspectingBuilding, inspectingRoad]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clickedTile = screenToTile(e.clientX, e.clientY, canvasRef.current, zoom, pan);

    // 1. Tryb stawiania wybranego obiektu z menu (LPM)
    if (e.button === 0 && selectedType && clickedTile) {
      const curRotation = selectedType.isSquare ? 0 : buildRotation;
      const curSizeX = curRotation === 0 ? selectedType.defaultSizeX : selectedType.defaultSizeY;
      const curSizeY = curRotation === 0 ? selectedType.defaultSizeY : selectedType.defaultSizeX;

      const isCollision = placedBuildings.some((b) => {
        return (
          clickedTile.x < b.x + b.sizeX &&
          clickedTile.x + curSizeX > b.x &&
          clickedTile.y < b.y + b.sizeY &&
          clickedTile.y + curSizeY > b.y
        );
      });

      const isWaterOrOut =
        clickedTile.x <= 1 ||
        clickedTile.x + curSizeX > GRID_SIZE_X ||
        clickedTile.y < 0 ||
        clickedTile.y + curSizeY > GRID_SIZE_Y;

      const isRoadMode = selectedType.typeId.startsWith('road');

      if (isRoadMode) {
        const isAlreadyRoad = terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road';
        if (!isWaterOrOut && !isCollision && !isAlreadyRoad && gold >= selectedType.cost) {
          const subType = selectedType.roadSubType || 'curb';
          setTerrainTiles((prev) => ({
            ...prev,
            [`${clickedTile.x},${clickedTile.y}`]: 'road',
          }));
          setRoadOrientations((prev) => ({
            ...prev,
            [`${clickedTile.x},${clickedTile.y}`]: curRotation,
          }));
          setRoadTypes((prev) => ({
            ...prev,
            [`${clickedTile.x},${clickedTile.y}`]: subType,
          }));
          setGold((g) => g - selectedType.cost);
        }
        return;
      }

      // Sprawdź czy pod budynkiem nie ma drogi
      let isOnRoad = false;
      for (let tx = clickedTile.x; tx < clickedTile.x + curSizeX; tx++) {
        for (let ty = clickedTile.y; ty < clickedTile.y + curSizeY; ty++) {
          if (terrainTiles[`${tx},${ty}`] === 'road') isOnRoad = true;
        }
      }

      if (!isCollision && !isWaterOrOut && !isOnRoad && gold >= selectedType.cost) {
        setPlacedBuildings((prev) => [
          ...prev,
          {
            id: `${selectedType.typeId}_${Date.now()}`,
            typeId: selectedType.typeId,
            name: selectedType.name,
            x: clickedTile.x,
            y: clickedTile.y,
            sizeX: curSizeX,
            sizeY: curSizeY,
            rotation: curRotation,
            cost: selectedType.cost,
          },
        ]);
        setGold((prev) => prev - selectedType.cost);
      }
      return;
    }

    // 2. Kliknięcie lewym przyciskiem myszy w element na mapie gdy NIE budujemy -> Inspekcja i Wyburzanie
    if (e.button === 0 && !selectedType && clickedTile) {
      // a) Kliknięcie w budynek
      const clickedBuilding = [...placedBuildings]
        .reverse()
        .find(
          (b) =>
            clickedTile.x >= b.x &&
            clickedTile.x < b.x + b.sizeX &&
            clickedTile.y >= b.y &&
            clickedTile.y < b.y + b.sizeY
        );

      if (clickedBuilding) {
        setInspectingBuilding(clickedBuilding);
        setInspectingRoad(null);
        return;
      }

      // b) Kliknięcie w drogę
      if (terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road') {
        setInspectingRoad({ x: clickedTile.x, y: clickedTile.y });
        setInspectingBuilding(null);
        return;
      }
    }

    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [placedBuildings, selectedType, buildRotation, gold, terrainTiles, pan, zoom]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const tile = screenToTile(e.clientX, e.clientY, canvasRef.current, zoom, pan);
    setHoverTile(tile);

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    setZoom((prev) => Math.max(0.4, Math.min(1.8, prev - e.deltaY * 0.001)));
  };

  return (
    <div className="relative w-full h-full bg-stone-950 overflow-hidden select-none font-sans">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-crosshair block"
      />

      {/* PASEK SKARBCU I INFORMACJI */}
      <IsometricHeader gold={gold} />

      {/* KURSOR BUDOWANIA */}
      {selectedType && (
        <BuildCursorBanner
          selectedType={selectedType}
          buildRotation={buildRotation}
          onRotate={() => setBuildRotation((p) => (p === 0 ? 90 : 0))}
        />
      )}

      {/* DOLNY PASEK BUDOWANIA I KATEGORII */}
      <BuildToolbar
        catalog={CATALOG}
        activeCategory={activeCategory}
        selectedType={selectedType}
        gold={gold}
        onSelectCategory={setActiveCategory}
        onSelectType={setSelectedType}
      />

      {/* MODAL INSPEKCJI I ZARZĄDZANIA BUDYNKIEM */}
      {inspectingBuilding && (
        <BuildingModal
          building={inspectingBuilding}
          buildingState={buildingsState[inspectingBuilding.id] || {}}
          onUpdateState={(newState) => {
            setBuildingsState((prev) => ({
              ...prev,
              [inspectingBuilding.id]: {
                ...(prev[inspectingBuilding.id] || {}),
                ...newState,
              },
            }));
          }}
          onClose={() => setInspectingBuilding(null)}
          onDemolish={() => {
            setPlacedBuildings((prev) => prev.filter((b) => b.id !== inspectingBuilding.id));
            setGold((prev) => prev + Math.floor(inspectingBuilding.cost * 0.5));
            setInspectingBuilding(null);
          }}
        />
      )}

      {/* MODAL ZARZĄDZANIA I WYBURZANIA DROGI */}
      {inspectingRoad && (
        <RoadModal
          x={inspectingRoad.x}
          y={inspectingRoad.y}
          roadType={roadTypes[`${inspectingRoad.x},${inspectingRoad.y}`] || 'curb'}
          onChangeType={(newType) => {
            setRoadTypes((prev) => ({
              ...prev,
              [`${inspectingRoad.x},${inspectingRoad.y}`]: newType,
            }));
          }}
          onDemolish={() => {
            const key = `${inspectingRoad.x},${inspectingRoad.y}`;
            const subType = roadTypes[key] || 'curb';
            const refund = subType === 'dirt' ? 8 : 25;
            setTerrainTiles((prev) => ({
              ...prev,
              [key]: 'grass',
            }));
            setRoadOrientations((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
            setRoadTypes((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
            setGold((g) => g + refund);
            setInspectingRoad(null);
          }}
          onClose={() => setInspectingRoad(null)}
        />
      )}
    </div>
  );
};
