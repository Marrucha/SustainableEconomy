import React, { useState } from 'react';
import type {
  BuildingState,
  MarketStallCrewMember,
  MarketStallSeller,
  MarketStallSlot,
  MarketStallSupplySlot,
} from '../types';
import type { UseGameClockReturn } from '../clock/useGameClock';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { MarketStallModal } from './MarketStallModal';

interface MarketplaceSectionProps {
  buildingState: BuildingState;
  allWorldBuildings?: WorldSupplierBuilding[];
  buildingsState?: Record<string, BuildingState>;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const STALL_THEMES = [
  { name: 'Stoisko #1 (Zielone)', color: 'border-emerald-500/40 bg-emerald-950/20', badge: 'bg-emerald-500/20 text-emerald-300' },
  { name: 'Stoisko #2 (Bordowe)', color: 'border-rose-500/40 bg-rose-950/20', badge: 'bg-rose-500/20 text-rose-300' },
  { name: 'Stoisko #3 (Granatowe)', color: 'border-sky-500/40 bg-sky-950/20', badge: 'bg-sky-500/20 text-sky-300' },
  { name: 'Stoisko #4 (Złote)', color: 'border-amber-500/40 bg-amber-950/20', badge: 'bg-amber-500/20 text-amber-300' },
  { name: 'Stoisko #5 (Bordowe)', color: 'border-rose-500/40 bg-rose-950/20', badge: 'bg-rose-500/20 text-rose-300' },
  { name: 'Stoisko #6 (Zielone)', color: 'border-emerald-500/40 bg-emerald-950/20', badge: 'bg-emerald-500/20 text-emerald-300' },
  { name: 'Stoisko #7 (Złote)', color: 'border-amber-500/40 bg-amber-950/20', badge: 'bg-amber-500/20 text-amber-300' },
  { name: 'Stoisko #8 (Granatowe)', color: 'border-sky-500/40 bg-sky-950/20', badge: 'bg-sky-500/20 text-sky-300' },
];

const BASE_AUCTION_MIN_BID = 400;
const MAX_AUCTION_SLOTS_PER_YEAR = 4;

function createInitialStalls(): MarketStallSlot[] {
  return Array.from({ length: 8 }, (_, idx) => ({
    slotIndex: idx + 1,
    tenantName: null,
    annualRent: BASE_AUCTION_MIN_BID,
    sellers: [],
  }));
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({
  buildingState,
  allWorldBuildings = [],
  buildingsState = {},
  clock,
  onSpendGold,
  onUpdateState,
}) => {
  const currentYear = clock?.date.year ?? 1880;
  const currentMonth = clock?.date.month ?? 1;
  const currentDay = clock?.date.day ?? 1;
  const currentTotalDays = currentYear * 360 + (currentMonth - 1) * 30 + currentDay;
  const isStallRentedNow = (s: MarketStallSlot) =>
    s.rentedUntilTotalDays !== undefined
      ? s.rentedUntilTotalDays > currentTotalDays
      : (s.rentedUntilYear ?? 0) >= currentYear;

  const stalls: MarketStallSlot[] =
    buildingState.marketStalls && buildingState.marketStalls.length === 8
      ? buildingState.marketStalls
      : createInitialStalls();

  const [selectedAuctionSlots, setSelectedAuctionSlots] = useState<number[]>([]);
  const [bidPerSlot, setBidAmount] = useState<number>(BASE_AUCTION_MIN_BID);
  const [activeStallSlot, setActiveStallSlot] = useState<number | null>(null);
  const [auctionMessage, setAuctionMessage] = useState<string | null>(null);

  const freeSlotsCount = stalls.filter((s) => !isStallRentedNow(s)).length;
  const allSlotsOccupiedThisYear = freeSlotsCount === 0;

  const activePlayerStalls = stalls.filter(
    (s) => s.tenantName === 'Gracz' && isStallRentedNow(s)
  );

  const suppliersCount = buildingState.marketSuppliersCount ?? 0;

  const toggleAuctionSlot = (slotIndex: number) => {
    setAuctionMessage(null);
    setActiveStallSlot(null);
    setSelectedAuctionSlots((prev) => {
      if (prev.includes(slotIndex)) return prev.filter((id) => id !== slotIndex);
      if (prev.length >= MAX_AUCTION_SLOTS_PER_YEAR) return prev;
      return [...prev, slotIndex];
    });
  };

  const handlePlaceBatchBid = () => {
    if (selectedAuctionSlots.length === 0) return;

    let wonCount = 0;
    let totalSpent = 0;
    const wonIndices: number[] = [];

    const updatedStalls = stalls.map((s) => {
      if (!selectedAuctionSlots.includes(s.slotIndex)) return s;
      const npcCompetingBid = Math.round(
        BASE_AUCTION_MIN_BID + ((s.slotIndex * 73 + currentYear * 17) % 250)
      );
      const won = bidPerSlot >= npcCompetingBid;
      const untilTotalDays = currentTotalDays + 360;
      const untilDateLabel = `${String(currentDay).padStart(2, '0')}.${String(currentMonth).padStart(2, '0')}.${currentYear + 1}`;
      if (won) {
        wonCount += 1;
        totalSpent += bidPerSlot;
        wonIndices.push(s.slotIndex);
        return {
          ...s,
          tenantName: 'Gracz',
          annualRent: bidPerSlot,
          rentedUntilYear: currentYear + 1,
          rentedUntilTotalDays: untilTotalDays,
          rentedUntilDateLabel: untilDateLabel,
          sellers: s.sellers || [],
        };
      }
      return {
        ...s,
        tenantName: 'Kupiec Miejski (NPC)',
        annualRent: npcCompetingBid,
        rentedUntilYear: currentYear + 1,
        rentedUntilTotalDays: untilTotalDays,
        rentedUntilDateLabel: untilDateLabel,
      };
    });

    if (totalSpent > 0 && onSpendGold) {
      onSpendGold(totalSpent);
    }

    onUpdateState({
      marketStalls: updatedStalls,
      marketLastAuctionYear: currentYear,
    });

    setAuctionMessage(
      wonCount > 0
        ? `🎉 Wygrano ${wonCount} z ${selectedAuctionSlots.length} licytowanych stoisk (${wonIndices.map((i) => `#${i}`).join(', ')}) za łącznie £${totalSpent}! Kliknij swoje stoisko, aby otworzyć slot produkcyjny.`
        : `❌ Konkurencja przebiła oferty na wybrane stoiska — zajęte sloty będą ponownie dostępne w ${currentYear + 1} r.`
    );
    setSelectedAuctionSlots([]);
    if (wonIndices.length > 0) {
      setActiveStallSlot(wonIndices[0]);
    }
  };

  const handleUpdateStallSellers = (slotIndex: number, sellers: MarketStallSeller[]) => {
    const updatedStalls = stalls.map((s) =>
      s.slotIndex === slotIndex ? { ...s, sellers } : s
    );
    onUpdateState({ marketStalls: updatedStalls });
  };

  const handleUpdateStallSupply = (slotIndex: number, supplySlots: MarketStallSupplySlot[]) => {
    const updatedStalls = stalls.map((s) =>
      s.slotIndex === slotIndex ? { ...s, supplySlots } : s
    );
    onUpdateState({ marketStalls: updatedStalls });
  };

  const handleUpdateStallStageCrew = (
    slotIndex: number,
    stageKey: 'supply' | 'trader' | 'delivery',
    members: MarketStallCrewMember[]
  ) => {
    const updatedStalls = stalls.map((s) =>
      s.slotIndex === slotIndex
        ? {
            ...s,
            stageCrew: {
              ...(s.stageCrew || {}),
              [stageKey]: members,
            },
          }
        : s
    );
    onUpdateState({ marketStalls: updatedStalls });
  };

  const inspectedStall =
    activeStallSlot !== null
      ? stalls.find((s) => s.slotIndex === activeStallSlot && s.tenantName === 'Gracz') || null
      : null;

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-stone-900/75 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏛️</span> Miejska Giełda Stoisk (8 Slotów • Licytacja do 4 stoisk naraz)
          </h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Twoje stoiska ({currentYear} r.):{' '}
            <strong className="text-emerald-300">{activePlayerStalls.length} / 8</strong> • Zaopatrzeniowcy:{' '}
            <strong className="text-amber-300">{suppliersCount}</strong> (obsługują do {suppliersCount * 4} stoisk)
          </p>
        </div>
        <span
          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${
            allSlotsOccupiedThisYear
              ? 'bg-stone-800 text-stone-300 border-stone-700'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {allSlotsOccupiedThisYear
            ? `Wszystkie sloty zajęte (kolejna licytacja: ${currentYear + 1})`
            : `Licytacja ${currentYear} OTWARTA (wolne: ${freeSlotsCount})`}
        </span>
      </div>

      {auctionMessage && (
        <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 text-xs text-amber-100">
          {auctionMessage}
        </div>
      )}

      {/* Siatka 8 stoisk targowych */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {stalls.map((stall, idx) => {
          const theme = STALL_THEMES[idx];
          const isRentedThisYear = isStallRentedNow(stall);
          const isMine = stall.tenantName === 'Gracz' && isRentedThisYear;
          const isOccupiedByNpc = Boolean(stall.tenantName) && !isMine && isRentedThisYear;
          const isAuctionSelected = selectedAuctionSlots.includes(stall.slotIndex);
          const isInspecting = activeStallSlot === stall.slotIndex;
          const sellersCount = (stall.sellers || []).length;

          return (
            <button
              key={stall.slotIndex}
              type="button"
              disabled={isOccupiedByNpc}
              onClick={() => {
                if (isMine) {
                  setActiveStallSlot(isInspecting ? null : stall.slotIndex);
                  setSelectedAuctionSlots([]);
                } else {
                  toggleAuctionSlot(stall.slotIndex);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isInspecting
                  ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/50 cursor-pointer'
                  : isAuctionSelected
                  ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/15 cursor-pointer'
                  : isMine
                  ? 'border-emerald-500/60 bg-emerald-950/30 hover:border-emerald-400 cursor-pointer'
                  : isOccupiedByNpc
                  ? 'border-stone-700 bg-stone-900/50 opacity-75 cursor-not-allowed'
                  : `${theme.color} hover:border-amber-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-100">🎪 #{stall.slotIndex}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isMine
                      ? 'bg-emerald-500/25 text-emerald-300'
                      : isAuctionSelected
                      ? 'bg-amber-500/30 text-amber-200'
                      : isOccupiedByNpc
                      ? 'bg-stone-800 text-stone-400'
                      : theme.badge
                  }`}
                >
                  {isMine ? `Twoje (${sellersCount}/4)` : isAuctionSelected ? 'Wybrane' : isOccupiedByNpc ? 'Zajęte' : 'Wolne'}
                </span>
              </div>

              <div className="text-[10px] text-stone-300">
                <p className="font-semibold truncate">{theme.name.replace(`Stoisko #${stall.slotIndex} `, '')}</p>
                {isMine ? (
                  <p className="text-emerald-300/90 mt-0.5">Kliknij, aby otworzyć slot</p>
                ) : isOccupiedByNpc ? (
                  <p className="text-stone-400 mt-0.5">Czynsz: £{stall.annualRent}/rok</p>
                ) : (
                  <p className="text-amber-300/90 mt-0.5">Wywoławcza: £{BASE_AUCTION_MIN_BID}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel licytacji do 4 stoisk naraz */}
      {selectedAuctionSlots.length > 0 && (
        <div className="p-4 rounded-2xl bg-stone-950/85 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-amber-300">
              🔨 Licytacja {selectedAuctionSlots.length} / 4 stoisk ({selectedAuctionSlots.map((i) => `#${i}`).join(', ')}) na rok {currentYear}
            </h5>
            <button
              type="button"
              onClick={() => setSelectedAuctionSlots([])}
              className="text-xs text-stone-400 hover:text-white cursor-pointer"
            >
              Wyczyść wybór
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">Oferta / stoisko:</span>
              {[400, 550, 700, 900].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBidAmount(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                    bidPerSlot === preset
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-stone-900 border-stone-700 text-stone-300'
                  }`}
                >
                  £{preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePlaceBatchBid}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-colors"
            >
              Licytuj ({selectedAuctionSlots.length}) za max £{bidPerSlot * selectedAuctionSlots.length}
            </button>
          </div>
        </div>
      )}

      {/* Osobna karta wylicytowanego stoiska (struktura jak karta piekarni) */}
      {inspectedStall && (
        <MarketStallModal
          stall={inspectedStall}
          stallName={
            STALL_THEMES[inspectedStall.slotIndex - 1]?.name ||
            `Stoisko Targowe #${inspectedStall.slotIndex}`
          }
          suppliersCount={suppliersCount}
          playerStallsCount={activePlayerStalls.length}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          onUpdateSuppliersCount={(nextCount) =>
            onUpdateState({ marketSuppliersCount: nextCount })
          }
          onUpdateStallSupply={handleUpdateStallSupply}
          onUpdateStallSellers={handleUpdateStallSellers}
          onUpdateStallStageCrew={handleUpdateStallStageCrew}
          onClose={() => setActiveStallSlot(null)}
        />
      )}
    </div>
  );
};
