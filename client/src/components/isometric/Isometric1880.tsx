import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IsometricModals } from './IsometricModals';
import { AdminParametersModal } from './admin/AdminParametersModal';
import { SaveLoadModal } from './modal/SaveLoadModal';
import { formatGameDate } from './clock/gameClockTypes';
import { IsometricHeader, IsometricClockControls } from './IsometricHeader';
import { MapSwitcher } from './MapSwitcher';
import { WorldMapView } from './WorldMapView';
import { BuildToolbar } from './BuildToolbar';
import { EconomyHudMenu } from './EconomyHudMenu';
import { BuildCursorBanner } from './BuildCursorBanner';
import { CATALOG } from './catalog';
import { useWorldMaps } from './useWorldMaps';
import { CITY_GEOMETRY, RURAL_GEOMETRY } from './mapConfig';
import type { RebuildTarget } from './modal/RebuildDemolishModal';
import { screenToTile } from './isoMath';
import { useIsometricAssets } from './useIsometricAssets';
import { useCityActions } from './useCityActions';
import { useGameClock } from './clock/useGameClock';
import { useWorldSimulationTicks } from './useWorldSimulationTicks';
import { renderIsometricScene } from './isometricRenderer';
import { loadPersistedState, savePersistedState } from './gamePersistence';
import type { PlacedBuilding, BuildingState, BuildingCatalogItem, BuildingCategory } from './types';

