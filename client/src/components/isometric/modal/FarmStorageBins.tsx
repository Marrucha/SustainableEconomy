import React, { useState } from 'react';
import type {
  FarmCapitalismState,
  CropType,
} from './farmGridTypes';
import {
  CROPS_CONFIG,
} from './farmGridTypes';

interface FarmStorageBinsProps {
  state: FarmCapitalismState;
  onUpdateState: (patch: Partial<FarmCapitalismState>) => void;
}

const BIN_MAX_CAPACITY_KG = 1000;

export const FarmStorageBins: React.FC<FarmStorageBinsProps> = ({
  state,
  onUpdateState,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Bezpieczne pobranie zapasów zbóż
  const grainStock: Record<CropType, number> = {
    pszenica: state.grainStockKg?.pszenica ?? state.wheatStockKg ?? 450,
    zyto: state.grainStockKg?.zyto ?? 120,
    owies: state.grainStockKg?.owies ?? 80,
    jeczmien: state.grainStockKg?.jeczmien ?? 0,
  };

  const manureStock = state.manureStockKg ?? state.fertilizerStockKg ?? 250;
  const strawStock = state.strawStockKg ?? 600;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Obsługa sprzedaży słomy jako ściółki dla ferm zwierzęcych
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

  // Obsługa zakupu obornika z fermy zwierzęcej
  const handleBuyManure = () => {
    const cost = 12; // £12 za 100 kg obornika
    const amount = 100;
    const newStock = manureStock + amount;

    onUpdateState({
      manureStockKg: newStock,
      fertilizerStockKg: newStock,
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });

    showFeedback(`🛒 Zakupiono 100 kg obornika bydlęcego z fermy zwierzęcej (Koszt: £${cost})!`);
  };

  // Obsługa sprzedaży partii ziarna (100 kg)
  const handleSellGrain = (cropId: CropType) => {
    const current = grainStock[cropId];
    if (current < 100) {
      showFeedback(`⚠️ Niewystarczająca ilość ziarna w komorze (wymagane min. 100 kg do transportu wozem)!`);
      return;
    }

    const crop = CROPS_CONFIG[cropId];
    const revenue = Math.round((crop.marketPricePerTon / 1000) * 100); // cena za 100 kg
    const updatedGrains = {
      ...grainStock,
      [cropId]: current - 100,
    };

    onUpdateState({
      grainStockKg: updatedGrains,
      wheatStockKg: cropId === 'pszenica' ? current - 100 : state.wheatStockKg,
      lastCycleRevenue: (state.lastCycleRevenue || 0) + revenue,
    });

    showFeedback(`💰 Sprzedano 100 kg ziarna (${crop.name}) na targu miejskim za £${revenue}!`);
  };

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK SPICHLERZA Z HISTORIĄ 1880 */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Spichlerz Folwarczny – Wiktoriańskie Komory Zasypowe (1880 r.)
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              Drewniane zasieki spichlerza podzielone są na komory dla każdego gatunku ziarna, skład nawozu naturalnego oraz komorę ochronną.
            </p>
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

        {/* FEEDBACK NOTIFICATION */}
        {feedbackMsg && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3 py-2 rounded-xl font-medium animate-fadeIn">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* SIATKA PRZEGRÓDEK MAGAZYNOWYCH DLA 1 AKTYWNEGO ZBOŻA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. JEDYNA KOMORA DLA AKTUALNIE UPRAWIANEGO ZBOŻA */}
        {(() => {
          const activeCropId = state.cropType || 'pszenica';
          const crop = CROPS_CONFIG[activeCropId];
          const stock = grainStock[activeCropId];
          const fillPercent = Math.min(100, Math.round((stock / BIN_MAX_CAPACITY_KG) * 100));

          return (
            <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50">
              <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                Aktywne Zboże
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    {crop.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-100">{crop.name}</h4>
                    <span className="text-[10px] text-amber-400 font-mono block">
                      Jedyna Komora Spichlerza Fermy
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
                  {crop.desc}
                </p>

                <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-3">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-stone-400 font-mono text-[11px]">Zapas ziarna:</span>
                    <span className="font-bold font-mono text-amber-300">
                      {stock} kg <span className="text-stone-500 font-normal">/ {BIN_MAX_CAPACITY_KG} kg</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1.5 font-mono">
                    <span>Cena na targu: £{crop.marketPricePerTon}/t</span>
                    <span>Wypełnienie: {fillPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800/60">
                <button
                  onClick={() => handleSellGrain(activeCropId)}
                  disabled={stock < 100}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 leading-[2.5] ${
                    stock >= 100
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 cursor-pointer shadow-sm'
                      : 'bg-stone-900/40 text-stone-600 border border-stone-900 cursor-not-allowed'
                  }`}
                >
                  <span>💰 Sprzedaj 100 kg ziarna za £{Math.round(crop.marketPricePerTon / 10)}</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 5. PRZEGRÓDKA: NAWÓZ NATURALNY (OBORNIK BYDLĘCY Z FERMY ZWIERZĘCEJ) */}
        <div className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/20 border border-amber-800/50 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="absolute top-2.5 right-2.5 bg-amber-900/60 text-amber-200 border border-amber-700/50 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Ferma Bydła
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                🐂
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-100">Obornik Naturalny</h4>
                <span className="text-[10px] text-amber-400/80 block font-mono">
                  Przegródka Nawozowa #5
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
              Produkt naturalny sprowadzany z wiktoriańskiej fermy hodowlanej bydła i owiec. Wzbogaca glebę w próchnicę i azot przed zasiewem.
            </p>

            <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-stone-400 font-mono text-[11px]">Zapas w zasieku:</span>
                <span className="font-bold font-mono text-amber-300">
                  {manureStock} kg <span className="text-stone-500 font-normal">/ {BIN_MAX_CAPACITY_KG} kg</span>
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((manureStock / BIN_MAX_CAPACITY_KG) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1.5 font-mono">
                <span>Pochodzenie: Ferma zwierzęca</span>
                <span>Koszt: £12 / 100 kg</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/60">
            <button
              onClick={handleBuyManure}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/60 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>🛒 Kup obornik z fermy zwierzęcej (100 kg za £12)</span>
            </button>
          </div>
        </div>

        {/* 6. PRZEGRÓDKA: OPRYSKI CHEMICZNE (NIEDOSTĘPNE W 1880 R. – ZABITA DESKAMI) */}
        <div className="relative bg-stone-950/95 border-2 border-dashed border-stone-700/70 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* EFEKT ZABITYCH DESEK W TLE */}
          <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center text-7xl select-none">
            ⛓️
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl p-1.5 bg-stone-900 rounded-xl border border-stone-800">
                  🔒
                </span>
                <div>
                  <h4 className="text-xs font-bold text-stone-400 line-through">Oprysk Chemiczny</h4>
                  <span className="text-[10px] text-stone-500 block font-mono">
                    Przegródka Środków Ochrony #6
                  </span>
                </div>
              </div>
              <span className="bg-red-950/80 border border-red-800/60 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono">
                Niedostępne w 1880 r.
              </span>
            </div>

            {/* ZABITE DESKAMI / TABLICZKA HISTORYCZNA */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 my-3">
              <p className="text-xs font-semibold text-amber-300/90 flex items-center gap-1.5 mb-1">
                <span>📜</span> Realiach agrotechniki XIX wieku:
              </p>
              <p className="text-[11px] text-stone-400 leading-[2.5]">
                Syntetyczne środki ochrony roślin (pestycydy i herbicydy chemiczne) w 1880 roku jeszcze nie istnieją.
              </p>
              <p className="text-[11px] text-stone-400 leading-[2.5] mt-2">
                Na polach stosuje się wyłącznie ręczne pielenie motyką przez rolników oraz tradycyjne oprószanie wapnem gaszonym.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/60">
            <div className="w-full py-2.5 px-3 rounded-xl text-xs font-medium bg-stone-900/60 text-stone-500 border border-stone-800 text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
              <span>🔒 Komora zabita deskami (XIX w. – brak chemii)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. DEDYKOWANY MAGAZYN SŁOMY ZE ŻNIW (ŚCIÓŁKA DLA FERM ZWIERZĘCYCH) */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-800/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl p-2.5 bg-stone-950 rounded-2xl border border-amber-800/60 shadow-inner">
            🌾
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-200">Magazyn i Stóg Słomy Zbożowej</h4>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ściółka Oborowa
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-[2.5] mt-1">
              Słoma zbierana po żniwach stanowi niezbędną ściółkę dla ferm zwierzęcych. W oborach, w połączeniu z odchodami bydła, tworzy cenny obornik.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
          <div className="text-right font-mono leading-[2.5]">
            <span className="text-[10px] text-stone-400 block">Zapas słomy:</span>
            <span className="text-base font-bold text-amber-300">{strawStock} kg</span>
          </div>

          <button
            onClick={handleSellStraw}
            disabled={strawStock < 100}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 leading-[2.5] ${
              strawStock >= 100
                ? 'bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/60 cursor-pointer shadow-sm'
                : 'bg-stone-900/40 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <span>📦 Sprzedaj 100 kg ściółki fermie zwierzęcej (£6)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
