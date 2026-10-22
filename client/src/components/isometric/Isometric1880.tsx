import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BuildingModal } from './BuildingModal';
import { BuildPickerModal } from './modal/BuildPickerModal';
import { RebuildDemolishModal, type RebuildTarget } from './modal/RebuildDemolishModal';
import { IsometricHeader } from './IsometricHeader';
import { BuildToolbar } from './BuildToolbar';
import { BuildCursorBanner } from './BuildCursorBanner';
import { CATALOG, GRID_SIZE_X, GRID_SIZE_Y } from './catalog';
import { createInitialTerrain, INITIAL_BUILDINGS } from './initialWorld';
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
  const [terrainTiles, setTerrainTiles] = useState<Record<string, TileDef['type']>>(createInitialTerrain);
  const [roadOrientations, setRoadOrientations] = useState<Record<string, 0 | 90>>({});
  const [roadTypes, setRoadTypes] = useState<Record<string, 'curb' | 'seamless' | 'dirt'>>({});

  // Modale akcji i inspekcji
  const [inspectingBuilding, setInspectingBuilding] = useState<PlacedBuilding | null>(null);
  const [buildPickerCoord, setBuildPickerCoord] = useState<{ x: number; y: number } | null>(null);
  const [rebuildTarget, setRebuildTarget] = useState<RebuildTarget | null>(null);
  const [buildingsState, setBuildingsState] = useState<Record<string, BuildingState>>({});

  // Postawione budynki na mapie
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>(INITIAL_BUILDINGS);

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
        setBuildPickerCoord(null);
        setRebuildTarget(null);
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
        inspectingRoad: rebuildTarget && rebuildTarget.kind === 'road' ? { x: rebuildTarget.x, y: rebuildTarget.y } : null,
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [zoom, pan, placedBuildings, selectedType, buildRotation, hoverTile, gold, terrainTiles, roadOrientations, roadTypes, inspectingBuilding, rebuildTarget]);

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

    // 2. Kliknięcie PRAWYM przyciskiem myszy (PPM) -> Menu Wyburzenia lub Przebudowy/Remontu
    if (e.button === 2 && clickedTile) {
      if (selectedType) {
        setSelectedType(null);
      }
      setBuildPickerCoord(null);
      setInspectingBuilding(null);

      // a) Kliknięcie PPM w budynek
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

      // b) Kliknięcie PPM w drogę
      if (terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road') {
        const subType = roadTypes[`${clickedTile.x},${clickedTile.y}`] || 'curb';
        const ori = roadOrientations[`${clickedTile.x},${clickedTile.y}`] || 0;
        setRebuildTarget({ kind: 'road', x: clickedTile.x, y: clickedTile.y, roadType: subType, orientation: ori });
        return;
      }

      // c) Kliknięcie PPM w parcelę terenu / las
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

    // 3. Kliknięcie LEWYM przyciskiem myszy (LPM) w element na mapie gdy NIE budujemy
    if (e.button === 0 && !selectedType && clickedTile) {
      // a) Kliknięcie w budynek -> Otwórz pulpit zarządzania
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
        setRebuildTarget(null);
        setBuildPickerCoord(null);
        return;
      }

      // b) Kliknięcie w drogę
      if (terrainTiles[`${clickedTile.x},${clickedTile.y}`] === 'road') {
        const subType = roadTypes[`${clickedTile.x},${clickedTile.y}`] || 'curb';
        const ori = roadOrientations[`${clickedTile.x},${clickedTile.y}`] || 0;
        setRebuildTarget({ kind: 'road', x: clickedTile.x, y: clickedTile.y, roadType: subType, orientation: ori });
        setInspectingBuilding(null);
        setBuildPickerCoord(null);
        return;
      }

      // c) Kliknięcie w wolną parcelę terenu -> Otwórz Menu Budowlane na tym polu!
      if (
        clickedTile.x >= 2 &&
        clickedTile.x < GRID_SIZE_X &&
        clickedTile.y >= 0 &&
        clickedTile.y < GRID_SIZE_Y
      ) {
        setBuildPickerCoord({ x: clickedTile.x, y: clickedTile.y });
        setInspectingBuilding(null);
        setRebuildTarget(null);
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

      {/* MENU BUDOWLANE (LPM NA WOLNE POLE) */}
      {buildPickerCoord && (
        <BuildPickerModal
          coord={buildPickerCoord}
          gold={gold}
          onSelectAndBuild={(item, rot) => {
            const curSizeX = rot === 0 ? item.defaultSizeX : item.defaultSizeY;
            const curSizeY = rot === 0 ? item.defaultSizeY : item.defaultSizeX;
            const isCollision = placedBuildings.some((b) =>
              buildPickerCoord.x < b.x + b.sizeX &&
              buildPickerCoord.x + curSizeX > b.x &&
              buildPickerCoord.y < b.y + b.sizeY &&
              buildPickerCoord.y + curSizeY > b.y
            );
            const isWaterOrOut =
              buildPickerCoord.x <= 1 ||
              buildPickerCoord.x + curSizeX > GRID_SIZE_X ||
              buildPickerCoord.y < 0 ||
              buildPickerCoord.y + curSizeY > GRID_SIZE_Y;

            if (item.typeId.startsWith('road')) {
              setTerrainTiles((prev) => ({ ...prev, [`${buildPickerCoord.x},${buildPickerCoord.y}`]: 'road' }));
              setRoadOrientations((prev) => ({ ...prev, [`${buildPickerCoord.x},${buildPickerCoord.y}`]: rot }));
              setRoadTypes((prev) => ({ ...prev, [`${buildPickerCoord.x},${buildPickerCoord.y}`]: item.roadSubType || 'curb' }));
              setGold((g) => g - item.cost);
              setBuildPickerCoord(null);
              return;
            }

            let isOnRoad = false;
            for (let tx = buildPickerCoord.x; tx < buildPickerCoord.x + curSizeX; tx++) {
              for (let ty = buildPickerCoord.y; ty < buildPickerCoord.y + curSizeY; ty++) {
                if (terrainTiles[`${tx},${ty}`] === 'road') isOnRoad = true;
              }
            }

            if (!isCollision && !isWaterOrOut && !isOnRoad && gold >= item.cost) {
              setPlacedBuildings((prev) => [
                ...prev,
                {
                  id: `${item.typeId}_${Date.now()}`,
                  typeId: item.typeId,
                  name: item.name,
                  x: buildPickerCoord.x,
                  y: buildPickerCoord.y,
                  sizeX: curSizeX,
                  sizeY: curSizeY,
                  rotation: rot,
                  cost: item.cost,
                },
              ]);
              setGold((g) => g - item.cost);
              setBuildPickerCoord(null);
            }
          }}
          onClose={() => setBuildPickerCoord(null)}
        />
      )}

      {/* MENU WYBURZENIA LUB PRZEBUDOWY/REMONTU (PPM NA DOWOLNY ELEMENT) */}
      {rebuildTarget && (
        <RebuildDemolishModal
          target={rebuildTarget}
          gold={gold}
          onDemolishBuilding={(id) => {
            const b = placedBuildings.find((x) => x.id === id);
            if (b) {
              setPlacedBuildings((prev) => prev.filter((x) => x.id !== id));
              setGold((g) => g + Math.floor(b.cost * 0.5));
            }
            setRebuildTarget(null);
          }}
          onDemolishRoad={(x, y) => {
            const key = `${x},${y}`;
            const subType = roadTypes[key] || 'curb';
            const refund = subType === 'dirt' ? 8 : 25;
            setTerrainTiles((prev) => ({ ...prev, [key]: 'grass' }));
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
            setRebuildTarget(null);
          }}
          onChangeRoadType={(x, y, newType) => {
            setRoadTypes((prev) => ({ ...prev, [`${x},${y}`]: newType }));
            setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, roadType: newType } : prev));
          }}
          onRotateRoad={(x, y) => {
            const curOri = roadOrientations[`${x},${y}`] || 0;
            const newOri = curOri === 0 ? 90 : 0;
            setRoadOrientations((prev) => ({ ...prev, [`${x},${y}`]: newOri }));
            setRebuildTarget((prev) => (prev && prev.kind === 'road' ? { ...prev, orientation: newOri } : prev));
          }}
          onRenovateBuilding={(bldg) => {
            setInspectingBuilding(bldg);
            setRebuildTarget(null);
          }}
          onClearForest={(x, y) => {
            setTerrainTiles((prev) => ({ ...prev, [`${x},${y}`]: 'grass' }));
            setGold((g) => g + 15);
            setRebuildTarget(null);
          }}
          onChangeTerrainType={(x, y, newType, costDelta) => {
            setTerrainTiles((prev) => ({ ...prev, [`${x},${y}`]: newType }));
            setGold((g) => g + costDelta);
            setRebuildTarget(null);
          }}
          onClose={() => setRebuildTarget(null)}
        />
      )}
    </div>
  );
};
