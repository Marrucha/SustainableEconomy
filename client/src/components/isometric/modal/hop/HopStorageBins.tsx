import React, { useState } from 'react';
import type { HopCapitalismState } from './hopTypes';
import { HOP_VARIETIES } from './hopTypes';

interface HopStorageBinsProps {
  state: HopCapitalismState;
  onUpdateState: (patch: Partial<HopCapitalismState>) => void;
}

const BIN_MAX_CAPACITY_KG = 1000;

export const HopStorageBins: React.FC<HopStorageBinsProps> = ({
  state,
  onUpdateState,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const driedStock = state.driedConesStockKg || 0;
  const freshStock = state.freshConesStockKg || 0;
  const spentStock = state.spentHopsStockKg || 0;
  const fertilizerStock = state.fertilizerStockKg || 0;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSellDried = () => {
    if (driedStock < 100) {
      showFeedback('⚠️ Zbyt mało wysuszonych szyszek (wymagane min. 100 kg na jutowy wór - hop pocket)!');
      return;
    }
    const rev = 26; // £26 za 100 kg suszonego chmielu
    onUpdateState({
      driedConesStockKg: driedStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🍺 Sprzedano 100 kg wysuszonego chmielu Oast do browaru za £${rev}!`);
  };

  const handleSellFresh = () => {
    if (freshStock < 100) {
      showFeedback('⚠️ Zbyt mało świeżych szyszek (wymagane min. 100 kg)!');
      return;
    }
    const rev = 14;
    onUpdateState({
      freshConesStockKg: freshStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🍃 Sprzedano 100 kg świeżego chmielu na piwo Green Hop za £${rev}!`);
  };

  const handleSellSpent = () => {
    if (spentStock < 100) {
      showFeedback('⚠️ Zbyt mało odpadów chmielowych w magazynie (wymagane min. 100 kg)!');
      return;
    }
    const rev = 6;
    onUpdateState({
      spentHopsStockKg: spentStock - 100,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });
    showFeedback(`🪵 Sprzedano 100 kg łodyg i pędów chmielowych na kompost za £${rev}!`);
  };

  const handleBuyFertilizer = () => {
    const cost = 14;
    const amount = 100;
    const newStock = fertilizerStock + amount;
    onUpdateState({
      fertilizerStockKg: newStock,
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });
    showFeedback(`🛒 Zakupiono 100 kg nawozu potasowego z Fermy Bydła (£${cost})!`);
  };

  const varietyInfo = HOP_VARIETIES[state.variety || 'golding'];

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK MAGAZYNU Z HISTORIĄ 1880 */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Magazyn i Skład Chmielowy – Komory Oast House (Kent 1880)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Przetwórnia Oast House obejmuje suszarnię z wiatrownicą, prasę do jutowych worów (hop pockets) i skład nawozu potasowego.
            </p>
          </div>
          <div className="bg-stone-950/80 border border-amber-800/50 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-mono">
              Odmiana chmielu:
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
        {/* 1. SZYSZKI WYSUSZONE */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((driedStock / BIN_MAX_CAPACITY_KG) * 100));
          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                Oast I Gatunek
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    🍺
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100 tracking-wide leading-[2.5]">
                      Szyszki Wysuszone w Oast
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold leading-[2.5]">
                      £ 260 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Wysuszone gorącym dymem szyszki, sprasowane w tradycyjne kieszenie jutowe.
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
                    <span>Stan: {driedStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellDried}
                disabled={driedStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg do Browaru (+£26)</span>
              </button>
            </div>
          );
        })()}

        {/* 2. ŚWIEŻY CHMIEL */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((freshStock / BIN_MAX_CAPACITY_KG) * 100));
          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                Świeży Zbiór
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    🍃
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100 tracking-wide leading-[2.5]">
                      Świeże Szyszki Zielone
                    </h4>
                    <span className="text-[10px] text-amber-300 font-mono font-bold leading-[2.5]">
                      £ 140 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Zebrane szyszki przed wysuszeniem. Gotowe do natychmiastowego chmielenia.
                </p>

                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Napełnienie komory:</span>
                    <span className="text-amber-300 font-bold">{fillPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-950 rounded-full border border-stone-800 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-amber-400 to-amber-300 transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>Stan: {freshStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellFresh}
                disabled={freshStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg na Targu (+£14)</span>
              </button>
            </div>
          );
        })()}

        {/* 3. ŁODYGI I ODPADY */}
        {(() => {
          const fillPercent = Math.min(100, Math.round((spentStock / BIN_MAX_CAPACITY_KG) * 100));
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
                      Łodygi i Pędy Chmielowe
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono font-bold leading-[2.5]">
                      £ 60 / tona
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 leading-[2.5] mb-3">
                  Zdrewniałe pnącza po zerwaniu szyszek, surowiec na ściółkę i kompost organiczny.
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
                    <span>Stan: {spentStock} kg</span>
                    <span>Maks: {BIN_MAX_CAPACITY_KG} kg</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellSpent}
                disabled={spentStock < 100}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 leading-[2.5]"
              >
                <span>💰</span>
                <span>Sprzedaj 100 kg na Targu (+£6)</span>
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
            <h4 className="text-xs font-bold text-amber-200 leading-[2.5]">Zapas Nawozu Potasowego & Obornika</h4>
            <p className="text-[11px] text-stone-400 leading-[2.5]">
              Stan: <strong className="font-mono text-amber-300">{fertilizerStock} kg</strong> (Wykorzystywany w etapie #4 do podniesienia plonów szyszek o +260 kg).
            </p>
          </div>
        </div>

        <button
          onClick={handleBuyFertilizer}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 leading-[2.5]"
        >
          <span>🛒</span>
          <span>Kup 100 kg z Fermy Bydła (£14)</span>
        </button>
      </div>
    </div>
  );
};
