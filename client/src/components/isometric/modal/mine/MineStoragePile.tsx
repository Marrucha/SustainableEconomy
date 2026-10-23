import React from 'react';
import type { MineDepositInfo } from './mineTypes';
import { OreNuggetIcon } from './OreNuggetIcon';

interface MineStoragePileProps {
  depositInfo: MineDepositInfo;
  stockTons: number;
  maxCapacity?: number;
  onSellAll: () => void;
}

export const MineStoragePile: React.FC<MineStoragePileProps> = ({
  depositInfo,
  stockTons,
  maxCapacity = 600,
  onSellAll,
}) => {
  const estimatedValue = stockTons * depositInfo.basePricePerTon;
  const fillPercent = Math.min(100, Math.round((stockTons / maxCapacity) * 100));

  return (
    <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-3 shadow-inner">
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏭</span>
          <div>
            <h4 className="text-sm font-bold text-stone-200">
              Składowisko Urobku i Hałda Kopalniana (Dokładnie 1 Aktywny Surowiec)
            </h4>
            <p className="text-[11px] text-stone-400">
              Pojemność placu estakady: <strong className="text-stone-300 font-mono">{maxCapacity} t</strong>
            </p>
          </div>
        </div>

        {/* PRZYCISK SPRZEDAŻY ZAPASU */}
        {stockTons > 0 && (
          <button
            onClick={onSellAll}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2"
          >
            <span>💰</span>
            <span>Sprzedaj cały zapas za £ {estimatedValue}</span>
          </button>
        )}
      </div>

      {/* POJEDYNCZY BOKS MAGAZYNOWY DLA AKTYWNEJ RUDY */}
      <div className="p-3.5 bg-stone-900/70 rounded-xl border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-stone-950 rounded-xl border border-stone-700 shadow-inner flex items-center justify-center">
            <OreNuggetIcon depositType={depositInfo.id} size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">{depositInfo.name}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${depositInfo.badgeBg}`}>
                {depositInfo.category}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Zgromadzono na hałdzie: <strong className="text-stone-200">{stockTons} t</strong> / {maxCapacity} t
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-400 block font-mono">Wartość rynkowa:</span>
          <span className="text-sm font-bold text-amber-300 font-mono">
            £ {estimatedValue} <span className="text-[10px] text-stone-400 font-normal">(@ £{depositInfo.basePricePerTon}/t)</span>
          </span>
        </div>
      </div>

      {/* WSKAŹNIK WYPEŁNIENIA HAŁDY */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-stone-400 font-mono">
          <span>Zajętość placu składowego:</span>
          <span className={fillPercent > 85 ? 'text-amber-400 font-bold' : 'text-stone-300'}>
            {fillPercent}% ({stockTons} / {maxCapacity} t)
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
          <div
            className={`h-full transition-all duration-300 ${
              fillPercent > 85
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : 'bg-gradient-to-r from-stone-600 to-amber-500'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] text-stone-400 italic">
        💡 Wskazówka: Przed zmianą złoża kopalni warto spieniężyć cały zapas na rynku. Zmiana profilu wydobywczego czyści plac i kasuje zgromadzony urobek.
      </p>
    </div>
  );
};
