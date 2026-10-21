import React from 'react';

interface ReliefsTabProps {
  activeReliefs: Record<string, boolean>;
  activeReliefsCount: number;
  onToggleRelief: (reliefId: string) => void;
}

export const ReliefsTab: React.FC<ReliefsTabProps> = ({
  activeReliefs,
  activeReliefsCount,
  onToggleRelief,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5">
        <span className="text-lg">✍️</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-emerald-300 text-xs uppercase tracking-wider">
              Kancelaria Skarbowa • Petycje o Ulgi Podatkowe
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              {activeReliefsCount} z 4 aktywnych
            </span>
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
            Złóż formalny wniosek do Rady Miasta o przyznanie celowej ulgi podatkowej dla swojego biznesu. Zatwierdzona uchwała obniża koszty prowadzenia fabryk, kamienic i farm.
          </p>
        </div>
      </div>

      {/* KARTY ULG */}
      <div className="space-y-3">
        {/* 1. ULGA ZA ZATRUDNIENIE PRACOWNIKÓW */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeReliefs['employment']
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👥</span>
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                  Rynek Pracy i Kapitał Ludzki
                </span>
                <h4 className="font-bold text-stone-100 text-sm">
                  Ulga za Zatrudnienie Pracowników (Klasy R i M)
                </h4>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeReliefs['employment']
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-stone-700 text-stone-400'
              }`}
            >
              {activeReliefs['employment'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              -2.0% podatku dochodowego
            </span>
            <span className="text-[11px] text-stone-300">
              +10% zadowolenia załogi i brak ryzyka strajków
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            Przyznawana przedsiębiorcom zatrudniającym min. 10 pracowników w farmach, manufakturach lub elektrociepłowni.
          </p>

          <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">
              Opłata kancelaryjna: <strong className="text-stone-200">£ 120</strong>
            </span>
            <button
              onClick={() => onToggleRelief('employment')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReliefs['employment']
                  ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
              }`}
            >
              {activeReliefs['employment'] ? '✓ Wycofaj ulgę' : '✍️ Złóż wniosek do Rady (£ 120)'}
            </button>
          </div>
        </div>

        {/* 2. ULGA DLA POŻĄDANYCH BRANŻ W MIEŚCIE */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeReliefs['priority_industry']
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌾</span>
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                  Sektory Strategiczne
                </span>
                <h4 className="font-bold text-stone-100 text-sm">
                  Ulga dla Pożądanych Branż (Aprowizacja i Energetyka)
                </h4>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeReliefs['priority_industry']
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-stone-700 text-stone-400'
              }`}
            >
              {activeReliefs['priority_industry'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              0% podatku od sprzedaży (Zwolnienie z 4.5%)
            </span>
            <span className="text-[11px] text-stone-300">
              Maksymalizacja zysków z chleba i energii
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            Miasto dotuje strategiczną produkcję żywności (farmy, młyny) i zaopatrzenie w prąd/parę wodną.
          </p>

          <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">
              Opłata kancelaryjna: <strong className="text-stone-200">£ 250</strong>
            </span>
            <button
              onClick={() => onToggleRelief('priority_industry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReliefs['priority_industry']
                  ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
              }`}
            >
              {activeReliefs['priority_industry'] ? '✓ Wycofaj ulgę' : '✍️ Wnioskuj o subsydium (£ 250)'}
            </button>
          </div>
        </div>

        {/* 3. ULGA ZA NOWY BUDYNEK */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeReliefs['new_construction']
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏗️</span>
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                  Rozwój Przestrzenny Miasta
                </span>
                <h4 className="font-bold text-stone-100 text-sm">
                  Ulga Inwestycyjna za Nowy Budynek (Pionier)
                </h4>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeReliefs['new_construction']
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-stone-700 text-stone-400'
              }`}
            >
              {activeReliefs['new_construction'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              -50% podatku gruntowego (£ 1.25/kratkę)
            </span>
            <span className="text-[11px] text-stone-300">
              Obowiązuje przez pierwsze 24 miesiące rozruchu
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            Magistrat zwalnia w połowie z opłaty gruntowej każdą nowo oddaną do użytku parcelę przemysłową lub mieszkalną.
          </p>

          <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">
              Opłata kancelaryjna: <strong className="text-stone-200">£ 100</strong>
            </span>
            <button
              onClick={() => onToggleRelief('new_construction')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReliefs['new_construction']
                  ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
              }`}
            >
              {activeReliefs['new_construction'] ? '✓ Wycofaj ulgę' : '✍️ Złóż wniosek o ulgę (£ 100)'}
            </button>
          </div>
        </div>

        {/* 4. ULGA ZA INWESTYCJE W EKOLOGIĘ */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeReliefs['green_ecology']
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍃</span>
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                  Czyste Technologie & Środowisko
                </span>
                <h4 className="font-bold text-stone-100 text-sm">
                  Ulga za Inwestycje w Ekologię i Czyste Powietrze
                </h4>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeReliefs['green_ecology']
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-stone-700 text-stone-400'
              }`}
            >
              {activeReliefs['green_ecology'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              Zwolnienie z opłaty kominowej (£ 0/komin)
            </span>
            <span className="text-[11px] text-stone-300">
              -20% podatku gruntowego, +15% zadowolenia
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            Za montaż wiatraków mechanicznych (napęd eko zamiast węgla), budowę parków miejskich lub wdrożenie filtrów sadzy.
          </p>

          <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">
              Opłata kancelaryjna: <strong className="text-stone-200">£ 180</strong>
            </span>
            <button
              onClick={() => onToggleRelief('green_ecology')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReliefs['green_ecology']
                  ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
              }`}
            >
              {activeReliefs['green_ecology'] ? '✓ Wycofaj ulgę' : '✍️ Wnioskuj o certyfikat eko (£ 180)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
