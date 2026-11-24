import React, { useState } from 'react';
import type {
  FarmCapitalismState,
  CropType,
} from './farmGridTypes';
import {
  CROPS_CONFIG,
  canWorkerHandleStage,
  getGrainSiloCapacityKg,
  getGrainSiloDailyCostPence,
  getGrainSiloUpgradeCostGbp,
  getMaxGrainSiloLevel,
  getStageAssignedWorkerIds,
} from './farmGridTypes';
import type { BuildingState } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import { getContractMeta } from './industryContracts';
import { FarmOfferBars } from './FarmOfferBars';
import { FarmManureBinCard } from './FarmManureBinCard';
import { FarmStrawBinCard } from './FarmStrawBinCard';
import { IncomingSalesContractsCard } from './IncomingSalesContractsCard';
import { computeSupplyContractPenalty } from './industryContracts';

interface FarmStorageBinsProps {
  currentBuildingId?: string;
  state: FarmCapitalismState;
  attachedFieldsCount?: number;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (patch: Partial<FarmCapitalismState>) => void;
}

export const FarmStorageBins: React.FC<FarmStorageBinsProps> = ({
  currentBuildingId,
  state,
  attachedFieldsCount = 0,
  allWorldBuildings = [],
  buildingsState = {},
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'buy' | 'sell'>('buy');
  const [seedSupplierId, setSeedSupplierId] = useState<string>('trade_ship_init');
  const livestockFarms = allWorldBuildings.filter((b) => b.typeId === 'livestock_farm');
  const otherGrainFarms = allWorldBuildings.filter(
    (b) => b.typeId === 'wheat_farm' && b.id !== currentBuildingId
  );
  const [selectedLivestockId, setSelectedLivestockId] = useState<string>(livestockFarms[0]?.id || '');

  const rawGrains = state.grainStockKg;
  const isLegacyDummy =
    (state.cropType || 'pszenica') === 'pszenica' &&
    rawGrains?.zyto === 120;
  const grainStock: Record<CropType, number> = {
    pszenica: rawGrains?.pszenica ?? state.wheatStockKg ?? 450,
    zyto: isLegacyDummy ? 0 : (rawGrains?.zyto ?? 0),
    jeczmien: rawGrains?.jeczmien ?? 0,
  };

  const manureStock = state.manureStockKg ?? state.fertilizerStockKg ?? 250;
  const strawStock = state.strawStockKg ?? 600;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSellStraw = () => {
    if (strawStock < 100) {
      showFeedback(`⚠️ Zbyt mało słomy w magazynie (wymagane min. 100 kg na transport wozem)!`);
      return;
    }
    onUpdateState({
      strawStockKg: strawStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + 6,
    });
    showFeedback(`🌾 Sprzedano 100 kg słomy/ściółki do fermy hodowlanej za £6!`);
  };

  const activeLivestockId =
    livestockFarms.some((f) => f.id === selectedLivestockId)
      ? selectedLivestockId
      : (livestockFarms[0]?.id || '');
  const selectedFarm = livestockFarms.find((f) => f.id === activeLivestockId);
  const selectedFarmLivestockState = selectedFarm ? buildingsState[selectedFarm.id]?.livestockState : undefined;
  const selectedFarmManureKg = selectedFarmLivestockState?.storage?.manureKg ?? 0;

  const handleBuyManure = () => {
    if (!selectedFarm || !selectedFarmLivestockState) {
      showFeedback('⚠️ Wybierz najpierw fermę zwierzęcą produkującą obornik!');
      return;
    }
    if (selectedFarmManureKg <= 0) {
      showFeedback(`⚠️ Wybrana ferma (${selectedFarm.name}) nie ma obecnie zapasu obornika!`);
      return;
    }

    const amount = Math.min(100, selectedFarmManureKg);
    const cost = Math.max(1, Math.round((amount / 100) * 12));
    const newStock = manureStock + amount;

    if (onUpdateAnyBuildingState) {
      onUpdateAnyBuildingState(selectedFarm.id, {
        livestockState: {
          ...selectedFarmLivestockState,
          storage: {
            ...selectedFarmLivestockState.storage,
            manureKg: Math.max(0, selectedFarmManureKg - amount),
          },
        },
      });
    }
    if (onSpendGold) {
      onSpendGold(cost);
    }

    onUpdateState({
      manureStockKg: newStock,
      fertilizerStockKg: newStock,
      manureShortageWarning: undefined,
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });

    showFeedback(`🛒 Przewieziono ${amount} kg obornika z fermy „${selectedFarm.name}” (Koszt: £${cost})!`);
  };

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK SPICHLERZA */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Spichlerz Folwarczny – Komory Zasypowe (1880 r.)
              <span
                title="Drewniane zasieki spichlerza podzielone są na komorę zboża, zasiek obornika oraz stóg słomy."
                className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] inline-flex items-center justify-center cursor-help"
              >
                ?
              </span>
            </h3>
          </div>
          <div className="bg-stone-950/80 border border-amber-800/50 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-mono">
              Wybór siewu:
            </span>
            <span className="text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span>{CROPS_CONFIG[state.cropType || 'pszenica'].icon}</span>
              <span>{CROPS_CONFIG[state.cropType || 'pszenica'].name}</span>
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3 py-2 rounded-xl font-medium animate-fadeIn">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* 2 PODZAKŁADKI JAK W MŁYNIE PAROWYM: ZAKUPY / SPRZEDAŻ */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSubTab('buy')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'buy'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🛒 Zakupy (Surowce)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('sell')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'sell'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🤝 Sprzedaż (Wyroby)
        </button>
      </div>

      {subTab === 'buy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* LEWA KOLUMNA: NASIONA ZE STATKU LUB INNEJ FARMY + NAWÓZ NATURALNY */}
          <div className="space-y-3.5">
            {(() => {
              const activeCropId = state.cropType || 'pszenica';
              const siloGrainStockKg =
                state.grainStockKg?.[activeCropId] ??
                (activeCropId === 'pszenica' ? state.wheatStockKg ?? 0 : 0);
              const siloCapKg = getGrainSiloCapacityKg(
                Math.min(4, Math.max(1, state.siloLevel ?? 1)),
                attachedFieldsCount
              );
              const requiredSeedKg = 300 + Math.max(0, attachedFieldsCount) * 150;
              const isShipSeed =
                seedSupplierId === 'trade_ship_init' || seedSupplierId.startsWith('trade_ship');
              const activeSeedFarm = otherGrainFarms.find((f) => f.id === seedSupplierId);
              const farmSeedAvailKg = activeSeedFarm
                ? buildingsState[activeSeedFarm.id]?.farmCapitalism?.grainStockKg?.[activeCropId] ??
                  buildingsState[activeSeedFarm.id]?.farmCapitalism?.wheatStockKg ??
                  0
                : 0;
              const priceMultiplier = isShipSeed ? 0.11 : 0.09; // £11/100kg ze statku, £9/100kg z innej farmy

              return (
                <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-amber-500/40 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌱</span>
                      <div>
                        <h4 className="text-xs font-bold text-amber-200">
                          Ziarno siewne ({CROPS_CONFIG[activeCropId].name})
                        </h4>
                        <p className="text-[10px] font-mono text-stone-400">
                          W magazynie: <strong className={siloGrainStockKg <= 0 ? 'text-rose-400' : 'text-emerald-300'}>{siloGrainStockKg} kg</strong> • Wymagane na siew: {requiredSeedKg} kg
                        </p>
                      </div>
                    </div>
                  </div>
                  <select
                    value={isShipSeed || activeSeedFarm ? seedSupplierId : 'trade_ship_init'}
                    onChange={(e) => setSeedSupplierId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
                  >
                    <option value="trade_ship_init">
                      🚢 Statek Handlowy (£11 / 100 kg)
                    </option>
                    {otherGrainFarms.map((f) => {
                      const avail =
                        buildingsState[f.id]?.farmCapitalism?.grainStockKg?.[activeCropId] ??
                        buildingsState[f.id]?.farmCapitalism?.wheatStockKg ??
                        0;
                      return (
                        <option key={f.id} value={f.id} disabled={avail < 100}>
                          🌾 {formatSupplierOrderLabel(f, buildingsState, allWorldBuildings)} (stan: {avail} kg • £9 / 100 kg)
                        </option>
                      );
                    })}
                  </select>
                  <div className="flex flex-wrap gap-1.5">
                    {[100, 250, 500].map((kg) => {
                      const spaceLeft = Math.max(0, siloCapKg - siloGrainStockKg);
                      const buyKg = Math.min(kg, spaceLeft);
                      const cost = Math.round(buyKg * priceMultiplier);
                      const disabled = buyKg <= 0 || (!isShipSeed && farmSeedAvailKg < buyKg);
                      return (
                        <button
                          key={kg}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            if (buyKg <= 0) return;
                            if (!isShipSeed && activeSeedFarm && onUpdateAnyBuildingState) {
                              const sellerCap = buildingsState[activeSeedFarm.id]?.farmCapitalism;
                              if (sellerCap) {
                                const curSellerGrain =
                                  sellerCap.grainStockKg?.[activeCropId] ?? sellerCap.wheatStockKg ?? 0;
                                const nextSellerGrain = Math.max(0, curSellerGrain - buyKg);
                                onUpdateAnyBuildingState(activeSeedFarm.id, {
                                  farmCapitalism: {
                                    ...sellerCap,
                                    grainStockKg: {
                                      ...(sellerCap.grainStockKg || { pszenica: 0, zyto: 0, jeczmien: 0 }),
                                      [activeCropId]: nextSellerGrain,
                                    },
                                    ...(activeCropId === 'pszenica' ? { wheatStockKg: nextSellerGrain } : {}),
                                  },
                                });
                              }
                            }
                            if (onSpendGold) onSpendGold(cost);
                            const nextSiloStock = Math.min(siloCapKg, siloGrainStockKg + buyKg);
                            onUpdateState({
                              grainStockKg: {
                                ...(state.grainStockKg || { pszenica: 0, zyto: 0, jeczmien: 0 }),
                                [activeCropId]: nextSiloStock,
                              },
                              ...(activeCropId === 'pszenica' ? { wheatStockKg: nextSiloStock } : {}),
                              seedSource: 'storage',
                            });
                            showFeedback(
                              `${isShipSeed ? '🚢' : '🌾'} Kupiono ${buyKg} kg ziarna ${CROPS_CONFIG[activeCropId].name} do spichlerza (${isShipSeed ? 'Statek Handlowy' : activeSeedFarm?.name}) za £${cost}!`
                            );
                          }}
                          className="flex-1 min-w-[95px] py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 disabled:opacity-40 border border-amber-500/50 text-amber-200 text-[11px] font-mono font-bold cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                          + {kg} kg (£{Math.round(kg * priceMultiplier)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <FarmManureBinCard
              state={state}
              attachedFieldsCount={attachedFieldsCount}
              manureStock={manureStock}
              livestockFarms={livestockFarms}
              buildingsState={buildingsState}
              activeLivestockId={activeLivestockId}
              selectedFarmManureKg={selectedFarmManureKg}
              onSelectLivestock={setSelectedLivestockId}
              onBuyManure={handleBuyManure}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              showFeedback={showFeedback}
            />
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY ZAKUPU */}
          <div className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                📜 Zawarte Kontrakty Zakupu
              </h4>
              <span className="text-[10px] font-mono text-stone-400">
                Aktywne: <strong className="text-emerald-300">{state.manureOrder ? 1 : 0}</strong>
              </span>
            </div>
            {!state.manureOrder ? (
              <p className="text-[11px] text-stone-400 italic">Brak aktywnych kontraktów zakupu.</p>
            ) : (() => {
              const ord = state.manureOrder;
              const ordMeta = getContractMeta(ord.contractType);
              const supObj = livestockFarms.find((f) => f.id === ord.supplierId);
              const owner = buildingsState[ord.supplierId]?.ownerName || supObj?.playerName;
              const isOurs = !owner || owner === 'Gracz';
              const penalty = computeSupplyContractPenalty(
                ord.monthlyQuantityKg,
                state.manurePricePer100Kg ?? 12,
                ord.contractType,
                ord.monthsRemaining
              );
              return (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]">
                  <div className="text-emerald-200 font-semibold">
                    ✓ <span className="text-white font-bold">Obornik Naturalny</span> •{' '}
                    <span className={isOurs ? 'text-sky-300 font-bold' : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'}>
                      {supObj ? formatSupplierOrderLabel(supObj, buildingsState, allWorldBuildings) : 'Ferma Hodowlana'}
                    </span>{' '}
                    •{' '}
                    <span className="font-mono font-bold text-yellow-300">
                      {ord.monthlyQuantityKg.toLocaleString('pl-PL')} kg/msc
                    </span>{' '}
                    • {ordMeta.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (penalty > 0 && onSpendGold) onSpendGold(penalty);
                      onUpdateState({ manureOrder: undefined });
                      showFeedback(penalty > 0 ? `Zerwano kontrakt na obornik (kara: £${penalty}).` : 'Anulowano zamówienie na obornik.');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
                  >
                    ✕{penalty > 0 ? ` (£${penalty})` : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* LEWA KOLUMNA: MAGAZYNY WYROBÓW (ZBOŻE + SŁOMA) */}
          <div className="space-y-3.5">
        {/* 1. KAFELEK: ZBOŻE W SPICHLERZU */}
        {(() => {
          const activeCropId = state.cropType || 'pszenica';
          const occupiedOtherCropId = (Object.keys(grainStock) as CropType[]).find(
            (id) => id !== activeCropId && grainStock[id] > 0
          );
          const displayedCropId =
            grainStock[activeCropId] > 0 ? activeCropId : (occupiedOtherCropId || activeCropId);
          const isOccupiedByPreviousCrop = displayedCropId !== activeCropId;
          const crop = CROPS_CONFIG[displayedCropId];
          const stock = grainStock[displayedCropId];
          const maxSiloLevel = getMaxGrainSiloLevel(attachedFieldsCount);
          const siloLevel = Math.min(maxSiloLevel, Math.max(1, state.siloLevel ?? 1));
          const siloCapacityKg = getGrainSiloCapacityKg(siloLevel, attachedFieldsCount);
          const dailyPence = getGrainSiloDailyCostPence(siloLevel);
          const upgradeCost = getGrainSiloUpgradeCostGbp(siloLevel);
          const grainQuality = Math.min(100, Math.max(0, state.grainQualityPercent ?? 100));
          const grainBrand = state.grainBrandLevel ?? 0;
          const salePricePerTon = state.grainSalePricePerTon ?? crop.marketPricePerTon;
          const fillPercent = Math.min(100, Math.round((stock / siloCapacityKg) * 100));
          const seedReserveKg = 300 + Math.max(0, attachedFieldsCount) * 150;
          const sellableKg = Math.max(0, stock - seedReserveKg);
          const reservePercent = Math.min(100, Math.round((seedReserveKg / siloCapacityKg) * 100));

          const sellingWorkerIds = getStageAssignedWorkerIds(state.stageAssignments, 'storing_selling');
          const sellingMerchant =
            (state.crew || []).find(
              (w) => sellingWorkerIds.includes(w.id) && canWorkerHandleStage(w, 'storing_selling')
            ) || null;
          const isOfferVisible = Boolean(sellingMerchant && sellableKg > 0);

          const handleUpgradeSilo = () => {
            if (siloLevel >= maxSiloLevel) return;
            if (onSpendGold) onSpendGold(upgradeCost);
            onUpdateState({ siloLevel: siloLevel + 1 });
            showFeedback(`🏛️ Rozbudowano spichlerz do poziomu ${siloLevel + 1} (${getGrainSiloCapacityKg(siloLevel + 1, attachedFieldsCount) / 1000} t) za £${upgradeCost}!`);
          };

          const otherMarketPrices = otherGrainFarms
            .map((f) => buildingsState[f.id]?.farmCapitalism)
            .filter((fc) => fc && (fc.cropType || 'pszenica') === crop.id && (fc.grainSalePricePerTon ?? 0) > 0)
            .map((fc) => Number(fc!.grainSalePricePerTon));
          const avgMarketPrice =
            otherMarketPrices.length > 0
              ? Math.round(otherMarketPrices.reduce((s, p) => s + p, 0) / otherMarketPrices.length)
              : null;
          const refPriceText =
            avgMarketPrice !== null
              ? `śr. rynkowa: £${avgMarketPrice}/t`
              : `statek: £${crop.marketPricePerTon}/t`;

          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              {isOccupiedByPreviousCrop && (
                <div className="mb-2 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow bg-rose-400 inline-block self-start">
                  Poprzedni zasiew (Opróżnij)
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                      {crop.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <span>{crop.name}</span>
                        <span
                          title={crop.desc}
                          className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] inline-flex items-center justify-center cursor-help"
                        >
                          ?
                        </span>
                      </h4>
                      <span className="text-[10px] text-amber-400 font-mono block">
                        Jedyna Komora Spichlerza Fermy
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <label className="text-[10px] font-mono text-stone-300 flex items-center gap-1">
                      <span>Cena (£/t):</span>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={salePricePerTon}
                        onChange={(e) =>
                          onUpdateState({
                            grainSalePricePerTon: Math.max(1, Number(e.target.value) || crop.marketPricePerTon),
                          })
                        }
                        className="w-16 bg-stone-950 border border-amber-500/60 rounded-lg px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300 text-right focus:outline-none focus:border-amber-400"
                      />
                    </label>
                    <span className="text-[9px] font-mono text-stone-400">
                      ({refPriceText})
                    </span>
                  </div>
                </div>

                <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3 my-3 flex gap-3 items-stretch min-h-[144px]">
                  <div className="flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-stone-400 font-mono text-[11px]">Zapas (Poz. {siloLevel}/{maxSiloLevel}):</span>
                        <span className="font-bold font-mono text-amber-300">
                          {stock} kg <span className="text-stone-500 font-normal">/ {siloCapacityKg / 1000} t</span>
                        </span>
                      </div>
                      <div className="relative w-full bg-stone-800 h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${fillPercent}%` }}
                        />
                        <div
                          title={`Nienaruszalna rezerwa siewna: ${seedReserveKg} kg`}
                          className="absolute top-0 bottom-0 w-0.5 bg-sky-400/90"
                          style={{ left: `${reservePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] font-mono bg-stone-900/70 border border-stone-800 rounded-lg p-2">
                      <div className="flex justify-between">
                        <span className="text-sky-300">🔒 Rezerwa siewna:</span>
                        <strong className="text-sky-200">{seedReserveKg} kg</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-300">📦 Na sprzedaż:</span>
                        <strong className="text-emerald-200">{sellableKg} kg</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-stone-800/80">
                        <span className="text-stone-400">Składowanie:</span>
                        <strong className="text-amber-300">{dailyPence} p/dzień</strong>
                      </div>
                    </div>
                  </div>

                  <FarmOfferBars
                    qualityPercent={grainQuality}
                    brandLevel={grainBrand}
                    priceValue={salePricePerTon}
                    priceLabel={`£${salePricePerTon}`}
                    maxPriceForScale={250}
                  />
                </div>

                {/* AKTUALNI KUPCY ZBOŻA / PASZY */}
                {(() => {
                  const buyers: { id: string; name: string; qtyLabel: string; contract: string }[] = [];
                  if (currentBuildingId) {
                    allWorldBuildings.forEach((b) => {
                      if (b.id === currentBuildingId) return;
                      const st = buildingsState[b.id];
                      if (b.typeId === 'livestock_farm' && st?.livestockState?.feedOrder?.supplierId === currentBuildingId) {
                        const ord = st.livestockState.feedOrder;
                        buyers.push({
                          id: `feed_${b.id}`,
                          name: formatSupplierOrderLabel(b),
                          qtyLabel: `${ord.monthlyQuantityKg} kg/msc`,
                          contract: getContractMeta(ord.contractType).label,
                        });
                      }
                      if (st?.merchantSupplierId === currentBuildingId && st.merchantHired) {
                        const units = st.merchantContractUnitsPerMonth ?? 1000;
                        buyers.push({
                          id: `ind_${b.id}`,
                          name: formatSupplierOrderLabel(b),
                          qtyLabel: `${units} jedn./msc`,
                          contract: getContractMeta(st.merchantContractType).label,
                        });
                      }
                    });
                  }
                  return (
                    <div className="bg-stone-950/75 border border-stone-800 rounded-xl p-2 mb-2 text-[10px] font-mono space-y-1">
                      <div className="text-sky-300 font-bold uppercase tracking-wider">
                        📜 Aktualni kupcy ({buyers.length})
                      </div>
                      {buyers.length === 0 ? (
                        <div className="text-stone-500">Brak aktywnych kupców zboża</div>
                      ) : (
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {buyers.map((buyer) => (
                            <div key={buyer.id} className="flex items-center justify-between gap-2 bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
                              <span className="text-orange-400 font-bold truncate">{buyer.name}</span>
                              <span className="text-emerald-300 font-bold shrink-0">
                                {buyer.qtyLabel} • {buyer.contract}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800/60">
                {siloLevel < maxSiloLevel ? (
                  <button
                    type="button"
                    onClick={handleUpgradeSilo}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/60 hover:border-amber-400 transition-all cursor-pointer shadow"
                  >
                    ⬆️ Rozbuduj spichlerz (+50 t → {getGrainSiloCapacityKg(siloLevel + 1, attachedFieldsCount) / 1000} t za £{upgradeCost})
                  </button>
                ) : (
                  <div className="w-full py-1.5 px-3 rounded-xl text-[11px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 text-center">
                    ✅ Maksymalna rozbudowa spichlerza ({getGrainSiloCapacityKg(maxSiloLevel, attachedFieldsCount) / 1000} t)
                  </div>
                )}
                <div
                  className={`w-full py-2 px-3 rounded-xl text-[11px] font-medium border text-center leading-[1.8] ${
                    isOfferVisible
                      ? 'bg-emerald-950/50 text-emerald-200 border-emerald-500/50'
                      : 'bg-stone-900/70 text-stone-300 border-stone-800'
                  }`}
                >
                  {isOfferVisible
                    ? `🟢 Oferta widoczna (${sellableKg} kg po £${salePricePerTon}/t • ${sellingMerchant!.name}).`
                    : !sellingMerchant
                    ? '🟡 Oferta ukryta — przypisz Sprzedawcę na etapie 8.'
                    : `⚪ Oferta ukryta — brak nadwyżki ponad rezerwę (${seedReserveKg} kg).`}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. KAFELEK: STÓG SŁOMY ZBOŻOWEJ */}
        {(() => {
          const otherStrawPrices = otherGrainFarms
            .map((f) => buildingsState[f.id]?.farmCapitalism?.strawPricePerTon)
            .filter((p): p is number => typeof p === 'number' && p > 0);
          const avgStrawMarketPrice =
            otherStrawPrices.length > 0
              ? Math.round(otherStrawPrices.reduce((s, p) => s + p, 0) / otherStrawPrices.length)
              : null;
          return (
            <FarmStrawBinCard
              state={state}
              strawStock={strawStock}
              avgMarketPrice={avgStrawMarketPrice}
              onSellStraw={handleSellStraw}
              onSpendGold={onSpendGold}
              onUpdateState={onUpdateState}
              showFeedback={showFeedback}
            />
          );
        })()}
          </div>

          {/* PRAWA KOLUMNA: ZAWARTE KONTRAKTY SPRZEDAŻY */}
          <IncomingSalesContractsCard
            buildingId={currentBuildingId}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
          />
        </div>
      )}
    </div>
  );
};
