import React from 'react';
export type BusinessTabType = 'summary' | 'production' | 'products' | 'trade' | 'finance';
export type ResidentialTabType = 'rent' | 'energy';

interface BuildingModalTabsProps {
  isBusiness: boolean;
  isResidential: boolean;
  isFarm: boolean;
  isLivestock: boolean;
  isMill: boolean;
  isBakery?: boolean;
  isMine?: boolean;
  checklistOk?: boolean;
  businessTab: BusinessTabType;
  residentialTab: ResidentialTabType;
  onSelectBusinessTab: (tab: BusinessTabType) => void;
  onSelectResidentialTab: (tab: ResidentialTabType) => void;
}

export const BuildingModalTabs: React.FC<BuildingModalTabsProps> = ({
  isBusiness,
  isResidential,
  isFarm,
  isLivestock,
  isMill,
  isBakery = false,
  isMine = false,
  checklistOk,
  businessTab,
  residentialTab,
  onSelectBusinessTab,
  onSelectResidentialTab,
}) => {
  const productionIcon = '🏭';
  const productionLabel = 'Produkcja';

  return (
    <>
      {isBusiness && (
        <div className="mt-1 mb-0 flex-shrink-0">
          <div className="bg-stone-950/80 p-0.5 rounded-xl border border-stone-800 shadow-inner flex gap-1">
            <button
              onClick={() => onSelectBusinessTab('summary')}
              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                businessTab === 'summary'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span className="text-sm">📋</span>
              <span className="tracking-wide">Podsumowanie</span>
              {typeof checklistOk === 'boolean' && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    checklistOk ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => onSelectBusinessTab('production')}
              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                businessTab === 'production'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span className="text-sm">{productionIcon}</span>
              <span className="tracking-wide">{productionLabel}</span>
            </button>

            <button
              onClick={() => onSelectBusinessTab('products')}
              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                businessTab === 'products'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span className="text-sm">📦</span>
              <span className="tracking-wide">Produkty</span>
            </button>

            {(isFarm || isMill || isBakery || isMine || isLivestock) && (
              <button
                onClick={() => onSelectBusinessTab('trade')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  businessTab === 'trade'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-sm">🛒</span>
                <span className="tracking-wide">Zakup/Sprzedaż</span>
              </button>
            )}

            {(isFarm || isLivestock || isMill || isBakery || isMine) && (
              <button
                onClick={() => onSelectBusinessTab('finance')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  businessTab === 'finance'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-sm">📊</span>
                <span className="tracking-wide">Finanse — Zestawienie</span>
              </button>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1 mb-0" />
        </div>
      )}

      {isResidential && (
        <div className="mt-3 mb-1 flex-shrink-0">
          <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
            <button
              onClick={() => onSelectResidentialTab('rent')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                residentialTab === 'rent'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span className="text-lg">🪙</span>
              <span className="tracking-wide">Czynsz i Standard</span>
            </button>

            <button
              onClick={() => onSelectResidentialTab('energy')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                residentialTab === 'energy'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <span className="text-lg">🔥</span>
              <span className="tracking-wide">Ogrzewanie i Energia</span>
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1.5 mb-0.5" />
        </div>
      )}
    </>
  );
};
