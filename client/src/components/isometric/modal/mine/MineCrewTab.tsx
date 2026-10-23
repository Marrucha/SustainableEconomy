import React from 'react';
import type { MineStaffState } from './mineTypes';
import { DEFAULT_MINE_STAFF } from './mineTypes';

interface MineCrewTabProps {
  staff?: MineStaffState;
  stockTons: number;
  depositPricePerTon: number;
  onUpdateStaff: (staff: MineStaffState) => void;
  onSellAll: () => void;
}

export const MineCrewTab: React.FC<MineCrewTabProps> = ({
  staff = DEFAULT_MINE_STAFF,
  stockTons,
  depositPricePerTon,
  onUpdateStaff,
  onSellAll,
}) => {
  const miners = staff.minersCount || DEFAULT_MINE_STAFF.minersCount;
  const horses = staff.horsesCount || DEFAULT_MINE_STAFF.horsesCount;
  const surfaceWorkers = staff.surfaceWorkersCount || DEFAULT_MINE_STAFF.surfaceWorkersCount;
  const traders = staff.tradersCount || DEFAULT_MINE_STAFF.tradersCount;

  // Stawki dzienne (1880 r.)
  const minerWage = 2.8;
  const surfaceWage = 1.9;
  const horseMaintenance = 0.8;
  const traderWage = 3.5;

  const dailyPayroll =
    miners * minerWage +
    surfaceWorkers * surfaceWage +
    horses * horseMaintenance +
    traders * traderWage;

  const handleAdjustMiners = (delta: number) => {
    const next = Math.max(1, miners + delta);
    onUpdateStaff({ ...staff, minersCount: next });
  };

  const handleAdjustSurface = (delta: number) => {
    const next = Math.max(1, surfaceWorkers + delta);
    onUpdateStaff({ ...staff, surfaceWorkersCount: next });
  };

  const handleBuyHorse = () => {
    onUpdateStaff({ ...staff, horsesCount: horses + 1 });
  };

  const handleRemoveHorse = () => {
    if (horses <= 1) return;
    onUpdateStaff({ ...staff, horsesCount: horses - 1 });
  };

  const estimatedStockValue = stockTons * depositPricePerTon;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* BANER PODSUMOWANIA PŁAC ZAŁOGI */}
      <div className="p-4 bg-gradient-to-r from-stone-950 via-amber-950/20 to-stone-950 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h3 className="text-sm font-bold text-amber-200">
              Załoga Kopalni i Rekrutacja (Wiktoriański Podział Pracy 1880)
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            Rekrutuj górników dołowych, konie pociągowe do nadszybia oraz pracowników naziemnych. Kupiec zarządza zakupem koni i sprzedażą urobku.
          </p>
        </div>

        <div className="text-right flex-shrink-0 self-end sm:self-auto font-mono">
          <span className="text-xs text-stone-400 block">Dzienny fundusz płac:</span>
          <span className="text-lg font-bold text-emerald-400">£ {dailyPayroll.toFixed(2)}</span>
          <span className="text-[10px] text-stone-500 block">/ dzień</span>
        </div>
      </div>

      {/* 4 GŁÓWNE STANOWISKA KOPALNI */}
      <div className="space-y-3">
        {/* 1. GÓRNICY DOŁOWI */}
        <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-700 text-2xl flex-shrink-0">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-stone-100">Górnicy Dołowi (Rębacze & Wozacy)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Kroki 1 & 2: Urabianie przodka + Trakcja dołowa
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Praca pod ziemią: rębacze rozbijają caliznę w przodku, ładują urobek do wózków kopalnianych i przetaczają je torami chodnikowymi do podszybia.
              </p>
              <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-3">
                <span>Płaca: <strong>£ {minerWage.toFixed(2)}/dzień</strong> za górnika</span>
                <span>•</span>
                <span className="text-amber-300">Łącznie: £ {(miners * minerWage).toFixed(2)}/d</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => handleAdjustMiners(-1)}
              disabled={miners <= 1}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
              title="Zwolnij górnika"
            >
              -
            </button>
            <div className="px-3 text-center">
              <span className="block text-base font-bold font-mono text-amber-300">{miners}</span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">górników</span>
            </div>
            <button
              onClick={() => handleAdjustMiners(1)}
              className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors shadow"
              title="Zrekrutuj górnika dołowego"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. KONIE POCIĄGOWE (KIERAT NADSZYBIA) */}
        <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-700 text-2xl flex-shrink-0">
              🐎
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-amber-200">Konie Kopalniane (Kierat Nadszybia)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Krok 3: Wyciąg nadszybia
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Podstawowe źródło energii w kopalni w 1880 r. Konie pociągowe napędzają kierat wyciągowy, unosząc klatki z urobkiem na powierzchnię. Kupowane przez Kupca z fermy.
              </p>
              <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-3">
                <span>Utrzymanie stajni: <strong>£ {horseMaintenance.toFixed(2)}/dzień</strong> za konia</span>
                <span>•</span>
                <span className="text-amber-300">Łącznie: £ {(horses * horseMaintenance).toFixed(2)}/d</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={handleRemoveHorse}
              disabled={horses <= 1}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
              title="Odeślij konia do stajni"
            >
              -
            </button>
            <div className="px-3 text-center">
              <span className="block text-base font-bold font-mono text-amber-300">{horses}</span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">koni</span>
            </div>
            <button
              onClick={handleBuyHorse}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
              title="Kup konia przez Kupca kopalnianego"
            >
              <span>🐎</span>
              <span>Kup (£35)</span>
            </button>
          </div>
        </div>

        {/* 3. PRACOWNIK NAZIEMNY (SORTOWANIE I ZWAŁOWANIE) */}
        <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-700 text-2xl flex-shrink-0">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-stone-100">Pracownik Naziemny (Sortowacz & Zwałowacz)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Krok 4: Sortowanie i zwałowanie
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Praca na powierzchni nadszybia: ręczne sortowanie wydobytej calizny na rusztach, kruszenie brył oraz formowanie hałdy urobku i załadunek do silosów.
              </p>
              <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-3">
                <span>Płaca: <strong>£ {surfaceWage.toFixed(2)}/dzień</strong></span>
                <span>•</span>
                <span className="text-amber-300">Łącznie: £ {(surfaceWorkers * surfaceWage).toFixed(2)}/d</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => handleAdjustSurface(-1)}
              disabled={surfaceWorkers <= 1}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
              title="Zwolnij pracownika naziemnego"
            >
              -
            </button>
            <div className="px-3 text-center">
              <span className="block text-base font-bold font-mono text-amber-300">{surfaceWorkers}</span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">naziemnych</span>
            </div>
            <button
              onClick={() => handleAdjustSurface(1)}
              className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors shadow"
              title="Zatrudnij pracownika naziemnego"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. KUPIEC KOPALNIANY (ZAKUP KONI I SPRZEDAŻ UROBKU) */}
        <div className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/30 rounded-2xl border border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-950/80 rounded-xl border border-amber-500/40 text-2xl flex-shrink-0">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-amber-200">Kupiec Kopalniany (Zaopatrzeniowiec & Zbyt)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zakup Koni & Sprzedaż Urobku
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Zarządza kontraktami handlowymi kopalni: sprowadza konie pociągowe do nadszybia oraz sprzedaje wydobyty surowiec z hałdy na giełdzie towarowej.
              </p>
              <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-3">
                <span>Stanowisko: <strong>1 Główny Kupiec Kopalni</strong></span>
                <span>•</span>
                <span>Płaca: <strong>£ {traderWage.toFixed(2)}/dzień</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={handleBuyHorse}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <span>🐎</span>
              <span>Kup konia (£35)</span>
            </button>

            {stockTons > 0 && (
              <button
                onClick={onSellAll}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>🪙</span>
                <span>Sprzedaj hałdę (£ {estimatedStockValue})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
