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
  const livestockFarms = allWorldBuildings.filter((b) => b.typeId === 'livestock_farm');
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
          {/* LEWA KOLUMNA: NAWÓZ NATURALNY I FORMATKA ZAMÓWIENIA */}
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
            showFeedback(`🏛️ Rozbudowano spichlerz do poziomu ${siloLevel + 1} (${(siloLevel + 1) * 10} t) za £${upgradeCost}!`);
          };

          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className={`absolute top-2.5 right-2.5 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow ${
                isOccupiedByPreviousCrop ? 'bg-rose-400' : 'bg-amber-500'
              }`}>
                {isOccupiedByPreviousCrop ? 'Poprzedni zasiew (Opróżnij)' : 'Aktywne Zboże'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
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
                    ⬆️ Rozbuduj spichlerz (+10 t → {(siloLevel + 1) * 10} t za £{upgradeCost})
                  </button>
                ) : (
                  <div className="w-full py-1.5 px-3 rounded-xl text-[11px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 text-center">
                    ✅ Maksymalna rozbudowa spichlerza ({maxSiloLevel * 10} t)
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
        <FarmStrawBinCard
          state={state}
          strawStock={strawStock}
          onSellStraw={handleSellStraw}
          onSpendGold={onSpendGold}
          onUpdateState={onUpdateState}
          showFeedback={showFeedback}
        />
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
