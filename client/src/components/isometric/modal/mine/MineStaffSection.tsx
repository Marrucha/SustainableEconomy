import React from 'react';
import type { MineStaffState } from './mineTypes';

interface MineStaffSectionProps {
  staff: MineStaffState;
  stockTons: number;
  depositPricePerTon: number;
  onUpdateStaff: (newStaff: MineStaffState) => void;
  onSellAll: () => void;
}

export const MineStaffSection: React.FC<MineStaffSectionProps> = ({
  staff,
  stockTons,
  depositPricePerTon,
  onUpdateStaff,
  onSellAll,
}) => {
  const handleBuyHorse = () => {
    onUpdateStaff({
      ...staff,
      horsesCount: (staff.horsesCount || 0) + 1,
    });
  };

  const handleAdjustMiners = (delta: number) => {
    const next = Math.max(1, (staff.minersCount || 1) + delta);
    onUpdateStaff({ ...staff, minersCount: next });
  };

  const handleAdjustSurface = (delta: number) => {
    const next = Math.max(1, (staff.surfaceWorkersCount || 1) + delta);
    onUpdateStaff({ ...staff, surfaceWorkersCount: next });
  };

  const estimatedValue = stockTons * depositPricePerTon;

  return (
    <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-3.5 shadow-inner">
      {/* NAGŁÓWEK ZAŁOGI I KU PCA */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <h4 className="text-sm font-bold text-stone-200">
              Załoga Kopalni, Konie i Kupiec (Epoka 1880)
            </h4>
            <p className="text-[11px] text-stone-400">
              Wiktoriańska organizacja pracy: górnicy na dole, konie przy wyciągu nadszybia, pracownicy naziemni przy sortowaniu oraz kupiec do zakupu koni i handlu.
            </p>
          </div>
        </div>
      </div>

      {/* SIATKA 4 STANOWISK ROBOCZYCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. GÓRNICY DOŁOWI */}
        <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">👷</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-100">Górnicy Dołowi</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Kroki 1 & 2
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Przypisani do: <strong>Urabianie przodka</strong> oraz <strong>Trakcja dołowa</strong> (ładowanie i pchanie wózków).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => handleAdjustMiners(-1)}
              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-sm text-amber-300">
              {staff.minersCount || 8}
            </span>
            <button
              onClick={() => handleAdjustMiners(1)}
              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. KONIE ROBOCZE PRZY WYCIĄGU NADSZYBIA */}
        <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">🐎</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-200">Konie Kopalniane</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Krok 3
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Przypisane do: <strong>Wyciąg nadszybia</strong> (napęd kieratu linowego szybu). Podstawowe źródło energii w 1880 r.
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="font-mono font-bold text-sm text-amber-300 block">
              {staff.horsesCount || 4} szt.
            </span>
            <span className="text-[9px] font-mono text-stone-400">Kierat konny</span>
          </div>
        </div>

        {/* 3. PRACOWNIK NAZIEMNY (SORTOWANIE I ZWAŁOWANIE) */}
        <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">🛠️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-100">Pracownik Naziemny</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Krok 4
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Przypisany na powierzchni do: <strong>Sortowanie i zwałowanie</strong> na hałdę kopalnianą i zsypy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => handleAdjustSurface(-1)}
              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-sm text-amber-300">
              {staff.surfaceWorkersCount || 4}
            </span>
            <button
              onClick={() => handleAdjustSurface(1)}
              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. KUPIEC KOPALNIANY (ZAKUP KONI I SPRZEDAŻ UROBKU) */}
        <div className="p-3 bg-gradient-to-r from-stone-900/90 to-amber-950/40 rounded-xl border border-amber-600/60 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">💰</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-200">Kupiec Kopalniany</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Handel & Konie
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Kupuje konie pociągowe do nadszybia oraz sprzedaje urobek na giełdzie rynkowej.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 items-end ml-2">
            <button
              onClick={handleBuyHorse}
              className="px-2.5 py-1 bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/60 text-amber-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
            >
              <span>🐎</span>
              <span>Kup konia (£35)</span>
            </button>

            {stockTons > 0 && (
              <button
                onClick={onSellAll}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow flex items-center gap-1"
              >
                <span>🪙</span>
                <span>Sprzedaj (£{estimatedValue})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
