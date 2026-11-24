import React from 'react';
import {
  GRAIN_SILO_MAX_LEVEL,
  getStrawStackCapacityKg,
  getGrainSiloUpgradeCostGbp,
  type FarmCapitalismState,
} from './farmGridTypes';
import { FarmOfferBars } from './FarmOfferBars';

interface FarmStrawBinCardProps {
  state: FarmCapitalismState;
  strawStock: number;
  avgMarketPrice?: number | null;
  onSellStraw: () => void;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (patch: Partial<FarmCapitalismState>) => void;
  showFeedback: (msg: string) => void;
}

/**
 * Kafelek magazynu i stogu słomy zbożowej (20 t bazowo, rozbudowa co +20 t do 80 t) z 3 pionowymi słupkami oferty.
 */
export const FarmStrawBinCard: React.FC<FarmStrawBinCardProps> = ({
  state,
  strawStock,
  avgMarketPrice,
  onSellStraw,
  onSpendGold,
  onUpdateState,
  showFeedback,
}) => {
  const strawLevel = Math.min(GRAIN_SILO_MAX_LEVEL, Math.max(1, state.strawLevel ?? 1));
  const strawCapKg = getStrawStackCapacityKg(strawLevel);
  const strawUpgradeCost = getGrainSiloUpgradeCostGbp(strawLevel);
  const strawQuality = Math.min(100, Math.max(0, state.strawQualityPercent ?? 100));
  const strawBrand = state.strawBrandLevel ?? 0;
  const strawPricePerTon = state.strawPricePerTon ?? 60;
  const strawFillPct = Math.min(100, Math.round((strawStock / strawCapKg) * 100));
  const refPriceText =
    avgMarketPrice !== null && avgMarketPrice !== undefined
      ? `śr. rynkowa: £${avgMarketPrice}/t`
      : 'statek: £66/t';

  return (
    <div className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/20 border border-amber-700/60 rounded-2xl p-4 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
              🌾
            </span>
            <div>
              <h4 className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <span>Stóg Słomy Zbożowej</span>
                <span
                  title="Słoma ze żniw stanowi niezbędną ściółkę dla ferm zwierzęcych, gdzie w oborach tworzy cenny obornik."
                  className="w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] inline-flex items-center justify-center cursor-help"
                >
                  ?
                </span>
              </h4>
              <span className="text-[10px] text-amber-400/80 block font-mono">
                Magazyn Ściółki #3
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
                value={strawPricePerTon}
                onChange={(e) =>
                  onUpdateState({
                    strawPricePerTon: Math.max(1, Number(e.target.value) || 60),
                  })
                }
                className="w-16 bg-stone-950 border border-amber-500/60 rounded-lg px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300 text-right focus:outline-none focus:border-amber-400"
              />
            </label>
            <span className="text-[9px] font-mono text-stone-400">({refPriceText})</span>
          </div>
        </div>

        <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3 my-3 flex gap-3 items-stretch min-h-[144px]">
          <div className="flex-1 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-stone-400 font-mono text-[11px]">Zapas (Poz. {strawLevel}/{GRAIN_SILO_MAX_LEVEL}):</span>
                <span className="font-bold font-mono text-amber-300">
                  {strawStock} kg <span className="text-stone-500 font-normal">/ {strawCapKg / 1000} t</span>
                </span>
              </div>
              <div className="w-full bg-stone-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${strawFillPct}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono bg-stone-900/70 border border-stone-800 rounded-lg p-2">
              <span>Wypełnienie: {strawFillPct}%</span>
              <span className="text-amber-300">£{strawPricePerTon}/t</span>
            </div>
          </div>
          <FarmOfferBars
            qualityPercent={strawQuality}
            brandLevel={strawBrand}
            priceValue={strawPricePerTon}
            priceLabel={`£${strawPricePerTon}`}
            maxPriceForScale={120}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-stone-800/60">
        {strawLevel < GRAIN_SILO_MAX_LEVEL ? (
          <button
            type="button"
            onClick={() => {
              if (onSpendGold) onSpendGold(strawUpgradeCost);
              onUpdateState({ strawLevel: strawLevel + 1 });
              showFeedback(`🌾 Rozbudowano stóg słomy do ${(strawLevel + 1) * 20} t za £${strawUpgradeCost}!`);
            }}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/60 hover:border-amber-400 transition-all cursor-pointer shadow"
          >
            ⬆️ Rozbuduj stóg (+20 t → {(strawLevel + 1) * 20} t za £{strawUpgradeCost})
          </button>
        ) : (
          <div className="w-full py-1.5 px-3 rounded-xl text-[11px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 text-center">
            ✅ Maksymalna rozbudowa stogu (80 t)
          </div>
        )}
        <button
          onClick={onSellStraw}
          disabled={strawStock < 100}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            strawStock >= 100
              ? 'bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/60 cursor-pointer shadow-sm'
              : 'bg-stone-900/40 text-stone-600 border border-stone-800 cursor-not-allowed'
          }`}
        >
          <span>📦 Sprzedaj 100 kg ściółki fermie (£6)</span>
        </button>
      </div>
    </div>
  );
};
