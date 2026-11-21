import React from 'react';
import {
  BAKERY_PRODUCTS_CONFIG,
  type BakeryCapitalismState,
  type BakeryProductTarget,
} from './bakeryTypes';

interface BakeryRecipesTabProps {
  state: BakeryCapitalismState;
  baseDailyFlourKg: number;
  onSelectRecipe: (target: BakeryProductTarget) => void;
}

export const BakeryRecipesTab: React.FC<BakeryRecipesTabProps> = ({
  state,
  baseDailyFlourKg,
  onSelectRecipe,
}) => {
  const recipes = Object.values(BAKERY_PRODUCTS_CONFIG);

  return (
    <div className="space-y-3">
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
            <span>📜</span> Przepisy Wypieków Piekarni Rzemieślniczej
          </h3>
          <p className="text-[11px] text-stone-400">
            Bazowy przerób:{' '}
            <span className="font-mono text-stone-200">{baseDailyFlourKg} kg mąki / dzień</span> •
            Wybierz aktywną recepturę pieca chlebowego.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recipes.map((r) => {
          const isActive = state.productTarget === r.id;
          const breadOut = Math.round((baseDailyFlourKg * r.breadYieldRatio) / r.unitWeightKg);
          const rusksOut = Math.round(baseDailyFlourKg * r.rusksYieldRatio);
          const rusksPct = Math.round(r.rusksYieldRatio * 100);

          return (
            <div
              key={r.id}
              className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-all ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{r.icon}</span>
                    <h4 className="text-sm font-bold text-amber-100">{r.label}</h4>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                      Aktywny
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-400 leading-snug">{r.desc}</p>

                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 space-y-1 text-[11px] font-mono">
                  <div className="text-[10px] uppercase text-stone-400 font-bold">
                    Składniki na dzień:
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">🌾 {r.requiredFlourLabel}:</span>
                    <span className="text-amber-300 font-bold">-{baseDailyFlourKg} kg/d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">🧂 Sól Kamienna:</span>
                    <span className="text-amber-300 font-bold">
                      {r.id === 'wypieki_cukiernicze' ? '-0.5 kg/d' : '-2 kg/d'}
                    </span>
                  </div>
                  {r.id !== 'chleb_zytni' && (
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">🧫 Drożdże Piekarskie:</span>
                      <span className="text-amber-300 font-bold">-1.5 kg/d</span>
                    </div>
                  )}
                  {r.id === 'wypieki_cukiernicze' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">🧈 Masło Świeże:</span>
                        <span className="text-amber-300 font-bold">-3 kg/d</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">🍬 Cukier:</span>
                        <span className="text-amber-300 font-bold">-2 kg/d</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">Produkt główny:</span>
                    <span className="text-emerald-300 font-bold">
                      +{breadOut} szt. ({r.unitWeightKg} kg/szt.)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Produkt uboczny:</span>
                    <span className="text-orange-300 font-bold">
                      +{rusksOut} kg bułki tartej ({rusksPct}%)
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-stone-800 pt-1">
                    <span className="text-stone-400">Cena bazowa:</span>
                    <span className="text-stone-100 font-bold">£{r.defaultPricePerKg.toFixed(2)}/szt.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isActive}
                onClick={() => onSelectRecipe(r.id)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer'
                }`}
              >
                {isActive ? '✓ Aktywna receptura' : 'Ustaw recepturę'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
