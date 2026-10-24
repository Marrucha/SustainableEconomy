import React, { useState } from 'react';
import type { FlaxCapitalismState } from './flaxTypes';
import { FLAX_VARIETIES } from './flaxTypes';

interface FlaxStorageBinsProps {
  state: FlaxCapitalismState;
  onUpdateState: (patch: Partial<FlaxCapitalismState>) => void;
}

const BIN_MAX_CAPACITY_KG = 1000;

export const FlaxStorageBins: React.FC<FlaxStorageBinsProps> = ({
  state,
  onUpdateState,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fiberStock = state.fiberStockKg || 0;
  const linseedStock = state.linseedStockKg || 0;
  const towStock = state.towStockKg || 0;
  const manureStock = state.manureStockKg || 0;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSellFiber = () => {
    if (fiberStock < 100) {
      showFeedback('⚠️ Zbyt mało włókna w magazynie (wymagane min. 100 kg na belę)!');
      return;
    }
    const rev = 18; // £18 za 100 kg włókna
    onUpdateState({
      fiberStockKg: fiberStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🧵 Sprzedano 100 kg długiego włókna lnianego do manufaktury za £${rev}!`);
  };

  const handleSellLinseed = () => {
    if (linseedStock < 100) {
      showFeedback('⚠️ Zbyt mało siemienia w magazynie (wymagane min. 100 kg na worek)!');
      return;
    }
    const rev = 12; // £12 za 100 kg siemienia
    onUpdateState({
      linseedStockKg: linseedStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🌰 Sprzedano 100 kg siemienia lnianego do olejarni za £${rev}!`);
  };

  const handleSellTow = () => {
    if (towStock < 100) {
      showFeedback('⚠️ Zbyt mało pakuł w magazynie (wymagane min. 100 kg)!');
      return;
    }
    const rev = 7;
    onUpdateState({
      towStockKg: towStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🪵 Sprzedano 100 kg pakuł i paździerzy na sznury za £${rev}!`);
  };

  const handleBuyManure = () => {
    const cost = 12;
    const amount = 100;
    const newStock = manureStock + amount;
    onUpdateState({
      manureStockKg: newStock,
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });
    showFeedback(`🛒 Zakupiono 100 kg nawozu organicznego z fermy zwierzęcej (£${cost})!`);
  };

  const varietyInfo = FLAX_VARIETIES[state.variety || 'wloknisty'];

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK MAGAZYNU Z HISTORIĄ 1880 */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Spichlerz Lniarski – Wiktoriańskie Komory Przetwórcze (1880 r.)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Przetwórnia lnu mieści komorę czesanego włókna długiego, zasieki na siemię lniane oraz skład pakuł i nawozu potasowego.
            </p>
          </div>
          <div className="bg-stone-950/80 border border-amber-800/50 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-mono">
              Wybór siewu:
            </span>
            <span className="text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span>{varietyInfo.icon}</span>
              <span>{varietyInfo.name}</span>
            </span>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATION */}
        {feedbackMsg && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3 py-2 rounded-xl font-medium animate-fadeIn">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* SIATKA 3 PRZEGRÓDEK MAGAZYNOWYCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. WŁÓKNO LNIANE */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((fiberStock / BIN_MAX_CAPACITY_KG) * 100));
          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                Włókno I Gatunku
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    🧵
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100 tracking-wide leading-[2.5]">
                      Włókno Lniane Czesane
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold leading-[2.5]">
                      £ 180 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Długie, elastyczne włókno czesane na krosna i warsztaty tkackie.
                </p>

                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Napełnienie komory:</span>
                    <span className="text-amber-300 font-bold">{fillPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-950 rounded-full border border-stone-800 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Stan: {fiberStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellFiber}
                disabled={fiberStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg na Targu (+£18)</span>
              </button>
            </div>
          );
        })()}

        {/* 2. SIEMIĘ LNIANE */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((linseedStock / BIN_MAX_CAPACITY_KG) * 100));
          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                Nasiona i Olej
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    🌰
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100 tracking-wide leading-[2.5]">
                      Siemię Lniane (Nasiona)
                    </h4>
                    <span className="text-[10px] text-amber-300 font-mono font-bold leading-[2.5]">
                      £ 120 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Nasiona do siewu oraz surowiec dla tłoczni oleju i pokostu.
                </p>

                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Napełnienie komory:</span>
                    <span className="text-amber-300 font-bold">{fillPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-950 rounded-full border border-stone-800 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Stan: {linseedStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellLinseed}
                disabled={linseedStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg na Targu (+£12)</span>
              </button>
            </div>
          );
        })()}

        {/* 3. PAKUŁY I PAŹDZIERZE */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((towStock / BIN_MAX_CAPACITY_KG) * 100));
          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
              <div className="absolute top-2.5 right-2.5 bg-stone-800 text-stone-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-stone-700">
                Poboczny
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    🪵
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-stone-200 tracking-wide leading-[2.5]">
                      Pakuły i Paździerze
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono font-bold leading-[2.5]">
                      £ 70 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Zdrewniałe łodygi i krótkie włókna na sznury powroźnicze i pakuły.
                </p>

                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Napełnienie komory:</span>
                    <span className="text-amber-300 font-bold">{fillPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-950 rounded-full border border-stone-800 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-stone-600 via-amber-700 to-amber-600 transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Stan: {towStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellTow}
                disabled={towStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg na Targu (+£7)</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* SEKCJA NAWOZU / WSPÓŁPRACY Z FERMĄ HODOWLANĄ */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl p-2 rounded-xl bg-amber-950/30 border border-amber-900/40">🧪</span>
          <div>
            <h4 className="text-xs font-bold text-amber-200 leading-[2.5]">Zapas Nawozu Organicznego & Potasu</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Stan: <strong className="font-mono text-amber-300">{manureStock} kg</strong> (Wykorzystywany w etapie #4 do podniesienia plonów włókna o +220 kg).
            </p>
          </div>
        </div>

        <button
          onClick={handleBuyManure}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 leading-[2.5]"
        >
          <span>🛒</span>
          <span>Kup 100 kg z Fermy Bydła (£12)</span>
        </button>
      </div>
    </div>
  );
};
