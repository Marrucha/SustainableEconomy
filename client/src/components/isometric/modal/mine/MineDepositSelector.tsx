import React, { useState } from 'react';
import { MINE_DEPOSITS, type MineDepositType } from './mineTypes';
import { OreNuggetIcon } from './OreNuggetIcon';

interface MineDepositSelectorProps {
  currentDeposit: MineDepositType;
  currentStock: number;
  onSelectDeposit: (deposit: MineDepositType) => void;
}

export const MineDepositSelector: React.FC<MineDepositSelectorProps> = ({
  currentDeposit,
  currentStock,
  onSelectDeposit,
}) => {
  const [pendingDeposit, setPendingDeposit] = useState<MineDepositType | null>(null);

  const handleDepositClick = (depId: MineDepositType) => {
    if (depId === currentDeposit) return;
    if (currentStock > 0) {
      setPendingDeposit(depId);
    } else {
      onSelectDeposit(depId);
    }
  };

  const confirmSwitch = () => {
    if (pendingDeposit) {
      onSelectDeposit(pendingDeposit);
      setPendingDeposit(null);
    }
  };

  const currentInfo = MINE_DEPOSITS[currentDeposit];

  return (
    <div className="space-y-4">
      {/* OSTRZEŻENIE O UTRACIE ZAPASÓW PRZY ZMIANIE ZŁOŻA */}
      {pendingDeposit && (
        <div className="p-4 bg-red-950/90 border border-red-500 rounded-2xl space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 text-red-200 font-bold text-sm">
            <span>⚠️</span>
            <span>Ostrzeżenie: Utrata Zapasów na Hałdzie Kopalnianej!</span>
          </div>
          <p className="text-xs text-red-100 leading-relaxed">
            Przebudowa nadszybia i przezbrojenie chodników kopalni na wydobycie:{' '}
            <strong className="text-amber-300">{MINE_DEPOSITS[pendingDeposit].name}</strong> spowoduje{' '}
            <span className="text-red-400 font-bold underline">całkowitą utratę</span> obecnego zapasu na hałdzie:{' '}
            <strong>{currentStock} ton {currentInfo.name}</strong> o szacunkowej wartości rynkowej:{' '}
            <strong className="text-amber-300">£ {currentStock * currentInfo.basePricePerTon}</strong>.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={confirmSwitch}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-md"
            >
              Tak, przezbrój kopalnię i zutylizuj stary zapas
            </button>
            <button
              onClick={() => setPendingDeposit(null)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* NAGŁÓWEK AKTYWNEGO ZŁOŻA */}
      <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-stone-900 rounded-xl border border-stone-700 shadow-inner flex items-center justify-center">
            <OreNuggetIcon depositType={currentDeposit} size={38} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Aktywne Złoże: {currentInfo.category}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Wydajność: ~{currentInfo.baseYieldPerCycle} t / cykl
              </span>
            </div>
            <h3 className="text-base font-bold text-amber-100 mt-0.5">{currentInfo.name}</h3>
            <p className="text-xs text-stone-400 max-w-xl">{currentInfo.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block font-mono">Cena rynkowa:</span>
          <span className="text-lg font-bold text-amber-300">£ {currentInfo.basePricePerTon} / t</span>
        </div>
      </div>

      {/* SIATKA WYBORU RUD I SUROWCÓW Z DOKUMENTACJI */}
      <div>
        <div className="text-xs font-bold text-stone-300 mb-2 flex items-center justify-between">
          <span>Wybierz surowiec lub rudę wydobywaną w kopalni (1 profil jednocześnie):</span>
          <span className="text-[10px] text-stone-500 font-mono">Dokumentacja GDD Epoka 1 (1880)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {(Object.keys(MINE_DEPOSITS) as MineDepositType[]).map((depKey) => {
            const dep = MINE_DEPOSITS[depKey];
            const isSelected = depKey === currentDeposit;
            return (
              <button
                key={depKey}
                onClick={() => handleDepositClick(depKey)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/60 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <OreNuggetIcon depositType={depKey} size={26} />
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${dep.badgeBg}`}>
                    {dep.category}
                  </span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                    {dep.name.split(' (')[0]}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1 pt-1 border-t border-stone-800/80">
                    <span>£ {dep.basePricePerTon}/t</span>
                    <span>+{dep.baseYieldPerCycle}t</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
