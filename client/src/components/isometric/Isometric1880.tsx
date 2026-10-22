import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BuildingModal } from './BuildingModal';
import { TerrainModal } from './modal/TerrainModal';
import { RebuildDemolishModal, type RebuildTarget } from './modal/RebuildDemolishModal';
import { ConfirmDemolishModal } from './modal/ConfirmDemolishModal';
import { IsometricHeader } from './IsometricHeader';
import { BuildToolbar } from './BuildToolbar';
import { BuildCursorBanner } from './BuildCursorBanner';
import { CATALOG, GRID_SIZE_X, GRID_SIZE_Y } from './catalog';
import { createInitialTerrain, INITIAL_BUILDINGS } from './initialWorld';
import type { TileDef, TerrainType } from './types';
import { screenToTile } from './isoMath';
import { useIsometricAssets } from './useIsometricAssets';
import { useCityActions } from './useCityActions';
import { renderIsometricScene } from './isometricRenderer';
import type { PlacedBuilding, BuildingState, BuildingCatalogItem, BuildingCategory } from './types';

export const Isometric1880: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.95);
  const [pan, setPan] = useState({ x: -20, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  // Budowanie i tryb wyburzania
  const [isBuildMode, setIsBuildMode] = useState<boolean>(true);
  const [isDemolishMode, setIsDemolishMode] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<BuildingCatalogItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<BuildingCategory | 'Wszystkie'>('Wszystkie');
  const [buildRotation, setBuildRotation] = useState<0 | 90>(0);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [gold, setGold] = useState<number>(35000);

  // Dynamiczna siatka terenu i drogi
  const [terrainTiles, setTerrainTiles] = useState<Record<string, TileDef['type']>>(createInitialTerrain);
  const [roadOrientations, setRoadOrientations] = useState<Record<string, 0 | 90>>({});
  const [roadTypes, setRoadTypes] = useState<Record<string, 'curb' | 'seamless' | 'dirt'>>({});

  // Modale akcji i inspekcji
  const [inspectingBuilding, setInspectingBuilding] = useState<PlacedBuilding | null>(null);
  const [inspectingTerrain, setInspectingTerrain] = useState<{ x: number; y: number } | null>(null);
  const [demolishTargetBuilding, setDemolishTargetBuilding] = useState<PlacedBuilding | null>(null);
  const [rebuildTarget, setRebuildTarget] = useState<RebuildTarget | null>(null);
  const [buildingsState, setBuildingsState] = useState<Record<string, BuildingState>>({});

  // Postawione budynki na mapie
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>(INITIAL_BUILDINGS);

  // Zunifikowane akcje modyfikacji miasta
  const {
    demolishBuilding,
    demolishRoad,
    clearForest,
    changeRoadType,
    rotateRoad,
    changeTerrainType,
    buildOnCoord,
  } = useCityActions({
    placedBuildings,
    setPlacedBuildings,
    terrainTiles,
    setTerrainTiles,
    roadOrientations,
    setRoadOrientations,
    roadTypes,
    setRoadTypes,
    gold,
    setGold,
  });

  // Ładowanie zasobów graficznych
  const { assetsRef } = useIsometricAssets();

  // Obsługa skrótów klawiaturowych oraz blokada menu kontekstowego przeglądarki
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (selectedType && !selectedType.isSquare) {
          setBuildRotation((prev) => (prev === 0 ? 90 : 0));
        }
      } else if (e.key === 'Escape') {
        setSelectedType(null);
        setIsDemolishMode(false);
        setDemolishTargetBuilding(null);
        setInspectingBuilding(null);
        setInspectingTerrain(null);
        setRebuildTarget(null);
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
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
        inspectingRoad: rebuildTarget && rebuildTarget.kind === 'road' ? { x: rebuildTarget.x, y: rebuildTarget.y } : null,
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [zoom, pan, placedBuildings, selectedType, buildRotation, hoverTile, gold, terrainTiles, roadOrientations, roadTypes, inspectingBuilding, rebuildTarget]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clickedTile = screenToTile(e.clientX, e.clientY, canvasRef.current, zoom, pan);

    // 1. TRYB WYBURZANIA: LPM od razu usuwa drzewa i drogi bez pytania, a budynki za potwierdzeniem
    if (e.button === 0 && isDemolishMode && clickedTile) {
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
        setDemolishTargetBuilding(clickedBuilding);
        return;
      }

      if (terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road') {
        demolishRoad(clickedTile.x, clickedTile.y);
        return;
      }

      const t = terrainTiles[`${clickedTile.x},${clickedTile.y}`];
      if (t && t.startsWith('forest')) {
        clearForest(clickedTile.x, clickedTile.y);
        return;
      }
      return;
    }

    // 2. STAWIANIE WYBRANEGO BUDYNKU / DROGI (LPM)
    if (e.button === 0 && selectedType && clickedTile) {
      const curRotation = selectedType.isSquare ? 0 : buildRotation;
      buildOnCoord(selectedType, curRotation, clickedTile);
      return;
    }

    // 3. PRAWY PRZYCISK MYSZY (PPM) -> Menu Wyburzenia lub Przebudowy/Remontu
    if (e.button === 2) {
      e.preventDefault();
      if (!clickedTile) return;

      if (selectedType) {
        setSelectedType(null);
      }
      setInspectingBuilding(null);
      setInspectingTerrain(null);

      // PPM w budynek
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
        setRebuildTarget({ kind: 'building', building: clickedBuilding });
        return;
      }

      // PPM w drogę
      if (terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road') {
        const subType = roadTypes[`${clickedTile.x},${clickedTile.y}`] || 'curb';
        const ori = roadOrientations[`${clickedTile.x},${clickedTile.y}`] || 0;
        setRebuildTarget({ kind: 'road', x: clickedTile.x, y: clickedTile.y, roadType: subType, orientation: ori });
        return;
      }

      // PPM w parcelę terenu / las
      if (
        clickedTile.x >= 2 &&
        clickedTile.x < GRID_SIZE_X &&
        clickedTile.y >= 0 &&
        clickedTile.y < GRID_SIZE_Y
      ) {
        const tType = terrainTiles[`${clickedTile.x},${clickedTile.y}`] || 'grass';
        setRebuildTarget({ kind: 'terrain', x: clickedTile.x, y: clickedTile.y, terrainType: tType });
        return;
      }
      return;
    }

    // 4. LEWY PRZYCISK MYSZY (LPM) -> Kliknięcie w pole otwiera okno terenu lub menu budynku
    if (e.button === 0 && !selectedType && clickedTile) {
      // a) Kliknięcie w budynek -> Menu budynku
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
        setInspectingTerrain(null);
        setRebuildTarget(null);
        return;
      }

      // b) Kliknięcie w pole terenu / las / drogę -> Okno Informacji o Terenie
      if (
        clickedTile.x >= 2 &&
        clickedTile.x < GRID_SIZE_X &&
        clickedTile.y >= 0 &&
        clickedTile.y < GRID_SIZE_Y
      ) {
        setInspectingTerrain({ x: clickedTile.x, y: clickedTile.y });
        setInspectingBuilding(null);
        setRebuildTarget(null);
        return;
      }
    }

    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [placedBuildings, selectedType, buildRotation, gold, terrainTiles, roadOrientations, roadTypes, pan, zoom, isDemolishMode, buildOnCoord, demolishRoad, clearForest]);

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
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-stone-950 overflow-hidden select-none font-sans"
    >
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

      {/* BANER TRYBU WYBURZANIA */}
      {isDemolishMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-rose-950/95 border-2 border-rose-500 rounded-full px-5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs text-rose-200 font-semibold animate-in fade-in duration-200">
          <span className="text-base animate-bounce">🔨</span>
          <span>Tryb burzenia: kliknij drzewo lub drogę, aby usunąć od razu, albo budynek za potwierdzeniem.</span>
          <button
            onClick={() => setIsDemolishMode(false)}
            className="px-2.5 py-0.5 rounded-full bg-rose-800 hover:bg-rose-700 text-white font-bold cursor-pointer text-[10px]"
          >
            Wyłącz (ESC)
          </button>
        </div>
      )}

      {/* KURSOR BUDOWANIA */}
      {selectedType && (
        <BuildCursorBanner
          selectedType={selectedType}
          buildRotation={buildRotation}
          onRotate={() => setBuildRotation((p) => (p === 0 ? 90 : 0))}
        />
      )}

      {/* DOLNY PASEK BUDOWANIA I KATEGORII Z IKONKĄ DŹWIGU I BURZENIA */}
      <BuildToolbar
        catalog={CATALOG}
        activeCategory={activeCategory}
        selectedType={selectedType}
        gold={gold}
        isBuildMode={isBuildMode}
        isDemolishMode={isDemolishMode}
        onToggleBuildMode={() => {
          setIsBuildMode((prev) => {
            if (prev) setSelectedType(null);
            return !prev;
          });
        }}
        onToggleDemolishMode={() => {
          setIsDemolishMode((prev) => {
            if (!prev) setSelectedType(null);
            return !prev;
          });
        }}
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
            demolishBuilding(inspectingBuilding.id);
            setInspectingBuilding(null);
          }}
        />
      )}

      {/* OKNO INFORMACJI O TERENIE (KLIKNIĘCIE LPM W POLE) */}
      {inspectingTerrain && (
        <TerrainModal
          tileCoord={inspectingTerrain}
          currentType={(terrainTiles[`${inspectingTerrain.x},${inspectingTerrain.y}`] as TerrainType) || 'grass'}
          gold={gold}
          onSetTerrain={(newType, goldDelta) => {
            changeTerrainType(inspectingTerrain.x, inspectingTerrain.y, newType, goldDelta);
          }}
          onClose={() => setInspectingTerrain(null)}
        />
      )}

      {/* POTWIERDZENIE WYBURZENIA BUDYNKU W TRYBIE BURZENIA */}
      {demolishTargetBuilding && (
        <ConfirmDemolishModal
          building={demolishTargetBuilding}
          onConfirm={() => {
            demolishBuilding(demolishTargetBuilding.id);
            setDemolishTargetBuilding(null);
          }}
          onCancel={() => setDemolishTargetBuilding(null)}
        />
      )}

      {/* MENU WYBURZENIA LUB PRZEBUDOWY/REMONTU (PPM NA DOWOLNY ELEMENT) */}
      {rebuildTarget && (
        <RebuildDemolishModal
          target={rebuildTarget}
          gold={gold}
          onDemolishBuilding={(id) => {
            demolishBuilding(id);
            setRebuildTarget(null);
          }}
          onDemolishRoad={(x, y) => {
            demolishRoad(x, y);
            setRebuildTarget(null);
          }}
          onChangeRoadType={(x, y, newType) => {
            changeRoadType(x, y, newType);
            setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, roadType: newType } : prev));
          }}
          onRotateRoad={(x, y) => {
            rotateRoad(x, y);
            setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, orientation: prev.orientation === 0 ? 90 : 0 } : prev));
          }}
          onRenovateBuilding={(bldg) => {
            setInspectingBuilding(bldg);
            setRebuildTarget(null);
          }}
          onClearForest={(x, y) => {
            clearForest(x, y);
            setRebuildTarget(null);
          }}
          onChangeTerrainType={(x, y, newType, costDelta) => {
            changeTerrainType(x, y, newType, costDelta);
            setRebuildTarget(null);
          }}
          onClose={() => setRebuildTarget(null)}
        />
      )}
    </div>
  );
};
