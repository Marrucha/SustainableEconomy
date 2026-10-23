import React from 'react';
import type { LivestockCapitalismState } from './livestockTypes';

interface LivestockHerdTabProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

export const LivestockHerdTab: React.FC<LivestockHerdTabProps> = ({
  state,
  onUpdateState,
}) => {
  const herd = state.herd;
  const isCattle = state.activeSpecies === 'cattle';
  const isSheep = state.activeSpecies === 'sheep';
  const isHorses = state.activeSpecies === 'horses';

  const totalCattle = herd.milkingGroupCows + herd.growingGroupCalves;
  // Maximum 50% pogłowia bydła może być przeznaczone na mleko (byki nie mają mleka)
  const maxMilkingAllowed = Math.max(1, Math.floor(totalCattle * 0.5));
  const isMilkingCapReached = herd.milkingGroupCows >= maxMilkingAllowed;

  const handleTransferToMilking = () => {
    if (herd.growingGroupCalves <= 0 || isMilkingCapReached) return;
    onUpdateState({
      herd: {
        ...herd,
        growingGroupCalves: herd.growingGroupCalves - 1,
        milkingGroupCows: herd.milkingGroupCows + 1,
      },
    });
  };

  const handleTransferToGrowing = () => {
    if (herd.milkingGroupCows <= 0) return;
    onUpdateState({
      herd: {
        ...herd,
        milkingGroupCows: herd.milkingGroupCows - 1,
        growingGroupCalves: herd.growingGroupCalves + 1,
      },
    });
  };

  const dailyMilkEstimate = Math.round(herd.milkingGroupCows * 14); // ~14 litrów na krowę/dzień w 1880 r.
  // Obornik generuje wyłącznie bydło mleczne przebywające w oborze
  const dailyManureEstimate = Math.round(herd.milkingGroupCows * 24);
  const annualWoolEstimate = Math.round((herd.adultSheepCount || 16) * 18);

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK PODZIAŁU STADA – DEDYKOWANY DLA AKTYWNEGO GATUNKU */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950/30 to-stone-900 border border-emerald-800/40 rounded-2xl p-4 shadow-xl">
        <h3 className="text-sm font-bold text-emerald-200 tracking-wide flex items-center gap-2">
          <span>{isCattle ? '🐄' : isSheep ? '🐑' : '🐎'}</span>
          <span>
            {isCattle
              ? 'Zarządzanie Strukturą Stada Bydła Mlecznego (1880 r.)'
              : isSheep
              ? 'Zarządzanie Stadem Owiec Wełnistych (1880 r.)'
              : 'Zarządzanie Stadem Koni (1880 r.)'}
          </span>
        </h3>
        <p className="text-xs text-emerald-100/70 mt-1 leading-[2.5]">
          {isCattle ? (
            <>
              Zgodnie z prawami biologii: <strong>na mleko może być przeznaczone maksymalnie 50% pogłowia bydła</strong> (byki nie mają mleka). <strong>Rozmnażanie stada jest możliwe tylko na populacji mlecznej.</strong>
            </>
          ) : isSheep ? (
            <>
              Ferma prowadzi hodowlę owiec wrzosowiskowych. Wełna pozyskiwana jest <strong>2 razy w roku</strong> (wiosenne i jesienne strzyżenie). Ciąża trwa 5 miesięcy, odchów jagnięcia 15 miesięcy.
            </>
          ) : (
            <>
              Ferma hoduje konie robocze i pociągowe ras Shire, Clydesdale oraz kuce jukowe. Ciąża klaczy trwa <strong>11 miesięcy</strong>, a odchów źrebaka – <strong>36 miesięcy (3 lata)</strong>. Konie stanowią kluczowe źródło energii w kopalniach, rolnictwie i transporcie.
            </>
          )}
        </p>
      </div>

      {/* GDY FERMA BYDŁA: WIDOCZNE TYLKO BYDŁO (OWCE SĄ W 100% NIEWIDOCZNE) */}
      {isCattle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GRUPA 1: DO DOJENIA */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-sky-600/50 rounded-2xl p-4 flex flex-col justify-between shadow-md space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 bg-sky-950/80 rounded-xl border border-sky-500/40 shadow-inner">
                    🥛
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-sky-100">Grupa 1: Stado do Dojenia</h4>
                    <span className="text-[10px] text-sky-300 font-mono">Dorosłe krowy w cyklu laktacyjnym</span>
                  </div>
                </div>
                <span className="text-xl font-bold font-mono text-sky-300">
                  {herd.milkingGroupCows} <span className="text-xs text-stone-400 font-normal">/ {maxMilkingAllowed} szt. (max 50%)</span>
                </span>
              </div>

              <p className="text-[11px] text-stone-300 leading-[2.5]">
                Krowy mleczne po ocieleniu. Dojarze i obsługa pozyskują świeże mleko przez pierwsze 6 miesięcy od inseminacji.
              </p>

              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 my-2 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Szacowany dzienny udój:</span>
                  <strong className="text-sky-300">~{dailyMilkEstimate} l / dzień</strong>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Obsługa doju:</span>
                  <strong className="text-amber-300">Dojarze & Obsługa</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleTransferToGrowing}
              disabled={herd.milkingGroupCows <= 0}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer disabled:opacity-40 leading-[2.5]"
            >
              Przenieś 1 krowę do Grupy Wzrostu / Opasu ➔
            </button>
          </div>

          {/* GRUPA 2: DO WZROSTU */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-600/50 rounded-2xl p-4 flex flex-col justify-between shadow-md space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 bg-amber-950/80 rounded-xl border border-amber-500/40 shadow-inner">
                    🌱
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-100">Grupa 2: Stado do Wzrostu</h4>
                    <span className="text-[10px] text-amber-300 font-mono">Cielęta i jałówki (okres 2 lat opasu)</span>
                  </div>
                </div>
                <span className="text-xl font-bold font-mono text-amber-300">
                  {herd.growingGroupCalves} <span className="text-xs text-stone-400 font-normal">sztuk</span>
                </span>
              </div>

              <p className="text-[11px] text-stone-300 leading-[2.5]">
                Cielęta odchowywane pod stałym nadzorem hodowcy. Po 2 latach dorastania trafiają na sprzedaż, ubój lub do dojenia.
              </p>

              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 my-2 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Czas odchowu:</span>
                  <strong className="text-amber-300">24 miesiące (2 lata)</strong>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Przeznaczenie:</span>
                  <strong className="text-emerald-300">3 ścieżki (Sprzedaż/Ubój/Dój)</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleTransferToMilking}
              disabled={herd.growingGroupCalves <= 0 || isMilkingCapReached}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer leading-[2.5] ${
                isMilkingCapReached
                  ? 'bg-stone-900/60 border-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/50'
              }`}
            >
              {isMilkingCapReached
                ? '🔒 Limit 50% stada mlecznego (byki nie mają mleka)'
                : 'Przenieś dorosłą krowę do Stada Dojenia ➔'}
            </button>
          </div>
        </div>
      )}

      {/* GDY FERMA OWIEC: WIDOCZNE TYLKO OWCE (BYDŁO I KONIE SĄ W 100% NIEWIDOCZNE) */}
      {isSheep && (
        <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-pink-700/50 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800">
                🐑
              </span>
              <div>
                <h4 className="text-xs font-bold text-pink-200">Stado Owiec (Podział na Dorosłe i Jagnięta)</h4>
                <p className="text-[11px] text-stone-400 leading-[2.5]">
                  Ciąża owcy trwa 5 miesięcy, odchów jagnięcia 15 miesięcy, wełna pozyskiwana ze strzyżenia 2 razy w roku.
                </p>
              </div>
            </div>
            <div className="text-right font-mono self-end sm:self-auto leading-[2.5]">
              <span className="text-sm font-bold text-pink-300 block">
                {(herd.adultSheepCount || 16) + (herd.growingLambsCount || 6)} owiec
              </span>
              <span className="text-[10px] text-stone-500">Pastwiska wrzosowiskowe</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-200 block">Dorosłe Maciorki Wełniste</span>
                <span className="text-[10px] text-stone-400 font-mono">Wełna 2x w roku (wiosna / jesień)</span>
              </div>
              <strong className="text-base font-mono text-amber-300">{herd.adultSheepCount || 16} szt.</strong>
            </div>

            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-200 block">Rosnące Jagnięta</span>
                <span className="text-[10px] text-stone-400 font-mono">Okres wzrostu: 15 miesięcy</span>
              </div>
              <strong className="text-base font-mono text-emerald-300">{herd.growingLambsCount || 6} szt.</strong>
            </div>
          </div>
        </div>
      )}

      {/* GDY HODOWLA KONI: WIDOCZNE TYLKO KONIE (BYDŁO I OWCE SĄ W 100% NIEWIDOCZNE) */}
      {isHorses && (
        <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-600/50 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800">
                🐎
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-200">Stado Koni (Dorosłe Konie Pociągowe & Źrebięta)</h4>
                <p className="text-[11px] text-stone-400 leading-[2.5]">
                  Ciąża klaczy trwa 11 miesięcy, odchów źrebaka do pełnej dojrzałości pociągowej i roboczej – 36 miesięcy (3 lata).
                </p>
              </div>
            </div>
            <div className="text-right font-mono self-end sm:self-auto leading-[2.5]">
              <span className="text-sm font-bold text-amber-300 block">
                {(herd.adultDraftHorses || 10) + (herd.growingFoalsCount || 4)} koni
              </span>
              <span className="text-[10px] text-stone-500">Stajnie i wybiegi folwarku</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-200 block">Dorosłe Konie Pociągowe i Robocze</span>
                <span className="text-[10px] text-stone-400 font-mono">Napęd kieratów w kopalniach, pociąg wozów, praca polowa</span>
              </div>
              <strong className="text-base font-mono text-amber-300">{herd.adultDraftHorses || 10} szt.</strong>
            </div>

            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-200 block">Dorastające Źrebięta</span>
                <span className="text-[10px] text-stone-400 font-mono">Okres odchowu: 36 miesięcy (3 lata)</span>
              </div>
              <strong className="text-base font-mono text-emerald-300">{herd.growingFoalsCount || 4} szt.</strong>
            </div>
          </div>
        </div>
      )}

      {/* PODSUMOWANIE POGŁOWIA I PRODUKCJI */}
      <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-3 font-mono leading-[2.5]">
        <span className="text-stone-300">
          Łączne pogłowie folwarku:{' '}
          <strong className="text-amber-300">
            {isCattle
              ? `${totalCattle} sztuk bydła`
              : isSheep
              ? `${(herd.adultSheepCount || 16) + (herd.growingLambsCount || 6)} owiec`
              : `${(herd.adultDraftHorses || 10) + (herd.growingFoalsCount || 4)} koni`}
          </strong>
        </span>
        <span className="text-stone-300">
          {isCattle ? (
            <>Produkcja nawozu (tylko bydło mleczne w oborze): <strong className="text-amber-400 font-bold">~{dailyManureEstimate} kg / dzień</strong></>
          ) : isSheep ? (
            <>Roczna podaż wełny (2 strzyżenia/rok): <strong className="text-pink-400 font-bold">~{annualWoolEstimate} kg / rok</strong></>
          ) : (
            <>Produkcja nawozu stajennego: <strong className="text-amber-400 font-bold">~{Math.round((herd.adultDraftHorses || 10) * 18)} kg / dzień</strong></>
          )}
        </span>
      </div>
    </div>
  );
};
