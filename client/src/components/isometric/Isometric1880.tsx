import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IsometricModals } from './IsometricModals';
import { IsometricHeader } from './IsometricHeader';
import { MapSwitcher } from './MapSwitcher';
import { BuildToolbar } from './BuildToolbar';
import { BuildCursorBanner } from './BuildCursorBanner';
import { CATALOG } from './catalog';
import { useWorldMaps } from './useWorldMaps';
import type { RebuildTarget } from './modal/RebuildDemolishModal';
import { screenToTile } from './isoMath';
import { useIsometricAssets } from './useIsometricAssets';
import { useCityActions } from './useCityActions';
import { useGameClock } from './clock/useGameClock';
import { useMineMonthlyTick } from './useMineMonthlyTick';
import { useWoodcutterMonthlyTick } from './useWoodcutterMonthlyTick';
import { renderIsometricScene } from './isometricRenderer';
import type { PlacedBuilding, BuildingState, BuildingCatalogItem, BuildingCategory } from './types';

export const Isometric1880: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: -20, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mouseDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const animFrameRef = useRef<number>(0);

  // Zarządzanie dwiema mapami (Miasto 🏙️ vs Wieś 🌾)
  const {
    currentMap, setCurrentMap, activeGeometry,
    terrainTiles, setTerrainTiles, roadOrientations, setRoadOrientations,
    roadTypes, setRoadTypes, placedBuildings, setPlacedBuildings,
  } = useWorldMaps();

  // Budowanie i tryb wyburzania
  const [isBuildMode, setIsBuildMode] = useState<boolean>(true);
  const [isDemolishMode, setIsDemolishMode] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<BuildingCatalogItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<BuildingCategory | 'Wszystkie'>('Wszystkie');
  const [buildRotation, setBuildRotation] = useState<0 | 90>(0);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [gold, setGold] = useState<number>(35000);

  // Modale akcji i inspekcji
  const [inspectingBuilding, setInspectingBuilding] = useState<PlacedBuilding | null>(null);
  const [inspectingTerrain, setInspectingTerrain] = useState<{ x: number; y: number } | null>(null);
  const [demolishTargetBuilding, setDemolishTargetBuilding] = useState<PlacedBuilding | null>(null);
  const [rebuildTarget, setRebuildTarget] = useState<RebuildTarget | null>(null);
  const [buildingsState, setBuildingsState] = useState<Record<string, BuildingState>>({});

  // Globalny zegar gry 1880 (harmonogram wegetacyjny i cykl rolniczy)
  const gameClock = useGameClock(1880);
  const clockDateRef = useRef(gameClock.date);
  clockDateRef.current = gameClock.date;
  const buildingsStateRef = useRef(buildingsState);
  buildingsStateRef.current = buildingsState;

  // Miesięczny cykl wydobycia kopalń (zapełnianie hałdy na koniec miesiąca)
  useMineMonthlyTick({ clockDate: gameClock.date, placedBuildings, buildingsState, setBuildingsState, setGold });

  // Miesięczny cykl urobku Wyrębu Drewna (pozyskanie dłużycy)
  useWoodcutterMonthlyTick({ clockDate: gameClock.date, placedBuildings, buildingsState, setBuildingsState });

  // Zunifikowane akcje modyfikacji miasta
  const {
    demolishBuilding, demolishRoad, clearForest,
    changeRoadType, rotateRoad, changeTerrainType, buildOnCoord,
  } = useCityActions({
    placedBuildings, setPlacedBuildings,
    terrainTiles, setTerrainTiles,
    roadOrientations, setRoadOrientations,
    roadTypes, setRoadTypes,
    gold, setGold,
    mapType: currentMap,
    gridSizeX: activeGeometry.gridSizeX,
    gridSizeY: activeGeometry.gridSizeY,
    setBuildingsState,
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

      let mouseWorldPos: { x: number; y: number } | null = null;
      if (mousePosRef.current && canvas.parentElement) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = mousePosRef.current.clientX - rect.left;
        const mouseY = mousePosRef.current.clientY - rect.top;
        const worldX = mouseX / zoom - (canvasWidth / (2 * dpr * zoom) + pan.x);
        const worldY = mouseY / zoom - (60 + pan.y);
        mouseWorldPos = { x: worldX, y: worldY };
      }

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
        mapType: currentMap,
        tileWidth: activeGeometry.tileWidth,
        tileHeight: activeGeometry.tileHeight,
        gridSizeX: activeGeometry.gridSizeX,
        gridSizeY: activeGeometry.gridSizeY,
        buildingsState: buildingsStateRef.current,
        clockDate: clockDateRef.current,
        mouseWorldPos,
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    zoom,
    pan,
    placedBuildings,
    selectedType,
    buildRotation,
    hoverTile,
    gold,
    terrainTiles,
    roadOrientations,
    roadTypes,
    inspectingBuilding,
    rebuildTarget,
    currentMap,
    activeGeometry,
    buildingsState,
    gameClock.date,
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };

    const clickedTile = screenToTile(
      e.clientX,
      e.clientY,
      canvasRef.current,
      zoom,
      pan,
      activeGeometry.tileWidth,
      activeGeometry.tileHeight,
      activeGeometry.gridSizeX,
      activeGeometry.gridSizeY
    );

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

    // 3. PRAWY PRZYCISK MYSZY (PPM) -> Anulowanie wyboru budynku (brak menu kontekstowego)
    if (e.button === 2) {
      e.preventDefault();
      if (selectedType) {
        setSelectedType(null);
      }
      return;
    }

    // 4. LEWY LUB ŚRODKOWY PRZYCISK MYSZY -> Przesuwanie ekranu
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [
    placedBuildings,
    selectedType,
    buildRotation,
    gold,
    terrainTiles,
    pan,
    zoom,
    isDemolishMode,
    activeGeometry,
    buildOnCoord,
    demolishRoad,
    clearForest,
  ]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    const tile = screenToTile(
      e.clientX,
      e.clientY,
      canvasRef.current,
      zoom,
      pan,
      activeGeometry.tileWidth,
      activeGeometry.tileHeight,
      activeGeometry.gridSizeX,
      activeGeometry.gridSizeY
    );
    setHoverTile(tile);

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);

    // Jeśli to był krótki klik bez ciągnięcia myszą (< 6px), sprawdzamy kliknięcie w budynek
    const dist = Math.hypot(e.clientX - mouseDownPosRef.current.x, e.clientY - mouseDownPosRef.current.y);
    if (dist < 6 && e.button === 0 && !selectedType && !isDemolishMode) {
      const clickedTile = screenToTile(
        e.clientX,
        e.clientY,
        canvasRef.current,
        zoom,
        pan,
        activeGeometry.tileWidth,
        activeGeometry.tileHeight,
        activeGeometry.gridSizeX,
        activeGeometry.gridSizeY
      );

      if (clickedTile) {
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
        }
      }
    }
  }, [selectedType, isDemolishMode, zoom, pan, activeGeometry, placedBuildings]);

  // DOUBLE CLICK (dwuklik) -> Otwarcie menu terenu lub budynku
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const clickedTile = screenToTile(
      e.clientX,
      e.clientY,
      canvasRef.current,
      zoom,
      pan,
      activeGeometry.tileWidth,
      activeGeometry.tileHeight,
      activeGeometry.gridSizeX,
      activeGeometry.gridSizeY
    );

    if (!clickedTile) return;

    // a) Dwuklik w budynek
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
      return;
    }

    // b) Dwuklik w pole terenu / drogę / las
    const minWaterX = currentMap === 'rural' ? 2 : 1;
    if (
      clickedTile.x >= minWaterX &&
      clickedTile.x < activeGeometry.gridSizeX &&
      clickedTile.y >= 0 &&
      clickedTile.y < activeGeometry.gridSizeY
    ) {
      setInspectingTerrain({ x: clickedTile.x, y: clickedTile.y });
      setInspectingBuilding(null);
    }
  }, [zoom, pan, activeGeometry, placedBuildings, currentMap]);

  const handleWheel = (e: React.WheelEvent) => {
    // Limit przybliżenia max 1.05 (aby uniknąć pikselozy) i min 0.35 dla pełnego widoku mapy
    setZoom((prev) => Math.max(0.35, Math.min(1.05, prev - e.deltaY * 0.001)));
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
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-crosshair block"
      />

      {/* PRZEŁĄCZNIK WIDOKÓW MAPY: MIASTO 🏙️ VS WIEŚ 🌾 */}
      <MapSwitcher
        currentMap={currentMap}
        onChangeMap={(newMap) => {
          setCurrentMap(newMap);
          setSelectedType(null);
          setInspectingBuilding(null);
          setInspectingTerrain(null);
          setRebuildTarget(null);
        }}
      />

      {/* PASEK SKARBCU I ZEGAR GRY 1880 */}
      <IsometricHeader gold={gold} clock={gameClock} />

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
          currentMap={currentMap}
          onRotate={() => setBuildRotation((p) => (p === 0 ? 90 : 0))}
        />
      )}

      {/* DOLNY PASEK BUDOWANIA I KATEGORII Z IKONKĄ DŹWIGU I BURZENIA */}
      <BuildToolbar
        catalog={CATALOG}
        activeCategory={activeCategory}
        selectedType={selectedType}
        gold={gold}
        currentMap={currentMap}
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

      {/* MODALE GRY: INSPEKCJA BUDYNKU, TEREN, POTWIERDZENIE WYBURZENIA I PRZEBUDOWA */}
      <IsometricModals
        inspectingBuilding={inspectingBuilding}
        inspectingTerrain={inspectingTerrain}
        demolishTargetBuilding={demolishTargetBuilding}
        rebuildTarget={rebuildTarget}
        buildingsState={buildingsState}
        terrainTiles={terrainTiles}
        gold={gold}
        placedBuildings={placedBuildings}
        clock={gameClock}
        onUpdateBuildingState={(id, newState) => {
          setBuildingsState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...newState } }));
        }}
        onDemolishBuilding={(id) => { demolishBuilding(id); setInspectingBuilding(null); setRebuildTarget(null); }}
        onCloseInspectingBuilding={() => setInspectingBuilding(null)}
        onSetTerrain={(x, y, newType, goldDelta) => { changeTerrainType(x, y, newType, goldDelta); setRebuildTarget(null); }}
        onCloseInspectingTerrain={() => setInspectingTerrain(null)}
        onConfirmDemolishTarget={() => {
          if (demolishTargetBuilding) { demolishBuilding(demolishTargetBuilding.id); setDemolishTargetBuilding(null); }
        }}
        onCancelDemolishTarget={() => setDemolishTargetBuilding(null)}
        onDemolishRoad={(x, y) => { demolishRoad(x, y); setRebuildTarget(null); }}
        onChangeRoadType={(x, y, newType) => {
          changeRoadType(x, y, newType);
          setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, roadType: newType } : prev));
        }}
        onRotateRoad={(x, y) => {
          rotateRoad(x, y);
          setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, orientation: prev.orientation === 0 ? 90 : 0 } : prev));
        }}
        onRenovateBuilding={(bldg) => { setInspectingBuilding(bldg); setRebuildTarget(null); }}
        onClearForest={(x, y) => { clearForest(x, y); setRebuildTarget(null); }}
        onCloseRebuildTarget={() => setRebuildTarget(null)}
      />
    </div>
  );
};
