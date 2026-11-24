import React from 'react';
import type { BuildingState, MarketStallSeller, MarketStallSupplySlot } from '../types';
import { CURRENT_PLAYER_NAME, type WorldSupplierBuilding } from './industrySupplyConfig';
import { ALL_MARKET_GOODS } from './marketplaceGoods';
import {
  computeProductMarketScores,
  computeProductPurchasePrice,
  resolveRetailPrice,
} from './marketDemandMath';

interface MarketProductsOfferGridProps {
  title: string;
  maxProducts: number;
  locationScore?: number;
  sellers: MarketStallSeller[];
  supplySlots: MarketStallSupplySlot[];
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onChangeSellers: (nextSellers: MarketStallSeller[]) => void;
}

export const MarketProductsOfferGrid: React.FC<MarketProductsOfferGridProps> = ({
  title,
  maxProducts,
  locationScore = 100,
  sellers,
  supplySlots,
  allWorldBuildings,
  buildingsState,
  onChangeSellers,
}) => {
  const displayItems =
    sellers.length > 0
      ? sellers.map((sel) => ({
          key: `${sel.sellerIndex}_${sel.productId}`,
          productId: sel.productId,
          sellerIndex: sel.sellerIndex,
          traderId: sel.traderId,
          traderName: sel.traderName,
          retailPrice: sel.retailPrice,
        }))
      : supplySlots.map((sl, idx) => ({
          key: `slot_${idx}_${sl.productId}`,
          productId: sl.productId,
          sellerIndex: idx + 1,
          traderId: undefined,
          traderName: undefined,
          retailPrice: undefined,
        }));

  const offers = displayItems.map((item) => {
    const good = ALL_MARKET_GOODS.find((g) => g.id === item.productId);
    const matchingSupply = supplySlots.find((s) => s.productId === item.productId);
    const retailPrice = resolveRetailPrice(item.retailPrice, good?.defaultPrice);
    const purchasePrice = computeProductPurchasePrice(
      item.productId,
      good?.defaultPrice ?? retailPrice,
      matchingSupply?.supplierBuildingId,
      matchingSupply?.contractType,
      allWorldBuildings,
      buildingsState
    );
    const scores = computeProductMarketScores(
      item.productId,
      retailPrice,
      good?.defaultPrice ?? 1,
      matchingSupply?.supplierBuildingId,
      buildingsState,
      allWorldBuildings,
      locationScore
    );
    const supplierId = matchingSupply?.supplierBuildingId;
    const supplierBuilding = supplierId
      ? allWorldBuildings.find((b) => b.id === supplierId)
      : undefined;
    const supplierSt = supplierBuilding ? buildingsState[supplierBuilding.id] : undefined;
    const companyName =
      supplierSt?.ownerName || supplierBuilding?.playerName || CURRENT_PLAYER_NAME;
    const factoryName = supplierSt?.enterpriseName || supplierBuilding?.name || supplierId;
    const isShip = !supplierId || supplierId.startsWith('trade_ship');
    const isOurCompany = !isShip && companyName === CURRENT_PLAYER_NAME;
    const producerLabel = isShip ? '🚢 Import' : `🏢 ${companyName}`;
    const producerTooltip = isShip ? 'Import (Statek Handlowy)' : `${companyName} • ${factoryName}`;
    const producerBadgeClass = isShip
      ? 'bg-stone-600/60 border-stone-500/70 text-stone-200'
      : isOurCompany
      ? 'bg-sky-500/25 border-sky-400/60 text-sky-100'
      : 'bg-rose-500/25 border-rose-400/60 text-rose-100';

    return {
      ...item,
      good,
      retailPrice,
      purchasePrice,
      scores,
      producerLabel,
      producerTooltip,
      producerBadgeClass,
    };
  });

  const handleChangePrice = (offer: (typeof offers)[number], nextPrice: number) => {
    const safePrice = Number.isFinite(nextPrice) && nextPrice > 0 ? nextPrice : 0.1;
    const existingIdx = sellers.findIndex(
      (s) => s.productId === offer.productId && s.sellerIndex === offer.sellerIndex
    );
    if (existingIdx >= 0) {
      onChangeSellers(
        sellers.map((s, idx) => (idx === existingIdx ? { ...s, retailPrice: safePrice } : s))
      );
    } else {
      onChangeSellers([
        ...sellers,
        {
          sellerIndex: sellers.length + 1,
          productId: offer.productId,
          retailPrice: safePrice,
        },
      ]);
    }
  };

  return (
    <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
        📦 {title} ({offers.length}/{maxProducts})
      </h4>
      {offers.length === 0 ? (
        <p className="text-xs text-stone-400 italic">
          Brak wystawionych produktów. Wybierz towary w Zaopatrzeniu lub Zakup/Sprzedaż.
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            maxProducts > 4 ? 'lg:grid-cols-3' : ''
          } gap-2.5`}
        >
          {offers.map((item) => (
            <div
              key={item.key}
              className="bg-stone-700/75 border border-stone-600 rounded-xl p-3 grid grid-cols-[1fr_1fr] gap-2.5 items-stretch"
            >
              {/* Lewa kolumna: Nazwa, Cena/Zakup oraz 4 pionowe słupki */}
              <div className="min-w-0 flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <div>
                    <p className="text-sm font-bold text-white truncate leading-tight">
                      {item.good?.icon || '📦'} {item.good?.label || item.productId}
                    </p>
                    <span
                      title={item.producerTooltip}
                      className={`inline-block max-w-full px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold truncate mt-0.5 ${item.producerBadgeClass}`}
                    >
                      {item.producerLabel}
                    </span>
                  </div>
                  <div className="flex w-full flex-col items-stretch gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-b from-emerald-500/30 via-emerald-600/20 to-emerald-900/35 border border-emerald-400/70 border-t-emerald-300/90 shadow-[0_3px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold text-emerald-200 shrink-0">
                        Cena £
                      </span>
                      <input
                        type="number"
                        min={0.1}
                        step={item.retailPrice >= 20 ? 1 : 0.1}
                        value={item.retailPrice}
                        onChange={(e) => handleChangePrice(item, Number(e.target.value))}
                        className="flex-1 min-w-0 bg-stone-950/90 border border-emerald-500/50 rounded px-1.5 py-0.5 text-right font-mono text-xs font-extrabold text-emerald-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[-10, -1, 1, 10].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() =>
                            handleChangePrice(
                              item,
                              Math.max(0.1, Number((item.retailPrice * (1 + pct / 100)).toFixed(2)))
                            )
                          }
                          className="py-0.5 rounded bg-stone-950/75 hover:bg-emerald-500/30 border border-emerald-400/40 text-[9px] font-mono font-bold text-emerald-100 cursor-pointer transition-colors"
                        >
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-rose-300 font-semibold border-t border-emerald-400/25 pt-0.5 text-right">
                      Zakup: £{item.purchasePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-1.5 flex items-end justify-around gap-1">
                  {[
                    {
                      label: 'Jakość',
                      icon: '⭐',
                      val: item.scores.qualityScore,
                      barClass:
                        'bg-gradient-to-r from-emerald-700 via-emerald-300 to-emerald-800 border-t border-emerald-100/90 shadow-[0_0_8px_rgba(52,211,153,0.4)]',
                      textClass: 'text-emerald-300',
                    },
                    {
                      label: 'Marka',
                      icon: '🏷️',
                      val: item.scores.brandScore,
                      barClass:
                        'bg-gradient-to-r from-sky-700 via-sky-300 to-sky-800 border-t border-sky-100/90 shadow-[0_0_8px_rgba(56,189,248,0.4)]',
                      textClass: 'text-sky-300',
                    },
                    {
                      label: 'Cena',
                      icon: '💷',
                      val: item.scores.priceScore,
                      barClass:
                        item.scores.priceScore < 0
                          ? 'bg-gradient-to-r from-rose-700 via-rose-400 to-rose-800 border-t border-rose-200/90 shadow-[0_0_8px_rgba(244,63,94,0.45)]'
                          : 'bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 border-t border-amber-100/90 shadow-[0_0_8px_rgba(251,191,36,0.4)]',
                      textClass: item.scores.priceScore < 0 ? 'text-rose-400' : 'text-amber-300',
                    },
                    {
                      label: 'Lokal.',
                      icon: '📍',
                      val: locationScore,
                      barClass:
                        'bg-gradient-to-r from-purple-700 via-purple-300 to-purple-800 border-t border-purple-100/90 shadow-[0_0_8px_rgba(192,132,252,0.4)]',
                      textClass: 'text-purple-300',
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      title={metric.label === 'Lokal.' ? `Lokalizacja: ${metric.val}%` : undefined}
                      className="flex flex-col items-center gap-0.5 flex-1"
                    >
                      <span className={`font-mono text-[9px] font-bold ${metric.textClass}`}>
                        {metric.val}%
                      </span>
                      <div className="relative w-4 h-[88px] bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-md overflow-hidden border border-stone-600/80 shadow-[inset_2px_0_4px_rgba(0,0,0,0.85),inset_-1px_0_2px_rgba(255,255,255,0.08)] flex items-end">
                        <div
                          className={`relative w-full ${metric.barClass} transition-all rounded-t-[2px]`}
                          style={{ height: `${Math.min(100, Math.abs(metric.val))}%` }}
                        >
                          {Math.abs(metric.val) > 4 && (
                            <div className="w-full h-1 rounded-[50%] bg-white/35" />
                          )}
                        </div>
                      </div>
                      <span className="text-[8px] text-stone-300 font-semibold whitespace-nowrap">
                        {metric.icon} {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prawa kolumna: Zdjęcie wpasowane w lukę nad Robotnicy/Mieszczanie/Elita */}
              <div className="min-w-0 flex flex-col justify-between gap-2">
                <div
                  title="Miejsce na zdjęcie produktu"
                  className="w-full flex-1 min-h-[96px] rounded-xl bg-stone-950/80 border border-dashed border-stone-700 flex flex-col items-center justify-center text-stone-500 select-none"
                >
                  <span className="text-4xl leading-none">{item.good?.icon || '🖼️'}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1">Zdjęcie</span>
                </div>

                <div className="flex flex-col justify-end gap-0.5 font-mono">
                  <div
                    title="Robotnicy: 72% Cena + 9% Marka + 9% Jakość + 10% Lokalizacja"
                    className="bg-stone-950/80 border border-stone-800 rounded-md px-2 py-1 flex items-center justify-between"
                  >
                    <span className="text-[10px] text-stone-300 font-sans font-semibold leading-tight">
                      🔨 Robotnicy
                    </span>
                    <span
                      className={`text-[11px] font-bold leading-tight ${
                        item.scores.workersOverall < 0 ? 'text-rose-400' : 'text-stone-100'
                      }`}
                    >
                      {item.scores.workersOverall}%
                    </span>
                  </div>
                  <div
                    title="Mieszczanie: 48% Cena + 16% Marka + 16% Jakość + 20% Lokalizacja"
                    className="bg-stone-950/80 border border-stone-800 rounded-md px-2 py-1 flex items-center justify-between"
                  >
                    <span className="text-[10px] text-sky-200 font-sans font-semibold leading-tight">
                      💼 Mieszczanie
                    </span>
                    <span
                      className={`text-[11px] font-bold leading-tight ${
                        item.scores.middleOverall < 0 ? 'text-rose-400' : 'text-sky-300'
                      }`}
                    >
                      {item.scores.middleOverall}%
                    </span>
                  </div>
                  <div
                    title="Elita: 20% Cena + 25% Marka + 25% Jakość + 30% Lokalizacja"
                    className="bg-stone-950/80 border border-stone-800 rounded-md px-2 py-1 flex items-center justify-between"
                  >
                    <span className="text-[10px] text-amber-200 font-sans font-semibold leading-tight">
                      👑 Elita
                    </span>
                    <span
                      className={`text-[11px] font-bold leading-tight ${
                        item.scores.eliteOverall < 0 ? 'text-rose-400' : 'text-amber-300'
                      }`}
                    >
                      {item.scores.eliteOverall}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
