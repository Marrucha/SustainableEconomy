import React from 'react';

export const DecreesTab: React.FC = () => {
  return (
    <div className="space-y-3.5 animate-fade-in">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
        <span className="text-lg">🏛️</span>
        <div>
          <span className="font-serif font-bold text-amber-200 text-xs uppercase tracking-wider">
            Rejestr Aktów Prawnych i Uchwał Magistratu
          </span>
          <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
            Akty prawa miejscowego stanowione przez Radę Miasta. Regulują zasady użytkowania gruntów, normy sanitarne oraz przyszłe reformy gospodarcze.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* UCHWAŁA 1 */}
        <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-100">
              📜 Uchwała Katastralna z 1878 r. (Podatek Gruntowy)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              OBOWIĄZUJĄCA
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Wszelkie parcele i działki miejskie podlegają ewidencji katastralnej. Opłata gruntowa jest stała i naliczana od zajmowanej powierzchni (kratek). Dochody z katastru finansują brukowanie traktów, budowę nabrzeży i latarnie gazowe.
          </p>
        </div>

        {/* UCHWAŁA 2 */}
        <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-100">
              🌫️ Wiktoriańska Uchwała o Sadzy Kominowej (1880)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              OBOWIĄZUJĄCA
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Wprowadza stałą opłatę £ 5.00 za każdy dymiący komin kotłowni i fabryk w rejonie zabudowy mieszkaniowej. Uchwała przeciwdziała londyńskiemu smogowi węglowemu (tzw. pea-souper).
          </p>
        </div>

        {/* UCHWAŁA 3 */}
        <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-100">
              🌾 Uchwała o Bezpieczeństwie Aprowizacyjnym Miasta
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              OBOWIĄZUJĄCA
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Zapewnia stabilne zaopatrzenie w mąkę i pieczywo poprzez ulgowe opodatkowanie rolnictwa (6.0%) oraz gwarantuje prawo do pełnego zwolnienia ze sprzedaży hurtowej ziarna.
          </p>
        </div>

        {/* UCHWAŁA 4 (PRZYSZŁOŚĆ CO2) */}
        <div className="p-3 bg-stone-800/20 border border-stone-800 rounded-xl space-y-1 opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">
              🌱 Projekt: Podatek od Emisji CO2 i Czystego Powietrza
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600 font-bold">
              PÓŹNIEJSZY OKRES
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            W 1880 r. zjawisko gazów cieplarnianych nie jest jeszcze przedmiotem ustawodawstwa. W późniejszych epokach Rada Miasta wdroży opłatę za tonę emitowanego CO2 oraz normy pyłowe PM2.5.
          </p>
        </div>

        {/* UCHWAŁA 5 (PRZYSZŁOŚĆ VAT) */}
        <div className="p-3 bg-stone-800/20 border border-stone-800 rounded-xl space-y-1 opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">
              🪙 Projekt: Reforma Podatku od Wartości Dodanej (VAT)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600 font-bold">
              PÓŹNIEJSZY OKRES
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Nowoczesna harmonizacja podatku od sprzedaży. W XX wieku archaiczny wiktoriański podatek obrotowy zostanie zastąpiony powszechnym podatkiem VAT.
          </p>
        </div>
      </div>
    </div>
  );
};
