import React, { useState } from 'react';
import type {
  OrchardCapitalismState,
  FruitType,
} from './orchardTypes';
import {
  FRUITS_CONFIG,
} from './orchardTypes';

interface OrchardStorageBinsProps {
  state: OrchardCapitalismState;
  onUpdateState: (patch: Partial<OrchardCapitalismState>) => void;
}

const BIN_MAX_CAPACITY_KG = 1000;

export const OrchardStorageBins: React.FC<OrchardStorageBinsProps> = ({
  state,
  onUpdateState,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fruitStock: Record<FruitType, number> = {
    jablko: state.fruitStockKg?.jablko ?? 620,
    gruszka: state.fruitStockKg?.gruszka ?? 0,
    sliwka: state.fruitStockKg?.sliwka ?? 0,
    wisnia: state.fruitStockKg?.wisnia ?? 0,
  };

  const ciderStock = state.ciderStockL ?? 280;
  const prunedWoodStock = state.prunedWoodKg ?? 190;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Sprzedaż partii owoców (100 kg w skrzyniach)
  const handleSellFruit = (fruitId: FruitType) => {
    const current = fruitStock[fruitId];
    if (current < 100) {
      showFeedback(`⚠️ Niewystarczająca ilość owoców w komorze (wymagane min. 100 kg do załadunku wozu)!`);
      return;
    }

    const fInfo = FRUITS_CONFIG[fruitId];
    const revenue = Math.round((fInfo.marketPricePerTon / 1000) * 100);
    const updatedFruits = {
      ...fruitStock,
      [fruitId]: current - 100,
    };

    onUpdateState({
      fruitStockKg: updatedFruits,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + revenue,
    });

    showFeedback(`🍎 Handlarz sprzedał 100 kg świeżych owoców (${fInfo.name.split(' ')[0]}) na rynku za £${revenue}!`);
  };

  // Sprzedaż antałka cydru (50 l za £16)
  const handleSellCider = () => {
    if (ciderStock < 50) {
      showFeedback(`⚠️ Zbyt mało cydru w kadzi (wymagane min. 50 litrów na antałek transportowy)!`);
      return;
    }

    const rev = 16;
    onUpdateState({
      ciderStockL: ciderStock - 50,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });

    showFeedback(`🧃 Sprzedano 50 litrów tradycyjnego wiktoriańskiego cydru do miejskiej tawerny za £${rev}!`);
  };

  // Sprzedaż drewna gałęziowego z cięcia drzewek (100 kg za £4)
  const handleSellPrunedWood = () => {
    if (prunedWoodStock < 100) {
      showFeedback(`⚠️ Zbyt mało drewna gałęziowego (wymagane min. 100 kg)!`);
      return;
    }

    const rev = 5;
    onUpdateState({
      prunedWoodKg: prunedWoodStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });

    showFeedback(`🪵 Sprzedano 100 kg drewna gałęziowego z przycinania drzewek jako suchy opał za £${rev}!`);
  };

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK SPICHLERZA SADU */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Spichlerz Owocowy i Chłodnia Sadownicza (1880 r.)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Komory zasypowe na owoce deserowe, drewniana tłocznia cydru oraz skład gałęzi opałowych ze ścinki.
            </p>
          </div>
          <div className="bg-stone-950/80 border border-amber-800/50 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-mono">
              Transport prowadzi:
            </span>
            <span className="text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span>🛒</span> Wóz konny z drewnianymi skrzyniami
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium animate-fadeIn">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* JEDYNA KOMORA DLA GATUNKU DRZEWEK NASADZONYCH W TYM SADZIE */}
      {(() => {
        const activeFruitKey = state.fruitType || 'jablko';
        const fInfo = FRUITS_CONFIG[activeFruitKey];
        const stock = fruitStock[activeFruitKey];
        const fillPct = Math.min(100, Math.round((stock / BIN_MAX_CAPACITY_KG) * 100));
        const canSell = stock >= 100;

        return (
          <div className="bg-stone-900/90 border border-amber-500/60 ring-1 ring-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">
                  {fInfo.icon}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Nasadzony Gatunek Sadowniczy
                </span>
              </div>

              <h4 className="text-xs font-bold text-amber-100">{fInfo.name}</h4>
              <span className="text-[10px] text-stone-400 font-mono block">
                Jedyna Komora Owocowa Spichlerza
              </span>

              <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
                {fInfo.desc}
              </p>

              <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-3">
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-stone-400 text-[11px]">Zapas w skrzyniach:</span>
                  <span className="font-bold text-amber-300">
                    {stock} kg <span className="text-stone-500 font-normal">/ {BIN_MAX_CAPACITY_KG} kg</span>
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800/60 mt-1">
              <button
                onClick={() => handleSellFruit(activeFruitKey)}
                disabled={!canSell}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 leading-[2.5] ${
                  canSell
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow-sm'
                    : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                }`}
              >
                <span>💰 Sprzedaj 100 kg owoców za £{Math.round((fInfo.marketPricePerTon / 1000) * 100)}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* TŁOCZNIA CYDRU ORAZ SKŁAD DREWNA ZE ŚCINKI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TŁOCZNIA CYDRU I SOKU */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🧃</span>
              <div>
                <h4 className="text-xs font-bold text-amber-100">Drewniana Tłocznia Cydru i Soków</h4>
                <span className="text-[10px] text-stone-400 font-mono">Ręczna prasa śrubowa 1880 r.</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
              Wytłacza tradycyjny wiejski cydr jabłkowy lub perry z gruszek. Wysoce poszukiwany trunek w miejskich gospodach.
            </p>

            <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-2">
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-stone-400 text-[11px]">Zapas w kadziach:</span>
                <span className="font-bold text-amber-300">{ciderStock} litrów</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((ciderStock / 500) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSellCider}
            disabled={ciderStock < 50}
            className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 leading-[2.5] ${
              ciderStock >= 50
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow-sm'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <span>💰 Sprzedaj antałek cydru (50 l za £16)</span>
          </button>
        </div>

        {/* SKŁAD DREWNA ZE ŚCINKI / PRZYCINANIA DRZEWEK */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🪵</span>
              <div>
                <h4 className="text-xs font-bold text-amber-100">Drewno Gałęziowe ze Ścinki Koron</h4>
                <span className="text-[10px] text-stone-400 font-mono">Pozyskiwane podczas wiosennego przycinania</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
              Suche gałęzie owocowe i zrębki drzewne z corocznego przycinania. Ceniony surowiec opałowy do wędzarni i pieców.
            </p>

            <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-2">
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-stone-400 text-[11px]">Zapas drewna:</span>
                <span className="font-bold text-amber-300">{prunedWoodStock} kg</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((prunedWoodStock / 500) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSellPrunedWood}
            disabled={prunedWoodStock < 100}
            className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 leading-[2.5] ${
              prunedWoodStock >= 100
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow-sm'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <span>💰 Sprzedaj 100 kg drewna gałęziowego za £5</span>
          </button>
        </div>
      </div>
    </div>
  );
};