export const Isometric1880: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
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
    roadTypes, setRoadTypes, placedBuildings, setPlacedBuildings, cityBuildings, allWorldBuildings, autoPlaceCityBuildings, removeCityBuildingsByIds, cityPlayersCount, addNewCityPlayer,
  } = useWorldMaps();

  // Budowanie i tryb wyburzania
  const [isBuildMode, setIsBuildMode] = useState<boolean>(false);
  const [isDemolishMode, setIsDemolishMode] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<BuildingCatalogItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<BuildingCategory | 'Wszystkie'>('Wszystkie');
  const [buildRotation, setBuildRotation] = useState<0 | 90>(0);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [hoverCursorPos, setHoverCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [gold, setGold] = useState<number>(() => loadPersistedState('gold', 350000));
  const [inspectingBuilding, setInspectingBuilding] = useState<PlacedBuilding | null>(null);
  const [inspectingTerrain, setInspectingTerrain] = useState<{ x: number; y: number } | null>(null);
  const [demolishTargetBuilding, setDemolishTargetBuilding] = useState<PlacedBuilding | null>(null);
  const [rebuildTarget, setRebuildTarget] = useState<RebuildTarget | null>(null);
  const [buildingsState, setBuildingsState] = useState<Record<string, BuildingState>>(() => loadPersistedState('buildingsState', {}));
  useEffect(() => { savePersistedState('gold', gold); }, [gold]);
  useEffect(() => { savePersistedState('buildingsState', buildingsState); }, [buildingsState]);

  // Globalny zegar gry 1880 (harmonogram wegetacyjny i cykl rolniczy)
  const gameClock = useGameClock(1880);
  const clockDateRef = useRef(gameClock.date);
  clockDateRef.current = gameClock.date;
  const buildingsStateRef = useRef(buildingsState);
  buildingsStateRef.current = buildingsState;

  // Globalne cykle symulacji (kopalnie, wyrąb, farmy zbożowe, rozwój miasta)
  useWorldSimulationTicks({ clockDate: gameClock.date, placedBuildings, cityBuildings, buildingsState, setBuildingsState, setGold, autoPlaceCityBuildings, removeCityBuildingsByIds });

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

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

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
    setHoverTile((prev) =>
      prev?.x === tile?.x && prev?.y === tile?.y ? prev : tile
    );
    setHoverCursorPos(tile ? { x: e.clientX, y: e.clientY } : null);
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
          if (clickedBuilding.typeId === 'city_miniature') {
            setCurrentMap('city');
            setSelectedType(null);
            setInspectingBuilding(null);
            setInspectingTerrain(null);
            setRebuildTarget(null);
            return;
          }
          setInspectingBuilding(clickedBuilding);
          setInspectingTerrain(null);
        }
      }
    }
  }, [selectedType, isDemolishMode, zoom, pan, activeGeometry, placedBuildings, setCurrentMap]);

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
      if (clickedBuilding.typeId === 'city_miniature') {
        setCurrentMap('city');
        setSelectedType(null);
        setInspectingBuilding(null);
        setInspectingTerrain(null);
        setRebuildTarget(null);
        return;
      }
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
    // Limit przybliżenia max 3.0 (dla wysokorozdzielczych spritów budynków) i min 0.35 dla pełnego widoku mapy
    setZoom((prev) => Math.max(0.35, Math.min(3.0, prev - e.deltaY * 0.001)));
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-stone-950 overflow-hidden select-none font-sans"
    >
      {currentMap === 'world' ? (
        <WorldMapView onOpenLondon={() => setCurrentMap('city')} />
      ) : (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoverTile(null);
            setHoverCursorPos(null);
          }}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full cursor-crosshair block"
        />
      )}

      {currentMap !== 'world' &&
        hoverTile &&
        hoverCursorPos &&
        !isDragging &&
        !inspectingBuilding &&
        !selectedType && (() => {
          const hoveredBuilding = placedBuildings.find(
            (b) =>
              hoverTile.x >= b.x &&
              hoverTile.x < b.x + b.sizeX &&
              hoverTile.y >= b.y &&
              hoverTile.y < b.y + b.sizeY
          );
          if (!hoveredBuilding) return null;
          const bState = buildingsState[hoveredBuilding.id];
          const displayName = bState?.enterpriseName || hoveredBuilding.name;
          const ownerName = bState?.ownerName;
          return (
            <div
              className="pointer-events-none fixed z-40 px-2.5 py-1.5 rounded-xl bg-stone-950/90 border border-amber-500/50 shadow-2xl backdrop-blur-sm"
              style={{
                left: hoverCursorPos.x + 14,
                top: hoverCursorPos.y - 10,
                transform: 'translateY(-100%)',
              }}
            >
              <p className="text-xs font-bold text-amber-100 whitespace-nowrap">{displayName}</p>
              {ownerName && (
                <p className="text-[10px] text-stone-400 font-mono whitespace-nowrap">{ownerName}</p>
              )}
            </div>
          );
        })()}
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
      <div className="absolute top-3 left-4 z-30">
        <IsometricHeader
          gold={gold}
          clock={gameClock}
          onRefreshGold={() => setGold(350000)}
        />
      </div>
      {currentMap !== 'world' && (
        <div className="absolute top-28 left-4 z-30 flex flex-col items-start">
          <EconomyHudMenu
            gold={gold}
            isBuildMode={isBuildMode}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
            onToggleBuildMode={() => setIsBuildMode((p) => { if (p) setSelectedType(null); return !p; })}
            onNavigateToBuilding={(building) => {
              const targetMap = building.mapType === 'rural' ? 'rural' : 'city';
              const targetGeometry = targetMap === 'rural' ? RURAL_GEOMETRY : CITY_GEOMETRY;
              const viewHeight = canvasRef.current?.clientHeight || window.innerHeight;
              const gx = building.x + (building.sizeX ?? 1) / 2;
              const gy = building.y + (building.sizeY ?? 1) / 2;
              setCurrentMap(targetMap);
              setIsBuildMode(false);
              setIsDemolishMode(false);
              setSelectedType(null);
              setInspectingBuilding(null);
              setInspectingTerrain(null);
              setPan({
                x: -(gx - gy) * (targetGeometry.tileWidth / 2),
                y: (viewHeight / 2) / zoom - 60 - (gx + gy) * (targetGeometry.tileHeight / 2),
              });
            }}
            buildTreeSlot={
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
            }
          />
        </div>
      )}
      <div className="absolute top-3 right-4 z-30">
        <IsometricClockControls
          clock={gameClock}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
        />
      </div>
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
        allWorldBuildings={allWorldBuildings}
        clock={gameClock}
        cityPlayersCount={cityPlayersCount}
        onAddNewCityPlayer={addNewCityPlayer}
        onSpendGold={(amount) => setGold((g) => Math.max(0, g - amount))}
        onUpdateBuildingState={(id, newState) => {
          setBuildingsState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...newState } }));
        }}
        onRenameBuilding={(id, newName) => {
          setPlacedBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, name: newName } : b)));
          setInspectingBuilding((prev) => (prev && prev.id === id ? { ...prev, name: newName } : prev));
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
      <AdminParametersModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      {isSaveLoadOpen && (
        <SaveLoadModal
          gameDateLabel={formatGameDate(gameClock.date)}
          gold={gold}
          onClose={() => setIsSaveLoadOpen(false)}
        />
      )}
    </div>
  );
};
