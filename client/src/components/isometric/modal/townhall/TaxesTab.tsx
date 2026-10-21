import React from 'react';

export const TaxesTab: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* BANNER INFORMACYJNY */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
        <span className="text-xl">⚖️</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-amber-200 text-xs uppercase tracking-wider">
              Taryfikator Skarbowy • Poziom Bazowy Miasta
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Nienaruszalny (Rada Miasta)
            </span>
          </div>
          <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
            Poniższe taryfy podatkowe stanowią nienaruszalny poziom bazowy uchwalony przez Radę Miasta dla całego obszaru metropolitalnego. Gracz nie ustala ich samodzielnie.
          </p>
        </div>
      </div>

      {/* 1. KARTA GŁÓWNA: PODATEK GRUNTOWY */}
      <div className="p-4 bg-stone-800/60 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📐</span>
            <h4 className="font-bold text-stone-100 text-sm uppercase tracking-wide">
              Podatek Gruntowy od Parceli i Nieruchomości
            </h4>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed max-w-xl">
            Naliczany z góry za każdy zajęty przez budynek kafelek siatki. Finansuje miejski bruk, granitowe nabrzeża rzeczne oraz latarnie gazowe.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-stone-400">
            <span>Przykłady miesięczne:</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Kamienica (1x2): £ 5.00</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Ratusz (2x2): £ 10.00</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Farma (3x4): £ 30.00</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0 px-4 py-2 bg-stone-900/80 rounded-xl border border-stone-700/80">
          <span className="text-3xl font-mono font-black text-emerald-400 tracking-tight block">
            £ 2.50
          </span>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
            za kratkę / msc
          </span>
        </div>
      </div>

      {/* 2. SIATKA 2-KOLUMNOWA: BRANŻOWE + LUDNOŚĆ */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEWA KOLUMNA: PODATKI BRANŻOWE */}
        <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-stone-700/50 pb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏭</span> Podatki Branżowe (Sektory)
            </span>
            <span className="text-[10px] text-stone-400 font-mono">3 sektory</span>
          </div>

          <div className="space-y-2.5">
            {/* ROLNICTWO */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🌾</span>
                  <span className="font-bold text-stone-200 text-xs">Rolnictwo & Aprowizacja</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Ulga aprowizacyjna na mąkę i zboże</p>
              </div>
              <span className="text-xl font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                6.0%
              </span>
            </div>

            {/* PRZEMYSŁ */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚙️</span>
                  <span className="font-bold text-stone-200 text-xs">Przemysł & Manufaktury</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Fabryki, młyny, elektrociepłownie</p>
              </div>
              <span className="text-xl font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                14.0%
              </span>
            </div>

            {/* HANDEL */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏪</span>
                  <span className="font-bold text-stone-200 text-xs">Handel & Usługi Miejskie</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Składy towarowe i transport</p>
              </div>
              <span className="text-xl font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                10.0%
              </span>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: PODATKI OD LUDNOŚCI */}
        <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-stone-700/50 pb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>👥</span> Podatki od Ludności (Klasy)
            </span>
            <span className="text-[10px] text-stone-400 font-mono">3 klasy społeczne</span>
          </div>

          <div className="space-y-2.5">
            {/* KLASA R */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔨</span>
                  <span className="font-bold text-stone-200 text-xs">Klasa R (Robotnicy)</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Niski podatek pogłówny od płacy</p>
              </div>
              <span className="text-xl font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                3.5%
              </span>
            </div>

            {/* KLASA M */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚖️</span>
                  <span className="font-bold text-stone-200 text-xs">Klasa M (Mieszczanie)</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Podatek od rzemiosła i handlu</p>
              </div>
              <span className="text-xl font-mono font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                9.0%
              </span>
            </div>

            {/* KLASA E */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎩</span>
                  <span className="font-bold text-amber-300 text-xs">Klasa E (Elita / Burżuazja)</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Podatek od kapitału i dywidend</p>
              </div>
              <span className="text-xl font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                16.5%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DOLNY PAS: PODATEK OD SPRZEDAŻY + ŚRODOWISKO I CO2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* PODATEK OD SPRZEDAŻY */}
        <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                <span>🪙</span> Podatek od Sprzedaży (Obrotowy / VAT)
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                4.5%
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-normal">
              Pobierany z każdej transakcji rynkowej (ziarno, mąka, chleb, surowce przemysłowe).
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-700/50">
            <span className="text-[10px] text-stone-400">Model 1880: Akcyza miejska i obrót</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Reforma na VAT w Epoce Nowoczesnej
            </span>
          </div>
        </div>

        {/* ZANIECZYSZCZENIA I CO2 */}
        <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                <span>🌱</span> Opłaty Emisyjne i Zanieczyszczenia
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600">
                1880 vs PÓŹNIEJSZY OKRES
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="p-2.5 bg-stone-900/70 border border-stone-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-stone-500 block font-semibold">Podatek od CO2</span>
                <span className="text-base font-mono font-bold text-stone-500 block mt-0.5">£ 0.00 / t</span>
                <span className="text-[10px] text-stone-500 block mt-1">W późniejszych epokach</span>
              </div>

              <div className="p-2.5 bg-stone-900/70 border border-stone-800 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-amber-400 block font-semibold">Dym Kominowy (1880)</span>
                <span className="text-base font-mono font-bold text-amber-400 block mt-0.5">£ 5.00 / komin</span>
                <span className="text-[10px] text-stone-400 block mt-1">Paleniska węglowe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
