import React from 'react';
import type { BuildingState, MarketStallSlot, MarketStallSeller, MarketStallSupplySlot } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { ALL_MARKET_GOODS, getAvailableMarketOffers } from './marketplaceGoods';
import {
  getTransportCompanies,
  getAllowedTransportModes,
  resolveRouteForSupplier,
  TRANSPORT_MODE_LABELS,
} from './transportLogistics';

interface MarketStallDetailPanelProps {
  stall: MarketStallSlot;
  suppliersCount: number;
  playerStallsCount: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onUpdateSuppliersCount: (count: number) => void;
  onUpdateStallSupply: (slotIndex: number, supplySlots: MarketStallSupplySlot[]) => void;
  onUpdateStallSellers: (slotIndex: number, sellers: MarketStallSeller[]) => void;
  onClose: () => void;
}

export const MarketStallDetailPanel: React.FC<MarketStallDetailPanelProps> = ({
  stall,
  suppliersCount,
  playerStallsCount,
  allWorldBuildings,
  buildingsState,
  onUpdateSuppliersCount,
  onUpdateStallSupply,
  onUpdateStallSellers,
  onClose,
}) => {
  const supplySlots = stall.supplySlots || [];
  const sellers = stall.sellers || [];
  const maxStallsCovered = suppliersCount * 4;
  const isStallSupplied = suppliersCount > 0 && maxStallsCovered >= playerStallsCount;
  const transportCompanies = getTransportCompanies(allWorldBuildings);
  const availableOffers = getAvailableMarketOffers(allWorldBuildings, buildingsState);

  // Produkty zabezpieczone przez zaopatrzeniowca na tym stoisku
  const securedGoods = supplySlots
    .filter((slot) => Boolean(slot.supplierBuildingId))
    .map((slot) => ALL_MARKET_GOODS.find((g) => g.id === slot.productId))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const uniqueSecuredGoods = Array.from(
    new Map(securedGoods.map((g) => [g.id, g])).values()
  );

  const handleAddSupplySlot = () => {
    if (!isStallSupplied || supplySlots.length >= 4 || availableOffers.length === 0) return;
    const usedKeys = new Set(
      supplySlots.map((s) => `${s.productId}::${s.supplierBuildingId || ''}`)
    );
    const nextOffer =
      availableOffers.find((o) => !usedKeys.has(o.offerKey)) || availableOffers[0];
    const nextSlot: MarketStallSupplySlot = {
      slotIndex: supplySlots.length + 1,
      productId: nextOffer.good.id,
      supplierBuildingId: nextOffer.building.id,
    };
    onUpdateStallSupply(stall.slotIndex, [...supplySlots, nextSlot]);
  };

  const handleRemoveSupplySlot = (slotIdx: number) => {
    const remaining = supplySlots
      .filter((s) => s.slotIndex !== slotIdx)
      .map((s, i) => ({ ...s, slotIndex: i + 1 }));
    onUpdateStallSupply(stall.slotIndex, remaining);

    // Zaktualizuj sprzedawców, jeśli ich produkt zniknął z zaopatrzenia
    const remainingIds = new Set(remaining.map((r) => r.productId));
    const fallbackId = remaining[0]?.productId || '';
    const updatedSellers = sellers
      .map((sel) => (remainingIds.has(sel.productId) ? sel : { ...sel, productId: fallbackId }))
      .filter((sel) => sel.productId !== '');
    if (updatedSellers.length !== sellers.length || sellers.some((s, i) => s.productId !== updatedSellers[i]?.productId)) {
      onUpdateStallSellers(
        stall.slotIndex,
        updatedSellers.map((s, i) => ({ ...s, sellerIndex: i + 1 }))
      );
    }
  };

  const handleUpdateSupplySlot = (slotIdx: number, patch: Partial<MarketStallSupplySlot>) => {
    const updated = supplySlots.map((s) => (s.slotIndex === slotIdx ? { ...s, ...patch } : s));
    onUpdateStallSupply(stall.slotIndex, updated);
  };

  const handleAddSeller = () => {
    if (sellers.length >= 4 || uniqueSecuredGoods.length === 0) return;
    const usedIds = new Set(sellers.map((s) => s.productId));
    const nextGood = uniqueSecuredGoods.find((g) => !usedIds.has(g.id)) || uniqueSecuredGoods[0];
    const nextSeller: MarketStallSeller = {
      sellerIndex: sellers.length + 1,
      productId: nextGood.id,
      retailPrice: nextGood.defaultPrice,
    };
    onUpdateStallSellers(stall.slotIndex, [...sellers, nextSeller]);
  };

  const handleRemoveSeller = (sellerIdx: number) => {
    const filtered = sellers
      .filter((s) => s.sellerIndex !== sellerIdx)
      .map((s, i) => ({ ...s, sellerIndex: i + 1 }));
    onUpdateStallSellers(stall.slotIndex, filtered);
  };

  const handleUpdateSeller = (sellerIdx: number, patch: Partial<MarketStallSeller>) => {
    const updated = sellers.map((s) => (s.sellerIndex === sellerIdx ? { ...s, ...patch } : s));
    onUpdateStallSellers(stall.slotIndex, updated);
  };

  return (
    <div className="p-4 rounded-2xl bg-stone-950/90 border border-emerald-500/40 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            🎪 Slot Produkcyjny — Stoisko #{stall.slotIndex}
          </h5>
          <p className="text-[11px] text-stone-400 mt-0.5">
            1) Zaopatrzeniowiec zamawia towary w 4 slotach → 2) Sprzedawcy wybierają z produktów zabezpieczonych przez zaopatrzeniowca.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer"
        >
          Zamknij
        </button>
      </div>

      {/* KROK 1: Zaopatrzeniowiec (1:4 stoiska) + jego 4 sloty zamówień */}
      <div className="space-y-2.5">
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
            isStallSupplied
              ? 'bg-emerald-950/25 border-emerald-500/40'
              : 'bg-amber-950/25 border-amber-500/40'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <span>🚚</span> 1. Zaopatrzeniowiec Targowiska (4× capacity = max 4 stoiska / os.)
            </p>
            <p className="text-[11px] text-stone-300 mt-0.5">
              Zatrudnieni: <strong>{suppliersCount}</strong> (obsługują do{' '}
              <strong className="text-emerald-300">{maxStallsCovered}</strong> stoisk • Twoje stoiska: {playerStallsCount})
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              disabled={suppliersCount <= 0}
              onClick={() => onUpdateSuppliersCount(Math.max(0, suppliersCount - 1))}
              className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              -1
            </button>
            <span className="font-mono text-xs font-bold px-2 text-amber-200">{suppliersCount}</span>
            <button
              type="button"
              disabled={suppliersCount >= 2}
              onClick={() => onUpdateSuppliersCount(Math.min(2, suppliersCount + 1))}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-200 disabled:opacity-40 cursor-pointer"
            >
              +1
            </button>
          </div>
        </div>

        {/* 4 sloty zaopatrzeniowca */}
        <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">
              📦 Sloty Zaopatrzeniowca ({supplySlots.length} / 4)
            </span>
            <button
              type="button"
              disabled={!isStallSupplied || supplySlots.length >= 4 || availableOffers.length === 0}
              onClick={handleAddSupplySlot}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 disabled:opacity-40 cursor-pointer"
            >
              ➕ Zamów Produkt do Slotu
            </button>
          </div>

          {!isStallSupplied ? (
            <p className="text-[11px] text-amber-300/80">
              Zatrudnij zaopatrzeniowca powyżej, aby odblokować 4 sloty zamówień towarów z rynku.
            </p>
          ) : availableOffers.length === 0 ? (
            <p className="text-[11px] text-amber-300/85">
              Brak dostępnych produktów na rynku. Aby produkt był widoczny, fabryka, gospodarstwo lub kopalnia muszą mieć zatrudnionego sprzedawcę oraz zapas produktu na magazynie.
            </p>
          ) : supplySlots.length === 0 ? (
            <p className="text-[11px] text-stone-400">
              Brak zamówionych produktów. Dodaj produkty w slotach zaopatrzeniowca, aby sprzedawcy mogli je sprzedawać.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supplySlots.map((slot) => {
                const selectedOffer = availableOffers.find(
                  (o) => o.good.id === slot.productId && o.building.id === slot.supplierBuildingId
                );
                const selectedProducer = selectedOffer?.building;
                const route = resolveRouteForSupplier(selectedProducer);
                const allowedModes = getAllowedTransportModes(route);
                const activeMode =
                  slot.transportMode && allowedModes.includes(slot.transportMode)
                    ? slot.transportMode
                    : allowedModes[0];
                return (
                  <div
                    key={slot.slotIndex}
                    className="p-2.5 rounded-xl bg-stone-950/75 border border-stone-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300">Slot Zaopatrzenia #{slot.slotIndex}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSupplySlot(slot.slotIndex)}
                        className="text-[10px] text-stone-400 hover:text-rose-300 cursor-pointer"
                      >
                        Usuń
                      </button>
                    </div>
                    <select
                      value={selectedOffer?.offerKey || ''}
                      onChange={(e) => {
                        const chosen = availableOffers.find((o) => o.offerKey === e.target.value);
                        if (!chosen) return;
                        handleUpdateSupplySlot(slot.slotIndex, {
                          productId: chosen.good.id,
                          supplierBuildingId: chosen.building.id,
                        });
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100"
                    >
                      <option value="">-- Wybierz produkt i dostawcę (gracza) --</option>
                      {availableOffers.map((offer) => (
                        <option key={offer.offerKey} value={offer.offerKey}>
                          {offer.good.icon} {offer.good.label} — {offer.enterpriseName} (Gracz: {offer.ownerName} • {offer.locationLabel}) — £{offer.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {selectedOffer && (
                      <p className="text-[10px] text-emerald-300/90 px-1">
                        Dostawca: <strong>{selectedOffer.enterpriseName}</strong> • Gracz:{' '}
                        <strong>{selectedOffer.ownerName}</strong> ({selectedOffer.locationLabel})
                      </p>
                    )}

                    {/* Firma transportowa + dozwolony środek transportu 1880 */}
                    {transportCompanies.length === 0 ? (
                      <p className="text-[10px] text-rose-300">
                        ⚠️ Wybuduj Firmę Transportową (2x2), aby dowieźć towar!
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          value={slot.transportCompanyId || ''}
                          onChange={(e) =>
                            handleUpdateSupplySlot(slot.slotIndex, {
                              transportCompanyId: e.target.value || undefined,
                              transportMode: activeMode,
                            })
                          }
                          className="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-[10px] text-stone-200"
                        >
                          <option value="">-- Firma transp. --</option>
                          {transportCompanies.map((tc) => (
                            <option key={tc.id} value={tc.id}>
                              🚚 {tc.name} ({tc.x},{tc.y})
                            </option>
                          ))}
                        </select>
                        <select
                          value={activeMode}
                          onChange={(e) =>
                            handleUpdateSupplySlot(slot.slotIndex, {
                              transportMode: e.target.value as any,
                            })
                          }
                          className="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-[10px] text-amber-200"
                        >
                          {allowedModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {TRANSPORT_MODE_LABELS[mode].icon} {TRANSPORT_MODE_LABELS[mode].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* KROK 2: Sprzedawcy na stoisku (0..4, wybierają z produktów zabezpieczonych przez zaopatrzeniowca) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-200">
            🧑‍💼 2. Sprzedawcy na stoisku ({sellers.length} / 4)
          </span>
          <button
            type="button"
            disabled={sellers.length >= 4 || uniqueSecuredGoods.length === 0}
            onClick={handleAddSeller}
            className="text-[11px] font-bold px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-40 cursor-pointer"
          >
            ➕ Dodaj Sprzedawcę
          </button>
        </div>

        {uniqueSecuredGoods.length === 0 ? (
          <p className="text-[11px] text-stone-400 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
            Najpierw umieść produkty w 4 slotach zaopatrzeniowca powyżej — sprzedawcy mogą sprzedawać tylko produkty zabezpieczone przez zaopatrzeniowca.
          </p>
        ) : sellers.length === 0 ? (
          <p className="text-[11px] text-stone-400 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
            Zaopatrzenie gotowe! Dodaj do 4 sprzedawców — każdy wybiera 1 z zabezpieczonych produktów.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sellers.map((seller) => {
              const good =
                uniqueSecuredGoods.find((g) => g.id === seller.productId) || uniqueSecuredGoods[0];
              return (
                <div
                  key={seller.sellerIndex}
                  className="p-2.5 rounded-xl bg-stone-900/85 border border-emerald-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">
                      Sprzedawca #{seller.sellerIndex}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSeller(seller.sellerIndex)}
                      className="text-[10px] text-stone-400 hover:text-rose-300 cursor-pointer"
                    >
                      Usuń
                    </button>
                  </div>

                  {/* Wybór wyłącznie spośród produktów zabezpieczonych przez zaopatrzeniowca */}
                  <select
                    value={good.id}
                    onChange={(e) => {
                      const nextGood = uniqueSecuredGoods.find((g) => g.id === e.target.value);
                      handleUpdateSeller(seller.sellerIndex, {
                        productId: e.target.value,
                        retailPrice: nextGood?.defaultPrice ?? 1.5,
                      });
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-100"
                  >
                    {uniqueSecuredGoods.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>Cena detaliczna:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0.1}
                        max={50}
                        step={0.1}
                        value={seller.retailPrice ?? good.defaultPrice}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isNaN(v) && v > 0) {
                            handleUpdateSeller(seller.sellerIndex, {
                              retailPrice: Math.round(v * 100) / 100,
                            });
                          }
                        }}
                        className="w-14 bg-stone-950 border border-stone-700 rounded px-1 py-0.5 font-mono text-amber-200 text-right"
                      />
                      <span>£</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
